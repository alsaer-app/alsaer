# Data sources and attributions (Quran text, fonts, audio)

| Item | Source | Licence / status |
|---|---|---|
| Hafs text (www/quran.js) | KFGQPC Hafs data v18 via mirror thetruetruth/quran-data-kfgqpc | Mirror provenance and data licence NOT verified. Pre-publish item. |
| Warsh text (www/warsh.js) | KFGQPC Warsh v10 (warshData_v10.json) via the same mirror | Mirror has no licence file; provenance NOT verified. Pre-publish item. Warsh is labelled "not yet verified" in the app. |
| Warsh display font | Scheherazade New 4.500, SIL Global (https://github.com/silnrsi/font-scheherazade, release v4.500, SHA512 of the zip checked against SHA512SUMS) | SIL Open Font License 1.1. Embedded unmodified (WOFF2 conversion only, no subsetting, name kept) as www/fonts/scheherazade-new-regular.woff2. Notice: docs/licenses/scheherazade-new/OFL.txt and FONTLOG.txt. |
| Hafs font | KFGQPC Uthmanic (www/fonts/uthmanic.ttf) | Unchanged. |
| Hafs audio | Quran Foundation (verses.quran.com), reciter Minshawi | See their terms. |
| Warsh audio | mp3quran.net, Abdul Basit (whole-surah) | Licence NOT confirmed. Pre-publish item. |

The stored Quran text is never edited. Search normalises only a derived in-memory index.

Scheherazade New: Copyright (c) 1994-2026, SIL Global (https://www.sil.org/), with Reserved Font Names "Scheherazade" and "SIL". Licensed under the SIL Open Font License 1.1 (https://openfontlicense.org/).

## تعريف السورة (www/albitaqat.js)
- المصدر: «كتاب البطاقات» لأ.د. ياسر بن إسماعيل راضي، موقع https://albitaqat.com ، وصيغة JSON من https://github.com/rn0x/albitaqat_quran (data/quran_cards.json).
- الحقوق محفوظة للمؤلف (هكذا في مستودع المصدر). أُضيف المحتوى بنصه كما هو، مع نسبته ظاهرًا في صفحة التعريف، بقرار صاحب التطبيق وعلى مسؤوليته. لا إذن مكتوب من المؤلف حتى الآن.
- الصوت (archive.org، تسجيل استديو وقف تعظيم الوحيين صدى المنورة) وملفات PDF والفيديو (YouTube) روابط خارجية تحتاج إنترنت؛ لا نستضيفها.
- في المصدر التصاق كلمات في بعض الحقول (مثل «قِصَّةِبَقَرَةِ»)؛ تُركت كما هي حفاظًا على النص.
- الإزالة: احذف www/albitaqat.js وtools/build_albitaqat.py ودالة vCards وملحقاتها في src/services/features7.js (وسم «بطاقة السورة») وقواعد .cds في features9.css.
- لا علاقة له بنص المصحف (quran.js / warsh.js) ولا يغيّره.
