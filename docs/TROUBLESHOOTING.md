# Troubleshooting

Start with the smallest question: **is the signal reaching the component, and is the component configured?** Most “broken” circuits are an unconnected pin, a missing delay, an unconfigured ROM, or a display wired to the wrong segment. The field guide’s **Check this circuit** tab reports those structural cases directly.

## Boards and storage

### My board disappeared

REEO stores boards in the browser profile’s local storage. It does not use an account or cloud backup.

Likely causes, in order:

1. **Different origin.** `localhost:5173`, a Vercel preview URL, `reeo.vercel.app`, and a custom domain each have separate storage.
2. **Site data cleared** by the browser, an extension, “clear cookies and site data,” or the app’s **Clear localStorage** setting.
3. **Private/incognito window** closed; private storage is discarded.
4. **Different device or browser profile.** There is no sync.
5. **Desktop/mobile shell vs. browser.** They are separate local stores.

Recovery options:

- Look for a previously exported `.board` file and use **Import board**.
- In a desktop browser, inspect DevTools → Application → Local Storage for keys starting with `reeo.files.v1:saves/`. The value is the board JSON; copy it to a file and import it.
- On desktop builds, check the OS app-data directory for the Electron profile. Do not delete it while trying to recover.

### Autosave did not save my last edit

Autosave is not continuous. It runs after a 15-second interval, when the tab becomes hidden, when the page is hidden/unloaded, and on explicit save. A browser crash or force-kill can lose up to the last interval. Press `Ctrl+S`/save before closing.

### “Could not save” / quota errors

Local storage has a per-origin quota, typically a few MB. Large boards, many saved custom components, and long histories can exceed it. Export and delete unused boards or custom components. The app reports a save failure instead of silently claiming success; do not ignore it.

### Clear localStorage did not help

The settings action removes REEO-owned keys (`pwsData` and the `reeo.*` namespaces) and reloads. It does **not** clear unrelated storage for the same origin, and it cannot clear data managed by the browser or another profile. If the origin itself is unusable, clear site data for that origin.

> **Clear localStorage is destructive.** Export anything you need first; there is no undo.

## Import and export

### “Invalid board” / import rejected

The importer validates structure and limits. Common causes:

- The file is not JSON (HTML error page, truncated download, renamed file).
- It is a **saved custom component**, not a board.
- It has an unsupported component constructor (from an incompatible fork/version).
- It exceeds the 2 MB file limit, 2,000 components, 10,000 wires, or 12 custom-component nesting levels.
- Wire tuples reference a component/port that is missing or out of range (the structural validator catches malformed wire data, but a dangling reference can still load incorrectly).

Your current circuit is left untouched on failure. Re-export from the source version, or reduce the board first. Check the browser console for the validator’s message.

### Export downloads the wrong name

The filename is derived from the board name and sanitized. Renaming the board does not rename an already-downloaded file. Export again after renaming.

### An exported board opens on another device but looks different

Zoom/offset are stored in the file, but the viewport size and language differ. Use **Home**/fit and pan to the circuit. Signals and wiring are language-independent. If components are missing, you are probably on an older version or a fork with different constructors.

### Import says the custom component is invalid

A Custom component must expose at least one external pin, normally by containing an Input or Output. Recreate the interface in the editor and save it again rather than hand-editing nested JSON.

## Wiring and components

### A wire will not connect

- Start on a **black output** and end on a **white input**.
- The target must be a pin, not a component body.
- Release directly over the pin circle; at low zoom the hit area is small — zoom in.
- Confirm the input is not already driven by a wire branch in a conflicting way.
- If dragging a port is the goal, hold `Ctrl` while dragging it.
- On touch, enable **Interact** and tap the pin; a one-finger drag in **Pan** mode will not start a wire.
- Check that the board is not in a mode/dialog that swallowed the pointer.

### A wire looks connected but carries `0`

An unconnected input reads `0`, which looks like a valid low signal. Click the output source and verify it changes; use an Output monitor or hover details. Remember that a **Constant** defaults to `1` and an **Input** changes only when clicked.

### Two outputs are joined and the result is nonsense

