# سياسة الخصوصية - السائر إلى الله

آخر تحديث: 27 نوفمبر 2026. تصف هذه السياسة ما يفعله كود التطبيق في هذا المستودع. [English version below](#privacy-policy---alsaer-english).

## بياناتك على جهازك

يحفظ التطبيق سجلات العبادات والعادات والتقدم والملاحظات والملف الشخصي والإعدادات في تخزين التطبيق على هاتفك، مع مرآة محلية ونسخ أمان داخل مساحة التطبيق. لا نملك خادمًا يستقبل هذه البيانات، ولا يتطلب التطبيق حسابًا لدينا.

لا تتضمن شيفرة التطبيق إعلانات ولا أدوات تحليلات ولا تتبع سلوكي.

هذه البيانات ليست مشفرة بالكامل أثناء السكون. قفل التطبيق (رمز PIN أو كلمة مرور أو نمط أو بصمة) يمنع فتح الواجهة، ولا يحوّل التخزين كله إلى قاعدة بيانات مشفرة. يُحفظ رمز القفل في صورة مشتقة (PBKDF2) وليس نصًا صريحًا، عدا رمز PIN قديم من إصدارات سابقة يُحوَّل إلى الصورة المشتقة عند أول فتح ناجح بعد التحديث.

## الموقع والأذونات

- **الموقع** (تقريبي ودقيق): اختياري، لحساب مواقيت الصلاة والقبلة على هاتفك. يحفظ التطبيق محليًا آخر إحداثيات ودقتها ووقت التحديث واسمًا تقريبيًا للمكان. لا نرسل الإحداثيات إلى خادم لنا ولا إلى خدمة لحساب المواقيت. قد تدخل إعدادات الموقع في ملف النسخة الاحتياطية إن أنشأت نسخة.
- **الإشعارات والمنبهات الدقيقة وإعادة التشغيل**: لتذكيراتك المجدولة، وإعادة جدولتها بعد إعادة تشغيل الهاتف. يبقى وصول التنبيه خاضعًا لقيود أندرويد والجهاز.
- **البصمة أو الوجه**: عبر نظام أندرويد. لا يحصل التطبيق على قالب البصمة أو الوجه.
- **العرض فوق التطبيقات والخدمات الأمامية**: للتذكير العائم عند تفعيله، ولتشغيل الراديو في الخلفية.
- **تثبيت الحزم**: لتثبيت تحديث تختاره من داخل التطبيق، مع خطوات التأكيد التي يطلبها أندرويد.
- **الإنترنت وحالة الواي فاي والاستيقاظ والاهتزاز**: لجلب المحتوى والتحديثات والتشغيل والتنبيه.
- اختيار ملف الحفظ أو الاستعادة يتم عبر منتقي ملفات أندرويد. الموقع الذي تختاره قد يكون محليًا أو سحابيًا.

## الاتصال بالإنترنت

الأساس يعمل دون إنترنت: المصحف والتفسير وأسماء الله وحصن المسلم والتذكيرات والمواقيت والمتابعة. تتصل الميزات التالية بخدمات خارجية، وقد يرى مزوّد كل خدمة عنوان IP ومعلومات الاتصال المعتادة:

- **الراديو**: بث مباشر من qurango.net وstream.radiojar.com. يسمح التطبيق بالاتصال غير المشفر (http) لنطاق radiojar.com وحده لأن البث يعيد التوجيه إليه؛ كل ما عداه https.
- **استمع لقارئ** والتلاوة داخل المصحف: ملفات صوت من mp3quran.net وverses.quran.com وخوادم صوت قرآنية أخرى.
- **فتاوى ابن باز**: تُحمَّل شرائح النص عند الحاجة من مستودع التطبيق على GitHub (raw.githubusercontent.com) وتُحفظ للقراءة دون اتصال. صوت الفتوى يُبثّ من files.zadapps.info، وتنزيله اختياري لكل ملف.
- **الأحاديث**: تُجلب كتب الحديث عند الطلب من cdn.jsdelivr.net، من إصدار محدد (commit) من مستودع hadith-api.
- **بطاقة اليوم**: يجلب التطبيق آيات وأحاديث من bayan.alwa7i.com باستعلامات ثابتة مدمجة في التطبيق، لا تحتوي بياناتك.
- **التحديثات**: يقرأ التطبيق ملف update.json العام من GitHub عند فتحه (بحد أدنى كل 12 ساعة) وفي الخلفية مرة كل 24 ساعة تقريبًا. لا يُنزَّل التحديث إلا عبر https وبعد التحقق من SHA-256 واسم الحزمة، ويطلب أندرويد تأكيدك قبل التثبيت.
- **الروابط التي تفتحها** (مثل sunnah.com وdorar.net ويوتيوب وموقع المصدر) تُفتح في المتصفح وتخضع لسياسة الموقع المقصود.

لا يرسل التطبيق سجلات عباداتك أو ملاحظاتك أو ملفك الشخصي في هذه الطلبات. مصحف ورش المصوّر خيار اختياري غير مفعّل افتراضيًا ولا عنوان تنزيل له في التطبيق العادي.

## Google Drive والنسخ الاحتياطي

ربط Google Drive اختياري. يطلب التطبيق عبر خدمات Google على جهازك صلاحية واحدة هي `drive.file`، وتتيح له التعامل مع الملفات التي أنشأها في حسابك فقط، وليست إذنًا لقراءة بقية ملفاتك. يحفظ التطبيق محليًا حالة الربط وبريد الحساب عند توفره، ويستخدم رمز وصول لتنفيذ العمليات. لا يطلب التطبيق كلمة مرور حساب Google ولا يخزنها.

بعد الربط يمكن رفع نسخ مؤرخة واستعراضها واستعادتها. النسخ التلقائي مفعّل افتراضيًا في الإعدادات الحالية، ويُفحص عند فتح التطبيق أو الرجوع إليه بعد مرور المدة، وليس وعدًا بالعمل أثناء إغلاقه. يمكن إيقافه من شاشة النسخ الاحتياطي. لا يحذف التطبيق النسخ القديمة تلقائيًا؛ يمكنك حذف نسخ محددة بعد اختيارها وتأكيد الحذف. فك الربط لا يحذف ملفات النسخ من Drive. Google تعالج الملفات وطلبات التفويض وفق سياساتها.

استخدام التطبيق للمعلومات المستلمة من Google APIs ونقلها إلى أي تطبيق آخر يلتزم بـ[سياسة بيانات المستخدم في خدمات Google API](https://developers.google.com/terms/api-services-user-data-policy)، بما فيها متطلبات الاستخدام المحدود.

يمكنك كذلك حفظ ملف مستقل عبر ملفات أندرويد دون حساب Google. نسخة الأمان داخل مساحة التطبيق لا تكفي للحماية من فقد الهاتف أو إزالة التطبيق، فاحتفظ بملف مستقل أو بنسخة Drive تصل إليها من جهاز آخر.

التشفير بكلمة مرور اختياري وغير مفعّل افتراضيًا. عند تفعيله يُشفَّر محتوى النسخة على الجهاز قبل الحفظ أو الرفع باستخدام AES-GCM ومفتاح مشتق بـPBKDF2-SHA256. يحفظ تطبيق أندرويد كلمة مرور النسخ محميةً بمفتاح Android Keystore لتسهيل النسخ اللاحق. احفظ كلمة المرور خارج الهاتف أيضًا، فلا يتيح التطبيق استرجاعها عند فقد الجهاز. وإن لم تفعّل التشفير يكون ملف النسخة مقروءًا لمن يصل إليه.

تستبعد النسخة الحديثة حقول قفل التطبيق الأساسية، لكنها تتضمن بياناتك وإعداداتك الأخرى ومنها إعدادات الموقع إن كانت محفوظة. لا تشارك الملف إلا مع من تثق به.

يستثني النسخ التلقائي المدمج في أندرويد بيانات الواجهة الأساسية (التي تضم سجلاتك) ورمز القفل، فلا تعتمد عليه لاستعادة بياناتك؛ الطريق الموثوق هو الملف المستقل أو Drive. نقل الهاتف المباشر إلى جهاز جديد (device transfer) يستثني بيانات الواجهة الأساسية فقط، ولا يستثني إعدادات الإشعارات والشريط العائم المحفوظة محليًا.

## الحذف وحدود الاستعادة

يمكنك مسح بيانات التطبيق من هاتفك أو إزالته. هذا لا يحذف الملفات التي صدّرتها ولا النسخ الموجودة في Google Drive؛ احذفها من مواقعها إن أردت، ويمكنك سحب إذن التطبيق من [إعدادات حساب Google](https://myaccount.google.com/permissions).

لا نضمن استعادة بياناتك بعد إزالة التطبيق أو فقد الهاتف اعتمادًا على نسخة داخلية أو نسخ أندرويد الاحتياطي وحده. تحقق من ملف مستقل وكلمة مروره أو من نسخة Drive وحسابها قبل إزالة التطبيق أو تغيير الجهاز.

## التواصل

أي سؤال عن الخصوصية: cvgj62240@gmail.com. الكود المفتوح: https://github.com/alsaer-app/alsaer

---

# Privacy Policy - Alsaer (English)

Last updated: November 27, 2026. This policy describes what the app's code in this repository does.

## Your data stays on your phone

The app stores your worship and habit records, progress, notes, profile and settings in its local storage on your phone, with a local mirror and safety copies inside the app's space. We run no server that receives this data, and no account with us is needed. The app code contains no ads, analytics or behavioral tracking.

This data is not fully encrypted at rest. The app lock (PIN, password, pattern or biometrics) prevents opening the interface; it does not turn all storage into an encrypted database. The lock code is stored in derived form (PBKDF2), not as plain text, except an old PIN from earlier versions, which is converted to the derived form on the first successful unlock after updating.

## Location and permissions

- **Location** (approximate and precise): optional, used on your phone to compute prayer times and qibla. The app stores the last coordinates, accuracy, update time and an approximate place name locally. We do not send coordinates to a server of ours or to a prayer-time service. Location settings may be included in a backup file if you create one.
- **Notifications, exact alarms and boot receiver**: for the reminders you schedule, and to reschedule them after a restart. Delivery stays subject to Android and device limits.
- **Biometrics**: through Android. The app never receives your fingerprint or face template.
- **Display over other apps and foreground services**: for the floating reminder when enabled, and for background radio playback.
- **Install packages**: to install an update you choose from inside the app, with Android's own confirmation steps.
- **Internet, Wi-Fi state, wake lock, vibration**: to fetch content and updates, play audio and alert you.
- Backup and restore files are chosen through Android's file picker. The place you choose may be local or cloud.

## Internet use

The core works offline: Mushaf, tafsir, Names of Allah, Hisn al-Muslim, reminders, prayer times and tracking. These features contact external services, whose providers may see your IP address and usual connection details:

- **Radio**: live streams from qurango.net and stream.radiojar.com. The app allows unencrypted http for the radiojar.com domain only, because the stream redirects there; everything else is https.
- **Reciters** and in-Mushaf recitation: audio files from mp3quran.net, verses.quran.com and other Quran audio servers.
- **Ibn Baz fatwas**: text slices load on demand from the app's GitHub repository (raw.githubusercontent.com) and are cached for offline reading. Fatwa audio streams from files.zadapps.info; downloading is optional per file.
- **Hadith**: hadith books load on demand from cdn.jsdelivr.net, from a fixed commit of the hadith-api repository.
- **Daily card**: the app fetches verses and hadith from bayan.alwa7i.com using fixed queries built into the app, which contain none of your data.
- **Updates**: the app reads the public update.json from GitHub when opened (at most every 12 hours) and in the background roughly every 24 hours. Updates download only over https and after SHA-256 and package-name checks, and Android asks you to confirm before installing.
- **Links you open** (such as sunnah.com, dorar.net, YouTube and source sites) open in your browser and follow that site's policy.

The app does not send your worship records, notes or profile in these requests. The illustrated Warsh Mushaf is an optional feature, off by default, with no download address in the normal app.

## Google Drive and backups

Linking Google Drive is optional. Through Google services on your device the app requests one permission, `drive.file`, which lets it work only with files the app itself creates in your account, not the rest of your Drive. The app stores the link state and the account email (when available) locally and uses an access token to perform operations. It never asks for or stores your Google account password.

After linking you can upload dated backups, list them and restore them. Automatic backup is on by default in the current settings; it is checked when the app opens or returns after the interval, and is not a promise to run while the app is closed. You can turn it off on the backup screen. The app does not delete old backups on its own; you can delete specific backups after choosing and confirming. Unlinking does not delete backup files from Drive. Google processes files and authorization requests under its own policies.

The app's use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

You can also save a standalone file through Android's file picker without a Google account. The safety copy inside the app's space does not protect against losing the phone or uninstalling, so keep a standalone file or a Drive copy you can reach from another device.

Password encryption is optional and off by default. When on, backup content is encrypted on your device before saving or uploading with AES-GCM and a key derived with PBKDF2-SHA256. The Android app keeps the backup password protected by an Android Keystore key to make later backups easier. Keep the password somewhere outside the phone too: the app cannot recover it if you lose the device. Without encryption, the backup file is readable by anyone who gets it.

Recent backups leave out the app lock's core fields but include your other data and settings, including location settings if saved. Share the file only with people you trust.

Android's built-in automatic backup excludes the app's main interface data (which holds your records) and the lock code, so do not rely on it to restore your data; the reliable routes are the standalone file or Drive. Direct phone-to-phone transfer (device transfer) excludes only the main interface data, not the locally stored notification and floating-bar settings.

## Deletion and restore limits

You can clear the app's data or uninstall it. This does not delete files you exported or backups in Google Drive; delete them where they are, and you can revoke the app's access in your [Google Account permissions](https://myaccount.google.com/permissions).

We do not guarantee data can be restored after uninstalling or losing the phone from the internal copy or Android's backup alone. Check a standalone file and its password, or a Drive copy and its account, before uninstalling or changing devices.

## Contact

Privacy questions: cvgj62240@gmail.com. Source code: https://github.com/alsaer-app/alsaer
