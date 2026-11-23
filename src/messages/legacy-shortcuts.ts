export const legacyShortcutCopy: ReadonlyArray<readonly [string, string, string]> = [
  [
    'Hold the shift key to draw the wire in a straight line',
    'اضغط مطولًا على Shift لرسم سلك مستقيم',
    'خليك دايس Shift عشان ترسم سلك مستقيم',
  ],
  [
    'Press Shift+S to set a waypoint, press Shift+W to jump to a waypoint',
    'اضغط Shift+S لإضافة علامة موقع وShift+W للانتقال إليها',
    'دوس Shift+S عشان تحط علامة مكان وShift+W عشان تروح لها',
  ],
  [
    'Move the mouse while holding the middle mouse button to move around.',
    'حرّك الفأرة مع الضغط على زرها الأوسط للتنقل في اللوحة.',
    'حرّك الماوس وإنت دايس الزرار اللي في النص عشان تتنقّل في اللوحة.',
  ],
  [
    "If you don't have access to any middle mouse button, hold the Ctrl key and the left mouse button to move around.",
    'إن لم يتوفر زر أوسط، اضغط Ctrl مع زر الفأرة الأيسر للتنقل.',
    'لو مفيش زرار ماوس في النص، دوس Ctrl مع الزرار الشمال عشان تتنقّل.',
  ],
  [
    "Now it's time to introduce you to logic gates.",
    'حان الوقت للتعرّف على البوابات المنطقية.',
    'دلوقتي نتعرّف على البوابات المنطقية.',
  ],
  [
    "See the I/O button on the toolbar? Click it and select 'Input'.",
    'انقر زر منافذ الإدخال والإخراج في شريط الأدوات، ثم اختر «مدخل».',
    'دوس زرار منافذ الإدخال والإخراج في شريط الأدوات واختار «مدخل».',
  ],
  [
    'Now you have selected the input gate. To place it on the board, simply click somewhere with the left mouse button.',
    'بعد اختيار المدخل، انقر موضعًا على اللوحة بزر الفأرة الأيسر لوضعه.',
    'بعد ما تختار المدخل، دوس كليك شمال في أي مكان على اللوحة عشان تحطّه.',
  ],
  [
    'Click the input gate to toggle its value.',
    'انقر المدخل لتبديل قيمته.',
    'دوس على المدخل عشان تغيّر قيمته.',
  ],
  [
    'Let\'s give our input gate a name. Right click it, select "Edit", and enter a name.',
    'لتسمية المدخل، انقره بالزر الأيمن واختر «تعديل» ثم أدخل الاسم.',
    'سمّي المدخل: كليك يمين عليه، اختار «تعديل»، واكتب الاسم.',
  ],
  [
    'To move our input gate to another place on the board, grab it with Ctrl+click and drag it around.',
    'لنقل المدخل، اضغط Ctrl واسحبه بزر الفأرة الأيسر.',
    'عشان تنقل المدخل، دوس Ctrl واسحبه بالماوس.',
  ],
  [
    'Tip: To cancel dragging, press the right mouse button.',
    'نصيحة: انقر بزر الفأرة الأيمن لإلغاء السحب.',
    'نصيحة: دوس كليك يمين عشان تلغي السحب.',
  ],
  [
    "Let's connect our input gate with other logic gates.",
    'لنوصّل المدخل ببوابات منطقية أخرى.',
    'يلا نوصّل المدخل ببوابات منطقية تانية.',
  ],
  [
    'Select the NOT gate (triangle symbol) on the toolbar and place it on the board.',
    'اختر بوابة العاكس NOT ذات الرمز المثلث من شريط الأدوات وضعها على اللوحة.',
    'اختار بوابة العاكس NOT اللي رمزها مثلث وحطّها على اللوحة.',
  ],
  [
    'Click the output port (black) of our input gate and move the mouse while holding the left mouse button to the input port (white) of our NOT gate.',
    'اسحب من منفذ الإخراج الأسود للمدخل إلى منفذ الإدخال الأبيض لبوابة NOT مع الضغط على زر الفأرة الأيسر.',
    'اسحب من نقطة الخروج السودا للمدخل لنقطة الدخول البيضا لبوابة NOT وإنت دايس كليك شمال.',
  ],
  [
    'Now the input gate is connected with the NOT gate and the NOT gate will invert the value of the input gate.',
    'أصبح المدخل متصلًا ببوابة NOT التي تعكس قيمته.',
    'كده المدخل اتوصّل ببوابة NOT اللي بتعكس قيمته.',
  ],
  [
    'Tip: You can right click on a gate on the toolbar to see the truth table of that gate.',
    'نصيحة: انقر بوابة في شريط الأدوات بالزر الأيمن لعرض جدول حقيقتها.',
    'نصيحة: كليك يمين على أي بوابة في شريط الأدوات يورّيك جدول الحقيقة بتاعها.',
  ],
  [
    "But we can't see what value the NOT gate outputs. To see this, we are going to connect our NOT gate with an output gate.",
    'لعرض قيمة خرج بوابة NOT، سنوصّلها بمكوّن مخرج.',
    'عشان نشوف القيمة اللي خارجة من بوابة NOT، هنوصلها بمخرج.',
  ],
  [
    'Select the output gate from the input/output list (I/O) on the toolbar and place it on the board.',
    'اختر «مخرج» من قائمة منافذ الإدخال والإخراج وضعه على اللوحة.',
    'اختار «مخرج» من قائمة منافذ الإدخال والإخراج وحطّه على اللوحة.',
  ],
  [
    'Now, connect the NOT gate with it the same way we connected the input gate with the NOT gate',
    'وصّل بوابة NOT بالمخرج بالطريقة نفسها التي وصّلت بها المدخل.',
    'وصّل بوابة NOT بالمخرج بنفس طريقة توصيل المدخل.',
  ],
  [
    "Tip: to view the connections of a gate, right click it and click 'View connections'",
    'نصيحة: انقر البوابة بالزر الأيمن واختر «عرض التوصيلات».',
    'نصيحة: كليك يمين على البوابة واختار «عرض التوصيلات».',
  ],
  [
    'Imagine this circuit is so special you want another one.',
    'لنفترض أنك تريد إنشاء نسخة أخرى من هذه الدائرة.',
    'لو عايز تعمل نسخة تانية من الدايرة دي، نعمل إيه؟',
  ],
  [
    'To do this, we need to select it. Hold shift and and drag the mouse while holding the left mouse button to select the circuit. Make sure every logic gate of your circuit is inside the selection box',
    'اضغط Shift واسحب بزر الفأرة الأيسر لتحديد الدائرة. تأكد من وجود جميع بواباتها داخل إطار التحديد.',
    'دوس Shift واسحب بكليك شمال عشان تحدّد الدايرة، واتأكد إن كل البوابات جوّه مربّع التحديد.',
  ],
  [
    "When you have selected your circuit, a menu pops up. Click 'Copy' or hit Ctrl+C.",
    'بعد التحديد تظهر قائمة. اختر «نسخ» أو اضغط Ctrl+C.',
    'بعد ما تحدّد الدايرة هتظهر قائمة. اختار «نسخ» أو دوس Ctrl+C.',
  ],
  [
    "To paste the circuit, right click somewhere on the board and click 'Paste' or hit Ctrl+V",
    'للصق الدائرة، انقر اللوحة بالزر الأيمن واختر «لصق» أو اضغط Ctrl+V.',
    'عشان تلزق الدايرة، كليك يمين على اللوحة واختار «لصق» أو دوس Ctrl+V.',
  ],
  [
    'Moving a selection around works the same way as moving gates, drag it around with Ctrl+click and release to drop it, right click to cancel',
    'لنقل التحديد، اضغط Ctrl واسحبه، ثم أفلت الزر لوضعه. انقر بالزر الأيمن للإلغاء.',
    'انقل التحديد وإنت دايس Ctrl، وسيب الزرار عشان تحطّه. كليك يمين يلغي النقل.',
  ],
  [
    "To remove a selection, click 'Remove' or hit Delete",
    'لحذف التحديد، اختر «حذف» أو اضغط Delete.',
    'عشان تمسح التحديد، اختار «حذف» أو دوس Delete.',
  ],
  [
    "If circuits are going to take up too much space, don't panic. The 'componentize function' will save you.",
    'إذا شغلت الدوائر مساحة كبيرة، استخدم «إنشاء مكوّن» لتجميعها.',
    'لو الدواير واخدة مساحة كبيرة، استخدم «إنشاء مكوّن» عشان تجمعها.',
  ],
  [
    "The 'componentize function' puts your circuit in a compact, nice little box. The input gates of your circuit are going to be its input ports, the output gates its output ports",
    'تجمع هذه الميزة الدائرة في مكوّن صغير، وتحوّل مداخلها ومخارجها إلى منافذ للمكوّن.',
    'الميزة دي بتجمع الدايرة في مكوّن صغير، والمداخل والمخارج بتبقى منافذ للمكوّن.',
  ],
  [
    "To do this, select your circuit like the previous section and click 'Componentize'.",
    'حدّد الدائرة كما سبق، ثم اختر «إنشاء مكوّن».',
    'حدّد الدايرة زي الخطوة اللي فاتت واختار «إنشاء مكوّن».',
  ],
  [
    'Double click your custom component to open it en view your circuit in its original state.',
    'انقر المكوّن المخصص مرتين لفتحه وعرض الدائرة الداخلية.',
    'دوس مرتين على المكوّن المخصص عشان تفتح الدايرة اللي جوّاه.',
  ],
  [
    "Press shift+T to open the console. You can use the command 'help' or '?' to see a list of available commands.",
    'اضغط Shift+T لفتح وحدة الأوامر، واكتب help أو ? لعرض الأوامر المتاحة.',
    'دوس Shift+T عشان تفتح الأوامر، واكتب help أو ? عشان تشوف الأوامر المتاحة.',
  ],
  [
    'Use the arrow up and down key to navigate through earlier executed commands.',
    'استخدم سهمي الأعلى والأسفل للتنقل بين الأوامر السابقة.',
    'استخدم السهم لفوق ولتحت عشان تتنقّل بين الأوامر القديمة.',
  ],
  [
    'Press Ctrl+L to clear the console.',
    'اضغط Ctrl+L لمسح وحدة الأوامر.',
    'دوس Ctrl+L عشان تمسح الأوامر.',
  ],
  [
    'Use the tab key to autocomplete command names.',
    'اضغط Tab لإكمال أسماء الأوامر تلقائيًا.',
    'دوس Tab عشان تكمّل أسماء الأوامر تلقائي.',
  ],
  [
    "In commands that require a position as argument, you can use '~' for positions relative to the mouse position.",
    'في الأوامر التي تتطلب إحداثيات، استخدم ~ لتحديد موضع نسبي إلى المؤشر.',
    'في الأوامر اللي محتاجة إحداثيات، استخدم ~ عشان تحدّد مكان بالنسبة لمكان الماوس.',
  ],
  [
    "You can use the console to declare variables. For components with a specific numeric property like 'delay' on a clock, you can use that variable.",
    'يمكنك تعريف متغيرات في وحدة الأوامر واستخدامها في خصائص المكوّنات العددية، مثل تأخير الساعة.',
    'تقدر تعرّف متغيّرات في الأوامر وتستخدمها في خصائص المكوّنات الرقمية زي تأخير الساعة.',
  ],
  [
    "Usage: 'set example 200' and 'get example'. To use variables for components, enter for example '2 * example - 50' in the edit menu. When you change the value of a variable by executing 'set example 500', the values of the components are automatically changed.",
    'مثال: set example 200 لتعريف متغير، وget example لعرضه. اكتب 2 * example - 50 في قائمة التعديل لاستخدامه. عند تنفيذ set example 500 تتحدّث قيم المكوّنات تلقائيًا.',
    'مثال: set example 200 يعرّف متغيّر، وget example يورّيه. اكتب 2 * example - 50 في قائمة التعديل عشان تستخدمه. لما تنفّذ set example 500 قيم المكوّنات هتتغيّر تلقائي.',
  ],
  [
    'Done something stupid? No problem. Simply press Ctrl+Z to undo your previous action. To redo, press Ctrl+Y or Ctrl+Shift+Z.',
    'أخطأت؟ اضغط Ctrl+Z للتراجع. وللإعادة اضغط Ctrl+Y أو Ctrl+Shift+Z.',
    'غلطت؟ عادي، دوس Ctrl+Z عشان تتراجع، وCtrl+Y أو Ctrl+Shift+Z عشان تعيد الخطوة.',
  ],
  [
    'When you are going to build large structures, you might find yourself constantly scrolling around between two places.',
    'عند بناء دوائر كبيرة، قد تحتاج إلى التنقل المتكرر بين مواضع مختلفة.',
    'وإنت بتبني دواير كبيرة، ممكن تحتاج تتنقّل كتير بين أماكن مختلفة.',
  ],
  [
    "You can set a waypoint to jump to a specific location on the board. To do this, open the context menu and click 'Set waypoint', or hit Shift+S.",
    'للعودة إلى موضع محدد، افتح قائمة السياق واختر «إضافة علامة موقع» أو اضغط Shift+S.',
    'عشان ترجع لمكان محدد، افتح قائمة الكليك اليمين واختار «حط علامة مكان» أو دوس Shift+S.',
  ],
  [
    "To jump to that waypoint, open the context menu again and click 'Go to waypoint', or hit Shift+W. If you have set multiple waypoints, a list is going to pop up in which you can select a waypoint.",
    'للانتقال إلى العلامة، اختر «الانتقال إلى علامة موقع» أو اضغط Shift+W. إن وُجدت عدة علامات، اختر واحدة من القائمة.',
    'عشان تروح للعلامة، اختار «روح لعلامة مكان» أو دوس Shift+W. لو عندك أكتر من علامة، اختار واحدة من القائمة.',
  ],
  ['Other useful tips:', 'نصائح أخرى مفيدة:', 'نصايح تانية مفيدة:'],
  [
    'You can change the position of a port by dragging it around with Ctrl+click',
    'يمكنك نقل منفذ بالضغط على Ctrl وسحبه بالفأرة.',
    'تقدر تنقل منفذ وإنت دايس Ctrl وتسحبه بالماوس.',
  ],
  [
    'Hold the Shift key while connecting to draw the wire in a straight line.',
    'اضغط Shift أثناء التوصيل لرسم سلك مستقيم.',
    'خليك دايس Shift وإنت بتوصّل عشان ترسم سلك مستقيم.',
  ],
  [
    'Hold the Ctrl key while selecting/connecting to scroll.',
    'اضغط Ctrl للتنقل أثناء التحديد أو التوصيل.',
    'دوس Ctrl عشان تتنقّل وإنت بتحدّد أو بتوصّل.',
  ],
  [
    "If you don't have a mouse for some reason, use the arrow keys to scroll and Page up and Page down to zoom.",
    'استخدم مفاتيح الأسهم للتنقل وPage Up وPage Down للتكبير والتصغير دون فأرة.',
    'لو مفيش ماوس، استخدم الأسهم عشان تتنقّل وPage Up وPage Down عشان تكبّر وتصغّر.',
  ],
  [
    'Press the Home key to go to x: 0, y: 0.',
    'اضغط Home للانتقال إلى الإحداثيات x: 0 وy: 0.',
    'دوس Home عشان تروح للإحداثيات x: 0 وy: 0.',
  ],
  [
    "You can save custom components. Click 'Save component' on the context menu or press shift+R while pointing the mouse on the component you want to save. Saved components can be found and used in de 'saved components' list on the toolbar.",
    'لحفظ مكوّن مخصص، اختر «حفظ المكوّن» من قائمة السياق أو اضغط Shift+R والمؤشر فوقه. ستجده في «المكوّنات المحفوظة» بشريط الأدوات.',
    'عشان تحفظ مكوّن مخصص، اختار «حفظ المكوّن» من قائمة الكليك اليمين أو دوس Shift+R والماوس عليه. هتلاقيه في «المكوّنات المحفوظة» في شريط الأدوات.',
  ],
];
