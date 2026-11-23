/** Coordinate the original popup APIs; never confirm forms when dismissing them. */
interface Surface extends HTMLElement {
  show?: (...args: unknown[]) => unknown;
  hide?: () => void;
}
export function installOverlays(): void {
  document.addEventListener('DOMContentLoaded', () => {
    const selectors = [
      '#dialog',
      '#reeo-language-menu',
      '#menu',
      '#contextMenu',
      '#waypointsMenu',
      '#list',
      '#componentInfo',
      '#hoverBalloon',
      '.tutorial',
      '.console',
      '.main-menu .new-board',
      '.main-menu .open-board',
      '.main-menu .settings',
      '#customComponentToolbar .menu',
    ];
    const surfaces = selectors.flatMap((selector) => {
      const element = document.querySelector<Surface>(selector);
      return element ? [element] : [];
    });
    let current: HTMLElement | undefined;
    let suppressHover = false;
    const visible = (element: HTMLElement) =>
      !element.hidden &&
      getComputedStyle(element).display !== 'none' &&
      element.style.opacity !== '0';
    function hideTips() {
      for (const tip of document.querySelectorAll<HTMLElement>('#toolbartip, #creditstip')) {
        tip.dataset.overlayClosed = 'true';
        tip.style.display = 'none';
        tip.style.opacity = '0';
      }
    }
    function dismiss(element: HTMLElement) {
      if (element.id === 'reeo-help-panel') document.dispatchEvent(new Event('reeo:close-help'));
      else {
        (element as Surface).hide?.call(element);
        element.style.display = 'none';
      }
      element.dataset.overlayClosed = 'true';
      if (current === element) current = undefined;
    }
    function open(element: HTMLElement) {
      for (const other of surfaces)
        if (other !== element && (current === other || visible(other))) dismiss(other);
      const help = document.getElementById('reeo-help-panel');
      if (help && help !== element && !help.hidden) dismiss(help);
      hideTips();
      current = element;
      element.dataset.overlayClosed = 'false';
    }
    for (const surface of surfaces) {
      const hide = surface.hide;
      if (hide)
        surface.hide = function () {
          this.dataset.overlayClosed = 'true';
          if (current === this) current = undefined;
          hide.call(this);
        };
      const show = surface.show;
      if (!show) continue;
      surface.show = function (...args) {
        const hover = this.id === 'hoverBalloon';
        if (hover && (suppressHover || (current && current !== this && visible(current)))) return;
        if (this.id === 'componentInfo' && current && current !== this && visible(current)) return;
        open(this);
        return show.apply(this, args);
      };
    }
    for (const trigger of document.querySelectorAll<HTMLElement>(
      '#toolbar > .slot, #credits button',
    )) {
      const enter = trigger.onmouseenter;
      trigger.onmouseenter = function (event) {
        if (current && visible(current)) return;
        hideTips();
        const tip = document.getElementById(
          trigger.closest('#credits') ? 'creditstip' : 'toolbartip',
        );
        if (tip) tip.dataset.overlayClosed = 'false';
        enter?.call(this, event);
      };
    }
    const custom = document.querySelector<HTMLElement>('#customComponentToolbar .menu');
    if (custom) {
      let wasOpen = false;
      new MutationObserver(() => {
        const isOpen = getComputedStyle(custom).display !== 'none';
        if (isOpen && !wasOpen) {
          wasOpen = true;
          open(custom);
        } else if (!isOpen) wasOpen = false;
      }).observe(custom, { attributes: true, attributeFilter: ['style'] });
    }
    document.addEventListener('reeo:overlay-open', (event) => {
      const id = (event as CustomEvent<string>).detail;
      const surface = document.getElementById(id);
      if (surface) open(surface);
    });
    document.addEventListener(
      'pointerdown',
      (event) => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        suppressHover = true;
        hideTips();
        for (const surface of surfaces) {
          if ((current !== surface && !visible(surface)) || surface.contains(target)) continue;
          // Let the originating toggle close itself, rather than closing and reopening it.
          if (
            surface.id === 'reeo-language-menu' &&
            document.getElementById('reeo-language')?.contains(target)
          )
            continue;
          if (surface.id === 'menu' && document.getElementById('menuopen')?.contains(target))
            continue;
          if (
            surface === custom &&
            document.querySelector('#customComponentToolbar .edit')?.contains(target)
          )
            continue;
          if (surface.id === 'list' && document.querySelector('#toolbar > .slot')?.contains(target))
            continue;
          dismiss(surface);
        }
        const help = document.getElementById('reeo-help-panel');
        if (help && !help.hidden && !help.contains(target)) dismiss(help);
      },
      true,
    );
    document.addEventListener(
      'pointermove',
      () => {
        suppressHover = false;
      },
      { passive: true },
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Escape') return;
        hideTips();
        suppressHover = true;
        let closed = false;
        for (const surface of surfaces)
          if (current === surface || visible(surface)) {
            dismiss(surface);
            closed = true;
          }
        const help = document.getElementById('reeo-help-panel');
        if (help && !help.hidden) {
          dismiss(help);
          closed = true;
        }
        if (closed) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
  });
}
