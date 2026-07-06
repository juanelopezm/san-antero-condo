# PRD-000: <Title>

- **Status:** Not started | In progress | Done
- **Priority:** P0 | P1 | P2
- **Depends on:** (PRD ids, or "none")
- **Goal traceability:** (which Product Vision goal this serves)

## Problem

What is broken or missing today, with evidence from the repo (file paths, line
numbers, measurements).

## Outcome

The user-visible or operational result once this PRD is done. One paragraph.

## Requirements

Numbered, testable requirements. Each one should be verifiable by a human or by
`scripts/verify.mjs`.

1. ...

## Out of scope

Explicitly excluded work, especially things that look adjacent.

## Acceptance criteria

Checklist an agent must satisfy before marking this PRD Done. Every item must be
objectively checkable (a command to run, a file to exist, a page state to observe).

- [ ] ...
- [ ] `node scripts/verify.mjs` passes
- [ ] ES and EN pages remain in parity
- [ ] `docs/BACKLOG.md` row updated to Done with the completing commit hash
