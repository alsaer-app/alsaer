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
