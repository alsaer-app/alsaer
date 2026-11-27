# تجهيز مشروع Android لتطبيق السائر

## مهم
هذا مجلد المصدر الحالي للواجهة والبيانات، وليس مشروع Android Studio مُولّداً بعد.
تم استبعاد ملفات APK المستخرجة لأنها ليست مشروع Android قابلًا للبناء.

## المتطلبات
- Node.js LTS و npm
- Android Studio مع Android SDK و Build Tools
- اتصال إنترنت عند تنزيل حزم Capacitor أول مرة

## إنشاء مشروع Android
افتح Terminal داخل هذا المجلد ونفّذ:

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

بعدها سيفتح مجلد `android` في Android Studio.

## إضافة البصمة
سيتم إضافة تكامل AndroidX Biometric / BiometricPrompt داخل مشروع Android بعد إنشائه، مع إبقاء PIN أو كلمة المرور كوسيلة احتياطية.

## تنبيه بشأن التحديثات والبيانات
لا تحذف النسخة المثبتة من الهاتف ولا تمسح بياناتها.
قبل إصدار APK تحديث يجب استخدام نفس applicationId ومفتاح التوقيع الأصلي. لا يوجد مفتاح التوقيع داخل هذا الأرشيف.
