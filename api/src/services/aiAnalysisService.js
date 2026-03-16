const axios = require('axios');
const AIConfig = require('../models/AIConfig');

/**
 * AI 错误分析服务
 * 支持多个 AI 服务提供商
 */
class AIAnalysisService {
  constructor() {
    // 从数据库加载配置
    this.config = null;
    this.provider = null;
    this.apiKey = null;
    this.apiUrl = null;
    this.model = null;
    this.enabled = false;
    
    // 初始化配置
    this.loadConfig();
  }

  /**
   * 从数据库加载配置
   */
  async loadConfig() {
    try {
      // 查找默认配置或第一个启用的配置
      const config = await AIConfig.findOne({ 
        enabled: true,
        $or: [{ isDefault: true }, {}]
      }).sort({ isDefault: -1, createdAt: 1 });
      
      if (config) {
        this.config = config;
        this.provider = config.provider;
        this.apiKey = config.apiKey;
        this.apiUrl = config.apiUrl;
        this.model = config.model;
        this.enabled = true;
        console.log(`✅ AI Analysis enabled with ${this.provider} (${this.model})`);
      } else {
        this.enabled = false;
        console.warn('⚠️  AI Analysis disabled: No configuration found in database');
      }
    } catch (error) {
      console.error('Failed to load AI config:', error.message);
      this.enabled = false;
    }
  }

  /**
   * 更新配置
   */
  async updateConfig(configData) {
    try {
      const config = await AIConfig.findByIdAndUpdate(
        configData._id,
        {
          ...configData,
          updatedBy: configData.updatedBy
        },
        { upsert: false, new: true }
      );
      
      // 如果更新的是默认配置，重新加载
      if (config && config.isDefault) {
        await this.loadConfig();
      }
      
      return config;
    } catch (error) {
      console.error('Failed to update AI config:', error.message);
      throw error;
    }
  }

  /**
   * 获取当前配置
   */
  async getConfig() {
    if (!this.config) {
      await this.loadConfig();
    }
    return this.config;
  }

  /**
   * 分析错误并生成诊断报告
   */
  async analyzeError(errorData) {
    // 确保配置已加载
    if (!this.enabled) {
      await this.loadConfig();
    }
    
    if (!this.enabled) {
      return this._getFallbackAnalysis();
    }

    try {
      const prompt = this._buildAnalysisPrompt(errorData);
      
      // 根据不同的提供商调用不同的 API
      let response;
      switch (this.provider) {
        case 'openai':
          response = await this._callOpenAI(prompt);
          break;
        case 'deepseek':
          response = await this._callDeepSeek(prompt);
          break;
        case 'claude':
          response = await this._callClaude(prompt);
          break;
        case 'gemini':
          response = await this._callGemini(prompt);
          break;
        case 'wenxin':
          response = await this._callWenxin(prompt);
          break;
        case 'tongyi':
          response = await this._callTongyi(prompt);
          break;
        case 'zhipu':
          response = await this._callZhipu(prompt);
          break;
        case 'moonshot':
          response = await this._callMoonshot(prompt);
          break;
        case 'minimax':
          response = await this._callMinimax(prompt);
          break;
        case 'doubao':
          response = await this._callDoubao(prompt);
          break;
        case 'custom':
          response = await this._callCustom(prompt);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }

      return this._parseAnalysis(response, errorData);
      
    } catch (error) {
      console.error('AI analysis failed:', error.message);
      // 返回详细的错误信息，包括模型的报错输出
      return {
        success: false,
        rootCause: 'AI 分析失败',
        category: '未分类',
        confidence: 0,
        analysis: `AI 分析服务调用失败: ${error.message}`,
        possibleReasons: [],
        suggestedFixes: [],
        preventionTips: [],
        analyzedAt: new Date(),
        model: this.model,
        errorDetails: {
          message: error.message,
          provider: this.provider,
          model: this.model,
          stack: error.stack
        }
      };
    }
  }

