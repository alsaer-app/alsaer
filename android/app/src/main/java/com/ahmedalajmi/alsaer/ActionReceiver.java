package com.ahmedalajmi.alsaer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.app.NotificationManagerCompat;

import org.json.JSONObject;

/** أزرار الإشعار: «تم» تُسجَّل ويطبّقها التطبيق عند فتحه، و«ذكّرني» تُعيد الجدولة بعد ١٠ دقائق. */
public class ActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        NotificationManagerCompat.from(c).cancel(i.getIntExtra("nid", 0));
        String a = i.getAction();
        if (FloatFeed.ACTION_SNOOZE_FLOAT.equals(a)) {
            FloatFeed.snoozeOnce(c);
        } else if (AlarmScheduler.ACTION_DONE.equals(a)) {
            AlarmScheduler.addPending(c, i.getStringExtra("key"));
        } else if (AlarmScheduler.ACTION_SNOOZE.equals(a)) {
            try {
                JSONObject it = new JSONObject(i.getStringExtra("item"));
                if (AlarmScheduler.snoozeAuto(c)) AlarmScheduler.snoozeChainSet(c, it.optString("id"), 1); // بداية السلسلة: حتى ٣ رنّات تلقائية
                AlarmScheduler.scheduleAt(c, it, System.currentTimeMillis() + AlarmScheduler.SNOOZE_MS, true);
            } catch (Exception ignored) {}
        } else if (AlarmScheduler.ACTION_SNOOZE_STOP.equals(a)) {
            String id = i.getStringExtra("id");
            if (id != null) AlarmScheduler.cancelSnooze(c, id);
        }
    }
}
