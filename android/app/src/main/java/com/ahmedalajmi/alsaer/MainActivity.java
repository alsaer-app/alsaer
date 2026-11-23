package com.ahmedalajmi.alsaer;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity مدموج: إضافة بصمة (BiometricPlugin) + الإشعارات المحلية (AlsaerNative).
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BiometricPlugin.class);
        super.onCreate(savedInstanceState);
        // ALSAER: جسر الإشعارات الأصلية + تعليق المستمع + جدولة التنبيهات عند إعادة الفتح
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new AlsaerNative(this), "AlsaerNative");
            try { getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false); } catch (Exception e) { }
            // ALSAER: حجم خط التطبيق يتبع حجم خط النظام (WebView لا يفعل ذلك افتراضيًا)
            try {
                float fs = getResources().getConfiguration().fontScale;
                getBridge().getWebView().getSettings().setTextZoom(Math.round(fs * 100));
            } catch (Exception e) { }
        }
        handleRoute(getIntent());
        handleGdriveRedirect(getIntent()); // ALSAER
        // ALSAER: الجدولة خارج الخيط الرئيسي حتى لا تؤخّر الإقلاع
        final android.content.Context app = getApplicationContext();
        new Thread(() -> AlarmScheduler.scheduleAll(app)).start();
    }

    // ALSAER: بعد ردّ المستخدم على طلب إذن الإشعارات نوقظ الواجهة فورًا بدل انتظار دورة الاستطلاع
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv != null) {
            wv.post(() -> wv.evaluateJavascript("window.alsaerPoll&&window.alsaerPoll()", null));
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleRoute(intent); // ALSAER
        handleGdriveRedirect(intent); // ALSAER
        final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv != null) {
            wv.post(() -> wv.evaluateJavascript("window.alsaerPoll&&window.alsaerPoll()", null));
        }
    }

    // ALSAER: الرجوع تتولاه صفحة التطبيق نفسها (نوافذ المصحف ← الشاشة السابقة)؛ في الرئيسية فقط يُقلَّص التطبيق
    @Override
    public void onBackPressed() {
        final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv == null) { moveTaskToBack(true); return; }
        wv.evaluateJavascript("(function(){try{return window.alsaerBack?(window.alsaerBack()?'1':'0'):'0'}catch(e){return '0'}})()", value -> {
            if (value == null || !value.contains("1")) {
                moveTaskToBack(true);
            }
        });
    }

    // ALSAER: عودة المتصفح برمز موافقة Google Drive (com.ahmedalajmi.alsaer://gdrive?code=...)
    private void handleGdriveRedirect(Intent intent) {
        if (intent == null) return;
        android.net.Uri d = intent.getData();
        if (d == null || !"com.ahmedalajmi.alsaer".equals(d.getScheme()) || !"gdrive".equals(d.getHost())) return;
        final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv != null) {
            final String u = d.toString();
            wv.post(() -> wv.evaluateJavascript("window.gdriveOnRedirect&&window.gdriveOnRedirect(" + org.json.JSONObject.quote(u) + ")", null));
        }
        intent.setData(null);
    }

    // ALSAER
    private void handleRoute(Intent intent) {
        if (intent == null) return;
        String r = intent.getStringExtra("alsaer_route");
        if (r != null && !r.isEmpty()) {
            AlarmScheduler.saveRoute(this, r);
            intent.removeExtra("alsaer_route");
        }
    }
}
