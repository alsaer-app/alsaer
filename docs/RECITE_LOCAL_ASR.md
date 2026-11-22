> **ملاحظة (test 10194):** محرك whisper/sherpa-onnx الموصوف أدناه حُذف من الشيفرة والـ APK. التسميع الآن بمحرك Quran Lab V4 المحلي فقط (انظر docs/V4_TEST.md). هذا المستند للتاريخ.

# التعرّف القرآني المحلي (on-device) لشاشة التلاوة

## الفكرة

محرّك تعرّف يعمل بالكامل على جهاز المستخدم، مضبوط على القرآن الكريم، كبديل أدق من تعرّف Google لشاشة «التلاوة والتسميع» — بلا إنترنت بعد تنزيل لمرة واحدة، والصوت لا يغادر الهاتف.

- **النموذج**: `tarteel-ai/whisper-base-ar-quran` و`tarteel-ai/whisper-tiny-ar-quran` (رخصة Apache-2.0، من فريق Tarteel AI) بصيغة sherpa-onnx int8.
- **مصدر التنزيل داخل التطبيق**: مرآة الصيغة الجاهزة على `huggingface.co/Synthesium/quran-whisper-sherpa-onnx` (مصدَّرة بالمُصدِّر الرسمي لـ k2-fsa؛ تحققنا من تطابق النصوص الناتجة على مقاطع تلاوة مرجعية).
- **الأحجام**: الدقة العالية (base) ≈ 161 ميجا — الخفيف (tiny) ≈ 104 ميجا. تُنزَّل إلى `filesDir/asr/<kind>/` وتُحذف من نفس الشاشة.
- **المحرّك**: sherpa-onnx 2.0.2 (AAR معمّاريّات ARM فقط: `android/app/libs/sherpa-onnx-2.0.2-arm.aar`) + Silero VAD (`android/app/src/main/assets/asr/silero_vad.onnx`).

## المعمارية

```
WebView (recite-asr.js)  ←→  AlsaerNative (JavascriptInterface)  ←→  SherpaAsr (Java)
      اختيار المحرّك            asrStatus/asrDownload/asrStart…        AudioRecord 16kHz
      بطاقة التنزيل في          التنزيل بـ HttpURLConnection            Silero VAD للتقطيع
      إعدادات التلاوة           مع تحقق من الأحجام وإعادة تسمية .part    Whisper دفعي لكل مقطع
```

- الالتقاط: `AudioRecord` (مصدر VOICE_RECOGNITION) 16kHz mono PCM16، إذن الميكروفون يُطلب أولًا عبر `getUserMedia` في الويب (Capacitor يحوّله لطلب نظام).
- التقطيع: Silero VAD (عتبة 0.5، صمت 0.7s، حد أقصى للمقطع 20s)، وكل مقطع يُفكّ بـ Whisper مع **ذيل صمت 0.6 ثانية** (بدونه تسقط نهايات الكلمات — مُتحقق منه عمليًا).
- النتائج تصل الصفحة عبر `window.__rcAsr(type, sid, payload)` وتدخل نفس مسار المطابقة الحالي (`rcFeed/rcHyp`) دون أي تغيير في منطق التتبع.
- تعرّف Google يبقى الافتراضي؛ النموذج المحلي يعمل فقط بعد تنزيله واختياره في إعدادات التلاوة، وعند فشل تحميله يعود التطبيق لتعرّف Google تلقائيًا مع تنبيه.

## التحقق الذي أُجري (قبل التكامل)

- مطابقة النص المعياري (بعد التطبيع الإملائي) على 11 مقطع تلاوة استوديو (الفاتحة + الإخلاص):
  base ‏9/11 وtiny ‏8/11، وأحد الاختلافين قراءة معتبرة (مالك/ملك). الفشل المتبقي كان بسبب قِصَر المقاطع وعولج بذيل الصمت.
- النسخة 2.0.2 من sherpa-onnx أثبتت أقل هلوسة من 1.12.40 على النموذج نفسه.

## قيود معروفة

- تحميل نموذج base يحتاج ذاكرة حرة تقارب 0.5–0.7 جيجا؛ على الأجهزة الضعيفة قد يفشل التحميل (يعود التطبيق لـ Google تلقائيًا) — لذلك وُجد خيار tiny.
- فك الترميز دفعي لكل مقطع (كلمة بكلمة لحظيًا غير ممكن مع Whisper على الهاتف)؛ التجربة: تظهر الكلمات بعد كل وقفة تلاوة.
- المقاطع تُقصّ عند 28 ثانية (حد Whisper ‏30s).

## النسب (Attribution)

- النموذجان المضبوطان: [Tarteel AI](https://huggingface.co/tarteel-ai) — Apache-2.0.
- المعمارية الأساسية: OpenAI Whisper — MIT.
- محرك التشغيل والتصدير: [k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) — Apache-2.0.
- مرآة الصيغة الجاهزة: [Synthesium/quran-whisper-sherpa-onnx](https://huggingface.co/Synthesium/quran-whisper-sherpa-onnx) — Apache-2.0.
