package com.ahmedalajmi.alsaer;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Handler;
import android.os.Looper;

import com.k2fsa.sherpa.onnx.FeatureConfig;
import com.k2fsa.sherpa.onnx.HomophoneReplacerConfig;
import com.k2fsa.sherpa.onnx.OfflineCtcFstDecoderConfig;
import com.k2fsa.sherpa.onnx.OfflineCanaryModelConfig;
import com.k2fsa.sherpa.onnx.OfflineCohereTranscribeModelConfig;
import com.k2fsa.sherpa.onnx.OfflineDolphinModelConfig;
import com.k2fsa.sherpa.onnx.OfflineFireRedAsrCtcModelConfig;
import com.k2fsa.sherpa.onnx.OfflineFireRedAsrModelConfig;
import com.k2fsa.sherpa.onnx.OfflineFunAsrNanoModelConfig;
import com.k2fsa.sherpa.onnx.OfflineMedAsrCtcModelConfig;
import com.k2fsa.sherpa.onnx.OfflineModelConfig;
import com.k2fsa.sherpa.onnx.OfflineMoonshineModelConfig;
import com.k2fsa.sherpa.onnx.OfflineNemoEncDecCtcModelConfig;
import com.k2fsa.sherpa.onnx.OfflineOmnilingualAsrCtcModelConfig;
import com.k2fsa.sherpa.onnx.OfflineParaformerModelConfig;
import com.k2fsa.sherpa.onnx.OfflineQwen3AsrModelConfig;
import com.k2fsa.sherpa.onnx.OfflineRecognizer;
import com.k2fsa.sherpa.onnx.OfflineRecognizerConfig;
import com.k2fsa.sherpa.onnx.OfflineSenseVoiceModelConfig;
import com.k2fsa.sherpa.onnx.OfflineStream;
import com.k2fsa.sherpa.onnx.OfflineTransducerModelConfig;
import com.k2fsa.sherpa.onnx.OfflineWenetCtcModelConfig;
import com.k2fsa.sherpa.onnx.OfflineWhisperModelConfig;
import com.k2fsa.sherpa.onnx.OfflineZipformerCtcModelConfig;
import com.k2fsa.sherpa.onnx.QnnConfig;
import com.k2fsa.sherpa.onnx.SileroVadModelConfig;
import com.k2fsa.sherpa.onnx.SpeechSegment;
import com.k2fsa.sherpa.onnx.TenVadModelConfig;
import com.k2fsa.sherpa.onnx.Vad;
import com.k2fsa.sherpa.onnx.VadModelConfig;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * التعرّف القرآني المحلي (on-device) لشاشة «التلاوة» عبر sherpa-onnx.
 * - النموذج: tarteel-ai/whisper-(tiny|base)-ar-quran بصيغة sherpa-onnx int8
 *   (مرآة: huggingface.co/Synthesium/quran-whisper-sherpa-onnx).
 * - يُنزَّل لمرة واحدة داخل التطبيق إلى filesDir/asr/<kind>/ ويعمل بعدها بلا إنترنت.
 * - التقاط الصوت: AudioRecord 16kHz mono؛ تقطيع المقاطع: Silero VAD (مجمّع في الأصول)؛
 *   فك الترميز: Whisper دفعي لكل مقطع صوتي مع ذيل صمت 0.6 ثانية (يحسّن نهاية الكلمات).
 * النتائج تُرسل للصفحة عبر window.__rcAsr(type, sid, payload): ready / f (نص نهائي) / err.
 * وتقدّم التنزيل عبر window.__rcAsrDl(jsonString).
 */
public class SherpaAsr {
    public static volatile SherpaAsr cur;

