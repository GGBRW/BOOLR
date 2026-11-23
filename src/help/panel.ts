import { checkCircuit } from '../diagnostics';
import type { CheckComponent, CheckWire } from '../diagnostics';
import { render } from './render';
import { renderDock } from './dock';
import { button, node, text } from './dom';
import { labels } from './labels';
import { state } from './state';

declare const components: CheckComponent[];
declare const wires: CheckWire[];
declare const pauseSimulation: boolean;
declare const dragging: unknown;
declare const connecting: unknown;
declare const simulationSaturated: boolean;

export function openHelp(component?: string) {
  if (!state.panel) return;
  document.dispatchEvent(new CustomEvent('reeo:overlay-open', { detail: 'reeo-help-panel' }));
  state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  state.current = component === 'check' ? 'check' : component ? 'components' : 'start';
  state.query = component && component !== 'check' ? component : '';
  state.search.value = state.query;
  state.panel.hidden = false;
  state.backdrop.hidden = false;
  render();
  state.search.focus();
}
function closeHelp() {
  if (!state.panel) return;
  state.panel.hidden = true;
  state.backdrop.hidden = true;
  if (state.lastFocus?.isConnected) state.lastFocus.focus();
  else document.getElementById('canvas')?.focus();
}
export function installHelp() {
  document.addEventListener('reeo:close-help', closeHelp);
  document.addEventListener('DOMContentLoaded', () => {
    state.backdrop = node('div', undefined, 'reeo-help-backdrop');
    state.backdrop.hidden = true;
    state.backdrop.onclick = closeHelp;
    document.body.append(state.backdrop);
    state.panel = node('section', undefined, 'reeo-help-panel');
    state.panel.id = 'reeo-help-panel';
    state.panel.hidden = true;
    state.panel.setAttribute('role', 'dialog');
    state.panel.setAttribute('aria-modal', 'true');
    state.panel.setAttribute('data-no-i18n', '');
    const heading = node('h2');
    heading.id = 'reeo-help-heading';
    state.panel.setAttribute('aria-labelledby', heading.id);
    const header = node('header');
    const close = button(labels.close, closeHelp);
    header.append(heading, close);
    state.search = node('input');
    state.search.type = 'search';
    state.search.oninput = () => {
      state.query = state.search.value;
      if (state.current !== 'components' && state.current !== 'recipes')
        state.current = 'components';
      render();
    };
    state.tabs = node('nav');
    state.results = node('div', undefined, 'reeo-help-results');
    state.results.id = 'reeo-help-results';
    const preference = node('label');
    const enabled = node('input');
    enabled.type = 'checkbox';
    try {
      state.tipsEnabled = localStorage.getItem('reeo.contextualTips') !== 'off';
    } catch {
      /* session only */
    }
    enabled.checked = state.tipsEnabled;
    const caption = node('span');
    preference.append(enabled, caption);
    enabled.onchange = () => {
      state.tipsEnabled = enabled.checked;
      try {
        localStorage.setItem('reeo.contextualTips', state.tipsEnabled ? 'on' : 'off');
      } catch {
        /* session only */
      }
    };
    state.panel.append(header, state.search, state.tabs, preference, state.results);
    document.body.append(state.panel);
    state.dock = node('aside', undefined, 'reeo-guide-dock');
    state.dock.id = 'reeo-guide-dock';
    state.dock.setAttribute('data-no-i18n', '');
    state.dock.hidden = true;
    document.body.append(state.dock);
    // The state.dock floats over the canvas. Keep it translucent and click-through
    // while the pointer is working on the grid; it wakes up only when the
    // pointer is over (or very close to) the controls, or when focused.
    let dockAwake = false;
    const wakeDock = (awake: boolean) => {
      if (dockAwake === awake) return;
      dockAwake = awake;
      state.dock.classList.toggle('is-engaged', awake);
    };
    const nearDock = (x: number, y: number) => {
      if (state.dock.hidden) return false;
      const rect = state.dock.getBoundingClientRect();
      const pad = 42;
      return (
        x >= rect.left - pad &&
        x <= rect.right + pad &&
        y >= rect.top - pad &&
        y <= rect.bottom + pad
      );
    };
    document.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType === 'touch') return;
        wakeDock(nearDock(event.clientX, event.clientY));
      },
      { passive: true },
    );
    document.addEventListener('pointerdown', (event) => {
      if (nearDock(event.clientX, event.clientY)) wakeDock(true);
    });
    state.dock.addEventListener('pointerenter', () => wakeDock(true));
    state.dock.addEventListener('pointerleave', () => wakeDock(false));
    state.dock.addEventListener('focusin', () => wakeDock(true));
    state.dock.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!state.dock.contains(document.activeElement)) wakeDock(false);
      }, 0);
    });
    function localize() {
      heading.textContent = text(labels.title);
      close.textContent = text(labels.close);
      caption.textContent = text(labels.tips);
      state.search.placeholder = text(labels.search);
      state.search.setAttribute('aria-label', text(labels.search));
      state.dock.setAttribute('aria-label', text(labels.recipes));
      if (!state.panel.hidden) render();
      if (!state.dock.hidden) renderDock();
      document.querySelector('.reeo-smart-tip')?.remove();
    }
    new MutationObserver(localize).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
    localize();
    state.panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeHelp();
      }
      if (event.key === 'Tab') {
        const focusable = [
          ...state.panel.querySelectorAll<HTMLElement>('button:not(:disabled),input'),
        ];
        const first = focusable[0],
          last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
    // Delegation works with dynamically built component pickers.
    for (const item of document.querySelectorAll<HTMLElement>('#list > li')) {
      const type = /select\((\w+)\)/.exec(item.getAttribute('onclick') ?? '')?.[1];
      if (!type) continue;
      const help = button(labels.learn, () => openHelp(type));
      help.className = 'reeo-component-help';
      help.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16v1"/></svg>';
      help.setAttribute('aria-label', text(labels.learn));
      help.setAttribute('title', type);
      help.addEventListener('pointerdown', (e) => e.stopPropagation());
      help.onmouseup = (e: Event) => e.stopPropagation();
      help.onclick = (e: Event) => {
        e.stopPropagation();
        openHelp(type);
      };
      item.append(help);
    }
    let signature = '',
      changed = performance.now(),
      lastTip = -Infinity;
    const shown = new Set<string>();
    setInterval(() => {
      if (
        !state.tipsEnabled ||
        !state.panel.hidden ||
        dragging ||
        connecting ||
        components.length > 5000 ||
        wires.length > 25000
      )
        return;
      const next =
        components
          .map(
            (p) =>
              `${p.id}:${p.input.filter((i) => i.connection).length}:${p.properties?.delay}:${p.output.length}`,
          )
          .join('|') +
        ':' +
        wires.map((w) => `${!!w.from}:${!!w.to}:${w.input.length}:${w.output.length}`).join('|') +
        ':' +
        simulationSaturated;
      if (next !== signature) {
        signature = next;
        changed = performance.now();
        return;
      }
      if (performance.now() - changed < 2500 || performance.now() - lastTip < 30000) return;
      const finding = checkCircuit(components, wires, pauseSimulation, simulationSaturated).find(
        (f) =>
          f.id !== 'paused' && !shown.has(f.id) && (!f.id.endsWith(':input') || wires.length > 0),
      );
      if (!finding) return;
      shown.add(finding.id);
      lastTip = performance.now();
      const toast = node('div', undefined, 'tip reeo-smart-tip');
      toast.style.display = 'block';
      toast.style.opacity = '1';
      toast.setAttribute('data-no-i18n', '');
      toast.append(
        node('strong', text(labels.tip)),
        node('p', text(finding.message)),
        button(labels.review, () => {
          toast.remove();
          openHelp('check');
        }),
      );
      const dismiss = button(labels.dismiss, () => toast.remove());
      dismiss.className = 'reeo-tip-close';
      dismiss.textContent = '×';
      toast.append(dismiss);
      document.getElementById('reeo-toast-stack')?.append(toast);
      let timer = setTimeout(() => toast.remove(), 12000);
      toast.onmouseenter = () => clearTimeout(timer);
      toast.onmouseleave = () => {
        timer = setTimeout(() => toast.remove(), 12000);
      };
      toast.addEventListener('focusin', () => clearTimeout(timer));
      toast.addEventListener('focusout', () => {
        timer = setTimeout(() => toast.remove(), 12000);
      });
    }, 1200);
  });
}

state.open = openHelp;
state.close = closeHelp;
