import { translateLegacy } from './legacy-messages';
export const locales = ['en', 'ar', 'arz'] as const;
export type Locale = (typeof locales)[number];
const en = {
  fileSavedAs: 'This board will be saved as',
  mainMenu: 'Main menu',
  newBoard: 'NEW BOARD',
  openBoard: 'OPEN BOARD',
  settings: 'SETTINGS',
  quit: 'QUIT',
  createBoard: 'Create new board',
  boardName: 'Board name',
  cancel: 'Cancel',
  create: 'Create',
  open: 'Open board',
  preferences: 'Settings',
  tutorial: 'Tutorial',
  loading: 'LOADING...',
  noBoards: 'You have no saved boards',
  okay: 'OK',
  welcome: 'Welcome',
  yesTutorial: 'Yes please!',
  start: 'No, just start',
  needTutorial: 'Need a tutorial to learn how everything works?',
  saveBoard: 'Save board',
  new: 'New board',
  console: 'Open console',
  openTutorial: 'Open tutorial',
  export: 'Export board',
  import: 'Import board',
  language: 'Language',
  help: 'Quick guide',
  developer: 'Developer',
  interact: 'Interact',
  move: 'Move',
  pan: 'Pan',
  select: 'Select',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  input: 'Input',
  output: 'Output',
  button: 'Button',
  constant: 'Constant',
  delay: 'Delay',
  clock: 'Clock',
  display: 'Display',
  counter: 'Counter',
  memory: 'ROM',
  debug: 'Debug',
  beep: 'Beep',
  inputOutput: 'Input and output ports',
  not: 'NOT gate',
  and: 'AND gate',
  or: 'OR gate',
  xor: 'XOR gate',
  custom: 'Custom component',
  saved: 'Saved components',
  openMenu: 'Open menu',
  pause: 'Pause simulation',
  scrollAnimation: 'Scroll animation',
  zoomAnimation: 'Zoom animation',
  showDebug: 'Show debug info',
  showUpdates: 'Show component updates',
  clearStorage: 'Clear localStorage',
  removeBoard: 'Remove board',
  editBoard: 'Edit board',
  remove: 'Remove',
  edit: 'Edit',
  copy: 'Copy',
  paste: 'Paste',
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  truth: 'Truth table',
  connections: 'View connections',
  saveComponent: 'Save component',
  componentize: 'Componentize',
  version: 'Version',
  fileHint:
    'Boards are saved on this device. Import or export a .board file to move between devices.',
  sandboxHint: 'Tip: hold Ctrl while choosing NEW BOARD to start without a saved file.',
  storageNotice: 'Saved on this device. Export a backup before clearing browser data.',
  quickIntro: 'The original circuit playground. Same tools, new possibilities.',
  guideTitle: 'Welcome to REEO',
  guide1: 'Choose I/O → Input, then tap the board to place a switch. Tap it again to toggle it.',
  guide2: 'Choose a logic gate from the bottom toolbar, then tap to place it.',
  guide3: 'Drag from a black output pin to a white input pin to connect gates.',
  guide4:
    'On touchscreens, choose Move to drag components, Pan to move the canvas, or Select to select an area.',
  guide5: 'Save from the menu. Export a .board backup to use it on another device.',
  firstBoard: 'Welcome to your first REEO board. Here you can create circuits with logic gates.',
  scrollZoom: 'Scroll to zoom in/out',
  congratulations: 'Congratulations! You have built your first circuit!',
  previous: 'Previous',
  next: 'Next',
  finish: 'Finish',
  close: 'Close',
  invalidFile: 'Unable to import this board. Choose a valid REEO .board file.',
  savedMessage: 'Board saved on this device.',
  storageError: 'Storage is unavailable or full. Export your board to keep a backup.',
  exportFirst: 'Name and save your board first, then export it.',
  unsupported: 'This feature is only available in the REEO desktop app.',
  localFiles: 'Import a .board file',
  connectServer: 'Connect to a REEO server',
  resetConfirm: 'Are you sure you want to clear all local stored data?',
  createSave: 'Create save file',
  unsavedPrompt: "This board doesn't have a save file yet. Want to create one?",
} as const;
export type MessageKey = keyof typeof en;
type Messages = Record<MessageKey, string>;
const ar: Messages = {
  fileSavedAs: 'ستُحفظ اللوحة باسم',
  mainMenu: 'القائمة الرئيسية',
  newBoard: 'لوحة جديدة',
  openBoard: 'فتح لوحة',
  settings: 'الإعدادات',
  quit: 'خروج',
  createBoard: 'إنشاء لوحة جديدة',
  boardName: 'اسم اللوحة',
  cancel: 'إلغاء',
  create: 'إنشاء',
  open: 'فتح لوحة',
  preferences: 'الإعدادات',
  tutorial: 'الشرح التعليمي',
  loading: 'جارٍ التحميل…',
  noBoards: 'ليس لديك لوحات محفوظة',
  okay: 'موافق',
  welcome: 'مرحبًا',
  yesTutorial: 'نعم، من فضلك!',
  start: 'لا، لنبدأ مباشرة',
  needTutorial: 'هل تريد شرحًا لتتعلم كيفية استخدام الأدوات؟',
  saveBoard: 'حفظ اللوحة',
  new: 'لوحة جديدة',
  console: 'فتح وحدة الأوامر',
  openTutorial: 'فتح الشرح',
  export: 'تصدير اللوحة',
  import: 'استيراد لوحة',
  language: 'اللغة',
  help: 'دليل سريع',
  developer: 'المطوّر',
  interact: 'تفاعل',
  move: 'تحريك',
  pan: 'سحب اللوحة',
  select: 'تحديد',
  zoomIn: 'تكبير',
  zoomOut: 'تصغير',
  input: 'مدخل',
  output: 'مخرج',
  button: 'زر',
  constant: 'قيمة ثابتة',
  delay: 'تأخير',
  clock: 'ساعة',
  display: 'شاشة',
  counter: 'عدّاد',
  memory: 'ذاكرة ROM',
  debug: 'تتبّع',
  beep: 'صوت',
  inputOutput: 'منافذ الإدخال والإخراج',
  not: 'بوابة NOT',
  and: 'بوابة AND',
  or: 'بوابة OR',
  xor: 'بوابة XOR',
  custom: 'مكوّن مخصص',
  saved: 'المكوّنات المحفوظة',
  openMenu: 'فتح القائمة',
  pause: 'إيقاف المحاكاة مؤقتًا',
  scrollAnimation: 'حركة التمرير',
  zoomAnimation: 'حركة التكبير',
  showDebug: 'عرض معلومات التتبّع',
  showUpdates: 'عرض تحديثات المكوّنات',
  clearStorage: 'مسح التخزين المحلي',
  removeBoard: 'حذف اللوحة',
  editBoard: 'تعديل اللوحة',
  remove: 'حذف',
  edit: 'تعديل',
  copy: 'نسخ',
  paste: 'لصق',
  undo: 'تراجع',
  redo: 'إعادة',
  cut: 'قص',
  truth: 'جدول الحقيقة',
  connections: 'عرض التوصيلات',
  saveComponent: 'حفظ المكوّن',
  componentize: 'إنشاء مكوّن',
  version: 'الإصدار',
  fileHint: 'تُحفظ اللوحات على هذا الجهاز. استورد أو صدّر ملف ‎.board لنقلها إلى جهاز آخر.',
  sandboxHint: 'نصيحة: اضغط Ctrl أثناء اختيار لوحة جديدة للبدء دون إنشاء ملف محفوظ.',
  storageNotice: 'الحفظ على هذا الجهاز. صدّر نسخة احتياطية قبل مسح بيانات المتصفح.',
  quickIntro: 'ساحة الدوائر الأصلية. الأدوات نفسها، وإمكانات جديدة.',
  guideTitle: 'مرحبًا بك في REEO',
  guide1: 'اختر I/O ثم مدخل، والمس اللوحة لوضع مفتاح. المسه مجددًا لتغيير قيمته.',
  guide2: 'اختر بوابة منطقية من شريط الأدوات السفلي، ثم المس اللوحة لوضعها.',
  guide3: 'اسحب من منفذ إخراج أسود إلى منفذ إدخال أبيض لتوصيل البوابات.',
  guide4:
    'على الشاشات اللمسية، اختر تحريك لسحب المكوّنات، أو سحب اللوحة للتنقل، أو تحديد لتحديد منطقة.',
  guide5: 'احفظ من القائمة. صدّر ملف ‎.board لاستخدامه على جهاز آخر.',
  firstBoard: 'مرحبًا بك في أول لوحة REEO. يمكنك هنا إنشاء دوائر باستخدام البوابات المنطقية.',
  scrollZoom: 'مرّر للتكبير أو التصغير',
  congratulations: 'تهانينا! لقد أنشأت دائرتك الأولى!',
  previous: 'السابق',
  next: 'التالي',
  finish: 'إنهاء',
  close: 'إغلاق',
  invalidFile: 'تعذّر استيراد اللوحة. اختر ملف REEO بصيغة ‎.board صالحًا.',
  savedMessage: 'حُفظت اللوحة على هذا الجهاز.',
  storageError: 'التخزين غير متاح أو ممتلئ. صدّر اللوحة للاحتفاظ بنسخة احتياطية.',
  exportFirst: 'سمّ لوحتك واحفظها أولًا، ثم صدّرها.',
  unsupported: 'هذه الميزة متاحة في تطبيق REEO للحاسوب فقط.',
  localFiles: 'استيراد ملف ‎.board',
  connectServer: 'الاتصال بخادم REEO',
  resetConfirm: 'هل تريد بالتأكيد مسح جميع البيانات المحفوظة محليًا؟',
  createSave: 'إنشاء ملف للحفظ',
  unsavedPrompt: 'لا يوجد ملف حفظ لهذه اللوحة بعد. هل تريد إنشاءه؟',
};
const arz: Messages = {
  ...ar,
  fileSavedAs: 'اللوحة هتتحفظ باسم',
  newBoard: 'لوحة جديدة',
  openBoard: 'افتح لوحة',
  settings: 'الإعدادات',
  quit: 'خروج',
  createBoard: 'اعمل لوحة جديدة',
  boardName: 'اسم اللوحة',
  cancel: 'إلغاء',
  create: 'اعمل اللوحة',
  open: 'افتح لوحة',
  noBoards: 'لسّه مفيش لوحات محفوظة',
  welcome: 'أهلًا بيك',
  yesTutorial: 'أيوه، ياريت!',
  start: 'لأ، يلا نبدأ',
  needTutorial: 'تحب شرح بسيط يعرّفك تستخدم الأدوات إزاي؟',
  saveBoard: 'احفظ اللوحة',
  console: 'افتح الأوامر',
  openTutorial: 'افتح الشرح',
  export: 'نزّل اللوحة',
  import: 'ارفع لوحة',
  help: 'دليل سريع',
  developer: 'المطوّر',
  interact: 'استخدم',
  move: 'حرّك',
  pan: 'اسحب اللوحة',
  select: 'حدّد',
  fileHint: 'اللوحات بتتحفظ على الجهاز ده. نزّل ملف ‎.board أو ارفعه عشان تنقل شغلك لجهاز تاني.',
  sandboxHint: 'معلومة: دوس Ctrl وإنت بتختار لوحة جديدة لو عايز تبدأ من غير ملف محفوظ.',
  storageNotice: 'شغلك محفوظ على الجهاز ده. نزّل نسخة احتياطية قبل ما تمسح بيانات المتصفح.',
  quickIntro: 'نفس ساحة الدوائر اللي تعرفها. نفس الأدوات، وإمكانيات أكتر.',
  guideTitle: 'أهلًا بيك في REEO',
  guide1: 'اختار I/O وبعدين مدخل، والمس اللوحة عشان تحط مفتاح. المسه تاني عشان تغيّر قيمته.',
  guide2: 'اختار بوابة من شريط الأدوات اللي تحت، وبعدين المس اللوحة عشان تحطّها.',
  guide3: 'اسحب من نقطة خروج سودا لنقطة دخول بيضا عشان توصل البوابات ببعض.',
  guide4:
    'على الموبايل والتابلت، اختار حرّك عشان تنقل المكوّنات، أو اسحب اللوحة عشان تتنقل، أو حدّد عشان تختار منطقة.',
  guide5: 'احفظ من القائمة. نزّل نسخة ‎.board عشان تفتح شغلك على جهاز تاني.',
  firstBoard: 'أهلًا بيك في أول لوحة REEO ليك. هنا تقدر تعمل دوائر ببوابات منطقية.',
  congratulations: 'عاش! إنت عملت أول دايرة ليك!',
  previous: 'اللي فات',
  next: 'اللي بعده',
  finish: 'خلصنا',
  close: 'اقفل',
  invalidFile: 'مش قادرين نفتح اللوحة دي. اختار ملف REEO سليم بصيغة ‎.board.',
  savedMessage: 'اللوحة اتحفظت على الجهاز ده.',
  storageError: 'التخزين مش متاح أو مليان. نزّل نسخة من اللوحة عشان تحافظ على شغلك.',
  exportFirst: 'سمّي اللوحة واحفظها الأول، وبعدين نزّلها.',
  unsupported: 'الميزة دي موجودة في تطبيق REEO للكمبيوتر بس.',
  localFiles: 'ارفع ملف ‎.board',
  connectServer: 'اتصل بسيرفر REEO',
  resetConfirm: 'متأكد إنك عايز تمسح كل البيانات المحفوظة على الجهاز؟',
  createSave: 'اعمل ملف للحفظ',
  unsavedPrompt: 'اللوحة دي لسه ملهاش ملف محفوظ. تحب تعمل واحد؟',
};
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
