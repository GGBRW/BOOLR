# REEO user guide

REEO is a digital logic playground. You place components on a grid, wire their pins together, and change inputs to watch signals propagate. It runs in a browser, as a desktop app, and as an Android/iOS shell around the same interface.

This guide covers the whole product surface: the home screen, board storage, canvas editing, every menu, the component picker, custom components, simulation, the console, languages, keyboard/touch controls, and known limits. For pin-level details see [Components](COMPONENTS.md); for exact shortcuts see [Controls](SHORTCUTS.md).

**Start here:** [Your first circuit](#your-first-circuit) · [Storage warning](#where-your-boards-live) · [Controls](SHORTCUTS.md) · [Troubleshooting](TROUBLESHOOTING.md)

---

## Scope, guarantees, and limits

REEO simulates **binary logic at the component level**. It does not model voltages, current, transistors, analog rise times, or PCB physics. A clock period is a browser timer, not a hardware oscillator.

What you can rely on:

- Primitive gates produce their standard truth tables.
- Inputs, buttons, constants, clocks, delays, counters, LED/output sinks, displays, ROM, and custom components behave as described in [Components](COMPONENTS.md).
- Boards save locally and export as JSON `.board` files.
- The UI is translated into English, Arabic, and Egyptian Arabic; the circuit model stays the same.

What is **not** promised:

- Bit-exact hardware timing, glitch modeling, or analog behavior.
- Proof that a circuit matches your intended design. The field guide’s checks are structural advice, not formal verification.
- Cloud sync, accounts, multi-device backup, or a hosted collaboration service.
- That every legacy dialog, browser, screen reader, or physical device has been certified. The repository records its tested scope honestly in [Testing](TESTING.md) and the audit documents.

If a board misbehaves, start with [Troubleshooting](TROUBLESHOOTING.md), then export the board before changing anything.

---

## Your first circuit

1. On the home screen choose **NEW BOARD**. Enter a name; the filename preview updates automatically. Choose **Create**.
2. The bottom toolbar is the component shelf. Click **I/O**, then **Input** in the pop-up list.
3. Click an empty spot on the white grid to place the input.
4. Pick a gate from the toolbar: `!` (NOT), `&` (AND), `|` (OR), or `^` (XOR). Place it to the right.
5. Drag from the **black output pin** of the input to the **white input pin** of the gate. A live wire is drawn as you move.
6. Place **I/O → Output** or **I/O → LED** to the right of the gate and wire the gate output into it.
7. Click the input switch. Its value flips between `0` and `1`; the gate and output follow.
8. Press `Ctrl+S` (or use the bottom-right menu) to save. Use **Export board** in the header for a portable backup.

That is the complete loop: place, wire, toggle, observe, save.

> **No project file yet?** Holding `Ctrl` while choosing **NEW BOARD** starts a board without creating a saved file. You can save it later from the menu.

---

## Home screen

The home screen is the dark main menu over the circuit canvas.

| Control           | What it does                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **NEW BOARD**     | Opens the board-name form. The preview shows the sanitized `.board` filename that will be created.  |
| **OPEN BOARD**    | Lists files stored on this device. Each row has open, edit, and delete controls plus its file size. |
| **SETTINGS**      | Changes animation and update-visualization preferences; can clear local data.                       |
| **QUIT**          | Desktop build only. Saves and closes the Electron app. Hidden in the browser/mobile build.          |
| **Resume board**  | Appears when a board is open or components exist; returns to the editor without clearing it.        |
| Language selector | English, العربية, مصري. The choice persists on this device and switches the whole UI/RTL direction. |
| Developer credit  | Name and icon link to the public repository.                                                        |

**What’s new** is not on the home screen. It lives in the bottom-right navigation menu, where its release dialog lists current changes.

### Create a board

- The name is free text; the filename is derived from it (`My Board` → `my-board.board`). Punctuation and spaces become hyphens, and a duplicate name gets a numbered suffix.
- If a filename already exists, a numbered suffix is added.
- **Ctrl while choosing NEW BOARD** means “start unsaved.” The board title stays generic until you save.
- Creating a new board clears the current canvas after the app has persisted the previous state.

### Open, edit, and delete boards

- **Open board** reads the local board library, not a cloud account.
- The pencil control edits the display name and filename.
- The trash control asks for confirmation before deleting.
- The size shown is the stored file’s byte size.
- Import a `.board` file from this panel or from the header’s **Import board** button.

### Settings

The settings panel applies changes on **OK**; **Cancel** discards them.

| Setting                    | Effect                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scroll animation**       | Smooths keyboard/waypoint scrolling. Turn off for immediate jumps or reduced motion.                                                                    |
| **Zoom animation**         | Smoothly interpolates zoom. Turn off for instant zoom.                                                                                                  |
| **Show debug info**        | Draws the small live diagnostic overlay (FPS, tick work, coordinates).                                                                                  |
| **Show component updates** | Briefly highlights components as they update. Useful for tracing; noisy on fast clocks.                                                                 |
| **Clear localStorage**     | Deletes boards, saved components, preferences, clipboard, tips, and language choice on this origin. Default preferences are recreated after the reload. |

**Clear localStorage is destructive.** Export boards first. There is no undo and no server copy.

---

## Where your boards live

REEO stores data **on the current device and browser profile**:

- Boards: `localStorage`, under an internal per-app prefix.
- Saved custom components: the same local storage adapter.
- Preferences, clipboard, and tips: local storage as well.

Autosave runs every 15 seconds while the editor is open, when the tab becomes hidden, when the page is hidden/unloaded, and when you explicitly save. The app does not need an account or a backend.

Consequences:

- Clearing site data, app data, or local storage deletes your boards.
- Private/incognito windows may discard data when closed.
- A Vercel preview URL, production domain, and custom domain are different origins with separate storage.
- Desktop and mobile shells use the same local adapter; they do **not** share a folder with each other or with the browser.
- Old BOOLR `saves/` files are not imported automatically. Use **Import board** for each `.board` file.
- There is no cross-device sync. Export a backup before changing devices, reinstalling, or clearing storage.

### Export

**Export board** in the header, or the save/export flow in the menu, downloads a JSON `.board` file. The filename is derived from the board name and sanitized for the filesystem. Export works even for an unsaved board, using a generated name.

### Import

Import accepts:

- a full REEO/BOOLR board object with `name`, `offset`, `zoom`, `variables`, `variableReferences`, and `data`; or
- a raw `[components, wires]` array.

Validation rejects oversized or malformed files and unsupported constructors. An invalid import leaves the current circuit intact and shows an error. Accepted limits include a 2 MB file, 2,000 components, 10,000 wires, and 12 levels of custom-component nesting.

> **Treat downloaded boards like documents.** They can contain arbitrary component names and configuration. Import boards from people you trust.

---

## Editor tour

From top to bottom:

1. **Platform bar** (top-right): language, **Import board**, **Export board**, and the icon-only **Quick guide**.
2. **Touch tools** (left, on touch-sized/coarse-pointer layouts): Interact, Move, Pan, Select, Add component, Fit circuit, Zoom out, Zoom in.
3. **Canvas**: infinite grid, white background, ports and wires.
4. **Component toolbar** (bottom center): I/O, NOT, AND, OR, XOR, Custom, Saved components.
5. **Bottom-right actions**: navigation menu (chevron) and pause/play.
6. **Status surfaces**: tip toasts bottom-right, notifications bottom-left, release/guide dialogs centered.
7. **Guide dock** (bottom-left, when a recipe is pinned): step checklist, Previous/Next, ghost toggle, Fit guide, Finish.

The editor has no page scrolling. Everything above the canvas is a fixed overlay; use the canvas navigation to move the circuit.

### The component shelf

| Toolbar control | Opens / selects                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| **I/O**         | Input, Output, Button, Constant, Delay, Clock, LED, Display, Debug, Beep, Counter, TimerStart, TimerEnd, ROM |
| **!**           | NOT gate                                                                                                     |
| **&**           | AND gate                                                                                                     |
| **\|**          | OR gate                                                                                                      |
| **^**           | XOR gate                                                                                                     |
| **Custom**      | A blank reusable circuit component                                                                           |
| **Saved**       | The saved-custom-component library                                                                           |

Right-click a gate symbol on the toolbar to open its truth table. Right-clicking is not available on touch; use the Quick guide or place the gate and inspect it instead.

The bottom-right navigation menu contains **New board**, **Open board**, **Save board**, **Open console**, **Settings**, **Open tutorial**, **Main menu**, and **What’s new**. The pause button freezes simulation work without clearing the circuit.

---

## Navigating the canvas

The grid uses integer coordinates. The view is defined by a pan offset and a zoom level (roughly 2–300 screen pixels per grid unit).

| Action                  | Mouse / trackpad                                         | Touch                                                   | Keyboard                |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Pan                     | Middle-drag, `Alt`-drag, `Ctrl`-drag, or two-finger drag | **Pan** tool + drag, or two-finger drag                 | Arrow keys (5 units)    |
| Zoom                    | Wheel; trackpad pinch or `Ctrl`+wheel                    | Pinch                                                   | `Page Up` / `Page Down` |
| Zoom around a point     | Wheel/pinch at the pointer                               | Pinch centre                                            | —                       |
| Return to origin        | —                                                        | —                                                       | `Home`                  |
| Fit a circuit           | **Fit circuit** touch tool                               | **Fit circuit**                                         | —                       |
| Scroll while connecting | `Ctrl` while dragging a wire                             | Pan tool is disabled during a one-finger wire operation | —                       |
| Cancel a drag           | Right-click                                              | Release / switch tool                                   | `Escape`                |

Zoom is intentionally bounded. At very low zoom the grid dots and labels disappear so the circuit remains readable.

### Touch tools

On a phone/tablet, or any layout matching coarse pointer/≤900 px, the **Interact / Move / Pan / Select** buttons change what a one-finger drag means:

- **Interact**: tap to place, toggle inputs, press buttons, start wires. Drag on empty canvas does not pan by default.
- **Move**: drag a component or selection.
- **Pan**: drag the view.
- **Select**: drag a selection rectangle.

Pinch (two fingers) always pans/zooms. A long press opens the context menu. A double-tap opens a custom component. A normal tap still toggles an Input. These gestures are routed through the same legacy mouse operations exactly once, so a touch does not toggle a component twice.

---

## Placing, selecting, and editing

### Place a component

1. Select a type from the toolbar or the I/O list.
2. Click/tap an empty grid position.
3. The component is placed with its default size and pins.

If the target position is occupied by a port or wire, placement is rejected. Use **Add component** to reopen the picker on touch.

### Interact

- **Input**: click/tap toggles `0` ↔ `1` and keeps that level.
- **Button**: press outputs `1`, release returns `0`.
- **Constant**: continuously outputs its fixed value (default `1`).
- **Custom**: double-click/tap or `Shift+O` opens its internal circuit.
- **Input/Output components inside a custom circuit** define the external pins of that custom component.

### Select

- Hold `Shift` and drag a rectangle to select components and wires.
- A selection shows the blue dashed rectangle and opens the context menu.
- `Escape` or a click outside dismisses the selection.
- **Move** or **Select** tool works without a keyboard on touch.

### Move

- `Ctrl`+drag a component, selection, or port with the mouse.
- Use the **Move** tool and drag on touch.
- While dragging, the attached wire ends follow. Release drops at the nearest grid position.
- Right-click cancels and animates the component back.
- The whole selection moves together, including internal wires.

### Edit properties

Right-click → **Edit**, press `E` with the pointer over a component, or use **Component help** for the guide. The edit dialog exposes:

- name (1–11 characters),
- position `x,y`,
- width and height (constrained so pins fit),
- delay in ms for Delay/Clock,
- frequency/duration for Beep,
- hex data for ROM (the dedicated ROM editor also exposes address/data widths).

Ports can be edited separately: right-click a pin → **Edit** to rename it or delete its connection. Dragging a port with `Ctrl` changes its side and position; the attached wire endpoint follows.

### Rotate

Right-click → **Rotate**, or press `R` with the pointer over a component. Rotation is blocked while any pin has a connection, because rotating would invalidate the wires.

### Resize

Width/height are part of the edit dialog. The validator refuses a size that cannot fit the existing pins. Resizing is mainly useful for Custom, ROM, Display, and large chips; the standard gate footprints should stay as designed.

### Delete

- Select and press `Delete`, or right-click → **Remove**.
- Right-click a wire → **Remove connection**.
- Delete a selection to remove its components and the wires that belong to it.
- Undo is available immediately (`Ctrl+Z`) and the toast offers an Undo action.

### Copy, paste, duplicate

- Select a circuit, then `Ctrl+C` or right-click **Copy**.
- `Ctrl+V` or right-click **Paste** creates a copy at the pointer/context position.
- The clipboard also survives reloads (stored locally).
- Copies are deep clones: component IDs change, internal wires are recreated, and custom internals are cloned.

### Undo and redo

- Undo: `Ctrl+Z`.
- Redo: `Ctrl+Y` or `Ctrl+Shift+Z`.
- Undo history is in memory and is cleared by loading a different board.
- Not every transient gesture is undoable; structural edits (add, remove, connect, move, resize, edit, componentize, paste) are.

---

## Wiring and signals

A wire connects a **black output pin** to a **white input pin**.

- Start a wire by pressing on an output pin, then drag to an input pin.
- You can also start from an existing wire to branch it; the new wire keeps the existing signal.
- One output can fan out to several wires. A wire can carry several branches.
- Releasing over a valid input connects the wire. Releasing elsewhere cancels it.
- Inputs show their current value; wires animate/update as signals change.
- Hold `Shift` while drawing for a straight horizontal/vertical segment.
- `Ctrl` while drawing lets you pan without dropping the wire.
- Wire ends snap to grid positions; wires are drawn as orthogonal segments.
- A wire can be recolored from its context menu. The palette has twelve neutral/signal colors; colors affect presentation, not logic.
- Right-click a component → **View connections** to inspect its input/output connections.
- **Use explicit gates for logic.** Do not tie two source outputs together to invent an AND; connect sources through a real gate.

### Waypoints

Waypoints are named camera positions, not electrical nodes.

- `Shift+S` sets one at the pointer (uses the component name when present).
- `Shift+W` opens the jump list.
- Right-click → **Set waypoint** / **Go to waypoint** does the same.
- Delete a waypoint with its × control in the list.
- Waypoints are per session; they are not part of the `.board` format.

### Ports and pin names

- White circle = input; black circle = output.
- `Input` has one output; `Output` has one input.
- Gates follow their truth tables; see [Components](COMPONENTS.md).
- Display segment pins and ROM address/data pins are labeled at useful zoom levels.
- Pins can be renamed, and custom-component pins inherit the names of the internal Input/Output components.

---

## Simulation

Signals propagate through a queued update loop:

1. A source changes (click, clock tick, delay expiry).
2. The component updates its outputs.
3. Each connected wire receives the value.
4. Downstream components are queued and updated in order.
5. The canvas redraws continuously at display refresh.

The loop is bounded to **10,000 queued updates per 16 ms tick**. If work remains after the budget, the app reports saturation instead of freezing. This is a safety limit, not a simulation clock that can be sped up.

### Pause and resume

The bottom-right pause button, `Ctrl+P`, or the **Pause simulation** control freezes queue processing. Sources and wiring remain, but queued changes are not processed until resumed. Timers may keep scheduling work into the queue while paused; the visible state waits until you resume.

Use pause when:

- inspecting a fast clock/counter combination,
- editing a circuit while a clock is running,
- reading a display that changes too quickly.

### Clocks, delays, and counters

- **Clock** alternates every configured `delay` ms (a half-period). 500 ms ≈ one full cycle per second.
- **Delay** re-queues every input transition after its configured ms. Quick transitions are queued, not merged.
- **Counter** increments only on a `0 → 1` edge. Holding the input high does not keep counting.
- **TimerStart / TimerEnd** are experimental wall-clock diagnostics; there is one shared start timestamp.
- Browser tab throttling and timer resolution affect all timing. This is not real-time hardware.

### Feedback

Feedback is allowed and bounded by the update budget. A feedback loop can settle, oscillate, or saturate; the app will not claim the circuit is “correct.” Add an intentional delay/clock only when the design needs one, not to hide an unstable loop.

### Audio

**Beep** uses the Web Audio API. Browsers require a user gesture and may mute audio. The component checks support, resumes a suspended context when allowed, and stays silent if audio is unavailable. Verify the triggering bit with an LED before debugging sound.

---

## The field guide, tutorials, and help

### Quick guide

The header's icon-only **Quick guide** button opens the **Circuit field guide**, a centered dialog with four tabs:

- **Start here** — first principles and a short path into the editor.
- **Every component** — searchable entries for all 19 component types, with behavior, wiring, an experiment, and cautions.
- **Worked circuits** — eight recipes: first circuit, NAND/NOR, half adder, full adder, alarm, multiplexer, clock/counter, ROM lookup.
- **Check this circuit** — structural diagnostics for the current board/subcircuit.

Search matches component names and description words. An exact component name wins over broad matches. Each component entry has **Locate on grid**; it highlights the component and closes the guide without editing the circuit.

The component picker also adds a small help button to every entry, which opens that component's guide directly.

### Worked recipes and ghost diagrams

Open a recipe from the field guide. A **guide dock** appears at the bottom-left with numbered steps, **Previous**, **Next**, and **Finish checklist**. The app does **not** place components or claim to verify that you followed the steps.

A faint dashed **ghost** of the intended circuit can be shown/hidden from the dock; **Fit guide** frames it. Ghosts are reference drawings only and never become simulated components, pins, or wires.

### Diagnostics

**Check this circuit** looks for structural issues such as:

- unconnected input pins (which read `0`),
- a Clock/Delay with no positive delay,
- a ROM whose interface/data is not configured,
- a custom component with no external pins,
- loose wire ends,
- joined independent drivers,
- paused simulation,
- a saturated update queue.

Findings are localized and can locate the component on the grid. An unused input can be intentional; a structural finding is not proof of a logic bug. Automatic contextual tips use the same checks, wait for wiring to be stable, avoid interrupting an active drag, deduplicate per session, and can be disabled in the guide.

### Tutorial

`F1` or **Open tutorial** in the menu opens the original step-by-step tutorial. It covers:

1. Welcome, zoom, and panning.
2. Inputs and naming.
3. Wiring and NOT.
4. Outputs and truth tables.
5. Selecting, copying, pasting, deleting.
6. Componentize and custom components.
7. Console and variables.
8. Undo/redo.
9. Waypoints.
10. Port dragging, straight wires, arrow-key scrolling, saved components.

Use the arrows or the section index to move through it. Tutorial diagrams are language-neutral SVG, not baked-in English screenshots.

### What’s new

The bottom-right navigation menu contains **What’s new**. Its compact dialog lists current release changes. It is not a version button in the action strip.

### Tooltips and hover details

Hover a toolbar slot for its name; gates also advertise right-click truth tables. Hover a component on the grid for a small information balloon (name, position, ID, value). Hover advice is suppressed after a dismissal until the pointer moves again.

---

## Custom components

Custom components package a working selection into a reusable block.

### Create one

1. Build and test the circuit.
2. Include at least one **Input** and one **Output** inside it. Those become the external pins.
3. `Shift`+drag to select every component and internal wire.
4. Right-click → **Componentize**, or press `Shift+C`.
5. Give the component a clear name (edit it like any other component).

The selection is cloned; the original components are replaced by one Custom component at the selection center. Internal wiring and component configuration are preserved.

### Open and edit

- Double-click the custom component, right-click → **Open**, or `Shift+O`.
- The editor enters the subcircuit. The custom-component toolbar at the top shows its name, **Edit**, **Save component**, and a close control.
- Inside, Input/Output components are its interface. Add/remove/rename them to change the public pins.
- Returning to the parent board reconnects the custom component; external wires that referenced removed pins are removed.
- Nested custom components are supported. The board validator limits nesting to 12 levels.

### Save and reuse

- Right-click a custom component → **Save component**, or press `Shift+R` with the pointer over it.
- Saved components appear in **Saved components** on the toolbar.
- Selecting one places a clone at the pointer.
- The saved list is device-local and can delete entries; it is not a separate file.
- Saving is a snapshot: editing the board component later does not automatically update the saved library entry.

### Cautions

- Test the truth table before saving.
- Changing internal I/O changes the public interface; recheck every external connection afterward.
- A Custom component with no internal Input/Output has no external pins.
- Very deep or very large nesting is bounded by import validation; it is not intended as a general hierarchical design system.

---

## The console

Press `Shift+T` or choose **Open console** in the menu. The console is a small command window over the editor, not a JavaScript REPL.

Commands include `set`, `get`, `variables`, `remove`, `edit`, `findComponent`, `start`, `pause`, `help`/`?`. Use `~` in position arguments for the current pointer position. The console supports command history (`↑`/`↓`), Tab autocomplete, `Ctrl+L` to clear, and `Escape` to close.

Example:

```text
set period 500
set examples 3
get period
edit Clock#0 delay 2 * period
findComponent 4,2
remove 4,2
help
```

Variables are numeric where arithmetic is used; expressions support `+ - * / %`, parentheses, unary signs, decimals, and variable names. There is no `eval`, property access, function call, or arbitrary JavaScript. Changing a variable updates components whose editable property references it.

The full syntax, lookup rules, and caveats are in the [console reference](CONSOLE.md).

---

## Languages and RTL

The header language selector offers:

- **English** (`en`) — default, LTR.
- **العربية** (`ar`) — Modern Standard Arabic, RTL.
- **مصري** (`arz`) — Egyptian Arabic, RTL.

The choice persists under `reeo.locale`; Arabic browser locales default to Arabic on first run. Switching updates text, tooltips, titles, validation, tutorial prose, console help, diagnostics, and the guide without reloading.

- Text and layout mirror for RTL; the circuit grid, coordinates, command syntax, file extensions, and technical identifiers stay LTR.
- Arabic text uses the bundled IBM Plex Sans Arabic with Arabic-only Unicode ranges. Latin UI text keeps its Latin stack.
- A user-created board/component name and typed console input are not translated.
- Technical errors from the browser/OS may remain in their original language.
- The translations are maintained in-repo; native-speaker review is still welcome. See [Localization and icons](LOCALIZATION-AND-ICONS.md).

---

## Collaboration and servers

The original optional WebSocket collaboration path remains, but **no public server is bundled or hosted** by this repository.

- **Open board → Connect to a REEO server** asks for a URL and connects with `wss:`/`ws:` depending on the address.
- The protocol relays board/add/remove/connect/move/toggle/chat messages.
- There is no authentication, room discovery, persistence, or conflict resolution in the client.
- Treat it as an experimental developer feature. Do not expose an unauthenticated server to the public internet.
- Vercel's CSP permits `wss:` connections for this feature but does not deploy a server.

For a classroom or team, the practical supported workflow is export/import of `.board` files, not live collaboration.

---

## Responsive and touch behavior

- The layout adapts from 320 px phones through tablets and desktops.
- Touch tools appear for coarse pointers and ≤900 px layouts.
- Dialogs are bounded to the visual viewport and measured after translation, font loading, resize, and keyboard changes.
- Popups flip/clamp at edges instead of rendering offscreen.
- Bottom-left recipe dock and bottom picker avoid the toolbar and each other.
- Safe-area insets are respected on notched devices.
- Forms and dialogs close on outside pointer-down or `Escape` without applying edits.
- Touch targets are enlarged; tested targets are at least 44 CSS px where the layout allows.

The detailed measured matrix is in [Testing](TESTING.md#browser-and-device-matrix) and [Visual audit](VISUAL-AUDIT.md).

---

## Accessibility

What is present:

- Semantic headings, labels, and `aria-label`s on icon-only controls.
- Keyboard focus styles on buttons, selects, inputs, and toolbar slots.
- Toolbar slots are focusable and activate with `Enter`/`Space`.
- The field guide traps focus, restores focus on close, and closes with `Escape`.
- Outside-click/touch and `Escape` dismissal for transient surfaces.
- Reduced-motion support for tip animations and optional animation settings.
- Localized `lang`/`dir` and language names.
- Live status messages for save/import/storage errors; tips have dismiss buttons.

What is still limited:

- Canvas editing is fundamentally pointer-oriented; there is no complete keyboard-only circuit builder.
- Screen-reader semantics for canvas geometry are not a substitute for a text/table representation.
- No formal WCAG audit or assistive-technology certification is recorded.
- Some legacy dialogs retain terse labels or raw technical diagnostics.

If you need a fully keyboard/screen-reader-accessible logic editor, REEO is not yet that product. Contributions that improve this without replacing the interface are welcome.

---

## Keyboard and touch quick reference

The complete table, including all canvas shortcuts and their caveats, is in [Controls and shortcuts](SHORTCUTS.md). The essentials:

| Action                 | Shortcut                       |
| ---------------------- | ------------------------------ |
| New / open board       | `Ctrl+N` / `Ctrl+O`            |
| Save                   | `Ctrl+S`                       |
| Undo / redo            | `Ctrl+Z` / `Ctrl+Y`            |
| Copy / paste           | `Ctrl+C` / `Ctrl+V`            |
| Pause simulation       | `Ctrl+P`                       |
| Console                | `Shift+T`                      |
| Tutorial               | `F1`                           |
| Settings               | `Ctrl+Shift+S`                 |
| Componentize selection | `Shift+C`                      |
| Add waypoint / jump    | `Shift+S` / `Shift+W`          |
| Edit under pointer     | `E`                            |
| Rotate under pointer   | `R`                            |
| Save custom component  | `Shift+R`                      |
| Open custom component  | `Shift+O`                      |
| Pan / zoom (keyboard)  | Arrows / `Page Up`/`Page Down` |
| Return to origin       | `Home`                         |
| Close surface          | `Escape`                       |

`Ctrl+N`/`Ctrl+O` are browser-reserved; use the menu if the browser intercepts them.

---

## Common workflows

### Test a truth table

1. Place two Inputs and the gate.
2. Wire both inputs to the gate.
3. Place an Output or LED after the gate.
4. Try `00`, `01`, `10`, `11`; record the output each time.
5. Right-click the gate symbol for the reference table and compare.

### Build a half adder

Inputs A/B → XOR (SUM) and AND (CARRY). Expected `A B → CARRY SUM`: `00→00`, `01→01`, `10→01`, `11→10`. Componentize it and reuse two copies plus an OR for a full adder.

### Gate a clock

Clock → AND input 1; an Input enable → AND input 2; AND → Counter/LED. With enable `0`, pulses stop; with enable `1`, they pass. Counter counts rising edges only.

### Make a lookup table

Place ROM, open **Edit ROM**, choose address/data widths, enter hex rows. Address bit 0 is the least-significant bit. Data bit 0 drives output pin 0. Connect outputs to LEDs or Display segment pins. Keep the table small while testing.

### Save and move a project

Save (`Ctrl+S`) → export from the header → copy the `.board` file to the other device → import there. There is no automatic transfer.

---

## Troubleshooting index

| Symptom                                    | Start here                                                  |
| ------------------------------------------ | ----------------------------------------------------------- |
| Board disappeared after clearing site data | [Storage](TROUBLESHOOTING.md#boards-and-storage)            |
| Import says invalid                        | [Import validation](TROUBLESHOOTING.md#import-and-export)   |
| Wire will not connect                      | [Wiring](TROUBLESHOOTING.md#wiring-and-components)          |
| Clock/counter behaves oddly                | [Simulation](TROUBLESHOOTING.md#simulation-and-timing)      |
| No sound                                   | [Audio](TROUBLESHOOTING.md#audio)                           |
| Arabic layout looks wrong                  | [Language/RTL](TROUBLESHOOTING.md#language-and-rtl)         |
| Blank page / 404 / CSP                     | [Deployment](TROUBLESHOOTING.md#web-deployment-and-runtime) |
| Native build or packaging failure          | [Platforms](PLATFORMS.md) and [Releasing](RELEASING.md)     |

---

## Glossary

| Term                | Meaning                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Board**           | A saved circuit file (`.board`), including components, wires, view, and variables. |
| **Component**       | A logic element on the grid (gate, source, sink, memory, custom block).            |
| **Port / pin**      | A connection point. White = input, black = output.                                 |
| **Wire**            | An orthogonal signal path between an output and an input.                          |
| **Fan-out**         | One output driving several wires/destinations.                                     |
| **Selection**       | A rectangular group of components/wires used for move/copy/delete/componentize.    |
| **Custom**          | A reusable subcircuit packaged as one component.                                   |
| **Componentize**    | Convert a selection into a Custom component.                                       |
| **Tick**            | One 16 ms processing pass of the update queue.                                     |
| **Saturation**      | The tick budget was exhausted; queued work remains.                                |
| **Ghost**           | A non-interactive dashed reference drawing used with a recipe.                     |
| **Waypoint**        | A saved camera position, not a circuit node.                                       |
| **Field guide**     | The searchable in-app manual/recipe/diagnostic dialog.                             |
| **Locale**          | `en`, `ar`, or `arz`; affects UI language and direction.                           |
| **Origin**          | Grid coordinate `0,0`; `Home` scrolls there.                                       |
| **Board file size** | Stored bytes of the JSON `.board`; import is capped at 2 MB.                       |
