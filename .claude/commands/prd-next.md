---
description: Pick the next unblocked PRD from the backlog and implement it end to end
---

Implement the next PRD:

1. Read `docs/BACKLOG.md`. Select the highest-priority PRD whose status is
   "Not started" (or "In progress" with no other owner) and whose dependencies are
   all Done. If the user named a PRD in `$ARGUMENTS`, use that one instead.
2. Read the selected PRD in `docs/prds/` fully, plus `CLAUDE.md` and the
   "Owner decisions" section of the backlog. If the PRD needs an owner decision
   that has no documented default, stop and ask before writing code.
3. Set the PRD status to "In progress" in both the PRD file and the backlog row,
   commit that marker separately, then implement the requirements. Keep both
   language versions in parity on every edit.
4. Verify against the PRD's acceptance criteria one by one — run
   `node scripts/verify.mjs`, serve the site with `bash scripts/serve.sh`, and
   actually observe the affected pages (both languages, mobile width included).
5. On completion: flip the PRD's flag in the `ENFORCE` block of
   `scripts/verify.mjs` if it has one, check off the acceptance boxes in the PRD,
   set Status: Done, fill the backlog row with the commit hash, and commit with a
   conventional message referencing the PRD id.
6. Report: what shipped, evidence per acceptance criterion, and any owner
   decisions still pending.
