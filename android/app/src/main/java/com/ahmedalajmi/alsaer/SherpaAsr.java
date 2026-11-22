package com.ahmedalajmi.alsaer;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;

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
    /** قفل دورة حياة المتعرّف: يمنع تحميلين متزامنين (تسخين + بدء) يستهلكان ضعف الذاكرة ويسببان تعليقًا/نفاد ذاكرة */
    private final Object recLock = new Object();

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
        ui.post(() -> { try { if (Speech.wv != null) Speech.wv.evaluateJavascript(js, null); } catch (Exception ignored) { diag("فشل إيصال حدث للصفحة (wv)"); } });
    }

    /* سجل تشخيصي دائري: يساعد على فهم أي مشكلة تسميع من الجهاز نفسه دون حاسوب */
    private static final java.util.ArrayDeque<String> DIAG = new java.util.ArrayDeque<>();
    private static synchronized void diag(String m) {
        String line = new java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US).format(new java.util.Date()) + " " + m;
        while (DIAG.size() >= 60) DIAG.pollFirst();
        DIAG.add(line);
        android.util.Log.d("AlsaerAsr", m);
    }
    public static synchronized String diagDump() {
        StringBuilder b = new StringBuilder();
        for (String x : DIAG) b.append(x).append('\n');
        return b.toString();
    }

    /* تراكم مقاطع للتقسيم المبكر عند الوقفات الطبيعية */
    private final java.util.ArrayList<float[]> segAcc = new java.util.ArrayList<>();
    private int segAccLen = 0;
    private float segPeak = 0f;
    private boolean decErrSent = false;

    private void releaseRec() {
        try { if (rec != null) rec.release(); } catch (Exception ignored) {}
        rec = null;
        recKind = "";
    }

    private boolean ensureRec(String kind) {
        synchronized (recLock) {
            return ensureRecLocked(kind);
        }
    }

    private boolean ensureRecLocked(String kind) {
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
            try { /* تسخين أول فك تشفير بصمت قصير تُرمى نتيجته: بدونه يتحمّل أول مقطع حقيقي تكلفة التهيئة الباردة (قد تتجاوز زمن المقطع نفسه) */
                float[] warm = new float[SAMPLE_RATE / 4];
                OfflineStream ws = rec.createStream();
                try { ws.acceptWaveform(warm, SAMPLE_RATE); rec.decode(ws); } finally { try { ws.release(); } catch (Throwable ignored) {} }
            } catch (Throwable ignored) {}
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
        /* minSilence = 0.35 ثانية: مقاطع بطول نَفَس التلاوة (٢-٨ ثوانٍ) فتُفكّ شبه لحظيًا وتظهر الكلمات
           تدريجيًا. كانت 0.7 ثانية فتبتلع وقفات الآيات، فيمتد المقطع حتى الحد الأقصى ويتكدّس فك التشفير
           ثم تضيع المقاطع المنتظرة عند الإيقاف. maxSpeech = 12 ثانية احتياط فقط. */
        SileroVadModelConfig silero = new SileroVadModelConfig(
            dst.getAbsolutePath(), 0.5f, 0.35f, 0.25f, 512, 12f);
        VadModelConfig vc = new VadModelConfig(silero, new TenVadModelConfig(), SAMPLE_RATE, 1, "cpu", false);
        vad = new Vad(null, vc);
        return vad;
    }

    public synchronized void start(final String kind, int jsid) {
        if (running) return;
        /* رقم الجلسة تأخذه الصفحة (مالكة العدّاد) حتى لا ينفصل العدّادان؛
           stop() لا تزيده، وإلا ضاعت كل الأحداث بعد أول دورة بدء/إيقاف */
        final int mySid = (sid = jsid);
        if (idxOf(kind) < 0 || !installed(kind)) { emit(mySid, "err", "nomodel"); return; }
        if (act.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            emit(mySid, "err", "9");
            return;
        }
        running = true; // منع البدء المزدوج أثناء التحميل
        decErrSent = false;
        diag("بدء الاستماع: " + kind);
        emit(mySid, "loading", kind);
        /* تحميل النموذج قد يأخذ ثواني طويلة على الأجهزة الضعيفة، فلا نحجب خيط الجسر:
           التحميل في الخلفية، و«ready» يصل الصفحة عندما يبدأ الميكروفون فعلًا. */
        new Thread(() -> {
            /* نبضة «loading» كل ١٥ ثانية أثناء التحميل: تُعلم الصفحة أن التحميل يتقدم فلا يسقط مراقبها لجوجل */
            final java.util.concurrent.atomic.AtomicBoolean loaded = new java.util.concurrent.atomic.AtomicBoolean(false);
            Thread hb = new Thread(() -> {
                try {
                    while (!loaded.get()) {
                        Thread.sleep(15000);
                        if (!loaded.get()) emit(mySid, "loading", kind);
                    }
                } catch (InterruptedException ignored) {}
            }, "asr-hb");
            hb.setDaemon(true);
            hb.start();
            long ld0 = SystemClock.elapsedRealtime();
            boolean ok = ensureRec(kind);
            diag(ok ? ("تحميل النموذج " + kind + " في " + (SystemClock.elapsedRealtime() - ld0) + "ms") : ("فشل تحميل النموذج " + kind));
            loaded.set(true);
            hb.interrupt();
            if (!ok) { running = false; emit(mySid, "err", "load"); return; }
            try { ensureVad(); } catch (Throwable t) { running = false; emit(mySid, "err", "vad"); return; }
            synchronized (SherpaAsr.this) {
                if (!running || mySid != sid) return; // أُوقف أثناء التحميل
                startCapture(mySid);
            }
        }, "asr-load").start();
    }

    private void startCapture(final int mySid) {
        int minBuf = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
        /* خام أولًا (بلا معالجة DSP تُشوّه خصائص whisper)، ثم MIC، ثم VOICE_RECOGNITION احتياطًا */
        final AudioRecord rec0;
        AudioRecord cand = null; int usedSrc = -1;
        int[] srcs = {MediaRecorder.AudioSource.UNPROCESSED, MediaRecorder.AudioSource.MIC, MediaRecorder.AudioSource.VOICE_RECOGNITION};
        for (int s0 : srcs) {
            try {
                AudioRecord c = new AudioRecord(s0, SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, Math.max(minBuf, SAMPLE_RATE * 2));
                if (c.getState() == AudioRecord.STATE_INITIALIZED) { cand = c; usedSrc = s0; break; }
                c.release();
            } catch (Throwable ignored) {}
        }
        if (cand == null) { running = false; emit(mySid, "err", "mic"); return; }
        rec0 = cand;
        diag("مصدر الصوت: " + (usedSrc == MediaRecorder.AudioSource.UNPROCESSED ? "خام" : usedSrc == MediaRecorder.AudioSource.MIC ? "MIC" : "VOICE_RECOGNITION") + " @" + rec0.getSampleRate() + "Hz");
        ar = rec0;
        if (decPool == null || decPool.isShutdown()) decPool = Executors.newSingleThreadExecutor();
        running = true;
        capThread = new Thread(() -> {
            try {
                try { rec0.startRecording(); } catch (Throwable t) { running = false; emit(mySid, "err", "mic"); return; }
                emit(mySid, "ready", recKind);
                short[] buf = new short[512];
                float[] fbuf = new float[512];
                int readErr = 0;
                while (running) {
                    int n = rec0.read(buf, 0, buf.length);
                    if (n <= 0) { /* خطأ قراءة: تراجع قصير بدل الدوران الساخن */
                        if (++readErr > 100) { running = false; emit(mySid, "err", "cap"); diag("تكرار خطأ قراءة الميكروفون"); break; }
                        try { Thread.sleep(20); } catch (InterruptedException ignored) {}
                        continue;
                    }
                    readErr = 0;
                    for (int i = 0; i < n; i++) fbuf[i] = buf[i] / 32768.0f;
                    float[] chunk = (n == fbuf.length) ? fbuf.clone() : java.util.Arrays.copyOf(fbuf, n);
                    vad.acceptWaveform(chunk);
                    drainVad(mySid);
                    /* تقسيم مبكر عند وقفة طبيعية: بعد ٨ ثوانٍ من الصوت، إن كان آخر ٠٫٣٥ ثانية
                       هادئًا (أقل من ٨٪ من ذروة المقطع) نفك تشفير ما تراكم ونبدأ مقطعًا جديدًا،
                       فتظهر الكلمات تدريجيًا دون قطع الكلمات في منتصفها. */
                    segAcc.add(chunk); segAccLen += n;
                    for (int i = 0; i < n; i++) { float a = chunk[i] < 0 ? -chunk[i] : chunk[i]; if (a > segPeak) segPeak = a; }
                    /* حد أقصى للتراكم: صمت طويل بلا مقطع VAD مكتمل كان ينمّي الذاكرة بلا حد.
                       صمت خالص → امسح؛ وإلا احتفظ بآخر ١٢ ثانية فقط. */
                    if (segAccLen > SAMPLE_RATE * 24) {
                        if (segPeak <= 0.02f) { segAcc.clear(); segAccLen = 0; segPeak = 0f; }
                        else {
                            while (segAccLen > SAMPLE_RATE * 12 && !segAcc.isEmpty()) { segAccLen -= segAcc.get(0).length; segAcc.remove(0); }
                            segPeak = 0f; for (float[] c : segAcc) for (float v : c) { float a = v < 0 ? -v : v; if (a > segPeak) segPeak = a; }
                        }
                    }
                    if (segAccLen >= SAMPLE_RATE * 8 && segPeak > 0.02f) {
                        int tailN = (int) (SAMPLE_RATE * 0.35f);
                        double sum = 0; int cnt = 0;
                        for (int k = segAcc.size() - 1; k >= 0 && cnt < tailN; k--) {
                            float[] c = segAcc.get(k);
                            for (int i = c.length - 1; i >= 0 && cnt < tailN; i--, cnt++) sum += c[i] * c[i];
                        }
                        double tailRms = Math.sqrt(sum / Math.max(1, cnt));
                        if (tailRms < segPeak * 0.08) {
                            float[] early = new float[segAccLen];
                            int off = 0;
                            for (float[] c : segAcc) { System.arraycopy(c, 0, early, off, c.length); off += c.length; }
                            segAcc.clear(); segAccLen = 0; segPeak = 0f;
                            try { vad.reset(); } catch (Throwable ignored) {}
                            diag("تقسيم مبكر عند وقفة: " + (early.length / SAMPLE_RATE) + "s");
                            submitDecode(mySid, early);
                        }
                    }
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
        new Thread(() -> {
            /* لو بدأت جلسة استماع فعلًا لا نسخّن: start ستحمّل عبر نفس القفل */
            if (!running) ensureRec(kind);
        }, "asr-warm").start();
    }

    private void drainVad(int mySid) {
        try {
            while (!vad.empty()) {
                SpeechSegment seg = vad.front();
                vad.pop();
                /* مقطع VAD المكتمل يغطي كل ما تراكم لدينا */
                segAcc.clear(); segAccLen = 0; segPeak = 0f;
                float[] s = seg.getSamples();
                if (s == null || s.length < SAMPLE_RATE * 7 / 20) continue; // تجاهل ما دون 0.35 ثانية (حماية من هلوسة الضجيج)
                if (s.length > SAMPLE_RATE * 28) s = java.util.Arrays.copyOf(s, SAMPLE_RATE * 28);
                submitDecode(mySid, s);
            }
        } catch (Throwable t) { diag("خطأ قراءة مقاطع VAD: " + t); }
    }

    private void submitDecode(final int mySid, final float[] seg2) {
        final ExecutorService pool = decPool;
        if (pool == null || pool.isShutdown()) return;
        pool.execute(() -> {
            long d0 = SystemClock.elapsedRealtime();
            try {
                String text;
                synchronized (recLock) { /* منع تحرير النموذج أثناء فك التشفير */
                    OfflineRecognizer r = rec;
                    if (r == null) return;
                    float[] padded = java.util.Arrays.copyOf(seg2, seg2.length + TAIL_PAD);
                    OfflineStream st = r.createStream();
                    try {
                        st.setOption("max_tokens_per_second", "30"); /* العربية المشكولة ~٦-٨ توكن للكلمة؛ الافتراضي ٦ يقتطع الكلام */
                        st.acceptWaveform(padded, SAMPLE_RATE);
                        r.decode(st);
                        text = r.getResult(st).getText();
                    } finally {
                        try { st.release(); } catch (Throwable ignored) {}
                    }
                }
                double ss = 0; for (float v : seg2) ss += (double) v * v;
                diag("فك تشفير مقطع " + String.format(java.util.Locale.US, "%.1f", seg2.length / (float) SAMPLE_RATE) + "s في " + (SystemClock.elapsedRealtime() - d0) + "ms rms=" + String.format(java.util.Locale.US, "%.4f", Math.sqrt(ss / Math.max(1, seg2.length))));
                if (text != null && !text.trim().isEmpty()) {
                    String tt = text.trim();
                    diag("سمع: «" + (tt.length() > 80 ? tt.substring(0, 80) + "…" : tt) + "»");
                    /* الإيصال بهوية الجلسة لا بعلم التشغيل: بعد الإيقاف تُستكمل المقاطع المنتظرة (تصريف رقيق)
                       حتى لا تضيع آخر التلاوة؛ الصفحة تتجاهل ما ليس من جلستها الحالية */
                    if (sid == mySid) emit(mySid, "f", tt);
                }
            } catch (Throwable t) { /* كان يُبتلع بصمت: سجّله وأعلم الصفحة مرة واحدة */
                diag("فشل فك التشفير: " + t);
                if (!decErrSent) { decErrSent = true; emit(mySid, "err", "dec"); }
            }
        });
    }

    /** اختبار ذاتي: يفك مقطع فاتحة معروفًا مضمّنًا في الأصول عبر نفس مسار فك التشفير (بلا ميكروفون).
       النص الصحيح «الحمد لله رب العالمين»: نص صحيح = العطل في التقاط الميكروفون؛ نص مشوّه = العطل في المحرك على الجهاز. */
    public synchronized void selfTest(final String kind) {
        if (idxOf(kind) < 0 || !installed(kind)) { diag("اختبار ذاتي: النموذج " + kind + " غير منزّل"); return; }
        if (running) { diag("اختبار ذاتي: أوقف الاستماع أولًا ثم أعد المحاولة"); return; }
        new Thread(() -> {
            try {
                byte[] raw;
                try (InputStream in = act.getAssets().open("asr/selftest.wav");
                     java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream()) {
                    byte[] b = new byte[8192]; int n;
                    while ((n = in.read(b)) >= 0) bos.write(b, 0, n);
                    raw = bos.toByteArray();
                }
                int off = 12, dataOff = -1; long dataLen = 0;
                while (off + 8 <= raw.length) {
                    long ck = (raw[off] & 0xffL) | ((raw[off + 1] & 0xffL) << 8) | ((raw[off + 2] & 0xffL) << 16) | ((raw[off + 3] & 0xffL) << 24);
                    long sz = (raw[off + 4] & 0xffL) | ((raw[off + 5] & 0xffL) << 8) | ((raw[off + 6] & 0xffL) << 16) | ((raw[off + 7] & 0xffL) << 24);
                    if (ck == 0x61746164L) { dataOff = off + 8; dataLen = sz; break; }
                    off += 8 + (int) ((sz + 1) & ~1L);
                }
                if (dataOff < 0) { diag("اختبار ذاتي: تعذّر قراءة مقطع الاختبار"); return; }
                final int cnt = (int) Math.min(dataLen, raw.length - dataOff) / 2;
                final float[] pcm = new float[cnt];
                double s2 = 0;
                for (int i = 0; i < cnt; i++) {
                    short v = (short) ((raw[dataOff + 2 * i] & 0xff) | (raw[dataOff + 2 * i + 1] << 8));
                    pcm[i] = v / 32768.0f; s2 += (double) pcm[i] * pcm[i];
                }
                diag("اختبار ذاتي: مقطع " + String.format(java.util.Locale.US, "%.1f", cnt / (float) SAMPLE_RATE) + "s rms=" + String.format(java.util.Locale.US, "%.4f", Math.sqrt(s2 / Math.max(1, cnt))) + " — المتوقع «الحمد لله رب العالمين»");
                if (!ensureRec(kind)) { diag("اختبار ذاتي: فشل تحميل النموذج " + kind); return; }
                long d0 = SystemClock.elapsedRealtime();
                String text;
                synchronized (recLock) {
                    OfflineRecognizer r = rec;
                    if (r == null) { diag("اختبار ذاتي: لا نموذج محمّل"); return; }
                    float[] padded = java.util.Arrays.copyOf(pcm, cnt + TAIL_PAD);
                    OfflineStream st = r.createStream();
                    try {
                        st.setOption("max_tokens_per_second", "30");
                        st.acceptWaveform(padded, SAMPLE_RATE);
                        r.decode(st);
                        text = r.getResult(st).getText();
                    } finally { try { st.release(); } catch (Throwable ignored) {} }
                }
                diag("اختبار ذاتي (" + kind + ") في " + (SystemClock.elapsedRealtime() - d0) + "ms: «" + (text == null ? "" : text.trim()) + "»");
            } catch (Throwable t) { diag("اختبار ذاتي: فشل — " + t); }
        }, "asr-selftest").start();
    }

    public synchronized void stop() {
        boolean wasActive = running || ar != null || capThread != null;
        running = false;
        AudioRecord a = ar;
        ar = null;
        if (a != null) { try { a.stop(); } catch (Throwable ignored) {} }
        Thread t = capThread;
        if (t != null) { try { t.join(1500); } catch (InterruptedException ignored) {} capThread = null; }
        if (vad != null) { try { vad.reset(); } catch (Throwable ignored) {} }
        segAcc.clear(); segAccLen = 0; segPeak = 0f;
        /* تصريف رقيق في الخلفية: المقاطع المنتظرة تُفكّ وتُرسَل للصفحة (تُدمج في النتيجة المعروضة)
           بدل إعدامها — كان shutdownNow الفوري يضيّع معظم التلاوة عندما يتأخر فك التشفير عن الإيقاف.
           لا حجب لخيط الاستدعاء: stop() تُستدعى أيضًا من دورة حياة النشاط على الخيط الرئيسي. */
        final ExecutorService dp = decPool; decPool = null;
        final int fsid = sid;
        if (dp != null) new Thread(() -> {
            dp.shutdown();
            try { dp.awaitTermination(15, java.util.concurrent.TimeUnit.SECONDS); } catch (InterruptedException ignored) {}
            dp.shutdownNow();
            /* خاتمة التصريف: الصفحة تُغلق مستمع الجلسة بعد وصول آخر نص مُفكوك */
            if (sid == fsid) emit(fsid, "fin", "");
        }).start();
        /* السجل للتشخيص: لا نسجّل إيقافًا صوريًا (إيقاف مزدوج أو إيقاف دورة حياة النشاط بعد توقف فعلي) */
        if (wasActive) diag("إيقاف الاستماع");
    }
}
