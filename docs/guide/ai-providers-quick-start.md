# AI 提供商快速开始指南

## 快速配置

### 1. 访问配置页面

登录管理后台后，点击侧边栏的 **AI 配置**（在用户管理下方）

### 2. 选择提供商

根据您的需求选择合适的 AI 服务提供商：

#### 推荐选择

**预算有限？**
- 🌟 **DeepSeek** - 性价比之王，¥0.003/次
- 🆓 **Gemini** - 免费额度，适合测试

**追求质量？**
- 🎯 **Claude 3.5 Sonnet** - 推理能力最强
- 🚀 **GPT-4o** - 综合能力强

**国内网络？**
- 🇨🇳 **DeepSeek** - 国内直连，速度快
- 🇨🇳 **通义千问** - 阿里云，有免费额度
- 🇨🇳 **智谱 AI** - 清华出品，有免费额度

### 3. 获取 API Key

点击对应提供商的链接获取 API Key：

| 提供商 | 获取地址 | 说明 |
|--------|---------|------|
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com/api_keys) | 注册即送额度 |
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) | 需要国际信用卡 |
| Gemini | [aistudio.google.com](https://aistudio.google.com/apikey) | 免费使用 |
| 文心一言 | [百度智能云](https://console.bce.baidu.com/qianfan/) | 需要 API Key + Secret Key |
| 通义千问 | [阿里云控制台](https://dashscope.console.aliyun.com/apiKey) | 有免费额度 |
| 智谱 AI | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) | 有免费额度 |
| Moonshot | [platform.moonshot.cn](https://platform.moonshot.cn/console/api-keys) | 长上下文专家 |
| Claude | [console.anthropic.com](https://console.anthropic.com/) | 需要国际信用卡 |

### 4. 填写配置

1. 选择 AI 服务提供商
2. 填写 API Key
3. 选择模型（推荐使用标注的推荐模型）
4. 确认 API URL（通常使用默认值）
5. 点击 **保存配置**

### 5. 测试连接

点击 **测试连接** 按钮，确认配置正确。

### 6. 开始使用

配置成功后，在任意错误详情页面点击 **AI 分析** 标签即可使用。

## 详细配置示例

### DeepSeek（推荐）

```
提供商：DeepSeek
API Key：sk-xxxxxxxxxxxxxxxx
模型：deepseek-chat
API URL：https://api.deepseek.com/v1/chat/completions
```

**优势**：
- ✅ 性价比极高（¥0.003/次）
- ✅ 国内直连，速度快
- ✅ 代码分析能力强
- ✅ 注册即送额度

### Gemini（免费）

```
提供商：Google Gemini
API Key：AIzaSyxxxxxxxxxxxxxxxx
模型：gemini-2.0-flash-exp
API URL：https://generativelanguage.googleapis.com/v1beta/models
```

**优势**：
- ✅ 完全免费
- ✅ Google 出品
- ✅ 多模态能力
- ✅ 适合测试

### 文心一言

```
提供商：文心一言 (百度)
API Key：xxxxxxxxxxxxxxxx
Secret Key：xxxxxxxxxxxxxxxx
模型：ERNIE-4.0-8K
API URL：https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro
```

**优势**：
- ✅ 中文能力强
- ✅ 有免费额度
- ✅ 国内服务稳定

### 通义千问

```
提供商：通义千问 (阿里云)
API Key：sk-xxxxxxxxxxxxxxxx
模型：qwen-max
API URL：https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

**优势**：
- ✅ 阿里云出品
- ✅ 有免费额度
- ✅ 中文能力优秀

### 智谱 AI

```
提供商：智谱 AI (GLM)
API Key：xxxxxxxx.xxxxxxxx
模型：glm-4-plus
API URL：https://open.bigmodel.cn/api/paas/v4/chat/completions
```

**优势**：
- ✅ 清华出品
- ✅ 有免费额度
- ✅ 中文能力强

## 常见问题

### Q: 哪个提供商最便宜？
A: DeepSeek 性价比最高（¥0.003/次），Gemini 完全免费。

### Q: 哪个提供商质量最好？
A: Claude 3.5 Sonnet 推理能力最强，GPT-4o 综合能力最好。

### Q: 国内网络哪个最快？
A: DeepSeek、文心一言、通义千问、智谱 AI 都是国内服务，速度都很快。

### Q: 可以随时切换提供商吗？
A: 可以，配置立即生效，无需重启服务。

### Q: 如何获取免费额度？
A: Gemini 完全免费，文心一言、通义千问、智谱 AI 注册后都有免费额度。

### Q: API Key 安全吗？
A: API Key 加密存储在数据库中，前端只显示预览（前7位...后4位）。

### Q: 配置错误怎么办？
A: 点击"测试连接"按钮可以验证配置是否正确，系统会提示具体错误。

### Q: 支持自定义 API 吗？
A: 支持，选择"自定义 API"提供商，填写您的 API 地址即可。

## 成本估算

### 每天分析 100 个错误

| 提供商 | 月成本 | 说明 |
|--------|--------|------|
| DeepSeek | ¥9 | 极高性价比 |
| Gemini | ¥0 | 完全免费 |
| OpenAI (gpt-4o-mini) | $3 | 约 ¥21 |
| 文心一言 | ¥72 | 有免费额度 |
| 通义千问 | ¥48 | 有免费额度 |
| 智谱 AI | ¥60 | 有免费额度 |
| Moonshot | ¥7.2 | 长上下文 |
| Claude | $54 | 约 ¥378 |

### 每天分析 1000 个错误

| 提供商 | 月成本 | 说明 |
|--------|--------|------|
| DeepSeek | ¥90 | 仍然很便宜 |
| Gemini | ¥0 | 可能受限 |
| OpenAI (gpt-4o-mini) | $30 | 约 ¥210 |
| 文心一言 | ¥720 | 需要充值 |
| 通义千问 | ¥480 | 需要充值 |
| 智谱 AI | ¥600 | 需要充值 |
| Moonshot | ¥72 | 性价比高 |
| Claude | $540 | 约 ¥3780 |

## 最佳实践

### 1. 选择性分析

不是所有错误都需要 AI 分析：

✅ **推荐分析**：
- 新出现的错误
- 高频错误
- 影响用户多的错误
- 难以定位的错误

❌ **不推荐分析**：
- 已解决的错误
- 重复的简单错误
- 明显的语法错误

### 2. 成本控制

- 使用 DeepSeek 或 Gemini 降低成本
- 启用结果缓存，避免重复分析
- 只分析重要错误

### 3. 质量优化

- 确保错误信息完整（包含堆栈跟踪）
- 提供足够的上下文信息
- 使用更强大的模型分析复杂问题

### 4. 多提供商策略

- 日常使用：DeepSeek / Gemini
- 复杂问题：Claude / GPT-4o
- 备用方案：配置多个提供商

## 下一步

配置完成后，您可以：

1. 📊 在错误详情页面使用 AI 分析
2. 📈 查看分析结果和建议
3. 💬 提供反馈帮助改进
4. 🔄 根据需要切换提供商

## 获取帮助

如有问题，请：

1. 查看 [完整文档](./ai-analysis.md)
2. 检查 API Key 是否正确
3. 使用"测试连接"功能诊断
4. 查看服务器日志

---

**提示**：推荐从 DeepSeek 或 Gemini 开始，它们性价比高且易于使用。
