#!/usr/bin/env bash
# يجهّز «الحزمة المدمجة» للتعرّف الصوتي داخل التطبيق (تعمل بلا إنترنت): المكتبة + ملفات ONNX + نموذج القرآن.
# شغّله مرة واحدة على أي جهاز له إنترنت (ويندوز/ماك/لينكس/Termux). الناتج: مجلد extra_assets/ وملف alsaer-offline-pack.zip (نحو ١٣٠ ميجا).
# ثم أرسل الـ zip ليُدمَج في الـ APK، أو انسخ extra_assets/ إلى www/ قبل البناء.
set -e
OUT="${1:-extra_assets}"
TV=3.0.2
CDN="https://cdn.jsdelivr.net/npm/@huggingface/transformers@$TV/dist"
HF="https://huggingface.co/omartariq612/whisper-tiny-ar-quran-onnx/resolve/main"
mkdir -p "$OUT/vendor/ort" "$OUT/models/quran-tiny/onnx"
dl(){ echo "→ $2"; curl -fL --retry 3 -o "$2" "$1"; }
opt(){ echo "→ (اختياري) $2"; curl -fL --retry 2 -o "$2" "$1" || rm -f "$2"; }
dl "$CDN/transformers.min.js" "$OUT/vendor/transformers.min.js"
for f in ort-wasm-simd-threaded.jsep.mjs ort-wasm-simd-threaded.jsep.wasm; do dl "$CDN/$f" "$OUT/vendor/ort/$f"; done
for f in ort-wasm-simd-threaded.mjs ort-wasm-simd-threaded.wasm; do opt "$CDN/$f" "$OUT/vendor/ort/$f"; done
for f in config.json generation_config.json preprocessor_config.json tokenizer.json tokenizer_config.json vocab.json merges.txt added_tokens.json special_tokens_map.json normalizer.json; do dl "$HF/$f" "$OUT/models/quran-tiny/$f"; done
for f in encoder_model_quantized.onnx decoder_model_merged_quantized.onnx; do dl "$HF/onnx/$f" "$OUT/models/quran-tiny/onnx/$f"; done
cat > "$OUT/vendor/manifest.json" <<J
{"lib":"vendor/transformers.min.js","ort":"vendor/ort/","models":{"omartariq612/whisper-tiny-ar-quran-onnx":"quran-tiny"}}
J
( cd "$OUT/.." 2>/dev/null; true )
if command -v zip >/dev/null; then zip -qr alsaer-offline-pack.zip "$OUT"; echo "تم: alsaer-offline-pack.zip"; else echo "تم: المجلد $OUT (اضغطه يدويًا)"; fi
du -sh "$OUT"
