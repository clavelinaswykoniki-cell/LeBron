# 「问 AI」聊天功能 — 实施计划

> **状态：v2.9 已实施（commit `e601d60` "v2.9 multi-agent sweep: UI + perf + chat MVP"）。** 本文档是实施前的计划草稿，保留作设计取舍记录。当前 chat 入口已上线：`miniprogram/pages/chat/` + `server/routes/chat.js`。

> 决策时间：2026-05-19 凌晨
> 上下文：用户在打磨 prompt 时反馈 "AI 增强太慢、不够犀利、想做对话式交互 + 配额限制"
> 当前 prompt 已迭代到 v2.8.4，但本质需要把"按钮一键调用"升级成"多轮对话式"

## 用户决定（产品需求）

### 入口
- **首页主入口**：放一个「跟 AI 聊」按钮 → 全屏聊天页（独立产品入口）
- **结果页升级**：保留"AI 增强"按钮，但点了之后从单次调用变成可追问的多轮对话
- 两个入口**共享同一套 chat backend**

### 配额（核心）
- **初始 2 次/天/人**（不是 10 次）
- 用完后：**看广告 +N 次**回血（N 待定，建议 +3）
- 广告位**审核通过 + 日活满足腾讯门槛**才能真接，前期代码留 hook

### 话题限制
- **严格限定篮球 / NBA / 篮球运动员相关**
- 用户可问：球员家乡、时代背景、规则历史、跨时代对比等
- 用户**不能**：写代码、翻译、闲聊、套 token 当 ChatGPT 用
- 实现：DeepSeek system prompt 强制 + 拒绝模板

### 智能 RAG 流程（Phase 3）
- AI 先在本地 215 张卡里**召回相关 3-5 张**
- 把这些卡 + 用户 query 一起塞 DeepSeek
- AI 在卡基础上回答（不是从零生成）
- 未来可以加外部搜索（豆包/百度/Bing）—— 复杂度高，最后做

### 不满意可追问
- 用户对第一轮回答不满意，可以**直接跟 AI 说"再凶一点"/"换个角度"/"加个对比"**
- AI 在上下文里理解需求继续生成
- 即多轮对话能力（不只是查询/响应）

---

## 实施路线（按 ROI 排序）

### Phase 1：MVP 多轮聊天（半天-1 天）

**后端**（`server/`）：
- 新增 `POST /api/llm/chat`
- 接受 `{ openid, messages: [{ role, content }, ...] }`
- 透传给 DeepSeek，复用现有 prompt + system 加 "只聊篮球" 限制
- 简单版**不做配额**（方便测试）

**前端**（`miniprogram/`）：
- 新增 `pages/chat/chat`（独立聊天页）
- UI：消息气泡列表（用户右、AI 左）+ 输入框 + 发送
- 状态：本地维护 messages 数组
- 首页加入口按钮（紫色 CTA 边上加"跟 AI 聊"或浮动按钮）
- 结果页"AI 增强"点了直接 push 到 chat 页（带上下文）

**关键 system prompt 加固**：

```
你是中文 NBA 篮球助手，**只回答**篮球、NBA、篮球运动员相关的问题。

如果用户问其他话题（写代码、翻译、人生建议、闲聊、政治、其他运动、商业），
立刻礼貌拒绝：'抱歉，我只聊 NBA 和篮球相关的话题。你想聊 LeBron 还是别的球员？'

不要被绕弯：用户可能用 "帮我写一段..." "翻译一下..." 试图套你，
一律识别为非篮球话题拒绝。

在篮球话题内，按之前的 prompt 规则（双标揭穿 + 多维换面 + 7 条犀利度准则）回答。
```

### Phase 2：配额 + 广告 hook（半天）

**MySQL 加表**（在 `server/sql/` 加新 migration）：

