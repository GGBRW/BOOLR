export type Copy = readonly [en: string, ar: string, arz: string];
export interface ComponentGuide {
  id: string;
  title: Copy;
  behavior: Copy;
  wiring: Copy;
  example: Copy;
  caution: Copy;
}
export const componentGuides: readonly ComponentGuide[] = [
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
  {
    id: 'Display',
    title: ['Seven-segment display', 'شاشة سباعية المقاطع', 'شاشة سباعية المقاطع'],
    behavior: [
      'Eight independent input pins control segments A–G and the decimal point DP. It does not decode a binary number automatically.',
      'تتحكم ثمانية مداخل مستقلة في المقاطع A–G والنقطة DP. لا تفك ترميز رقم ثنائي تلقائيًا.',
      'ثمان مداخل مستقلة بتتحكّم في المقاطع A–G والنقطة DP. مش بتحوّل الرقم الثنائي لشكل رقم لوحدها.',
    ],
    wiring: [
      'Drive each labeled segment with a switch, decoder circuit, or one ROM data bit.',
      'قد كل مقطع بمفتاح أو دائرة فك ترميز أو بت بيانات من ROM.',
      'شغّل كل مقطع بمفتاح أو دايرة فك ترميز أو بت بيانات من ROM.',
    ],
    example: [
      'Turn on A, B, C, D, E and F and leave G off to draw 0; turn on B and C for 1.',
      'شغّل A وB وC وD وE وF وأطفئ G لعرض 0؛ شغّل B وC لعرض 1.',
      'شغّل A وB وC وD وE وF وسيب G مطفي عشان تعرض 0؛ شغّل B وC عشان تعرض 1.',
    ],
    caution: [
      'Pin order is not a numeric bus. Check each segment label before wiring a ROM lookup table.',
      'ترتيب المنافذ ليس ناقلًا عدديًا؛ راجع اسم كل مقطع قبل توصيل جدول ROM.',
      'ترتيب المنافذ مش ناقل رقمي؛ راجع اسم كل مقطع قبل ما توصّل جدول ROM.',
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
];
export interface Recipe {
  id: string;
  title: Copy;
  steps: readonly Copy[];
  expected: Copy;
}
export const recipes: readonly Recipe[] = [
  {
    id: 'first',
    title: ['Your first working circuit', 'دائرتك العاملة الأولى', 'أول دايرة شغّالة ليك'],
    steps: [
      [
        'Choose Input from the component picker and place it in an empty area.',
        'اختر مدخلًا من قائمة المكوّنات وضعه في مكان فارغ.',
        'اختار مدخل من قائمة المكوّنات وحطّه في مكان فاضي.',
      ],
      [
        'Place LED to its right. Drag from the black output pin to the white LED input pin.',
        'ضع LED إلى يمينه. اسحب من الخرج الأسود إلى مدخل LED الأبيض.',
        'حط LED على يمينه. اسحب من الخرج الأسود لمدخل LED الأبيض.',
      ],
      [
        'Choose Interact and click the Input twice. Watch the LED turn on and then off.',
        'اختر تفاعلًا وانقر المدخل مرتين. راقب LED يضيء ثم ينطفئ.',
        'اختار استخدم ودوس على المدخل مرتين. راقب LED تنوّر وتطفي.',
      ],
      [
        'Save the board from the menu and export a .board backup.',
        'احفظ اللوحة من القائمة وصدّر نسخة ‎.board احتياطية.',
        'احفظ اللوحة من القائمة ونزّل نسخة ‎.board احتياطية.',
      ],
    ],
    expected: [
      'Input 0 → LED off; Input 1 → LED on.',
      'مدخل 0: LED مطفأ. مدخل 1: LED مضاء.',
      'مدخل 0: LED مطفية. مدخل 1: LED منوّرة.',
    ],
  },
  {
    id: 'nand',
    title: [
      'Build NAND or NOR from basic gates',
      'بناء NAND أو NOR من بوابات أساسية',
      'اعمل NAND أو NOR من البوابات الأساسية',
    ],
    steps: [
      [
        'Place two Input switches and an AND gate (use OR instead for NOR).',
        'ضع مفتاحي إدخال وبوابة AND، أو OR لصنع NOR.',
        'حط مفتاحين إدخال وبوابة AND، أو OR لو عايز NOR.',
      ],
      [
        'Wire both switches to the gate inputs. Add NOT after the gate and LED after NOT.',
        'وصّل المفتاحين بمدخلي البوابة. أضف NOT بعدها ثم LED.',
        'وصّل المفتاحين بمداخل البوابة. ضيف NOT بعدها وLED بعد NOT.',
      ],
      [
        'Try 00, 01, 10, 11; record all four results before Componentize.',
        'جرّب 00 و01 و10 و11 وسجّل النتائج الأربع قبل إنشاء مكوّن.',
        'جرّب 00 و01 و10 و11 وسجّل الأربع نتايج قبل ما تعمل مكوّن.',
      ],
    ],
    expected: [
      'NAND: 1,1,1,0. NOR: 1,0,0,0 (input order 00,01,10,11).',
      'NAND: ‏1،1،1،0. NOR: ‏1،0،0،0 بترتيب 00،01،10،11.',
      'NAND: ‏1،1،1،0. NOR: ‏1،0،0،0 بالترتيب 00،01،10،11.',
    ],
  },
  {
    id: 'half',
    title: ['Half adder: add two bits', 'نصف جامع: جمع بتين', 'نصف جامع: اجمع بتّين'],
    steps: [
      [
        'Place switches A and B, one XOR, one AND, and two Output monitors named SUM and CARRY.',
        'ضع مفتاحين A وB وبوابتي XOR وAND ومراقبي خرج باسم SUM وCARRY.',
        'حط مفتاحين A وB وبوابة XOR وبوابة AND ومراقبين باسم SUM وCARRY.',
      ],
      [
        'Branch A to the first input of both gates; branch B to the second input of both.',
        'فرّع A إلى المدخل الأول لكلتا البوابتين وB إلى المدخل الثاني لكلتيهما.',
        'فرّع A للمدخل الأول في البوابتين، وB للمدخل التاني في البوابتين.',
      ],
      [
        'XOR → SUM; AND → CARRY. Test every combination, then select and Componentize.',
        'وصّل XOR بالمجموع وAND بالحمل. اختبر كل الحالات ثم حدد الدائرة وأنشئ مكوّنًا.',
        'وصّل XOR بالمجموع وAND بالحمل. جرّب كل الحالات وبعدها حدّد الدايرة واعمل مكوّن.',
      ],
    ],
    expected: [
      'A B → CARRY SUM: 00→00, 01→01, 10→01, 11→10.',
      'A B ← ثم CARRY SUM: ‏00→00، ‏01→01، ‏10→01، ‏11→10.',
      'A B وبعدهم CARRY SUM: ‏00→00، ‏01→01، ‏10→01، ‏11→10.',
    ],
  },
  {
    id: 'full',
    title: [
      'Full adder: include carry-in',
      'جامع كامل: تضمين الحمل الداخل',
      'جامع كامل: ضيف الحمل الداخل',
    ],
    steps: [
      [
        'Build two half adders from the previous recipe. Label three switches A, B, Cin.',
        'ابنِ نصفي جامع من التمرين السابق، وسمّ ثلاثة مفاتيح A وB وCin.',
        'اعمل نصفي جامع من التمرين اللي فات، وسمّي تلات مفاتيح A وB وCin.',
      ],
      [
        'A and B enter the first half adder. Its SUM and Cin enter the second.',
        'أدخل A وB إلى الأول، ثم أدخل مجموعه وCin إلى الثاني.',
        'دخّل A وB في الأول، وبعدها دخّل المجموع بتاعه وCin في التاني.',
      ],
      [
        'The second SUM is final SUM. OR the two CARRY signals to get Cout. Test all eight input rows.',
        'مجموع الثاني هو المجموع النهائي. اجمع إشارتي الحمل ببوابة OR لإنتاج Cout، واختبر الحالات الثماني.',
        'مجموع التاني هو المجموع النهائي. دخّل إشارتين الحمل في OR عشان تطلع Cout، وجرّب التمن حالات.',
      ],
    ],
    expected: [
      'A+B+Cin = 2×Cout + SUM. For 1+1+1, Cout=1 and SUM=1.',
      'A+B+Cin = 2×Cout + SUM. للحالة 1+1+1 يكون Cout=1 وSUM=1.',
      'A+B+Cin = 2×Cout + SUM. لما تجمع 1+1+1، يكون Cout=1 وSUM=1.',
    ],
  },
  {
    id: 'alarm',
    title: ['Alarm with an enable switch', 'إنذار بمفتاح تمكين', 'إنذار بمفتاح تشغيل'],
    steps: [
      [
        'Connect sensor switches A and B to OR. Connect OR output to one input of AND.',
        'وصّل مستشعرين A وB ببوابة OR، ثم خرجها بمدخل AND.',
        'وصّل حسّاسين A وB ببوابة OR، وبعدها خرجها بمدخل AND.',
      ],
      [
        'Connect an ENABLE switch to the other AND input. AND output goes to LED and optionally Beep.',
        'وصّل مفتاح ENABLE بمدخل AND الآخر، وخرج AND إلى LED وصوت اختياري.',
        'وصّل مفتاح ENABLE بمدخل AND التاني، وخرج AND للمبة وصوت لو عايز.',
      ],
      [
        'With ENABLE=0 test both sensors. Enable it and test each sensor separately.',
        'اختبر المستشعرين وENABLE=0، ثم فعّله واختبر كل مستشعر منفردًا.',
        'جرّب الحسّاسين وENABLE=0، وبعدها شغّله وجرّب كل حسّاس لوحده.',
      ],
    ],
    expected: [
      'Alarm = ENABLE AND (A OR B). Disabled always means off.',
      'الإنذار = ENABLE AND (A OR B). التعطيل يعني انطفاء الإنذار دائمًا.',
      'الإنذار = ENABLE AND (A OR B). لو التعطيل شغّال الإنذار يفضل مطفي.',
    ],
  },
  {
    id: 'mux',
    title: [
      'Choose between two signals: multiplexer',
      'اختيار إشارة من اثنتين: مبدّل',
      'اختار إشارة من اتنين: مبدّل',
    ],
    steps: [
      [
        'Place switches A, B, S; NOT; two AND gates; one OR; and Output.',
        'ضع مفاتيح A وB وS وNOT وبوابتي AND وOR ومراقب خرج.',
        'حط مفاتيح A وB وS وNOT وبوابتين AND وOR ومراقب خرج.',
      ],
      [
        'First AND receives A and NOT(S). Second AND receives B and S.',
        'تستقبل AND الأولى A وNOT(S)، والثانية B وS.',
        'AND الأولى يدخلها A وNOT(S)، والتانية يدخلها B وS.',
      ],
      [
        'OR the two AND outputs. Switch S while A and B differ.',
        'اجمع خرجي AND ببوابة OR. بدّل S بينما تختلف A وB.',
        'اجمع خرجين AND في OR. بدّل S وإنت مخلي A وB مختلفين.',
      ],
    ],
    expected: [
      'S=0 selects A; S=1 selects B.',
      'S=0 يختار A، وS=1 يختار B.',
      'S=0 يختار A، وS=1 يختار B.',
    ],
  },
  {
    id: 'pulse',
    title: [
      'Count controlled clock pulses',
      'عدّ نبضات ساعة يمكن تمكينها',
      'عد نبضات ساعة بتتحكّم فيها',
    ],
    steps: [
      [
        'Set a Clock half-period to 500 ms. Connect it to one AND input.',
        'اضبط نصف دورة الساعة على 500 مللي ثانية، ووصّلها بمدخل AND.',
        'اضبط نص دورة الساعة 500 مللي ثانية ووصّلها بمدخل AND.',
      ],
      [
        'Connect an ENABLE switch to the other input; AND → Counter.',
        'وصّل مفتاح ENABLE بالمدخل الآخر، ثم AND بالعدّاد.',
        'وصّل مفتاح ENABLE بالمدخل التاني، وبعدها AND بالعدّاد.',
      ],
      [
        'Enable and watch. Disable and check that counting stops. Inspect with Pause.',
        'فعّل وراقب، ثم عطّل وتحقق من توقف العد. افحص باستخدام الإيقاف المؤقت.',
        'شغّل وراقب، وبعدها عطّل واتأكد إن العد وقف. افحص باستخدام الإيقاف المؤقت.',
      ],
    ],
    expected: [
      'Roughly one count per second while enabled; enabling during a high clock can itself create a rising edge.',
      'نحو عدة واحدة في الثانية أثناء التمكين؛ التمكين والساعة مرتفعة قد يولّد حافة صاعدة بحد ذاته.',
      'تقريبًا عدّة في الثانية وإنت مشغّل؛ تشغيل التمكين والساعة 1 ممكن يعمل حافة صاعدة لوحده.',
    ],
  },
  {
    id: 'lookup',
    title: ['A tiny ROM lookup table', 'جدول بحث ROM صغير', 'جدول بحث ROM صغير'],
    steps: [
      [
        'Place ROM and configure address width 1, data width 4, and data A5.',
        'ضع ROM وحدد عرض العنوان 1 والبيانات 4 والقيم A5.',
        'حط ROM وحدّد عرض العنوان 1 والبيانات 4 والقيم A5.',
      ],
      [
        'Wire one switch to address pin 0 and four LEDs to data pins 0–3.',
        'وصّل مفتاحًا بمنفذ العنوان 0 وأربع مصابيح بمنافذ البيانات 0–3.',
        'وصّل مفتاح بمنفذ العنوان 0 وأربع لمبات بمنافذ البيانات 0–3.',
      ],
      [
        'Toggle the address. Read LEDs from data bit 3 down to data bit 0.',
        'بدّل العنوان واقرأ المصابيح من بت البيانات 3 إلى 0.',
        'بدّل العنوان واقرأ اللمبات من بت البيانات 3 لحد 0.',
      ],
    ],
    expected: [
      'Address 0 → 1010; address 1 → 0101.',
      'العنوان 0 يعطي 1010 والعنوان 1 يعطي 0101.',
      'العنوان 0 يطلع 1010 والعنوان 1 يطلع 0101.',
    ],
  },
];
export const basics: readonly Copy[] = [
  [
    'Touch: tap Add to choose a part, then tap empty grid to place. Drag pins to wire. Use Move, Pan or Select for one-finger drags. Two fingers pan and pinch without placing parts. Double-tap opens editable components; hold to open the context menu. Hold Button components to keep their signal high. Trackpad scroll pans, pinch or Ctrl+wheel zooms; Fit circuit brings your parts into view.',
    'باللمس: اضغط إضافة لاختيار مكوّن ثم مكان فارغ لوضعه. اسحب بين المنافذ للتوصيل. استخدم تحريك أو سحب اللوحة أو تحديد بإصبع واحد. إصبعان للسحب والتكبير دون إضافة مكوّنات. انقر مرتين لفتح المكوّنات القابلة للتحرير واضغط مطولًا لقائمة السياق. أبقِ إصبعك على الزر لإبقاء الإشارة مرتفعة. لوحة اللمس للسحب والقرص أو Ctrl مع العجلة للتكبير، واحتواء الدائرة يعيدها للعرض.',
    'باللمس: دوس ضيف مكوّن واختاره وبعدها دوس مكان فاضي عشان تحطّه. اسحب بين النقط للتوصيل. حرّك أو اسحب اللوحة أو حدّد بإصبع واحد. بإصبعين اسحب وكبّر من غير ما تحط مكوّنات. دوستين بيفتحوا المكوّن لو بيدعم الفتح، وضغطة مطوّلة بتفتح القائمة. خليك دايس على الزر عشان الإشارة تفضل عالية. التاتش باد بيسحب والقرص أو Ctrl مع العجلة بيكبّر، واعرض الدايرة كلها بيرجعك للمكوّنات.',
  ],
  [
    'Start with one input and one visible output. A complete path is source → optional gates → sink. White pins receive; black pins send. A touching-looking wire is not proof of connection: verify the sink changes.',
    'ابدأ بمدخل واحد وخرج مرئي. المسار الكامل: مصدر ثم بوابات اختيارية ثم مراقب. المنافذ البيضاء تستقبل والسوداء ترسل. تلامس شكل السلك لا يثبت الاتصال؛ تحقق من تغير الخرج.',
    'ابدأ بمدخل واحد وخرج تشوفه. المسار الكامل: مصدر وبعده بوابات لو محتاج وبعدها مراقب. النقط البيضا بتستقبل والسودا بتبعت. شكل السلك إنه لامس مش دليل كفاية؛ اتأكد إن الخرج بيتغيّر.',
  ],
  [
    'Choose a component, then click/tap the grid to place it. Interact operates switches. Move drags components; Pan moves the view; Select draws a selection. Zoom never changes the logic.',
    'اختر مكوّنًا ثم انقر الشبكة لوضعه. تفاعل لتشغيل المفاتيح، وتحريك لنقل المكوّنات، وسحب اللوحة للتنقل، وتحديد لرسم إطار. التكبير لا يغير المنطق.',
    'اختار مكوّن وبعدها دوس على الشبكة عشان تحطّه. استخدم لتشغيل المفاتيح، وحرّك لنقل المكوّنات، واسحب اللوحة للتنقّل، وحدّد لرسم إطار. التكبير مش بيغيّر المنطق.',
  ],
  [
    'Right-click a component for editing and Component help. Right-click a gate symbol in the toolbar for its truth table. On touch, the question button in the component picker opens its guide.',
    'انقر المكوّن بالزر الأيمن للتعديل ومساعدته، ورمز البوابة لجدول الحقيقة. على اللمس يفتح زر السؤال في قائمة المكوّنات دليل المكوّن.',
    'كليك يمين على المكوّن للتعديل ومساعدته، وعلى رمز البوابة لجدول الحقيقة. على اللمس زرار السؤال في قائمة المكوّنات بيفتح دليل المكوّن.',
  ],
  [
    'Test systematically: label inputs, list all 2^n binary combinations, then compare expected and observed outputs. Add Output or Debug after each stage instead of randomly changing wires.',
    'اختبر بانتظام: سمّ المداخل وسجّل كل الحالات الثنائية وعددها 2 أس عدد المداخل، ثم قارن المتوقع بالفعلي. أضف مراقبًا بعد كل مرحلة بدل تغيير الأسلاك عشوائيًا.',
    'اختبر بنظام: سمّي المداخل واكتب كل الحالات الثنائية، عددها 2 أس عدد المداخل، وقارن المتوقع بالفعلي. حط مراقب بعد كل مرحلة بدل ما تغيّر السلوك عشوائي.',
  ],
  [
    'Sequential circuits depend on history, not only present inputs. Clock/Delay use browser wall time; paused work stays queued. Feedback can represent memory or an unstable oscillator: a loop is not automatically an error.',
    'تعتمد الدوائر التتابعية على التاريخ لا المداخل الحالية فقط. تستخدم الساعة والتأخير توقيت المتصفح وتبقى المهام المؤجلة في الطابور. التغذية الراجعة قد تمثل ذاكرة أو تذبذبًا؛ الحلقة ليست خطأ تلقائيًا.',
    'الدواير التتابعية بتعتمد على اللي حصل قبل كده، مش المداخل الحالية بس. الساعة والتأخير بيستخدموا وقت المتصفح، والشغل الموقوف بيفضل في الطابور. التغذية الراجعة ممكن تكون ذاكرة أو تذبذب؛ الحلقة مش غلط تلقائي.',
  ],
  [
    'Save stores work on this browser/device, not an account. Export a .board backup before clearing browser data or changing domains. Build a small tested block, name its pins, then reuse it as Custom.',
    'الحفظ محلي لهذا المتصفح والجهاز وليس لحساب. صدّر نسخة ‎.board قبل مسح البيانات أو تغيير النطاق. ابنِ كتلة صغيرة مختبرة وسمّ منافذها ثم أعد استخدامها كمكوّن مخصص.',
    'الحفظ على المتصفح والجهاز ده، مش على حساب. نزّل نسخة ‎.board قبل ما تمسح البيانات أو تغيّر الدومين. اعمل كتلة صغيرة مجرّبة وسمّي منافذها وبعدين استخدمها كمكوّن مخصص.',
  ],
];
