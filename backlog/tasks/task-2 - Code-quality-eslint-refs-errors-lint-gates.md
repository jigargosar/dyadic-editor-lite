---
id: TASK-2
title: 'Code quality: eslint refs errors + lint gates'
status: In Progress
assignee:
  - '@jigar'
created_date: '2026-07-15 16:24'
updated_date: '2026-07-16 10:09'
labels:
  - chore
milestone: m-0
dependencies: []
type: chore
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2 eslint react-hooks/refs errors at App.tsx:48-49; decide lint/format/typecheck gates.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Move tabsRef/activeTabIdRef assignments from render body into a dep-less useEffect (runs post-commit; Vim.defineEx callbacks fire from user input so refs stay current).
2. Verify: pnpm lint shows 0 errors in App.tsx; pnpm typecheck passes; run app and confirm vim tab commands (:tabnew/gt) still see current tabs.
3. Gates decision + gen-icons.mjs return-type error: pending user direction.
<!-- SECTION:PLAN:END -->
