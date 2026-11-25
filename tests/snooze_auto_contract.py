"""Static contract for the auto-snooze chain (no ecj dependency; CI-safe)."""
from pathlib import Path
R = Path(__file__).resolve().parents[1]
j = R / 'android/app/src/main/java/com/ahmedalajmi/alsaer'
sched = (j / 'AlarmScheduler.java').read_text()
recv = (j / 'AlarmReceiver.java').read_text()
act = (j / 'ActionReceiver.java').read_text()
bridge = (j / 'AlsaerNative.java').read_text()

assert 'SNOOZE_MS = 10L * 60L * 1000L' in sched, 'fixed 10-minute snooze'
assert 'SNOOZE_MAX = 3' in sched, 'chain cap 3'
assert 'ACTION_SNOOZE_STOP' in sched and 'ACTION_SNOOZE_STOP' in act, 'stop action wired'
assert '"snz-chain:"' in sched, 'per-firing chain prefs'
assert 'snz-auto' in sched and 'getBoolean("snz-auto", true)' in sched, 'auto default ON'
# stop cancels the snooze alarm PendingIntent by its exact identity
i = sched.index('static void cancelSnooze')
assert 'alarmIdentity(id,true)' in sched[i:i+700] and 'code(c,id,"snooze")' in sched[i:i+700]
# auto re-ring only when enabled and chain within cap; normal fire clears the chain
assert 'snooze && AlarmScheduler.snoozeAuto(c)' in recv
assert 'n > 0 && n < AlarmScheduler.SNOOZE_MAX' in recv
assert 'if (!snooze) AlarmScheduler.snoozeChainSet(c' in recv
# tap starts chain only in auto mode; one-shot preserved otherwise
assert 'if (AlarmScheduler.snoozeAuto(c)) AlarmScheduler.snoozeChainSet' in act
# notification actions stay at most 3 (تم/ذكّرني/إيقاف)
assert sched.count('b.addAction(') <= 3, 'notification action cap'
# stop label lives in the generated NativeStrings table (native-layer i18n, 10201)
assert 'NativeStrings.get(c, "stop")' in sched, 'stop label via NativeStrings'
import json as _json
_ns = _json.loads((R / 'tools/native_strings.json').read_text())
assert _ns['strings']['stop'][0] == 'إيقاف', 'arabic stop label in native strings table'
# JS bridge
for m in ['setSnoozeAuto(boolean on)', 'snoozeStopAll()', 'snoozeActiveCount()']:
    assert m in bridge, m
js = (R / 'src/services/native-schedule.js').read_text()
assert 'snoozeAuto:true' in js, 'cfg default ON'
assert "remLoad():cfg()" in js, 'sync reads merged reminders config, not defaults'
assert 'n.setSnoozeAuto(r0.snoozeAuto!==false)' in js
st = (R / 'src/screens/settings.js').read_text()
assert 'data-rem-toggle="snoozeAuto"' in st and 'snzstop' in st and 'snoozeActiveCount' in st
disp = (R / 'src/core/event-dispatcher.js').read_text()
assert "a==='snzstop'" in disp and 'snoozeStopAll' in disp
print('PASS snooze: 10min chain cap 3, stop action, per-firing prefs, one-shot fallback, settings rows, bridge')
