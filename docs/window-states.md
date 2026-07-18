# Window states

Drawn from `src/main/index.ts`. Tried focus-based toggling and auto-hide-on-blur
first; both got complex and buggy, returned to this simple model.

States: **Visible**, **Hidden (tray)**, **Quit** (terminal).

- Hotkey / tray left-click: toggle, based on `isVisible()` alone (not focus).
- Tray right-click: menu, label is "Show" or "Hide" matching current state.
- X button: always hide.
- Tray "Quit": only way to quit.
