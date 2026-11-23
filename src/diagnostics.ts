import type { Copy } from './help-content';
export interface CheckPort {
  connection?: CheckWire;
  component?: CheckComponent;
}
export interface CheckWire {
  from?: CheckPort;
  to?: CheckPort;
  input: CheckWire[];
  output: CheckWire[];
}
export interface CheckComponent {
  id: number | string;
  name?: string;
  constructor: { name: string };
  input: CheckPort[];
  output: CheckPort[];
  properties?: Record<string, unknown>;
}
export interface Finding {
  id: string;
  type: string;
  componentId?: number | string;
  message: Copy;
  fix: Copy;
}
/** Conservative structural checks, not a proof of a circuit's intended function. */
export function checkCircuit(
  parts: readonly CheckComponent[],
  wires: readonly CheckWire[],
  paused = false,
  saturated = false,
): Finding[] {
  const found: Finding[] = [];
  if (saturated)
    found.push({
      id: 'saturated',
      type: 'Delay',
      message: [
        'Simulation reached its per-tick work limit. This can be a large circuit or unstable feedback, not necessarily a logic error.',
        'بلغت المحاكاة حد العمل لكل دورة. قد تكون دائرة كبيرة أو تغذية راجعة غير مستقرة، وليس خطأ منطق بالضرورة.',
        'المحاكاة وصلت لحد الشغل في الدورة. ممكن تكون دايرة كبيرة أو تغذية راجعة مش مستقرة، ومش لازم يكون خطأ منطقي.',
      ],
      fix: [
        'Pause, inspect recent feedback connections and test smaller blocks. Do not add a random delay just to hide the symptom.',
        'أوقف مؤقتًا وافحص توصيلات التغذية الراجعة الحديثة واختبر كتلًا أصغر. لا تضف تأخيرًا عشوائيًا لإخفاء العرَض.',
        'وقّف مؤقتًا وراجع توصيلات التغذية الراجعة الأخيرة وجرّب كتل أصغر. متضيفش تأخير عشوائي عشان تخفي المشكلة.',
      ],
    });
  if (paused && parts.length)
    found.push({
      id: 'paused',
      type: 'Clock',
      message: [
        'Simulation is paused; outputs may not reflect queued changes.',
        'المحاكاة متوقفة مؤقتًا؛ قد لا تعكس المخارج التغييرات المؤجلة.',
        'المحاكاة واقفة مؤقتًا؛ المخارج ممكن متكونش اتحدّثت بالتغييرات اللي في الطابور.',
      ],
      fix: [
        'Resume with the play button, then test again.',
        'تابع بزر التشغيل ثم اختبر مجددًا.',
        'كمّل بزرار التشغيل وبعدها جرّب تاني.',
      ],
    });
  for (const part of parts) {
    const type = part.constructor.name;
    const add = (suffix: string, message: Copy, fix: Copy) =>
      found.push({ id: `${part.id}:${suffix}`, type, componentId: part.id, message, fix });
    if (part.input.some((port) => !port.connection))
      add(
        'input',
        [
          'One or more input pins are not connected. They currently read 0; this may be intentional.',
          'منفذ إدخال واحد أو أكثر غير موصّل ويقرأ صفرًا؛ قد يكون ذلك مقصودًا.',
          'فيه مدخل أو أكتر مش متوصّل وبيقرأ صفر؛ ممكن يكون ده مقصود.',
        ],
        [
          'Connect the intended source to each white pin, or confirm that a fixed zero is what you want.',
          'وصّل المصدر المطلوب بكل منفذ أبيض، أو تأكد أنك تريد صفرًا ثابتًا.',
          'وصّل المصدر المطلوب بكل نقطة بيضا، أو اتأكد إنك عايز صفر ثابت.',
        ],
      );
    if (
      ['Clock', 'Delay'].includes(type) &&
      (!Number.isFinite(part.properties?.delay) || Number(part.properties?.delay) <= 0)
    )
      add(
        'timing',
        [
          'This timed component has no positive delay configured.',
          'هذا المكوّن الزمني بلا تأخير موجب محدد.',
          'المكوّن الزمني ده ملوش تأخير أكبر من صفر.',
        ],
        [
          'Edit its delay. Start with 500 ms so changes are easy to follow.',
          'عدّل التأخير. ابدأ بـ500 مللي ثانية لتسهيل المراقبة.',
          'غيّر التأخير. ابدأ بـ500 مللي ثانية عشان تتابع التغييرات بسهولة.',
        ],
      );
    if (
      type === 'ROM' &&
      (!part.input.length || !part.output.length || !Array.isArray(part.properties?.rom))
    )
      add(
        'rom',
        [
          'The ROM interface or lookup data is not configured.',
          'منافذ ROM أو بيانات البحث غير معدّة.',
          'منافذ ROM أو بيانات البحث لسه مش متظبّطة.',
        ],
        [
          'Configure address width, data width and hex contents. Try the tiny ROM recipe first.',
          'حدّد عرض العنوان والبيانات والمحتوى الست عشري. جرّب تمرين ROM الصغير أولًا.',
          'حدّد عرض العنوان والبيانات ومحتوى الهكس. جرّب تمرين ROM الصغير الأول.',
        ],
      );
    if (type === 'Custom' && !part.input.length && !part.output.length)
      add(
        'custom',
        [
          'This custom component has no external pins yet.',
          'هذا المكوّن المخصص بلا منافذ خارجية بعد.',
          'المكوّن المخصص ده لسه ملوش منافذ خارجية.',
        ],
        [
          'Open it and add internal Input and Output components to define its interface.',
          'افتحه وأضف مكوّنات Input وOutput داخلية لتعريف واجهته.',
          'افتحه وضيف مكوّنات Input وOutput جوّه عشان تعمل واجهته.',
        ],
      );
  }
  let budget = 20000;
  wires.forEach((wire, index) => {
    if (!wire.to && !wire.output.length)
      found.push({
        id: `wire:${index}:loose`,
        type: 'Input',
        message: [
          'A wire ends without a destination.',
          'ينتهي سلك دون وجهة.',
          'فيه سلك نهايته مش متوصّلة بحاجة.',
        ],
        fix: [
          'Finish the wire at a white input pin, or remove the unused branch.',
          'أكمل السلك إلى منفذ أبيض أو احذف الفرع غير المستخدم.',
          'كمّل السلك لنقطة دخول بيضا أو امسح الفرع اللي مش محتاجه.',
        ],
      });
    const visited = new Set<CheckWire>(),
      drivers = new Set<CheckPort>(),
      queue = [wire];
    while (queue.length && budget-- > 0) {
      const current = queue.pop();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      if (current.from) drivers.add(current.from);
      queue.push(...current.input);
    }
    if (drivers.size > 1 && !found.some((item) => item.id === 'drivers'))
      found.push({
        id: 'drivers',
        type: 'OR',
        message: [
          'Independent outputs feed the same wire network. This simulator resolves high signals, which may hide a wiring mistake.',
          'تغذي مخارج مستقلة شبكة أسلاك واحدة. تجمع المحاكاة الإشارات المرتفعة، وقد يخفي ذلك خطأ توصيل.',
          'مخارج مستقلة بتغذّي نفس شبكة السلوك. المحاكاة بتجمع الإشارات المرتفعة وده ممكن يخفي غلطة توصيل.',
        ],
        fix: [
          'Use an explicit OR/AND gate or multiplexer for the intended combination; do not treat joined outputs as a physical gate.',
          'استخدم بوابة OR أو AND أو مبدّلًا للتجميع المطلوب؛ جمع المخارج ليس بوابة فعلية.',
          'استخدم OR أو AND أو مبدّل حسب اللي عايزه؛ جمع المخارج مش بوابة فعلية.',
        ],
      });
  });
  return found;
}
