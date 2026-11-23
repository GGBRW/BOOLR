import type { Copy } from './types';

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
