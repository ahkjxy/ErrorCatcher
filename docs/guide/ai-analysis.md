# AI 智能错误分析

ErrorCatcher 集成了 AI 智能分析功能，可以自动分析错误的根本原因，提供修复建议和预防措施。

## 功能特性

### 🔍 智能诊断
- 自动识别错误的根本原因
- 分析错误类别（网络错误、代码错误、配置错误等）
- 提供置信度评分

### 💡 修复建议
- 根据错误类型提供具体的修复方案
- 按优先级排序（高、中、低）
- 包含详细的实施步骤

### 🛡️ 预防建议
- 提供最佳实践建议
- 帮助避免类似错误再次发生

### 🔗 关联分析
- 自动查找相似错误
- 识别系统性问题

## 支持的 AI 服务提供商

ErrorCatcher 支持多个主流 AI 服务提供商，您可以根据需求选择：

| 提供商 | 推荐模型 | 特点 |
|--------|---------|------|
| OpenAI | GPT-5.4 | 2026 年最新旗舰，原生支持电脑操作 |
| Google Gemini | Gemini 3.1 Pro | ARC-AGI-2 得分 77.1%，多模态能力强 |
| Anthropic Claude | Claude Opus 4.6 | 1M 上下文，编程领先 |
| DeepSeek | DeepSeek Chat/Reasoner | 响应速度快，深度推理能力强 |
| 阿里通义千问 | Qwen 3.5 397B | 中文理解与文化梗远超国外模型 |
| 月之暗面 (Moonshot) | Kimi K2.5 | 长上下文处理能力强 |
| 稀宇科技 (MiniMax) | MiniMax M2.5 | 高质价比，比 Claude 便宜 95% |
| 阶跃星辰 (Stepfun) | Step 3.5 Flash | Agentic 旗舰模型，推理速度 350TPS |
| NVIDIA | Nemotron 3 Super | MoE 架构，多智能体系统专用 |
| 智谱 AI (Zhipu) | GLM-5 | 国产闭源代表，综合性能强劲 |
| xAI (Grok) | Grok-3 | 实时资讯专家，接入 X 数据流 |

## 配置

### 通过管理界面配置（推荐）

这是最简单的配置方式，适合大多数用户：

1. 以管理员身份登录 ErrorCatcher 管理后台
2. 点击左侧导航栏的 "设置"
3. 在设置页面左侧菜单中选择 "AI 分析配置"
4. 选择 AI 服务提供商（OpenAI、DeepSeek、Claude、Gemini 等）
5. 选择模型（推荐使用最新的旗舰模型）
6. 填写以下配置信息：
   - **API Key**（必填）：从对应服务商平台获取
   - **API URL**（必填）：默认已填写，如使用代理可修改
   - **额外配置**（可选）：某些提供商需要额外参数（如 MiniMax 的 Group ID）
7. 点击 "测试连接" 按钮验证配置是否正确
8. 测试成功后，点击 "保存配置" 按钮

**重要说明**：
- 配置保存在数据库中，不需要修改环境变量
- 测试连接会使用表单中的当前配置，无需先保存
- 测试连接 API 统一返回 200 状态码，通过响应体中的 `success` 字段判断成功或失败
- 如果测试失败，`message` 字段会包含 AI 服务商返回的详细错误信息

### 获取 API Key

各服务商的 API Key 获取地址：

