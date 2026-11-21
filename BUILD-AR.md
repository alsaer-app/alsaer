# بناء «السائر إلى الله» (APK)

> ملاحظة صادقة: المسار الأول (السكربتات الداخلية) هو الذي بُنيت به كل الإصدارات المسلَّمة. مسار Gradle/GitHub Actions مكتوب بحسب بنية مشروع Capacitor القياسية **ولم أجرّبه هنا**؛ قد يحتاج تعديلًا بسيطًا.

## 1) تعديل الواجهة فقط
```
python3 tools/build_web.py        # يجمع src/ في www/index.html
python3 -I tests/run.py           # اختبارات المتصفح (Playwright)
```
## 2) بناء APK بمسار Capacitor القياسي (أي جهاز عليه Node 18+ و JDK 17 وAndroid SDK)
```
npm install
python3 tools/build_web.py
npx cap sync android
cd android && ./gradlew assembleRelease
# ثم zipalign + apksigner بمفتاحك (مهم: نفس المفتاح لكل تحديث)
```
## 3) GitHub Actions
ارفع المشروع إلى GitHub، وأضف السرّين `KEYSTORE_B64` (ملف p12 بـ base64) و`KEYSTORE_PASSWORD`، ثم شغّل Workflow «Build Android APK» من تبويب Actions، وحمّل الملف من Artifacts.
## 4) المسار المستخدم هنا (بدون Gradle)
`tools/patch_native.py` + `tools/build_native.sh` + `tools/build_apk.py` تعدّل APK أساسًا وتضيف الكلاسات الأصلية وتوقّع بالمفتاح.
## محرّكات التعرّف
1. تعرّف الهاتف (Google) عبر الجسر الأصلي — الافتراضي، فوري.
2. Web Speech API للمتصفحات (احتياطي، يحتاج إنترنت).
3. نموذج Whisper المحلي — اختياري؛ إن تعلّق ٩٠ ثانية أو فشل يتحوّل التطبيق تلقائيًا إلى (1) أو (2).
