# LeBron 詹黑逻辑拆解器

> 微信小程序练手项目。把评论区常见的 LeBron 詹黑话术拆解成结构化反驳卡，配套段位 / 测试 H5 / 彩蛋等娱乐组件。

**v2.0** · 150 张反驳卡 · 441 条别名 · 38 类争议分类 · 紫金湖人主题

---

## 30 秒了解

打开小程序 → 输入"8分释兵权"或者点首页热梗 → 出反驳卡 → 一键复制怼回评论区。

附带功能：
- 🏆 **段位 / 勋章系统**：阅读 / 复制累计解锁 5 段位 + 6 勋章（青铜詹蜜 → 王者詹皇）
- 🧠 **球迷测试 H5**：5 题判断你是几级詹蜜（中性化打分，可分享结果）
- 👑 **23 号秘藏**：长按 hero 球衣触发彩蛋（生涯里程碑墙）
- 🛡️ **隐私页**：合规说明，本地存储，零数据收集
- 📢 **复制反馈**：震动 + Toast + 金光特效

---

## 跑通

```bash
git clone <repo-url>
cd lebron-rebuttal-miniapp
npm install
```

1. 打开**微信开发者工具**
2. 导入 `lebron-rebuttal-miniapp` 目录
3. AppID 选**测试号**
4. 编译 → 模拟器或真机预览即可

---

## 技术栈

