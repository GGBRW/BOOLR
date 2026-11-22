# I/O and simulation regression audit

This extends `VISUAL-AUDIT.md` without replacing the original editor UI.

## Reproduced failures fixed

- Constants ignored their explicit constructor value. Explicit zero now works; the toolbar's default remains high. Zero values are included in portable saves.
- Debug probes overwrote their input with their previous display value instead of reading the incoming signal.
- Counters counted repeated updates while high. They now count rising edges; loading a high input establishes the edge baseline.
- ROM bit 31 was always low because of a signed bitwise comparison. Data extraction now uses unsigned shifts.
- ROM ports disappeared during import because the constructor creates no ports. The loader reconstructs saved port counts and metadata before reconnecting wires.
- Imported custom circuits could initially produce the wrong result until an input changed. Combinational components are scheduled after the complete graph is restored.
- Removing and undoing a wire could leave the sink low even when the restored wire was high. Connecting a low source could also leave a stale high sink. Wire updates now synchronize destinations even when the wire's own cached value is unchanged, without repeatedly propagating unchanged signals through branches.
- Deleted clocks continued scheduling ticks. Components now cancel tracked timers and invalidate pending timed callbacks on disposal. Undo revives clocks; board clearing disposes nested components and drops pending simulation work. Delays also ignore pending output callbacks after removal.
- Component position editing assigned the Y coordinate to `pos.t`. It now updates `pos.y`.
- A delayed focus callback could move focus to the name field during position entry, inserting text in the wrong field. Edit dialogs now focus synchronously.
- Numeric select values did not match string option values reliably. Selection compares their string representations.
- Audio used an eagerly created context, dereferenced unsupported APIs, and did not resume suspended contexts. Beeps now create audio lazily, resume when permitted, validate parameters, schedule oscillator cleanup, and fail silently without stopping simulation.

## Automated verification

`tests/logic-audit.spec.ts` adds 14 browser-hosted regression scenarios:

1. All binary truth-table rows for NOT, AND, OR and XOR.
2. Constant levels, input toggles, momentary button press/release, output and debug sinks.
3. Rising-edge counter behavior with repeated high/low refreshes.
4. Unsigned 32-bit ROM output.
5. Wire fan-out, both signal levels, and pause/resume of queued work; LED and Output sinks.
6. ROM ports/data and zero constants through serialization and cloning.
7. Custom inverter before and after portable serialization.
8. Clock deletion.
9. Delayed high/low output and cancellation after deletion.
10. Wire deletion, undo and redo with real signal propagation.
11. Component position editing through the visible dialog.
12. Low-wire synchronization of stale sink state.
13. Unsupported/suspended audio behavior using a controlled AudioContext substitute.
14. Clock revival on undo and cancellation on board clearing.

Logic tests run the actual legacy component classes and typed queue scheduler in Chromium, mostly through browser evaluation. They are not all mouse-driven UI tests. The existing interaction suites separately exercise real mouse/touch placement, wiring, navigation and responsive layouts.

Production build verification: **30 browser tests passed**, including these 14 and the existing 16. **51 unit tests**, TypeScript checks, Oxlint, Biome, Prettier and the Vite build also passed.

## Limits and remaining coverage

These results are not a proof of zero bugs. They do not exhaust arbitrary feedback/multi-driver graphs, all combinations of nested custom circuits, every edit/resize/port operation, every ROM dialog validation path, multiplayer synchronization, all tutorial/diagnostic components, seven-segment pixel rendering, or timing under long pauses/background throttling. Audio control flow was tested, not audible output on physical hardware. Actual browser audio remains subject to user-gesture/autoplay permissions.

Native Electron, Android and iOS behavior, Safari/WebKit, physical A11 hardware, signing and deployment have not been runtime-certified by this audit. Clocks and delays use browser wall-clock timers and the existing queued simulation semantics, not a deterministic virtual-time hardware simulator.
