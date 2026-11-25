package com.ahmedalajmi.alsaer;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

/** يعرض بطاقة تذكير عائمة فوق التطبيقات الأخرى (تتطلب إذن «العرض فوق التطبيقات الأخرى»). */
public class FloatingReminderService extends Service {
    static final String EXTRA_TITLE = "t", EXTRA_BODY = "b", EXTRA_ROUTE = "r", EXTRA_ITEM = "i", EXTRA_NID = "n", PREF = "alsaer_float";
    private org.json.JSONObject st;
    private String[] pal;
    private float sc = 1f;
    private WindowManager wm;
    private View card;
    private final Handler h = new Handler();
    private final Runnable autoClose = () -> dismiss();
    private final Runnable hardStop = () -> { dismissView(); releaseWake(); try { stopForeground(true); } catch (Throwable ignored) { } stopSelf(); };
    private android.os.PowerManager.WakeLock wl;

    /** يُستدعى من AlarmScheduler.show عند وصول التذكير. */
    static void showIfEnabled(Context c, String title, String body, String route, org.json.JSONObject item, int nid) {
        if (!enabled(c) || pausedUntil(c) > System.currentTimeMillis()) return;
        if (!canDraw(c)) {
            FloatLog.err(c, NativeStrings.get(c, "show_window_with_reminder"), NativeStrings.get(c, "overlay_perm_missing"));
            return; // الإشعار نفسه ظهر بالفعل؛ لا حاجة لبديل هنا
        }
        Intent i = new Intent(c, FloatingReminderService.class);
        i.putExtra(EXTRA_TITLE, title);
        i.putExtra(EXTRA_BODY, body);
        i.putExtra(EXTRA_ROUTE, route);
        if (item != null) i.putExtra(EXTRA_ITEM, item.toString());
        i.putExtra(EXTRA_NID, nid);
        startOverlay(c, i);
    }

