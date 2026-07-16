---
id: TASK-12
title: Backlog lint script
status: To Do
assignee: []
created_date: '2026-07-16 08:05'
labels: []
milestone: m-1
dependencies: []
type: chore
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Validate backlog invariants the CLI doesn't enforce: (1) every task's milestone resolves to a registered milestone (no phantoms); (2) no dangling --dep/--parent references to deleted tasks; (3) flag orphan tasks with no milestone; (4) warn on Done tasks with zero acceptance criteria.
<!-- SECTION:DESCRIPTION:END -->
