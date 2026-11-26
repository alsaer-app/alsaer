package com.ahmedalajmi.alsaer;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity مدموج: إضافة بصمة (BiometricPlugin) + الإشعارات المحلية (AlsaerNative).
 */
public class MainActivity extends BridgeActivity {
    private DriveAuthorization driveAuthorization;
    private BackupDocuments backupDocuments;
    private LocationBridge locationBridge;
    LocationBridge location() { if (locationBridge == null) locationBridge = new LocationBridge(this); return locationBridge; }
    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (locationBridge != null && locationBridge.onPermission(requestCode, grantResults)) return;
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
    void backupDocument(boolean save,String content,String name){
        if(backupDocuments==null)backupDocuments=new BackupDocuments(this);
        backupDocuments.launch(save,content,name);
    }
    void authorizeDrive(boolean interactive) {
        if (driveAuthorization == null) driveAuthorization = new DriveAuthorization(this);
        driveAuthorization.authorize(interactive);
    }
    void authorizeDrive(boolean interactive, String accountEmail) {
        if (driveAuthorization == null) driveAuthorization = new DriveAuthorization(this);
        driveAuthorization.authorize(interactive, accountEmail);
    }
    void clearDriveToken(String token) {
        if (driveAuthorization == null) driveAuthorization = new DriveAuthorization(this);
        driveAuthorization.clearToken(token);
    }
    void revokeDrive() {
        if (driveAuthorization == null) driveAuthorization = new DriveAuthorization(this);
        driveAuthorization.revoke();
    }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (backupDocuments != null && backupDocuments.onResult(requestCode,resultCode,data)) return;
        if (driveAuthorization != null && driveAuthorization.onResult(requestCode, resultCode, data)) return;
        super.onActivityResult(requestCode, resultCode, data);
    }
    @Override
    public void onCreate(Bundle savedInstanceState) {
        AlsaerNative.markBoot(); // ALSAER بند 64: بداية ساعة قياس الإقلاع
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
    // يُحفظ الرابط أولًا ثم تسحبه الصفحة عند جاهزيتها: في الإقلاع البارد يصل الـintent قبل تحميل
    // الصفحة، فأي حقن مباشر هنا كان يضيع الرمز بصمت. الاستهلاك مرة واحدة (consume) يمنع التكرار.
    private String pendingGdriveRedirect = null;

    synchronized String consumeGdriveRedirect() {
        String u = pendingGdriveRedirect;
        pendingGdriveRedirect = null;
        return u;
    }

    private void handleGdriveRedirect(Intent intent) {
        if (intent == null) return;
        android.net.Uri d = intent.getData();
        if (d == null || !"com.ahmedalajmi.alsaer".equals(d.getScheme()) || !"gdrive".equals(d.getHost())) return;
        pendingGdriveRedirect = d.toString();
        intent.setData(null);
        final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv != null) {
            // التشغيل الدافئ: الصفحة محمّلة فتسحب الرمز فورًا. في الإقلاع البارد يضيع هذا النداء
            // بأمان وتلتقطه الصفحة عند إقلاعها لأن pendingGdriveRedirect ما يزال محفوظًا.
            wv.post(() -> wv.evaluateJavascript("window.gdrivePullRedirect&&window.gdrivePullRedirect()", null));
        }
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
