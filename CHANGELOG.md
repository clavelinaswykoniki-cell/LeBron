# Changelog

本项目所有显著变更记录在此文件中。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [v2.1] - 2026-05-15 - 进行中

- 10 个并行 subagent 任务（工程 / 内容 / UX / 分发）
- GitHub Actions CI（5 个测试自动化）
- 新增 25+ 反驳卡（5 黑点 + 20 球星对比）
- 扩展卡 JSON（events / data / causes / background / analysis）
- 搜索历史 + 收藏功能
- 分享卡片生成
- 首页 onboarding 引导
- LANDING_PAGE.html + PRESS_KIT + ROADMAP

## [v2.0] - 2026-05-15 - Fun + Polish

- 5 个娱乐功能：复制爽感 / 23 号彩蛋 / 段位系统 / 勋章 / 球迷测试 H5
- 3 个完善功能：关于页 / 隐私页 / 错误兜底
- 4 个新页面：easter / about / quiz / privacy
- 修了 6 个 UI bug + 3 张 docx 卡 review_needed approved
- 测试从 4 → 5（加 test:progression）
- devils-advocate critique 19/20 PASS

## [v1.0] - 2026-05-10 - 基础版

- 147 张反驳卡 + 432 别名 + 30 分类
- 本地匹配 + fallback
- 4 种回复模式（短刀 / 封口 / 长拆 / 口播）
- CloudBase AI 增强可选路径（DeepSeek v4-flash）
- 4 个测试（check:syntax / test:match / test:corpus / test:ai-fallback）
