package com.ahmedalajmi.alsaer;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;

/** جدولة مستقلة للنوافذ العائمة (بذاتها، منفصلة عن الإشعارات): كل N دقيقة / على مدار 24 ساعة / أوقات محددة. */
public final class FloatFeed {
    static final String PREF = "alsaer_float";
    static final int RC = 770001;
    static final String ACTION = "com.ahmedalajmi.alsaer.FLOATFEED";
    static final String ACTION_SNOOZE_FLOAT = "com.ahmedalajmi.alsaer.FLOATFEED_SNOOZE";

    private FloatFeed() {}

    static SharedPreferences sp(Context c) { return c.getApplicationContext().getSharedPreferences(PREF, Context.MODE_PRIVATE); }

    static JSONObject defaults() {
        JSONObject o = new JSONObject();
        try {
            o.put("mode", "interval"); o.put("every", 120); o.put("from", "07:00"); o.put("to", "22:00"); o.put("all", false);
            o.put("times", new JSONArray().put("08:00").put("13:00").put("20:00"));
            o.put("days", new JSONArray());
            o.put("types", new JSONArray().put("ayah").put("hadith").put("dhikr").put("dua").put("tip"));
            o.put("custom", new JSONArray());
            o.put("src", false); o.put("linked", false); o.put("order", "rand");
        } catch (Exception ignored) {}
        return o;
    }

    static JSONObject cfg(Context c) {
        JSONObject o = defaults();
        try {
            JSONObject s = new JSONObject(sp(c).getString("feed", "{}"));
            java.util.Iterator<String> k = s.keys();
            while (k.hasNext()) { String n = k.next(); o.put(n, s.get(n)); }
        } catch (Throwable ignored) {}
        return o;
    }

    static void setCfg(Context c, String json) {
        try { new JSONObject(json); sp(c).edit().putString("feed", json).apply(); } catch (Throwable ignored) { return; }
        schedule(c);
    }

    static void setPool(Context c, String json) {
        try { new JSONArray(json); sp(c).edit().putString("pool", json).apply(); } catch (Throwable ignored) {}
    }

    static int poolSize(Context c) {
        try { return new JSONArray(sp(c).getString("pool", "[]")).length(); } catch (Throwable t) { return 0; }
    }

    static boolean linked(Context c) { return cfg(c).optBoolean("linked", false); }

    static int hm(String s, int def) {
        try {
            String[] p = s.split(":");
            return Math.max(0, Math.min(1439, Integer.parseInt(p[0].trim()) * 60 + Integer.parseInt(p[1].trim())));
        } catch (Throwable t) { return def; }
    }

    /** دقائق اليوم التي تظهر فيها النافذة. */
    static List<Integer> slots(JSONObject cfg) {
        List<Integer> out = new ArrayList<>();
        if ("times".equals(cfg.optString("mode"))) {
            JSONArray a = cfg.optJSONArray("times");
            if (a != null) for (int i = 0; i < a.length(); i++) out.add(hm(a.optString(i), 480));
        } else {
            int every = Math.max(5, Math.min(1440, cfg.optInt("every", 120)));
            int from = 0, to = 1439;
            if (!cfg.optBoolean("all", false)) {
                from = hm(cfg.optString("from", "07:00"), 420);
                to = hm(cfg.optString("to", "22:00"), 1320);
                if (to <= from) to += 1440;
            }
            for (int m = from; m <= to && out.size() < 300; m += every) out.add(m);
        }
        Collections.sort(out);
        return out;
    }

    /** أول موعد بعد after (0 = لا يوجد). */
    static long next(JSONObject cfg, long after) {
        List<Integer> sl = slots(cfg);
        if (sl.isEmpty()) return 0;
        JSONArray days = cfg.optJSONArray("days");
        Calendar base = Calendar.getInstance();
        base.setTimeInMillis(after);
        base.set(Calendar.HOUR_OF_DAY, 0); base.set(Calendar.MINUTE, 0); base.set(Calendar.SECOND, 0); base.set(Calendar.MILLISECOND, 0);
        for (int d = -1; d < 9; d++) {
            Calendar day = (Calendar) base.clone();
            day.add(Calendar.DAY_OF_YEAR, d);
            if (!AlarmScheduler.dayAllowed(days, day.get(Calendar.DAY_OF_WEEK) - 1)) continue;
            for (int m : sl) {
                Calendar t = (Calendar) day.clone();
                t.add(Calendar.MINUTE, m);
                if (t.getTimeInMillis() > after) return t.getTimeInMillis();
            }
        }
        return 0;
    }

    static String upcoming(Context c, int n) {
        JSONArray out = new JSONArray();
        JSONObject cf = cfg(c);
        long t = System.currentTimeMillis();
        for (int i = 0; i < Math.max(1, Math.min(60, n)); i++) {
            t = next(cf, t);
            if (t <= 0) break;
            out.put(t);
        }
        return out.toString();
    }

    static PendingIntent pi(Context c, int flags) {
        Intent in = new Intent(c, AlarmReceiver.class).setAction(ACTION);
        in.putExtra("kind", "float");
        return PendingIntent.getBroadcast(c, RC, in, flags | AlarmScheduler.immutable());
    }

