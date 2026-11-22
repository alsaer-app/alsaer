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
            Speech.wv = getBridge().getWebView();
            try { getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false); } catch (Exception e) { }
        }
        Speech.restore(this);
        handleRoute(getIntent());
        AlarmScheduler.scheduleAll(this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleRoute(intent); // ALSAER
        final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv != null) {
            wv.post(() -> wv.evaluateJavascript("window.alsaerPoll&&window.alsaerPoll()", null));
        }
    }

    // ALSAER: لا يبقى الميكروفون يعمل بعد خروج التطبيق من الواجهة
    @Override
    public void onStop() {
        Speech.stopAll();
        SherpaAsr.stopAll();
        super.onStop();
    }

    @Override
    public void onDestroy() {
        Speech.stopAll();
        SherpaAsr.stopAll();
        super.onDestroy();
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
