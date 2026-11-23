import type { ComponentGuide, Copy } from './types';

export const sourceGuides: readonly ComponentGuide[] = [
  {
    id: 'Input',
    title: ['Input switch', 'مفتاح إدخال', 'مفتاح إدخال'],
    behavior: [
      'Click to toggle between 0 and 1. It stays at that level until clicked again.',
      'انقر للتبديل بين 0 و1. تبقى القيمة حتى تنقر مجددًا.',
      'دوس عشان تبدّل بين 0 و1. القيمة بتفضل زي ما هي لحد ما تدوس تاني.',
    ],
    wiring: [
      'No input pins; connect its black output pin to a white input pin. Branch its wire to control several destinations.',
      'لا توجد مداخل. وصّل منفذه الأسود بمدخل أبيض، وفرّع السلك للتحكم في عدة مكوّنات.',
      'ملوش مداخل. وصّل النقطة السودا بمدخل أبيض، وفرّع السلك عشان تتحكّم في كذا مكوّن.',
    ],
    example: [
      'Connect Input → LED. Click the switch: the LED follows. Use two switches to test every row of a gate truth table.',
      'وصّل المدخل بصمام LED. عند النقر يتغير الضوء. استخدم مفتاحين لاختبار جميع حالات بوابة.',
      'وصّل المدخل بلمبة LED. لما تدوس الضوء يتغيّر. استخدم مفتاحين عشان تجرّب كل حالات البوابة.',
    ],
    caution: [
      'A switch is not a momentary button. Use Button when a signal should return to zero on release.',
      'المفتاح ليس زرًا لحظيًا؛ استخدم Button إذا أردت عودة الإشارة إلى الصفر عند الإفلات.',
      'المفتاح مش زرار لحظي؛ استخدم Button لو عايز الإشارة ترجع صفر أول ما تسيبه.',
    ],
  },
  {
    id: 'Output',
    title: ['Output monitor', 'مراقب الخرج', 'مراقب الخرج'],
    behavior: [
      'Shows the bit arriving at its input. It observes a signal; it does not create one.',
      'يعرض البت الوارد إلى مدخله. يراقب الإشارة ولا يولّدها.',
      'بيورّي البت اللي داخلة له. بيراقب الإشارة ومش بيولّدها.',
    ],
    wiring: [
      'Connect a source or gate output to its single white pin. Inside a custom component, Output defines an external output pin.',
      'وصّل خرج مصدر أو بوابة بمدخله الأبيض. داخل مكوّن مخصص يحدد منفذ إخراج خارجيًا.',
      'وصّل خرج مصدر أو بوابة بالنقطة البيضا. جوّه المكوّن المخصص بيعمل منفذ خروج خارجي.',
    ],
    example: [
      'Put monitors after each stage of a circuit to find the first unexpected value.',
      'ضع مراقبًا بعد كل مرحلة لتحديد أول قيمة غير متوقعة.',
      'حط مراقب بعد كل مرحلة عشان تعرف أول قيمة مش متوقعة.',
    ],
    caution: [
      'An unwired input reads zero. A displayed zero alone does not prove that your wiring is correct.',
      'المدخل غير الموصّل يقرأ صفرًا؛ ظهور الصفر لا يثبت صحة التوصيلات.',
      'المدخل اللي مش متوصّل بيقرأ صفر؛ ظهور صفر لوحده مش دليل إن التوصيل صح.',
    ],
  },
  {
    id: 'Button',
    title: ['Momentary button', 'زر لحظي', 'زرار لحظي'],
    behavior: [
      'Outputs 1 while pressed and 0 on release.',
      'يخرج 1 أثناء الضغط و0 عند الإفلات.',
      'بيطلع 1 وإنت دايس و0 لما تسيبه.',
    ],
    wiring: [
      'Connect its output to Counter, a gate, LED, or a custom circuit input.',
      'وصّل خرجه بعدّاد أو بوابة أو LED أو مدخل دائرة مخصصة.',
      'وصّل خرجه بعدّاد أو بوابة أو LED أو مدخل دايرة مخصصة.',
    ],
    example: [
      'Button → Counter counts presses; Button → LED makes a doorbell-style indicator.',
      'زر ثم عدّاد يحصي الضغطات؛ زر ثم LED يصنع مؤشرًا شبيهًا بجرس الباب.',
      'زرار وبعده عدّاد بيعد الضغطات؛ زرار وبعده LED يعمل مؤشر زي جرس الباب.',
    ],
    caution: [
      'Hold and release deliberately. A long press is one rising edge, not repeated clock pulses.',
      'اضغط ثم أفلت بوضوح. الضغطة الطويلة حافة صاعدة واحدة وليست نبضات متكررة.',
      'دوس وسيب بوضوح. الضغطة الطويلة حافة صاعدة واحدة، مش نبضات متكررة.',
    ],
  },
  {
    id: 'Constant',
    title: ['Constant bit', 'بت ثابت', 'بت ثابت'],
    behavior: [
      'Continuously supplies a fixed binary value; the default is 1.',
      'يوفّر قيمة ثنائية ثابتة؛ الافتراضية 1.',
      'بيوفّر قيمة ثنائية ثابتة؛ الافتراضي 1.',
    ],
    wiring: [
      'Connect it to a gate input that must stay enabled or fixed.',
      'وصّله بمدخل بوابة يجب تثبيته أو تمكينه دائمًا.',
      'وصّله بمدخل بوابة محتاج يفضل ثابت أو شغّال.',
    ],
    example: [
      'An AND gate with one input fixed at 1 copies the other input. A NOT after a high constant supplies 0.',
      'بوابة AND بمدخل ثابت عند 1 تنسخ المدخل الآخر. عاكس بعد ثابت مرتفع يولّد صفرًا.',
      'بوابة AND ومدخلها ثابت 1 بتنسخ المدخل التاني. عاكس بعد ثابت 1 بيطلع صفر.',
    ],
    caution: [
      'Do not tie independent source outputs together to make a gate. Use an explicit logic gate instead.',
      'لا تجمع مخارج مصادر مستقلة لصنع بوابة؛ استخدم بوابة منطقية صريحة.',
      'متجمعش مخارج مصادر مستقلة عشان تعمل بوابة؛ استخدم بوابة فعلية.',
    ],
  },
  ...(['NOT', 'AND', 'OR', 'XOR'] as const).map((id) => ({
    id,
    title: [`${id} gate`, `بوابة ${id}`, `بوابة ${id}`] as Copy,
    behavior: (
      {
        NOT: [
          'Inverts one bit: 0 → 1 and 1 → 0.',
          'تعكس بتًا واحدًا: 0 يصبح 1 و1 يصبح 0.',
          'بتعكس بت واحدة: 0 تبقى 1 و1 تبقى 0.',
        ],
        AND: [
          'Outputs 1 only when both inputs are 1. Rows 00, 01, 10, 11 produce 0, 0, 0, 1.',
          'تخرج 1 فقط إذا كان المدخلان 1. الحالات 00 و01 و10 و11 تعطي 0 و0 و0 و1.',
          'بتطلع 1 بس لما المدخلين يبقوا 1. الحالات 00 و01 و10 و11 بتطلع 0 و0 و0 و1.',
        ],
        OR: [
          'Outputs 1 when at least one input is 1. Rows 00, 01, 10, 11 produce 0, 1, 1, 1.',
          'تخرج 1 إذا كان أحد المدخلين على الأقل 1. الحالات 00 و01 و10 و11 تعطي 0 و1 و1 و1.',
          'بتطلع 1 لو مدخل واحد على الأقل قيمته 1. الحالات 00 و01 و10 و11 بتطلع 0 و1 و1 و1.',
        ],
        XOR: [
          'Outputs 1 when the two inputs differ. Rows 00, 01, 10, 11 produce 0, 1, 1, 0.',
          'تخرج 1 عندما يختلف المدخلان. الحالات 00 و01 و10 و11 تعطي 0 و1 و1 و0.',
          'بتطلع 1 لما المدخلين يختلفوا. الحالات 00 و01 و10 و11 بتطلع 0 و1 و1 و0.',
        ],
      } as Record<'NOT' | 'AND' | 'OR' | 'XOR', Copy>
    )[id],
    wiring: [
      'Use one switch for NOT or two for a two-input gate. Connect the gate output to Output or LED. Right-click its toolbar symbol for a truth table.',
      'استخدم مفتاحًا للعاكس أو مفتاحين للبوابات الثنائية. وصّل الخرج بمراقب أو LED. انقر رمز البوابة بالزر الأيمن لجدول الحقيقة.',
      'استخدم مفتاح للعاكس أو مفتاحين للبوابة الثنائية. وصّل الخرج بمراقب أو LED. كليك يمين على رمزها يورّيك جدول الحقيقة.',
    ] as Copy,
    example: (
      {
        NOT: [
          'Use as an active-low alarm or place after AND/OR to make NAND/NOR.',
          'استخدمها لإنذار يعمل عند الصفر، أو بعد AND أو OR لصنع NAND أو NOR.',
          'استخدمها لإنذار بيشتغل عند الصفر، أو بعد AND أو OR عشان تعمل NAND أو NOR.',
        ],
        AND: [
          'Model an interlock: motor runs only when power AND safety are enabled.',
          'حاكِ قفل أمان: يعمل المحرك فقط عند تفعيل الطاقة والأمان معًا.',
          'اعمل قفل أمان: الموتور يشتغل بس لو الطاقة والأمان شغّالين.',
        ],
        OR: [
          'Model an alarm triggered by either of two sensors.',
          'حاكِ إنذارًا يستجيب لأي واحد من مستشعرين.',
          'اعمل إنذار يشتغل من أي واحد من حسّاسين.',
        ],
        XOR: [
          'Use as the SUM output of a half adder, or compare two bits for inequality.',
          'استخدمها لخرج المجموع في نصف جامع، أو لاكتشاف اختلاف بتين.',
          'استخدمها لخرج المجموع في نصف جامع، أو عشان تعرف لو بتّين مختلفين.',
        ],
      } as Record<'NOT' | 'AND' | 'OR' | 'XOR', Copy>
    )[id],
    caution: [
      'Connect every intended input. A floating input is zero, not a random or automatically enabled signal. Test all input combinations before reusing the circuit.',
      'وصّل كل مدخل مطلوب. المدخل العائم يقرأ صفرًا، وليس عشوائيًا أو مفعّلًا تلقائيًا. اختبر كل الحالات قبل إعادة الاستخدام.',
      'وصّل كل المداخل المطلوبة. المدخل اللي سايبُه بيقرأ صفر، مش قيمة عشوائية أو شغّال تلقائي. جرّب كل الحالات قبل إعادة الاستخدام.',
    ] as Copy,
  })),
  {
    id: 'Delay',
    title: ['Signal delay', 'تأخير الإشارة', 'تأخير الإشارة'],
    behavior: [
      'Replays each input transition after the configured delay in milliseconds. This is not a clock or pulse generator.',
      'يعيد كل تغير في الإشارة بعد التأخير المحدد بالمللي ثانية. ليس ساعة أو مولّد نبضات.',
      'بيطلع كل تغيير في الإشارة بعد التأخير اللي محدده بالمللي ثانية. مش ساعة ولا مولّد نبضات.',
    ],
    wiring: [
      'Source → Delay → LED. Edit its delay, for example 500 ms, before testing.',
      'مصدر ثم تأخير ثم LED. حدّد التأخير مثل 500 مللي ثانية قبل الاختبار.',
      'مصدر وبعده تأخير وبعده LED. حدّد التأخير، مثلًا 500 مللي ثانية، قبل التجربة.',
    ],
    example: [
      'Branch an input directly to one LED and through Delay to a second LED; compare the response times.',
      'فرّع مدخلًا إلى LED مباشرة وآخر عبر التأخير، وقارن زمن الاستجابة.',
      'فرّع المدخل للمبة مباشرة ولمبة تانية عن طريق التأخير، وقارن وقت الاستجابة.',
    ],
    caution: [
      'Several quick transitions are queued, not merged. Browser timers are approximate; this is not a precision real-time hardware simulator.',
      'تُصفّ التغيرات السريعة ولا تُدمج. مؤقتات المتصفح تقريبية؛ المحاكاة ليست عتادًا دقيق التوقيت.',
      'التغييرات السريعة بتدخل طابور ومش بتندمج. توقيت المتصفح تقريبي، مش محاكاة عتاد دقيقة زمنيًا.',
    ],
  },
  {
    id: 'Clock',
    title: ['Clock source', 'مصدر ساعة', 'مصدر نبضات'],
    behavior: [
      'Alternates 0 and 1 automatically. The configured delay is a half-period: 500 ms gives about one full cycle per second.',
      'يتناوب تلقائيًا بين 0 و1. التأخير نصف دورة؛ 500 مللي ثانية تعطي نحو دورة كاملة في الثانية.',
      'بيبدّل تلقائي بين 0 و1. التأخير نص دورة؛ 500 مللي ثانية تعمل تقريبًا دورة كاملة في الثانية.',
    ],
    wiring: [
      'Set a positive delay, then connect Clock → Counter or LED. Pause the simulation to inspect a changing circuit.',
      'حدّد تأخيرًا موجبًا، ثم وصّل الساعة بعدّاد أو LED. أوقف المحاكاة مؤقتًا لفحص الدائرة.',
      'حدّد تأخير أكبر من صفر، ووصّل الساعة بعدّاد أو LED. وقّف المحاكاة مؤقتًا عشان تفحص الدايرة.',
    ],
    example: [
      'Clock → Counter is a simple pulse-counting demonstration. Gate the clock with AND plus an enable switch.',
      'ساعة ثم عدّاد تعرض عدّ النبضات. مرّر الساعة عبر AND مع مفتاح تمكين للتحكم بها.',
      'ساعة وبعدها عدّاد يورّيك عدّ النبضات. مرّر الساعة في AND مع مفتاح تشغيل عشان تتحكّم فيها.',
    ],
    caution: [
      'Counter counts only rising edges. Very short periods and background tabs are affected by browser scheduling.',
      'يعدّ العدّاد الحواف الصاعدة فقط. تتأثر الفترات القصيرة وتبويبات الخلفية بجدولة المتصفح.',
      'العدّاد بيعد الحواف الصاعدة بس. الفترات القصيرة والتبويبات اللي في الخلفية بتتأثر بجدولة المتصفح.',
    ],
  },
  {
    id: 'Counter',
    title: ['Rising-edge counter', 'عدّاد حواف صاعدة', 'عدّاد الحواف الصاعدة'],
    behavior: [
      'Adds one on each 0 → 1 transition. It displays a number but has no binary output bus or reset pin.',
      'يزيد واحدًا عند كل انتقال من 0 إلى 1. يعرض عددًا ولا يملك ناقل خرج ثنائيًا أو منفذ تصفير.',
      'بيزيد واحد مع كل انتقال من 0 لـ1. بيعرض عدد، وملوش ناقل خرج ثنائي ولا منفذ تصفير.',
    ],
    wiring: [
      'Connect Button or Clock to its single input. Hold a button: the count must not repeatedly increase.',
      'وصّل زرًا أو ساعة بمدخله الوحيد. عند إبقاء الزر مضغوطًا يجب ألا يتكرر العد.',
      'وصّل زرار أو ساعة بمدخله الوحيد. لو فضلت دايس على الزرار العدد المفروض ميزيدش باستمرار.',
    ],
    example: [
      'Use it to count button presses or compare how many pulses pass through an AND enable gate.',
      'استخدمه لعدّ الضغطات أو النبضات التي تمر عبر بوابة تمكين AND.',
      'استخدمه عشان تعد الضغطات أو النبضات اللي بتعدّي من بوابة تمكين AND.',
    ],
    caution: [
      'Do not expect this display counter to drive ROM addresses. Build a binary state circuit if you need output bits.',
      'لا تتوقع أن يقود هذا العدّاد عناوين ROM. ابنِ دائرة حالة ثنائية إذا احتجت بتات خرج.',
      'متتوقعش إن العدّاد ده يشغّل عناوين ROM. اعمل دايرة حالة ثنائية لو محتاج بتّات خرج.',
    ],
  },
  {
    id: 'LED',
    title: ['LED indicator', 'صمام LED مضيء', 'لمبة LED'],
    behavior: [
      'Lights when its input is 1 and turns off at 0. It is a visual sink, not a source.',
      'يضيء عند 1 وينطفئ عند 0. يعرض الإشارة ولا يولّدها.',
      'بينوّر عند 1 ويطفي عند 0. بيعرض الإشارة ومش بيولّدها.',
    ],
    wiring: [
      'Connect a black output pin to its white input. Use an Output monitor alongside it when you want a numeric check.',
      'وصّل خرجًا أسود بمدخله الأبيض. أضف مراقب خرج لقراءة رقمية بجانبه.',
      'وصّل نقطة خروج سودا بمدخله الأبيض. حط مراقب خرج معاه لو عايز قراءة رقمية.',
    ],
    example: [
      'Use separate LEDs for SUM and CARRY in an adder or for alarm and enable states.',
      'استخدم LED للمجموع وآخر للحمل في جامع، أو لعرض حالة إنذار وتمكين.',
      'استخدم لمبة للمجموع والتانية للحمل في الجامع، أو لعرض حالة الإنذار والتشغيل.',
    ],
    caution: [
      'Off can mean a genuine zero or missing wiring. Inspect the input connection before changing gates.',
      'الانطفاء قد يعني صفرًا صحيحًا أو توصيلًا مفقودًا. افحص المدخل قبل تغيير البوابات.',
      'اللمبة المطفية ممكن تكون صفر صحيح أو سلك ناقص. راجع المدخل قبل ما تغيّر البوابات.',
    ],
  },
];
