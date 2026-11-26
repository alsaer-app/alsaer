package com.ahmedalajmi.alsaer;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.TimeUnit;

/** Local update notice: reads the public update.json over https once a day and notifies once per new version. No Firebase, no account, nothing is sent about the user. */
public class UpdateWorker extends Worker {
    static final String NAME = "alsaer-update-check";
    static final String URL_JSON = "https://raw.githubusercontent.com/alsaer-app/alsaer/main/update.json";
    static final String APP_ID = "com.ahmedalajmi.alsaer";
    static final String CH = "alsaer_update_v1";
    static final int NID = 7200;
    static final String PREF_LAST = "update_notified_code";

    public UpdateWorker(@NonNull Context context, @NonNull WorkerParameters params) { super(context, params); }

    @NonNull @Override public Result doWork() {
        try {
            Context c = getApplicationContext();
            JSONObject j = fetch();
            if (j == null) return Result.retry();
            if (!APP_ID.equals(j.optString("appId"))) return Result.success();
            int code = j.optInt("versionCode", 0);
            String name = j.optString("versionName", "");
            int mine = c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionCode;
            int last = AlarmScheduler.prefs(c).getInt(PREF_LAST, 0);
            if (code > mine && code > last && name.length() > 0 && name.length() < 32) {
                notifyUpdate(c, name);
                AlarmScheduler.prefs(c).edit().putInt(PREF_LAST, code).apply();
            }
            return Result.success();
        } catch (Throwable t) {
            return Result.retry();
        }
    }

    static JSONObject fetch() throws Exception {
        URL u = new URL(URL_JSON);
        if (!"https".equals(u.getProtocol())) return null;
        HttpURLConnection h = (HttpURLConnection) u.openConnection();
        h.setConnectTimeout(15000);
        h.setReadTimeout(15000);
        h.setInstanceFollowRedirects(false);
        try {
            if (h.getResponseCode() != 200) return null;
            StringBuilder sb = new StringBuilder();
            BufferedReader r = new BufferedReader(new InputStreamReader(h.getInputStream(), "UTF-8"));
            String line;
            while ((line = r.readLine()) != null && sb.length() < 65536) sb.append(line);
            return new JSONObject(sb.toString());
        } finally { h.disconnect(); }
    }

    static void notifyUpdate(Context c, String name) {
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm.getNotificationChannel(CH) == null)
                nm.createNotificationChannel(new NotificationChannel(CH, NativeStrings.get(c, "chan_update"), NotificationManager.IMPORTANCE_DEFAULT));
        }
        Intent open = new Intent(c, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, NID, open, PendingIntent.FLAG_UPDATE_CURRENT | AlarmScheduler.immutable());
        Notification n = new NotificationCompat.Builder(c, CH)
                .setSmallIcon(R.drawable.ic_stat_alsaer)
                .setContentTitle(NativeStrings.get(c, "update_title"))
                .setContentText(String.format(NativeStrings.get(c, "update_body"), name))
                .setContentIntent(pi).setAutoCancel(true).build();
        try { NotificationManagerCompat.from(c).notify(NID, n); } catch (SecurityException ignored) { }
    }

    static void enqueue(Context c) {
        try {
            PeriodicWorkRequest r = new PeriodicWorkRequest.Builder(UpdateWorker.class, 24, TimeUnit.HOURS).build();
            WorkManager.getInstance(c.getApplicationContext()).enqueueUniquePeriodicWork(NAME, ExistingPeriodicWorkPolicy.KEEP, r);
        } catch (Throwable ignored) { }
    }
}
