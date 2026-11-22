/** Keep the native select as the form/API boundary, but use the editor menu surface. */
export function installLanguagePicker(): void {
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector<HTMLSelectElement>('#reeo-language');
    if (!select) return;
    const menu = Object.assign(document.createElement('div'), {
      show() {
        menu.hidden = false;
        menu.style.display = 'block';
        menu.style.opacity = '1';
        select.setAttribute('aria-expanded', 'true');
        for (const option of menu.querySelectorAll<HTMLButtonElement>('[role=option]')) {
          option.setAttribute('aria-selected', String(option.value === select.value));
        }
      },
      hide() {
        menu.hidden = true;
        menu.style.display = 'none';
        select.setAttribute('aria-expanded', 'false');
      },
    });
    menu.id = 'reeo-language-menu';
    menu.className = 'reeo-language-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'Choose language');
    menu.setAttribute('data-no-i18n', '');
    menu.hidden = true;
    select.setAttribute('aria-controls', menu.id);
    select.setAttribute('aria-haspopup', 'listbox');
    select.setAttribute('aria-expanded', 'false');
    for (const option of select.options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.value = option.value;
      button.textContent = option.textContent;
      button.lang = option.value;
      button.dir = option.value === 'en' ? 'ltr' : 'rtl';
      button.setAttribute('role', 'option');
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        menu.hide();
        select.focus();
      };
      menu.append(button);
    }
    const label = select.closest('label');
    if (!label) return;
    const control = document.createElement('div');
    control.className = 'reeo-language-control';
    label.before(control);
    control.append(label, menu);
    const focusSelected = () => {
      const options = [...menu.querySelectorAll<HTMLButtonElement>('button')];
      (options.find((option) => option.value === select.value) ?? options[0])?.focus();
    };
    select.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if (!menu.hidden) menu.hide();
      else {
        menu.show();
        focusSelected();
      }
    });
    select.addEventListener('keydown', (event) => {
      if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      menu.show();
      focusSelected();
    });
    menu.addEventListener('keydown', (event) => {
      const options = [...menu.querySelectorAll<HTMLButtonElement>('button')];
      const index = options.indexOf(document.activeElement as HTMLButtonElement);
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? options.length - 1
            : event.key === 'ArrowDown'
              ? (index + 1) % options.length
              : event.key === 'ArrowUp'
                ? (index + options.length - 1) % options.length
                : undefined;
      if (next !== undefined) {
        event.preventDefault();
        options[next]?.focus();
      }
      if (event.key === 'Tab') menu.hide();
    });
  });
}
