---
description: Audit a PRD's acceptance criteria against the current code (read-only)
---

Audit PRD `$ARGUMENTS` (if empty, audit every PRD marked Done or In progress):

1. Read the PRD file(s) in `docs/prds/`.
2. For each acceptance criterion, gather concrete evidence from the repo — run the
   stated commands, grep the files, serve the site and look. Do not modify anything.
3. Run `node scripts/verify.mjs` and `npm run lint:html`; include their results.
4. Output a table: criterion → PASS / FAIL / UNVERIFIABLE, with the evidence.
5. If a Done PRD has failing criteria, say so bluntly and recommend reopening it
   (backlog row back to "In progress").
