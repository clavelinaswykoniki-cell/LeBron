# LeBron Rebuttal Miniapp

## Scope

This project is a standalone WeChat mini-program for rebutting common anti-LeBron arguments.

Do not mix this project with:
- `../model-agent-ultra-station`
- Python orchestration backend work
- unrelated Second Brain / SaaS planning
- previous multi-agent / orchestration runtime discussions

## Product Intent

This is not a generic LeBron praise app.

It is a:
- black-point matcher
- logic teardown tool
- rebuttal phrase generator
- optional AI-enhanced argument assistant

Priority is:
- accurate category matching
- strong short-form rebuttal
- stable local fallback
- safe CloudBase handoff for AI enhancement

## Current Structure

- `miniprogram/data/`: cards, aliases, categories, corpus
- `miniprogram/utils/`: normalize, match, llm provider, prompt builder
- `miniprogram/pages/index/`: main UI
- `cloudfunctions/generateReply/`: CloudBase AI enhance path
- `scripts/`: syntax, match, corpus, fallback tests
- `docs/context-compact.md`: short current-state handoff for future agents

## Current Constraints

- Keep edits inside `lebron-rebuttal-miniapp` only
- Do not touch backend projects outside this directory
- Real API keys must not be committed
- CloudBase failure must always fall back to local cards
- Black terms can be used as aliases, not as proactive abusive output
- Start from `docs/context-compact.md` before reading large data files

## Current Baseline

- 147 local rebuttal cards
- 432 aliases
- local matching working
- AI enhance path scaffolded
- corpus import path exists

## Commands

```bash
cd "/Users/happytang/Documents/New project/lebron-rebuttal-miniapp"
npm run check:syntax
npm run test:match
npm run test:corpus
npm run test:ai-fallback
```

## Collaboration Contract

- treat this as a separate product sandbox
- avoid dragging in orchestration-system context unless explicitly requested
- prefer small, testable UI/data changes over broad architectural rewrites
- when asked to continue this project, summarize changed files, tests, and push status