    private static final String BASE_URL = "https://huggingface.co/Synthesium/quran-whisper-sherpa-onnx/resolve/main/";
    /** kind, encoder, decoder, tokens + أحجامها المتوقعة بالبايت للتحقق من اكتمال التنزيل */
    private static final String[][] MODELS = {
        {"base", "base-ar-quran-encoder.int8.onnx", "base-ar-quran-decoder.int8.onnx", "base-ar-quran-tokens.txt"},
        {"tiny", "tiny-ar-quran-encoder.int8.onnx", "tiny-ar-quran-decoder.int8.onnx", "tiny-ar-quran-tokens.txt"},
    };
    private static final long[][] SIZES = {
        {29104815L, 130659024L, 816730L},
        {12926479L, 89846458L, 816730L},
    };
    private static final int SAMPLE_RATE = 16000;
    /** ذيل صمت يُلحق بكل مقطع قبل فك الترميز؛ بدونه قد تسقط نهايات الكلمات */
    private static final int TAIL_PAD = (int) (SAMPLE_RATE * 0.6f);

    private final Activity act;
    private final Handler ui = new Handler(Looper.getMainLooper());

    private OfflineRecognizer rec;
    private String recKind = "";
    private Vad vad;
    private AudioRecord ar;
    private Thread capThread;
    private ExecutorService decPool;
    private volatile boolean running = false;
    private volatile int sid = 0;

    private volatile Thread dlThread;
    private volatile boolean dlCancel = false;
    private volatile String dlKind = null;
    private volatile int dlPct = 0;

    public SherpaAsr(Activity a) { act = a; cur = this; }

    public static void stopAll() {
        SherpaAsr s = cur;
        if (s != null) s.stop();
    }

    private File dirOf(String kind) { return new File(act.getFilesDir(), "asr/" + kind); }

    private static int idxOf(String kind) {
        for (int i = 0; i < MODELS.length; i++) if (MODELS[i][0].equals(kind)) return i;
        return -1;
    }

    private boolean installed(String kind) {
        int i = idxOf(kind);
        if (i < 0) return false;
        File d = dirOf(kind);
        for (int f = 1; f <= 3; f++) {
            File x = new File(d, MODELS[i][f]);
            if (!x.isFile() || x.length() != SIZES[i][f - 1]) return false;
        }
        return true;
    }

    /* ---------- الحالة والتنزيل ---------- */

    public synchronized String status() {
        try {
            JSONObject o = new JSONObject();
            for (String[] m : MODELS) {
                JSONObject k = new JSONObject();
                k.put("installed", installed(m[0]));
                long b = 0;
                File d = dirOf(m[0]);
                for (int f = 1; f <= 3; f++) { File x = new File(d, m[f]); if (x.isFile()) b += x.length(); }
                k.put("bytes", b);
                o.put(m[0], k);
            }
            if (dlKind != null) {
                JSONObject dl = new JSONObject();
                dl.put("kind", dlKind);
                dl.put("pct", dlPct);
                o.put("dl", dl);
            }
            o.put("active", recKind);
            return o.toString();
        } catch (Exception e) { return "{}"; }
    }

