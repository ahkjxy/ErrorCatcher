const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const aiAnalysisService = require('../services/aiAnalysisService');
const AIConfig = require('../models/AIConfig');

// 测试 AI 连接的辅助函数
async function testAIConnection(config) {
  const axios = require('axios');
  const { provider, model, apiUrl, apiKey, extraConfig } = config;
  
  if (!apiKey) {
    return {
      success: false,
      error: '缺少 API Key',
      message: '请提供 API Key'
    };
  }
  
  try {
    const prompt = '请用一句话分析这个错误：Cannot read property of undefined';
    
    // 根据提供商调用不同的 API
    switch (provider) {
      case 'openai':
      case 'deepseek':
      case 'moonshot':
      case 'doubao':
      case 'stepfun':
      case 'nvidia':
      case 'xai':
        const response = await axios.post(
          apiUrl,
          {
            model,
            messages: [
              { role: 'system', content: '你是一位专业的软件工程师。' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 100
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        return {
          success: true,
          message: `AI 配置测试成功 (${provider})`,
          provider,
          model,
          testResult: response.data.choices[0].message.content
        };
        
      case 'gemini':
        const geminiUrl = `${apiUrl}/${model}:generateContent?key=${apiKey}`;
        const geminiResponse = await axios.post(
          geminiUrl,
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          { timeout: 15000 }
        );
        return {
          success: true,
          message: `AI 配置测试成功 (${provider})`,
          provider,
          model,
          testResult: geminiResponse.data.candidates[0].content.parts[0].text
        };
        
      case 'claude':
        const claudeResponse = await axios.post(
          apiUrl,
          {
            model,
            max_tokens: 100,
            messages: [{ role: 'user', content: prompt }]
          },
          {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        return {
          success: true,
          message: `AI 配置测试成功 (${provider})`,
          provider,
          model,
          testResult: claudeResponse.data.content[0].text
        };
        
      case 'zhipu':
      case 'qwen':
        console.log(`[AI Test] 请求 ${provider} API: ${apiUrl}, model: ${model}`);
        const zhipuResponse = await axios.post(
          apiUrl,
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        const content = zhipuResponse.data.choices?.[0]?.message?.content || 
                       zhipuResponse.data.output?.choices?.[0]?.message?.content;
        return {
          success: true,
          message: `AI 配置测试成功 (${provider})`,
          provider,
          model,
          testResult: content
        };
        
      default:
        throw new Error(`不支持的提供商: ${provider}`);
    }
  } catch (error) {
    console.error('测试 AI 配置失败:', error);
    
    // 提取详细的错误信息
    let errorMessage = error.message;
    let errorDetails = null;
    
    if (error.response) {
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      
      if (error.response.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response.data?.error) {
        errorMessage = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : JSON.stringify(error.response.data.error);
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      // 网络层错误，打印详细信息帮助诊断
      console.error('网络请求失败详情:', {
        url: apiUrl,
        provider,
        errorCode: error.code,
        errorMessage: error.message
      });
      if (error.code === 'ECONNABORTED') {
        errorMessage = `连接超时（15s），请检查 API URL 是否可访问: ${apiUrl}`;
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = `DNS 解析失败，无法解析域名: ${apiUrl}`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = `连接被拒绝: ${apiUrl}`;
      } else {
        errorMessage = `网络错误 (${error.code || 'unknown'}): 无法连接到 ${apiUrl}`;
      }
      errorDetails = { type: 'network_error', code: error.code, url: apiUrl };
    }
    
    return {
      success: false,
      error: '测试失败',
      message: errorMessage,
      details: errorDetails
    };
  }
}

// AI 服务提供商配置
const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      { value: 'gpt-5.4', label: 'GPT-5.4 (最新旗舰)', description: '2026 年 3 月发布，首款原生支持电脑操作的模型，100 万 token 上下文，编程能力领先' },
      { value: 'gpt-5.4-pro', label: 'GPT-5.4 Pro', description: '面向开发者的高性能版本，适合复杂任务，深度推理能力增强' },
      { value: 'gpt-5.3-instant', label: 'GPT-5.3 Instant', description: '2026 年 3 月发布，对话更自然，幻觉率降低 26.8%，语气优化' },
      { value: 'gpt-5.2-thinking', label: 'GPT-5.2 Thinking', description: '深度推理版本，支持链式思考，数学与逻辑任务表现优异' },
      { value: 'gpt-5.2', label: 'GPT-5.2', description: '2025 年 12 月发布，专业推理能力强，44 个职业领域表现优异' }
    ],
    defaultUrl: 'https://api.openai.com/v1/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      { value: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro (最新旗舰)', description: '2026 年 2 月发布，ARC-AGI-2 得分 77.1%，支持思考层级调节，多模态能力强' },
      { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', description: '2026 年 3 月发布，速度最快、成本效益最高，输入$0.25/百万 tokens' },
      { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', description: '预览版旗舰模型，1M 上下文，适合复杂推理，原生多模态霸主' },
      { value: 'gemini-3.1-flash-image-preview', label: 'Gemini 3.1 Flash Image', description: '多模态图像生成轻量版，速度与质量平衡' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: '稳定可靠的上一代旗舰，通用高质量多模态' }
    ],
    defaultUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  claude: {
    name: 'Anthropic Claude',
    models: [
      { value: 'claude-opus-4.6', label: 'Claude Opus 4.6 (最新)', description: '2026 年 2 月发布，1M 上下文，编程领先，多智能体协调能力强' },
      { value: 'claude-sonnet-4.6', label: 'Claude Sonnet 4.6', description: '平衡性能与速度的版本，带扩展思考能力的 Sonnet 变体' },
      { value: 'claude-opus-4.5', label: 'Claude Opus 4.5', description: '上一代旗舰模型，程序员用了都说好，自然语言处理能力极强' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (经典)', description: '长期稳定版本，适合怀旧或特定兼容性需求' }
    ],
    defaultUrl: 'https://api.anthropic.com/v1/messages',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  deepseek: {
    name: '深度求索 (DeepSeek)',
    models: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat (推荐)', description: '非思考模式，响应速度快，适合一般对话和代码分析' },
      { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner', description: '思考模式，深度推理能力强，适合复杂问题分析' }
    ],
    defaultUrl: 'https://api.deepseek.com/v1/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  qwen: {
    name: '阿里通义千问 (Qwen)',
    models: [
      { value: 'qwen-3.5-397b', label: 'Qwen 3.5 397B (最新旗舰)', description: '2026 年全球榜单前列，综合性能对标 GPT-5，中文理解与文化梗远超国外模型' },
      { value: 'qwen-3-max-thinking', label: 'Qwen 3 Max Thinking', description: '闭源代表模型，深度推理能力强，全球前十水平' },
      { value: 'qwen-3-coder-32b', label: 'Qwen 3 Coder 32B', description: '2025 年发布，SWE-Bench 69.6%，超越 GPT-4 Turbo，专注编程' },
      { value: 'qwen-3-72b', label: 'Qwen 3 72B', description: '千亿级通用大模型，性价比高' }
    ],
    defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  moonshot: {
    name: '月之暗面 (Moonshot AI)',
    models: [
      { value: 'kimi-k2.5', label: 'Kimi K2.5 (最新)', description: 'OpenClaw 全球调用量前五，长上下文处理能力强，国产开源领头羊' },
      { value: 'kimi-k2.5-thinking', label: 'Kimi K2.5 Thinking', description: '深度思考版本，杀入全球前十，适合复杂分析' },
      { value: 'kimi-k1.5', label: 'Kimi K1.5', description: '上一代主力模型，超长上下文处理能力独一无二' }
    ],
    defaultUrl: 'https://api.moonshot.cn/v1/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  minimax: {
    name: '稀宇科技 (MiniMax)',
    models: [
      { value: 'minimax-m2.5', label: 'MiniMax M2.5 (最新)', description: '2026 年 2 月发布，SWE-Bench 80.2%，高质价比，比 Claude 便宜 95%' },
      { value: 'minimax-m2.5-lightning', label: 'MiniMax M2.5 Lightning', description: '高速版本，100 tokens/s，输入$0.30/百万，输出$2.4/百万' },
      { value: 'minimax-m2.1', label: 'MiniMax M2.1', description: '2025 年 12 月发布，多语言编程专家' }
    ],
    defaultUrl: 'https://api.minimax.chat/v1/text/chatcompletion',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'groupId', label: 'Group ID', type: 'text', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  stepfun: {
    name: '阶跃星辰 (Stepfun)',
    models: [
      { value: 'step-3.5-flash', label: 'Step 3.5 Flash (最新旗舰)', description: '2026 年 2 月发布，Agentic 旗舰模型，196B MoE 架构，推理速度 350TPS' },
      { value: 'step-1o-turbo', label: 'Step 1o Turbo', description: '视觉理解大模型，数理计算、代码理解、极速输出' },
      { value: 'step-2', label: 'Step 2', description: '万亿参数语言模型，逻辑推理、中文应用' }
    ],
    defaultUrl: 'https://api.step.ai/v1/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  nvidia: {
    name: 'NVIDIA',
    models: [
      { value: 'nemotron-3-super', label: 'Nemotron 3 Super (最新)', description: '2026 年 3 月发布，120B MoE 架构，1M 上下文，多智能体系统专用，吞吐量提升 5 倍' },
      { value: 'nemotron-3-pro', label: 'Nemotron 3 Pro', description: '平衡性能和效率的企业级模型' },
      { value: 'personaplx-7b-v1', label: 'PersonaPlx 7B V1', description: '全球大模型榜单前列，个性化交互能力强' }
    ],
    defaultUrl: 'https://api.nvcf.nvidia.com/v1/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  zhipu: {
    name: '智谱 AI (Zhipu)',
    models: [
      { value: 'glm-4.6', label: 'GLM-4.6 (最新推荐)', description: '2025年最新版本，200K上下文，编程/推理/Agent能力全面提升' },
      { value: 'glm-4.7', label: 'GLM-4.7', description: '高性能版本' },
      { value: 'glm-4-air', label: 'GLM-4 Air', description: '高性价比版本，适合大规模应用' },
      { value: 'glm-4-flash', label: 'GLM-4 Flash (免费)', description: '免费快速版本，适合轻量任务' },
      { value: 'glm-5', label: 'GLM-5', description: '旗舰版本' }
    ],
    defaultUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  xai: {
    name: 'xAI (Grok)',
    models: [
      { value: 'grok-3', label: 'Grok-3 (最新)', description: '实时资讯专家，直接接入 X 实时数据流，突发新闻反应速度全球第一' },
      { value: 'grok-2-vision', label: 'Grok-2 Vision', description: '上一代多模态版本，视觉理解能力强' }
    ],
    defaultUrl: 'https://api.x.ai/v1/chat/completions',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  },
  custom: {
    name: '自定义 API',
    models: [
      { value: 'custom-model', label: '自定义模型', description: '输入您的模型名称' }
    ],
    defaultUrl: '',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiUrl', label: 'API URL', type: 'url', required: true }
    ]
  }
};

// 获取支持的 AI 提供商列表
router.get('/providers', authenticate, authorize('admin'), async (req, res) => {
  try {
    res.json({
      providers: Object.keys(AI_PROVIDERS).map(key => ({
        value: key,
        label: AI_PROVIDERS[key].name,
        models: AI_PROVIDERS[key].models,
        defaultUrl: AI_PROVIDERS[key].defaultUrl,
        fields: AI_PROVIDERS[key].fields
      }))
    });
  } catch (error) {
    console.error('获取 AI 提供商列表失败:', error);
    res.status(500).json({ error: '获取提供商列表失败' });
  }
});

// 获取 AI 配置列表（仅管理员）
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const configs = await AIConfig.find()
      .sort({ isDefault: -1, createdAt: -1 });
    
    // 添加 API Key 预览
    const configsWithPreview = configs.map(config => {
      const configObj = config.toObject();
      // 生成 API Key 预览
      if (configObj.apiKey && configObj.apiKey.length > 10) {
        configObj.apiKeyPreview = `${configObj.apiKey.substring(0, 6)}...${configObj.apiKey.substring(configObj.apiKey.length - 4)}`;
      } else if (configObj.apiKey) {
        configObj.apiKeyPreview = '******';
      } else {
        configObj.apiKeyPreview = null;
      }
      // 删除完整的 API Key
      delete configObj.apiKey;
      return configObj;
    });

    res.json({
      configs: configsWithPreview,
      total: configs.length
    });
  } catch (error) {
    console.error('获取 AI 配置列表失败:', error);
    res.status(500).json({ error: '获取配置列表失败' });
  }
});

// 获取单个 AI 配置（仅管理员）
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({ error: '配置不存在' });
    }

    const configObj = config.toObject();
    // 生成 API Key 预览
    if (configObj.apiKey && configObj.apiKey.length > 10) {
      configObj.apiKeyPreview = `${configObj.apiKey.substring(0, 6)}...${configObj.apiKey.substring(configObj.apiKey.length - 4)}`;
    } else if (configObj.apiKey) {
      configObj.apiKeyPreview = '******';
    } else {
      configObj.apiKeyPreview = null;
    }
    // 删除完整的 API Key
    delete configObj.apiKey;

    res.json(configObj);
  } catch (error) {
    console.error('获取 AI 配置失败:', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 创建 AI 配置（仅管理员）
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, provider, apiKey, model, apiUrl, isDefault, extraConfig } = req.body;

    if (!name || !provider || !apiKey || !model || !apiUrl) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    // 验证提供商
    if (!AI_PROVIDERS[provider]) {
      return res.status(400).json({ error: '不支持的 AI 提供商' });
    }

    // 创建配置
    const config = new AIConfig({
      name,
      description: description || '',
      provider,
      apiKey,
      model,
      apiUrl,
      isDefault: isDefault || false,
      enabled: true,
      extraConfig: extraConfig || {},
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await config.save();

    // 如果设置为默认，重新加载 AI 服务配置
    if (config.isDefault) {
      await aiAnalysisService.loadConfig();
    }

    res.json({
      message: 'AI 配置创建成功',
      config: {
        ...config.toObject(),
        apiKey: undefined,
        apiKeyPreview: apiKey && apiKey.length > 10 
          ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
          : '******'
      }
    });
  } catch (error) {
    console.error('创建 AI 配置失败:', error);
    res.status(500).json({ error: '创建配置失败', message: error.message });
  }
});

// 更新 AI 配置（仅管理员）
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, provider, apiKey, model, apiUrl, isDefault, enabled, extraConfig } = req.body;

    const config = await AIConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ error: '配置不存在' });
    }

    // 验证提供商
    if (provider && !AI_PROVIDERS[provider]) {
      return res.status(400).json({ error: '不支持的 AI 提供商' });
    }

    // 更新字段
    if (name) config.name = name;
    if (description !== undefined) config.description = description;
    if (provider) config.provider = provider;
    if (apiKey) config.apiKey = apiKey;
    if (model) config.model = model;
    if (apiUrl) config.apiUrl = apiUrl;
    if (isDefault !== undefined) config.isDefault = isDefault;
    if (enabled !== undefined) config.enabled = enabled;
    if (extraConfig) config.extraConfig = extraConfig;
    config.updatedBy = req.user._id;

    await config.save();

    // 如果更新的是默认配置，重新加载 AI 服务配置
    if (config.isDefault) {
      await aiAnalysisService.loadConfig();
    }

    res.json({
      message: 'AI 配置更新成功',
      config: {
        ...config.toObject(),
        apiKey: undefined,
        apiKeyPreview: config.apiKey && config.apiKey.length > 10
          ? `${config.apiKey.substring(0, 6)}...${config.apiKey.substring(config.apiKey.length - 4)}`
          : (config.apiKey ? '******' : null)
      }
    });
  } catch (error) {
    console.error('更新 AI 配置失败:', error);
    res.status(500).json({ error: '更新配置失败', message: error.message });
  }
});

