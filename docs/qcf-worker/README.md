# alsaer QCF proxy worker (Arabic-first notes for Ahmed)

هذا العامل (Worker) يحفظ مفتاح Quran Foundation بعيدًا عن التطبيق.

## خطوات النشر (منك أنت شخصيًا، السر لا يمر عبر المحادثة)
1. Cloudflare Dashboard → Workers & Pages → Create Worker → اسم مقترح: `alsaer-qcf`.
2. Settings → Variables and Secrets → أضف Secretين:
   - `QCF_CLIENT_ID` = Client ID من تطبيق «Alsaer» في لوحة QCF
   - `QCF_CLIENT_SECRET` = Client Secret (يظهر مرة واحدة عند الإنشاء)
3. (اختياري) Variable `QCF_ENV` = `production` بعد اعتماد صلاحيات الإنتاج.
   بدونها يعمل على prelive (سورتا الفاتحة والبقرة فقط للاختبار).
4. Edit code → الصق محتوى `worker.js` → Deploy.
5. أرسل رابط العامل فقط (مثل https://alsaer-qcf.<subdomain>.workers.dev) — لا ترسل الأسرار أبدًا.

## ملاحظات مثبتة من توثيق QCF
- التوكن: POST /oauth2/token مع x-auth-token + x-client-id، منحة Client Credentials.
- client_secret يظهر مرة واحدة؛ تدويره يتطلب سرًّا جديدًا من اللوحة.
- prelive Content API يخدم سورتي 1-2 فقط؛ الإنتاج يحتاج اعتماد الصلاحيات.

## غير مثبت بعد
- مسار خطوط QCF (fonts) — سيُتحقق منه عند ربط العرض في التطبيق؛ إن اختلف عن
  التوثيق سأبلغك بالفرق قبل أي تغيير في المصحف.
