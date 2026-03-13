const Alert = require('../models/Alert');
const AlertHistory = require('../models/AlertHistory');
const Issue = require('../models/Issue');
const Error = require('../models/Error');
const notificationService = require('./notificationService');

class AlertService {
  /**
   * 评估所有启用的告警
   */
  async evaluateAllAlerts() {
    try {
      const alerts = await Alert.find({ enabled: true });
      
      for (const alert of alerts) {
        await this.evaluateAlert(alert);
      }
    } catch (error) {
      console.error('评估告警错误:', error);
    }
  }

  /**
   * 评估单个告警
   */
  async evaluateAlert(alert) {
    try {
      console.log(`[AlertService] 评估告警: ${alert.name}`);
      
      // 重置每日计数
      alert.resetDailyCount();

      // 检查是否在工作时间
      if (!alert.isWorkingHours()) {
        console.log(`[AlertService] 告警 ${alert.name} 不在工作时间`);
        return;
      }

      // 检查是否在静默期
      if (alert.isInSilencePeriod()) {
        console.log(`[AlertService] 告警 ${alert.name} 在静默期内`);
        return;
      }

      // 检查触发条件
      const triggered = await this.checkConditions(alert);
      
      if (triggered) {
        console.log(`[AlertService] 告警 ${alert.name} 触发条件满足:`, triggered);
        await this.triggerAlert(alert, triggered);
      } else {
        console.log(`[AlertService] 告警 ${alert.name} 触发条件不满足`);
      }
    } catch (error) {
      console.error(`[AlertService] 评估告警 ${alert._id} 错误:`, error);
    }
  }

  /**
   * 检查告警条件
   */
  async checkConditions(alert) {
    const { conditions } = alert;
    const { level, type, environment, threshold } = conditions;

    // 构建查询条件
    const query = {
      projectId: alert.projectId
    };

    if (level && level.length > 0) {
      query.level = { $in: level };
    }

    if (type && type.length > 0) {
      query.type = { $in: type };
    }

    if (environment && environment.length > 0) {
      query['tags.environment'] = { $in: environment };
    }

    // 时间窗口
    if (threshold && threshold.timeWindow) {
      const timeWindowMs = threshold.timeWindow * 60 * 1000;
      const startTime = new Date(Date.now() - timeWindowMs);
      query.timestamp = { $gte: startTime };
    }

    // 查询错误数量
    const errorCount = await Error.countDocuments(query);

    // 检查错误数量阈值
    if (threshold && threshold.count && errorCount >= threshold.count) {
      // 查询影响的用户数
      const users = await Error.distinct('user.id', query);
      const userCount = users.filter(Boolean).length;

      // 检查用户数量阈值
      if (threshold.userCount && userCount < threshold.userCount) {
        return null;
      }

      // 获取相关的错误
      const errors = await Error.find(query)
        .sort({ timestamp: -1 })
        .limit(10)
        .select('_id');

      return {
        errorCount,
        userCount,
        errors: errors.map(e => e._id),
        reason: `在 ${threshold.timeWindow} 分钟内出现 ${errorCount} 次错误，影响 ${userCount} 个用户`
      };
    }

    return null;
  }

  /**
   * 触发告警
   */
  async triggerAlert(alert, data) {
    try {
      console.log(`[AlertService] 🚨 触发告警: ${alert.name}`);
      
      // 更新告警统计
      alert.stats.lastTriggered = new Date();
      alert.stats.triggeredCount += 1;
      alert.stats.todayCount += 1;
      await alert.save();

      // 加载通知配置和项目信息
      const NotificationConfig = require('../models/NotificationConfig');
      const Project = require('../models/Project');
      
      const configs = await NotificationConfig.find({
        _id: { $in: alert.notificationConfigs },
        enabled: true
      }).populate('templateId');

      // 加载项目信息（包含负责人）
      const project = await Project.findById(alert.projectId)
        .populate('owner', 'username email phone')
        .populate('createdBy', 'username email phone');

      console.log(`[AlertService] 找到 ${configs.length} 个启用的通知配置`);
      console.log(`[AlertService] 项目信息:`, project ? project.name : '未找到');
      if (project?.owner) {
        console.log(`[AlertService] 项目负责人: ${project.owner.username || project.owner.email}`);
      }

      // 发送通知
      const notifications = [];
      for (const config of configs) {
        console.log(`[AlertService] 发送 ${config.type} 通知: ${config.name}`);
        console.log(`[AlertService] 使用模板:`, config.templateId ? config.templateId.name : '默认模板');
        
        const result = await notificationService.send(
          config.type,
          config.config,
          {
            alert: {
              ...alert.toObject(),
              projectId: project // 传递完整的项目对象（包含负责人信息）
            },
            data,
            // 传递项目负责人信息用于 @ 提醒
            projectOwner: project?.owner ? {
              username: project.owner.username,
              email: project.owner.email,
              phone: project.owner.phone
            } : null
          },
          config.templateId
        );

        console.log(`[AlertService] 通知发送结果:`, result);

        notifications.push({
          type: config.type,
          status: result.success ? 'success' : 'failed',
          error: result.error,
          sentAt: new Date(),
          responseTime: result.responseTime
        });
      }

      // 创建历史记录
      const history = new AlertHistory({
        alertId: alert._id,
        projectId: alert.projectId,
        triggeredAt: new Date(),
        reason: data.reason,
        notifications,
        data: {
          errorCount: data.errorCount,
          userCount: data.userCount,
          errors: data.errors
        }
      });

      await history.save();

      console.log(`[AlertService] ✅ 告警 ${alert.name} 已触发并记录`);
    } catch (error) {
      console.error(`[AlertService] 触发告警 ${alert._id} 错误:`, error);
    }
  }

  /**
   * 为新错误检查告警
   */
  async checkAlertsForError(error) {
    try {
      console.log(`[AlertService] 检查错误的告警规则, projectId: ${error.projectId}, level: ${error.level}, type: ${error.type}`);
      
      const alerts = await Alert.find({
        projectId: error.projectId,
        enabled: true
      });

      console.log(`[AlertService] 找到 ${alerts.length} 个启用的告警规则`);

      for (const alert of alerts) {
        console.log(`[AlertService] 检查告警规则: ${alert.name} (${alert._id})`);
        
        // 检查错误级别
        if (alert.conditions.level && alert.conditions.level.length > 0) {
          if (!alert.conditions.level.includes(error.level)) {
            console.log(`[AlertService] 错误级别 ${error.level} 不匹配规则条件 ${alert.conditions.level}`);
            continue;
          }
        }

        // 检查错误类型
        if (alert.conditions.type && alert.conditions.type.length > 0) {
          if (!alert.conditions.type.includes(error.type)) {
            console.log(`[AlertService] 错误类型 ${error.type} 不匹配规则条件 ${alert.conditions.type}`);
            continue;
          }
        }

        console.log(`[AlertService] 告警规则 ${alert.name} 匹配，立即触发通知...`);
        
        // 直接触发告警，不需要等待时间窗口
        const triggeredData = {
          errorCount: 1,
          userCount: error.user?.id ? 1 : 0,
          errors: [error._id],
          reason: `检测到新错误: ${error.message}`,
          // 传递错误详情用于通知
          errorDetails: {
            type: error.type,
            message: error.message,
            url: error.url,
            pageUrl: error.pageUrl,
            method: error.method,
            status: error.status,
            statusText: error.statusText,
            duration: error.duration
          }
        };
        
        await this.triggerAlert(alert, triggeredData);
      }
    } catch (error) {
      console.error('[AlertService] 检查错误告警失败:', error);
    }
  }
}

module.exports = new AlertService();
