# Security Policy / سياسة الأمان

## الإبلاغ عن ثغرة / Reporting a vulnerability

لا تفتح Issue عامًا لثغرة أمنية. راسلنا على البريد التالي بعنوان «Security»:
Please do not open a public issue for a security problem. Email us with the subject "Security":

**cvgj62240@gmail.com**

اذكر: الإصدار، الجهاز ونسخة أندرويد، خطوات التكرار، والأثر المتوقع. لا ترسل بيانات شخصية حقيقية.
Include: app version, device and Android version, steps to reproduce, and the expected impact. Do not send real personal data.

نحاول الردّ خلال 7 أيام. هذا مشروع يديره شخص واحد بلا ضمان لمدة الإصلاح. نطلب مهلة معقولة قبل النشر العلني.
We aim to reply within 7 days. This is a single-maintainer project with no guaranteed fix time. Please allow a reasonable period before public disclosure.

## الإصدارات المدعومة / Supported versions

الإصدار الأحدث المنشور فقط. Only the latest published release.

## نطاق الأمان / Scope

- التطبيق يعمل دون حساب ولا خادم خاص بنا. البيانات على الجهاز.
- النسخ الاحتياطي إلى Google Drive اختياري ويذهب إلى حساب المستخدم نفسه، مع تشفير اختياري على الجهاز.
- الاتصال بغير HTTPS مسموح لنطاق radiojar.com فقط (بث الراديو).
- لا تُرفع مفاتيح التوقيع أو كلمات المرور إلى المستودع. التوقيع يتم عبر GitHub Actions Secrets.

التفاصيل: [PRIVACY.md](PRIVACY.md).
