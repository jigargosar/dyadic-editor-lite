---
id: TASK-16
title: Quit does not wait for the pending save flush
status: To Do
assignee: []
created_date: '2026-07-17 07:45'
labels: []
milestone: m-0
dependencies: []
priority: medium
type: bug
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The beforeunload handler in App.tsx (~253-258) fires an async IPC invoke and returns immediately; nothing awaits the reply. Tray menu > Quit sets isQuitting and calls app.quit(), which tears the renderer down without waiting, so anything typed within the ~300ms debounce window before a quit can be dropped. The blur-to-tray path happens to be safe (the app stays resident and the write completes), which is what makes this easy to miss — it is specifically the real-quit path that loses the last keystrokes. Needs a shutdown handshake that lets the pending write finish before the process exits, without hanging quit indefinitely if a write is stuck.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Text typed immediately before tray > Quit is on disk after the app exits
- [ ] #2 Quit is not blocked indefinitely by a hung or failing write (bounded wait)
- [ ] #3 Reopening after a quit shows the last typed content, not the last debounced snapshot
<!-- AC:END -->
