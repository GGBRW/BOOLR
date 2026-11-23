# Component reference

REEO exposes **19 component types**. This page is the complete pin/property reference. The same material is available inside the app: **Quick guide → Every component**, with search, experiments, cautions, and a **Locate on grid** action.

> **Port convention:** white circle = input, black circle = output. A component update reads its inputs, computes, and pushes values to connected outputs. An unconnected input reads `0`.

## Summary

| Component  | Toolbar path     | Default footprint | Inputs   | Outputs  | Editable properties                 |
| ---------- | ---------------- | ----------------- | -------- | -------- | ----------------------------------- |
| Input      | I/O → Input      | 2 × 1             | 0        | 1        | name, position, size                |
| Output     | I/O → Output     | 2 × 1             | 1        | 0        | name, position, size                |
| Button     | I/O → Button     | 2 × 1             | 0        | 1        | name, position, size                |
| Constant   | I/O → Constant   | 2 × 1             | 0        | 1        | name, position, size, `value`*      |
| NOT        | `!`              | 1 × 1             | 1        | 1        | name, position, size                |
| AND        | `&`              | 2 × 2             | 2        | 1        | name, position, size                |
| OR         | `\|`             | 2 × 2             | 2        | 1        | name, position, size                |
| XOR        | `^`              | 2 × 2             | 2        | 1        | name, position, size                |
| Delay      | I/O → Delay      | 2 × 1             | 1        | 1        | name, position, size, `delay` ms    |
| Clock      | I/O → Clock      | 2 × 1             | 0        | 1        | name, position, size, `delay` ms    |
| Counter    | I/O → Counter    | 2 × 1             | 1        | 0        | name, position, size                |
| LED        | I/O → LED        | 1 × 1             | 1        | 0        | name, position, size, color         |
| Display    | I/O → Display    | 4 × 5             | 8        | 0        | name, position, size                |
| ROM        | I/O → ROM        | 3 × 8             | A        | D        | address/data widths, hex data       |
| Debug      | I/O → Debug      | 2 × 1             | 1        | 0        | name, position, size                |
| Beep       | I/O → Beep       | 2 × 1             | 1        | 0        | name, position, size, frequency, ms |
| TimerStart | I/O → TimerStart | 2 × 1             | 0        | 1        | name, position, size                |
| TimerEnd   | I/O → TimerEnd   | 2 × 1             | 1        | 0        | name, position, size                |
| Custom     | Custom / Saved   | 3 × 1 variable    | variable | variable | name, position, size, contents      |

\* The Constant's value is not exposed in the standard edit form. Its default is `1`; use a NOT, or the console (`edit <id> value 0`), when you need a fixed zero.

Sizes are in grid units (not pixels). A 2 × 1 component occupies two grid columns and one row, with pins on the grid edges. The edit dialog refuses sizes that cannot fit the pins.

---

## Sources

### Input switch

- **Pins:** one output (right).
- **Behavior:** click/tap flips `0 → 1` or `1 → 0`; the level persists.
- **Use it for:** truth-table inputs, enables, manual state.
- **Not the same as:** Button, which is momentary.
- **Caution:** an Input is not a clock. It changes only when you interact.

### Button

- **Pins:** one output (right).
- **Behavior:** outputs `1` while pressed and `0` on release.
- **Use it for:** rising edges into Counter, momentary alarms, custom-circuit controls.
- **Caution:** holding a button produces one continuous high level, not repeated pulses. Use Clock for repetition.

### Constant

- **Pins:** one output (right).
- **Behavior:** continuously outputs a fixed bit; default `1`.
- **Use it for:** an always-enabled gate input, a fixed zero through NOT, or testing a gate pin.
- **Caution:** do not wire two source outputs together to create logic. Use an explicit gate.

### Clock

- **Pins:** one output (right).
- **Property:** `delay` in milliseconds; this is the **half-period**.
- **Behavior:** alternates `0`/`1` automatically. `500 ms` gives about one full cycle per second.
- **Use it for:** counters, blinking LEDs, sequential demonstrations.
- **Caution:** browser timer resolution and background-tab throttling apply. Short periods are approximate. Configure a positive delay; a Clock without one opens the delay dialog and does not tick.

### TimerStart (experimental)

- **Pins:** one output (right).
- **Behavior:** click to toggle its output, and record a shared wall-clock start timestamp.
- **Use it for:** rough elapsed-time experiments alongside TimerEnd.
- **Caution:** not an independent stopwatch. There is one shared `TimerStart` timestamp for the whole board.