    public synchronized void download(String kind) {
        if (idxOf(kind) < 0 || dlThread != null) return;
        dlCancel = false;
        dlKind = kind;
        dlPct = 0;
        emitDl("start");
        dlThread = new Thread(() -> {
            String err = null;
            try {
                int i = idxOf(kind);
                File d = dirOf(kind);
                if (!d.isDirectory() && !d.mkdirs()) throw new Exception("dir");
                long total = SIZES[i][0] + SIZES[i][1] + SIZES[i][2], done = 0;
                byte[] buf = new byte[65536];
                long lastEmit = 0;
                for (int f = 1; f <= 3 && !dlCancel; f++) {
                    File dst = new File(d, MODELS[i][f]);
                    File part = new File(d, MODELS[i][f] + ".part");
                    long want = SIZES[i][f - 1];
                    HttpURLConnection c = open(BASE_URL + MODELS[i][f]);
                    try {
                        c.setConnectTimeout(20000);
                        c.setReadTimeout(30000);
                        if (c.getResponseCode() / 100 != 2) throw new Exception("http " + c.getResponseCode());
                        InputStream in = c.getInputStream();
                        OutputStream out = new FileOutputStream(part);
                        long got = 0;
                        int n;
                        while ((n = in.read(buf)) >= 0) {
                            if (dlCancel) break;
                            out.write(buf, 0, n);
                            got += n;
                            long now = System.currentTimeMillis();
                            if (now - lastEmit > 400) {
                                lastEmit = now;
                                dlPct = (int) Math.min(99, (done + got) * 100 / total);
                                emitDl("progress");
                            }
                        }
                        out.close();
                        in.close();
                        if (!dlCancel && got != want) throw new Exception("size");
                        if (dlCancel) { part.delete(); break; }
                        if (dst.exists()) dst.delete();
                        if (!part.renameTo(dst)) throw new Exception("rename");
                        done += got;
                    } finally {
                        c.disconnect();
                    }
                }
            } catch (Exception e) {
                err = e.getMessage() == null ? "network" : e.getMessage();
            }
            synchronized (SherpaAsr.this) {
                dlThread = null;
                String st = dlCancel ? "canceled" : (err != null ? "error" : "done");
                if (err == null && !dlCancel) dlPct = 100;
                dlKind = null;
                emitDl(st, err);
            }
        }, "asr-dl");
        dlThread.start();
    }

    private static HttpURLConnection open(String u) throws Exception {
        String cur = u;
        for (int i = 0; i < 6; i++) {
            HttpURLConnection c = (HttpURLConnection) new URL(cur).openConnection();
            c.setInstanceFollowRedirects(false);
            c.setConnectTimeout(20000);
            c.setReadTimeout(30000);
            int code = c.getResponseCode();
            if (code >= 300 && code < 400) {
                String loc = c.getHeaderField("Location");
                c.disconnect();
                if (loc == null) throw new Exception("redirect");
                cur = new URL(new URL(cur), loc).toString();
                continue;
            }
            return c;
        }
        throw new Exception("redirects");
    }

    public synchronized void cancelDownload() { dlCancel = true; }

    public synchronized void delete(String kind) {
        if (idxOf(kind) < 0) return;
        if (recKind.equals(kind)) { stop(); releaseRec(); }
        if (kind.equals(dlKind)) dlCancel = true;
        deleteRec(dirOf(kind));
    }

    private static void deleteRec(File f) {
        if (f == null || !f.exists()) return;
        if (f.isDirectory()) { File[] ch = f.listFiles(); if (ch != null) for (File x : ch) deleteRec(x); }
        f.delete();
    }

    private void emitDl(String state) { emitDl(state, null); }

    private void emitDl(String state, String err) {
        try {
            JSONObject o = new JSONObject();
            o.put("kind", dlKind);
            o.put("state", state);
            o.put("pct", dlPct);
            if (err != null) o.put("err", err);
            final String js = "window.__rcAsrDl&&window.__rcAsrDl(" + JSONObject.quote(o.toString()) + ")";
            ui.post(() -> { try { if (Speech.wv != null) Speech.wv.evaluateJavascript(js, null); } catch (Exception ignored) {} });
        } catch (Exception ignored) {}
    }

    /* ---------- التعرّف ---------- */

    private void emit(int s, String type, String data) {
        final String js = "window.__rcAsr&&window.__rcAsr(" + JSONObject.quote(type) + "," + s + "," + JSONObject.quote(data == null ? "" : data) + ")";
        ui.post(() -> { try { if (Speech.wv != null) Speech.wv.evaluateJavascript(js, null); } catch (Exception ignored) {} });
    }

    private void releaseRec() {
        try { if (rec != null) rec.release(); } catch (Exception ignored) {}
        rec = null;
        recKind = "";
    }

