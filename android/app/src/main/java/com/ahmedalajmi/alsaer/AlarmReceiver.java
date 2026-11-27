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
            if ("rebuild".equals(i.getStringExtra("kind"))) { AlarmScheduler.scheduleAll(c); FloatFeed.schedule(c); return; }
            JSONObject it = new JSONObject(i.getStringExtra("item"));
            boolean snooze = i.getBooleanExtra("snooze", false);
            /* الموعد المقرر مقابل وقت الاستلام: متأخر جدًا (جهاز مطفأ/نائم) يُسقط ولا يُعرض، ونفس الموعد لا يُعالَج مرتين */
            final long due = i.getLongExtra("due", 0), nowMs = System.currentTimeMillis();
            final String itemId = it.optString("id");
            final boolean stale = ReminderPlan.isStale(due, nowMs, snooze || AlarmScheduler.needsExact(itemId));
            final String dueKey = "fired-due:" + itemId + (snooze ? "#snooze" : "");
            if (due > 0) {
                if (ReminderPlan.isDuplicate(AlarmScheduler.prefs(c).getLong(dueKey, 0), due)) return;
                if (!AlarmScheduler.prefs(c).edit().putLong(dueKey, due).commit()) return;
            }
            if (snooze && stale) { AlarmScheduler.snoozeChainSet(c, itemId, 0); return; }
            long once=it.optLong("at",0);
            String onceKey="fired-once:"+it.optString("id");
            if(once>0&&!snooze){
                if(AlarmScheduler.prefs(c).getLong(onceKey,0)==once)return;
                if(!AlarmScheduler.prefs(c).edit().putLong(onceKey,once).commit())return;
            }
            if (!snooze) AlarmScheduler.snoozeChainSet(c, it.optString("id"), 0); // إطلاق جديد: نهاية سلسلة التأجيل السابقة
            /* الجدولة التالية قبل العرض: فشل العرض لا يقطع سلسلة التذكير المتكرر ولا الغفوة. */
            if (snooze && AlarmScheduler.snoozeAuto(c)) {
                int n = AlarmScheduler.snoozeChain(c, it.optString("id"));
                if (n > 0 && n < AlarmScheduler.SNOOZE_MAX) {
                    AlarmScheduler.snoozeChainSet(c, it.optString("id"), n + 1);
                    AlarmScheduler.scheduleAt(c, it, System.currentTimeMillis() + AlarmScheduler.SNOOZE_MS, true);
                } else AlarmScheduler.snoozeChainSet(c, it.optString("id"), 0);
            }
            if (!snooze && it.optLong("at", 0) <= 0) { // جدولة الموعد التالي للتنبيه المتكرر
                long at = AlarmScheduler.nextTrigger(it, System.currentTimeMillis() + 1000L);
                if (at > 0 && ReminderPlan.inHorizon(at, System.currentTimeMillis())) AlarmScheduler.scheduleAt(c, it, at, false);
            }
            if (!stale) AlarmScheduler.show(c, it);
        } catch (Exception e) {
            FloatLog.err(c, NativeStrings.get(c, "receive_alert"), String.valueOf(e));
        }
    }
}
