package com.ahmedalajmi.alsaer;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.webkit.WebView;

import org.json.JSONObject;

import java.util.ArrayList;

/**
 * التعرّف الصوتي الأصلي لأندرويد (خدمة Google) لشاشة «التلاوة».
 * يُرسل النتائج للصفحة عبر window.__rcNat(type, text): p = جزئية، f = نهائية، err = خطأ (رمز الخطأ).
 */
public class Speech implements RecognitionListener {
    public static WebView wv;
    private final Activity act;
    private final Handler h = new Handler(Looper.getMainLooper());
    private SpeechRecognizer sr;
    private Intent it;
    private boolean on = false;
    private int idle = 0;
    private boolean gotAny = false;

    public static Speech cur;
    private boolean muted = false;
    private boolean muteBeep = true;
    private boolean onDevice = false, usedOnDev = false;
    public void setOnDevice(boolean b) { onDevice = b; }
    private int savedMusic = -1;

    public Speech(Activity a) { act = a; cur = this; }

    public void setMuteBeep(boolean b) { muteBeep = b; if (!b) unmuteNow(); }

    private static final int[] STR = { AudioManager.STREAM_MUSIC, AudioManager.STREAM_SYSTEM, AudioManager.STREAM_NOTIFICATION };

    /** وضع صامت لجلسة التلاوة: يكتم الوسائط والنظام والإشعارات (لا المنبّه ولا الرنين) كي لا يُسمع «بيب» خدمة Google، ويُعاد الصوت عند الخروج. */
    public void silent(boolean on) { if (on) silentOn(); else { muted = true; silentOff(); } }

    /** أُلغي كتم الصوت نهائيًا (كان يسبب مشاكل): لا نغيّر أي مستوى صوت في الهاتف. */
    private void silentOn() {
        if (true) return;
        if (!muteBeep || muted) return;
        try {
            AudioManager am = (AudioManager) act.getSystemService(Context.AUDIO_SERVICE);
            StringBuilder sb = new StringBuilder();
            boolean any = false;
            for (int i = 0; i < STR.length; i++) { int v = 0; try { v = am.getStreamVolume(STR[i]); } catch (Exception ignored) {} sb.append(i > 0 ? "," : "").append(v); if (v > 0) any = true; }
            if (!any) { muted = true; return; }
            act.getSharedPreferences("alsaer_speech", 0).edit().putString("vol", sb.toString()).apply();
            for (int i = 0; i < STR.length; i++) { try { am.setStreamVolume(STR[i], 0, 0); } catch (Exception ignored) {} }
            muted = true;
        } catch (Exception ignored) {}
    }

    private void silentOff() {
        if (!muted) return;
        muted = false;
        restore(act);
    }

    private boolean beepOn = false;
    private final Runnable unmuteRun = () -> unmuteNow();
    /** كتم لحظي (٣٠٠–٢٥٠٠ مللي ثانية) لقنوات الصوت الخارجة فقط حول بدء/نهاية الاستماع كي لا يُسمع «بيب» Google.
     *  هو كتم مؤقت (ADJUST_MUTE) لا يغيّر مستوى الصوت المحفوظ، ويُلغى تلقائيًا بمؤقّت وعند الإيقاف والخروج. */
    private void beepMute(long ms) {
        if (!muteBeep) return;
        try {
            AudioManager am = (AudioManager) act.getSystemService(Context.AUDIO_SERVICE);
            if (!beepOn) { for (int i = 0; i < STR.length; i++) { try { am.adjustStreamVolume(STR[i], AudioManager.ADJUST_MUTE, 0); } catch (Exception ignored) {} } beepOn = true; }
            h.removeCallbacks(unmuteRun); h.postDelayed(unmuteRun, ms);
        } catch (Exception ignored) {}
    }
    private void unmuteNow() {
        h.removeCallbacks(unmuteRun);
        if (!beepOn) return;
        beepOn = false;
        try {
            AudioManager am = (AudioManager) act.getSystemService(Context.AUDIO_SERVICE);
            for (int i = 0; i < STR.length; i++) { try { am.adjustStreamVolume(STR[i], AudioManager.ADJUST_UNMUTE, 0); } catch (Exception ignored) {} }
        } catch (Exception ignored) {}
    }
    private void muteMusic() { }
    /** إيقاف الاستماع لا يُنهي الوضع الصامت؛ يُنهيه الخروج من الشاشة فقط. */
    private void unmuteMusic() { unmuteNow(); }