| 层 | 内容 |
|---|---|
| 框架 | 微信小程序原生（无 Taro / uni-app） |
| UI | [TDesign Mini-Program](https://tdesign.tencent.com/miniprogram) v1.14 |
| 状态 | Page 内 `data` + `wx.setStorageSync`（段位 / 勋章持久化） |
| 后端 | 可选 CloudBase 云函数 `generateReply`（DeepSeek v4-flash），不可用时**本地兜底** |
| 测试 | Node.js 脚本（syntax check / match / corpus / fallback / progression unit） |

零新依赖，零构建步骤。

---

## 数据规模

| 指标 | 数量 |
|---|---|
| 反驳卡 | **150 张**（base 100 + docx 50） |
| 别名 / 短梗 | **441 条** |
| 争议分类 | **38 类** |
| 黑点素材库 | **10 张深度拆解**（`docs/raw-perspectives/`） |
| 已实现页面 | **5 个**（index / about / quiz / easter / privacy） |

---

## 功能列表

### v1.0 核心
- ✅ 黑点别名匹配 + fallback 通用反驳
- ✅ 30+ 类细分分类
- ✅ 4 种回复模式：短刀 / 封口 / 长拆 / 口播
- ✅ 一键复制 + 整张复制 + 全部复制
- ✅ 分类筛选 + 随机一条
- ✅ AI 增强（可选，需 CloudBase + DeepSeek Key）
- ✅ 模糊匹配 + 黑称识别

### v2.0 娱乐 + 完善
- ✅ **复制反馈包**：震动 + 金光特效 + Toast 三合一（`utils/feedback.js`）
- ✅ **段位 / 勋章系统**：5 段位 + 6 勋章，本地持久化（`utils/progression.js`）
- ✅ **球迷测试 H5**：5 题中性化测试 → "X 级詹蜜 / 中立观察者 / X 级詹黑" 结果（`pages/quiz/`）
- ✅ **23 号秘藏**：长按首页球衣触发，里程碑 + 巨型水印（`pages/easter/`）
- ✅ **关于页**：段位墙 + 勋章墙 + 数据看板（`pages/about/`）
- ✅ **隐私政策页**：5 段标准模板（`pages/privacy/`）
- ✅ **错误兜底**：复制失败 / 空 query / 跳转失败 Toast（`utils/safety.js`）

---

## 跑测试

```bash
npm run check:syntax    # 静态检查 + UI 契约
npm run test:match      # 50 个高频黑点 → 命中卡匹配验证
npm run test:corpus     # 语料完整性 + 别名数 + review_needed 校验
npm run test:ai-fallback # CloudBase 失败时本地兜底验证
npm run test:progression # progression.js 单元测试（7 个用例）
```

**5/5 通过**即可。

---

## 测试词（可以直接搜）

```
8分 / 米奇冠军 / 科比五冠 / Excel球王 / 老张跑路 / 摊皇不回防
库里改变篮球 / LeGM / 基石冠军 / 没有得分王 / 乔丹6-0 / 宇宙勇
联盟保送 / 历史第二十 / 文班未来超詹 / 乔丹没抢七 / 科比一人一城
库里全票MVP / 邓肯低调 / 杜兰特单挑 / 约基奇组织
```

---

## 文件结构

```
miniprogram/
├── pages/
│   ├── index/           # 首页：搜索 / 卡片 / 段位浮条 / 菜单
│   ├── about/           # 关于页：段位 + 勋章墙 + 数据看板
│   ├── quiz/            # 球迷测试 5 题 H5
│   ├── easter/          # 23 号秘藏（长按 hero 触发）
│   └── privacy/         # 隐私政策
├── utils/
│   ├── matchQuery.js     # 本地匹配 + fallback
│   ├── normalizeQuery.js # 用户输入归一化
│   ├── llmProvider.js    # CloudBase 调用封装
│   ├── promptBuilder.js  # AI prompt 组装
│   ├── feedback.js       # v2.0 触感反馈
│   ├── progression.js    # v2.0 段位 / 勋章
│   └── safety.js         # v2.0 安全包装
├── data/
│   ├── arsenal.js        # 统一数据入口
│   ├── rebuttal_cards*.js # 反驳卡 (3 文件)
│   ├── aliases*.js        # 别名映射 (3 文件)
│   ├── categories.js      # 分类定义
│   └── ...
└── app.json              # 5 页面注册

docs/
├── context-compact.md    # 给 AI 的项目上下文
├── raw-perspectives/     # 黑点素材库（10 卡 + 工作流 doc）
├── superpowers/plans/    # 实施 plan 历史
├── SCREENSHOT_GUIDE.md   # 截图指南（v2.0）
└── DEMO_SCRIPT.md        # 30 秒演示稿（v2.0）

cloudfunctions/
└── generateReply/        # CloudBase 云函数（可选 AI 增强）

scripts/
├── test-match.js
├── test-corpus-integrity.js
├── test-ai-enhance-fallback.js
├── test-ui-contract.js
├── test-progression.js   # v2.0 单测
└── convert-docx-corpus.js
```

---

## 项目约束

- ❌ **不接 CloudBase / 数据库**（除非显式启用 AI 增强）
- ❌ **不提交真实 API key**（仅在 CloudBase 环境变量 `DEEPSEEK_API_KEY`）
- ❌ **黑称只做 alias 匹配**，不主动输出辱骂内容
- ✅ **本地兜底优先**，AI 增强失败必须 fallback 到本地卡
- ✅ **微信审核合规**：无敏感词主动 CTA，无敏感内容，篮球讨论性质

---

## 截图

> 截图位（用微信开发者工具截后放 `docs/screenshots/`，README 引用相对路径）。
> 截图清单见 [SCREENSHOT_GUIDE.md](./docs/SCREENSHOT_GUIDE.md)。

| 截图 | 位置 |
|---|---|
| 首页 hero + 卡片 | `docs/screenshots/01-home.png` |
| 段位 + 勋章墙 | `docs/screenshots/02-about.png` |
| 23 号彩蛋 | `docs/screenshots/03-easter.png` |
| 球迷测试 | `docs/screenshots/04-quiz.png` |
| 隐私页 | `docs/screenshots/05-privacy.png` |

---

## 项目目标 / 免责

练手项目 + 作品集。所有篮球观点仅为娱乐讨论，不代表 NBA 官方立场，不构成对任何球员的人身攻击。

License: MIT
