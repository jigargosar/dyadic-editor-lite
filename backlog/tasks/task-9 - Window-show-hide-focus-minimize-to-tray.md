---
id: TASK-9
title: Window show/hide/focus + minimize-to-tray
status: In Progress
assignee: []
created_date: '2026-07-16 05:42'
updated_date: '2026-07-18 10:54'
labels: []
milestone: m-0
dependencies: []
type: feature
ordinal: 9000
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Hidden (tray) + hotkey shows and focuses the window
- [ ] #2 Visible (focused or not) + hotkey hides to tray
- [ ] #3 Native minimize button hides to tray
- [ ] #4 Close (X) hides to tray, app stays resident
- [ ] #5 Tray left-click toggles same as hotkey (isVisible()-based); tray right-click opens a menu with a Show/Hide item reflecting current state, and Quit
- [ ] #6 Launching a second instance shows/focuses the existing window, no second window
- [ ] #7 Fresh boot shows the window focused
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Replace Shift+Space hotkey with Ctrl+Shift+Space and Ctrl+Alt+Space.
2. Make toggle (hotkey + tray left-click) decide based on isVisible() alone, not isFocused() - isFocused() is unreliable for tray clicks since clicking the tray always blurs the window before the click handler runs.
3. Drop any blur-triggered auto-hide (tried, reverted - caused a hide/show race with tray clicks).
4. Tray right-click opens a menu built fresh each time, with a Show/Hide label matching current isVisible() state, plus Quit.
5. Remove restore() from showAndFocusWindow() - show() alone was sufficient in testing; flagged as unverified in docs/window-states.md pending more testing.
6. Update docs/window-states.md and CLAUDE.md to describe the new 2-toggle-consumer, isVisible()-only model.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented and manually tested by Jigar on Windows: hotkey toggle, tray left-click toggle, tray right-click dynamic Show/Hide label, minimize, X button all confirmed working. Committed in aa5c49c (hotkey rename) and 36d30cf (toggle rework).
<!-- SECTION:NOTES:END -->
