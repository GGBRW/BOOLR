import { translateLegacy } from '../legacy-messages';
import { locales } from './locale';
import type { Locale } from './locale';
import { en } from './messages-en';
import { ar } from './messages-ar';
import { arz } from './messages-arz';
import type { MessageKey, Messages } from './types';

export type { Locale } from './locale';
export type { MessageKey } from './types';

export const messages = { en, ar, arz } satisfies Record<Locale, Messages>;
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale);
}
export function translator(locale: Locale) {
  return (key: MessageKey): string => messages[locale][key];
}
export function installI18n(): void {
  let locale: Locale = 'en';
  try {
    const stored = localStorage.getItem('reeo.locale');
    locale = isLocale(stored) ? stored : navigator.language.startsWith('ar') ? 'ar' : 'en';
  } catch {
    /* English works without persistent storage. */
  }
  const keyByText = new Map(
    Object.entries(en).map(([key, text]) => [text as string, key as MessageKey]),
  );
  const originals = new WeakMap<Text, { source: string; rendered: string }>();
  const attributeSources = new WeakMap<Element, Map<string, string>>();
  const translate = (source: string) => {
    const filename = /^This board will be saved as (.+)$/.exec(source.trim());
    if (filename?.[1]) return `${messages[locale].fileSavedAs} \u2068${filename[1]}\u2069`;
    const key = keyByText.get(source.trim());
    return key
      ? source.replace(source.trim(), messages[locale][key])
      : translateLegacy(source, locale);
  };
  const blockSources = new WeakMap<Element, { html: string; source: string; rendered: string }>();
  function apply(): void {
    if (document.documentElement.lang !== locale) document.documentElement.lang = locale;
    const direction = locale === 'en' ? 'ltr' : 'rtl';
    if (document.documentElement.dir !== direction) document.documentElement.dir = direction;
    // Translate complete tutorial paragraphs, retaining the original rich English
    // markup for a reversible language switch (not disconnected text fragments).
    for (const block of document.querySelectorAll('.tutorial p')) {
      let entry = blockSources.get(block);
      if (!entry) {
        entry = {
          html: block.innerHTML,
          source: block.textContent?.trim().replace(/\s+/g, ' ') ?? '',
          rendered: block.innerHTML,
        };
        blockSources.set(block, entry);
      }
      const text = translate(entry.source);
      const next = locale === 'en' ? entry.html : text;
      if (entry.rendered !== next) {
        if (locale === 'en') block.innerHTML = entry.html;
        else block.textContent = text;
        entry.rendered = next;
      }
      block.setAttribute('data-no-i18n', '');
    }
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest(
          'script, style, svg, code, .material-icons, [data-no-i18n], .console .input',
        )
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      let entry = originals.get(node);
      if (!entry || node.data !== entry.rendered)
        entry = { source: node.data, rendered: node.data };
      entry.rendered = translate(entry.source);
      originals.set(node, entry);
      if (node.data !== entry.rendered) node.data = entry.rendered;
    }
    for (const element of document.querySelectorAll(
      '[title], [placeholder], [tooltip], [data-i18n], [aria-label]',
    )) {
      const key = element.getAttribute('data-i18n') as MessageKey | null;
      if (key && key in en && element.textContent !== messages[locale][key])
        element.textContent = messages[locale][key];
      let attributes = attributeSources.get(element);
      if (!attributes) {
        attributes = new Map();
        attributeSources.set(element, attributes);
      }
      for (const name of ['title', 'placeholder', 'tooltip', 'aria-label']) {
        const current = element.getAttribute(name);
        if (current === null) continue;
        const source = attributes.get(name) ?? current;
        attributes.set(name, source);
        const next = translate(source);
        if (current !== next) element.setAttribute(name, next);
      }
    }
    document
      .querySelector<HTMLSelectElement>('#reeo-language')
      ?.querySelectorAll('option')
      .forEach((option) => {
        option.selected = option.value === locale;
      });
  }
  window.reeoI18n = {
    setLocale(value) {
      if (!isLocale(value)) return;
      locale = value;
      try {
        localStorage.setItem('reeo.locale', locale);
      } catch {
        /* Session-only preference. */
      }
      apply();
    },
    t(key) {
      return key in en ? messages[locale][key as MessageKey] : key;
    },
  };
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      queueMicrotask(() => {
        pending = false;
        apply();
      });
    }).observe(document.body, { childList: true, characterData: true, subtree: true });
  });
}
