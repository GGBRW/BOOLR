# Component bodies, field guide, and contextual checks

## Using the guide

Open **Quick guide** in the existing top toolbar. Its four sections are Start here, Every component, Worked circuits, and Check this circuit. The component picker has individual question buttons; the grid component context menu also offers Component help. All new guide content is available in English, Arabic, and Egyptian Arabic.

The reference covers all 19 exposed component types. Each entry has behavior, wiring instructions, an experiment/use case, and cautions. Search accepts component names or words from descriptions; an exact component name takes precedence over broad matches.

Eight recipes cover a first signal path, NAND/NOR, half adder, full adder, alarm, multiplexer, clock/counter, and ROM lookup. Pin a recipe to follow numbered instructions alongside the editor. Steps advance manually: the app does not falsely claim to verify the learner's intended circuit or automatically complete it.

## On-grid rendering

The existing canvas renderer now delegates component bodies to `src/rendering.ts`. NOT/AND/OR/XOR have actual silhouettes and leads to the original port coordinates. Sources, timing components, chips, LEDs, displays, and custom components retain the original monochrome canvas palette and stroke weight; their shapes identify them without category colors. Existing value readouts, LED colors, display segments, delay animation, ports, placement footprints, simulation, and serialized boards remain in the original implementation.

## Visual integration

The guide and step coach reuse the existing dialog stylesheet for surfaces, typography, inputs, action buttons, hover, and pressed states. Reference sections are plain text with subtle separators, not a second card system. No blue/tinted surfaces or green/gold highlights are introduced. Focus indicators and the contextual-tip stack use the neutral editor palette. The original signal/LED/display colors and red selection remain functional colors, not a new theme.

## Diagnostics and limitations

`src/diagnostics.ts` supplies non-destructive, localized advice about unconnected inputs, nonpositive/missing timing, unconfigured ROM interfaces, empty custom interfaces, loose wire ends, joined independent drivers, paused simulation, and per-tick saturation. Wire traversal has a shared work budget and handles cycles. This is structural advice, not formal equivalence checking or an AI diagnosis of intent. An unused input can be intentional; a cycle is not automatically an error.

Automatic tips wait for stable wiring, avoid interrupting active dragging/connecting, deduplicate findings per session, throttle notifications, and stay in the existing bottom-right toast stack. The preference checkbox persists locally. Large graphs skip automatic checks; full correctness of arbitrary custom internals is not proven. Timely advice does not mean every possible mistake is detectable.

## Verification of this revision

- `bun run check`: TypeScript, Oxlint, Biome, Prettier, and **67 unit tests / 2,020 assertions** passed without linter warnings.
- `bun run build:vercel`: production build and **53 local asset references** verified.
- Production Playwright run: **63/63 passed**, including the Vercel CSP test, truth tables, serialization, wire propagation, custom inverter, timers, real mouse/touch interactions, localization, new guide/search/recipe flow, contextual tips and opt-out, and renderer invocation with live signal propagation.
- New guide tested at 320×568 in both RTL locales: bounds stay within the viewport and no horizontal overflow. Escape closes it; dialog focus is trapped and returned on close.
- Browser screenshots inspected for canvas bodies and the exact-name AND guide. Screenshots are local review artifacts, not bundled app assets.

### Measured UX scope

`tests/ux-measurements.spec.ts` passed **18/18 combinations**: English/Arabic/Egyptian Arabic at 320×568, 390×844, 844×390, 800×1280, 1366×768, and 1920×1080. Measurements come from actual rendered `getBoundingClientRect`, scroll/client width, and center-point hit testing, not design assumptions. Each case attaches JSON measurements to the Playwright result.

The suite asserts tested button/select targets are at least 43.9×43.9 CSS px (44px nominal), target centers are unobscured, floating surfaces have at least 5px horizontal viewport clearance, tested surfaces have no horizontal overflow, and their bottom edges remain in bounds. It exercises home/editor controls, new-board form, component edit, ROM edit, settings, component picker, navigation, context menu, waypoints, component information, tutorial, and console. The edge-docked tutorial intentionally has a zero left inset.

Corrections driven by these measurements: account for inline popup opacity during transitions, avoid unconstrained stretch widths in popups, and remove a legacy console translation that caused negative left coordinates. The localization observer now avoids rewriting unchanged document language/direction attributes, preventing an observer feedback loop with the live guide.

This is the tested scope, not a guarantee about every possible user-generated label or component configuration. Safari, native signed builds, screen-reader audit, native-speaker copy review, and a physical Samsung A11 remain untested.
