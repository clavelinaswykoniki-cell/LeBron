# LeBron Miniapp Compact Context

## Project Boundary

This is the LeBron rebuttal miniapp only.

Do not load or discuss:
- `../model-agent-ultra-station`
- multi-agent runtime / orchestration experiments
- Second Brain infrastructure
- other backend projects

Only work inside:

```text
/Users/happytang/Documents/New project/lebron-rebuttal-miniapp
```

## Current Product

Chinese WeChat mini-program prototype for rebutting common anti-LeBron arguments.

The product is not a LeBron praise bot. It is a logic teardown tool:
- identify short anti-LeBron keywords, black terms, and memes
- match them to rebuttal cards
- answer with facts, same-standard comparison, and logic critique
- keep language strong but basketball-focused
- avoid personal attacks, family attacks, fabricated facts, and proactive slurs

## Current Baseline

- Local mini-program prototype
- No database
- No real DeepSeek call from frontend
- CloudBase `generateReply` scaffold exists
- API key must only live in CloudBase env var `DEEPSEEK_API_KEY`
- Local fallback must always work

Data baseline:
- `147` rebuttal cards
- `432` aliases
- `30` categories
- base cards + extra comparison cards + cleaned docx corpus
- `review_needed` corpus entries must not enter matching

## Important Files

```text
miniprogram/data/arsenal.js
miniprogram/data/categories.js
miniprogram/data/aliases.js
miniprogram/data/aliases_extra.js
miniprogram/data/aliases_docx.js
miniprogram/data/rebuttal_cards.js
miniprogram/data/rebuttal_cards_extra.js
miniprogram/data/rebuttal_cards_docx.js
miniprogram/utils/normalizeQuery.js
miniprogram/utils/matchQuery.js
miniprogram/utils/llmProvider.js
miniprogram/pages/index/
cloudfunctions/generateReply/
scripts/test-match.js
scripts/test-corpus-integrity.js
scripts/test-ai-enhance-fallback.js
```

## Test Commands

Run these after changes:

```bash
npm run check:syntax
npm run test:match
npm run test:corpus
npm run test:ai-fallback
```

## Git State To Remember

As of the context split:
- branch: `main`
- remote branch: `origin/main`
- local branch is ahead of remote by 6 commits
- `CLAUDE.md` and this file may be new context-boundary files

## Good Next Tasks

Choose one per turn:
- test and fix matching for a batch of short inputs
- expand corpus with more approved cards
- improve homepage UI and copy workflow
- improve CloudBase AI-enhance fallback clarity
- add a small route/page for category browsing

## Standard Prompt For Future Work

```text
继续 LeBron 小程序。

本地目录：
/Users/happytang/Documents/New project/lebron-rebuttal-miniapp

这次目标：
[写清楚一个小目标]

限制：
- 只改 lebron-rebuttal-miniapp
- 不碰 ../model-agent-ultra-station
- 不碰 backend
- 不提交真实 API Key
- 做完跑 npm run check:syntax / test:match / test:corpus / test:ai-fallback
- 最后告诉我 changed files、test results、是否需要 push
```
