import type { ComponentGuide, Copy } from './types';

export const displayGuides: readonly ComponentGuide[] = [
  {
    id: 'Display',
    title: ['Multi-digit display', 'شاشة متعددة الأرقام', 'شاشة متعددة الأرقام'],
    behavior: [
      'Each digit decodes four BCD pins (D0–D3, D4–D7, …) into 0–9 or A–F. Use Add digit in the Edit dialog or the right-click menu to join up to eight digits into one display.',
      'يفك كل رقم أربع بتات BCD (D0–D3 وD4–D7 وهكذا) إلى 0–9 أو A–F. استخدم إضافة رقم من نافذة التعديل أو قائمة الزر الأيمن لضم حتى ثمانية أرقام في شاشة واحدة.',
      'كل رقم بيفك أربع بتات BCD (D0–D3 وD4–D7 وهكذا) لأرقام 0–9 أو A–F. استخدم إضافة رقم من نافذة التعديل أو قائمة الزر الأيمن عشان تجمع لحد تمانية أرقام في شاشة واحدة.',
    ],
    wiring: [
      'Wire four BCD bits per digit. Set colour mode to Signal-driven to turn the three C0–C2 pins into a 3-bit palette selector; all digits then share that colour.',
      'وصّل أربع بتات BCD لكل رقم. اختر لونًا يقوده الإشارة لتحويل المنافذ C0–C2 إلى محدد لوحة ألوان من ثلاث بتات؛ تشترك كل الأرقام في اللون.',
      'وصّل أربع بتات BCD لكل رقم. اختار لون بيقوده الإشارة عشان تحوّل المنافذ C0–C2 لمحدد ألوان من تلات بتات؛ كل الأرقام بتشترك في اللون.',
    ],
    example: [
      'Two counters → two BCD inputs of a two-digit Display make a 00–99 counter.',
      'عدادان ← مدخلا BCD لشاشة من رقمين يصنعان عدادًا من 00 إلى 99.',
      'عدادين ← مدخلين BCD لشاشة من رقمين بيعملوا عدّاد من 00 لـ 99.',
    ],
    caution: [
      'The display decodes BCD, not a binary bus wider than four bits. Removing a digit disconnects the wires on that digit.',
      'الشاشة تفك BCD وليس ناقلًا ثنائيًا أوسع من أربع بتات. حذف رقم يقطع أسلاكه.',
      'الشاشة بتفك BCD مش ناقل ثنائي أوسع من أربع بتات. حذف رقم بيقطع أسلاكه.',
    ],
  },
  {
    id: 'ROM',
    title: ['Read-only lookup memory', 'ذاكرة بحث للقراءة فقط', 'ذاكرة بحث ROM'],
    behavior: [
      'Treats address pins as a binary index and returns that row of stored hex data. Pin 0 is the least-significant bit.',
      'تقرأ منافذ العنوان كفهرس ثنائي وتخرج صف البيانات الست عشرية الموافق. المنفذ 0 هو الأقل أهمية.',
      'بتقرأ منافذ العنوان كعنوان ثنائي وتطلع صف البيانات الست عشرية المقابل. المنفذ 0 هو البت الأقل أهمية.',
    ],
    wiring: [
      'Choose address and data widths in Edit ROM. Drive address pins with switches and connect data pins to LEDs or display segments.',
      'حدّد عرض العنوان والبيانات في محرر ROM. قد العناوين بمفاتيح، ووصّل البيانات بمصابيح أو مقاطع شاشة.',
      'حدّد عرض العنوان والبيانات في محرّر ROM. شغّل العناوين بمفاتيح ووصّل البيانات بلمبات أو مقاطع شاشة.',
    ],
    example: [
      'One address bit and four data bits with hex data A5 returns 1010 at address 0 and 0101 at address 1 (read bits from highest to lowest).',
      'بت عنوان وأربع بتات بيانات مع A5 تعطي 1010 للعنوان 0 و0101 للعنوان 1، بقراءة البتات من الأعلى للأدنى.',
      'بت عنوان وأربع بتّات بيانات مع A5 تطلع 1010 عند عنوان 0 و0101 عند عنوان 1، لو بتقرأ من البت الأعلى للأقل.',
    ],
    caution: [
      'Hex digits per row = data width ÷ 4; rows = 2 to the address width. Start small. Recheck connections after changing widths.',
      'عدد الأرقام الست عشرية لكل صف يساوي عرض البيانات ÷4؛ وعدد الصفوف 2 أس عرض العنوان. ابدأ صغيرًا وراجع التوصيلات بعد تغيير العرض.',
      'عدد أرقام الهكس في الصف هو عرض البيانات ÷4، وعدد الصفوف 2 أس عرض العنوان. ابدأ صغير وراجع السلوك بعد تغيير العرض.',
    ],
  },
  {
    id: 'Debug',
    title: ['Debug probe', 'مسبار تتبّع', 'مسبار تتبّع'],
    behavior: [
      'Reads its input and writes the value to notifications and the console when updated.',
      'يقرأ مدخله ويسجل قيمته في الإشعارات ووحدة الأوامر عند التحديث.',
      'بيقرأ مدخله وبيسجّل القيمة في الإشعارات والأوامر لما يتحدّث.',
    ],
    wiring: [
      'Branch a wire into Debug without replacing the destination it was already driving.',
      'فرّع سلكًا إلى المسبار دون استبدال الوجهة التي يقودها.',
      'فرّع سلك للمسبار من غير ما تستبدل المكوّن اللي السلك بيشغّله.',
    ],
    example: [
      'Probe intermediate adder signals to find which gate first disagrees with the truth table.',
      'راقب الإشارات الوسيطة لجامع لتعرف أول بوابة تخالف جدول الحقيقة.',
      'راقب الإشارات بين بوابات الجامع عشان تعرف أول بوابة مختلفة عن جدول الحقيقة.',
    ],
    caution: [
      'Fast clocks can create many log messages. Use slow inputs and remove probes when finished.',
      'الساعات السريعة قد تولّد سجلات كثيرة. استخدم إشارات بطيئة واحذف المسابير بعد الانتهاء.',
      'الساعات السريعة ممكن تعمل رسايل كتير. استخدم إشارات بطيئة وشيل المسابير لما تخلّص.',
    ],
  },
  {
    id: 'Beep',
    title: ['Sound output', 'خرج صوتي', 'خرج صوت'],
    behavior: [
      'Plays a tone when updated with a high input. Frequency is in Hz; duration is in milliseconds.',
      'يشغّل نغمة عند تحديثه بمدخل مرتفع. التردد بالهرتز والمدة بالمللي ثانية.',
      'بيشغّل نغمة لما يتحدّث ومدخله 1. التردد بالهرتز والمدة بالمللي ثانية.',
    ],
    wiring: [
      'Connect Button or an alarm gate to its input, then edit frequency and duration.',
      'وصّل زرًا أو بوابة إنذار بمدخله ثم حدّد التردد والمدة.',
      'وصّل زرار أو بوابة إنذار بمدخله، وبعدها حدّد التردد والمدّة.',
    ],
    example: [
      'Two sensor switches → OR → Beep makes an either-sensor alarm.',
      'مستشعران ثم OR ثم صوت يصنع إنذارًا لأي مستشعر.',
      'حسّاسين وبعدهم OR وبعدها صوت يعمل إنذار لأي حسّاس.',
    ],
    caution: [
      'Browser audio requires permission/user interaction and may be muted. Verify the bit with an LED before diagnosing sound.',
      'قد يتطلب صوت المتصفح تفاعلًا أو إذنًا وقد يكون مكتومًا. تحقق من البت بواسطة LED أولًا.',
      'صوت المتصفح ممكن يحتاج إذن أو ضغطة منك وممكن يكون مكتوم. اتأكد من البت بلمبة LED الأول.',
    ],
  },
  ...(['TimerStart', 'TimerEnd'] as const).map((id) => ({
    id,
    title:
      id === 'TimerStart'
        ? (['Timing start', 'بداية قياس الزمن', 'بداية قياس الوقت'] as Copy)
        : (['Timing end', 'نهاية قياس الزمن', 'نهاية قياس الوقت'] as Copy),
    behavior: [
      'Experimental diagnostic pair: TimerStart marks a wall-clock start when updated; TimerEnd reports elapsed milliseconds.',
      'زوج تشخيص تجريبي: يسجل TimerStart وقت البداية عند التحديث، ويعرض TimerEnd الزمن المنقضي بالمللي ثانية.',
      'زوج تشخيص تجريبي: TimerStart بيسجّل البداية لما يتحدّث، وTimerEnd بيعرض الوقت اللي عدّى بالمللي ثانية.',
    ] as Copy,
    wiring: [
      'Use TimerStart as a toggled source, then connect through a circuit to TimerEnd. Only one shared start timestamp exists.',
      'استخدم TimerStart كمصدر قابل للتبديل، ثم وصّله عبر دائرة إلى TimerEnd. توجد نقطة بداية مشتركة واحدة فقط.',
      'استخدم TimerStart كمصدر بيتبدّل ووصّله عن طريق دايرة لـTimerEnd. فيه وقت بداية مشترك واحد بس.',
    ] as Copy,
    example: [
      'Compare a direct path and a slow Delay path separately to understand latency.',
      'قارن مسارًا مباشرًا وآخر به تأخير، كلًا على حدة، لفهم زمن الاستجابة.',
      'قارن مسار مباشر بمسار فيه تأخير، كل واحد لوحده، عشان تفهم زمن الاستجابة.',
    ] as Copy,
    caution: [
      'These are debugging tools, not independent stopwatches or accurate hardware propagation measurements. Prefer Clock and Counter for basic exercises.',
      'هذه أدوات تتبّع، وليست ساعات إيقاف مستقلة أو قياسًا دقيقًا لانتشار العتاد. استخدم الساعة والعدّاد للتمارين الأساسية.',
      'دي أدوات تتبّع، مش ساعات إيقاف مستقلة ولا قياس دقيق للعتاد. استخدم الساعة والعدّاد في التمارين البسيطة.',
    ] as Copy,
  })),
  {
    id: 'Custom',
    title: [
      'Reusable custom circuit',
      'دائرة مخصصة قابلة لإعادة الاستخدام',
      'دايرة مخصصة قابلة لإعادة الاستخدام',
    ],
    behavior: [
      'Packages a working selection into one component. Internal Input and Output components become its external pins.',
      'يجمع تحديدًا عاملًا في مكوّن واحد. تتحول مكوّنات Input وOutput الداخلية إلى منافذه الخارجية.',
      'بيجمع التحديد الشغّال في مكوّن واحد. مكوّنات Input وOutput اللي جوّه بتبقى منافذه الخارجية.',
    ],
    wiring: [
      'Build and test the circuit, select all its parts and internal wires, then Componentize. Double-click to inspect inside; use the close control to return.',
      'ابنِ الدائرة واختبرها، وحدد جميع مكوّناتها وأسلاكها الداخلية ثم اختر إنشاء مكوّن. انقر مرتين لفتحها، واستخدم الإغلاق للعودة.',
      'ابني الدايرة وجرّبها، وحدّد كل المكوّنات والسلوك اللي جوّاها وبعدها اختار إنشاء مكوّن. دوس مرتين عشان تفتحها، واستخدم الإغلاق عشان ترجع.',
    ],
    example: [
      'Save a half adder, then combine two copies and an OR gate to make a full adder. Give each external pin a clear name.',
      'احفظ نصف جامع، ثم اجمع نسختين منه وبوابة OR لصنع جامع كامل. سمّ كل منفذ خارجي بوضوح.',
      'احفظ نصف جامع واجمع نسختين منه مع بوابة OR عشان تعمل جامع كامل. سمّي كل منفذ خارجي بوضوح.',
    ],
    caution: [
      'Test the truth table before saving. Editing internal I/O changes the public interface: recheck every outside connection afterward.',
      'اختبر جدول الحقيقة قبل الحفظ. تعديل المداخل والمخارج الداخلية يغيّر الواجهة؛ راجع كل توصيل خارجي بعده.',
      'جرّب جدول الحقيقة قبل الحفظ. تغيير المداخل والمخارج اللي جوّه بيغيّر الواجهة؛ راجع كل التوصيلات الخارجية بعده.',
    ],
  },
  {
    id: 'Buzzer',
    title: ['Buzzer', 'جرس', 'جرس'],
    behavior: [
      'Sounds a tone when its input changes from 0 to 1. Frequency and duration are editable properties.',
      'يصدر نغمة عندما يتغير مدخله من 0 إلى 1. التردد والمدة خصائص قابلة للتعديل.',
      'بيطلّع نغمة لما مدخله يتغيّر من 0 لـ 1. التردد والمدّة خصائص تتعدّل.',
    ],
    wiring: [
      'Connect a gate output or Button to its input. Right-click → Edit component to set frequency in Hz and duration in ms.',
      'وصّل خرج بوابة أو زر بمدخله. انقر بالزر الأيمن ثم تعديل المكوّن لضبط التردد والمدة.',
      'وصّل خرج بوابة أو زرار بمدخله. كليك يمين وبعدها تعديل المكوّن عشان تظبط التردد والمدّة.',
    ],
    example: [
      'Clock → Buzzer gives a repeating tick; two sensors → OR → Buzzer makes an alarm.',
      'الساعة ثم الجرس تعطي نقرة متكررة، ومستشعران ثم OR ثم الجرس يصنعان إنذارًا.',
      'الساعة وبعدها الجرس بتدّي نقرة متكررة، وحسّاسين وبعدهم OR وبعدهم الجرس بيعملوا إنذار.',
    ],
    caution: [
      'Browser audio needs a user gesture and may be muted. Confirm the signal with an LED first.',
      'صوت المتصفح يحتاج تفاعل المستخدم وقد يكون مكتومًا. تأكد من الإشارة بواسطة LED أولًا.',
      'صوت المتصفح محتاج ضغطة منك وممكن يكون مكتوم. اتأكد من الإشارة بلمبة LED الأول.',
    ],
  },
  {
    id: 'Tone',
    title: ['Tone player', 'مشغّل نغمات', 'مشغّل نغمات'],
    behavior: [
      'Reads four binary pins as a note number from 0 to 15 and plays the matching pitch when it changes.',
      'يقرأ أربعة أطراف ثنائية كرقم نغمة من 0 إلى 15 ويعزف التردد المقابل عند تغيّره.',
      'بيقرا أربع أطراف ثنائية كرقم نغمة من 0 لـ 15 وبيعزف التردد المناسب لما يتغيّر.',
    ],
    wiring: [
      'Connect bit 1, 2, 4 and 8 sources to the four inputs. A zero note is silent.',
      'وصّل مصادر البتات 1 و2 و4 و8 بالمداخل الأربعة. النغمة صفر تعني صمتًا.',
      'وصّل مصادر البتات 1 و2 و4 و8 بالمداخل الأربعة. نغمة صفر معناها سكوت.',
    ],
    example: [
      'Four Input switches make a simple 16-note keyboard; a Counter can step through a melody.',
      'أربعة مفاتيح إدخال تصنع لوحة من 16 نغمة، والعداد يمكنه التنقل في لحن.',
      'أربع مفاتيح إدخال بيعملوا لوحة 16 نغمة، والعدّاد ممكن يمشي في لحن.',
    ],
    caution: [
      'Browsers may block audio until you interact with the page; connect a note and press a button to unlock sound.',
      'قد تحجب المتصفحات الصوت حتى تتفاعل مع الصفحة؛ وصّل نغمة واضغط زرًا لتفعيل الصوت.',
      'المتصفحات ممكن تمنع الصوت لحد ما تتفاعل مع الصفحة؛ وصّل نغمة واضغط زرار عشان تفعّل الصوت.',
    ],
  },
  {
    id: 'DipSwitch',
    title: ['Dip switch bank', 'مجموعة مفاتيح', 'مجموعة مفاتيح'],
    behavior: [
      'A four-bit input switch. Each click advances the value from 0 to 15; D0–D3 expose the bits.',
      'مفتاح إدخال بأربع بتات. كل نقرة تزيد القيمة من 0 إلى 15، والمنافذ D0–D3 تعرض البتات.',
      'مفتاح إدخال بأربع بتات. كل دوسة بتزوّد القيمة من 0 لـ 15، والمنافذ D0–D3 بتورّي البتات.',
    ],
    wiring: [
      'Connect D0–D3 to a display, decoder or four separate LEDs. The value is saved with the board.',
      'وصّل D0–D3 بشاشة أو مفكك أو أربعة مصابيح. تُحفظ القيمة مع اللوحة.',
      'وصّل D0–D3 بشاشة أو مفكك أو أربع لمبات. القيمة بتتحفظ مع اللوحة.',
    ],
    example: [
      'Use it as a mode selector or to feed a Seven Segment display through a BCD decoder.',
      'استخدمه كمحدد وضع أو لتغذية شاشة سبعة مقاطع عبر مفكك BCD.',
      'استخدمه كمحدد وضع أو عشان تغذّي شاشة سبعة مقاطع عبر مفكك BCD.',
    ],
    caution: [
      'There is no separate clock input; click cycles the value. Read the bit labels before wiring.',
      'لا يوجد مدخل ساعة منفصل؛ النقر يبدّل القيمة. اقرأ أسماء البتات قبل التوصيل.',
      'مفيش مدخل ساعة منفصل؛ الدوسة بتغيّر القيمة. اقرا أسماء البتات قبل التوصيل.',
    ],
  },
  {
    id: 'Slider',
    title: ['Slider input', 'مدخل منزلق', 'مدخل منزلق'],
    behavior: [
      'A compact 0–15 input. Each click steps the value; the four output pins carry its binary bits.',
      'مدخل صغير من 0 إلى 15. كل نقرة تزيد القيمة، والأطراف الأربعة تحمل بتاتها الثنائية.',
      'مدخل صغير من 0 لـ 15. كل دوسة بتزوّد القيمة، والأربع أطراف بيحملوا بتاتها الثنائية.',
    ],
    wiring: [
      'Connect the four outputs to a display or logic block. The knob paints the current value.',
      'وصّل المخارج الأربعة بشاشة أو كتلة منطقية. المقبض يرسم القيمة الحالية.',
      'وصّل الأربع مخارج بشاشة أو كتلة منطقية. المقبض بيرسم القيمة الحالية.',
    ],
    example: [
      'Feed a Seven Segment display to preview hexadecimal digits from 0 to F.',
      'غذّ شاشة سبعة مقاطع لمعاينة الأرقام السداسية من 0 إلى F.',
      'غذّي شاشة سبعة مقاطع عشان تشوف الأرقام الست عشري من 0 لـ F.',
    ],
    caution: [
      'The slider is stepped, not dragged by the mouse; use Input for a plain on/off switch.',
      'المنزلق يتدرج بالنقر ولا يُسحب بالفأرة؛ استخدم Input لمفتاح تشغيل وإيقاف بسيط.',
      'المنزلق بيتدرّج بالدوس مش بالسحب؛ استخدم Input لمفتاح تشغيل وإيقاف بسيط.',
    ],
  },
];
