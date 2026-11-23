import type { ComponentGuide } from './types';

export const outputGuides: readonly ComponentGuide[] = [
  {
    id: 'RGBLed',
    title: ['RGB LED', 'مصباح RGB', 'لمبة RGB'],
    behavior: [
      'Mixes three colour channels: red, green and blue in a full-panel emitter. The 2-bit RGB LED variant uses two inputs to select one of four editable colours.',
      'يمزج قنوات الأحمر والأخضر والأزرق في مصباح يملأ المكوّن. نسخة RGB LED ثنائية البت تستخدم مدخلين لاختيار واحد من أربعة ألوان قابلة للتعديل.',
      'بيخلط قنوات الأحمر والأخضر والأزرق في لمبة مليانة. نسخة RGB LED ثنائية البت بتستخدم مدخلين عشان تختار واحد من أربع ألوان بتتعدّل.',
    ],
    wiring: [
      'Connect independent red, green and blue signals to R, G and B. For fewer wires use RGB LED 2-bit and edit Color1–Color3; the shape property still offers panel, round and square bodies.',
      'وصّل إشارات الأحمر والأخضر والأزرق مستقلة بالمداخل R وG وB. لتقليل الأسلاك استخدم RGB LED ثنائي البت وعدّل Color1–Color3؛ ما زالت خاصية الشكل تتيح لوحًا أو دائرة أو مربعًا.',
      'وصّل إشارات الأحمر والأخضر والأزرق لوحدهم بالمداخل R وG وB. لتقليل الأسلاك استخدم RGB LED ثنائي البت وعدّل Color1–Color3؛ خاصية الشكل لسه بتتيح لوح أو دايرة أو مربع.',
    ],
    example: [
      'Three switches demonstrate additive colour: R+G makes yellow, G+B cyan and all three white.',
      'ثلاثة مفاتيح توضح الخلط الإضافي: أحمر وأخضر أصفر، وأخضر وأزرق سماوي، والثلاثة أبيض.',
      'تلات مفاتيح بيورّوا الخلط: أحمر وأخضر أصفر، وأخضر وأزرق سماوي، والتلاتة أبيض.',
    ],
    caution: [
      'Each channel is a separate 0/1 bit; this is not a full-colour bus. Use three inputs or a decoder for more colours.',
      'كل قناة بت منفصلة 0/1 وليست ناقلًا كامل الألوان. استخدم ثلاثة مداخل أو مفككًا لألوان أكثر.',
      'كل قناة بت لوحدها 0/1 ومش ناقل ألوان كامل. استخدم تلات مداخل أو مفكك عشان ألوان أكتر.',
    ],
  },
  {
    id: 'BarGraph',
    title: ['Bar graph', 'مخطط أعمدة', 'مخطط أعمدة'],
    behavior: [
      'Displays four input bits as a column of bars. The bar colour is the component colour.',
      'يعرض أربع بتات كعمود من الأعمدة. لون العمود هو لون المكوّن.',
      'بيعرض أربع بتات كعمود أعمدة. لون العمود هو لون المكوّن.',
    ],
    wiring: [
      'Connect four signals, lowest bit to pin 1, or feed it from a binary counter. Right-click → Edit color changes the palette.',
      'وصّل أربع إشارات، البت الأدنى للطرف 1، أو غذّه من عداد ثنائي. تغيير اللون من القائمة يبدّل اللوحة.',
      'وصّل أربع إشارات، أقل بت للطرف 1، أو غذّيه من عدّاد ثنائي. تغيير اللون من القائمة بيغيّر اللوحة.',
    ],
    example: [
      'A counter → Bar Graph shows the count growing from 0 to 15 in binary.',
      'عداد ثم مخطط أعمدة يعرض العد من 0 إلى 15 ثنائيًا.',
      'عدّاد وبعده مخطط أعمدة بيورّي العد من 0 لـ 15 بالثنائي.',
    ],
    caution: [
      'The display is a monitor, not a latch. It follows its inputs immediately.',
      'العرض مراقب وليس مزلاجًا؛ يتبع مداخله فورًا.',
      'العرض مراقب مش مزلاج؛ بيتبع مداخله على طول.',
    ],
  },
  {
    id: 'SevenSegment',
    title: ['Seven-segment display', 'شاشة سبعة مقاطع', 'شاشة سبعة مقاطع'],
    behavior: [
      'Decodes a four-bit BCD value into hexadecimal digits 0–9 and A–F using seven lit segments.',
      'يفك أربع بتات BCD إلى أرقام ست عشرية 0–9 وA–F عبر سبعة مقاطع مضيئة.',
      'بيفك أربع بتات BCD لأرقام ست عشرية 0–9 وA–F بسبع مقاطع منوّرة.',
    ],
    wiring: [
      'Connect D0–D3 from a counter, switch bank or decoder. Choose Signal-driven colour to select the lit colour with C0–C2.',
      'وصّل D0–D3 من عداد أو مفاتيح أو مفكك. اختر لونًا يقوده الإشارة لتحديد لون الإضاءة عبر C0–C2.',
      'وصّل D0–D3 من عدّاد أو مفاتيح أو مفكك. اختار لون بيقوده الإشارة عشان تحدد لون الإضاءة عبر C0–C2.',
    ],
    example: [
      'Counter → Seven Segment builds a simple hexadecimal counter.',
      'عداد ثم شاشة سبعة مقاطع تصنع عدادًا ست عشريًا بسيطًا.',
      'عدّاد وبعده شاشة سبعة مقاطع بيعملوا عدّاد ست عشري بسيط.',
    ],
    caution: [
      'Values outside 0–15 show no digit. Add a decoder if your source is wider than four bits.',
      'القيم خارج 0–15 لا تعرض رقمًا. أضف مفككًا إذا كان مصدرك أوسع من أربع بتات.',
      'القيم برّه 0–15 مش هتورّي رقم. ضيف مفكك لو مصدرك أوسع من أربع بتات.',
    ],
  },
  {
    id: 'Lamp',
    title: ['Lamp', 'مصباح', 'لمبة'],
    behavior: [
      'A larger indicator that glows while its input is 1. Choose a bulb or panel shape and its colour.',
      'مؤشر أكبر يضيء عندما يكون مدخله 1. اختر شكل مصباح أو لوحة مع لونه.',
      'مؤشر أكبر بينوّر لما مدخله 1. اختار شكل لمبة أو لوحة مع لونه.',
    ],
    wiring: [
      'Connect one logic output to its input. Edit the component to change shape and colour.',
      'وصّل خرج منطقيًا واحدًا بمدخله. عدّل المكوّن لتغيير الشكل واللون.',
      'وصّل خرج منطقي واحد بمدخله. عدّل المكوّن عشان تغيّر الشكل واللون.',
    ],
    example: [
      'Use a Lamp as a room-light output in a sensor or alarm demo.',
      'استخدم المصباح كخرج إضاءة في عرض مستشعر أو إنذار.',
      'استخدم اللمبة كخرج إضاءة في عرض حسّاس أو إنذار.',
    ],
    caution: [
      'A Lamp is an output monitor; it cannot drive another logic input by itself.',
      'المصباح مراقب خرج ولا يغذي مدخلًا منطقيًا آخر بنفسه.',
      'اللمبة مراقب خرج ومش بتغذّي مدخل منطقي تاني لوحدها.',
    ],
  },
  {
    id: 'Motor',
    title: ['Motor', 'محرك', 'موتور'],
    behavior: [
      'Shows a rotating shaft while its input is 1 and stops at 0. It is a visual output, not a physical driver.',
      'يعرض عمودًا دوارًا عندما يكون مدخله 1 ويتوقف عند 0. إنه خرج بصري وليس محركًا فعليًا.',
      'بيورّي عمود بيلف لما مدخله 1 ويقف عند 0. ده خرج بصري مش موتور حقيقي.',
    ],
    wiring: [
      'Connect a gate or switch to its single input. Combine with a Delay to show ramping in a lesson.',
      'وصّل بوابة أو مفتاحًا بمدخله الوحيد. اجمع مع تأخير لعرض التدرج في درس.',
      'وصّل بوابة أو مفتاح بمدخله الوحيد. جمّع مع تأخير عشان توضّح التدرّج في درس.',
    ],
    example: [
      'Button → AND → Motor demonstrates a safety-enabled motor output.',
      'زر ثم AND ثم محرك يوضح خرج محرك مع تفعيل أمان.',
      'زرار وبعده AND وبعده موتور بيوضّح خرج موتور مع تفعيل أمان.',
    ],
    caution: [
      'The animation follows simulation updates; it is not a model of torque, speed or power.',
      'الحركة تتبع تحديثات المحاكاة وليست نموذجًا للعزم أو السرعة أو القدرة.',
      'الحركة بتتبع تحديثات المحاكاة ومش نموذج للعزم أو السرعة أو القدرة.',
    ],
  },
  {
    id: 'Splitter',
    title: ['Splitter', 'موزّع', 'موزّع'],
    behavior: [
      'Copies one input to four outputs. All four outputs carry the same bit.',
      'ينسخ مدخلًا واحدًا إلى أربعة مخارج. المخارج الأربعة تحمل البت نفسه.',
      'بينسخ مدخل واحد لأربع مخارج. الأربع مخارج بيحملوا نفس البت.',
    ],
    wiring: [
      'Feed the input from a gate or switch, then wire any of the four outputs to separate destinations.',
      'غذّ المدخل من بوابة أو مفتاح، ثم وصّل أيًا من المخارج الأربعة بوجهات منفصلة.',
      'غذّي المدخل من بوابة أو مفتاح، وبعدها وصّل أي مخرج من الأربعة بوجهات منفصلة.',
    ],
    example: [
      'Split a clock to drive a counter and a Debug probe without stacking wires on one pin.',
      'وزّع ساعة لتشغيل عداد ومسبار دون تكديس أسلاك على طرف واحد.',
      'وزّع ساعة عشان تشغّل عدّاد ومسبار من غير ما تكدّس سلوك على طرف واحد.',
    ],
    caution: [
      'It duplicates a bit; it does not combine or delay signals. Use Merger for OR-style combining.',
      'إنه يكرر بتًا ولا يجمع الإشارات أو يؤخرها. استخدم Merger للجمع بأسلوب OR.',
      'ده بيكرر بت ومش بيجمع الإشارات أو يأخرها. استخدم Merger للجمع بطريقة OR.',
    ],
  },
  {
    id: 'Merger',
    title: ['Merger', 'جامع', 'جامع'],
    behavior: [
      'ORs four inputs into one output: the output is 1 when any input is 1.',
      'يجمع أربعة مداخل بـ OR في خرج واحد: الخرج 1 عندما يكون أي مدخل 1.',
      'بيجمع أربع مداخل بـ OR في مخرج واحد: المخرج 1 لما أي مدخل يكون 1.',
    ],
    wiring: [
      'Connect up to four sources, then feed the single output to an LED, sounder or another gate.',
      'وصّل حتى أربعة مصادر، ثم غذّ الخرج الواحد بمصباح أو صوت أو بوابة.',
      'وصّل لحد أربع مصادر، وبعدها غذّي المخرج الواحد بلمبة أو صوت أو بوابة.',
    ],
    example: [
      'Four sensor switches → Merger → Buzzer creates a multi-sensor alarm with fewer wires.',
      'أربعة مفاتيح استشعار ثم جامع ثم جرس تصنع إنذارًا متعدد المستشعرات بأسلاك أقل.',
      'أربع مفاتيح حسّاسين وبعدهم جامع وبعده جرس بيعملوا إنذار متعدد الحسّاسات بأسلاك أقل.',
    ],
    caution: [
      'Unconnected inputs read as 0. Do not use it as a bus or as an AND gate.',
      'المداخل غير الموصولة تُقرأ 0. لا تستخدمه كناقل أو بوابة AND.',
      'المداخل اللي مش موصولة بتتقرا 0. ما تستخدمهوش كناقل أو بوابة AND.',
    ],
  },
  {
    id: 'Procedural',
    title: ['Procedural part', 'مكوّن إجرائي', 'مكوّن إجرائي'],
    behavior: [
      'Evaluates a user expression over inputs A and B and writes 1 or 0 to its output. Example: A ^ B.',
      'يقيّم تعبيرًا للمستخدم على المدخلين A وB ويكتب 1 أو 0 في خرجه. مثال: A ^ B.',
      'بيقيّم تعبير منك على المدخلين A وB و بيكتب 1 أو 0 في مخرجه. مثال: A ^ B.',
    ],
    wiring: [
      'Connect A and B, then edit the expression. Supported operators include !, &&, ||, ==, != and parentheses.',
      'وصّل A وB ثم عدّل التعبير. العوامل المدعومة تشمل ! و&& و|| و== و!= والأقواس.',
      'وصّل A وB وبعدها عدّل التعبير. العوامل المدعومة فيها ! و&& و|| و== و!= والأقواس.',
    ],
    example: [
      'A ^ B is XOR; A && !B is an inhibit gate; (A || B) && !(A && B) is another XOR.',
      'A ^ B هي XOR، وA && !B بوابة منع، و(A || B) && !(A && B) XOR أخرى.',
      'A ^ B هي XOR، وA && !B بوابة منع، و(A || B) && !(A && B) XOR تانية.',
    ],
    caution: [
      'An invalid expression shows EXPRESSION ERROR and outputs 0. The program is saved with the board.',
      'التعبير غير الصالح يعرض خطأ تعبير وخرج 0. يُحفظ البرنامج مع اللوحة.',
      'التعبير الغلط بيورّي خطأ تعبير وخرج 0. البرنامج بيتحفظ مع اللوحة.',
    ],
  },
];