    private boolean ensureRec(String kind) {
        if (rec != null && recKind.equals(kind)) return true;
        releaseRec();
        int i = idxOf(kind);
        if (i < 0) return false;
        try {
            File d = dirOf(kind);
            OfflineWhisperModelConfig whisper = new OfflineWhisperModelConfig(
                new File(d, MODELS[i][1]).getAbsolutePath(),
                new File(d, MODELS[i][2]).getAbsolutePath(),
                "ar", "transcribe", -1, false, false, new QnnConfig());
            OfflineModelConfig mc = new OfflineModelConfig(
                new OfflineTransducerModelConfig(), new OfflineParaformerModelConfig(), whisper,
                new OfflineFireRedAsrModelConfig(), new OfflineMoonshineModelConfig(),
                new OfflineNemoEncDecCtcModelConfig(), new OfflineSenseVoiceModelConfig(),
                new OfflineDolphinModelConfig(), new OfflineZipformerCtcModelConfig(),
                new OfflineWenetCtcModelConfig(), new OfflineOmnilingualAsrCtcModelConfig(),
                new OfflineMedAsrCtcModelConfig(), new OfflineFunAsrNanoModelConfig(),
                new OfflineQwen3AsrModelConfig(), new OfflineFireRedAsrCtcModelConfig(),
                new OfflineCanaryModelConfig(), new OfflineCohereTranscribeModelConfig(),
                "", 4, false, "cpu", "",
                new File(d, MODELS[i][3]).getAbsolutePath(), "", "");
            OfflineRecognizerConfig cfg = new OfflineRecognizerConfig(
                new FeatureConfig(), mc, new HomophoneReplacerConfig(),
                "greedy_search", 4, "", 1.5f, "", "", 0f, new OfflineCtcFstDecoderConfig());
            rec = new OfflineRecognizer(null, cfg);
            recKind = kind;
            return true;
        } catch (Throwable t) {
            releaseRec();
            return false;
        }
    }

