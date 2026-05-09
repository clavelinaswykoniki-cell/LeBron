# CloudBase + DeepSeek 接入计划

第一版只做本地语料库。DeepSeek/豆包 API Key 不能放进小程序前端。

## 阶段 2 结构

```text
miniprogram
  -> wx.cloud.callFunction("generateReply")
cloudfunctions/generateReply
  -> DeepSeek / 豆包 API
```

## 云函数输入

```json
{
  "userQuery": "8分",
  "matchedCard": {},
  "corePosition": "詹姆斯不是完美球员，但至少是 NBA 历史第二。"
}
```

## 云函数输出

```json
{
  "short_reply": "",
  "long_reply": "",
  "one_liner": "",
  "video_script": ""
}
```

## Prompt 原则

- 不要把全部语料塞进 prompt。
- 只发送用户输入、命中的反驳卡、必要核心立场。
- API Key 放 CloudBase 环境变量，例如 `DEEPSEEK_API_KEY`。
- 模型可先用 `deepseek-v4-flash`，后续按效果切到 `deepseek-v4-pro`。

## 安全边界

- 不生成辱骂、人身攻击、攻击家人私生活内容。
- 不编造具体数据。
- 不确定事实要求提示核对。
- 只围绕篮球观点和评价标准反驳。
