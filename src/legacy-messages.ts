import { legacyEditorCopy } from './messages/legacy-editor';
import { legacyShortcutCopy } from './messages/legacy-shortcuts';

export const legacyMessages: ReadonlyArray<readonly [string, string, string]> = [
  ...legacyEditorCopy,
  ...legacyShortcutCopy,
];

const normalize = (text: string) =>
  text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1');
const bySource = new Map(legacyMessages.map((row) => [normalize(row[0]), row]));
export function translateLegacy(source: string, locale: 'en' | 'ar' | 'arz'): string {
  if (locale === 'en') return source;
  const text = normalize(source);
  const row = bySource.get(text);
  if (row) return source.replace(source.trim(), row[locale === 'ar' ? 1 : 2]);
  const selected = /^Selected (.+) gate$/.exec(text);
  if (selected?.[1]) {
    const names: Record<string, string> = {
      Input: 'مدخل',
      Output: 'مخرج',
      Button: 'زر',
      Constant: 'قيمة ثابتة',
      Delay: 'تأخير',
      Clock: 'ساعة',
      Display: 'شاشة',
      Counter: 'عدّاد',
      Custom: 'مكوّن مخصص',
      Debug: 'تتبّع',
      Beep: 'صوت',
      ROM: 'ذاكرة ROM',
      NOT: 'بوابة NOT',
      AND: 'بوابة AND',
      OR: 'بوابة OR',
      XOR: 'بوابة XOR',
    };
    const name = names[selected[1]] ?? selected[1];
    return `${locale === 'ar' ? 'تم اختيار' : 'اخترت'} ${name}`;
  }
  // Dynamic values stay intact, including user names, URLs and file names.
  const dynamic: ReadonlyArray<readonly [RegExp, string, string]> = [
    [/^No value given for variable (.+)$/, 'لم تُدخل قيمة للمتغير $1', 'مكتبتش قيمة للمتغيّر $1'],
    [/^Component with ID (.+) not found$/, 'لا يوجد مكوّن بالمعرّف $1', 'مفيش مكوّن بالرقم $1'],
    [/^Component (.+) not found$/, 'المكوّن $1 غير موجود', 'المكوّن $1 مش موجود'],
    [/^No component found at (.+)$/, 'لا يوجد مكوّن عند $1', 'مفيش مكوّن عند $1'],
    [/^Removed component (.+)$/, 'حُذف المكوّن $1', 'المكوّن $1 اتمسح'],
    [
      /^Component with ID (.+) found at (.+)$/,
      'المكوّن بالمعرّف $1 موجود عند $2',
      'المكوّن بالرقم $1 موجود عند $2',
    ],
    [/^Component (.+) found at (.+)$/, 'المكوّن $1 موجود عند $2', 'المكوّن $1 موجود عند $2'],
    [/^Edit (.+)$/, 'تعديل $1', 'عدّل $1'],
    [/^To: (.+)$/, 'إلى: $1', 'لـ: $1'],
    [/^Value: (.+)$/, 'القيمة: $1', 'القيمة: $1'],
    [/^Placed by: you$/, 'أضفته أنت', 'إنت اللي ضفته'],
    [/^Placed by: (.+)$/, 'أضافه: $1', 'اللي ضافه: $1'],
    [/^From: (.+)$/, 'من: $1', 'من: $1'],
    [/^Port type: input$/, 'نوع المنفذ: مدخل', 'نوع المنفذ: مدخل'],
    [/^Port type: output$/, 'نوع المنفذ: مخرج', 'نوع المنفذ: مخرج'],
    [/^Position: (.+)$/, 'الموضع: $1', 'المكان: $1'],
    [/^ID: (.+)$/, 'المعرّف: $1', 'الرقم: $1'],
    [/^Selected (.+) gate$/, 'تم اختيار $1', 'اخترت $1'],
    [/^Update (.+)$/, 'تحديث $1', 'تحديث $1'],
    [
      /^Enter a delay time in ms for component$/,
      'أدخل زمن التأخير بالمللي ثانية للمكوّن',
      'اكتب التأخير بالمللي ثانية للمكوّن',
    ],
    [
      /^Enter a hex-encoded data for component$/,
      'أدخل بيانات ست عشرية للمكوّن',
      'اكتب بيانات ست عشرية للمكوّن',
    ],
    [/^Enter a new name for component$/, 'أدخل اسمًا جديدًا للمكوّن', 'اكتب اسم جديد للمكوّن'],
    [/^(.+) has (\d+) connections?\.$/, 'عدد توصيلات $1: $2.', 'عدد توصيلات $1: $2.'],
    [/^(\d+) connections? from:$/, 'توصيلات واردة: $1', 'توصيلات داخلة: $1'],
    [/^(\d+) connections? to:$/, 'توصيلات صادرة: $1', 'توصيلات خارجة: $1'],
    [/^Could not connect to '(.+)'$/, 'تعذّر الاتصال بـ«$1»', 'مش قادرين نتصل بـ«$1»'],
    [
      /^Are you sure you want to delete (.+)\?$/,
      'هل تريد بالتأكيد حذف $1؟',
      'متأكد إنك عايز تمسح $1؟',
    ],
    [/^Saved changes to (.+)$/, 'حُفظت التغييرات في $1', 'التغييرات اتحفظت في $1'],
    [/^Saved component (.+)$/, 'حُفظ المكوّن $1', 'المكوّن $1 اتحفظ'],
    [/^Connected to (.+)$/, 'تم الاتصال بـ$1', 'اتصلنا بـ$1'],
    [/^Connection error: (.*)$/, 'خطأ في الاتصال: $1', 'مشكلة في الاتصال: $1'],
    [/^Spectators: (.*)$/, 'المشاهدون: $1', 'المتفرّجين: $1'],
    [/^Command not found: (.*)$/, 'الأمر غير موجود: $1', 'الأمر مش موجود: $1'],
    [/^Removed waypoint (.+)$/, 'حُذفت علامة الموقع $1', 'علامة المكان $1 اتمسحت'],
    [
      /^Jumped to waypoint#(\d+) at (.+)$/,
      'تم الانتقال إلى علامة الموقع $1 عند $2',
      'رُحنا لعلامة المكان $1 عند $2',
    ],
    [/^Waypoint (.+) set at (.+)$/, 'أُضيفت علامة الموقع $1 عند $2', 'حطّينا علامة المكان $1 عند $2'],
  ];
  for (const [pattern, ar, arz] of dynamic) {
    if (pattern.test(text))
      return source.replace(source.trim(), text.replace(pattern, locale === 'ar' ? ar : arz));
  }
  return source;
}
