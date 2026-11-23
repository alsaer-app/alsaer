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
            long once=it.optLong("at",0);
            String onceKey="fired-once:"+it.optString("id");
            if(once>0&&!snooze){
                if(AlarmScheduler.prefs(c).getLong(onceKey,0)==once)return;
                if(!AlarmScheduler.prefs(c).edit().putLong(onceKey,once).commit())return;
            }
            AlarmScheduler.show(c, it);
            if (!snooze && it.optLong("at", 0) <= 0) { // جدولة الموعد التالي للتنبيه المتكرر
                long at = AlarmScheduler.nextTrigger(it, System.currentTimeMillis() + 1000L);
                if (at > 0) AlarmScheduler.scheduleAt(c, it, at, false);
            }
        } catch (Exception e) {
            FloatLog.err(c, "استقبال التنبيه", String.valueOf(e));
        }
    }
}
