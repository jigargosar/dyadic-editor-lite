---
id: TASK-17
title: Timestamp tab ids can collide
status: To Do
assignee: []
created_date: '2026-07-17 07:45'
labels: []
milestone: m-0
dependencies: []
priority: medium
type: bug
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tab ids are minted as 't' + Date.now() (App.tsx ~103 in newTab, ~130 in closeTabById). Two ids created in the same millisecond are identical, and the two tabs then share a single .txt file — edits to one silently overwrite the other. The riskiest path is closeTabById, which deletes a tab and mints a fresh id in the same synchronous stretch, and the same collision is reachable by triggering :tabnew twice quickly or holding the key. Ids need to be unique regardless of timing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Two tabs created in the same millisecond receive distinct ids
- [ ] #2 Closing a tab and opening its replacement never reuses the closed tab id
- [ ] #3 Existing tab ids from a saved session still load (no breaking id format change, or a migration is included)
<!-- AC:END -->
