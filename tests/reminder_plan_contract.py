"""Host-JVM unit tests of the reminder rules: drop past-due, rolling 2-day horizon, short display window, dedupe.
Compiles the production ReminderPlan.java and the production nextTrigger() (extracted from AlarmScheduler.java).
Also compile-checks the changed Android classes against the platform API jar (androidx classes are not available here, so only errors in our own symbols are counted).
Needs JSON_JAR, ANDROID_API_JAR, ECJ_JAR (see alarm_dates_contract.py). No device claims."""
from pathlib import Path
import os,subprocess,tempfile,shutil,re
R=Path(__file__).resolve().parents[1];J=R/'android/app/src/main/java/com/ahmedalajmi/alsaer'
cp=os.environ.get('JSON_JAR','/tmp/alsaer-java/json.jar')+':'+os.environ.get('ANDROID_API_JAR','/tmp/alsaer-java/android-api.jar')
compiler=['javac'] if shutil.which('javac') else ['java','-jar',os.environ.get('ECJ_JAR','/tmp/alsaer-java/ecj.jar'),'-11','-proc:none']
src=(J/'AlarmScheduler.java').read_text()
assert 'GRACE_MS' not in src,'catch-up grace must be gone'
a=src.index('    static long nextTrigger(');b=src.index('    /** تنبيهات',a)
with tempfile.TemporaryDirectory() as td:
 p=Path(td)
 (p/'AlarmNext.java').write_text('package com.ahmedalajmi.alsaer;import java.util.*;import org.json.*;class AlarmNext {'+src[a:b]+'}')
 for f in ('ReminderPlan.java','PrayerClock.java'):(p/f).write_text((J/f).read_text())
 (p/'T.java').write_text('''package com.ahmedalajmi.alsaer;
import java.util.*;import org.json.*;
class T{static void ck(boolean c,String m){if(!c)throw new AssertionError(m);}
public static void main(String[] a)throws Exception{
 long now=1_800_000_000_000L,H=ReminderPlan.HORIZON_MS;
 // drop past-due: a one-time event, even 1 s late, has no next trigger
 for(long late:new long[]{1,1000,60_000,44*60_000L,3*3600_000L}){JSONObject o=new JSONObject().put("at",now-late);ck(AlarmNext.nextTrigger(o,now)==0,"past-due fired "+late);}
 ck(AlarmNext.nextTrigger(new JSONObject().put("at",now+5000),now)==now+5000,"future once kept");
 // horizon
 ck(ReminderPlan.inHorizon(now+1,now),"soon in");ck(ReminderPlan.inHorizon(now+H,now),"edge in");ck(!ReminderPlan.inHorizon(now+H+1,now),"beyond out");ck(!ReminderPlan.inHorizon(now,now),"now out");ck(!ReminderPlan.inHorizon(now-1,now),"past out");
 // display window
 ck(!ReminderPlan.isStale(now-60_000,now,true),"exact 1 min ok");ck(ReminderPlan.isStale(now-6*60_000L,now,true),"exact 6 min dropped");
 ck(!ReminderPlan.isStale(now-12*60_000L,now,false),"window 12 min ok");ck(ReminderPlan.isStale(now-16*60_000L,now,false),"window 16 min dropped");
 ck(!ReminderPlan.isStale(0,now,true),"unstamped old alarm never stale");
 // device off 8 h with a burst of 20 events due in that time: none may survive
 int shown=0;for(int k=1;k<=20;k++){long due=now-k*20*60_000L;if(!ReminderPlan.isStale(due,now,k%2==0))shown++;}ck(shown<=1,"burst after boot: "+shown);
 // dedupe
 ck(ReminderPlan.isDuplicate(1234,1234),"same due duplicate");ck(!ReminderPlan.isDuplicate(1234,5678),"next due not duplicate");ck(!ReminderPlan.isDuplicate(0,1234),"first not duplicate");ck(!ReminderPlan.isDuplicate(0,0),"no stamp not duplicate");
 // recurring daily: next is always in the future and rebuilding twice gives the same alarm
 JSONObject d=new JSONObject("{h:5,m:0}");long n1=AlarmNext.nextTrigger(d,now),n2=AlarmNext.nextTrigger(d,now);ck(n1==n2&&n1>now&&n1-now<=24*3600_000L+1,"daily next");
 ck(ReminderPlan.REBUILD_AFTER_MS<H,"rebuild before horizon ends");
 System.out.println("PASS reminder rules");}}
''')
 r=subprocess.run(compiler+['-cp',cp,'-d',td]+[str(x) for x in p.glob('*.java')],capture_output=True,text=True);assert r.returncode==0,r.stdout+r.stderr
 print(subprocess.check_output(['java','-cp',td+':'+cp,'com.ahmedalajmi.alsaer.T'],text=True).strip())
# compile check of changed android classes: report only errors that are not missing androidx/capacitor/R symbols
out=subprocess.run(['java','-jar',os.environ.get('ECJ_JAR','/tmp/alsaer-java/ecj.jar'),'-11','-proc:none','-cp',cp,'-d','none']+[str(J/f) for f in ('AlarmReceiver.java','BootReceiver.java','ReminderPlan.java','RebuildWorker.java','AlarmScheduler.java','PrayerClock.java','FloatFeed.java','FloatLog.java','NativeStrings.java','MainActivity.java','LocationBridge.java','AlsaerNative.java')],capture_output=True,text=True)
errs=[l for l in (out.stdout+out.stderr).split('ERROR in ')[1:]]
real=[e for e in errs if not re.search(r'androidx|NotificationCompat|NotificationManagerCompat|R cannot be resolved|R\.|BitmapDrawable|WorkManager|Worker|PeriodicWork|NonNull|FloatingReminderService|MainActivity|AlsaerNative|ActionReceiver|ExistingPeriodicWorkPolicy|cannot be resolved to a type|cannot be resolved|getApplicationContext|must override or implement a supertype',e)]
assert not [e for e in errs if re.search(r'Duplicate (method|field|local variable|nested type)|already defined|Syntax error|Unreachable|missing return|might not have been',e)],'duplicate/syntax errors:\n'+'\n'.join(e[:300] for e in errs if re.search(r'Duplicate|already defined|Syntax error',e))
assert not real,'\n'.join(real)[:2000]
print('PASS compile check (%d errors are only missing androidx/app classes)'%len(errs))