    /** يوقف أي استماع جارٍ (عند خروج التطبيق من الواجهة) ويُعلم الصفحة. */
    public static void stopAll() {
        final Speech c = cur;
        if (c == null) return;
        c.act.runOnUiThread(() -> {
            boolean was = c.on;
            c.on = false; c.h.removeCallbacksAndMessages(null); c.destroy(); c.unmuteNow(); c.silentOff();
            if (was) c.js("stopped", "");
            try { if (wv != null) wv.evaluateJavascript("window.__rcLeave&&window.__rcLeave()", null); } catch (Exception ignored) {}
        });
    }

    /** يعيد الصوت لو بقي مكتومًا من النسخة 10101 (كانت تكتمه أثناء الاستماع). لا يكتم شيئًا بعد الآن. */
    public static void restore(Activity a) {
        try {
            SharedPreferences sp = a.getSharedPreferences("alsaer_speech", 0);
            int mv = sp.getInt("mv", -1);
            if (mv > 0) { try { ((AudioManager) a.getSystemService(Context.AUDIO_SERVICE)).setStreamVolume(AudioManager.STREAM_MUSIC, mv, 0); } catch (Exception ignored) {} sp.edit().remove("mv").apply(); }
            String v = sp.getString("vol", null);
            if (v == null) return;
            String[] p = v.split(",");
            AudioManager am = (AudioManager) a.getSystemService(Context.AUDIO_SERVICE);
            int[] st = { AudioManager.STREAM_MUSIC, AudioManager.STREAM_SYSTEM, AudioManager.STREAM_NOTIFICATION };
            for (int i = 0; i < st.length && i < p.length; i++) {
                int x = Integer.parseInt(p[i].trim());
                if (x > 0) { try { am.setStreamVolume(st[i], x, 0); } catch (Exception ignored) {} }
            }
            sp.edit().remove("vol").apply();
        } catch (Exception ignored) {}
    }

    /** Android 11+ يخفي الحزم بلا <queries> فلا نعتمد على isRecognitionAvailable، بل على وجود خدمة معرّفة في النظام. */
    public boolean available() {
        try {
            String s = Settings.Secure.getString(act.getContentResolver(), "voice_recognition_service");
            if (s != null && !s.isEmpty()) return true;
        } catch (Exception ignored) {}
        try { return SpeechRecognizer.isRecognitionAvailable(act); } catch (Exception e) { return false; }
    }

    private ArrayList<String> bias = new ArrayList<String>();

    /** تلميحات بالكلمات المتوقعة (JSON array) تُستخدم عند بدء/إعادة الاستماع. */
    public void setBias(String json) {
        ArrayList<String> l = new ArrayList<String>();
        try { org.json.JSONArray a = new org.json.JSONArray(json); for (int i = 0; i < a.length() && i < 40; i++) l.add(a.getString(i)); } catch (Exception ignored) {}
        bias = l;
        if (it != null && !l.isEmpty()) it.putStringArrayListExtra("android.speech.extra.BIASING_STRINGS", l);
    }

