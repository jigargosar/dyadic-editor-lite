---
id: TASK-1
title: 'Palette: Tab escapes the dialog (no focus trap)'
status: To Do
assignee: []
created_date: '2026-07-15 16:13'
updated_date: '2026-07-16 06:13'
labels:
  - bug
milestone: m-0
dependencies: []
type: bug
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tab inside the Ctrl+K command palette shifts DOM focus out to the page behind it instead of staying/cycling within the palette. Fix by capturing Tab and cycling the selection with the background made inert, or switch the palette to a native <dialog> element. CommandPalette.tsx onKeyDown handles Esc/Arrows/Enter but not Tab.
<!-- SECTION:DESCRIPTION:END -->
