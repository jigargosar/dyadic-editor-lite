---
id: TASK-13
title: 'Saves are fire-and-forget: dot clears without confirming the write'
status: To Do
assignee: []
created_date: '2026-07-17 07:44'
labels: []
milestone: m-0
dependencies: []
priority: high
type: bug
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
App.tsx calls `window.api.saveTabContent(...)` and `markSaved(...)` side by side (the debounce callback at ~227, the unmount cleanup at ~243, and the blur/beforeunload flush at ~255). The IPC promise is never awaited and a rejection is never caught, so the amber dirty dot clears on *dispatch*, not on *success*. If the write fails — disk full, or an antivirus/search indexer holding the .txt file, which is routine on Windows — the user sees "Saved" while their text is not on disk. Silent data loss, and the indicator that should catch it is the thing lying. Save state needs to derive from the resolved write, and a failed write needs to stay dirty and be visible to the user.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A save that rejects leaves the tab marked dirty (dot stays amber)
- [ ] #2 A failed save surfaces a visible error to the user, not just a console log
- [ ] #3 The dot clears only after the write resolves successfully
- [ ] #4 Unhandled promise rejections from save paths are eliminated (debounce, unmount, blur, beforeunload)
- [ ] #5 A retried/subsequent successful save clears the error state
<!-- AC:END -->
