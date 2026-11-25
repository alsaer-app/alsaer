# Data sources and attributions (Quran text, fonts, audio)

| Item | Source | Licence / status |
|---|---|---|
| Hafs text (www/quran.js) | KFGQPC Hafs data v18 via mirror thetruetruth/quran-data-kfgqpc | Mirror provenance and data licence NOT verified. Pre-publish item. |
| Warsh text (www/warsh.js) | KFGQPC Warsh v10 (warshData_v10.json) via the same mirror | Mirror has no licence file; provenance NOT verified. Pre-publish item. Warsh is labelled "not yet verified" in the app. |
| Warsh display font | Scheherazade New 4.500, SIL Global (https://github.com/silnrsi/font-scheherazade, release v4.500, SHA512 of the zip checked against SHA512SUMS) | SIL Open Font License 1.1. Embedded unmodified (WOFF2 conversion only, no subsetting, name kept) as www/fonts/scheherazade-new-regular.woff2. Notice: docs/licenses/scheherazade-new/OFL.txt and FONTLOG.txt. |
| Hafs font | KFGQPC Uthmanic (www/fonts/uthmanic.ttf) | Unchanged. |
| Hafs audio | Quran Foundation (verses.quran.com), reciter Minshawi | See their terms. |
| Warsh audio | mp3quran.net, Yassin Al-Jazaery (Warsh from Nafi'), whole-surah file with ayah timings (API ayat_timing, read 14; copied to www/warsh-timing-yassin.js). Abdul Basit (whole-surah) is the fallback if the timing file fails to load. | The site's own copyright statement (mp3quran.net/privacy-en.html): rights are available to everyone and any visitor or developer may copy material or use links. No formal license text. Reciters' own rights are not addressed there. |

The stored Quran text is never edited. Search normalises only a derived in-memory index.

Scheherazade New: Copyright (c) 1994-2026, SIL Global (https://www.sil.org/), with Reserved Font Names "Scheherazade" and "SIL". Licensed under the SIL Open Font License 1.1 (https://openfontlicense.org/).

## تعريف السورة (www/albitaqat.js)
- المصدر: «كتاب البطاقات» لأ.د. ياسر بن إسماعيل راضي، موقع https://albitaqat.com ، وصيغة JSON من https://github.com/rn0x/albitaqat_quran (data/quran_cards.json).
- الحقوق محفوظة للمؤلف (هكذا في مستودع المصدر). أُضيف المحتوى بنصه كما هو، مع نسبته ظاهرًا في صفحة التعريف، بقرار صاحب التطبيق وعلى مسؤوليته. لا إذن مكتوب من المؤلف حتى الآن.
- الصوت (archive.org، تسجيل استديو وقف تعظيم الوحيين صدى المنورة) وملفات PDF والفيديو (YouTube) روابط خارجية تحتاج إنترنت؛ لا نستضيفها.
- في المصدر التصاق كلمات في بعض الحقول (مثل «قِصَّةِبَقَرَةِ»)؛ تُركت كما هي حفاظًا على النص.
- الإزالة: احذف www/albitaqat.js وtools/build_albitaqat.py ودالة vCards وملحقاتها في src/services/features7.js (وسم «بطاقة السورة») وقواعد .cds في features9.css.
- لا علاقة له بنص المصحف (quran.js / warsh.js) ولا يغيّره.

## Warsh display font: KFGQPC-Warsh V2 Regular (Mashriqi)
- File: www/fonts/KFGQPC-Warsh-V2-Regular.ttf, shipped unmodified (286,452 bytes). Version 1.000, 5 Oct 2025, King Fahd Glorious Quran Printing Complex (KFGQPC). Obtained by the owner from the Telegram channel "خطوط قرآن" (https://t.me/s/quranfont?before=1383), a modified Mashriqi-style edition made by that channel's team from the KFGQPC Warsh font.
- Licence: KFGQPC end-user licence embedded in the font. It allows use, copy and distribute free of cost, but forbids sell, modify, alter, translate, reverse engineer. All rights reserved by KFGQPC. The channel's modified edition has no separate licence and no written approval from KFGQPC is known. Owner accepted this risk (WhatsApp, 2026-11-25). Removable: delete the file and the @font-face in src/styles/reader-text.css.
- Quran text is not changed by the font; www/warsh.js is untouched.
