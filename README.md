<div dir="rtl">

# السائر إلى الله (Alsaer)

تطبيق أندرويد إيماني شخصي يعمل **دون إنترنت** بالكامل؛ كل بياناتك محفوظة على جهازك فقط ولا تُرسل إلى أي خادم.

**معرّف التطبيق:** `com.ahmedalajmi.alsaer` · **الإصدار الحالي:** 1.0.13 (versionCode 10145)

## المزايا

- **المصحف الكامل**: عرض صفحات المصحف (١٥ سطرًا) بخط عثماني، بروايتي حفص وورش، مع إبراز أحكام التجويد بالألوان؛ نص ٦٢٣٦ آية من مشروع تنزيل.
- **التلاوة والتصحيح بالتعرف على الكلام**: تلاوة آيات مع متابعة صوتية عبر محرك التعرف في الهاتف، مع Whisper محلي اختياري وWeb Speech كاحتياط.
- **مواقيت الصلاة والتنبيهات**: إشعارات محلية مجدولة بنغمة مخصصة، تعمل بعد إعادة تشغيل الهاتف.
- **التذكير العائم**: تنبيهات تظهر فوق التطبيقات الأخرى (نافذة عائمة).
- **ودجت الشاشة الرئيسية**: متابعة يومية من الشاشة الرئيسية.
- **متابعة العادات والتوبة**: تسجيل أيام النجاح والانتكاسة مع الملاحظات والأسباب والمحفزات، حساب دقيق لسلسلة الالتزام، وسجل للرغبات وكيفية تجاوزها.
- **جدول الصيام**: الاثنين والخميس، الأيام البيض، عاشوراء وتاسوعاء وعرفة، ستة شوال، صيام داود، وأيام مخصصة، مع تذكيرات السحور والإفطار.
- **الأذكار والأدعية**: محتوى من الكتاب والسنة مع عدّادات.
- **التقييم الذاتي**: مراجعة أسبوعية وشهرية (٧ و٣٠ يومًا) ولوحة إنجازات.
- **الخصوصية والحماية**: قفل برمز PIN أو كلمة مرور أو نمط، مع فتح بالبصمة، وإيقاف مؤقت بعد محاولات خاطئة.
- **نسخ احتياطي مشفر**: تصدير واستعادة بكلمة مرور (AES-256-GCM مع PBKDF2-SHA256).
- **واجهة عربية RTL** بثيمات فاتحة وداكنة، تاريخ هجري (أم القرى) وميلادي، وملف شخصي اختياري (اسم وصورة وعمر). لغات إضافية قيد الاكمال.

## التثبيت

حمّل أحدث ملف APK من صفحة [Releases](../../releases) وثبّته على جهازك (قد يطلب أندرويد السماح بالتثبيت من مصادر خارجية).

> التحديث فوق نسخة مثبتة يتطلب نفس مفتاح التوقيع؛ النسخ الموقعة بمفتاح Debug التجريبي لا تُثبَّت فوق النسخة الرسمية.

## لقطات الشاشة

> قريبًا: تُضاف لقطات الشاشة هنا.
> <!-- ضع الصور في مجلد screenshots/ وأشر إليها هنا، مثال: -->
> <!-- ![الرئيسية](screenshots/home.png) -->

## البنية التقنية

- **Capacitor 5** (WebView) مع جسر Kotlin/Java أصلي (`com.ahmedalajmi.alsaer`).
- الواجهة صفحة واحدة بلا مكتبات خارجية: المصدر مقسّم في `src/` ويُجمَّع إلى `www/index.html` عبر `python3 tools/build_web.py`.
- بيانات المستخدم في `localStorage` تحت المفتاح `tawba_v1` (لا تغيّره للحفاظ على بيانات المستخدمين).
- مكونات أصلية: إشعارات ومجدول تنبيهات، خدمة التذكير العائم، الودجت، البصمة، التعرف على الكلام.
- البناء والإصدار عبر GitHub Actions (انظر `.github/workflows/`).

## البناء من المصدر

```bash
npm install
python3 tools/build_web.py     # يجمع src/ في www/index.html
npx cap sync android
cd android && ./gradlew assembleDebug
```

