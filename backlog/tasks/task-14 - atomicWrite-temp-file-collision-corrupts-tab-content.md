---
id: TASK-14
title: atomicWrite temp-file collision corrupts tab content
status: To Do
assignee: []
created_date: '2026-07-17 07:44'
labels: []
milestone: m-0
dependencies: []
priority: high
type: bug
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
main/index.ts `atomicWrite` (~195-199) writes to a fixed `filePath + ".tmp"` then renames. The rename is atomic; the temp file is not. Two writes for the same tab can be in flight at once — the 300ms debounced save and the unmount flush both fire on a tab switch, and blur can add a third — so two `writeFile` calls interleave into the same temp path and both then rename. What lands on disk is a mix of two document versions. The temp path must be unique per write, and writes to the same target must not be able to reorder (a later write landing before an earlier one leaves stale content on disk). Also worth resolving here: the temp file is never fsynced before rename, so a power loss can leave a zero-length file where the rename succeeded but the data never flushed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Concurrent writes to the same tab cannot interleave into one temp file
- [ ] #2 Content on disk after concurrent writes is always one complete version, never a mix
- [ ] #3 The last write issued for a tab is the one that ends up on disk (no stale overwrite from a slower earlier write)
- [ ] #4 A failed write leaves the previous file intact and leaves no stray .tmp files behind
- [ ] #5 Write durability across power loss is addressed or explicitly deferred with a rationale
<!-- AC:END -->