  /**
   * 调用 OpenAI API
   */
  async _callOpenAI(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer specializing in debugging and error analysis. Analyze errors and provide actionable insights in Chinese.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * 调用 DeepSeek API
   */
  async _callDeepSeek(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * 调用 Google Gemini API
   */
  async _callGemini(prompt) {
    // Gemini API 格式不同
    const url = `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    
    const response = await axios.post(
      url,
      {
        contents: [{
          parts: [{
            text: `你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  }

  /**
   * 调用 Moonshot AI API
   */
  async _callMoonshot(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * 调用 MiniMax API
   */
  async _callMinimax(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          GroupId: this.config.extraConfig?.groupId
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * 调用豆包 API
   */
  async _callDoubao(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  }
  async _callClaude(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `You are an expert software engineer specializing in debugging and error analysis. Analyze errors and provide actionable insights in Chinese.\n\n${prompt}`
          }
        ]
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.content[0].text;
  }

  /**
   * 调用文心一言 API
   */
  async _callWenxin(prompt) {
    // 文心一言需要先获取 access_token
    const tokenResponse = await axios.post(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.config.extraConfig.apiKey}&client_secret=${this.config.extraConfig.secretKey}`,
      {},
      { timeout: 10000 }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    const response = await axios.post(
      `${this.apiUrl}?access_token=${accessToken}`,
      {
        messages: [
          {
            role: 'user',
            content: `你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。\n\n${prompt}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.result;
  }

  /**
   * 调用通义千问 API
   */
  async _callTongyi(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.output.choices[0].message.content;
  }

  /**
   * 调用智谱 AI API
   */
  async _callZhipu(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的软件工程师，擅长调试和错误分析。请分析错误并提供可操作的见解。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * 调用自定义 API
   */
  async _callCustom(prompt) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer specializing in debugging and error analysis. Analyze errors and provide actionable insights in Chinese.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        ...this.config.extraConfig
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...this.config.extraConfig?.headers
        },
        timeout: 60000
      }
    );

    // 尝试多种可能的响应格式
    if (response.data.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else if (response.data.content?.[0]?.text) {
      return response.data.content[0].text;
    } else if (response.data.result) {
      return response.data.result;
    } else if (response.data.output?.choices?.[0]?.message?.content) {
      return response.data.output.choices[0].message.content;
    } else {
      throw new Error('Unsupported response format');
    }
  }

  /**
   * 构建分析提示词
   */
  _buildAnalysisPrompt(errorData) {
    const {
      message,
      type,
      level,
      stack,
      pageUrl,
      apiUrl,
      method,
      status,
      statusText,
      userAgent,
      context
    } = errorData;

    let prompt = `请分析以下错误并提供诊断：

## 错误信息
- 错误消息: ${message || '未知'}
- 错误类型: ${type || '未知'}
- 错误级别: ${level || '未知'}
`;

    if (pageUrl) {
      prompt += `- 发生页面: ${pageUrl}\n`;
    }

    if (apiUrl) {
      prompt += `- API 地址: ${apiUrl}\n`;
      prompt += `- 请求方法: ${method || 'GET'}\n`;
      prompt += `- 状态码: ${status || '未知'}\n`;
      if (statusText) {
        prompt += `- 状态文本: ${statusText}\n`;
      }
    }

    if (stack) {
      prompt += `\n## 堆栈跟踪\n\`\`\`\n${this._truncateStack(stack)}\n\`\`\`\n`;
    }

    if (userAgent) {
      prompt += `\n## 环境信息\n- User Agent: ${userAgent}\n`;
    }

    if (context && Object.keys(context).length > 0) {
      prompt += `\n## 上下文信息\n${JSON.stringify(context, null, 2)}\n`;
    }

    prompt += `\n请按以下 JSON 格式返回分析结果（只返回 JSON，不要其他文字）：
{
  "rootCause": "根本原因的简短描述（一句话）",
  "category": "错误类别（如：网络错误、代码错误、配置错误、数据错误等）",
  "confidence": 0.85,
  "analysis": "详细分析（2-3句话）",
  "possibleReasons": ["可能原因1", "可能原因2", "可能原因3"],
  "suggestedFixes": [
    {
      "title": "修复方案1标题",
      "description": "详细说明",
      "priority": "high"
    }
  ],
  "preventionTips": ["预防建议1", "预防建议2"]
}`;

    return prompt;
  }

