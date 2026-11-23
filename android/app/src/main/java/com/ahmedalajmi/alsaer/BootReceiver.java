package com.ahmedalajmi.alsaer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** يعيد جدولة التنبيهات بعد إعادة التشغيل أو تحديث التطبيق أو تغيير الوقت/المنطقة. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        final PendingResult pr = goAsync();
        final Context app = c.getApplicationContext();
        new Thread(() -> {
            try {
                AlarmScheduler.scheduleAll(app);
                FloatFeed.schedule(app);
            } finally {
                pr.finish();
            }
        }).start();
    }
}
