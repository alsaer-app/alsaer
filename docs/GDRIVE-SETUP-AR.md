# ربط النسخ الاحتياطي بـ Google Drive — خطوات يفعلها صاحب التطبيق بنفسه

هذه الخطوات تتم مرة واحدة في حساب Google الخاص بك (لا يملك أحد غيرك إنشاءها نيابة عنك). حتى تكتمل، تبقى بطاقة «نسخة Google Drive» مخفية في التطبيق لأن `GD_CLIENT_ID` فارغ.

## 1. أنشئ مشروع Google Cloud

1. افتح https://console.cloud.google.com وسجّل بحساب Google الذي تريد.
2. أنشئ مشروعًا جديدًا (مثل: `alsaer-backup`).

## 2. فعّل Google Drive API

- من القائمة: **APIs & Services ← Library**، ابحث عن «Google Drive API» واضغط **Enable**.

## 3. جهّز شاشة الموافقة (OAuth consent screen)

1. **APIs & Services ← OAuth consent screen**.
2. اختر **External**، واملأ اسم التطبيق (السائر إلى الله) وبريد الدعم (بريدك).
3. في خطوة **Scopes** أضف نطاقًا واحدًا فقط:
   `https://www.googleapis.com/auth/drive.file`
   (أقل صلاحية: التطبيق يرى فقط الملفات التي ينشئها هو).
4. في **Test users** أضف بريدك وبريد من سيجرب التطبيق.
5. أبقِ التطبيق في وضع **Testing** للاستخدام الشخصي (حتى 100 مستخدم تجريبي). ملاحظة: في وضع Testing تنتهي صلاحية رمز الربط بعد 7 أيام فيعيد المستخدم الربط بضغطة واحدة. نشر التطبيق (Publishing) مع نطاق حساس يتطلب مراجعة من Google.

## 4. أنشئ معرّف عميل OAuth (Android)

1. **APIs & Services ← Credentials ← Create Credentials ← OAuth client ID**.
2. النوع: **Android**.
3. الاسم: أي اسم. **Package name**: `com.ahmedalajmi.alsaer`.
4. **SHA-1 certificate fingerprint** — استخرجه من مخزن مفاتيح التوقيع:

   للنسخة التجريبية (debug):
   ```
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   لنسخة الإصدار: نفس الأمر على ملف الـkeystore الذي توقّع به الـAPK.
   انسخ سطر `SHA1:` والصقه. أنشئ معرّفًا لكل بصمة (debug وrelease).

5. ستحصل على Client ID بصيغة: `xxxxxxxx.apps.googleusercontent.com` — ليس سرًّا ولا يخشى ظهوره في الكود.

## 5. ضع المعرّف في الكود وابنِ

- في `src/services/gdrive-backup.js` املأ:
  `var GD_CLIENT_ID='xxxxxxxx.apps.googleusercontent.com';`
- أعد بناء التطبيق عاديًا (CI يبني من src تلقائيًا).

## كيف يعمل الربط من جهة المستخدم

- من «النسخ الاحتياطي»: **ربط Google Drive** → يفتح متصفح الجهاز على صفحة موافقة Google → بعد الموافقة يعود المتصفح إلى التطبيق تلقائيًا (عبر الرابط `com.ahmedalajmi.alsaer://gdrive`).
- «رفع نسخة الآن» يرفع النسخة إلى ملف `alsaer-backup.json` في درايف المستخدم، و«تنزيل آخر نسخة» يضعها في صندوق الاستيراد ليراجعها ويؤكدها بنفسه.
- رمز الربط (refresh token) يُخزَّن على الجهاز فقط، ويُحذف بزر «فصل الحساب» أو بمسح بيانات التطبيق.

## حدود معروفة

- لا يوجد رفع تلقائي مجدول (قرار تصميمي مؤجل).
- رمز الربط غير مشفّر سكونًا مثل بقية بيانات التطبيق المحلية.
