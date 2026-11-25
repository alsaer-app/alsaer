package com.ahmedalajmi.alsaer;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONObject;

import java.io.File;
import java.io.FileWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** سجل أخطاء النوافذ العائمة: يحفظ آخر خطأ ووقته، يكتب ملفًا محليًا، ويُشعر مرة واحدة بذكر السبب. */
final class FloatLog {
    static final String PREF = "alsaer_float";
    static final String CH_ALERTS = "alsaer_float_alerts_v1";

    private FloatLog() {}

    static SharedPreferences sp(Context c) { return c.getApplicationContext().getSharedPreferences(PREF, Context.MODE_PRIVATE); }

    static synchronized void err(Context c, String where, String reason) {
        Context app = c.getApplicationContext();
        long now = System.currentTimeMillis();
        String msg = where + ": " + reason;
        sp(app).edit().putString("lastErr", msg).putLong("lastErrAt", now).apply();
        try {
            FileWriter w = new FileWriter(new File(app.getFilesDir(), "overlay-errors.log"), true);
            w.write(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(new Date(now)) + "  " + msg + "\n");
            w.close();
        } catch (Throwable ignored) {}
        if (!sp(app).getBoolean("errNotified", false)) {
            sp(app).edit().putBoolean("errNotified", true).apply();
            notifyOnce(app, msg);
        }
    }

    /** آخر خطأ بصيغة JSON للواجهة: {"m": النص، "t": الوقت} أو null. */
    static String last(Context c) {
        try {
            SharedPreferences p = sp(c);
            String m = p.getString("lastErr", "");
            long t = p.getLong("lastErrAt", 0);
            if (m == null || m.isEmpty() || t <= 0) return "null";
            JSONObject o = new JSONObject();
            o.put("m", m);
            o.put("t", t);
            return o.toString();
        } catch (Throwable t) { return "null"; }
    }

    static void ensureAlertsChannel(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && nm.getNotificationChannel(CH_ALERTS) == null) {
            NotificationChannel ch = new NotificationChannel(CH_ALERTS, NativeStrings.get(c, "ch_float_name"), NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription(NativeStrings.get(c, "float_fail_alert_desc"));
            nm.createNotificationChannel(ch);
        }
    }

    /** إشعار لمرة واحدة يذكر سبب فشل النافذة. */
    static void notifyOnce(Context c, String reason) {
        try {
            ensureAlertsChannel(c);
            Intent open = new Intent(c, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent content = PendingIntent.getActivity(c, 771001, open, PendingIntent.FLAG_UPDATE_CURRENT | AlarmScheduler.immutable());
            NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH_ALERTS)
                    .setSmallIcon(R.drawable.ic_stat_alsaer)
                    .setContentTitle(NativeStrings.get(c, "float_show_failed"))
                    .setContentText(reason)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(reason))
                    .setContentIntent(content)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH);
            NotificationManagerCompat.from(c).notify(771001, b.build());
        } catch (Throwable ignored) {}
    }

    /** بديل النافذة عند تعذّرها: إشعار عالي الأولوية بزرَّي فتح التطبيق والتأجيل ١٠ دقائق. */
    static void fallback(Context c, String title, String body) {
        try {
            ensureAlertsChannel(c);
            Intent open = new Intent(c, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent content = PendingIntent.getActivity(c, 771002, open, PendingIntent.FLAG_UPDATE_CURRENT | AlarmScheduler.immutable());
            Intent snz = new Intent(c, ActionReceiver.class).setAction(FloatFeed.ACTION_SNOOZE_FLOAT);
            PendingIntent snooze = PendingIntent.getBroadcast(c, 771003, snz, PendingIntent.FLAG_UPDATE_CURRENT | AlarmScheduler.immutable());
            String txt = body == null ? "" : body;
            NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH_ALERTS)
                    .setSmallIcon(R.drawable.ic_stat_alsaer)
                    .setContentTitle(title == null || title.isEmpty() ? NativeStrings.get(c, "app_name") : title)
                    .setContentText(txt)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(txt))
                    .setContentIntent(content)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_REMINDER)
                    .addAction(0, NativeStrings.get(c, "open_app_action"), content)
                    .addAction(0, NativeStrings.get(c, "remind_10_min"), snooze);
            NotificationManagerCompat.from(c).notify(771004, b.build());
        } catch (Throwable ignored) {}
    }
}
