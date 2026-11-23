import { setGhost, toggleGhost, fitGhost } from './ghosts';
import { basics, componentGuides, recipes } from './help-content';
import type { Copy, Recipe } from './help-content';
import { checkCircuit } from './diagnostics';
import type { CheckComponent, CheckWire } from './diagnostics';
import { circuitSVG } from './icons';

declare const components: (CheckComponent & { pos: { x: number; y: number }; outline?: number })[];
declare const wires: CheckWire[];
declare const pauseSimulation: boolean;
declare const dragging: unknown;
declare const connecting: unknown;
declare const simulationSaturated: boolean;
declare let offset: { x: number; y: number };
declare const zoom: number;
const labels = {
  title: ['Circuit field guide', 'دليل بناء الدوائر', 'دليل بناء الدواير'],
  start: ['Start here', 'ابدأ هنا', 'ابدأ هنا'],
  components: ['Every component', 'جميع المكوّنات', 'كل المكوّنات'],
  recipes: ['Worked circuits', 'دوائر خطوة بخطوة', 'دواير خطوة بخطوة'],
  check: ['Check this circuit', 'فحص هذه الدائرة', 'افحص الدايرة دي'],
  search: ['Search components and circuits', 'البحث عن مكوّنات ودوائر', 'دوّر على مكوّنات ودواير'],
  close: ['Back to editor', 'العودة للمحرر', 'ارجع للمحرّر'],
  behavior: ['What it does', 'وظيفته', 'بيعمل إيه'],
  wiring: ['How to connect it', 'طريقة توصيله', 'توصّله إزاي'],
  example: ['Useful experiment', 'تجربة مفيدة', 'تجربة مفيدة'],
  caution: ['Watch out', 'انتبه', 'خد بالك'],
  expected: ['Expected result', 'النتيجة المتوقعة', 'النتيجة المتوقعة'],
  pin: [
    'Follow these steps while building',
    'متابعة الخطوات أثناء البناء',
    'تابع الخطوات وإنت بتبني',
  ],
  next: ['Next step', 'الخطوة التالية', 'الخطوة اللي بعدها'],
  previous: ['Previous step', 'الخطوة السابقة', 'الخطوة اللي فاتت'],
  finish: ['Finish checklist', 'إنهاء قائمة الخطوات', 'خلّص قائمة الخطوات'],
  refresh: ['Check again', 'إعادة الفحص', 'افحص تاني'],
  noIssues: [
    'No issues found by these structural checks. This does not prove the intended logic is correct: test the truth table and timing.',
    'لم تظهر ملاحظات في الفحص البنيوي. لا يثبت ذلك صحة المنطق المقصود؛ اختبر جدول الحقيقة والتوقيت.',
    'الفحص البنيوي ملقاش ملاحظات. ده مش دليل إن المنطق اللي تقصده صح؛ جرّب جدول الحقيقة والتوقيت.',
  ],
  intro: [
    'Learn one small block at a time. These guides explain the actual REEO components, not an idealized electronics simulator. No action in this guide edits your circuit.',
    'تعلّم كتلة صغيرة في كل مرة. يشرح الدليل مكوّنات REEO الفعلية لا محاكي إلكترونيات مثاليًا. لا يغيّر أي إجراء هنا دائرتك.',
    'اتعلّم كتلة صغيرة كل مرة. الدليل بيشرح مكوّنات REEO الفعلية، مش محاكي إلكترونيات مثالي. مفيش إجراء هنا بيغيّر دايرتك.',
  ],
  review: ['Review', 'مراجعة', 'راجع'],
  learn: ['Read component guide', 'قراءة دليل المكوّن', 'اقرأ دليل المكوّن'],
  locate: ['Locate on grid', 'تحديده على الشبكة', 'ورّيه على الشبكة'],
  tip: ['Circuit tip', 'نصيحة للدائرة', 'نصيحة للدايرة'],
  tips: ['Automatic contextual tips', 'نصائح سياقية تلقائية', 'نصايح تلقائية حسب السياق'],
  dismiss: ['Dismiss tip', 'إغلاق النصيحة', 'اقفل النصيحة'],
  noResults: [
    'No matches. Try a component name such as AND, Clock, or ROM.',
    'لا توجد نتائج. جرّب اسمًا مثل AND أو ساعة أو ROM.',
    'مفيش نتايج. جرّب اسم زي AND أو ساعة أو ROM.',
  ],
  scope: [
    'Checks cover the current board or opened subcircuit. Disconnected inputs can be intentional. Suggestions never change wiring automatically.',
    'يفحص المحرر اللوحة الحالية أو الدائرة الفرعية المفتوحة. قد تكون المداخل غير الموصلة مقصودة. لا تغيّر الاقتراحات التوصيل تلقائيًا.',
    'الفحص للوحة الحالية أو الدايرة الفرعية المفتوحة. المداخل اللي مش متوصّلة ممكن تكون مقصودة. الاقتراحات مبتغيّرش التوصيل لوحدها.',
  ],
} satisfies Record<string, Copy>;
type Tab = 'start' | 'components' | 'recipes' | 'check';
const text = (copy: Copy) =>
  copy[
    document.documentElement.lang === 'arz' ? 2 : document.documentElement.lang === 'ar' ? 1 : 0
  ];