لنسخة Release موقعة تحتاج ملف المفتاح وكلمات المرور عبر متغيرات البيئة؛ راجع [SETUP-SECRETS-AR.md](SETUP-SECRETS-AR.md).

## التحديث التلقائي

عند كل Tag جديد (`v*`) يبني workflow الإصدارَ الموقع ويرفعه إلى Releases ويحدّث ملف [`update.json`](update.json) على الفرع الرئيسي. يمكن للتطبيق لاحقًا فحص:

```
https://raw.githubusercontent.com/ahmed010910aa-droid/alsaer/main/update.json
```

ومقارنة `versionCode` بالنسخة المثبتة، ثم تنزيل `apkUrl` بعد التحقق من `sha256`. (آلية الفحص داخل التطبيق تُنفَّذ في إصدار قادم.)

## خارطة الطريق

- التحقق من التحديثات داخل التطبيق عبر `update.json`.
- استكمال ترجمة كل الشاشات للغات الإضافية.
- مزامنة سحابية اختيارية مشفرة (قيد الدراسة).
- تحسين محرك التلاوة المحلي (Whisper).
- لوحة إنجازات وإحصاءات أعمق.

## الحقوق والمصادر

- نص المصحف: مشروع تنزيل (tanzil.net)، رواية حفص بالرسم العثماني، رخصة CC BY 3.0، منقول دون تعديل (يجب إبقاء هذه الإشارة).
- تخطيط صفحات المصحف: zonetecde/mushaf-layout (QPC1) وcpfair/quran-tajweed (CC BY 4.0) وfawazahmed0/quran-api (Unlicense).
- الخط: UthmanicHafs (مجمع الملك فهد لطباعة المصحف الشريف).
- حقوق الاسم والتصميم والكود لصاحب المشروع © 2026 AHMED ELAGAMY.

## التواصل

- فيسبوك: https://www.facebook.com/share/1E4Mr4L2Yd/
- واتساب: https://wa.me/201020372842

</div>

---

# Alsaer (السائر إلى الله) — English

A private, **offline-first** Android companion for worship and self-improvement. All data stays on the device; nothing is sent to any server.

**Features:** full mushaf reader (15-line pages, Uthmanic font, Hafs & Warsh riwayas, color-coded tajweed), recitation with speech recognition, prayer times and local reminders, a floating reminder overlay, a home-screen widget, habit and repentance tracking (streaks, relapses, triggers, urges), fasting schedule (Mondays/Thursdays, white days, Ashura, Arafah, Shawwal, Dawud, custom), adhkar with counters, weekly/monthly self-review, PIN/password/pattern lock with biometrics, encrypted password-protected backups (AES-256-GCM + PBKDF2), Arabic RTL UI with light/dark themes, Hijri (Umm al-Qura) and Gregorian dates.

**Install:** download the latest APK from [Releases](../../releases).

**Tech:** Capacitor 5 (WebView) with a native Kotlin/Java bridge (`com.ahmedalajmi.alsaer`); single-page vanilla HTML/JS app split under `src/` and bundled by `python3 tools/build_web.py` into `www/index.html`; user data in `localStorage` (`tawba_v1`); native alarm scheduler, floating reminder service, widget, biometric and speech plugins; builds via GitHub Actions.

**Build:** `npm install && python3 tools/build_web.py && npx cap sync android && cd android && ./gradlew assembleDebug`

**Releases & auto-update:** pushing a `v*` tag builds a signed APK, publishes a GitHub Release, and refreshes `update.json` on `main` for in-app update checks (client code planned). Signing uses GitHub Secrets only — see [SETUP-SECRETS-AR.md](SETUP-SECRETS-AR.md).

**Credits:** Quran text from tanzil.net (Hafs, Uthmani script, CC BY 3.0, unchanged — attribution required); page layout from zonetecde/mushaf-layout (QPC1), cpfair/quran-tajweed (CC BY 4.0), fawazahmed0/quran-api (Unlicense); UthmanicHafs font (King Fahd Glorious Quran Printing Complex). Name, design and code © 2026 AHMED ELAGAMY.