---

## Logic gates

All gates are single-bit and update combinationally.

### NOT

- **Pins:** 1 input (left), 1 output (right).
- **Truth table:** `0 → 1`, `1 → 0`.
- **Use it for:** inversion, active-low logic, building NAND/NOR from AND/OR.

### AND

- **Pins:** 2 inputs (left), 1 output (right).
- **Truth table (A B → OUT):** `00→0`, `01→0`, `10→0`, `11→1`.
- **Use it for:** interlocks, enable gates, carrying a signal only when both conditions hold.

### OR

- **Pins:** 2 inputs (left), 1 output (right).
- **Truth table:** `00→0`, `01→1`, `10→1`, `11→1`.
- **Use it for:** either-sensor alarms, combining alternative paths.

### XOR

- **Pins:** 2 inputs (left), 1 output (right).
- **Truth table:** `00→0`, `01→1`, `10→1`, `11→0`.
- **Use it for:** SUM in a half adder, inequality detection, controlled inversion.

### Building NAND/NOR

NAND = AND followed by NOT. NOR = OR followed by NOT. The field guide has a worked recipe and expected result for both. Test all four input rows before componentizing.

### Gate truth tables in the app

Right-click a gate symbol on the bottom toolbar to open its truth table. The same dialog includes the gate's vector symbol. The reference is static; it does not read your current wiring.

---

## Timing and counting

### Delay

- **Pins:** 1 input (left), 1 output (right).
- **Property:** `delay` in milliseconds.
- **Behavior:** each input transition is replayed at the output after the delay. Multiple quick transitions are queued in order, not merged.
- **Use it for:** deliberately delaying a path, observing stale state, building a pulse-train exercise.
- **Caution:** a newly placed Delay opens the delay editor; without a valid positive delay it does not produce useful output. Removal cancels pending callbacks.

### Counter

- **Pins:** one input (left); no output pins.
- **Display:** shows its integer value on the component.
- **Behavior:** increments on each `0 → 1` input edge. A high level that stays high does not keep counting.
- **Use it for:** counting button presses or gated clock pulses.
- **Caution:** there is **no reset pin and no binary output bus**. It cannot directly address a ROM. Use a separate binary state circuit or the ROM's address pins if you need bits.

### TimerEnd (experimental)

- **Pins:** one input (left).
- **Behavior:** when updated, writes the elapsed milliseconds since the shared TimerStart timestamp to the in-app console and calls the browser's `console.timeEnd`.
- **Use it for:** rough latency comparisons (direct path vs. Delay path).
- **Caution:** it is a diagnostic probe, not a calibrated measurement instrument. It does not expose a numeric output pin; its on-component value mirrors the input.

---

## Sinks and displays

### Output monitor

- **Pins:** one input (left).
- **Behavior:** displays the bit arriving at its input. It observes; it does not drive anything.
- **Use it for:** numeric checks after every stage, truth-table recording.
- **Caution:** a displayed `0` can mean “input low” or “nothing wired.” Check the connection before changing logic.

### LED

- **Pins:** one input (left).
- **Behavior:** lights when the input is `1`, dims at `0`. The default color is red; the context menu's color picker can change the palette color.
- **Use it for:** visual signal tracing, alarm/enable state.
- **Caution:** a dark LED can mean a genuine zero or a missing wire; use an Output monitor when in doubt.

### Display (seven-segment)

- **Footprint:** 4 × 5.
- **Pins:** eight inputs, labeled at useful zoom:
  - top: **A, B, C, D**
  - bottom: **E, F, G, DP**
- **Behavior:** each pin independently lights one segment. It does **not** decode a binary number. DP is the decimal point.
- **Use it for:** decoded digits, custom segment patterns, ROM-driven lookup displays.
- **Segment example:** 0 = A, B, C, D, E, F on and G off; 1 = B and C on.
- **Caution:** pin order is not a numeric bus. Wire and label each segment deliberately; a ROM lookup table needs one data bit per segment.

### Debug probe

- **Pins:** one input (left).
- **Behavior:** on update, writes `name: value` to notifications and the console.
- **Use it for:** finding the first unexpected stage in a chain.
- **Caution:** a fast clock produces many messages. Use slow sources, remove probes when done, and clear the console with `Ctrl+L`.

### Beep

