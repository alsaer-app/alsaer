package com.ahmedalajmi.alsaer;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

/** جدولة التنبيهات وعرض الإشعارات (تعمل والتطبيق مغلق). */
public final class AlarmScheduler {
    static final String PREFS = "alsaer_notif";
    static final String K_ITEMS = "items", K_IDS = "ids", K_PENDING = "pending", K_ROUTE = "route", K_SOUND = "sound";
    static final String CH_CHIME = "alsaer_reminders_v7";
    static final String CH_SILENT = "alsaer_reminders_silent_v7";
    static final String CH_SYSTEM = "alsaer_reminders_system_v7";
    static final String ACTION_ALARM = "com.ahmedalajmi.alsaer.ALARM";
    static final String ACTION_DONE = "com.ahmedalajmi.alsaer.DONE";
    static final String ACTION_SNOOZE = "com.ahmedalajmi.alsaer.SNOOZE";
    static final long SNOOZE_MS = 10L * 60L * 1000L;

    private AlarmScheduler() {}

    static SharedPreferences prefs(Context c) {
        return c.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static int code(String id) { return id.hashCode() & 0x7fffffff; }

    static int immutable() { return Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0; }

    /* ---------- الجدول ---------- */

    public static synchronized void saveAndSchedule(Context c, String json) {
        prefs(c).edit().putString(K_ITEMS, json == null ? "[]" : json).apply();
        scheduleAll(c);
    }

    public static synchronized void scheduleAll(Context c) {
        cancelAll(c);
        JSONArray arr;
        try { arr = new JSONArray(prefs(c).getString(K_ITEMS, "[]")); } catch (Exception e) { return; }
        JSONArray ids = new JSONArray();
        long now = System.currentTimeMillis();
        for (int i = 0; i < arr.length(); i++) {
            JSONObject it = arr.optJSONObject(i);
            if (it == null) continue;
            long at = nextTrigger(it, now);
            if (at <= 0) continue;
            scheduleAt(c, it, at, false);
            ids.put(code(it.optString("id")));
        }
        prefs(c).edit().putString(K_IDS, ids.toString()).apply();
    }

    static void cancelAll(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        JSONArray ids;
        try { ids = new JSONArray(prefs(c).getString(K_IDS, "[]")); } catch (Exception e) { return; }
        for (int i = 0; i < ids.length(); i++) {
            Intent in = new Intent(c, AlarmReceiver.class).setAction(ACTION_ALARM);
            PendingIntent pi = PendingIntent.getBroadcast(c, ids.optInt(i), in,
                    PendingIntent.FLAG_NO_CREATE | immutable());
            if (pi != null) { am.cancel(pi); pi.cancel(); }
        }
    }

    /** الموعد التالي بعد الوقت now (0 = لا يوجد). dow: 0=الأحد ... 6=السبت (مثل getDay في JS). */
    static long nextTrigger(JSONObject it, long now) {
        long at = it.optLong("at", 0);
        if (at > 0) return at > now ? at : 0;
        int h = it.optInt("h", -1), m = it.optInt("m", 0);
        if (h < 0) return 0;
        JSONArray dow = it.optJSONArray("dow");
        Calendar base = Calendar.getInstance();
        base.setTimeInMillis(now);
        for (int d = 0; d < 8; d++) {
            Calendar c2 = (Calendar) base.clone();
            c2.add(Calendar.DAY_OF_YEAR, d);
            c2.set(Calendar.HOUR_OF_DAY, h);
            c2.set(Calendar.MINUTE, m);
            c2.set(Calendar.SECOND, 0);
            c2.set(Calendar.MILLISECOND, 0);
            if (c2.getTimeInMillis() <= now) continue;
            if (dayAllowed(dow, c2.get(Calendar.DAY_OF_WEEK) - 1)) return c2.getTimeInMillis();
        }
        return 0;
    }

    static boolean dayAllowed(JSONArray dow, int day) {
        if (dow == null || dow.length() == 0) return true;
        for (int i = 0; i < dow.length(); i++) if (dow.optInt(i, -1) == day) return true;
        return false;
    }

    /** تنبيهات مرتبطة بدخول وقت الصلاة (والسحور والإفطار) تبقى دقيقة؛ غيرها نافذة مرنة توفّر البطارية. */
    static boolean needsExact(String id) {
        return id != null && (id.startsWith("pray_") || id.startsWith("prep_") || id.startsWith("fs_") || id.startsWith("fi_"));
    }

    static void scheduleAt(Context c, JSONObject it, long at, boolean snooze) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        String id = it.optString("id");
        int rc = snooze ? code(id + "#snz") : code(id);
        Intent in = new Intent(c, AlarmReceiver.class).setAction(ACTION_ALARM);
        in.putExtra("item", it.toString());
        in.putExtra("snooze", snooze);
        PendingIntent pi = PendingIntent.getBroadcast(c, rc, in, PendingIntent.FLAG_UPDATE_CURRENT | immutable());
        boolean exact = snooze || needsExact(id);
        boolean canExact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
        try {
            if (exact && canExact) {
                if (Build.VERSION.SDK_INT >= 23) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                else am.setExact(AlarmManager.RTC_WAKEUP, at, pi);
            } else if (exact) {
                if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                else am.set(AlarmManager.RTC_WAKEUP, at, pi);
            } else {
                // نافذة ١٠ دقائق للتذكيرات غير المرتبطة بوقت الصلاة
                am.setWindow(AlarmManager.RTC_WAKEUP, at, 10L * 60L * 1000L, pi);
            }
        } catch (SecurityException e) {
            if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else am.set(AlarmManager.RTC_WAKEUP, at, pi);
        } catch (Throwable t) {
            am.set(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    /* ---------- الإشعار ---------- */

    static void ensureChannel(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        long[] vibs = new long[]{0, 90, 90, 150};
        Uri soundUri = Uri.parse("android.resource://" + c.getPackageName() + "/" + R.raw.alsaer_tone);
        AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
        if (nm.getNotificationChannel(CH_CHIME) == null) {
            NotificationChannel ch = new NotificationChannel(CH_CHIME, "السائر — تذكيرات بصوت هادئ", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("نغمة تغريد العصافير — نغمة إسلامية هادئة مخصصة للتطبيق");
            ch.setSound(soundUri, attrs);
            ch.enableVibration(true);
            ch.setVibrationPattern(vibs);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_SILENT) == null) {
            NotificationChannel ch = new NotificationChannel(CH_SILENT, "السائر — تذكيرات بلا صوت", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("إشعارات صامتة؛ التذكير يظهر دون نغمة");
            ch.setSound(null, null);
            ch.enableVibration(false);
            ch.setVibrationPattern(new long[]{0});
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_SYSTEM) == null) {
            NotificationChannel ch = new NotificationChannel(CH_SYSTEM, "السائر — صوت النظام", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("استخدام نغمة إشعارات الهاتف الافتراضية");
            ch.setSound(Settings.System.DEFAULT_NOTIFICATION_URI, attrs);
            ch.enableVibration(true);
            ch.setVibrationPattern(vibs);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }
    }

    /** نمط الصوت المختار: chime | silent | system */
    static String soundMode(Context c) {
        String m = prefs(c).getString(K_SOUND, "chime");
        return ("silent".equals(m) || "system".equals(m)) ? m : "chime";
    }

    static void setSoundMode(Context c, String m) {
        prefs(c).edit().putString(K_SOUND, ("silent".equals(m) || "system".equals(m)) ? m : "chime").apply();
    }

    static String channelFor(Context c) {
        String mode = soundMode(c);
        return "silent".equals(mode) ? CH_SILENT : ("system".equals(mode) ? CH_SYSTEM : CH_CHIME);
    }

    /** أيقونة كبيرة مطابقة لأيقونة التطبيق داخل الإشعار. */
    private static android.graphics.Bitmap launcherIcon(Context c) {
        try {
            android.graphics.drawable.Drawable d = c.getApplicationContext().getApplicationInfo().loadIcon(c.getApplicationContext().getPackageManager());
            if (d instanceof android.graphics.drawable.BitmapDrawable) {
                android.graphics.Bitmap src = ((android.graphics.drawable.BitmapDrawable) d).getBitmap();
                return src;
            }
            int size = 108;
            android.graphics.Bitmap bmp = android.graphics.Bitmap.createBitmap(size, size, android.graphics.Bitmap.Config.ARGB_8888);
            android.graphics.Canvas cv = new android.graphics.Canvas(bmp);
            d.setBounds(0, 0, size, size);
            d.draw(cv);
            return bmp;
        } catch (Throwable t) {
            return null;
        }
    }

    static void show(Context c, JSONObject it) {
        ensureChannel(c);
        String id = it.optString("id");
        int nid = code(id);
        String title = it.optString("title", "السائر إلى الله");
        String body = it.optString("body", "");

        Intent open = new Intent(c, MainActivity.class);
        open.putExtra("alsaer_route", it.optString("route", ""));
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent content = PendingIntent.getActivity(c, nid, open, PendingIntent.FLAG_UPDATE_CURRENT | immutable());

        NotificationCompat.Builder b = new NotificationCompat.Builder(c, channelFor(c))
                .setSmallIcon(R.drawable.ic_stat_alsaer)
                .setLargeIcon(launcherIcon(c))
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setContentIntent(content)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER);
        if (Build.VERSION.SDK_INT < 26) {
            b.setSound(Uri.parse("android.resource://" + c.getPackageName() + "/" + R.raw.alsaer_tone));
            b.setVibrate(new long[]{0, 120, 80, 120, 80, 260});
        }

        JSONObject act = it.optJSONObject("act");
        if (act != null) {
            Intent done = new Intent(c, ActionReceiver.class).setAction(ACTION_DONE);
            done.putExtra("key", act.optString("k"));
            done.putExtra("nid", nid);
            PendingIntent dpi = PendingIntent.getBroadcast(c, code(id + "#done"), done, PendingIntent.FLAG_UPDATE_CURRENT | immutable());
            b.addAction(0, act.optString("l", "تم"), dpi);
        }
        Intent snz = new Intent(c, ActionReceiver.class).setAction(ACTION_SNOOZE);
        snz.putExtra("item", it.toString());
        snz.putExtra("nid", nid);
        PendingIntent spi = PendingIntent.getBroadcast(c, code(id + "#snzact"), snz, PendingIntent.FLAG_UPDATE_CURRENT | immutable());
        b.addAction(0, "ذكّرني بعد ١٠ دقائق", spi);

        try { NotificationManagerCompat.from(c).notify(nid, b.build()); } catch (SecurityException ignored) {}
        if (FloatFeed.linked(c)) FloatingReminderService.showIfEnabled(c, title, body, it.optString("route", ""), it, nid);
    }
    /* ---------- ما يحتاجه التطبيق عند فتحه ---------- */

    static synchronized void addPending(Context c, String key) {
        try {
            JSONArray a = new JSONArray(prefs(c).getString(K_PENDING, "[]"));
            JSONObject o = new JSONObject();
            o.put("a", key);
            o.put("t", System.currentTimeMillis());
            a.put(o);
            prefs(c).edit().putString(K_PENDING, a.toString()).apply();
        } catch (Exception ignored) {}
    }

    static synchronized String takePending(Context c) {
        String s = prefs(c).getString(K_PENDING, "[]");
        prefs(c).edit().remove(K_PENDING).apply();
        return s;
    }

    static void saveRoute(Context c, String r) { prefs(c).edit().putString(K_ROUTE, r).apply(); }

    static String takeRoute(Context c) {
        String r = prefs(c).getString(K_ROUTE, "");
        prefs(c).edit().remove(K_ROUTE).apply();
        return r;
    }
}
