# GitHub Actions Workflows

- `ci.yml`：每次 push 到 `main` 或针对 `main` 的 pull request 时触发。
- 在 `ubuntu-latest` 上以 Node 18 / 20 矩阵跑：语法检查 / 匹配测试 / 语料完整性 / AI 兜底 / 段位单测。
- 任一步失败即整次 run 失败；可在 GitHub 仓库的 **Actions** 选项卡查看每个 job 的步骤日志。
- 本地复现：`npm run check:syntax && npm run test:match && npm run test:corpus && npm run test:ai-fallback && npm run test:progression`。