- **Pins:** one input (left).
- **Properties:** `frequency` in Hz (default 700), `duration` in ms (default 200).
- **Behavior:** when updated with a high input, schedules a tone.
- **Use it for:** audible alarms.
- **Caution:** browsers require user interaction and may mute audio. Verify the bit with an LED first. Rapid updates can retrigger tones.

---

## Memory

### ROM

- **Footprint:** 3 × 8 default; height adjusts to the larger of address/data width.
- **Pins:** address inputs on the left (`addressWidth` pins), data outputs on the right (`dataWidth` pins).
- **Properties:**
  - `addressWidth`: integer number of address bits (default 4),
  - `dataWidth`: 4, 8, 16, or 32 bits (default 4),
  - `data`: hex string; `rom` is the parsed numeric array.
- **Addressing:** address pin 0 is the **least-significant bit**. The ROM concatenates address pins into an index.
- **Data:** output pin `i` gets bit `i` of the selected row. Reading a value “from highest to lowest” means reading data bit 3…0 for a 4-bit row.
- **Rows:** `2^addressWidth`. Hex digits per row: `dataWidth / 4`.
- **Example:** address width 1, data width 4, data `A5`:
  - address 0 → row `A` → bits `1010` on data pins 3…0,
  - address 1 → row `5` → bits `0101`.
- **Use it for:** lookup tables, seven-segment decoding, small combinational memories.
- **Caution:** adding an address width creates many pins; changing widths recreates the pin arrays, so recheck external wiring. The hex parser truncates/pads slices; validate your data visually. A ROM is read-only at runtime.

---

## Reusable circuits

### Custom

- **Footprint:** 3 × 1 initially; grows as pins require.
- **Pins:** external inputs/outputs created from the **Input** and **Output** components inside it.
- **Creation:** select a working circuit and choose **Componentize** (`Shift+C`).
- **Opening:** double-click, right-click → **Open**, or `Shift+O`.
- **Saving:** right-click → **Save component** or `Shift+R`; stored in the device-local Saved components library.
- **Behavior:** an update evaluates the internal circuit and propagates its external outputs. Internal component state (counters, delays, custom blocks) is preserved and disposed/rebuilt with the parent.
- **Use it for:** half/full adders, multiplexers, reusable gates, hierarchical teaching.
- **Caution:** the internal Input/Output set is the public interface. Adding/removing one changes the number of pins and can remove external wires. Test before saving; saved copies do not auto-update when the board copy changes.

---

## Worked circuits

The field guide contains these eight recipes with numbered steps, expected results, and optional dashed ghosts:

1. **Your first working circuit** — Input → LED; `0` off, `1` on.
2. **NAND or NOR from basic gates** — AND/OR + NOT; NAND `1,1,1,0`, NOR `1,0,0,0`.
3. **Half adder** — XOR = SUM, AND = CARRY; `00→00`, `01→01`, `10→01`, `11→10` (CARRY SUM).
4. **Full adder** — two half adders + OR carry; includes carry-in.
5. **Alarm with an enable switch** — `ALARM = ENABLE AND (A OR B)`.
6. **Two-input multiplexer** — two ANDs + NOT + OR; `S=0` selects A, `S=1` selects B.
7. **Count controlled clock pulses** — Clock + ENABLE AND → Counter; roughly one count per second at 500 ms half-period, with a possible extra edge when enabling while the clock is high.
8. **Tiny ROM lookup table** — address width 1, data width 4, data `A5`; address 0 → `1010`, address 1 → `0101`.

Recipes never edit your circuit automatically. A ghost is a dashed reference only.

---

## Differences from a hardware simulator

| Topic               | REEO behavior                                                            |
| ------------------- | ------------------------------------------------------------------------ |
| Signal levels       | Single bits `0`/`1`; no voltages, current, or high-impedance states.     |
| Propagation         | Queued component updates, not gate-delay or wire-delay physics.          |
| Clock               | Browser timer half-period, approximate under load/background throttling. |
| Feedback            | Allowed but bounded by a 10,000-update tick budget; can saturate.        |
| Multiple drivers    | Not a modeled electrical bus; avoid joining independent outputs.         |
| Displays            | Raw segment pins, not an automatic binary-to-seven-segment decoder.      |
| Counter             | Display-only; no binary outputs or reset.                                |
| ROM                 | Combinational lookup, read-only at runtime, hex data.                    |
| Custom components   | Structural hierarchy, bounded nesting (12 levels on import).             |
| Formal verification | Not provided. Structural advice is not proof of intended logic.          |

For the exact import/serialization rules see [Architecture → Board format](ARCHITECTURE.md#board-format).
