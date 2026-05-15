# Contributing Guide

感谢你愿意为本项目贡献代码！请在提 PR 前阅读以下指南。

## 项目定位

本项目是练手 + 作品集项目，欢迎 PR 但保持简洁。我们追求小而精，不堆砌功能。如果你的想法会让项目偏离"个人作品集"的定位（比如引入重型框架、复杂状态管理、商业化模块），请先开 issue 讨论。

## 开发环境

- **Node.js** 18+ （建议使用 nvm 管理版本）
- **微信开发者工具**（最新稳定版）
- **npm install** 安装依赖

克隆后的第一步：

```bash
git clone <your-fork-url>
cd lebron-rebuttal-miniapp
npm install
```

然后用微信开发者工具打开项目根目录即可调试。

## 提交规范

- commit message 用英文 imperative（"Add X" / "Fix Y" / "Update Z"），不要写 "added"、"fixing" 之类的时态
- 一个 commit 只做一件事，不要把功能 + bugfix + 重构混在一起
- 跑 5 个测试通过再 commit（见下节"测试要求"）

好的 commit message 示例：

```
Add fallback handler for unknown alias
Fix tag overflow on quiz result page
Update changelog for v2.1 release
```

避免：

```
fixed stuff
WIP
update
```

## 测试要求

- 所有 PR 必须 **4 个本地测试 + GitHub Actions CI 全过**
- 本地跑：`npm run check:syntax`、`npm run test:match`、`npm run test:corpus`、`npm run test:ai-fallback`、`npm run test:progression`
- 新功能加单元测试覆盖，至少覆盖正常路径 + 1 个边界情况
- 改卡片内容（cards.json / aliases.json）必须跑 `test:corpus`，确保别名不冲突、覆盖率不退化

## 内容指南

- **不要加辱骂性 / 涉政 / 涉黄内容**——本项目是篮球观点讨论，不是骂战平台
- **黑称只做 alias 匹配，不主动 CTA**——黑称（如"詹密"、"詹黑"）只在用户输入时识别用于匹配卡片，绝不能出现在卡片正文、按钮、弹窗等主动展示位置
- **篮球观点必须 falsifiable**（可被事实反驳），不能纯主观——比如"勒布朗 FMVP 票数 vs 杜兰特"是可验证事实，"勒布朗最强"是纯主观。卡片观点必须能被反方拿数据怼回来，这样讨论才有意义

## PR 流程

1. **fork → branch → commit → push → PR**
   - 在你自己的 fork 上创建 feature branch（如 `feat/add-mvp-card` 或 `fix/quiz-overflow`）
   - 不要直接在 `main` 上提交
2. **PR 描述要包含：改了啥 / 为啥 / 怎么测的**
   - 改了啥：列出修改的文件 + 一句话说明
   - 为啥：解决什么问题，或满足什么需求
   - 怎么测的：本地测试结果截图或日志，CI 通过情况

我会尽量在 3 天内 review。感谢贡献！
