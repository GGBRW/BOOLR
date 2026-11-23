export interface PopupRect {
  left: number;
  top: number;
}
export function popupPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  margin = 8,
): PopupRect {
  const left = x + width > viewportWidth - margin ? x - width : x;
  const top = y + height > viewportHeight - margin ? y - height : y;
  return {
    left: Math.max(margin, Math.min(left, Math.max(margin, viewportWidth - width - margin))),
    top: Math.max(margin, Math.min(top, Math.max(margin, viewportHeight - height - margin))),
  };
}
const anchors = new WeakMap<HTMLElement, { x: number; y: number }>();
export function reflowPopup(element: HTMLElement): void {
  const anchor = anchors.get(element);
  if (anchor) positionPopup(element, anchor.x, anchor.y);
}
export function positionPopup(element: HTMLElement, x: number, y: number): void {
  anchors.set(element, { x, y });
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  const position = popupPosition(
    x - left,
    y - top,
    element.offsetWidth,
    element.offsetHeight,
    viewport?.width ?? innerWidth,
    viewport?.height ?? innerHeight,
  );
  position.left += left;
  position.top += top;
  // Keep anchored surfaces clear of the editor's fixed action strips.
  for (const control of document.querySelectorAll<HTMLElement>(
    '.brbtns, #toolbar, .reeo-platform-bar, .reeo-touch-tools',
  )) {
    if (control.contains(element)) continue;
    const rect = control.getBoundingClientRect();
    if (getComputedStyle(control).display === 'none') continue;
    if (
      position.left < rect.right &&
      position.left + element.offsetWidth > rect.left &&
      position.top < rect.bottom &&
      position.top + element.offsetHeight > rect.top
    ) {
      const above = rect.top - element.offsetHeight - 8;
      const below = rect.bottom + 8;
      position.top =
        above >= top + 8
          ? above
          : Math.min(below, top + (viewport?.height ?? innerHeight) - element.offsetHeight - 8);
      position.top = Math.max(top + 8, position.top);
    }
  }
  for (const [key, value] of Object.entries({
    left: `${position.left}px`,
    top: `${position.top}px`,
    bottom: 'auto',
    right: 'auto',
  })) {
    if (element.style.getPropertyValue(key) !== value) element.style.setProperty(key, value);
  }
}
