package com.ahmedalajmi.alsaer;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.webkit.JavascriptInterface;

import androidx.core.app.NotificationManagerCompat;

import org.json.JSONObject;

/** الواجهة التي تراها صفحة التطبيق باسم window.AlsaerNative. */
public class AlsaerNative {
    private final Activity act;

    private final Speech speech;

    private final SherpaAsr sherpa;

    public AlsaerNative(Activity a) { act = a; speech = new Speech(a); sherpa = new SherpaAsr(a); }

    @JavascriptInterface
    public boolean speechAvailable() { return speech.available(); }

    @JavascriptInterface
    public void speechStart() { speech.start("[]"); }

    @JavascriptInterface
    public void speechStart2(String biasJson) { speech.start(biasJson); }

    @JavascriptInterface
    public void speechBias(String biasJson) { speech.setBias(biasJson); }

    @JavascriptInterface
    public void speechStop() { speech.stop(); }

    @JavascriptInterface
    public void speechMute(boolean b) { speech.setMuteBeep(b); if (!b) speech.silent(false); }
    @JavascriptInterface public void speechOnDevice(boolean b) { speech.setOnDevice(b); }
    @JavascriptInterface public void speechSilent(boolean on) { speech.silent(on); }

    /* ---- مرآة إعدادات الويب في SharedPreferences: تحمي من فقدان localStorage عند أي تغيير في أصل WebView ---- */
    @JavascriptInterface public void mirrorSet(String k, String v) {
        act.getSharedPreferences("alsaer_webstore_mirror", 0).edit().putString(k, v).apply();
    }
    @JavascriptInterface public String mirrorGet(String k) {
        return act.getSharedPreferences("alsaer_webstore_mirror", 0).getString(k, null);
    }

    /* ---- النموذج القرآني المحلي (sherpa-onnx): حالة/تنزيل/تشغيل ---- */
    @JavascriptInterface public String asrStatus() { return sherpa.status(); }
    @JavascriptInterface public void asrDownload(String kind) { sherpa.download(kind); }
    @JavascriptInterface public void asrCancelDownload() { sherpa.cancelDownload(); }
    @JavascriptInterface public void asrDelete(String kind) { sherpa.delete(kind); }
    @JavascriptInterface public void asrStart(String kind, int jsid) { sherpa.start(kind, jsid); }
    @JavascriptInterface public void asrWarmup(String kind) { sherpa.warmup(kind); }
    @JavascriptInterface public void asrStop() { sherpa.stop(); }
    @JavascriptInterface public String asrDiag() { return SherpaAsr.diagDump(); }
    @JavascriptInterface public void asrSelfTest(String kind) { sherpa.selfTest(kind); }
    @JavascriptInterface public void shareText(String title, String body) {
        Intent i = new Intent(Intent.ACTION_SEND);
        i.setType("text/plain");
        i.putExtra(Intent.EXTRA_SUBJECT, title);
        i.putExtra(Intent.EXTRA_TEXT, body);
        Intent c = Intent.createChooser(i, title);
        c.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        act.startActivity(c);
    }

    @JavascriptInterface
    public void setSchedule(String json) { AlarmScheduler.saveAndSchedule(act, json); }

    @JavascriptInterface
    public boolean notificationsEnabled() { return NotificationManagerCompat.from(act).areNotificationsEnabled(); }

    @JavascriptInterface
    public boolean canExactAlarms() {
        if (Build.VERSION.SDK_INT < 31) return true;
        android.app.AlarmManager am = (android.app.AlarmManager) act.getSystemService(android.content.Context.ALARM_SERVICE);
        return am.canScheduleExactAlarms();
    }

