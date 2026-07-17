---
id: TASK-15
title: Corrupt session.json silently orphans every tab
status: To Do
assignee: []
created_date: '2026-07-17 07:44'
labels: []
milestone: m-0
dependencies: []
priority: high
type: bug
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
main/index.ts `readSession` (~213-222) wraps everything in a bare try/catch and returns null on any failure — unreadable file, truncated JSON, wrong shape. `dyadic:bootSession` treats null as "no session" and mints a brand-new empty one, overwriting session.json in the process. The users tabs/*.txt files all still exist on disk, but the app no longer references them, so from the users side a single bad parse is indistinguishable from losing all their notes — and the overwrite makes it unrecoverable through the app. Boot should reconstruct a session from what is actually in tabsDir rather than discarding it, and should not destroy an unreadable session file before a human can look at it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A corrupt or unparseable session.json does not lose access to existing tab files
- [ ] #2 Boot rebuilds the tab list from files present in tabsDir when the session is unusable
- [ ] #3 An unreadable session.json is preserved (e.g. moved aside) rather than silently overwritten
- [ ] #4 A session referencing a tab id whose file is missing degrades gracefully instead of failing boot
- [ ] #5 A tab file present on disk but absent from session.json is recovered rather than ignored
- [ ] #6 Genuine first-run (no session, no tab files) still produces one empty Untitled tab
<!-- AC:END -->
