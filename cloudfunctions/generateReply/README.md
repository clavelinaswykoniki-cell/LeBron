# generateReply 云函数

CloudBase 云函数占位结构，用于小程序前端调用 DeepSeek 生成增强反驳。

## 环境变量

必须在 CloudBase 控制台配置：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
```

可选：

```text
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_THINKING=disabled
```

不要把真实 API Key 写进代码、README、提交记录或小程序前端。

## 输入

```json
{
  "userQuery": "乔丹6-0所以詹姆斯不配历史第二",
  "matchedCard": {},
  "corePosition": "詹姆斯不是完美球员，但至少是 NBA 历史第二。"
}
```

## 输出

```json
{
  "ok": true,
  "model": "deepseek-v4-pro",
  "reply": {
    "short_reply": "",
    "long_reply": "",
    "one_liner": "",
    "video_script": ""
  },
  "usage": null
}
```

## 前端调用方向

```js
wx.cloud.callFunction({
  name: "generateReply",
  data: {
    userQuery,
    matchedCard,
    corePosition
  }
})
```