// 删除 AI 配置（仅管理员）
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({ error: '配置不存在' });
    }

    // 如果是默认配置，不允许删除
    if (config.isDefault) {
      return res.status(400).json({ error: '不能删除默认配置，请先设置其他配置为默认' });
    }

    await config.deleteOne();

    res.json({
      message: 'AI 配置删除成功'
    });
  } catch (error) {
    console.error('删除 AI 配置失败:', error);
    res.status(500).json({ error: '删除配置失败', message: error.message });
  }
});

// 设置默认配置（仅管理员）
router.post('/:id/set-default', authenticate, authorize('admin'), async (req, res) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({ error: '配置不存在' });
    }

    // 设置为默认
    config.isDefault = true;
    config.enabled = true;
    await config.save();

    // 重新加载 AI 服务配置
    await aiAnalysisService.loadConfig();

    res.json({
      message: '默认配置设置成功',
      config: {
        ...config.toObject(),
        apiKey: undefined
      }
    });
  } catch (error) {
    console.error('设置默认配置失败:', error);
    res.status(500).json({ error: '设置默认配置失败', message: error.message });
  }
});

// 测试 AI 配置
router.post('/test', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { provider, model, apiUrl, apiKey, extraConfig, configId } = req.body;
    
    // 如果提供了 configId，从数据库加载配置进行测试
    if (configId) {
      const config = await AIConfig.findById(configId);
      if (!config) {
        return res.json({
          success: false,
          error: '配置不存在',
          message: '未找到指定的配置'
        });
      }
      
      // 使用数据库配置进行测试
      const result = await testAIConnection({
        provider: config.provider,
        model: config.model,
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
        extraConfig: config.extraConfig || {}
      });
      
      return res.json(result);
    }
    
    // 如果提供了测试配置，使用临时配置
    if (provider && model && apiUrl) {
      const result = await testAIConnection({
        provider,
        model,
        apiUrl,
        apiKey: apiKey || null,
        extraConfig: extraConfig || {}
      });
      
      return res.json(result);
    }
    
    // 否则使用默认配置进行测试
    await aiAnalysisService.loadConfig();
    
    if (!aiAnalysisService.enabled) {
      return res.json({ 
        success: false,
        error: 'AI 分析未启用',
        message: '请先配置 AI 服务'
      });
    }

    // 测试分析
    const testResult = await aiAnalysisService.analyzeError({
      message: 'Test error: Cannot read property of undefined',
      type: 'global_error',
      level: 'error'
    });

    res.json({
      success: testResult.success,
      message: testResult.success ? `AI 配置测试成功 (${aiAnalysisService.provider})` : 'AI 配置测试失败',
      provider: aiAnalysisService.provider,
      model: aiAnalysisService.model
    });
  } catch (error) {
    console.error('测试 AI 配置失败:', error);
    res.json({ 
      success: false,
      error: '测试失败',
      message: error.message
    });
  }
});

module.exports = router;
