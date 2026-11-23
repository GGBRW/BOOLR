# Console reference

The REEO console is a small command window for inspecting and changing the **current board**. It is not a JavaScript REPL and has no access to browser APIs.

Open it with `Shift+T` or the bottom-right menu → **Open console**. `Escape` closes it; the expand control toggles fullscreen; `Ctrl+L` clears the history; `↑`/`↓` recall previous commands; `Tab` completes command names.

## How a command is parsed

- A command is split on **spaces**. There is no quoting, escaping, or semicolon chaining.
- The first token is the command name; the rest are arguments.
- Component names containing spaces cannot be targeted by name. Use the numeric **ID** or the **x y** position instead.
- A numeric target is treated as an **ID** (unless two numeric arguments are supplied, which are treated as a position).
- `~` means the current pointer grid position in an `x`/`y` argument.
- Commands are case-sensitive: `findComponent`, not `findcomponent`.

## Targets

Commands that identify a component accept one of:

| Target       | Form      | Notes                                                        |
| ------------ | --------- | ------------------------------------------------------------ |
| Component ID | `12`      | Shown in the hover balloon and `findComponent` output        |
| Position     | `4 2`     | Grid coordinate inside the component; `~ ~` uses the pointer |
| Name         | `Clock#0` | Exact, case-sensitive match; no spaces                       |

Lookup precedence depends on the command. With one numeric argument, `remove`/`findComponent` use ID. With two numeric arguments they use position. A non-numeric argument is a name.

## Commands

### `set [name] [value]`

Creates or replaces a board variable.

```text
set period 500
set label hello
```

- Names may contain ASCII letters, `'`, `` ` ``, `´`, `_`, and `-`. **Digits and spaces are rejected.**
- The value is a single token. A numeric-looking token is stored as a number; other text is stored as a string.
- Setting a variable recomputes every component property that was subscribed to it through an edit form (`Delay`, `Clock`, size fields, ROM widths/data), and updates those components immediately.
- There is no expression evaluation in `set`; use a literal.

Errors:

- `Invalid variable name`
- `No value given for variable <name>`

### `get [name]`

Prints the stored value.

```text
get period
```

`get` does not validate against the component list and does not print a “not found” message; an undefined variable prints an empty output. Use `variables` to inspect what exists.

### `variables`

Prints every board variable as `name: value`. Values are stored in the board file (JSON wrapper `variables`), so they survive save/export/import.

### `findComponent ([name] | [id] | [x] [y])`

```text
findComponent Clock#0
findComponent 3
findComponent 4 2
findComponent ~ ~
```

Prints the component's name and grid position, or a not-found message. This is a read-only lookup.

### `remove ([name] | [id] | [x] [y])`

```text
remove 4 2
remove Counter#1
remove 7
```

Removes the component and its attached wires, and returns `Removed component <name>`. Removal is undoable with `Ctrl+Z` where history is available; the console does not ask for confirmation.

### `edit ([name] | [id] | [x] [y]) [property] [value]`

Assigns a property directly.

```text
edit 4 2 properties.delay 500
edit Clock#0 properties.delay 2 * period
edit LED#2 color #ff0000
edit 3 name main_clock
edit Constant#0 value 0
```

- The property must already exist on the object and be a **string, number, or boolean**.
- The property path may be dotted (`properties.delay`, `properties.rom.0`). Arrays/objects as a whole are not assignable; individual array entries are, if the element type matches.
- Text values are coerced to the property's existing type. Numeric values support the expression syntax below, including variables.
- The remaining tokens after the property are joined, so spacing in expressions is allowed.
- `edit` does **not** create a variable subscription. Subsequent `set` changes will not automatically rewrite a property changed here unless that property was already subscribed by an edit form.
- Invalid property names and uncoercible values are ignored silently rather than raising an error. Confirm with `findComponent`/the UI or the hover balloon.

Useful properties: `name` (string), `properties.delay` (number, for Clock/Delay; it is nested, not a top-level `delay`), `properties.frequency` and `properties.duration` (Beep), `properties.addressWidth`/`properties.dataWidth` (ROM), `value` (number), `color` (string).

### `start` / `pause`

```text
pause
start
```

Sets the global simulation pause flag and updates the pause button. `start` and `pause` also work through the button and `Ctrl+P`; the console does not report the previous state.

### `help` / `?`

Prints the built-in command list. Note that the printed list is slightly older than this page; `start`, `help`, and `?` are not all shown.

## Expressions and variables

Numeric `edit` values, the Delay/Clock delay field, width/height fields, and ROM fields accept the same small arithmetic language:

```text
2 * period
(base + 1) / 2
-(4 % 3)
```

- Supported: decimal numbers, board variables, `+ - * / % ^`, parentheses, unary `+`/`-`, and whitespace.
- Everything else is rejected: no function calls, property access, assignment, strings, booleans, or `eval`.
- The input is capped at 500 characters.
- Unknown variables and division by zero produce no valid numeric value; the edit is rejected (`NaN`).
- Decimals are supported; results are JavaScript numbers and may be fractional. When a component requires an integer width/pin count, use an integer result.

Example loop:

```text
set period 500
edit Clock#0 properties.delay period
set period 250
```

The `set period 250` only rewrites the clock automatically if the delay was subscribed to `period` through the Delay/Clock edit form. Otherwise re-run `edit Clock#0 properties.delay period`.

## Command history and shortcuts

| Key       | Action                                               |
| --------- | ---------------------------------------------------- |
| `Enter`   | Run and echo the command                             |
| `↑` / `↓` | Move through history (newest first)                  |
| `Tab`     | Complete a command name when the input has no spaces |
| `Ctrl+L`  | Clear all console output                             |
| `Escape`  | Close the console                                    |

Tab completion inserts the first command in its built-in list matching the prefix (`remove`, `edit`, etc.); it does not cycle, and it does not complete names or properties.

## Console vs. other tools

| Need                                | Better tool                                        |
| ----------------------------------- | -------------------------------------------------- |
| Fine-grained visual editing         | Component edit dialogs and the field guide         |
| Finding a component                 | Hover balloon, `findComponent`, **Locate on grid** |
| Changing many pins/ports/ROM arrays | Dedicated editors; the console cannot assign them  |
| Logic validation                    | **Check this circuit** in the field guide          |
| Arbitrary scripting                 | Not supported; use the TypeScript modules/tests    |

## Safety and persistence

- Console operations mutate the live board. Save/export before risky bulk changes.
- `remove` and `edit` are not transactional; there is no undo stack specific to the console. Use board undo where an operation supports it.
- Variables are part of the saved board. Console history is not saved.
- The console is a developer/user convenience, not an authentication or sandbox boundary. Do not paste commands from untrusted sources into a board you cannot recreate.