  /**
   * 映射 AI 返回的 category 到有效的枚举值
   */
  _mapCategory(aiCategory) {
    if (!aiCategory) return '未分类';
    
    const category = aiCategory.trim();
    
    // 有效的枚举值
    const validCategories = ['网络错误', '代码错误', '配置错误', '数据错误', '权限错误', '性能问题', '未分类'];
    
    // 如果已经是有效值，直接返回
    if (validCategories.includes(category)) {
      return category;
    }
    
    // 映射常见 AI 返回的 category 到有效值
    const categoryMap = {
      '服务器端错误': '代码错误',
      '服务端错误': '代码错误',
      '后端错误': '代码错误',
      'server error': '代码错误',
      'server-side error': '代码错误',
      '异步错误': '代码错误',
      'async error': '代码错误',
      '前端错误': '代码错误',
      'client error': '代码错误',
      '客户端错误': '代码错误',
      '网络问题': '网络错误',
      'network error': '网络错误',
      '连接错误': '网络错误',
      'connection error': '网络错误',
      '配置问题': '配置错误',
      'configuration error': '配置错误',
      '数据问题': '数据错误',
      'data error': '数据错误',
      '权限问题': '权限错误',
      'permission error': '权限错误',
      'auth error': '权限错误',
      '认证错误': '权限错误',
      '性能问题': '性能问题',
      'performance issue': '性能问题',
      '性能错误': '性能问题',
      'timeout': '性能问题',
      '超时': '性能问题'
    };
    
    // 查找映射
    for (const [key, value] of Object.entries(categoryMap)) {
      if (category.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // 默认返回 '未分类'
    return '未分类';
  }

  /**
   * 解析 AI 返回的分析结果
   */
  _parseAnalysis(analysisText, errorData) {
    try {
      // 先去掉 markdown 代码块包裹（```json ... ``` 或 ``` ... ```）
      const stripped = analysisText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();

      // 尝试提取 JSON 对象
      const jsonMatch = stripped.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          rootCause: parsed.rootCause || '未能识别根本原因',
          category: this._mapCategory(parsed.category),
          confidence: parsed.confidence || 0.5,
          analysis: parsed.analysis || '',
          possibleReasons: parsed.possibleReasons || [],
          suggestedFixes: parsed.suggestedFixes || [],
          preventionTips: parsed.preventionTips || [],
          analyzedAt: new Date(),
          model: this.model
        };
      }
      
      // 如果无法解析 JSON，返回原始文本
      return {
        success: true,
        rootCause: '分析完成',
        category: '未分类',
        confidence: 0.5,
        analysis: analysisText,
        possibleReasons: [],
        suggestedFixes: [],
        preventionTips: [],
        analyzedAt: new Date(),
        model: this.model
      };
      
    } catch (error) {
      console.error('Failed to parse AI analysis:', error);
      return this._getFallbackAnalysis();
    }
  }

  /**
   * 获取降级分析（基于规则）
   */
  _getFallbackAnalysis() {
    return {
      success: false,
      rootCause: 'AI 分析服务暂时不可用',
      category: '未分类',
      confidence: 0,
      analysis: '请在 AI 配置页面配置 AI 服务提供商以启用 AI 分析功能',
      possibleReasons: [],
      suggestedFixes: [],
      preventionTips: [],
      analyzedAt: new Date(),
      model: 'fallback'
    };
  }