    @JavascriptInterface
    public void requestNotificationPermission() {
        act.runOnUiThread(() -> {
            {
                if (notificationsEnabled()) return;
                if (Build.VERSION.SDK_INT >= 33) act.requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 7001);
                else openAppNotificationSettings();
            }
        });
    }

    /** إشعار تجريبي بعد 3 ثوانٍ، يظهر باسم التذكير المستهدف (يمرَّر من الواجهة). */
    @JavascriptInterface
    public void testNotification(String title) {
        try {
            String t = (title == null || title.trim().isEmpty()) ? "تذكير تجريبي" : title.trim();
            JSONObject it = new JSONObject();
            it.put("id", "test");
            it.put("title", t);
            it.put("body", "هذا اختبار للتذكير المحدد؛ إشعارات السائر تعمل بنجاح.");
            it.put("route", "tab:reminders");
            AlarmScheduler.ensureChannel(act);
            AlarmScheduler.scheduleAt(act, it, System.currentTimeMillis() + 3000L, true);
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void setSoundMode(String mode) { AlarmScheduler.setSoundMode(act, mode); }

    @JavascriptInterface
    public String getSoundMode() { return AlarmScheduler.soundMode(act); }

    @JavascriptInterface
    public String takePending() { return AlarmScheduler.takePending(act); }

    @JavascriptInterface
    public String takeRoute() { return AlarmScheduler.takeRoute(act); }

    @JavascriptInterface
    public void openLocationSettings() { start(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)); }

    @JavascriptInterface
    public void openAppNotificationSettings() {
        if (Build.VERSION.SDK_INT >= 26) {
            Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            i.putExtra(Settings.EXTRA_APP_PACKAGE, act.getPackageName());
            start(i);
        } else openAppDetails();
    }

    @JavascriptInterface
    public void openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT >= 31) {
            Intent i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + act.getPackageName()));
            start(i);
        } else openAppDetails();
    }

    /* التذكيرات العائمة فوق التطبيقات الأخرى */
    @JavascriptInterface
    public boolean canDrawOverlays() { return FloatingReminderService.canDraw(act); }

    @JavascriptInterface
    public boolean floatingEnabled() { return FloatingReminderService.enabled(act); }

    @JavascriptInterface
    public void setWidgetStyle(String json) { AlsaerWidget.setStyle(act, json); }

    @JavascriptInterface
    public String getWidgetStyle() { return AlsaerWidget.style(act).toString(); }

    @JavascriptInterface
    public boolean widgetActive() {
        try {
            android.appwidget.AppWidgetManager m = android.appwidget.AppWidgetManager.getInstance(act);
            int[] ids = m.getAppWidgetIds(new ComponentName(act, AlsaerWidget.class));
            return ids != null && ids.length > 0;
        } catch (Throwable t) { return false; }
    }

    @JavascriptInterface
    public void setWidget(String json) { AlsaerWidget.save(act, json); }

    @JavascriptInterface
    public void setFloatStyle(String json) { FloatingReminderService.setStyle(act, json); }

    @JavascriptInterface
    public String getFloatStyle() { return FloatingReminderService.style(act).toString(); }

    @JavascriptInterface
    public void pauseFloating(int minutes) { FloatingReminderService.pause(act, minutes); }

    @JavascriptInterface
    public long floatingPausedUntil() { return FloatingReminderService.pausedUntil(act); }

    @JavascriptInterface
    public void setFloating(boolean on) { FloatingReminderService.setEnabled(act, on); FloatFeed.schedule(act); }

    @JavascriptInterface
    public void openOverlaySettings() {
        if (Build.VERSION.SDK_INT >= 23) start(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + act.getPackageName())));
    }

    @JavascriptInterface
    public void testFloating() { try { FloatFeed.show(act, true); } catch (Throwable ignored) { } }

    @JavascriptInterface
    public void setFloatFeed(String json) { FloatFeed.setCfg(act, json); }

    @JavascriptInterface
    public String getFloatFeed() { return FloatFeed.cfg(act).toString(); }

    @JavascriptInterface
    public void setFloatPool(String json) { FloatFeed.setPool(act, json); }

    @JavascriptInterface
    public int floatPoolSize() { return FloatFeed.poolSize(act); }

    @JavascriptInterface
    public String floatUpcoming(int n) { return FloatFeed.upcoming(act, n); }

    @JavascriptInterface
    public long floatLastShown() { return FloatFeed.sp(act).getLong("last", 0); }

    /** آخر خطأ في النوافذ العائمة ووقته (JSON أو null) لعرضه في الإعدادات. */
    @JavascriptInterface
    public String floatLastError() { return FloatLog.last(act); }

    /** تجديد: يعيد ضبط المنبّه ويعيد موعد الظهور التالي (0 = لا يوجد). */
    @JavascriptInterface
    public long floatRefresh() { return FloatFeed.schedule(act); }

    @JavascriptInterface
    public void openBatterySettings() {
        // شاشة «التشغيل التلقائي» في شاومي إن وُجدت، وإلا قائمة تحسين البطارية
        Intent mi = new Intent();
        mi.setComponent(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
        if (!start(mi)) {
            if (Build.VERSION.SDK_INT < 23 || !start(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))) openAppDetails();
        }
    }

    private void openAppDetails() {
        start(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + act.getPackageName())));
    }

    private boolean start(final Intent i) {
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try { act.startActivity(i); return true; } catch (Exception e) { return false; }
    }
}
