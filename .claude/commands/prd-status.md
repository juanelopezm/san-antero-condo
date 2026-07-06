---
description: Report backlog status, verify-gate health, and what to work on next
---

Give a project status report:

1. Run `node scripts/verify.mjs`; summarize errors and group warnings by PRD id.
2. Read `docs/BACKLOG.md`; cross-check each row's status against the PRD files'
   own Status lines and flag any mismatch.
3. State which PRD `/prd-next` would pick and why, and list owner decisions that
   are currently blocking work.
4. Keep it short: a status table, the next action, the blockers.
