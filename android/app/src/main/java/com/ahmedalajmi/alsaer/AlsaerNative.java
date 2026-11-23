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


    public AlsaerNative(Activity a) { act = a; }

    /* ---- مرآة إعدادات الويب في SharedPreferences: تحمي من فقدان localStorage عند أي تغيير في أصل WebView ---- */
    @JavascriptInterface public void mirrorSet(String k, String v) {
        act.getSharedPreferences("alsaer_webstore_mirror", 0).edit().putString(k, v).apply();
    }
    @JavascriptInterface public String mirrorGet(String k) {
        return act.getSharedPreferences("alsaer_webstore_mirror", 0).getString(k, null);
    }

    @JavascriptInterface public void gdriveAuthorize(boolean interactive) {
        act.runOnUiThread(() -> { if (act instanceof MainActivity) ((MainActivity)act).authorizeDrive(interactive); });
    }

    @JavascriptInterface public void backupExport(String content,String name) {
        act.runOnUiThread(()->{if(act instanceof MainActivity)((MainActivity)act).backupDocument(true,content,name);});
    }
    @JavascriptInterface public void backupImport() {
        act.runOnUiThread(()->{if(act instanceof MainActivity)((MainActivity)act).backupDocument(false,null,null);});
    }

    /* Backup password is encrypted with a non-exportable Android Keystore key. */
    private javax.crypto.SecretKey driveBackupKey() throws Exception {
        java.security.KeyStore ks = java.security.KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
        String alias = "alsaer_drive_backup_password_v1";
        if (ks.containsAlias(alias)) return (javax.crypto.SecretKey) ks.getKey(alias, null);
        javax.crypto.KeyGenerator gen = javax.crypto.KeyGenerator.getInstance("AES", "AndroidKeyStore");
        gen.init(new android.security.keystore.KeyGenParameterSpec.Builder(alias,
            android.security.keystore.KeyProperties.PURPOSE_ENCRYPT | android.security.keystore.KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(android.security.keystore.KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(android.security.keystore.KeyProperties.ENCRYPTION_PADDING_NONE).build());
        return gen.generateKey();
    }
    @JavascriptInterface public String gdriveSeal(String password) {
        try {
            javax.crypto.Cipher c = javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");
            c.init(javax.crypto.Cipher.ENCRYPT_MODE, driveBackupKey());
            byte[] data = c.doFinal(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return android.util.Base64.encodeToString(c.getIV(), android.util.Base64.NO_WRAP) + ":" + android.util.Base64.encodeToString(data, android.util.Base64.NO_WRAP);
        } catch (Exception e) { return ""; }
    }
    @JavascriptInterface public String gdriveOpen(String sealed) {
        try {
            String[] parts = sealed.split(":", 2); if (parts.length != 2) return "";
            javax.crypto.Cipher c = javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");
            c.init(javax.crypto.Cipher.DECRYPT_MODE, driveBackupKey(), new javax.crypto.spec.GCMParameterSpec(128, android.util.Base64.decode(parts[0], android.util.Base64.NO_WRAP)));
            return new String(c.doFinal(android.util.Base64.decode(parts[1], android.util.Base64.NO_WRAP)), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) { return ""; }
    }
    @JavascriptInterface public boolean gdriveSaveBackup(String content) {
        if (content == null || content.isEmpty()) return false;
        try {
            java.io.File dir = new java.io.File(act.getFilesDir(), "backups");
            if (!dir.exists() && !dir.mkdirs()) return false;
            android.util.AtomicFile file = new android.util.AtomicFile(new java.io.File(dir, "alsaer-backup.txt"));
            java.io.FileOutputStream out = null;
            try { out = file.startWrite(); out.write(content.getBytes(java.nio.charset.StandardCharsets.UTF_8)); file.finishWrite(out); }
            catch (Exception e) { if (out != null) file.failWrite(out); return false; }
            return true;
        } catch (Exception e) { return false; }
    }

    /* ALSAER: فتح رابط في متصفح الجهاز (صفحة موافقة Google لربط النسخة الاحتياطية) */
    @JavascriptInterface public boolean openUrl(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            act.startActivity(i);
            return true;
        } catch (Exception e) { return false; }
    }

    @JavascriptInterface public String appBuildInfo() { return BuildConfig.VERSION_NAME + "|" + BuildConfig.VERSION_CODE; }

    /* ALSAER: تحميل التحديث داخل التطبيق — تنزيل قابل للاستئناف (HttpURLConnection + Range)
       في خيط خلفي، وحالته محفوظة في SharedPreferences لتبقى بعد إغلاق التطبيق (يُستكمل من
       حيث توقف). قبل فتح مثبّت النظام يُتحقق من SHA-256 واسم الحزمة ورقم الإصدار وتطابق
       التوقيع مع التطبيق الحالي. لا خدمة أمامية: إن أُغلق التطبيق يتوقف التنزيل ويُستأنف لاحقًا. */
    private static volatile boolean updRunning = false;

    private android.content.SharedPreferences updPrefs() { return act.getSharedPreferences("alsaer_update_dl", 0); }
    private java.io.File updPart() { return new java.io.File(act.getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS), "alsaer-update.part"); }
    private java.io.File updApk() { return new java.io.File(act.getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS), "alsaer-update.apk"); }

    @JavascriptInterface public String updateStart(final String url, final long size, final String sha) {
        if (updRunning) return "busy";
        android.content.SharedPreferences p = updPrefs();
        long done = 0;
        if (url.equals(p.getString("url", "")) && updPart().exists()) done = updPart().length();
        p.edit().putString("url", url).putLong("size", size).putString("sha", sha == null ? "" : sha)
                .putLong("done", done).putString("st", "downloading").putString("err", "").apply();
        updRunning = true;
        new Thread(new Runnable() { public void run() { updRun(url); } }, "alsaer-upd").start();
        return "started";
    }

    private void updRun(String url) {
        android.content.SharedPreferences p = updPrefs();
        java.io.File part = updPart();
        long lastFlush = 0;
        try {
            long total = p.getLong("size", 0);
            long done = part.exists() ? part.length() : 0;
            while (true) {
                java.net.HttpURLConnection c = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
                c.setConnectTimeout(15000);
                c.setReadTimeout(20000);
                c.setRequestProperty("User-Agent", "alsaer-updater");
                if (done > 0) c.setRequestProperty("Range", "bytes=" + done + "-");
                c.connect();
                int code = c.getResponseCode();
                if (code == 200 && done > 0) { done = 0; if (part.exists()) part.delete(); }
                else if (code != 200 && code != 206) throw new java.io.IOException("http " + code);
                String cl = c.getHeaderField("Content-Length");
                if (cl != null) {
                    long n = Long.parseLong(cl.trim());
                    total = (code == 206) ? done + n : n;
                }
                java.io.InputStream in = c.getInputStream();
                java.io.RandomAccessFile raf = new java.io.RandomAccessFile(part, "rw");
                raf.seek(done);
                byte[] buf = new byte[16384];
                int n;
                while ((n = in.read(buf)) > 0) {
                    raf.write(buf, 0, n);
                    done += n;
                    long now = System.currentTimeMillis();
                    if (now - lastFlush > 700) {
                        p.edit().putLong("done", done).putLong("size", total).apply();
                        lastFlush = now;
                    }
                }
                raf.close();
                in.close();
                c.disconnect();
                if (total <= 0 || done >= total) break; /* اكتمل الملف؛ وإلا فالاتصال انقطع مبكرًا فنُعيد الاتصال للاستكمال */
            }
            String sha = p.getString("sha", "");
            if (sha.length() == 64) {
                p.edit().putString("st", "verifying").apply();
                String real = updSha256(part);
                if (!sha.equalsIgnoreCase(real)) { part.delete(); throw new java.io.IOException("sha256"); }
            }
            java.io.File apk = updApk();
            if (apk.exists()) apk.delete();
            if (!part.renameTo(apk)) throw new java.io.IOException("rename");
            p.edit().putLong("done", apk.length()).putString("st", "done").putString("err", "").apply();
        } catch (Exception e) {
            String m = "sha256".equals(e.getMessage()) ? "الملف غير سليم (فشل التحقق من البصمة)" : "انقطع الاتصال";
            p.edit().putString("st", "failed").putString("err", m).apply();
        } finally { updRunning = false; }
    }

    private String updSha256(java.io.File f) throws Exception {
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
        java.io.FileInputStream in = new java.io.FileInputStream(f);
        byte[] buf = new byte[65536];
        int n;
        while ((n = in.read(buf)) > 0) md.update(buf, 0, n);
        in.close();
        byte[] d = md.digest();
        StringBuilder sb = new StringBuilder();
        for (byte b : d) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    @JavascriptInterface public String updateProgress() {
        android.content.SharedPreferences p = updPrefs();
        long done = p.getLong("done", 0), total = p.getLong("size", 0);
        int pct = total > 0 ? (int) (done * 100 / total) : -1;
        return "{\"st\":\"" + p.getString("st", "idle") + "\",\"done\":" + done + ",\"total\":" + total
                + ",\"pct\":" + pct + ",\"run\":" + updRunning
                + ",\"err\":\"" + p.getString("err", "").replace("\"", "'")
                + "\",\"url\":\"" + p.getString("url", "") + "\"}";
    }

    @JavascriptInterface public String updateInstall() {
        try {
            java.io.File f = updApk();
            if (!f.exists()) return "nofile";
            android.content.pm.PackageManager pm = act.getPackageManager();
            android.content.pm.PackageInfo pi;
            if (Build.VERSION.SDK_INT >= 28) pi = pm.getPackageArchiveInfo(f.getAbsolutePath(), android.content.pm.PackageManager.GET_SIGNING_CERTIFICATES);
            else pi = pm.getPackageArchiveInfo(f.getAbsolutePath(), android.content.pm.PackageManager.GET_SIGNATURES);
            if (pi == null || pi.packageName == null || !pi.packageName.equals(act.getPackageName())) return "badpkg";
            long vc = (Build.VERSION.SDK_INT >= 28) ? pi.getLongVersionCode() : pi.versionCode;
            if (vc <= BuildConfig.VERSION_CODE) return "badver";
            android.content.pm.PackageInfo cur = (Build.VERSION.SDK_INT >= 28)
                    ? pm.getPackageInfo(act.getPackageName(), android.content.pm.PackageManager.GET_SIGNING_CERTIFICATES)
                    : pm.getPackageInfo(act.getPackageName(), android.content.pm.PackageManager.GET_SIGNATURES);
            String a = updSig(pi), b = updSig(cur);
            if (a == null || !a.equals(b)) return "badsig";
            if (Build.VERSION.SDK_INT >= 26 && !pm.canRequestPackageInstalls()) {
                Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + act.getPackageName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                act.startActivity(i);
                return "needperm";
            }
            Uri u = androidx.core.content.FileProvider.getUriForFile(act, act.getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(u, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            act.startActivity(i);
            return "ok";
        } catch (Exception e) { return "error"; }
    }

    private String updSig(android.content.pm.PackageInfo pi) {
        try {
            android.content.pm.Signature[] s;
            if (Build.VERSION.SDK_INT >= 28 && pi.signingInfo != null) s = pi.signingInfo.getApkContentsSigners();
            else s = pi.signatures;
            if (s == null || s.length == 0) return null;
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(s[0].toByteArray());
            StringBuilder sb = new StringBuilder();
            for (byte x : d) sb.append(String.format("%02x", x));
            return sb.toString();
        } catch (Exception e) { return null; }
    }

    /* ALSAER: تسحب الصفحة رمز عودة Google Drive المعلّق (إقلاع بارد أثناء الموافقة). مرة واحدة: أول سحب يستهلكه. */
    @JavascriptInterface public String consumeGdriveRedirect() {
        return (act instanceof MainActivity) ? ((MainActivity) act).consumeGdriveRedirect() : null;
    }
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
