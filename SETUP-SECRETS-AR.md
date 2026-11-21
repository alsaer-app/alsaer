<div dir="rtl">

# إعداد أسرار التوقيع (GitHub Secrets)

النسخ الرسمية (Release) تُوقَّع بمفتاحك الخاص `alsaer-release-key.p12`. المفتاح وكلمات المرور **لا تُرفع أبدًا إلى المستودع**؛ تُحفظ فقط في GitHub Secrets التي يشفّرها GitHub ولا يعرضها بعد الحفظ.

## خطوات الإضافة (مرة واحدة)

1. افتح صفحة المستودع على GitHub.
2. من الشريط العلوي داخل المستودع اضغط **Settings**.
3. من القائمة الجانبية افتح **Secrets and variables** ثم **Actions**.
4. اضغط **New repository secret** وأضف الأسرار الأربعة التالية واحدًا تلو الآخر:

| الاسم | القيمة |
|---|---|
| `KEYSTORE_BASE64` | محتوى ملف المفتاح بعد تحويله إلى base64 (سطر واحد طويل) |
| `KEYSTORE_PASSWORD` | كلمة مرور ملف المفتاح |
| `KEY_ALIAS` | `alsaer-release` |
| `KEY_PASSWORD` | كلمة مرور المفتاح نفسها (ملف p12 يستخدم كلمة مرور واحدة) |

### تحويل المفتاح إلى base64

على لينكس/ماك، بجانب الملف:

```bash
base64 -w0 alsaer-release-key.p12
```

على ويندوز (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('alsaer-release-key.p12'))
```

انسخ الناتج كاملًا والصقه في خانة Secret.

## إصدار نسخة جديدة

بعد إضافة الأسرار:

1. من صفحة المستودع افتح **Releases** ثم **Draft a new release**.
2. أنشئ Tag جديدًا يبدأ بحرف `v` مثل `v1.0.14` واضغط **Publish release**.
3. سيبني GitHub Actions تلقائيًا نسخة APK موقعة بمفتاحك، ويرفعها على صفحة الإصدار، ويحدّث ملف `update.json`.

`versionCode` للنسخ الجديدة = `10145 + رقم تشغيل الـ workflow`، حتى يبقى دائمًا أكبر من النسخة المثبتة الحالية (10145).

## تنبيهات

- لا ترسل المفتاح أو كلمات المرور في أي محادثة أو بريد.
- احتفظ بنسخة من `alsaer-release-key.p12` في مكان آمن؛ فقدانه يمنع إصدار تحديثات متوافقة مع النسخة المنشورة.
- إن تسربت كلمة المرور يومًا، غيّرها على نفس المفتاح بأمر `keytool -storepasswd -keystore alsaer-release-key.p12` ثم حدّث السرّين `KEYSTORE_PASSWORD` و`KEY_PASSWORD`.

</div>
