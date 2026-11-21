# التذكيرات العائمة (فوق التطبيقات الأخرى)

**الحالة (1.0.10 / 10078):** تُرجم الكود بـ`tools/build_native.sh` (يحتاج android.jar وd8.jar) إلى `native_overlay/classes3.dex` وضُمّ إلى الـAPK مع تحويل المانيفست إلى الحزمة `.x`. **لم يُجرَّب على جهاز حقيقي بعد.**

## الملفات
- `android/.../FloatingReminderService.java`: خدمة تعرض بطاقة (عنوان + نص + «إغلاق») بـ`TYPE_APPLICATION_OVERLAY`، تُغلق تلقائيًا بعد ١٥ ثانية، والضغط عليها يفتح التطبيق على المسار.
- `AlarmScheduler.show(...)`: يستدعي `FloatingReminderService.showIfEnabled` بعد إرسال الإشعار العادي.
- `AlsaerNative`: `canDrawOverlays / floatingEnabled / setFloating / openOverlaySettings / testFloating`.
- `AndroidManifest.xml`: إذن `SYSTEM_ALERT_WINDOW` وتسجيل الخدمة.
- واجهة الويب: زر «التذكيرات العائمة» في التذكيرات ← الاختبار (يظهر فقط إن وُجدت الدالة).

## للتفعيل
ابنِ المشروع من Android Studio (`./gradlew assembleRelease`) ثم وقّعه بنفس المفتاح. أول تفعيل يفتح شاشة «العرض فوق التطبيقات الأخرى».
## ملاحظات
- Google Play تقيّد هذا الإذن؛ للتوزيع خارج المتجر لا مشكلة.
- بعض الهواتف (شاومي) تحتاج أيضًا «عرض النوافذ المنبثقة أثناء التشغيل في الخلفية» من إعدادات التطبيق.
