import { positionPopup, reflowPopup } from './geometry';

/** Re-measure actual rendered surfaces after translation, fonts, resize and keyboard changes. */
export function installLayout(): void {
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const home = document.querySelector<HTMLElement>('.main-menu');
    const syncScreen = () => {
      const screen = home && getComputedStyle(home).display !== 'none' ? 'home' : 'editor';
      if (document.body.dataset.reeoScreen === screen) return;
      document.body.dataset.reeoScreen = screen;
      // A screen transition also dismisses an open language list.
      const languageMenu = document.querySelector<HTMLElement>('#reeo-language-menu');
      if (languageMenu && !languageMenu.hidden) {
        languageMenu.hidden = true;
        languageMenu.style.display = 'none';
        document.getElementById('reeo-language')?.setAttribute('aria-expanded', 'false');
      }
    };
    if (home)
      new MutationObserver(syncScreen).observe(home, {
        attributes: true,
        attributeFilter: ['style'],
      });
    syncScreen();
    let pending = false;
    const visible = (element: HTMLElement | null): element is HTMLElement =>
      !!element &&
      getComputedStyle(element).display !== 'none' &&
      (element.style.opacity || getComputedStyle(element).opacity) !== '0';
    function layout(): void {
      pending = false;
      const viewport = window.visualViewport;
      for (const [name, value] of Object.entries({
        width: viewport?.width ?? innerWidth,
        height: viewport?.height ?? innerHeight,
        left: viewport?.offsetLeft ?? 0,
        top: viewport?.offsetTop ?? 0,
      })) {
        const key = `--reeo-view-${name}`;
        const next = `${value}px`;
        if (root.style.getPropertyValue(key) !== next) root.style.setProperty(key, next);
      }
      for (const id of ['contextMenu', 'waypointsMenu', 'componentInfo', 'hoverBalloon']) {
        const popup = document.getElementById(id);
        if (visible(popup)) reflowPopup(popup);
      }
      const menu = document.getElementById('menu');
      if (menu) {
        const active = visible(menu);
        const events = active ? 'auto' : 'none';
        if (menu.style.pointerEvents !== events) menu.style.pointerEvents = events;
        const anchor = document.getElementById('menuopen')?.getBoundingClientRect();
        if (active && anchor)
          positionPopup(
            menu,
            Math.min(
              anchor.right,
              (viewport?.offsetLeft ?? 0) + (viewport?.width ?? innerWidth) - 8,
            ) - menu.offsetWidth,
            anchor.top - menu.offsetHeight - 8,
          );
      }
      const list = document.getElementById('list');
      const slot = document.querySelector('#toolbar > .slot')?.getBoundingClientRect();
      const dock = document.getElementById('reeo-guide-dock');
      const setStyle = (element: HTMLElement, key: string, value: string) => {
        if (element.style.getPropertyValue(key) !== value) element.style.setProperty(key, value);
      };
      if (dock && !dock.hidden) {
        resize.observe(dock);
        const left = (viewport?.offsetLeft ?? 0) + 12;
        const edge = (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight);
        let top = (viewport?.offsetTop ?? 0) + 12;
        for (const control of document.querySelectorAll<HTMLElement>(
          '.reeo-platform-bar, .reeo-touch-tools',
        )) {
          const rect = control.getBoundingClientRect();
          if (visible(control) && rect.left < left + dock.offsetWidth && rect.right > left)
            top = Math.max(top, rect.bottom + 12);
        }
        let bottom = edge - 12;
        for (const control of document.querySelectorAll<HTMLElement>('#toolbar, .brbtns')) {
          if (visible(control)) bottom = Math.min(bottom, control.getBoundingClientRect().top - 12);
        }
        const available = Math.max(44, bottom - top);
        const sideFits =
          !!list &&
          left + dock.offsetWidth + 12 + list.offsetWidth <=
            (viewport?.offsetLeft ?? 0) + (viewport?.width ?? innerWidth) - 8;
        setStyle(dock, 'left', `${left}px`);
        setStyle(dock, 'top', 'auto');
        setStyle(dock, 'bottom', `${innerHeight - bottom}px`);
        setStyle(
          dock,
          'max-height',
          `${visible(list) && !sideFits ? available * 0.48 : available}px`,
        );
        if (visible(list) && slot) {
          const rect = dock.getBoundingClientRect();
          // Keep the checklist bottom-left; place the picker beside it or above it.
          const pickerBottom = sideFits ? bottom : rect.top - 8;
          const pickerLeft = sideFits ? rect.right + 12 : left;
          setStyle(list, 'max-height', `${Math.max(44, pickerBottom - top)}px`);
          positionPopup(list, pickerLeft, Math.max(top, pickerBottom - list.offsetHeight));
        }
      } else {
        if (list) setStyle(list, 'max-height', '');
        if (visible(list) && slot) positionPopup(list, slot.left, slot.top - list.offsetHeight - 8);
      }
      const custom = document.querySelector<HTMLElement>('#customComponentToolbar .menu');
      const edit = document.querySelector('#customComponentToolbar .edit')?.getBoundingClientRect();
      if (visible(custom) && edit)
        positionPopup(custom, edit.right - custom.offsetWidth, edit.bottom + 8);
      const tooltip = document.getElementById('toolbartip');
      const hovered = document.querySelector('#toolbar > .slot:hover')?.getBoundingClientRect();
      if (visible(tooltip) && hovered)
        positionPopup(
          tooltip,
          hovered.left + (hovered.width - tooltip.offsetWidth) / 2,
          hovered.top - tooltip.offsetHeight - 8,
        );
    }
    function schedule(): void {
      if (pending) return;
      pending = true;
      requestAnimationFrame(layout);
    }
    const resize = new ResizeObserver(schedule);
    for (const element of document.querySelectorAll(
      '#dialog, .main-menu .sub, .tutorial, #contextMenu, #menu, #list, #waypointsMenu, #componentInfo, #toolbartip, #hoverBalloon, #customComponentToolbar, .reeo-platform-bar, .reeo-touch-tools',
    ))
      resize.observe(element);
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'hidden'],
    });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('scroll', schedule);
    document.fonts.addEventListener('loadingdone', schedule);
    void document.fonts.ready.then(schedule);
    schedule();
  });
}
