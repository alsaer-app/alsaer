# ودجت الشاشة الرئيسية (الصلاة القادمة)
- التخطيط والموارد: `widget_res/` (مصدر XML) ← تُترجم بـ aapt2 إلى `native_overlay/res/Wg1..3.xml`.
- `tools/add_res.py` يضيف المدخلات الثلاثة إلى `resources.arsc` (layout 0x7f0c002f · xml 0x7f120002 · drawable 0x7f080077)؛ معرّفات العناصر 0x7f0900c6..ca ثابتة في الجافا.
- `AlsaerWidget.java` (يُترجم ضمن `tools/build_native.sh`) + `patch_native.py` يضيف المستقبِل والـmeta-data إلى المانيفست.
- التطبيق يدفع الأوقات عبر `AlsaerNative.setWidget(json)` من `native-schedule.js`. **لم يُجرَّب على جهاز حقيقي.**

## 10080: أنماط الودجت والعائمة
- الودجت: خمسة أساليب (خلفيات drawable إضافية Wg4..Wg7 في الجدول) + حجم الخط + إظهار التاريخ/العدّاد/سطر «كتابي»؛ تُحفظ في `S.nsw` وتُدفع عبر `setWidgetStyle`.
- العائمة: الموضع/الحجم/الأسلوب/الاستدارة/الشفافية/المدة/الأزرار؛ تُحفظ في `S.nsf` وتُدفع عبر `setFloatStyle`.
- «كتابي»: `src/services/books.js` (بيانات `S.books`)، تذكير يومي في `native-schedule.js`، وتسجيل من زر «قرأت» في الإشعار.
