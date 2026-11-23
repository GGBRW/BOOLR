import type { Copy } from '../help-content';

export const text = (copy: Copy) =>
  copy[
    document.documentElement.lang === 'arz' ? 2 : document.documentElement.lang === 'ar' ? 1 : 0
  ];
export function node<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  content?: string,
  className?: string,
) {
  const el = document.createElement(tag);
  if (content) el.textContent = content;
  if (className) el.className = className;
  return el;
}
export function button(copy: Copy, action: () => void) {
  const el = node('button', text(copy));
  el.type = 'button';
  el.onclick = action;
  return el;
}

export function field(title: Copy, copy: Copy) {
  const section = node('section');
  section.append(node('h4', text(title)), node('p', text(copy)));
  return section;
}