    static void cancel(Context c) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            PendingIntent p = pi(c, PendingIntent.FLAG_NO_CREATE);
            if (p != null) { am.cancel(p); p.cancel(); }
        } catch (Throwable ignored) {}
    }

    /** يضبط المنبّه التالي للنوافذ العائمة (أو يلغيه إن كانت متوقفة). يعيد موعده. */
    static synchronized long schedule(Context c) {
        cancel(c);
        if (!FloatingReminderService.enabled(c)) return 0;
        if (!FloatingReminderService.canDraw(c)) {
            FloatLog.err(c, NativeStrings.get(c, "schedule_floats"), NativeStrings.get(c, "overlay_perm_missing"));
            return 0;
        }
        long at = next(cfg(c), System.currentTimeMillis());
        if (at <= 0) return 0;
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent p = pi(c, PendingIntent.FLAG_UPDATE_CURRENT);
        boolean exact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
        try {
            if (Build.VERSION.SDK_INT >= 23) {
                if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            } else am.setExact(AlarmManager.RTC_WAKEUP, at, p);
        } catch (SecurityException e) {
            if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            else am.set(AlarmManager.RTC_WAKEUP, at, p);
        }
        sp(c).edit().putLong("nextAt", at).apply();
        return at;
    }

    /** عند وصول الموعد. */
    static void fire(Context c) {
        try {
            if (FloatingReminderService.enabled(c) && FloatingReminderService.pausedUntil(c) <= System.currentTimeMillis()) {
                show(c, false);
            }
        } catch (Throwable t) {
            FloatLog.err(c, NativeStrings.get(c, "float_launch"), String.valueOf(t));
        }
        schedule(c);
    }

    /** تأجيل لمرة واحدة (من زر «ذكّرني» في الإشعار البديل): يطلق النافذة بعد ١٠ دقائق. */
    static void snoozeOnce(Context c) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            Intent in = new Intent(c, AlarmReceiver.class).setAction(ACTION);
            in.putExtra("kind", "float");
            PendingIntent p = PendingIntent.getBroadcast(c, RC + 1, in, PendingIntent.FLAG_UPDATE_CURRENT | AlarmScheduler.immutable());
            long at = System.currentTimeMillis() + AlarmScheduler.SNOOZE_MS;
            boolean exact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
            if (Build.VERSION.SDK_INT >= 23) {
                if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            } else am.setExact(AlarmManager.RTC_WAKEUP, at, p);
        } catch (Throwable t) { FloatLog.err(c, NativeStrings.get(c, "snooze_float"), String.valueOf(t)); }
    }

    /** يعرض عنصرًا من المحتوى؛ preview=true يتجاوز التفعيل والإيقاف المؤقت (للمعاينة). */
    static void show(Context c, boolean preview) {
        JSONObject cf = cfg(c);
        JSONObject it = pick(c, cf);
        String title = it.optString("t", NativeStrings.get(c, "app_name"));
        String body = it.optString("b", "");
        if (!FloatingReminderService.canDraw(c)) {
            FloatLog.err(c, NativeStrings.get(c, "show_float_window"), NativeStrings.get(c, "overlay_perm_missing"));
            FloatLog.fallback(c, title, body);
            return;
        }
        Intent i = new Intent(c, FloatingReminderService.class);
        i.putExtra(FloatingReminderService.EXTRA_TITLE, title);
        i.putExtra(FloatingReminderService.EXTRA_BODY, body);
        i.putExtra("feed", true);
        i.putExtra("src", cf.optBoolean("src", false) ? it.optString("s", "") : "");
        FloatingReminderService.startOverlay(c, i);
        sp(c).edit().putLong("last", System.currentTimeMillis()).apply();
    }

    static JSONObject pick(Context c, JSONObject cf) {
        List<JSONObject> list = new ArrayList<>();
        JSONArray types = cf.optJSONArray("types");
        try {
            JSONArray pool = new JSONArray(sp(c).getString("pool", "[]"));
            for (int i = 0; i < pool.length(); i++) {
                JSONObject o = pool.optJSONObject(i);
                if (o == null || o.optString("b").length() == 0) continue;
                if (types == null || has(types, o.optString("k"))) list.add(o);
            }
        } catch (Throwable ignored) {}
        JSONArray cu = cf.optJSONArray("custom");
        if (cu != null && (types == null || has(types, "custom"))) {
            for (int i = 0; i < cu.length(); i++) {
                String t = cu.optString(i);
                if (t.length() == 0) continue;
                try { JSONObject o = new JSONObject(); o.put("k", "custom"); o.put("t", NativeStrings.get(c, "reminder")); o.put("b", t); o.put("s", ""); list.add(o); } catch (Exception ignored) {}
            }
        }
        if (list.isEmpty()) {
            JSONObject o = new JSONObject();
            try { o.put("t", NativeStrings.get(c, "dhikr")); o.put("b", NativeStrings.get(c, "dhikr_subhanallah")); o.put("s", ""); } catch (Exception ignored) {}
            return o;
        }
        SharedPreferences s = sp(c);
        String lastB = s.getString("lastB", "");
        int idx;
        if ("seq".equals(cf.optString("order"))) {
            idx = s.getInt("seq", 0) % list.size();
            s.edit().putInt("seq", idx + 1).apply();
        } else {
            idx = (int) (Math.random() * list.size());
            if (list.size() > 1 && list.get(idx).optString("b").equals(lastB)) idx = (idx + 1) % list.size();
        }
        JSONObject r = list.get(idx);
        s.edit().putString("lastB", r.optString("b")).apply();
        return r;
    }

    static boolean has(JSONArray a, String v) {
        for (int i = 0; i < a.length(); i++) if (v.equals(a.optString(i))) return true;
        return false;
    }
}
