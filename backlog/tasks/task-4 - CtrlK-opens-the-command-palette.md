---
id: TASK-4
title: Ctrl+K opens the command palette
status: To Do
assignee: []
created_date: '2026-07-16 04:18'
updated_date: '2026-07-16 04:38'
labels: []
milestone: m-0
dependencies: []
type: feature
ordinal: 4000
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ctrl+K opens the palette, input focused, all commands listed
- [ ] #2 Typing filters the list by title; highlight resets to the first row
- [ ] #3 ArrowDown/ArrowUp moves the highlight and wraps at both ends
- [ ] #4 Enter runs the highlighted command and closes the palette
- [ ] #5 Clicking a row runs it and closes; clicking the backdrop closes without running
- [ ] #6 Esc closes; Ctrl+K while open closes; after close focus returns to the editor
- [ ] #7 Vim ':' command line still works independently
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Backfilled from front-log Done; shipped before Backlog adoption - no plan/AC captured. Behaviour/correctness tracked via TASK-1 (focus-trap) + palette-behaviour verify task.
<!-- SECTION:NOTES:END -->
