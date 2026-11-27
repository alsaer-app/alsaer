package com.ahmedalajmi.alsaer;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * سجل تشخيص صغير للصوت والدورة الحياتية: آخر ٤٠ سطرًا فقط، على الجهاز، بلا أي بيانات شخصية ولا رموز.
 * يُعرض في «المزيد» ليصوّره المستخدم عند الحاجة.
 */
final class DiagLog {
    private static final String PREF = "alsaer_diag";
    private static final String KEY = "lines";
    private static final int MAX = 40;
    private static Context app;

    private DiagLog() { }

    static synchronized void init(Context c) { if (app == null && c != null) app = c.getApplicationContext(); }

    static synchronized void add(String line) {
        try {
            if (app == null) return;
            String clean = String.valueOf(line).replace('\n', ' ').replace('\r', ' ');
            if (clean.length() > 160) clean = clean.substring(0, 160);
            SharedPreferences sp = app.getSharedPreferences(PREF, Context.MODE_PRIVATE);
            String cur = sp.getString(KEY, "");
            String[] parts = cur.isEmpty() ? new String[0] : cur.split("\n");
            StringBuilder sb = new StringBuilder();
            int start = Math.max(0, parts.length - (MAX - 1));
            for (int i = start; i < parts.length; i++) sb.append(parts[i]).append('\n');
            sb.append(new java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US).format(new java.util.Date())).append(' ').append(clean);
            sp.edit().putString(KEY, sb.toString()).apply();
        } catch (Exception ignored) { }
    }

    static synchronized String get() {
        try { return app == null ? "" : app.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString(KEY, ""); }
        catch (Exception e) { return ""; }
    }

    static synchronized void clear() {
        try { if (app != null) app.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().remove(KEY).apply(); }
        catch (Exception ignored) { }
    }
}
