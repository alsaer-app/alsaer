package com.ahmedalajmi.alsaer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import org.json.JSONObject;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        try {
            if ("float".equals(i.getStringExtra("kind"))) { FloatFeed.fire(c); return; }
            JSONObject it = new JSONObject(i.getStringExtra("item"));
            boolean snooze = i.getBooleanExtra("snooze", false);
            AlarmScheduler.show(c, it);
            if (!snooze) { // جدولة الموعد التالي للتنبيه المتكرر
                long at = AlarmScheduler.nextTrigger(it, System.currentTimeMillis() + 1000L);
                if (at > 0) AlarmScheduler.scheduleAt(c, it, at, false);
            }
        } catch (Exception ignored) {}
    }
}
