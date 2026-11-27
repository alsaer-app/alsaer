package com.ahmedalajmi.alsaer;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.util.concurrent.TimeUnit;

/** Periodic rebuild of the reminder alarms: keeps the rolling horizon filled even if the app is never opened or the boot broadcast was blocked. No service, no ongoing notification. */
public class RebuildWorker extends Worker {
    static final String NAME = "alsaer-reminder-rebuild";

    public RebuildWorker(@NonNull Context context, @NonNull WorkerParameters params) { super(context, params); }

    @NonNull @Override public Result doWork() {
        try {
            Context c = getApplicationContext();
            AlarmScheduler.scheduleAll(c);
            FloatFeed.schedule(c);
            return Result.success();
        } catch (Throwable t) {
            return Result.retry();
        }
    }

    static void enqueue(Context c) {
        try {
            PeriodicWorkRequest r = new PeriodicWorkRequest.Builder(RebuildWorker.class, 6, TimeUnit.HOURS).build();
            WorkManager.getInstance(c.getApplicationContext()).enqueueUniquePeriodicWork(NAME, ExistingPeriodicWorkPolicy.KEEP, r);
        } catch (Throwable ignored) { }
    }
}
