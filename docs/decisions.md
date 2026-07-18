# Decisions

Plain append-only log. Newest at the bottom.

## Renderer owns tab/session state; main is dumb persistence

Renderer holds the live `tabs` state; main's `session.json` is just a
snapshot it writes on request, no validation, no ownership.

Why: single window, single user, no CRDT/sync need — one owner is the
simplest correct design. Cost: main can't reject a bad write (see the
corrupt-session.json bug in `docs/board.md`).
