const axios = require('axios');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // 邮件配置
    this.emailTransporter = null;
    this.initEmailTransporter();
  }

  /**
   * 初始化邮件发送器
   */
  initEmailTransporter() {
    try {
      // 从环境变量读取配置
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      if (emailConfig.auth.user && emailConfig.auth.pass) {
        this.emailTransporter = nodemailer.createTransport(emailConfig);
      }
    } catch (error) {
      console.error('初始化邮件发送器失败:', error);
    }
  }

  /**
   * 替换模板变量
   */
  replaceTemplateVariables(template, data) {
    const { alert, data: alertData } = data;
    
    // 变量值映射
    const variables = {
      priority: alert.priority || 'medium',
      projectName: alert.projectId?.name || alert.projectId || '未知项目',
      alertName: alert.name || '未命名告警',
      reason: alertData.reason || '未知原因',
      errorCount: alertData.errorCount || 0,
      userCount: alertData.userCount || 0,
      time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      // 错误详情变量
      message: alertData.errorDetails?.message || '',
      errorMessage: alertData.errorDetails?.message || '',
      errorType: alertData.errorDetails?.type || '',
      type: alertData.errorDetails?.type || '',
      level: alertData.errorDetails?.level || alert.priority || 'error',
      pageUrl: alertData.errorDetails?.pageUrl || '',
      url: alertData.errorDetails?.url || '',
      apiUrl: alertData.errorDetails?.url || '',
      method: alertData.errorDetails?.method || '',
      status: alertData.errorDetails?.status || '',
      statusText: alertData.errorDetails?.statusText || '',
      duration: alertData.errorDetails?.duration ? `${alertData.errorDetails.duration}ms` : '',
      environment: alertData.errorDetails?.environment || '',
      release: alertData.errorDetails?.release || '',
      // cURL 命令
      curl: alertData.errorDetails?.curlCommand || '',
      curlCommand: alertData.errorDetails?.curlCommand || ''
    };
    
    // 中文标签映射
    const chineseLabels = {
      priority: '优先级',
      projectName: '项目名称',
      alertName: '告警名称',
      reason: '触发原因',
      errorCount: '错误数量',
      userCount: '用户数量',
      time: '时间',
      message: '错误消息',
      errorMessage: '错误消息',
      errorType: '错误类型',
      type: '类型',
      level: '错误级别',
      pageUrl: '页面URL',
      url: 'URL',
      apiUrl: '接口URL',
      method: '请求方法',
      status: '状态码',
      statusText: '状态文本',
      duration: '请求耗时',
      environment: '环境',
      release: '版本',
      curl: 'cURL命令',
      curlCommand: 'cURL命令'
    };

    let result = template;
    
    // 第一步：移除空值的行（整行删除）
    for (const [key, value] of Object.entries(variables)) {
      // 判断是否为空值：空字符串、null、undefined，但0不算空（错误数量可能是0）
      const isEmpty = value === '' || value === null || value === undefined;
      
      if (isEmpty) {
        // 移除包含该变量的整行（包括换行符）
        // 匹配：行首 + 任意字符 + {{变量}} + 任意字符 + 行尾 + 可选换行符
        const lineRegex = new RegExp(`^.*\\{\\{${key}\\}\\}.*$\\n?`, 'gm');
        result = result.replace(lineRegex, '');
      }
    }
    
    // 第二步：替换所有非空变量为"中文标签: 值"格式
    for (const [key, value] of Object.entries(variables)) {
      const isEmpty = value === '' || value === null || value === undefined;
      
      if (!isEmpty) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        const label = chineseLabels[key] || key;
        result = result.replace(regex, `${label}: ${value}`);
      }
    }
    
    return result;
  }

  /**
   * 获取优先级颜色
   */
  getPriorityColor(priority) {
    const colors = {
      critical: '#ff4d4f',
      high: '#ff7a45',
      medium: '#faad14',
      low: '#52c41a'
    };
    return colors[priority] || colors.medium;
  }

  /**
   * 获取优先级标签
   */
  getPriorityLabel(priority) {
    const labels = {
      critical: '🔴 紧急',
      high: '🟠 高',
      medium: '🟡 中',
      low: '🟢 低'
    };
    return labels[priority] || labels.medium;
  }

  /**
   * 获取 HTTP 方法颜色
   */
  getMethodColor(method) {
    const colors = {
      GET: '#52c41a',
      POST: '#1890ff',
      PUT: '#faad14',
      DELETE: '#ff4d4f',
      PATCH: '#722ed1'
    };
    return colors[method] || '#666666';
  }

  /**
   * 发送通知
   */
  async send(type, config, data, template) {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (type) {
        case 'email':
          result = await this.sendEmail(config, data, template);
          break;
        case 'webhook':
          result = await this.sendWebhook(config, data, template);
          break;
        case 'dingtalk':
          result = await this.sendDingtalk(config, data, template);
          break;
        case 'wechat':
          result = await this.sendWechat(config, data, template);
          break;
        case 'slack':
          result = await this.sendSlack(config, data, template);
          break;
        default:
          throw new Error(`不支持的通知类型: ${type}`);
      }

      return {
        success: true,
        responseTime: Date.now() - startTime,
        ...result
      };
    } catch (error) {
      console.error(`发送 ${type} 通知失败:`, error);
      return {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * 发送邮件通知
   */
  async sendEmail(config, data) {
    if (!this.emailTransporter) {
      throw new Error('邮件发送器未配置');
    }

    const { recipients } = config;
    const { alert, data: alertData } = data;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipients.join(', '),
      subject: `[ErrorCatcher] 告警: ${alert.name}`,
      html: this.generateEmailTemplate(alert, alertData)
    };

    const info = await this.emailTransporter.sendMail(mailOptions);
    return { messageId: info.messageId };
  }

  /**
   * 生成邮件模板
   */
  generateEmailTemplate(alert, data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d946ef 0%, #c026d3 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert-info { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #d946ef; }
          .stat-label { font-size: 12px; color: #666; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚨 告警触发</h2>
            <p>${alert.name}</p>
          </div>
          <div class="content">
            <div class="alert-info">
              <h3>告警详情</h3>
              <p><strong>原因:</strong> ${data.reason}</p>
              <p><strong>优先级:</strong> ${alert.priority}</p>
              <p><strong>时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
            </div>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${data.errorCount}</div>
                <div class="stat-label">错误次数</div>
              </div>
              <div class="stat">
                <div class="stat-value">${data.userCount}</div>
                <div class="stat-label">影响用户</div>
              </div>
            </div>
            <div class="footer">
              <p>此邮件由 ErrorCatcher 自动发送</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 发送 Webhook 通知
   */
  async sendWebhook(config, data) {
    const { url, method = 'POST', headers = {} } = config;
    const { alert, data: alertData } = data;

    const payload = {
      alert: {
        id: alert._id,
        name: alert.name,
        priority: alert.priority,
        projectId: alert.projectId
      },
      data: alertData,
      timestamp: new Date().toISOString()
    };

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      data: payload,
      timeout: 10000
    });

    return { status: response.status };
  }

  /**
   * 发送钉钉通知
   */
  async sendDingtalk(config, data, template) {
    const { webhook, secret, atMobiles = [] } = config;
    const { alert, data: alertData } = data;

    // 生成签名
    let url = webhook;
    if (secret) {
      const timestamp = Date.now();
      const crypto = require('crypto');
      const stringToSign = `${timestamp}\n${secret}`;
      const sign = crypto
        .createHmac('sha256', secret)
        .update(stringToSign)
        .digest('base64');
      url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
    }

    let title = '';
    let text = '';
    
    // 如果有模板，使用模板
    if (template) {
      // 使用模板标题
      if (template.title) {
        title = this.replaceTemplateVariables(template.title, data);
      }
      
      // 使用模板内容
      if (template.content) {
        text = this.replaceTemplateVariables(template.content, data);
      }
    }
    
    // 如果没有模板或模板内容为空，使用默认格式
    if (!text) {
      const projectName = alert.projectId?.name || alert.projectId || '未知项目';
      
      // 根据优先级设置图标
      const priorityMap = {
        critical: '🔴 紧急',
        high: '🟠 高',
        medium: '🟡 中',
        low: '🟢 低'
      };
      const priorityText = priorityMap[alert.priority] || priorityMap.medium;
      
      // 构建文本内容 - 一行一行显示
      text = `项目名称: ${projectName}\n`;
      text += `触发原因: ${alertData.reason}\n`;
      text += `错误数量: ${alertData.errorCount}\n`;
      text += `影响用户: ${alertData.userCount}\n`;
      text += `优先级: ${priorityText}\n`;
      text += `时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
      
      // 如果有错误详情，添加 URL 信息
      if (alertData.errorDetails) {
        const error = alertData.errorDetails;
        
        // 页面 URL
        if (error.pageUrl) {
          text += `发生页面: ${error.pageUrl}\n`;
        }
        
        // API URL（接口错误）
        if (error.url && (error.type === 'fetch' || error.type === 'fetch_error' || error.type === 'xhr' || error.type === 'xhr_error' || error.type === 'axios_error')) {
          text += `请求方法: ${error.method || 'UNKNOWN'}\n`;
          text += `接口: ${error.url}\n`;
          
          if (error.status) {
            text += `状态码: ${error.status}`;
            if (error.statusText) {
              text += ` ${error.statusText}`;
            }
            text += `\n`;
          }
          
          if (error.duration) {
            text += `请求耗时: ${error.duration}ms\n`;
          }
        }
        
        // 错误消息
        if (error.message) {
          text += `错误消息: ${error.message}\n`;
        }
      }
    }
    
    // 如果有标题，添加到文本开头
    if (title) {
      text = `${title}\n\n${text}`;
    }

    const payload = {
      msgtype: 'text',
      text: {
        content: text
      },
      at: {
        atMobiles,
        isAtAll: false
      }
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    return { status: response.status, data: response.data };
  }

  /**
   * 发送企业微信通知
   */
  async sendWechat(config, data) {
    const { webhook } = config;
    const { alert, data: alertData } = data;

    const payload = {
      msgtype: 'markdown',
      markdown: {
        content: `### 🚨 告警触发\n` +
                `> **告警名称:** ${alert.name}\n` +
                `> **优先级:** ${alert.priority}\n` +
                `> **原因:** ${alertData.reason}\n` +
                `> **错误次数:** ${alertData.errorCount}\n` +
                `> **影响用户:** ${alertData.userCount}\n` +
                `> **时间:** ${new Date().toLocaleString('zh-CN')}`
      }
    };

    const response = await axios.post(webhook, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    return { status: response.status, data: response.data };
  }

  /**
   * 发送 Slack 通知
   */
  async sendSlack(config, data) {
    const { webhook } = config;
    const { alert, data: alertData } = data;

    const payload = {
      text: `🚨 告警触发: ${alert.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 告警: ${alert.name}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*优先级:*\n${alert.priority}`
            },
            {
              type: 'mrkdwn',
              text: `*错误次数:*\n${alertData.errorCount}`
            },
            {
              type: 'mrkdwn',
              text: `*影响用户:*\n${alertData.userCount}`
            },
            {
              type: 'mrkdwn',
              text: `*时间:*\n${new Date().toLocaleString('zh-CN')}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*原因:* ${alertData.reason}`
          }
        }
      ]
    };

    const response = await axios.post(webhook, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    return { status: response.status };
  }
}

module.exports = new NotificationService();