function node<K extends keyof HTMLElementTagNameMap>(tag: K, content?: string, className?: string) {
  const el = document.createElement(tag);
  if (content) el.textContent = content;
  if (className) el.className = className;
  return el;
}
function button(copy: Copy, action: () => void) {
  const el = node('button', text(copy));
  el.type = 'button';
  el.onclick = action;
  return el;
}
let backdrop: HTMLElement;
let panel: HTMLElement,
  results: HTMLElement,
  search: HTMLInputElement,
  tabs: HTMLElement,
  dock: HTMLElement;
let current: Tab = 'start',
  query = '',
  lastFocus: HTMLElement | null = null,
  activeRecipe: Recipe | undefined,
  step = 0;
let tipsEnabled = true;
function focusPart(id: number | string) {
  const part = components.find((p) => p.id === id);
  if (!part) return;
  offset.x = part.pos.x - innerWidth / (2 * zoom);
  offset.y = part.pos.y + innerHeight / (2 * zoom);
  part.outline = 1;
  setTimeout(() => (part.outline = 0), 2000);
  closeHelp();
}
function field(title: Copy, copy: Copy) {
  const section = node('section');
  section.append(node('h4', text(title)), node('p', text(copy)));
  return section;
}
function render() {
  if (!results) return;
  results.replaceChildren();
  tabs.replaceChildren();
  for (const key of ['start', 'components', 'recipes', 'check'] as const) {
    const tab = button(labels[key], () => {
      current = key;
      query = '';
      search.value = '';
      render();
    });
    tab.setAttribute('aria-pressed', String(current === key));
    tabs.append(tab);
  }
  if (current === 'start') {
    results.append(node('p', text(labels.intro)));
    const list = node('ol');
    for (const copy of basics) {
      list.append(node('li', text(copy)));
    }
    results.append(
      list,
      button(labels.recipes, () => {
        current = 'recipes';
        render();
      }),
    );
    return;
  }
  if (current === 'components') {
    const exact = componentGuides.find(
      (item) => item.id.toLowerCase() === query.trim().toLowerCase(),
    );
    const items = exact
      ? [exact]
      : componentGuides.filter((item) =>
          `${item.id} ${text(item.title)} ${text(item.behavior)} ${text(item.example)}`
            .toLowerCase()
            .includes(query.toLowerCase()),
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
      results.append(card);
    }
    if (!items.length) results.append(node('p', text(labels.noResults)));
    return;
  }
  if (current === 'recipes') {
    const items = recipes.filter((item) =>
      `${item.id} ${text(item.title)} ${item.steps.map(text).join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
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
          activeRecipe = item;
          setGhost(item.id);
          step = 0;
          renderDock();
          closeHelp();
          dock.hidden = false;
          fitGhost();
        }),
      );
      results.append(card);
    }
    if (!items.length) results.append(node('p', text(labels.noResults)));
    return;
  }
  results.append(node('p', text(labels.scope)), button(labels.refresh, render));
  const findings = checkCircuit(components, wires, pauseSimulation, simulationSaturated);
  if (!findings.length) results.append(node('p', text(labels.noIssues)));
  for (const finding of findings) {
    const card = node('article', undefined, 'reeo-help-card');
    const part = components.find((p) => p.id === finding.componentId);
    card.append(
      node('h3', part?.name ?? text(labels.tip)),
      node('p', text(finding.message)),
      node('p', text(finding.fix)),
      button(labels.learn, () => openHelp(finding.type)),
    );
    const id = finding.componentId;
    if (id !== undefined) card.append(button(labels.locate, () => focusPart(id)));
    results.append(card);
  }
}
function renderDock() {
  dock.replaceChildren();
  const recipe = activeRecipe;
  const activeStep = recipe?.steps[step];
  if (!recipe || !activeStep) return;
  dock.append(
    node('strong', `${text(recipe.title)} · ${step + 1}/${recipe.steps.length}`),
    node('p', text(activeStep)),
  );
  const ghost = button(['Hide ghost', 'إخفاء المخطط', 'اخفي الرسم'], () => {
    const visible = toggleGhost();
    ghost.textContent = text(
      visible
        ? ['Hide ghost', 'إخفاء المخطط', 'اخفي الرسم']
        : ['Show ghost', 'إظهار المخطط', 'ورّي الرسم'],
    );
  });
  dock.append(ghost, button(['Fit guide', 'احتواء المخطط', 'اعرض الرسم كله'], fitGhost));
  const actions = node('div');
  const previous = button(labels.previous, () => {
    step--;
    renderDock();
  });
  previous.disabled = step === 0;
  actions.append(
    previous,
    button(step === recipe.steps.length - 1 ? labels.finish : labels.next, () => {
      if (step === recipe.steps.length - 1) {
        dock.hidden = true;
        setGhost(undefined);
      } else {
        step++;
        renderDock();
      }
    }),
    button(labels.close, () => {
      dock.hidden = true;
      setGhost(undefined);
    }),
  );
  dock.append(actions);
}
export function openHelp(component?: string) {
  if (!panel) return;
  document.dispatchEvent(new CustomEvent('reeo:overlay-open', { detail: 'reeo-help-panel' }));
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  current = component === 'check' ? 'check' : component ? 'components' : 'start';
  query = component && component !== 'check' ? component : '';
  search.value = query;
  panel.hidden = false;
  backdrop.hidden = false;
  render();
  search.focus();
}
function closeHelp() {
  if (!panel) return;
  panel.hidden = true;
  backdrop.hidden = true;
  if (lastFocus?.isConnected) lastFocus.focus();
  else document.getElementById('canvas')?.focus();
}
export function installHelp() {
  document.addEventListener('reeo:close-help', closeHelp);
  document.addEventListener('DOMContentLoaded', () => {
    backdrop = node('div', undefined, 'reeo-help-backdrop');
    backdrop.hidden = true;
    backdrop.onclick = closeHelp;
    document.body.append(backdrop);
    panel = node('section', undefined, 'reeo-help-panel');
    panel.id = 'reeo-help-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('data-no-i18n', '');
    const heading = node('h2');
    heading.id = 'reeo-help-heading';
    panel.setAttribute('aria-labelledby', heading.id);
    const header = node('header');
    const close = button(labels.close, closeHelp);
    header.append(heading, close);
    search = node('input');
    search.type = 'search';
    search.oninput = () => {
      query = search.value;
      if (current !== 'components' && current !== 'recipes') current = 'components';
      render();
    };
    tabs = node('nav');
    results = node('div', undefined, 'reeo-help-results');
    results.id = 'reeo-help-results';
    const preference = node('label');
    const enabled = node('input');
    enabled.type = 'checkbox';
    try {
      tipsEnabled = localStorage.getItem('reeo.contextualTips') !== 'off';
    } catch {
      /* session only */
    }
    enabled.checked = tipsEnabled;
    const caption = node('span');
    preference.append(enabled, caption);
    enabled.onchange = () => {
      tipsEnabled = enabled.checked;
      try {
        localStorage.setItem('reeo.contextualTips', tipsEnabled ? 'on' : 'off');
      } catch {
        /* session only */
      }
    };
    panel.append(header, search, tabs, preference, results);
    document.body.append(panel);
    dock = node('aside', undefined, 'reeo-guide-dock');
    dock.id = 'reeo-guide-dock';
    dock.setAttribute('data-no-i18n', '');
    dock.hidden = true;
    document.body.append(dock);
    // The dock floats over the canvas. Keep it translucent and click-through
    // while the pointer is working on the grid; it wakes up only when the
    // pointer is over (or very close to) the controls, or when focused.
    let dockAwake = false;
    const wakeDock = (awake: boolean) => {
      if (dockAwake === awake) return;
      dockAwake = awake;
      dock.classList.toggle('is-engaged', awake);
    };
    const nearDock = (x: number, y: number) => {
      if (dock.hidden) return false;
      const rect = dock.getBoundingClientRect();
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
    dock.addEventListener('pointerenter', () => wakeDock(true));
    dock.addEventListener('pointerleave', () => wakeDock(false));
    dock.addEventListener('focusin', () => wakeDock(true));
    dock.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!dock.contains(document.activeElement)) wakeDock(false);
      }, 0);
    });
    function localize() {
      heading.textContent = text(labels.title);
      close.textContent = text(labels.close);
      caption.textContent = text(labels.tips);
      search.placeholder = text(labels.search);
      search.setAttribute('aria-label', text(labels.search));
      dock.setAttribute('aria-label', text(labels.recipes));
      if (!panel.hidden) render();
      if (!dock.hidden) renderDock();
      document.querySelector('.reeo-smart-tip')?.remove();
    }
    new MutationObserver(localize).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
    localize();
    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeHelp();
      }
      if (event.key === 'Tab') {
        const focusable = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled),input')];
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
      help.onmouseup = (e) => e.stopPropagation();
      help.onclick = (e) => {
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
        !tipsEnabled ||
        !panel.hidden ||
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
