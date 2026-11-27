# المساهمة / Contributing

شكرًا لاهتمامك بالسائر. أهلاً بالإصلاحات والتحسينات الصغيرة. Thanks for your interest. Small fixes and improvements are welcome.

## قبل أن تبدأ / Before you start

- افتح Issue أولًا لأي تغيير كبير أو ميزة جديدة. Open an issue first for anything large.
- **نص المصحف مقدّس.** لا تعدّل `www/quran.js` ولا `www/warsh.js` ولا ترتيب الآيات. أي طلب دمج يغيّرهما يُرفض.
  The Quran text is not to be edited. Pull requests that change `www/quran.js` or `www/warsh.js` are rejected.
- النصوص الدينية تبقى بالعربية. لا نقبل ترجمات جديدة لها دون موافقة المالك.
- لا تنسخ شيفرة من مشاريع بترخيص لا يسمح بذلك (مثل GPL-3.0 أو بلا ترخيص). الأفكار فقط.
  Do not copy code from projects whose licence does not allow it. Ideas only.
- لا تغيير بصري (ألوان، تخطيط، خطوط) دون صورة توضيحية في وصف الطلب.
- لا أسرار ولا مفاتيح ولا بيانات شخصية في أي commit.

## البناء / Building

انظر [BUILD-AR.md](BUILD-AR.md) و[ANDROID-SETUP-AR.md](ANDROID-SETUP-AR.md).

`www/index.html` ملف مولَّد. عدّل المصدر في `src/` ثم أعد التوليد بأدوات `tools/`، ولا تعدّل الملف المولَّد يدويًا.
`www/index.html` is generated. Edit `src/` and regenerate with `tools/`.

## الاختبارات / Tests

شغّل اختبارات `tests/` المعنية قبل الطلب: ملفات `*.py` بـ python3 وملفات `*.cjs` بـ node. اذكر ما شغّلته في وصف الطلب.

## الطلبات / Pull requests

- طلب واحد لموضوع واحد، ورسالة commit واضحة.
- املأ قالب الطلب.
- الفروع التجريبية `exp/*` لا تُدمج في `main` مباشرة.

## الرخصة / Licence

بالمساهمة توافق على ترخيص مساهمتك بموجب [MIT](LICENSE). الاسم والشعار والهوية البصرية محفوظة لصاحب المشروع.
