/** Phosphor for interface actions; ANSI-style circuit symbols for components. */
export const uiIcons: Record<string, string> = {
  update: 'arrows-clockwise',
  insert_drive_file: 'file',
  dns: 'hard-drives',
  color_lens: 'palette',
  merge_type: 'git-merge',
  mode_edit: 'pencil-simple',
  open_in_new: 'arrow-square-out',
  rotate_right: 'arrow-clockwise',
  compare_arrows: 'arrows-left-right',
  code: 'terminal-window',
  cable: 'git-merge',
  route: 'git-merge',
  view_column: 'list-bullets',
  view_stream: 'list-bullets',
  functions: 'cpu',
  add: 'plus',
  folder: 'folder-open',
  settings: 'gear',
  exit_to_app: 'sign-out',
  home: 'house',
  arrow_back: 'arrow-left',
  language: 'translate',
  file_upload: 'upload-simple',
  file_download: 'download-simple',
  help: 'question',
  help_outline: 'question',
  close: 'x',
  keyboard_arrow_left: 'caret-left',
  keyboard_arrow_right: 'caret-right',
  expand_less: 'caret-up',
  expand_more: 'caret-down',
  pause: 'pause',
  play_arrow: 'play',
  delete: 'trash',
  fullscreen: 'arrows-out',
  fullscreen_exit: 'arrows-in',
  zoom_in: 'magnifying-glass-plus',
  zoom_out: 'magnifying-glass-minus',
  swap_horiz: 'arrows-horizontal',
  undo: 'arrow-u-up-left',
  redo: 'arrow-u-up-right',
  my_location: 'crosshair',
  lightbulb_outline: 'lightbulb',
  warning: 'warning',
  error: 'warning-circle',
  edit: 'pencil-simple',
  content_copy: 'copy',
  content_paste: 'clipboard',
  content_cut: 'scissors',
  save: 'floppy-disk',
  featured_play_list: 'terminal-window',
  memory: 'cpu',
  list: 'list-bullets',
  check: 'check',
  done: 'check',
  access_time: 'clock',
  timer: 'timer',
  report_problem: 'bug',
  audiotrack: 'speaker-high',
  radio_button_checked: 'radio-button',
  visibility: 'eye',
  person: 'user',
  people: 'users',
  chat: 'chat-circle',
  send: 'paper-plane-right',
  info: 'info',
  more_vert: 'dots-three-vertical',
};

