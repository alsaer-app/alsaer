package com.ahmedalajmi.alsaer;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/** ودجت الشاشة الرئيسية: الصلاة القادمة + عدّاد تنازلي. البيانات يدفعها التطبيق عبر AlsaerNative.setWidget. */
public class AlsaerWidget extends AppWidgetProvider {
    static final String PREF = "alsaer_widget", KEY = "data";

    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c, m, ids); }

    @Override public void onReceive(Context c, Intent i) {
        super.onReceive(c, i);
        if (i != null && "com.ahmedalajmi.alsaer.WIDGET_TICK".equals(i.getAction())) refresh(c);
    }

    static void save(Context c, String json) { c.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putString(KEY, json).apply(); refresh(c); }

    static void refresh(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, AlsaerWidget.class));
            if (ids != null && ids.length > 0) render(c, m, ids);
        } catch (Throwable ignored) { }
    }

    /** أرقام المعرّفات ثابتة (من widget_res/ids.txt) لأنها غير مسجّلة بالاسم في جدول الموارد. */
    private static int id(String n) {
        switch (n) { case "wg_next": return 0x7f0900c6; case "wg_time": return 0x7f0900c7; case "wg_left": return 0x7f0900c8; case "wg_date": return 0x7f0900c9;
            case "wg_book": return 0x7f0900cb; case "wg_lbl": return 0x7f0900cc; case "wg_row": return 0x7f0900cd; case "wg_bg": return 0x7f0900ce;
            case "wg_pr": return 0x7f0900d0; case "wg_p1": return 0x7f0900d1; case "wg_p2": return 0x7f0900d2; case "wg_p3": return 0x7f0900d3;
            case "wg_p4": return 0x7f0900d4; case "wg_p5": return 0x7f0900d5; default: return 0x7f0900ca; }
    }

    /** إعدادات الودجت: theme (١٠ أساليب) · size s|m|l · design full|compact|prayers|clock · radius · alpha · date · left · book */
    static JSONObject style(Context c) {
        JSONObject o = new JSONObject();
        try {
            o.put("theme", "green"); o.put("size", "m"); o.put("date", true); o.put("left", true); o.put("book", true); o.put("design", "full"); o.put("radius", 22); o.put("alpha", 100);
            JSONObject s = new JSONObject(c.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString("style", "{}"));
            java.util.Iterator<String> k = s.keys();
            while (k.hasNext()) { String n = k.next(); o.put(n, s.get(n)); }
        } catch (Throwable ignored) { }
        return o;
    }

    static void setStyle(Context c, String json) {
        try { new JSONObject(json); c.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putString("style", json).apply(); refresh(c); } catch (Throwable ignored) { }
    }

    @Override public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int wid, android.os.Bundle opts) { render(c, m, new int[]{wid}); }

    /** خلفية الودجت كصورة (كل الأساليب + الاستدارة والشفافية). */
    private static android.graphics.Bitmap bg(String[] pl, int w, int h, float radPx, int alpha) {
        android.graphics.Bitmap bmp = android.graphics.Bitmap.createBitmap(w, h, android.graphics.Bitmap.Config.ARGB_8888);
        android.graphics.Canvas cv = new android.graphics.Canvas(bmp);
        android.graphics.Paint pt = new android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG);
        int a = Math.max(15, Math.min(100, alpha)) * 255 / 100;
        int c1 = (android.graphics.Color.parseColor(pl[0]) & 0x00FFFFFF) | (a << 24);
        int c2 = pl.length > 7 && pl[7] != null ? (android.graphics.Color.parseColor(pl[7]) & 0x00FFFFFF) | (a << 24) : c1;
        pt.setShader(new android.graphics.LinearGradient(0, 0, w, h, c1, c2, android.graphics.Shader.TileMode.CLAMP));
        float sw = Math.max(1.5f, w / 140f);
        android.graphics.RectF r = new android.graphics.RectF(sw / 2, sw / 2, w - sw / 2, h - sw / 2);
        cv.drawRoundRect(r, radPx, radPx, pt);
        pt.setShader(null); pt.setStyle(android.graphics.Paint.Style.STROKE); pt.setStrokeWidth(sw);
        pt.setColor((android.graphics.Color.parseColor(pl[1]) & 0x00FFFFFF) | (Math.min(255, a + 20) << 24));
        cv.drawRoundRect(r, radPx, radPx, pt);
        return bmp;
    }

    static void render(Context c, AppWidgetManager m, int[] ids) {
        int layout = c.getResources().getIdentifier("alsaer_widget", "layout", c.getPackageName());
        if (layout == 0) return;
        String name = "افتح التطبيق", time = "--:--", date = "", book = "";
        long at = 0;
        java.util.ArrayList<String[]> up = new java.util.ArrayList<>();
        try {
            JSONObject o = new JSONObject(c.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString(KEY, "{}"));
            date = o.optString("h", ""); book = o.optString("b", "");
            JSONArray l = o.optJSONArray("l");
            long now = System.currentTimeMillis();
            if (l != null) for (int k = 0; k < l.length(); k++) {
                JSONObject p = l.getJSONObject(k);
                if (p.optLong("at") > now) {
                    if (at == 0) { at = p.optLong("at"); name = "الصلاة القادمة: " + p.optString("n"); time = p.optString("t"); }
                    if (up.size() < 5) up.add(new String[]{p.optString("n"), p.optString("t")});
                }
            }
        } catch (Throwable ignored) { }
        JSONObject st = style(c);
        String[] pl = FloatingReminderService.palette(st.optString("theme", "green"));
        String design = st.optString("design", "full");
        String sz = st.optString("size", "m"); float usc = "s".equals(sz) ? 0.85f : "l".equals(sz) ? 1.2f : 1f;
        float den = c.getResources().getDisplayMetrics().density;
        int col2 = android.graphics.Color.parseColor(pl[4]), colT = android.graphics.Color.parseColor(pl[2]), colX = android.graphics.Color.parseColor(pl[3]), colA = android.graphics.Color.parseColor(pl[5]);
        for (int wid : ids) {
            int wdp = 160, hdp = 110;
            try { android.os.Bundle ob = m.getAppWidgetOptions(wid); wdp = Math.max(60, ob.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 160)); hdp = Math.max(40, ob.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110)); } catch (Throwable ignored) { }
            // تجاوب مع الحجم: يكبّر الخط تدريجيًا ويخفي التفاصيل في المساحات الضيقة
            float fit = Math.max(0.75f, Math.min(1.7f, Math.min(wdp / 150f, hdp / 100f)));
            float sc = usc * fit;
            boolean tiny = hdp < 90, narrow = wdp < 150;
            boolean clock = "clock".equals(design), compact = "compact".equals(design) || tiny, prayers = "prayers".equals(design) && !tiny && !narrow && up.size() > 1;
            RemoteViews v = new RemoteViews(c.getPackageName(), layout);
            int pw = Math.min(560, Math.max(80, (int) (wdp * den))), ph = Math.min(560, Math.max(60, (int) (hdp * den)));
            float rad = Math.min(Math.max(0, Math.min(40, st.optInt("radius", 22))) * den * ((float) pw / (wdp * den)), Math.min(pw, ph) / 2f);
            try { v.setImageViewBitmap(id("wg_bg"), bg(pl, pw, ph, rad, st.optInt("alpha", 100))); } catch (Throwable ignored) { }
            v.setTextViewText(id("wg_next"), clock ? name.replace("الصلاة القادمة: ", "") : name);
            v.setTextViewText(id("wg_time"), time);
            v.setTextViewText(id("wg_date"), date);
            v.setTextViewText(id("wg_book"), book);
            v.setTextColor(id("wg_next"), colT);
            v.setTextColor(id("wg_time"), colX);
            v.setTextColor(id("wg_lbl"), col2);
            v.setTextColor(id("wg_left"), col2);
            v.setTextColor(id("wg_date"), col2);
            v.setTextColor(id("wg_book"), colA);
            int tp = android.util.TypedValue.COMPLEX_UNIT_SP;
            v.setTextViewTextSize(id("wg_next"), tp, (clock ? 14 : 13) * sc);
            v.setTextViewTextSize(id("wg_time"), tp, (clock ? 40 : compact ? 22 : 26) * sc);
            v.setTextViewTextSize(id("wg_lbl"), tp, 12 * sc);
            v.setTextViewTextSize(id("wg_left"), tp, 12 * sc);
            v.setTextViewTextSize(id("wg_date"), tp, 11 * sc);
            v.setTextViewTextSize(id("wg_book"), tp, 11 * sc);
            boolean showDate = st.optBoolean("date", true) && date.length() > 0 && !compact;
            boolean showBook = st.optBoolean("book", true) && book.length() > 0 && !compact && !clock && hdp >= 110;
            v.setViewVisibility(id("wg_date"), showDate || (clock && st.optBoolean("date", true) && date.length() > 0) ? android.view.View.VISIBLE : android.view.View.GONE);
            v.setViewVisibility(id("wg_book"), showBook ? android.view.View.VISIBLE : android.view.View.GONE);
            v.setViewVisibility(id("wg_row"), st.optBoolean("left", true) && !clock ? android.view.View.VISIBLE : android.view.View.GONE);
            v.setViewVisibility(id("wg_pr"), prayers ? android.view.View.VISIBLE : android.view.View.GONE);
            if (prayers) for (int k = 1; k <= 5; k++) {
                int pid = id("wg_p" + k);
                if (k <= up.size()) {
                    v.setViewVisibility(pid, android.view.View.VISIBLE);
                    v.setTextViewText(pid, up.get(k - 1)[0] + "\n" + up.get(k - 1)[1]);
                    v.setTextColor(pid, k == 1 ? colA : col2);
                    v.setTextViewTextSize(pid, tp, 10 * sc);
                } else v.setViewVisibility(pid, android.view.View.GONE);
            }
            int left = id("wg_left");
            if (at > 0 && Build.VERSION.SDK_INT >= 24) {
                v.setViewVisibility(left, android.view.View.VISIBLE);
                v.setChronometerCountDown(left, true);
                v.setChronometer(left, SystemClock.elapsedRealtime() + (at - System.currentTimeMillis()), null, true);
            } else v.setViewVisibility(left, android.view.View.GONE);
            Intent open = new Intent(c, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            v.setOnClickPendingIntent(id("wg_root"), PendingIntent.getActivity(c, 7100, open, fl));
            m.updateAppWidget(wid, v);
        }
        if (at > 0) schedule(c, at + 2000);
    }

    /** تحديث عند انقضاء وقت الصلاة الحالية (غير دقيق؛ يكفي هنا). */
    static void schedule(Context c, long when) {
        try {
            android.app.AlarmManager am = (android.app.AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            Intent i = new Intent(c, AlsaerWidget.class).setAction("com.ahmedalajmi.alsaer.WIDGET_TICK");
            int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            am.set(android.app.AlarmManager.RTC, when, PendingIntent.getBroadcast(c, 7101, i, fl));
        } catch (Throwable ignored) { }
    }
}