    public void start(final String biasJson) {
        setBias(biasJson);
        act.runOnUiThread(() -> {
            if (on) return;
            on = true; idle = 0; gotAny = false;
            muteMusic();
            try {
                destroy();
                usedOnDev = false;
                if (onDevice && android.os.Build.VERSION.SDK_INT >= 33 && SpeechRecognizer.isOnDeviceRecognitionAvailable(act)) { sr = SpeechRecognizer.createOnDeviceSpeechRecognizer(act); usedOnDev = true; }
                else sr = SpeechRecognizer.createSpeechRecognizer(act);
                sr.setRecognitionListener(this);
                it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-SA");
                it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ar-SA");
                it.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                it.putExtra("android.speech.extra.MASK_OFFENSIVE_WORDS", false); // لا يُخفي Google كلمات قد تظهر في القرآن
                it.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                if (!bias.isEmpty()) it.putStringArrayListExtra("android.speech.extra.BIASING_STRINGS", bias);
                it.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, act.getPackageName());
                // صمت أطول قبل اعتبار الجملة منتهية = إعادة استماع أقل وكلمات أقل ضياعًا
                it.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 12000L);
                it.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 12000L);
                it.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 20000L);
                beepMute(2500);
                sr.startListening(it);
            } catch (Exception e) {
                on = false; unmuteNow();
                js("err", "start:" + e.getClass().getSimpleName());
            }
        });
    }

    public void stop() {
        act.runOnUiThread(() -> { on = false; h.removeCallbacksAndMessages(null); destroy(); unmuteNow(); });
    }

    private void destroy() {
        unmuteNow();
        if (sr != null) {
            try { sr.cancel(); } catch (Exception ignored) {}
            try { sr.destroy(); } catch (Exception ignored) {}
            sr = null;
        }
    }

    private void again(long delay, final boolean cancelFirst) {
        h.postDelayed(() -> {
            if (!on || sr == null) return;
            try { if (cancelFirst) sr.cancel(); beepMute(2000); sr.startListening(it); }
            catch (Exception e) { on = false; unmuteMusic(); js("err", "restart:" + e.getClass().getSimpleName()); }
        }, delay);
    }

    private void js(String type, String data) {
        final WebView w = wv;
        if (w == null) return;
        final String q = JSONObject.quote(data == null ? "" : data);
        final String t = type;
        w.post(() -> w.evaluateJavascript("window.__rcNat&&window.__rcNat('" + t + "'," + q + ")", null));
    }

    /** كل البدائل (حتى ٥) كمصفوفة JSON؛ الأفضل أولًا. */
    private String first(Bundle b) {
        if (b == null) return "";
        ArrayList<String> l = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (l == null || l.isEmpty()) return "";
        org.json.JSONArray a = new org.json.JSONArray();
        for (String x : l) { if (x != null && !x.trim().isEmpty()) a.put(x); }
        return a.toString();
    }

    @Override public void onPartialResults(Bundle b) { String s = first(b); if (!s.isEmpty()) { gotAny = true; idle = 0; js("p", s); } }
    @Override public void onResults(Bundle b) {
        String s = first(b);
        if (!s.isEmpty()) { gotAny = true; idle = 0; }
        js("f", s);
        if (on) again(0, false);
    }
    @Override public void onError(int e) {
        if (!on) return;
        // 7 لا تطابق · 6 صمت طويل: عادي، نعيد الاستماع. 8 مشغول: ننتظر قليلًا.
        if (e == 7 || e == 6) {
            js("f", "");
            if (++idle > 14) { on = false; unmuteMusic(); js("err", "idle"); return; }
            again(0, false);
        } else if (e == 8) { again(500, true); }
        else if (usedOnDev && (e == 12 || e == 13 || e == 5 || e == 2 || e == 4 || e == 11)) { onDevice = false; usedOnDev = false; destroy(); try { sr = SpeechRecognizer.createSpeechRecognizer(act); sr.setRecognitionListener(this); again(300, false); } catch (Exception ex) { on = false; js("err", "early:5"); } }
        else {
            on = false; unmuteMusic();
            js("err", (gotAny ? "late:" : "early:") + e);
        }
    }
    @Override public void onReadyForSpeech(Bundle b) { js("ready", ""); h.removeCallbacks(unmuteRun); h.postDelayed(unmuteRun, 400); }
    @Override public void onBeginningOfSpeech() {}
    @Override public void onRmsChanged(float v) {}
    @Override public void onBufferReceived(byte[] bytes) {}
    @Override public void onEndOfSpeech() { beepMute(900); }
    @Override public void onEvent(int i, Bundle b) {}
}
