package com.ahmedalajmi.alsaer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** يعيد بناء التنبيهات بعد إعادة التشغيل أو تحديث التطبيق أو تغيير الوقت/المنطقة/التاريخ. يتجاهل أي بث آخر (المستقبل مُصدَّر). */
public class BootReceiver extends BroadcastReceiver {
    static boolean relevant(String a) {
        return a != null && (Intent.ACTION_BOOT_COMPLETED.equals(a) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)
            || Intent.ACTION_TIME_CHANGED.equals(a) || Intent.ACTION_TIMEZONE_CHANGED.equals(a) || Intent.ACTION_DATE_CHANGED.equals(a)
            || "android.intent.action.QUICKBOOT_POWERON".equals(a) || "com.htc.intent.action.QUICKBOOT_POWERON".equals(a)
            || "android.app.action.SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED".equals(a));
    }
    @Override
    public void onReceive(Context c, Intent i) {
        final String action = i == null ? null : i.getAction();
        if (!relevant(action)) return;
        final PendingResult pr = goAsync();
        final Context app = c.getApplicationContext();
        new Thread(() -> {
            try {
                // منبّهات الغفوة تضيع مع إعادة التشغيل: ننهي سلاسلها بدل تركها معلّقة
                if (Intent.ACTION_BOOT_COMPLETED.equals(action) || "android.intent.action.QUICKBOOT_POWERON".equals(action)) AlarmScheduler.snoozeStopAll(app);
                AlarmScheduler.scheduleAll(app);
                FloatFeed.schedule(app);
                RebuildWorker.enqueue(app); UpdateWorker.enqueue(app);
            } finally {
                pr.finish();
            }
        }).start();
    }
}
