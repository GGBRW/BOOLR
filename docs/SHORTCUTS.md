# Controls and shortcuts

This page lists the controls that are actually wired in the application. Shortcuts apply to the **canvas** unless stated otherwise; click the canvas once to focus it after using a dialog.

> **Browser-reserved shortcuts:** `Ctrl+N` and `Ctrl+O` are handled when the canvas has focus, but the browser may intercept them before the page sees them. If nothing happens, use the bottom-right menu or the home-screen buttons. Opening the board menu no longer clears the circuit behind it.

## Mouse and trackpad

| Gesture                                   | Result                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Left click a toolbar component, then grid | Place that component                                                     |
| Left click an Input                       | Toggle `0`/`1`                                                           |
| Press a Button                            | Output `1` while held; `0` on release                                    |
| Drag from a black output pin              | Draw a wire; release over a white input pin to connect                   |
| Drag from an existing wire                | Start a branch from that wire                                            |
| `Ctrl` + drag a component                 | Move it, carrying attached wire ends                                     |
| `Ctrl` + drag a selection                 | Move the whole group                                                     |
| `Ctrl` + drag a pin                       | Move the pin to another side/position                                    |
| `Shift` + drag empty canvas               | Draw a selection rectangle                                               |
| Right click                               | Open the context menu for the component/wire/selection under the pointer |
| Right click while dragging                | Cancel and return the component/selection to its starting position       |
| Middle-drag                               | Pan                                                                      |
| `Alt` + drag                              | Pan                                                                      |
| `Ctrl` + drag empty canvas                | Pan                                                                      |
| `Ctrl` while drawing a wire               | Pan without dropping the wire                                            |
| `Shift` while drawing a wire              | Constrain to a straight horizontal/vertical segment                      |
| Wheel                                     | Zoom in/out around the pointer                                           |
| Trackpad two-finger scroll                | Pan                                                                      |
| Trackpad pinch / `Ctrl` + wheel           | Zoom around the pointer                                                  |
| Double click a Custom component           | Open its subcircuit                                                      |
| Hover a component                         | Show the small information balloon after a short delay                   |
| Hover a toolbar slot                      | Show its name; gates also advertise right-click truth tables             |

## Keyboard

### Editing and files

| Key                       | Action                                                               |
| ------------------------- | -------------------------------------------------------------------- |
| `Ctrl+N`                  | Open the New board form (browser-reserved; menu fallback)            |
| `Ctrl+O`                  | Open the Open board menu without clearing the current circuit        |
| `Ctrl+C`                  | Copy the selection, or the component under the pointer               |
| `Ctrl+V`                  | Paste at the pointer/context position                                |
| `Ctrl+Z`                  | Undo                                                                 |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo                                                                 |
| `Ctrl+S`                  | Save the current board (prompts for a file if it has none)           |
| `Ctrl+Shift+S`            | Open Settings                                                        |
| `Ctrl+P`                  | Pause/resume simulation                                              |
| `Delete`                  | Delete the selection, or the component/wire under the pointer        |
| `Escape`                  | Close the picker/context/waypoint menu and clear the selection       |
| `F1`                      | Toggle the tutorial                                                  |
| `F3`                      | Toggle the debug overlay                                             |
| `Shift+T`                 | Open the console                                                     |
| `T`                       | Open the legacy chat input (requires a collaboration server to send) |

### Component actions

| Key                     | Action                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| `E`                     | Edit the port, wire color, or component under the pointer              |
| `R`                     | Rotate the component under the pointer (blocked if a pin is connected) |
| `Shift+R`               | Save the Custom component under the pointer to Saved components        |
| `Shift+O`               | Open the Custom component under the pointer                            |
| `Shift+C`               | Componentize the current selection                                     |
| `Shift+S`               | Set a waypoint at the pointer (uses the component name when available) |
| `Shift+W`               | Open the waypoint jump list                                            |
| `Tab`                   | Select the type of the component under the pointer for placement       |
| `1`–`7`                 | Select toolbar slots: I/O, NOT, AND, OR, XOR, Custom, Saved            |
| Context-menu key (`93`) | Open the canvas context menu                                           |

`Tab` is a legacy placement shortcut, not a general “show details” key. Use the hover balloon or the field guide for details.

### Navigation

| Key             | Action                                 |
| --------------- | -------------------------------------- |
| Arrow keys      | Scroll by 5 grid units                 |
| `Home`          | Return the view to grid origin `0,0`   |
| `Page Up`       | Zoom in (roughly 1.5× current step)    |
| `Page Down`     | Zoom out                               |
| `Shift` + wheel | Pan horizontally instead of vertically |

## Touch

Touch tools appear on coarse-pointer and narrow layouts. Select one before dragging:

| Tool         | One-finger drag behavior                                       |
| ------------ | -------------------------------------------------------------- |
| **Interact** | Tap to place/toggle/press/start wires; no empty-canvas panning |
| **Move**     | Drag a component or selection                                  |
| **Pan**      | Drag the view                                                  |
| **Select**   | Drag a selection rectangle                                     |

| Gesture                        | Result                                                             |
| ------------------------------ | ------------------------------------------------------------------ |
| Tap a placed component         | Toggle an Input, press/release a Button, or begin a wire           |
| Long press (~550 ms)           | Open the context menu without placing/toggling                     |
| Double tap                     | Open a Custom component (synthesized as a double-click)            |
| Two-finger drag                | Pan                                                                |
| Pinch                          | Zoom around the gesture centre                                     |
| Two-finger gesture on a button | Cancels a pending single-finger press so the button does not stick |

**Add component**, **Fit circuit**, and zoom **−/+** are available in the touch strip. The strip hides on fine-pointer desktop layouts where the toolbar and mouse are primary.

## Console keys

| Key       | Action                           |
| --------- | -------------------------------- |
| `Enter`   | Run the command                  |
| `↑` / `↓` | Previous/next command in history |
| `Tab`     | Autocomplete a command name      |
| `Ctrl+L`  | Clear the console                |
| `Escape`  | Close the console                |

The console is documented separately in [Console reference](CONSOLE.md).

## Dialog and popup keys

| Key / gesture       | Action                                                  |
| ------------------- | ------------------------------------------------------- |
| `Escape`            | Close the focused surface without applying form edits   |
| Outside click/tap   | Dismiss transient surfaces; form values are not applied |
| `Enter`             | Activate the last option button in the original dialog  |
| `Tab` / `Shift+Tab` | Move through the field guide’s focus trap               |
| Click a swatch      | Choose an exact palette color in the color picker       |

Opening a different popup closes the previous one. A pinned recipe checklist is persistent editor guidance, not a popup.

## Platform differences

- **Browser:** keyboard shortcuts may be intercepted by the browser/OS. If a shortcut does nothing, click the canvas first and try the menu equivalent.
- **Electron:** the in-app **Quit** button saves before closing; operating-system window controls follow the host platform.
- **Android/iOS:** hardware keyboards may map differently; touch tools are the primary controls.
- **RTL:** shortcut labels stay LTR, and the circuit is not mirrored. `Shift`/`Ctrl` behavior is unchanged.

## Accessibility notes

Toolbar slots are focusable and activate with `Enter`/`Space`. Buttons, selects, and inputs have visible focus rings. The field guide traps and restores focus. Canvas geometry itself is not fully keyboard- or screen-reader-editable; see [User guide → Accessibility](USER-GUIDE.md#accessibility).
