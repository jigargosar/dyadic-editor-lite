---
id: TASK-10
title: Model app state to prevent impossible combinations
status: To Do
assignee: []
created_date: '2026-07-16 05:50'
labels: []
milestone: m-0
dependencies: []
type: chore
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit renderer/main state (ready/tabs/activeTabId, vimEnabled, paletteOpen, dirtyIds) for combinations that shouldn't be representable; prefer discriminated unions / single source of truth so invalid states can't occur.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Identify invalid state combinations currently possible
- [ ] #2 Refactor so those combinations are unrepresentable in types
- [ ] #3 No user-visible behaviour regression (verified by running the app)
<!-- AC:END -->
