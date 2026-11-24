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
            if (!snooze) AlarmScheduler.snoozeChainSet(c, it.optString("id"), 0); // إطلاق جديد: نهاية سلسلة التأجيل السابقة
            AlarmScheduler.show(c, it);
            if (snooze && AlarmScheduler.snoozeAuto(c)) {
                int n = AlarmScheduler.snoozeChain(c, it.optString("id"));
                if (n > 0 && n < AlarmScheduler.SNOOZE_MAX) {
                    AlarmScheduler.snoozeChainSet(c, it.optString("id"), n + 1);
                    AlarmScheduler.scheduleAt(c, it, System.currentTimeMillis() + AlarmScheduler.SNOOZE_MS, true);
                } else AlarmScheduler.snoozeChainSet(c, it.optString("id"), 0);
            }
            if (!snooze && it.optLong("at", 0) <= 0) { // جدولة الموعد التالي للتنبيه المتكرر
                long at = AlarmScheduler.nextTrigger(it, System.currentTimeMillis() + 1000L);
                if (at > 0) AlarmScheduler.scheduleAt(c, it, at, false);
            }
        } catch (Exception e) {
            FloatLog.err(c, "استقبال التنبيه", String.valueOf(e));
        }
    }
}