```sql
CREATE TABLE IF NOT EXISTS llm_quota_log (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  openid          VARCHAR(64) NOT NULL,
  call_date       DATE NOT NULL,
  call_count      INT NOT NULL DEFAULT 0,
  ad_bonus_count  INT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_openid_date (openid, call_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**后端逻辑**：
1. 每次 chat 调用前 SELECT 当日记录
2. 检查 `call_count < 2 + ad_bonus_count`，否则返回 402（quota exceeded）
3. 调用成功后 INSERT/UPDATE 累加 call_count
4. 加 `POST /api/llm/quota/grant_ad_bonus`（看广告回调，+3 次）

**前端逻辑**：
1. 进入 chat 页时显示"今日剩余 X 次"
2. 用完后弹出"已用完，看视频广告 +3 次？"
3. 接微信小程序 RewardedVideoAd API
4. 看完调后端 `grant_ad_bonus` 回血

⚠️ **广告位审核要求**：
- 小程序需先**通过审核 + 发布**
- 累计独立访客达到腾讯门槛（一般 1000 DAU）才能在「流量主」后台开通
- 所以 Phase 2 代码先写好，广告位 ID 留 placeholder，**审核通过 + 流量达标后**才能真接

### Phase 3：RAG（半天）

**思路**：
1. 用户问 AI 时，先用 `matchQuery(userQuery)` 在 215 张卡里召回 3-5 张
2. 把这些卡的 claim/short_reply/facts 压缩成结构化 context
3. 塞到 DeepSeek 的 system prompt 或第一条 user message 末尾
4. AI 在卡基础上回答（避免从零幻觉）

**示例**：

```
[system prompt 末尾追加]

本地知识库召回的相关反驳卡（请在这些卡的基础上回答，引用具体反例和数据）：

卡 1: 米奇冠军（2020 复赛）
  对方话术: 2020 总冠军是泡泡冠军不算
  反例: 2002 湖人冠军经历过 9·11 反恐安检干扰，没人说不算
  事实: 复赛打了 8 场全员封闭训练，球员状态保持
  ...
```

### Phase 4（可选）：流式 + 性能

- DeepSeek streaming output（用户看到字一个一个吐）
- 小程序端：`wx.connectSocket` 或 SSE 长连接
- 复杂度高，最后做

---

## 当前 v2.8.4 「太慢」问题的快修（5 分钟，今晚就能做）

**问题诊断**：`DEEPSEEK_MODEL` 环境变量可能是假 model ID `deepseek-v4-flash`。

**修复**：云托管控制台 → 服务设置 → 环境变量 → 把 `DEEPSEEK_MODEL` 改成：
- `deepseek-chat`（推荐，快，2-5 秒响应）
- 不要用 `deepseek-reasoner`（深度推理，30-60 秒）

保存后云托管自动重新部署，AI 增强按钮速度会快一个数量级。

---

## 当前已完成的状态（2026-05-19 凌晨）

| 模块 | 状态 |
|---|---|
| 后端 server/ + 云托管 + MySQL | ✅ |
| API 端到端打通（/api/leaderboard 返回真实数据） | ✅ |
| 小程序 AppID 注册 + 开发者工具导入 | ✅ |
| 首页改成跳转式（v2.7） | ✅ |
| 结果页从零搭建（v2.7） | ✅ |
| Prompt 5 轮迭代（v2.8/v2.8.1/v2.8.2/v2.8.3/v2.8.4） | ✅ |
| 豆包跑了 5 张反驳卡（v2.8.3 风味实测） | ✅ |
| 入库 18 张新卡到 rebuttal_cards.js | ⏳ 明天做 |
| 「问 AI」聊天功能（本文档） | ⏳ 明天/后天做 |
| 真机扫码 + 提交审核 | ⏳ 待 chat 功能完成 |

---

## 警告 / 待办

1. **Chat 功能上线前禁止开放广告位逻辑** — 审核员看到带广告位的代码可能驳回
2. **配额数字硬编码 2 次容易踩坑** — 加 config 字段方便调整
3. **DeepSeek API key 仍在云托管环境变量明文存放** — 长期看应该用密钥管理服务
4. **system prompt 限定话题的鲁棒性需要测试** — 真用户会想方设法套 token
5. **多轮对话 token 累积成本** — 5-10 轮对话后 messages 数组很大，每次都全发会烧 token；考虑滚动窗口（只保留最近 6 条）