    /** يشغّل الخدمة الأمامية بأمان من الخلفية؛ عند الفشل يسجّل السبب ويعرض إشعارًا بديلًا. */
    static void startOverlay(Context c, Intent i) {
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i);
            else c.startService(i);
        } catch (Throwable t) {
            FloatLog.err(c, NativeStrings.get(c, "run_window_service"), String.valueOf(t));
            FloatLog.fallback(c, i.getStringExtra(EXTRA_TITLE), i.getStringExtra(EXTRA_BODY));
        }
    }

    /** إعدادات الشكل (من الواجهة): pos top|center|bottom · size s|m|l · theme green|light|gold|black|glass · radius · secs · alpha · btn */
    static org.json.JSONObject style(Context c) {
        org.json.JSONObject o = new org.json.JSONObject();
        try {
            o.put("pos", "top"); o.put("size", "m"); o.put("theme", "green"); o.put("radius", 20); o.put("secs", 15); o.put("alpha", 95); o.put("btn", true); o.put("design", "card"); o.put("anim", "slide"); o.put("animMs", 350);
            org.json.JSONObject s = new org.json.JSONObject(c.getSharedPreferences(PREF, MODE_PRIVATE).getString("style", "{}"));
            java.util.Iterator<String> k = s.keys();
            while (k.hasNext()) { String n = k.next(); o.put(n, s.get(n)); }
        } catch (Throwable ignored) { }
        return o;
    }

    static void setStyle(Context c, String json) {
        try { new org.json.JSONObject(json); c.getSharedPreferences(PREF, MODE_PRIVATE).edit().putString("style", json).apply(); } catch (Throwable ignored) { }
    }

    /** ألوان الثيم: خلفية، إطار، عنوان، نص، خافت، لون الزر، نص الزر، [لون ثانٍ للتدرّج]. */
    static String[] palette(String t) {
        switch (t) {
            case "light": return new String[]{"#FFFFFF", "#C9A24B", "#7A5B14", "#1F2A28", "#5B6B67", "#C9A24B", "#1F2A28", null};
            case "gold": return new String[]{"#E8C873", "#7A5B14", "#102A27", "#1F2A28", "#4A3E1E", "#102A27", "#E8C873", null};
            case "black": return new String[]{"#000000", "#3A3A3A", "#E8C873", "#FFFFFF", "#A0A0A0", "#E8C873", "#000000", null};
            case "glass": return new String[]{"#0E1A18", "#66FFFFFF", "#E8C873", "#FFFFFF", "#C8D4D0", "#E8C873", "#0E1A18", null};
            case "ocean": return new String[]{"#0F2027", "#4FA3C7", "#8FD3F4", "#FFFFFF", "#A9C6D4", "#8FD3F4", "#0F2027", "#2C5364"};
            case "sunset": return new String[]{"#3A1C71", "#D76D77", "#FFAF7B", "#FFFFFF", "#E0C3D6", "#FFAF7B", "#3A1C71", "#D76D77"};
            case "forest": return new String[]{"#134E5E", "#71B280", "#C8F2A8", "#FFFFFF", "#BFE0CC", "#C8F2A8", "#134E5E", "#71B280"};
            case "night": return new String[]{"#0F0C29", "#6C63FF", "#B8B5FF", "#FFFFFF", "#9D9BC9", "#B8B5FF", "#0F0C29", "#302B63"};
            case "rose": return new String[]{"#FFF1F4", "#E08CA0", "#9C2F4E", "#3B1F28", "#7A5560", "#C2456B", "#FFFFFF", "#FFD6E0"};
            default: return new String[]{"#102A27", "#C9A24B", "#E8C873", "#FFFFFF", "#9FB3AE", "#E8C873", "#102A27", null};
        }
    }

    static boolean canDraw(Context c) { return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(c); }

    static boolean enabled(Context c) { return c.getSharedPreferences("alsaer_float", MODE_PRIVATE).getBoolean("on", false); }

    static long pausedUntil(Context c) { return c.getSharedPreferences(PREF, MODE_PRIVATE).getLong("pause", 0); }

    static void pause(Context c, long minutes) { c.getSharedPreferences(PREF, MODE_PRIVATE).edit().putLong("pause", minutes <= 0 ? 0 : System.currentTimeMillis() + minutes * 60000L).apply(); }

    static void setEnabled(Context c, boolean on) { c.getSharedPreferences("alsaer_float", MODE_PRIVATE).edit().putBoolean("on", on).apply(); }

    @Override public IBinder onBind(Intent intent) { return null; }

    private boolean feed, forceCard, fresh;
    private String lastT = "", lastB = "", lastS = "";
    private final Runnable collapse = () -> collapseNow();
    private void collapseNow() { forceCard = false; showCard(lastT, lastB, lastRoute, lastItem, lastNid, lastS); }
    private int bx = -1, by = -1;
    private String lastRoute = "", lastItem;
    private int lastNid;

    private static final int FG_ID = 771000;
    private static final String CH_FG = "alsaer_float_fg_v1";

    /** الخدمة الأمامية إلزامية عند التشغيل من الخلفية؛ تُستدعى فورًا قبل أي عمل. */
    private void startFg() {
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                android.app.NotificationManager nm = (android.app.NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (nm != null && nm.getNotificationChannel(CH_FG) == null) {
                    android.app.NotificationChannel ch = new android.app.NotificationChannel(CH_FG, NativeStrings.get(this, "ch_service_name"), android.app.NotificationManager.IMPORTANCE_MIN);
                    nm.createNotificationChannel(ch);
                }
            }
            Intent open = new Intent(this, MainActivity.class);
            android.app.PendingIntent content = android.app.PendingIntent.getActivity(this, FG_ID, open, android.app.PendingIntent.FLAG_UPDATE_CURRENT | AlarmScheduler.immutable());
            androidx.core.app.NotificationCompat.Builder b = new androidx.core.app.NotificationCompat.Builder(this, CH_FG)
                    .setSmallIcon(R.drawable.ic_stat_alsaer)
                    .setContentTitle(NativeStrings.get(this, "app_name"))
                    .setContentText(NativeStrings.get(this, "floating_reminder"))
                    .setContentIntent(content)
                    .setPriority(androidx.core.app.NotificationCompat.PRIORITY_MIN)
                    .setOngoing(true);
            startForeground(FG_ID, b.build());
        } catch (Throwable t) { FloatLog.err(this, NativeStrings.get(this, "fg_service_start"), String.valueOf(t)); }
    }

    /** إيقاظ قصير + إضاءة الشاشة عند وصول التذكير والشاشة مطفأة. */
    private void wake() {
        try {
            android.os.PowerManager pm = (android.os.PowerManager) getSystemService(POWER_SERVICE);
            if (pm == null) return;
            wl = pm.newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "alsaer:float");
            wl.acquire(90_000L);
        } catch (Throwable t) { FloatLog.err(this, NativeStrings.get(this, "wake_device"), String.valueOf(t)); }
    }

    private void releaseWake() {
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Throwable ignored) { }
        wl = null;
    }

    @Override public int onStartCommand(Intent in, int flags, int startId) {
        startFg();
        if (in == null) { hardStop.run(); return START_NOT_STICKY; }
        if (!canDraw(this)) {
            FloatLog.err(this, NativeStrings.get(this, "open_window"), NativeStrings.get(this, "overlay_perm_missing"));
            FloatLog.fallback(this, in.getStringExtra(EXTRA_TITLE), in.getStringExtra(EXTRA_BODY));
            hardStop.run();
            return START_NOT_STICKY;
        }
        wake();
        feed = in.getBooleanExtra("feed", false); forceCard = false; fresh = true;
        showCard(in.getStringExtra(EXTRA_TITLE), in.getStringExtra(EXTRA_BODY), in.getStringExtra(EXTRA_ROUTE), in.getStringExtra(EXTRA_ITEM), in.getIntExtra(EXTRA_NID, 0), in.getStringExtra("src"));
        h.removeCallbacks(hardStop); h.postDelayed(hardStop, 60_000L); // إغلاق إجباري خلال ٦٠ ثانية
        return START_NOT_STICKY;
    }

    private void showCard(String title, String body, String route, String itemJson, int nid, String src) {
        dismissView();
        try {
            wm = (WindowManager) getSystemService(WINDOW_SERVICE);
            int type = Build.VERSION.SDK_INT >= 26 ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE;
            WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.WRAP_CONTENT, type,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED,
                    PixelFormat.TRANSLUCENT);
            st = style(this); pal = palette(st.optString("theme", "green"));
            String sz = st.optString("size", "m"); sc = "s".equals(sz) ? 0.88f : "l".equals(sz) ? 1.2f : 1f;
            String pos = st.optString("pos", "top");
            lastT = title == null ? "" : title; lastB = body == null ? "" : body; lastS = src == null ? "" : src;
            if ("bubble".equals(st.optString("design", "card")) && fresh) { forceCard = true; }
            fresh = false;
            if ("bubble".equals(st.optString("design", "card")) && !forceCard) { showBubble(title, body, route, itemJson, nid, src); return; }
            if ("mini".equals(st.optString("design", "card")) || forceCard) lp.width = Math.min(getResources().getDisplayMetrics().widthPixels - dp(24), dp(300));
            lp.gravity = ("center".equals(pos) ? Gravity.CENTER_VERTICAL : "bottom".equals(pos) ? Gravity.BOTTOM : Gravity.TOP) | Gravity.CENTER_HORIZONTAL;
            boolean bar = "bar".equals(st.optString("design", "card"));
            if (forceCard) { pos = "top"; lp.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL; lp.y = Math.max(dp(24), by); }
            else lp.y = "center".equals(pos) ? 0 : "bottom".equals(pos) ? (bar ? 0 : dp(80)) : (bar ? 0 : dp(36));
            lp.x = 0;
            lastRoute = route == null ? "" : route; lastItem = itemJson; lastNid = nid;
            card = build(title == null ? NativeStrings.get(this, "app_name") : title, body == null ? "" : body, lastRoute, itemJson, nid, src == null ? "" : src);
            wm.addView(card, lp);
            animIn(card, pos);
            if (!forceCard) buzz(16);
            h.removeCallbacks(autoClose); h.removeCallbacks(collapse);
            int secs = st.optInt("secs", 15);
            if (forceCard && "bubble".equals(st.optString("design", "card"))) h.postDelayed(collapse, Math.max(8, secs) * 1000L);
            else if (secs > 0) h.postDelayed(autoClose, smartMs(secs));
        } catch (Throwable t) {
            FloatLog.err(this, NativeStrings.get(this, "show_float_card"), String.valueOf(t));
            FloatLog.fallback(this, lastT, lastB);
            hardStop.run();
        }
    }


    /** فقاعة عائمة صغيرة قابلة للسحب (مثل فقاعات المحادثة): لمسة = توسيع البطاقة المصغّرة، سحب = تحريك. */
    private void showBubble(final String title, final String body, final String route, final String itemJson, final int nid, final String src) {
        try {
            forceCard = false;
            final int sz = dp((int) (54 * sc));
            final int sw = getResources().getDisplayMetrics().widthPixels;
            if (bx < 0) { bx = sw - sz - dp(8); by = dp(170); }
            final WindowManager.LayoutParams lp = new WindowManager.LayoutParams(sz, sz,
                    Build.VERSION.SDK_INT >= 26 ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.TOP | Gravity.LEFT; lp.x = bx; lp.y = by;
            final TextView b = new TextView(this);
            b.setText("\u263E"); b.setGravity(Gravity.CENTER); b.setTextSize(24 * sc);
            b.setTextColor(Color.parseColor(pal[2]));
            GradientDrawable g = new GradientDrawable();
            g.setShape(GradientDrawable.OVAL);
            g.setColor((Color.parseColor(pal[0]) & 0x00FFFFFF) | (Math.max(60, Math.min(100, st.optInt("alpha", 95))) * 255 / 100 << 24));
            g.setStroke(dp(2), Color.parseColor(pal[1]));
            b.setBackground(g); b.setElevation(dp(6));
            final int[] dn = {0, 0, 0, 0}; // rawX, rawY, startX, startY
            final boolean[] mv = {false};
            final Runnable lpress = () -> { buzz(28); dismiss(); };
            b.setOnTouchListener((v, ev) -> {
                switch (ev.getActionMasked()) {
                    case android.view.MotionEvent.ACTION_DOWN: dn[0] = (int) ev.getRawX(); dn[1] = (int) ev.getRawY(); dn[2] = lp.x; dn[3] = lp.y; mv[0] = false; h.removeCallbacks(autoClose); h.postDelayed(lpress, 650); v.animate().scaleX(0.9f).scaleY(0.9f).setDuration(90).start(); buzz(8); return true;
                    case android.view.MotionEvent.ACTION_MOVE: {
                        int ddx = (int) ev.getRawX() - dn[0], ddy = (int) ev.getRawY() - dn[1];
                        if (Math.abs(ddx) > dp(6) || Math.abs(ddy) > dp(6)) { if (!mv[0]) h.removeCallbacks(lpress); mv[0] = true; }
                        if (mv[0]) { lp.x = dn[2] + ddx; lp.y = Math.max(0, dn[3] + ddy); try { wm.updateViewLayout(v, lp); } catch (Throwable ignored) { } }
                        return true; }
                    case android.view.MotionEvent.ACTION_UP: {
                        h.removeCallbacks(lpress); v.animate().scaleX(1f).scaleY(1f).setDuration(120).start();
                        if (mv[0]) { buzz(12); // التصاق بأقرب حافة
                            lp.x = lp.x + sz / 2 < sw / 2 ? dp(6) : sw - sz - dp(6);
                            bx = lp.x; by = lp.y;
                            try { wm.updateViewLayout(v, lp); } catch (Throwable ignored) { }
                            int secs = st.optInt("secs", 15); if (secs > 0) h.postDelayed(autoClose, secs * 1000L);
                        } else {
                            bx = lp.x; by = lp.y; forceCard = true; buzz(18);
                            showCard(title, body, route, itemJson, nid, src);
                        }
                        return true; }
                    case android.view.MotionEvent.ACTION_CANCEL: h.removeCallbacks(lpress); v.animate().scaleX(1f).scaleY(1f).setDuration(120).start(); return true;
                }
                return false; });
            card = b;
            wm.addView(b, lp);
            b.setAlpha(0f); b.setScaleX(0.3f); b.setScaleY(0.3f);
            b.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(260).setInterpolator(new android.view.animation.OvershootInterpolator(1.8f)).withEndAction(() -> b.animate().scaleX(1.14f).scaleY(1.14f).setDuration(420).withEndAction(() -> b.animate().scaleX(1f).scaleY(1f).setDuration(420).start()).start()).start(); buzz(14);
            h.removeCallbacks(autoClose);
            int secs = st.optInt("secs", 15); if (secs > 0) h.postDelayed(autoClose, secs * 1000L);
        } catch (Throwable t) {
            FloatLog.err(this, NativeStrings.get(this, "show_float_bubble"), String.valueOf(t));
            FloatLog.fallback(this, title, body);
            hardStop.run();
        }
    }

    /** اهتزاز لطيف جدًا (يحترم خيار haptic في إعدادات الشكل). */
    private void buzz(int ms) {
        try {
            if (st != null && !st.optBoolean("haptic", true)) return;
            android.os.Vibrator vb = (android.os.Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (vb == null || !vb.hasVibrator()) return;
            if (Build.VERSION.SDK_INT >= 26) vb.vibrate(android.os.VibrationEffect.createOneShot(ms, 55));
            else vb.vibrate(ms);
        } catch (Throwable ignored) { }
    }

    /** مدة ذكية: لا تُغلق البطاقة قبل أن تُقرأ (٥ ثوانٍ + ٠٫٤ ثانية لكل كلمة) وبحد أقصى ٤٥ ثانية. */
    private long smartMs(int secs) {
        if (secs <= 0) return 0;
        int words = lastB == null || lastB.trim().isEmpty() ? 0 : lastB.trim().split("\\s+").length;
        return Math.min(45, Math.max(secs, 5 + (int) Math.ceil(words * 0.4))) * 1000L;
    }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + 0.5f); }

    /** حركة الظهور: none | fade | slide | pop | bounce | zoom | flip | rise */
    private void animIn(View v, String pos) {
        String a = st.optString("anim", "slide");
        long ms = Math.max(120, Math.min(1200, st.optInt("animMs", 350)));
        float d = getResources().getDisplayMetrics().density;
        v.setAlpha(1f); v.setTranslationX(0); v.setTranslationY(0); v.setScaleX(1f); v.setScaleY(1f); v.setRotationX(0);
        boolean bottom = "bottom".equals(pos);
        switch (a) {
            case "none": return;
            case "fade":
                v.setAlpha(0f);
                v.animate().alpha(1f).setDuration(ms).setInterpolator(new android.view.animation.DecelerateInterpolator()).start();
                return;
            case "pop":
                v.setAlpha(0f); v.setScaleX(0.6f); v.setScaleY(0.6f);
                v.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(ms).setInterpolator(new android.view.animation.OvershootInterpolator(1.6f)).start();
                return;
            case "bounce":
                v.setAlpha(0f); v.setTranslationY((bottom ? 1 : -1) * 200 * d);
                v.animate().alpha(1f).translationY(0f).setDuration(ms + 250).setInterpolator(new android.view.animation.BounceInterpolator()).start();
                return;
            case "zoom":
                v.setAlpha(0f); v.setScaleX(0.2f); v.setScaleY(0.2f);
                v.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(ms).setInterpolator(new android.view.animation.DecelerateInterpolator()).start();
                return;
            case "flip":
                v.setCameraDistance(8000 * d); v.setPivotY(0f); v.setAlpha(0f); v.setRotationX(-90f);
                v.animate().alpha(1f).rotationX(0f).setDuration(ms + 100).setInterpolator(new android.view.animation.DecelerateInterpolator()).start();
                return;
            case "rise":
                v.setAlpha(0f); v.setTranslationY(36 * d);
                v.animate().alpha(1f).translationY(0f).setDuration(ms).setInterpolator(new android.view.animation.DecelerateInterpolator()).start();
                return;
            default: // slide
                v.setAlpha(0f);
                if ("center".equals(pos)) v.setTranslationX(380 * d); else v.setTranslationY((bottom ? 1 : -1) * 170 * d);
                v.animate().alpha(1f).translationX(0f).translationY(0f).setDuration(ms).setInterpolator(new android.view.animation.DecelerateInterpolator(1.4f)).start();
        }
    }

    private void animOut(View v, Runnable end) {
        if ("none".equals(st == null ? "slide" : st.optString("anim", "slide"))) { end.run(); return; }
        v.animate().alpha(0f).translationYBy(-18 * getResources().getDisplayMetrics().density).setDuration(180).withEndAction(end).start();
    }

    private View build(String title, String body, final String route, final String itemJson, final int nid, String src) {
        String design = st.optString("design", "card");
        final boolean mini = "mini".equals(design) || forceCard, pill = "pill".equals(design), strip = "strip".equals(design), quote = "quote".equals(design), bar = "bar".equals(design);
        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        if (mini) col.setPadding(dp(14), dp(10), dp(14), dp(10));
        else if (pill) col.setPadding(dp(20), dp(10), dp(20), dp(10));
        else if (quote) col.setPadding(dp(24), dp(18), dp(24), dp(16));
        else col.setPadding(dp(18), dp(14), dp(18), dp(14));
        int a = Math.max(20, Math.min(100, st.optInt("alpha", 95))) * 255 / 100;
        int c1 = (Color.parseColor(pal[0]) & 0x00FFFFFF) | (a << 24);
        GradientDrawable bg = new GradientDrawable();
        if (pal.length > 7 && pal[7] != null) {
            int c2 = (Color.parseColor(pal[7]) & 0x00FFFFFF) | (a << 24);
            bg.setOrientation(GradientDrawable.Orientation.TL_BR);
            bg.setColors(new int[]{c1, c2});
        } else bg.setColor(c1);
        int rad = mini ? 18 : pill ? 60 : bar ? 0 : quote ? Math.max(20, st.optInt("radius", 20)) : Math.max(0, Math.min(36, st.optInt("radius", 20)));
        bg.setCornerRadius(dp(rad));
        if (!bar) bg.setStroke(dp(1), Color.parseColor(pal[1]));

        TextView t = new TextView(this);
        t.setText(title);
        t.setTextColor(Color.parseColor(pal[2]));
        t.setTextSize((mini ? 13 : pill ? 13 : quote ? 14 : 17) * sc);
        t.setTypeface(t.getTypeface(), android.graphics.Typeface.BOLD);
        TextView b = new TextView(this);
        b.setText(body);
        b.setTextColor(Color.parseColor(pal[3]));
        b.setTextSize((mini ? 14 : quote ? 19 : pill ? 14 : 15) * sc);
        b.setLineSpacing(0, quote ? 1.25f : 1.1f);
        b.setPadding(0, dp(4), 0, 0);
        if (pill || mini) { b.setMaxLines(mini ? 4 : 2); b.setEllipsize(android.text.TextUtils.TruncateAt.END); }
        TextView x = new TextView(this);
        x.setText(NativeStrings.get(this, "close"));
        x.setTextColor(Color.parseColor(pal[4]));
        x.setTextSize(13 * sc);
        x.setPadding(0, dp(8), 0, 0);
        x.setOnClickListener(v -> dismiss());
        TextView sr = null;
        if (src != null && src.length() > 0) {
            sr = new TextView(this);
            sr.setText(src);
            sr.setTextColor(Color.parseColor(pal[4]));
            sr.setTextSize(12 * sc);
            sr.setPadding(0, dp(6), 0, 0);
        }
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, dp(10), 0, 0);
        org.json.JSONObject itj = null;
        try { if (itemJson != null) itj = new org.json.JSONObject(itemJson); } catch (Throwable ignored) { }
        final org.json.JSONObject actJ = itj == null ? null : itj.optJSONObject("act");
        if (feed) {
            row.addView(chip(NativeStrings.get(this, "next"), true, v -> {
                org.json.JSONObject nx = FloatFeed.pick(this, FloatFeed.cfg(this));
                showCard(nx.optString("t", NativeStrings.get(this, "app_name")), nx.optString("b", ""), "", null, 0, FloatFeed.cfg(this).optBoolean("src", false) ? nx.optString("s", "") : "");
            }));
            final String cp = body;
            row.addView(chip(NativeStrings.get(this, "copy"), false, v -> {
                try { ((android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(android.content.ClipData.newPlainText("alsaer", cp)); } catch (Throwable ignored) { }
                dismiss();
            }));
        } else {
            if (actJ != null) row.addView(chip(actJ.optString("l", NativeStrings.get(this, "done")), true, v -> {
                Intent d = new Intent(this, ActionReceiver.class).setAction(AlarmScheduler.ACTION_DONE);
                d.putExtra("key", actJ.optString("k")); d.putExtra("nid", nid); sendBroadcast(d); ((TextView) v).setText("\u2713 \u062A\u0645"); buzz(30); h.removeCallbacks(autoClose); h.postDelayed(() -> dismiss(), 450); }));
            if (itemJson != null) row.addView(chip(NativeStrings.get(this, "in_10_min"), false, v -> {
                Intent s = new Intent(this, ActionReceiver.class).setAction(AlarmScheduler.ACTION_SNOOZE);
                s.putExtra("item", itemJson); s.putExtra("nid", nid); sendBroadcast(s); ((TextView) v).setText("\u23F1 \u0633\u0646\u0630\u0643\u0651\u0631\u0643"); buzz(22); h.removeCallbacks(autoClose); h.postDelayed(() -> dismiss(), 600); }));
        }
        if (forceCard) row.addView(chip(NativeStrings.get(this, "minimize"), false, v -> { h.removeCallbacks(collapse); collapse.run(); }));
        if (quote) {
            TextView q = new TextView(this);
            q.setText("❝");
            q.setTextColor(Color.parseColor(pal[2]));
            q.setTextSize(34 * sc);
            q.setGravity(Gravity.CENTER);
            col.addView(q, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
            b.setGravity(Gravity.CENTER); t.setGravity(Gravity.CENTER); x.setGravity(Gravity.CENTER);
            col.addView(b);
            t.setPadding(0, dp(8), 0, 0);
            col.addView(t);
        } else {
            col.addView(t);
            col.addView(b);
        }
        if (sr != null) { if (quote) sr.setGravity(Gravity.CENTER); col.addView(sr); }
        if (!pill && (forceCard || st.optBoolean("btn", true)) && row.getChildCount() > 0) col.addView(row);
        if (!pill && !mini && !forceCard) col.addView(x);

        View box = col;
        if (strip) {
            LinearLayout hz = new LinearLayout(this);
            hz.setOrientation(LinearLayout.HORIZONTAL);
            hz.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
            View acc = new View(this);
            acc.setBackgroundColor(Color.parseColor(pal[2]));
            hz.addView(acc, new LinearLayout.LayoutParams(dp(6), LinearLayout.LayoutParams.MATCH_PARENT));
            hz.addView(col, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
            box = hz;
        }
        box.setBackground(bg);
        if (strip) box.setClipToOutline(true);
        box.setOnClickListener(v -> {
            try {
                Intent open = new Intent(FloatingReminderService.this, MainActivity.class);
                open.putExtra("alsaer_route", route);
                open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(open);
            } catch (Throwable ignored) { }
            dismiss();
        });
        // اسحب البطاقة يمينًا أو يسارًا لإغلاقها
        final float[] dx = {0, 0, 0, 0};
        final boolean topPos = !"bottom".equals(st.optString("pos", "top"));
        final boolean[] axis = {false, false}; // [0]=تحرّك أفقيًا [1]=تحرّك عموديًا
        box.setOnTouchListener((v, ev) -> {
            switch (ev.getActionMasked()) {
                case android.view.MotionEvent.ACTION_DOWN:
                    dx[0] = ev.getRawX(); dx[2] = ev.getRawY(); dx[1] = 0; dx[3] = 0; axis[0] = axis[1] = false;
                    h.removeCallbacks(autoClose); h.removeCallbacks(collapse);
                    v.animate().scaleX(0.985f).scaleY(0.985f).setDuration(90).start();
                    return false;
                case android.view.MotionEvent.ACTION_MOVE: {
                    dx[1] = ev.getRawX() - dx[0]; dx[3] = ev.getRawY() - dx[2];
                    if (!axis[0] && !axis[1]) { if (Math.abs(dx[1]) > dp(8)) axis[0] = true; else if (Math.abs(dx[3]) > dp(10)) axis[1] = true; }
                    if (axis[0]) { v.setTranslationX(dx[1]); v.setAlpha(Math.max(0.2f, 1 - Math.abs(dx[1]) / (v.getWidth() + 1))); return true; }
                    if (axis[1]) { float ty = topPos ? Math.min(0, dx[3]) : Math.max(0, dx[3]); v.setTranslationY(ty); v.setAlpha(Math.max(0.2f, 1 - Math.abs(ty) / (v.getHeight() * 1.5f + 1))); return true; }
                    return false; }
                case android.view.MotionEvent.ACTION_UP: case android.view.MotionEvent.ACTION_CANCEL: {
                    v.animate().scaleX(1f).scaleY(1f).setDuration(120).start();
                    boolean moved = axis[0] || axis[1];
                    if ((axis[0] && Math.abs(dx[1]) > v.getWidth() * 0.35f) || (axis[1] && Math.abs(v.getTranslationY()) > v.getHeight() * 0.5f)) { buzz(14); dismiss(); return true; }
                    v.setTranslationX(0); v.setTranslationY(0); v.setAlpha(1);
                    int secs = st.optInt("secs", 15);
                    if (forceCard && "bubble".equals(st.optString("design", "card"))) h.postDelayed(collapse, 8000L);
                    else if (secs > 0) h.postDelayed(autoClose, 6000L);
                    return moved; }
            }
            return false; });
        return new FrameHolder(this, box, bar ? 0 : dp(12));
    }

    /** غلاف يضيف هامشًا حول البطاقة. */
    private static class FrameHolder extends LinearLayout {
        FrameHolder(Context c, View inner, int m) {
            super(c);
            setPadding(m, 0, m, 0);
            addView(inner, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        }
    }

    private TextView chip(String label, boolean primary, View.OnClickListener l) {
        TextView c = new TextView(this);
        c.setText(label);
        c.setTextSize(14 * sc);
        c.setGravity(Gravity.CENTER);
        c.setPadding(dp(14), dp(8), dp(14), dp(8));
        c.setTextColor(primary ? Color.parseColor(pal[6]) : Color.parseColor(pal[5]));
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(14));
        if (primary) g.setColor(Color.parseColor(pal[5])); else g.setStroke(dp(1), Color.parseColor(pal[5]));
        c.setBackground(g);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMarginEnd(dp(8));
        c.setLayoutParams(lp);
        c.setOnClickListener(v -> { buzz(12); l.onClick(v); });
        c.setOnTouchListener((v, ev) -> {
            int a2 = ev.getActionMasked();
            if (a2 == android.view.MotionEvent.ACTION_DOWN) v.animate().scaleX(0.93f).scaleY(0.93f).setDuration(70).start();
            else if (a2 == android.view.MotionEvent.ACTION_UP || a2 == android.view.MotionEvent.ACTION_CANCEL) v.animate().scaleX(1f).scaleY(1f).setDuration(110).start();
            return false; });
        return c;
    }

    private void dismissView() {
        h.removeCallbacks(autoClose); h.removeCallbacks(collapse);
        try { if (card != null && wm != null) wm.removeView(card); } catch (Throwable ignored) { }
        card = null;
    }

    private void dismiss() {
        if (card == null) { releaseWake(); try { stopForeground(true); } catch (Throwable ignored) { } stopSelf(); return; }
        final View v = card; card = null;
        h.removeCallbacks(autoClose); h.removeCallbacks(collapse);
        animOut(v, () -> { try { if (wm != null) wm.removeView(v); } catch (Throwable ignored) { }
            if (card == null) { releaseWake(); try { stopForeground(true); } catch (Throwable ignored) { } stopSelf(); } });
    }

    @Override public void onDestroy() {
        dismissView(); releaseWake();
        try { stopForeground(true); } catch (Throwable ignored) { }
        super.onDestroy();
    }
}
