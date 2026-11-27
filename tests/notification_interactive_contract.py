#!/usr/bin/env python3
"""Source guards: grouping + summary, start button, exact wird, local update worker (https only, once per version, no Firebase)."""
import re,sys
J='android/app/src/main/java/com/ahmedalajmi/alsaer/'
A=open(J+'AlarmScheduler.java',encoding='utf-8').read()
U=open(J+'UpdateWorker.java',encoding='utf-8').read()
M=open(J+'MainActivity.java',encoding='utf-8').read()+open(J+'BootReceiver.java',encoding='utf-8').read()
ok=True
def chk(n,c):
    global ok
    print(('PASS ' if c else 'FAIL ')+n); ok=ok and c
chk('children grouped','.setGroup(GROUP_KEY)' in A)
chk('summary is group summary, children alert','setGroupSummary(true)' in A and 'GROUP_ALERT_CHILDREN' in A)
chk('summary channel low importance','IMPORTANCE_LOW' in A and 'alsaer_summary_v1' in A)
chk('start button when no act','firstLabel = NativeStrings.get(c, "start")' in A and 'firstIntent = content' in A and 'b.addAction(0, firstLabel, firstIntent)' in A)
chk('wird exact','id.startsWith("wird")' in A.split('static boolean needsExact')[1][:300])
chk('prayer actions kept','ACTION_SNOOZE' in A and 'ACTION_SNOOZE_STOP' in A and 'ACTION_DONE' in A)
chk('update worker https only','"https".equals(u.getProtocol())' in U and U.count('http://')==0)
chk('update once per version','code > last' in U and 'PREF_LAST' in U)
chk('update checks appId','APP_ID.equals' in U)
chk('update no Firebase/GMS','firebase' not in U.lower() and 'com.google' not in U.lower())
chk('update no redirect follow','setInstanceFollowRedirects(false)' in U)
chk('worker enqueued','UpdateWorker.enqueue' in M)
sys.exit(0 if ok else 1)