  /**
   * 基于规则的简单分析（降级方案）
   */
  _getRuleBasedAnalysis(errorData) {
    const { message, type, status, apiUrl } = errorData;
    
    let rootCause = '未知错误';
    let category = '未分类';
    let possibleReasons = [];
    let suggestedFixes = [];
    
    // 网络错误
    if (type?.includes('network') || type?.includes('fetch') || type?.includes('xhr')) {
      category = '网络错误';
      if (status === 0 || !status) {
        rootCause = '网络连接失败';
        possibleReasons = [
          '服务器无响应',
          '网络连接中断',
          'CORS 配置问题',
          '防火墙拦截'
        ];
        suggestedFixes = [
          { title: '检查服务器状态', description: '确认后端服务是否正常运行', priority: 'high' },
          { title: '检查网络连接', description: '确认客户端网络是否正常', priority: 'high' },
          { title: '检查 CORS 配置', description: '确认服务器允许跨域请求', priority: 'medium' }
        ];
      } else if (status >= 500) {
        rootCause = '服务器内部错误';
        possibleReasons = ['服务器代码异常', '数据库连接失败', '第三方服务异常'];
        suggestedFixes = [
          { title: '查看服务器日志', description: '检查后端错误日志获取详细信息', priority: 'high' }
        ];
      } else if (status === 404) {
        rootCause = 'API 接口不存在';
        possibleReasons = ['接口路径错误', 'API 版本不匹配', '接口已废弃'];
        suggestedFixes = [
          { title: '检查 API 路径', description: `确认 ${apiUrl} 是否正确`, priority: 'high' }
        ];
      } else if (status === 401 || status === 403) {
        rootCause = '权限验证失败';
        possibleReasons = ['Token 过期', '权限不足', '未登录'];
        suggestedFixes = [
          { title: '检查认证状态', description: '确认用户登录状态和 Token 有效性', priority: 'high' }
        ];
      }
    }
    
    // JavaScript 错误
    else if (type === 'vue_error' || type === 'global_error') {
      category = '代码错误';
      if (message?.includes('undefined') || message?.includes('null')) {
        rootCause = '空值引用错误';
        possibleReasons = [
          '变量未初始化',
          'API 返回数据为空',
          '异步数据未加载完成'
        ];
        suggestedFixes = [
          { title: '添加空值检查', description: '使用可选链操作符 (?.) 或空值合并 (??)', priority: 'high' },
          { title: '添加加载状态', description: '在数据加载完成前显示加载状态', priority: 'medium' }
        ];
      } else if (message?.includes('is not a function')) {
        rootCause = '函数调用错误';
        possibleReasons = ['方法不存在', '对象类型错误', '导入路径错误'];
        suggestedFixes = [
          { title: '检查方法定义', description: '确认方法是否存在且正确导入', priority: 'high' }
        ];
      }
    }
    
    // Promise 错误
    else if (type === 'promise_rejection') {
      category = '代码错误';
      rootCause = 'Promise 被拒绝';
      possibleReasons = ['异步操作失败', '未捕获的异常', '网络请求失败'];
      suggestedFixes = [
        { title: '添加错误处理', description: '使用 try-catch 或 .catch() 捕获异步错误', priority: 'high' }
      ];
    }

    return {
      success: true,
      rootCause,
      category,
      confidence: 0.6,
      analysis: `基于规则分析：${rootCause}`,
      possibleReasons,
      suggestedFixes,
      preventionTips: [
        '添加完善的错误处理机制',
        '进行充分的边界条件测试',
        '使用 TypeScript 增强类型安全'
      ],
      analyzedAt: new Date(),
      model: 'rule-based'
    };
  }

  /**
   * 截断过长的堆栈信息
   */
  _truncateStack(stack, maxLength = 2000) {
    if (!stack) return '';
    if (stack.length <= maxLength) return stack;
    
    const lines = stack.split('\n');
    const truncated = [];
    let length = 0;
    
    for (const line of lines) {
      if (length + line.length > maxLength) break;
      truncated.push(line);
      length += line.length + 1;
    }
    
    return truncated.join('\n') + '\n... (truncated)';
  }

  /**
   * 批量分析多个错误，找出共同模式
   */
  async analyzeErrorPattern(errors) {
    if (!this.enabled || errors.length === 0) {
      return null;
    }

    try {
      const errorSummary = errors.slice(0, 10).map(e => ({
        message: e.message,
        type: e.type,
        stack: this._truncateStack(e.stack, 500)
      }));

      const prompt = `分析以下 ${errors.length} 个相似错误，找出共同模式：

${JSON.stringify(errorSummary, null, 2)}

请返回 JSON 格式：
{
  "pattern": "共同模式描述",
  "rootCause": "根本原因",
  "affectedArea": "影响的系统区域",
  "recommendation": "修复建议"
}`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are an expert at pattern recognition in software errors.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const analysis = response.data.choices[0].message.content;
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Pattern analysis failed:', error.message);
      return null;
    }
  }
}

module.exports = new AIAnalysisService();
