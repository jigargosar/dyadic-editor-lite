# Board

Plain task list. No IDs — items are referenced by title. No checkboxes —
status is which section (or file) an item lives in. Items can move any
direction between this file, `icebox.md`, and `archive.md`.

If an item needs more detail than fits on one line, put the detail in its
own flat file under `docs/` and link it from the bullet.

## In Progress

## To Do

- Saves are fire-and-forget: the saved indicator clears before the write is
  confirmed. Data-loss risk. (was TASK-13, HIGH)
- Temp-file collision in atomicWrite can corrupt tab content. (was TASK-14, HIGH)
- Corrupt session.json silently orphans every tab, no warning. (was TASK-15, HIGH)
- Quit doesn't wait for a pending save flush. (was TASK-16, MEDIUM)

## Done

- Window show/hide/focus + minimize-to-tray toggle rework. See `docs/window-states.md`.
- Tab ids: `Date.now()` → `randomUUID()`, fixes same-millisecond collisions.
