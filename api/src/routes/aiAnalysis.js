const express = require('express');
const router = express.Router();
const Error = require('../models/Error');
const ErrorAnalysis = require('../models/ErrorAnalysis');
const aiAnalysisService = require('../services/aiAnalysisService');
const { authenticate } = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/projectAccess');

// 分析单个错误
router.post('/errors/:errorId/analyze', authenticate, async (req, res) => {
  try {
    const error = await Error.findById(req.params.errorId);
    
    if (!error) {
      return res.status(404).json({ error: '错误不存在' });
    }

    // 检查项目权限
    const hasAccess = await checkProjectAccess(req.user._id, error.projectId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    // 检查是否已有分析结果
    let analysis = await ErrorAnalysis.findOne({ errorId: error._id });
    
    if (analysis && !req.body.force) {
      return res.json({ 
        analysis: cleanAnalysisField(analysis.toObject ? analysis.toObject() : analysis),
        cached: true,
        message: '返回缓存的分析结果'
      });
    }

    // 执行 AI 分析
    const analysisResult = await aiAnalysisService.analyzeError({
      message: error.message,
      type: error.type,
      level: error.level,
      stack: error.stack,
      pageUrl: error.pageUrl,
      apiUrl: error.apiUrl,
      method: error.method,
      status: error.status,
      statusText: error.statusText,
      userAgent: error.userAgent,
      context: error.context
    });

    // 查找相似错误
    const relatedErrors = await findRelatedErrors(error);

    // 保存或更新分析结果
    if (analysis) {
      Object.assign(analysis, {
        ...analysisResult,
        relatedErrors: relatedErrors.map(e => e._id),
        analyzedAt: new Date()
      });
      await analysis.save();
    } else {
      analysis = new ErrorAnalysis({
        errorId: error._id,
        projectId: error.projectId,
        ...analysisResult,
        relatedErrors: relatedErrors.map(e => e._id)
      });
      await analysis.save();
    }

    // 转换为普通对象并填充 relatedErrors 详细信息
    const analysisObj = analysis.toObject();
    analysisObj.relatedErrors = relatedErrors.map(e => ({
      _id: e._id,
      message: e.message,
      type: e.type,
      timestamp: e.timestamp,
      resolved: e.resolved
    }));

    res.json({
      analysis: cleanAnalysisField(analysisObj),
      cached: false,
      message: 'AI 分析完成'
    });

  } catch (error) {
    console.error('Error analysis failed:', error);
    res.status(500).json({ 
      error: '分析失败',
      message: error.message 
    });
  }
});

// 获取错误的分析结果
router.get('/errors/:errorId/analysis', authenticate, async (req, res) => {
  try {
    const error = await Error.findById(req.params.errorId);
    
    if (!error) {
      return res.status(404).json({ error: '错误不存在' });
    }

    const hasAccess = await checkProjectAccess(req.user._id, error.projectId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    const analysis = await ErrorAnalysis.findOne({ errorId: error._id }).lean();

    if (!analysis) {
      return res.status(200).json({ 
        analysis: null,
        message: '未找到分析结果'
      });
    }

    // 手动填充 relatedErrors 的详细信息
    if (analysis.relatedErrors && analysis.relatedErrors.length > 0) {
      const relatedErrorsDetails = await Error.find({
        _id: { $in: analysis.relatedErrors }
      }).select('_id message type timestamp pageUrl resolved').lean();
      
      // 将详细信息附加到分析结果
      analysis.relatedErrors = relatedErrorsDetails;
    }

    res.json({ analysis: cleanAnalysisField(analysis) });

  } catch (error) {
    console.error('Get analysis failed:', error);
    res.status(500).json({ error: '获取分析失败' });
  }
});

// 批量分析项目的错误
router.post('/projects/:projectId/analyze-batch', authenticate, async (req, res) => {
  try {
    const hasAccess = await checkProjectAccess(req.user._id, req.params.projectId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    const { limit = 50, onlyUnanalyzed = true } = req.body;

    // 查找需要分析的错误
    let query = { 
      projectId: req.params.projectId,
      resolved: false
    };

    if (onlyUnanalyzed) {
      const analyzedErrorIds = await ErrorAnalysis.distinct('errorId', {
        projectId: req.params.projectId
      });
      query._id = { $nin: analyzedErrorIds };
    }

    const errors = await Error.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    if (errors.length === 0) {
      return res.json({
        message: '没有需要分析的错误',
        analyzed: 0
      });
    }

    // 异步分析（不阻塞响应）
    res.json({
      message: `开始分析 ${errors.length} 个错误`,
      total: errors.length,
      status: 'processing'
    });

    // 后台执行分析
    analyzeBatch(errors).catch(err => {
      console.error('Batch analysis failed:', err);
    });

  } catch (error) {
    console.error('Batch analysis request failed:', error);
    res.status(500).json({ error: '批量分析请求失败' });
  }
});

// 提交分析反馈
router.post('/analysis/:analysisId/feedback', authenticate, async (req, res) => {
  try {
    const { helpful, rating, comment } = req.body;

    const analysis = await ErrorAnalysis.findById(req.params.analysisId);
    
    if (!analysis) {
      return res.status(404).json({ error: '分析结果不存在' });
    }

    const error = await Error.findById(analysis.errorId);
    const hasAccess = await checkProjectAccess(req.user._id, error.projectId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    analysis.feedback = {
      helpful,
      rating,
      comment,
      submittedAt: new Date(),
      submittedBy: req.user._id
    };

    await analysis.save();

    res.json({
      message: '反馈提交成功',
      analysis
    });

  } catch (error) {
    console.error('Submit feedback failed:', error);
    res.status(500).json({ error: '提交反馈失败' });
  }
});

// 获取项目的分析统计
router.get('/projects/:projectId/analysis-stats', authenticate, async (req, res) => {
  try {
    const hasAccess = await checkProjectAccess(req.user._id, req.params.projectId, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    const stats = await ErrorAnalysis.aggregate([
      { $match: { projectId: req.params.projectId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = await ErrorAnalysis.countDocuments({ 
      projectId: req.params.projectId 
    });

    const withFeedback = await ErrorAnalysis.countDocuments({
      projectId: req.params.projectId,
      'feedback.helpful': { $exists: true }
    });

    const helpful = await ErrorAnalysis.countDocuments({
      projectId: req.params.projectId,
      'feedback.helpful': true
    });

    res.json({
      total,
      byCategory: stats,
      feedback: {
        total: withFeedback,
        helpful,
        helpfulRate: withFeedback > 0 ? (helpful / withFeedback * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('Get analysis stats failed:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

// 辅助函数：清理 AI 返回的 markdown 包裹，确保 analysis 字段是纯文本
function cleanAnalysisField(obj) {
  if (!obj || typeof obj.analysis !== 'string') return obj;
  const raw = obj.analysis;
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  // 如果 analysis 字段本身是 JSON，说明整个结果没被正确解析，重新提取
  if (stripped.startsWith('{')) {
    try {
      const parsed = JSON.parse(stripped);
      return {
        ...obj,
        rootCause: parsed.rootCause || obj.rootCause,
        category: parsed.category || obj.category,
        confidence: parsed.confidence ?? obj.confidence,
        analysis: parsed.analysis || stripped,
        possibleReasons: parsed.possibleReasons?.length ? parsed.possibleReasons : obj.possibleReasons,
        suggestedFixes: parsed.suggestedFixes?.length ? parsed.suggestedFixes : obj.suggestedFixes,
        preventionTips: parsed.preventionTips?.length ? parsed.preventionTips : obj.preventionTips
      };
    } catch (e) { /* 解析失败保持原样 */ }
  }
  return obj;
}

// 辅助函数：查找相似错误
async function findRelatedErrors(error, limit = 5) {
  try {
    // 基于消息相似度查找
    const relatedByMessage = await Error.find({
      projectId: error.projectId,
      _id: { $ne: error._id },
      type: error.type,
      $or: [
        { message: new RegExp(error.message?.substring(0, 50), 'i') },
        { stack: new RegExp(error.stack?.split('\n')[0], 'i') }
      ]
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('_id message type timestamp resolved');

    return relatedByMessage;
  } catch (err) {
    console.error('Find related errors failed:', err);
    return [];
  }
}

// 辅助函数：批量分析
async function analyzeBatch(errors) {
  for (const error of errors) {
    try {
      const analysisResult = await aiAnalysisService.analyzeError({
        message: error.message,
        type: error.type,
        level: error.level,
        stack: error.stack,
        pageUrl: error.pageUrl,
        apiUrl: error.apiUrl,
        method: error.method,
        status: error.status,
        statusText: error.statusText,
        userAgent: error.userAgent,
        context: error.context
      });

      const relatedErrors = await findRelatedErrors(error);

      await ErrorAnalysis.findOneAndUpdate(
        { errorId: error._id },
        {
          errorId: error._id,
          projectId: error.projectId,
          ...analysisResult,
          relatedErrors: relatedErrors.map(e => e._id)
        },
        { upsert: true, new: true }
      );

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      console.error(`Failed to analyze error ${error._id}:`, err);
    }
  }
  
  console.log(`✓ Batch analysis completed: ${errors.length} errors`);
}

module.exports = router;