    private Vad ensureVad() throws Exception {
        if (vad != null) return vad;
        File dst = new File(act.getFilesDir(), "asr/silero_vad.onnx");
        if (!dst.isFile() || dst.length() == 0) {
            File parent = dst.getParentFile();
            if (parent != null && !parent.isDirectory()) parent.mkdirs();
            InputStream in = act.getAssets().open("asr/silero_vad.onnx");
            OutputStream out = new FileOutputStream(dst);
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) >= 0) out.write(buf, 0, n);
            out.close();
            in.close();
        }
        /* maxSpeechDuration = 8 ثوانٍ: تقسيم إجباري للمقاطع الطويلة حتى تظهر
           الكلمات المتعرف عليها تدريجيًا أثناء التلاوة بدل انتظار نهاية الآية الطويلة. */
        SileroVadModelConfig silero = new SileroVadModelConfig(
            dst.getAbsolutePath(), 0.5f, 0.7f, 0.25f, 512, 8f);
        VadModelConfig vc = new VadModelConfig(silero, new TenVadModelConfig(), SAMPLE_RATE, 1, "cpu", false);
        vad = new Vad(null, vc);
        return vad;
    }

    public synchronized void start(final String kind) {
        if (running) return;
        final int mySid = ++sid;
        if (idxOf(kind) < 0 || !installed(kind)) { emit(mySid, "err", "nomodel"); return; }
        if (act.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            emit(mySid, "err", "9");
            return;
        }
        running = true; // منع البدء المزدوج أثناء التحميل
        emit(mySid, "loading", kind);
        /* تحميل النموذج قد يأخذ ثواني طويلة على الأجهزة الضعيفة، فلا نحجب خيط الجسر:
           التحميل في الخلفية، و«ready» يصل الصفحة عندما يبدأ الميكروفون فعلًا. */
        new Thread(() -> {
            if (!ensureRec(kind)) { running = false; emit(mySid, "err", "load"); return; }
            try { ensureVad(); } catch (Throwable t) { running = false; emit(mySid, "err", "vad"); return; }
            synchronized (SherpaAsr.this) {
                if (!running || mySid != sid) return; // أُوقف أثناء التحميل
                startCapture(mySid);
            }
        }, "asr-load").start();
    }

    private void startCapture(final int mySid) {
        int minBuf = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
        final AudioRecord rec0;
        try {
            rec0 = new AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, Math.max(minBuf, SAMPLE_RATE * 2));
            if (rec0.getState() != AudioRecord.STATE_INITIALIZED) { rec0.release(); running = false; emit(mySid, "err", "mic"); return; }
        } catch (Throwable t) { running = false; emit(mySid, "err", "mic"); return; }
        ar = rec0;
        if (decPool == null || decPool.isShutdown()) decPool = Executors.newSingleThreadExecutor();
        running = true;
        capThread = new Thread(() -> {
            try {
                try { rec0.startRecording(); } catch (Throwable t) { running = false; emit(mySid, "err", "mic"); return; }
                emit(mySid, "ready", recKind);
                short[] buf = new short[512];
                float[] fbuf = new float[512];
                while (running) {
                    int n = rec0.read(buf, 0, buf.length);
                    if (n <= 0) continue;
                    for (int i = 0; i < n; i++) fbuf[i] = buf[i] / 32768.0f;
                    float[] chunk = (n == fbuf.length) ? fbuf.clone() : java.util.Arrays.copyOf(fbuf, n);
                    vad.acceptWaveform(chunk);
                    drainVad(mySid);
                }
                vad.flush();
                drainVad(mySid);
            } catch (Throwable t) {
                if (running) { running = false; emit(mySid, "err", "cap"); }
            } finally {
                try { rec0.stop(); } catch (Throwable ignored) {}
                try { rec0.release(); } catch (Throwable ignored) {}
            }
        }, "asr-cap");
        capThread.start();
    }

    /** تسخين مسبق: تحميل النموذج في الخلفية دون بدء الميكروفون (مثلًا بعد فتح شاشة التلاوة). */
    public synchronized void warmup(String kind) {
        if (running || (rec != null && recKind.equals(kind))) return;
        if (idxOf(kind) < 0 || !installed(kind)) return;
        new Thread(() -> ensureRec(kind), "asr-warm").start();
    }

    private void drainVad(int mySid) {
        try {
            while (!vad.empty()) {
                SpeechSegment seg = vad.front();
                vad.pop();
                float[] s = seg.getSamples();
                if (s == null || s.length < SAMPLE_RATE / 5) continue; // تجاهل ما دون 0.2 ثانية
                if (s.length > SAMPLE_RATE * 28) s = java.util.Arrays.copyOf(s, SAMPLE_RATE * 28);
                final float[] seg2 = s;
                final ExecutorService pool = decPool;
                if (pool == null || pool.isShutdown()) continue;
                pool.execute(() -> {
                    try {
                        OfflineRecognizer r = rec;
                        if (r == null) return;
                        float[] padded = java.util.Arrays.copyOf(seg2, seg2.length + TAIL_PAD);
                        OfflineStream st = r.createStream();
                        try {
                            st.acceptWaveform(padded, SAMPLE_RATE);
                            r.decode(st);
                            String text = r.getResult(st).getText();
                            if (running && text != null && !text.trim().isEmpty()) emit(mySid, "f", text.trim());
                        } finally {
                            try { st.release(); } catch (Throwable ignored) {}
                        }
                    } catch (Throwable ignored) {}
                });
            }
        } catch (Throwable ignored) {}
    }

    public synchronized void stop() {
        running = false;
        sid++;
        AudioRecord a = ar;
        ar = null;
        if (a != null) { try { a.stop(); } catch (Throwable ignored) {} }
        Thread t = capThread;
        if (t != null) { try { t.join(1500); } catch (InterruptedException ignored) {} capThread = null; }
        if (vad != null) { try { vad.reset(); } catch (Throwable ignored) {} }
    }
}