- **OpenAI**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **DeepSeek**: [https://platform.deepseek.com](https://platform.deepseek.com)
- **Claude**: [https://console.anthropic.com](https://console.anthropic.com)
- **Google Gemini**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **通义千问**: [https://dashscope.aliyuncs.com](https://dashscope.aliyuncs.com)
- **Moonshot AI**: [https://platform.moonshot.cn](https://platform.moonshot.cn)
- **MiniMax**: [https://api.minimax.chat](https://api.minimax.chat)
- **智谱 AI**: [https://open.bigmodel.cn](https://open.bigmodel.cn)

### 推荐模型选择

根据不同需求选择合适的模型：

**性价比优先**：
- MiniMax M2.5 - 比 Claude 便宜 95%，SWE-Bench 80.2%
- DeepSeek Chat - 响应速度快，成本低
- Qwen 3.5 397B - 中文理解优秀，性价比高

**性能优先**：
- OpenAI GPT-5.4 - 最新旗舰，100万 token 上下文
- Claude Opus 4.6 - 编程能力领先，1M 上下文
- Gemini 3.1 Pro - ARC-AGI-2 得分 77.1%，多模态能力强

**推理能力优先**：
- DeepSeek Reasoner - 深度推理模式
- Qwen 3 Max Thinking - 闭源代表，深度推理
- Kimi K2.5 Thinking - 长上下文 + 深度思考

**速度优先**：
- Gemini 3.1 Flash-Lite - 速度最快，$0.25/百万 tokens
- MiniMax M2.5 Lightning - 100 tokens/s
- Step 3.5 Flash - 推理速度 350TPS

## 使用方法

### 在错误详情页面使用

1. 打开任意错误详情页面
2. 点击 "AI 分析" 标签
3. 点击 "开始 AI 分析" 按钮
4. 等待几秒钟，查看分析结果

### 通过 API 使用

#### 分析单个错误

```bash
POST /api/ai/errors/:errorId/analyze
Authorization: Bearer <token>

# 强制重新分析
POST /api/ai/errors/:errorId/analyze
Content-Type: application/json
{
  "force": true
}
```

#### 获取分析结果

```bash
GET /api/ai/errors/:errorId/analysis
Authorization: Bearer <token>
```

#### 批量分析

```bash
POST /api/ai/projects/:projectId/analyze-batch
Authorization: Bearer <token>
Content-Type: application/json
{
  "limit": 50,
  "onlyUnanalyzed": true
}
```

#### 提交反馈

```bash
POST /api/ai/analysis/:analysisId/feedback
Authorization: Bearer <token>
Content-Type: application/json
{
  "helpful": true,
  "rating": 5,
  "comment": "分析很准确，帮助很大"
}
```

#### 管理 AI 配置（仅管理员）

获取当前配置：
```bash
GET /api/ai/config
Authorization: Bearer <token>
```

更新配置：
```bash
PUT /api/ai/config
Authorization: Bearer <token>
Content-Type: application/json
{
  "apiKey": "sk-your-new-key",
  "model": "gpt-4o-mini",
  "apiUrl": "https://api.openai.com/v1"
}
```

测试配置：
```bash
POST /api/ai/config/test
Authorization: Bearer <token>
```

## 分析结果示例

```json
{
  "rootCause": "API 请求超时导致的网络错误",
  "category": "网络错误",
  "confidence": 0.85,
  "analysis": "根据错误堆栈和状态码分析，这是一个典型的 API 超时问题。请求在等待服务器响应时超过了设定的超时时间。",
  "possibleReasons": [
    "后端服务响应缓慢",
    "网络连接不稳定",
    "请求超时时间设置过短",
    "服务器负载过高"
  ],
  "suggestedFixes": [
    {
      "title": "增加请求超时时间",
      "description": "将 axios 的 timeout 配置从 5000ms 增加到 10000ms",
      "priority": "high"
    },
    {
      "title": "添加重试机制",
      "description": "使用 axios-retry 库实现自动重试",
      "priority": "medium"
    },
    {
      "title": "优化后端性能",
      "description": "检查后端 API 的响应时间，优化数据库查询",
      "priority": "medium"
    }
  ],
  "preventionTips": [
    "为所有 API 请求设置合理的超时时间",
    "实现请求重试和降级策略",
    "监控 API 响应时间，及时发现性能问题"
  ],
  "relatedErrors": [
    {
      "_id": "...",
      "message": "Request timeout",
      "timestamp": "2024-03-10T10:30:00Z"
    }
  ],
  "model": "gpt-4o-mini",
  "analyzedAt": "2024-03-10T10:35:00Z"
}
```

## 成本估算

基于 OpenAI 的定价（2024年3月）：

| 模型 | 输入价格 | 输出价格 | 单次分析成本 |
|------|---------|---------|-------------|
| gpt-4o-mini | $0.15/1M tokens | $0.60/1M tokens | ~$0.001 |
| gpt-4o | $5.00/1M tokens | $15.00/1M tokens | ~$0.03 |
| gpt-3.5-turbo | $0.50/1M tokens | $1.50/1M tokens | ~$0.003 |

**示例**：
- 每天分析 100 个错误
- 使用 gpt-4o-mini
- 月成本约：100 × 30 × $0.001 = $3

## 最佳实践

### 1. 选择性分析

不是所有错误都需要 AI 分析：

- ✅ 新出现的错误
- ✅ 高频错误
- ✅ 影响用户多的错误
- ❌ 已解决的错误
- ❌ 重复的简单错误

### 2. 缓存分析结果

系统会自动缓存分析结果，避免重复分析相同错误。

### 3. 批量分析

使用批量分析 API 在非高峰时段分析历史错误：

```javascript
// 每天凌晨分析未分析的错误
cron.schedule('0 2 * * *', async () => {
  await axios.post('/api/ai/projects/xxx/analyze-batch', {
    limit: 100,
    onlyUnanalyzed: true
  });
});
```

### 4. 反馈机制

鼓励团队成员对 AI 分析提供反馈，帮助改进分析质量。

## 故障排查

### AI 分析不可用

**问题**：点击分析按钮没有反应

**解决方案**：
1. 检查 `OPENAI_API_KEY` 是否配置
2. 检查 API Key 是否有效
3. 查看服务器日志：`tail -f api/logs/error.log`

### 分析速度慢

**问题**：分析需要很长时间

**解决方案**：
1. 切换到更快的模型（如 gpt-4o-mini）
2. 检查网络连接
3. 考虑使用国内 API 代理

### 分析质量不佳

**问题**：AI 给出的建议不准确

**解决方案**：
1. 确保错误信息完整（包含堆栈跟踪）
2. 提供更多上下文信息
3. 尝试使用更强大的模型（如 gpt-4o）
4. 提交反馈帮助改进

## 隐私和安全

### 数据处理

- 错误信息会发送到 OpenAI API 进行分析
- 建议在发送前脱敏敏感信息（如密码、Token）
- 分析结果存储在您的数据库中

### 数据脱敏

系统会自动截断过长的堆栈信息（最多 2000 字符），但建议：

1. 不要在错误消息中包含敏感信息
2. 使用环境变量管理密钥
3. 在生产环境启用数据脱敏

### 本地部署方案

如果对数据隐私有严格要求，可以：

1. 使用本地部署的大模型（如 Llama、ChatGLM）
2. 修改 `aiAnalysisService.js` 适配本地 API
3. 完全在内网环境运行

## 高级配置

### 自定义提示词

编辑 `api/src/services/aiAnalysisService.js` 中的 `_buildAnalysisPrompt` 方法：

```javascript
_buildAnalysisPrompt(errorData) {
  // 自定义提示词逻辑
  let prompt = `请分析以下错误...`;
  
  // 添加项目特定的上下文
  if (errorData.projectId === 'xxx') {
    prompt += `\n注意：这是一个 Vue 3 项目...`;
  }
  
  return prompt;
}
```

### 集成其他 AI 服务

支持集成其他 AI 服务（如 Claude、文心一言等）：

```javascript
// 修改 aiAnalysisService.js
async analyzeError(errorData) {
  // 使用 Claude API
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-sonnet-20240229',
      messages: [...]
    },
    {
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      }
    }
  );
  // ...
}
```

## 测试

运行测试脚本验证 AI 分析功能：

```bash
cd api
node scripts/test-ai-analysis.js
```

## 常见问题

**Q: 是否支持中文分析？**  
A: 是的，系统会要求 AI 使用中文返回分析结果。

**Q: 可以离线使用吗？**  
A: 需要网络连接到 OpenAI API。如需离线，请部署本地大模型。

**Q: 分析结果会保存多久？**  
A: 永久保存，除非手动删除错误记录。

**Q: 如何控制成本？**  
A: 使用 gpt-4o-mini 模型，只分析重要错误，启用结果缓存。

**Q: 支持哪些语言的错误？**  
A: 支持所有编程语言的错误，但对 JavaScript/TypeScript 的分析效果最好。

## 反馈和改进

如果您有任何建议或发现问题，欢迎：

1. 在错误详情页面提交反馈
2. 提交 GitHub Issue
3. 联系技术支持

---

更新时间：2024-03-10
