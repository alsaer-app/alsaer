# هيكلية تطبيق «السائر»

المصدر الفعلي للتطبيق صار في `src/` مقسّمًا على نمط مشاريع الواجهات الحديثة (screens / components / services / constants / styles)،
وأداة البناء `tools/build_web.py` تجمعه حسب `src/manifest.json` في الملف الجاهز `www/index.html`
(الملف الناتج مطابق بايت-ببايت للإصدار السابق، فلا تغيّر في السلوك).

## الأوامر
- `python3 tools/build_web.py` — يبني `www/index.html` من `src/`.
- `python3 tools/build_web.py --check` — يتحقق أن `www/index.html` مطابق للمصدر.
- بعد البناء: انسخ الناتج إلى `android/app/src/main/assets/public/index.html` ثم ابنِ APK كالمعتاد.
- **لا تعدّل `www/index.html` مباشرة بعد الآن؛ عدّل ملفات `src/` ثم ابنِ.**

## الخريطة
| المجلد | المحتوى |
|---|---|
| `src/core/` | `bootstrap` (فتح النطاق)، `state` (الحالة S)، `render` (الرسم والمؤقتات)، `event-dispatcher` (النقرات)، `enhancers` (إضافات حول render/toast) |
| `src/constants/` | الثوابت: الأذكار، الأيقونات الأساسية، القوائم |
| `src/services/` | منطق بلا واجهة: `storage` `security-biometric` `i18n` `theme` `prayer-times` `quran-warsh` `reader-layout` `habit-tracker` `worship-fasting` `daily-card` `gender-address` `reminders-ui` `native-schedule` … |
| `src/components/` | قطع واجهة قابلة لإعادة الاستخدام: الأيقونات والرسوم، بطاقات الرئيسية، ورقة إعدادات المصحف، محرر القوائم، مركز الأمان |
| `src/screens/` | الشاشات: `home` `home-new` `prayers` `quran` `reader` `progress-habits-calendar` `more` `settings` `lock` `onboarding` `worship` `appearance` |
| `src/styles/` | الأنماط مقسّمة بحسب الغرض |
| `src/shell/` | هيكل HTML الثابت (head، حاويات، علامات script الخارجية) |
| `src/data-build/` | سكربتات توليد بيانات المصحف/ورش |

## ملاحظات
- الملفات تُدمج بالترتيب نفسه داخل نطاق واحد (IIFE)، فهي تشترك في المتغيرات؛ ترتيب `manifest.json` مهم.
- ملف قد يحوي وظائف أحدث من اسم المجلد (مثل `home-new.js` للمظهر الجديد)؛ سمّ الملفات الجديدة بالمنهج نفسه وأضفها في المانيفست.

## الانتقال لاحقًا إلى React + Vite (خطة، غير منفّذة)
1. حوّل كل ملف في `src/services/` إلى وحدة ES (`export function …`) واستبدل المتغيّرات المشتركة بوحدة `state`.
2. حوّل كل دالة `vXxx()` في `src/screens/` إلى مكوّن React (`XxxScreen.jsx`) يعيد JSX بدل نص HTML، وكل دالة في `components/` إلى مكوّن.
3. استبدل موزّع النقرات `event-dispatcher` بمعالجات `onClick` داخل المكوّنات، و`render()` بحالة React (`useState`/Context).
4. أنشئ `package.json` و`vite.config.mjs` وانقل الأنماط من `src/styles/` كما هي.
5. أبقِ الجسر الأصلي (`AlsaerNative`) خلف `services/native.js` ليبقى التطبيق يعمل على أندرويد دون تغيير.
هذه الخطوات تتطلب تثبيت الحزم وبناء المشروع على جهازك؛ لم يُنفَّذ شيء منها هنا.
