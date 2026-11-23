# Visual and interaction audit

## Scope

The original interface was exercised in Chromium using actual toolbar clicks, pointer drags, and CDP touch gestures. Screenshots were captured and visually inspected for the home menu, new-board form, welcome dialog, circuit context menu, navigation menu, and tutorial. This is an inspection of those paths, not a claim that every possible circuit, browser, or native device is bug-free.

Reviewed viewport sizes:

- Phone: 390 × 844.
- Tablet: 800 × 1280, including Egyptian Arabic / RTL.
- Laptop: 1366 × 768; expanded editing tests at 1366 × 900.

## Reproduced problems and fixes

| Problem observed                                                            | Fix and verification                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Right-click menu opened at (0, 0) regardless of the pointer                 | Removed invalid unitless CSS lengths; added typed anchored popup positioning, edge flipping, viewport bounds, and fixed-control avoidance. Tested all four corners on phone, tablet, and laptop. Logical circuit coordinates are kept separate from screen position. |
| Move/Pan buttons did not affect mouse editing                               | Unified mouse, pen, and touch routing through the existing editor operations. Verified that dragging changes component positions and camera offsets, not just a button's pressed appearance.                                                                         |
| Risk of duplicate touch/mouse actions                                       | Removed parallel legacy mouse listeners from the canvas and route each pointer gesture once. Real Chromium touch drags are tested; moving an input does not toggle it.                                                                                               |
| Bottom-right navigation failed to move into view                            | Correct pixel units and placement above its triggering button; verified bounds and actual menu-item actions.                                                                                                                                                         |
| Opening navigation could erase the board after a delayed timer              | Removed delayed clearing from navigation. Only creating a new board clears it; Resume board returns to the existing circuit.                                                                                                                                         |
| Browser Quit had no useful visible action                                   | Browser home menu hides desktop-only Quit; editor navigation is labeled Main menu. Desktop retains the actual quit operation.                                                                                                                                        |
| New-board panel and hint were clipped/mispositioned                         | Bounded centered original-style panel, viewport scrolling, correctly sized filename hint, and input-event filename updates.                                                                                                                                          |
| Wordmark, raster icon, welcome symbol, and version badge differed           | One canonical circuit-R SVG; matching Righteous outline wordmark; raster/ICO/native assets regenerated from the mark. Version label has an explicit row rather than unstable inline alignment.                                                                       |
| Home wordmark was a static outlined image while a matching typeface existed | The transparent circuit R (signal-green pins) now sits on the baseline immediately before live `EEO` set in REEO Circuit Display. Cap heights match; checked at 1400, 768, 390, 320, 844 × 390, and RTL 390 with no horizontal overflow or clipping.                 |
| Tutorial contents overflowed narrow screens and arrows appeared ineffective | One current section in a scrollable region, bounded navigation state, explicit previous/next labels, fixed footer controls. Verified section count and visible content changes.                                                                                      |
| Dialog buttons depended on mouse-down/up and delayed hide timers            | Normal click actions support keyboard activation; immediate deterministic show/hide avoids stale timer transitions.                                                                                                                                                  |
| Other floating UI used invalid numeric CSS lengths                          | Corrected hover hints, waypoint menus, component info, fullscreen console dimensions, and custom-component toolbar hiding.                                                                                                                                           |

## Automated regression checks

`tests/ui-audit.spec.ts` complements the earlier tests by checking:

- Context-menu placement at twelve viewport corners.
- New-board panel containment.
- Actual Move, Pan, Select, zoom-in and zoom-out effects using a mouse.
- Touch dragging with Chromium's touch input protocol.
- Placing input/output components via the visible library, wiring their ports, and propagating a toggled signal.
- Navigation containment, tutorial previous/next behavior, and resuming a populated board.

`src/geometry.ts` has unit tests for normal anchors, edge flips, and offscreen requests.

## Remaining scope

Firefox, Safari/WebKit, physical tablets (including A11), native release builds, unusual browser zoom/font settings, every advanced legacy dialog, and arbitrary large circuits have not all been certified by this audit. Advanced legacy tutorials/diagnostics still have English text. Further regression tests should be added as those paths are migrated.

## Related

- [Testing](TESTING.md) — current automated matrix and gaps.
- [User guide](USER-GUIDE.md#responsive-and-touch-behavior) — responsive/touch behavior.
- [Controls](SHORTCUTS.md#touch) — gesture reference.