export const circuitPaths: Record<string, string> = {
  NOT: 'M3 12H8M8 5L21 12 8 19ZM25 12H29M25 12a2 2 0 1 0-4 0 2 2 0 1 0 4 0',
  AND: 'M2 7H8M2 17H8M8 3H16a9 9 0 0 1 0 18H8ZM25 12H30',
  OR: 'M2 7H8M2 17H8M7 3Q13 12 7 21Q22 21 26 12Q22 3 7 3ZM26 12H31',
  XOR: 'M1 7H7M1 17H7M4 3Q10 12 4 21M8 3Q14 12 8 21Q23 21 27 12Q23 3 8 3ZM27 12H31',
  Input: 'M1 12H8M8 5H24V19H8ZM24 12H31M12 12H20M17 9L20 12 17 15',
  Output: 'M1 12H8M8 5H24V19H8ZM24 12H31M12 12H20M15 9L12 12 15 15',
  Button: 'M2 15H10M22 15H30M10 15L22 8M16 3V7M12 3H20',
  Constant: 'M2 12H8M8 4H24V20H8ZM24 12H30M13 9H19M16 6V12M13 17H19',
  Clock: 'M2 16H7V7H15V16H23V7H30',
  Delay: 'M1 12H7M7 4H25V20H7ZM25 12H31M16 7V12L20 15',
  Counter: 'M1 12H7M7 3H25V21H7ZM11 8H14V12H11V16H14M19 8V16M25 12H31',
  ROM: 'M8 3H24V21H8ZM2 6H8M2 12H8M2 18H8M24 6H30M24 12H30M24 18H30M12 7H20V17H12Z',
  Custom: 'M8 3H24V21H8ZM2 6H8M2 12H8M2 18H8M24 6H30M24 12H30M24 18H30M12 12H16V7H20M16 12V17H20',
  LED: 'M2 12H9M9 5L21 12 9 19ZM21 5V19M21 12H30M23 7L28 2M26 2H28V4',
  Display: 'M7 2H25V22H7ZM12 6H20M11 7V11M21 7V11M12 12H20M11 13V17M21 13V17M12 18H20M23 19h.1',
  Beep: 'M3 9H9L16 3V21L9 15H3ZM21 7Q27 12 21 17M25 3Q34 12 25 21',
  Debug: 'M2 12H7M7 3H25V21H7ZM16 6V13M16 17h.1',
  TimerStart: 'M7 3H25V21H7ZM12 7L21 12 12 17ZM2 12H7',
  TimerEnd: 'M7 3H25V21H7ZM12 7H20V17H12ZM25 12H30',
  Buzzer: 'M2 10H8L15 4V20L8 14H2ZM19 8Q24 12 19 16M23 4Q30 12 23 20',
  Tone: 'M3 15H9L18 8V20L9 13H3ZM23 6V17M23 6L29 4V15L23 17',
  DipSwitch: 'M4 4H28V20H4ZM8 7V17M14 7V17M20 7V17M26 7V17M8 10H14M20 13H26',
  Slider: 'M8 3V21M8 8H25M3 8H8M8 8a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  RGBLed: 'M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 10v.1M8 15v.1M16 15v.1M24 8V4M26 10l3-3M28 14h4',
  RGBLed2: 'M4 4h10v10H4ZM16 16h10v10H16ZM14 8h3M8 16v3',
  BarGraph: 'M5 21V12M11 21V9M17 21V6M23 21V3M2 21H29',
  SevenSegment: 'M9 4H23V20H9ZM12 7H20M12 12H20M12 17H20M10 8V11M22 8V11M10 13V16M22 13V16',
  Lamp: 'M12 4a6 6 0 0 0-3 11v3h6v-3a6 6 0 0 0-3-11ZM10 21h4M9 18h6',
  Motor: 'M13 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM13 8l5 5-5 5',
  Splitter:
    'M2 12H8M8 12H15M15 12V5H23M15 12V9H23M15 12V15H23M15 12V19H23M23 5H29M23 9H29M23 15H29M23 19H29',
  Merger: 'M3 5H9M3 9H9M3 15H9M3 19H9M9 5V12H15M9 9V12M9 15V12M9 19V12M15 12H22M22 12H29',
  Procedural: 'M3 6H9M3 18H9M9 6Q14 12 9 18M13 9H17M15 7V13M20 7Q26 12 20 18M13 15H27',
};
export function circuitSVG(type: string): string {
  const path = circuitPaths[type] ?? circuitPaths.Custom;
  return `<svg class="reeo-circuit-icon" viewBox="0 0 32 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
}
export function drawComponentIcon(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  const path = circuitPaths[type];
  if (!path) return false;
  const scale = Math.min(width / 36, height / 28);
  ctx.save();
  ctx.translate(x + width / 2 - 16 * scale, y + height / 2 - 12 * scale);
  ctx.scale(scale, scale);
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(path));
  ctx.restore();
  return true;
}
/** Language-neutral diagrams replace old screenshots with baked-in English. */
function tutorialDiagram(index: string): string {
  const symbol = (name: string, x: number, y: number, scale = 2) =>
    `<g transform="translate(${x} ${y}) scale(${scale})"><path d="${circuitPaths[name]}"/></g>`;
  let content: string;
  if (index === '6' || index === '7') {
    const lines =
      index === '6'
        ? ['help', 'set example 200', 'get example']
        : ['set example 200', '2 * example - 50', 'set example 500'];
    content =
      `<rect x="8" y="8" width="404" height="144" rx="6" fill="#111" stroke="none"/>` +
      lines
        .map(
          (line, i) =>
            `<text x="28" y="44" transform="translate(0 ${i * 40})" font-family="monospace" font-size="16" fill="#ddd" stroke="none">${line}</text>`,
        )
        .join('');
  } else if (index === '0') {
    content =
      `<rect x="8" y="35" width="404" height="90" rx="6" fill="#111" stroke="none"/><g stroke="#ddd">` +
      ['Input', 'Output', 'Button', 'Clock', 'ROM']
        .map((name, i) => symbol(name, 20 + i * 78, 56))
        .join('') +
      '</g>';
  } else if (index === '4') {
    content =
      symbol('Custom', 145, 32, 4) +
      '<path d="M40 56H153M40 80H153M40 104H153M265 56H380M265 80H380M265 104H380"/>';
  } else {
    content =
      symbol('Input', 32, 56) +
      symbol('NOT', 176, 56) +
      symbol('Output', 320, 56) +
      '<path d="M94 80H178M238 80H322"/>';
    if (index === '1')
      content = `${symbol('Input', 100, 56)}${symbol('NOT', 250, 56)}<path d="M162 80H252"/>`;
    if (index === '3')
      content +=
        '<rect x="14" y="28" width="390" height="104" rx="4" stroke-dasharray="6 5" stroke="#478aaf"/>';
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 160" fill="none" stroke="#222" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><rect width="420" height="160" fill="#eee" stroke="none"/>${content}</svg>`;
}
export function installIcons(): void {
  function apply() {
    for (const image of document.querySelectorAll<HTMLImageElement>(
      'img[data-tutorial-diagram]:not([src])',
    )) {
      image.src = `data:image/svg+xml,${encodeURIComponent(tutorialDiagram(image.dataset.tutorialDiagram ?? '0'))}`;
    }
    for (const [id, token] of [
      ['reeo-zoom-in', 'zoom_in'],
      ['reeo-zoom-out', 'zoom_out'],
    ] as const) {
      const button = document.getElementById(id);
      if (button && !button.classList.contains('material-icons')) {
        button.classList.add('material-icons');
        button.textContent = token;
      }
    }
    for (const element of document.querySelectorAll<HTMLElement>('.material-icons')) {
      const token = element.textContent?.trim() ?? '';
      const name = uiIcons[token];
      if (!name) continue;
      const target = element.querySelector<HTMLElement>(':scope > .container') ?? element;
      target.classList.add('reeo-ui-icon');
      target.style.setProperty(
        '--reeo-icon',
        `url("${new URL(`icons/phosphor/${name}.svg`, document.baseURI).href}")`,
      );
      target.dataset.icon = name;
      if (!element.matches('button, [role="button"]')) element.setAttribute('aria-hidden', 'true');
    }
    const slots = document.querySelectorAll<HTMLElement>('#toolbar > .slot');
    ['Input', 'NOT', 'AND', 'OR', 'XOR', 'Custom'].forEach((type, index) => {
      const slot = slots[index];
      if (slot && !slot.querySelector('.reeo-circuit-icon')) slot.innerHTML = circuitSVG(type);
    });
    for (const item of document.querySelectorAll<HTMLElement>('#list > li')) {
      const type = /select\((\w+)\)/.exec(item.getAttribute('onclick') ?? '')?.[1];
      if (type && !item.querySelector('svg'))
        item.insertAdjacentHTML('afterbegin', circuitSVG(type));
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    new MutationObserver(apply).observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
}
