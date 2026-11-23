import type { Recipe } from './types';

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