REEO does not model a wired-AND bus or tri-state collisions. Joining independent drivers is a structural error. Use AND/OR/XOR to combine signals. The field guide reports independent drivers where it can detect them.

### A gate’s truth table seems wrong

Check which pins are inputs vs. output and whether both inputs are connected. Right-click the gate on the toolbar for its reference table. Unconnected inputs read `0`, so an AND with one wire can never be `1` until the second input is driven.

### A component will not rotate

Rotation is blocked while any pin has a wire, because the pin geometry would move. Remove/keep the wires, rotate, then reconnect. Custom components should be tested after any structural edit.

### A component will not resize

The requested width/height must fit every pin on the allowed sides. Ports are positioned on grid edges; shrinking below that minimum is rejected. Move or delete pins first, or choose a larger footprint.

### Componentize did nothing

- Make a selection with `Shift`+drag; `Shift+C` acts on the selection, not a hovered component.
- The selection must contain components; internal wires are included automatically.
- At least one Input and one Output is required to get a usable external interface.
- Rename the result afterward; the default name may be generic.

### Custom component changed after editing its internals

That is expected. Editing the board instance changes its current pins/content. **Saved components** are snapshots and do not auto-update, and external wires to removed pins are removed. Test and re-save deliberately.

## Simulation and timing

### A clock/counter runs too fast, too slow, or erratically

- Clock `delay` is the **half-period** in ms; 500 ms ≈ one count per second through a direct connection.
- Browser timers are throttled in background tabs and on low-power devices.
- Very short periods can exceed what the 16 ms update loop and display can show.
- A Counter counts rising edges; holding a signal high is one edge, not continuous counts.
- Enabling an AND gate while the clock is high can itself create an extra rising edge.
- Use **Pause** to inspect a settled state, then resume.

### Simulation appears frozen

Check the bottom-right pause button (`Ctrl+P`). The console’s `start` command also resumes. If the app reports update saturation, reduce feedback/oscillation or lower clock frequency. A browser tab in the background may be throttled rather than actually frozen.

### A feedback loop oscillates forever

REEO allows feedback and processes it within a 10,000-update-per-tick budget. An unstable loop is a circuit-design issue, not a simulator guarantee. Add a deliberate Delay/Clock only where the design needs one; do not use delay to hide an unintended race.

### Values update for one tick and then stop

Check that the downstream component is actually queued by a wire and that its input is the pin you think it is. A wire connected to an unused port does nothing. Use **Check this circuit** for unconnected inputs and loose ends.

### A ROM output is wrong

- Address pin 0 is the least-significant bit.
- Data pin `i` is bit `i`; read from the highest bit down when comparing to a hex string.
- Row count is `2^addressWidth`; row length is `dataWidth/4` hex digits.
- Recheck widths after editing: pins are recreated, and old wires may no longer point where you expect.
- The ROM must be configured; a freshly placed ROM opens its editor.

### A Display shows the wrong segments

The Display has **raw segment pins**, not a binary decoder. Wire A–G/DP individually. If you expected a number, build a decoder (gates or ROM lookup) first. At low zoom labels disappear; zoom in to verify pin order.

### A Delay never outputs

A Delay without a positive `delay` property does not schedule. Reopen its editor and set milliseconds. Removing the component cancels pending callbacks; re-placing it starts fresh.

### Pause does not stop a Clock

Pause freezes **queue processing**, not the timer that enqueues clock transitions. Work can accumulate while paused; on resume the queue may catch up. Use a slow clock while inspecting.

## Audio

### Beep is silent

- Browsers require a user gesture before audio; click/tap the page first.
- The input must actually be `1` at an update. Verify with an LED or Output monitor.
- System/browser volume, tab mute, and autoplay policy can block sound.
- Frequency must be within a sensible audible range; duration must be positive.
- Check the browser console for `AudioContext` errors.

## Language and RTL

### Arabic text is clipped or overlaps

Switch to a larger viewport and reopen the surface; dialogs remeasure after fonts load. If it persists, report the exact dialog, language, viewport width, and a screenshot. Arabic uses IBM Plex Sans Arabic; a missing font file would change metrics.

### The circuit is not mirrored in Arabic

