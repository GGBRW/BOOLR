import { checkCircuit } from '../diagnostics';
import type { CheckComponent, CheckWire } from '../diagnostics';
import { circuitSVG } from '../icons';
import { basics, componentGuides, recipes } from '../help-content';
import { button, field, node, text } from './dom';
import { focusPart } from './actions';
import { renderDock } from './dock';
import { fitGhost, setGhost } from '../ghosts';
import { labels } from './labels';
import { state } from './state';

declare const components: (CheckComponent & { pos: { x: number; y: number }; outline?: number })[];
declare const wires: CheckWire[];
declare const pauseSimulation: boolean;
declare const simulationSaturated: boolean;

export function render() {
  if (!state.results) return;
  state.results.replaceChildren();
  state.tabs.replaceChildren();
  for (const key of ['start', 'components', 'recipes', 'check'] as const) {
    const tab = button(labels[key], () => {
      state.current = key;
      state.query = '';
      state.search.value = '';
      render();
    });
    tab.setAttribute('aria-pressed', String(state.current === key));
    state.tabs.append(tab);
  }
  if (state.current === 'start') {
    state.results.append(node('p', text(labels.intro)));
    const list = node('ol');
    for (const copy of basics) {
      list.append(node('li', text(copy)));
    }
    state.results.append(
      list,
      button(labels.recipes, () => {
        state.current = 'recipes';
        render();
      }),
    );
    return;
  }
  if (state.current === 'components') {
    const exact = componentGuides.find(
      (item) => item.id.toLowerCase() === state.query.trim().toLowerCase(),
    );
    const items = exact
      ? [exact]
      : componentGuides.filter((item) =>
          `${item.id} ${text(item.title)} ${text(item.behavior)} ${text(item.example)}`
            .toLowerCase()
            .includes(state.query.toLowerCase()),
        );
    for (const item of items) {
      const card = node('article', undefined, 'reeo-help-card');
      const heading = node('h3', `${text(item.title)} · ${item.id}`);
      const icon = node('span');
      icon.innerHTML = circuitSVG(item.id);
      heading.prepend(icon);
      card.append(
        heading,
        field(labels.behavior, item.behavior),
        field(labels.wiring, item.wiring),
        field(labels.example, item.example),
        field(labels.caution, item.caution),
      );
      state.results.append(card);
    }
    if (!items.length) state.results.append(node('p', text(labels.noResults)));
    return;
  }
  if (state.current === 'recipes') {
    const items = recipes.filter((item) =>
      `${item.id} ${text(item.title)} ${item.steps.map(text).join(' ')}`
        .toLowerCase()
        .includes(state.query.toLowerCase()),
    );
    for (const item of items) {
      const card = node('article', undefined, 'reeo-help-card');
      card.append(node('h3', text(item.title)));
      const list = node('ol');
      for (const copy of item.steps) list.append(node('li', text(copy)));
      card.append(
        list,
        field(labels.expected, item.expected),
        button(labels.pin, () => {
          state.activeRecipe = item;
          setGhost(item.id);
          state.step = 0;
          renderDock();
          state.close?.();
          state.dock.hidden = false;
          fitGhost();
        }),
      );
      state.results.append(card);
    }
    if (!items.length) state.results.append(node('p', text(labels.noResults)));
    return;
  }
  state.results.append(node('p', text(labels.scope)), button(labels.refresh, render));
  const findings = checkCircuit(components, wires, pauseSimulation, simulationSaturated);
  if (!findings.length) state.results.append(node('p', text(labels.noIssues)));
  for (const finding of findings) {
    const card = node('article', undefined, 'reeo-help-card');
    const part = components.find((p) => p.id === finding.componentId);
    card.append(
      node('h3', part?.name ?? text(labels.tip)),
      node('p', text(finding.message)),
      node('p', text(finding.fix)),
      button(labels.learn, () => state.open?.(finding.type)),
    );
    const id = finding.componentId;
    if (id !== undefined) card.append(button(labels.locate, () => focusPart(id)));
    state.results.append(card);
  }
}