By design. Only the UI mirrors; grid coordinates, wires, commands, and technical identifiers stay LTR so circuits remain shareable. The page’s `dir` is RTL but the canvas is explicitly LTR.

### Some text is still English

User-created names, console input, raw browser/OS errors, and technical identifiers are intentionally untranslated. Report any **static UI string** that remains English with its location and language.

### Language does not persist

It is stored per origin (`reeo.locale`). Private windows and cleared site data reset it. Browser locale is used only for the initial default.

## Web deployment and runtime

### Blank page on Vercel

- Confirm the build output is `dist/` and the deployment used `bun run build:vercel`/the configured build command.
- Open DevTools → Console and Network. A 404 for `/src/app/...` means the legacy script assets were not included; they are referenced from `app/` in the repo.
- A CSP error means a new external resource/connection was added without updating `vercel.json`.
- A “failed to load module” on an old browser means the build target is newer than that browser.

### Works locally, fails on Vercel

Local `vite` serves source; production runs the built bundle and rewrites. Run `bun run build:vercel` (build + `verify:web`) before deploying. The verification script checks the built references; do not skip it.

### WebSocket/server features do nothing

No collaboration server is bundled or hosted. The connect dialog cannot succeed without a compatible server, and exposing an unauthenticated relay publicly is unsafe. Use export/import instead.

## Desktop and mobile builds

### Desktop window is blank

Build the web bundle first; Electron loads `dist/`. Run the documented `desktop:dev`/`desktop:pack` scripts from the repository root. Check the Electron main-process log for a load-file path error.

### Packaged app is unsigned/untrusted

Release packaging is not code-signed or notarized in this repository. macOS/Windows will warn; local builds are for development. Signed distribution requires your own certificates, which are not committed.

### Android build fails

- Use JDK 21 and a compatible Android SDK; the workflow installs both.
- Run `bun run mobile:assets` after changing native art.
- A missing `android/` project means the Capacitor platform was not added; follow [Platforms](PLATFORMS.md).
- Gradle/network failures are environment issues, not app logic.

### iOS build fails

iOS requires macOS + Xcode and a simulator/device target. The CI job builds for a simulator; signing for a device needs your team/provisioning. See [Platforms](PLATFORMS.md).

### Touch controls are missing

They appear on coarse pointers and narrow layouts (≤900 px). A desktop browser with a mouse keeps the mouse interaction model; use DevTools device emulation to test the touch layout. Do not report a missing touch strip on a fine-pointer desktop as a bug.

## Console and field guide

### A console command says “not found”

Check case, exact name (spaces in names are unsupported), ID vs. position, and `~` placement. Use `findComponent` first. See [Console](CONSOLE.md) for parsing rules.

### `edit` appeared to do nothing

The property must exist, and the value must be coercible to its type. The console silently ignores invalid property paths. Verify the real property name (for delays it is `properties.delay`), and confirm with the hover balloon or `findComponent`.

### The field guide’s diagnostics disagree with my design

Diagnostics are **structural**, not formal verification. An unconnected input can be intentional (it reads `0`); a paused simulator is a state, not a bug. Read the suggested fix, then decide.

### The guide/ghost does not place components

By design. Recipes are instructions and dashed references; you place and wire the circuit. **Locate on grid** highlights an existing component but does not edit it.

## Data recovery checklist

1. Stop editing; export the current board if the UI responds.
2. Check other origins/profiles/devices and Downloads for an earlier export.
3. Use DevTools → Application → Local Storage to copy `reeo.files.v1:saves/*` values into `.board` files.
4. Check the OS app-data directory for a desktop build.
5. Only then consider clearing site data, and only if you accept losing what remains.

## Reporting a bug

Include:

- exact REEO build (commit/deployment URL or app version),
- platform/browser/OS and viewport size,
- language (`en`/`ar`/`arz`) and direction,
- steps to reproduce from a fresh board,
- expected vs. actual behavior,
- the exported `.board` if it reproduces a circuit bug,
- console/network errors and a screenshot for visual issues.

Do not include secrets or private board data. See [GitHub workflow](GITHUB.md) for the issue/PR path and [Testing](TESTING.md#test-coverage-and-known-gaps) for areas not covered by automated tests.
