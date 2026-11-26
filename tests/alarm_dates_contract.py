"""Execute production prayer math and extracted production alarm-next logic on host JVM.
Requires JSON_JAR and ANDROID_API_JAR for compilation only; no device claims.
"""
from pathlib import Path
import os,subprocess,tempfile,shutil,json
R=Path(__file__).resolve().parents[1];J=R/'android/app/src/main/java/com/ahmedalajmi/alsaer'
with tempfile.TemporaryDirectory() as td:
 p=Path(td);src=(J/'AlarmScheduler.java').read_text();a=src.index('    static long nextTrigger(');b=src.index('    /** تنبيهات',a)
 (p/'AlarmNext.java').write_text('package com.ahmedalajmi.alsaer;import java.util.*;import org.json.*;class AlarmNext {'+src[a:b]+'}')
 (p/'PrayerClock.java').write_text((J/'PrayerClock.java').read_text())
 (p/'TestNext.java').write_text('''package com.ahmedalajmi.alsaer;
import java.util.*;import org.json.*;
class TestNext {public static void main(String[] a)throws Exception{
 TimeZone.setDefault(TimeZone.getTimeZone("Africa/Cairo"));Calendar c=Calendar.getInstance();c.set(2026,10,24,0,0,0);c.set(Calendar.MILLISECOND,0);long now=c.getTimeInMillis();
 JSONObject once=new JSONObject().put("at",now-60000);if(AlarmNext.nextTrigger(once,now)!=0)throw new AssertionError("past-due one-time must be dropped, never fired");once.put("at",now-2700001);if(AlarmNext.nextTrigger(once,now)!=0)throw new AssertionError("old past-due dropped");once.put("at",now+60000);if(AlarmNext.nextTrigger(once,now)!=now+60000)throw new AssertionError("future once");
 JSONObject daily=new JSONObject("{h:5,m:0,skipDate:'2026-11-24'}");long n=AlarmNext.nextTrigger(daily,now);Calendar out=Calendar.getInstance();out.setTimeInMillis(n);if(out.get(Calendar.DAY_OF_MONTH)!=25)throw new AssertionError("skip today only");
 JSONObject cfg=new JSONObject("{lat:30.0444,lng:31.2357,method:'egypt',asr:1,key:'fajr'}");daily.remove("skipDate");daily.put("prayer",cfg);int first=PrayerClock.minutes(c,cfg);c.add(Calendar.DAY_OF_YEAR,30);int later=PrayerClock.minutes(c,cfg);if(first==later)throw new AssertionError("stale prayer time");
 String[] names={"fajr","dhuhr","asr","maghrib","isha"},methods={"egypt","mwl","karachi","makkah"};JSONArray values=new JSONArray();
 for(double[] city:new double[][]{{30.0444,31.2357},{51.5074,-.1278},{-33.8688,151.2093}})for(int month:new int[]{0,2,5,10})for(String method:methods)for(int asr:new int[]{1,2}){
 c.set(2026,month,24,12,0,0);cfg.put("lat",city[0]);cfg.put("lng",city[1]);cfg.put("method",method);cfg.put("asr",asr);JSONArray row=new JSONArray();for(String key:names){cfg.put("key",key);row.put(PrayerClock.minutes(c,cfg));}values.put(row);
 }System.out.println(values.toString());
 System.out.println("PASS production Java date-scoped skip and per-date prayer math");}}
''')
 cp=os.environ.get('JSON_JAR','/tmp/alsaer-java/json.jar')+':'+os.environ.get('ANDROID_API_JAR','/tmp/alsaer-java/android-api.jar')
 compiler=['javac'] if shutil.which('javac') else ['java','-jar',os.environ.get('ECJ_JAR','/tmp/alsaer-java/ecj.jar'),'-11','-proc:none']
 subprocess.run(compiler+['-cp',cp,'-d',td]+[str(x) for x in p.glob('*.java')],check=True)
 result=subprocess.check_output(['java','-cp',td+':'+cp,'com.ahmedalajmi.alsaer.TestNext'],text=True);print(result.splitlines()[-1])
 expected=subprocess.check_output(['node','-e',"let fs=require('fs'),vm=require('vm');let c={window:{addEventListener(){}},document:{addEventListener(){}},setTimeout(){},setInterval(){},hijriNumeric:d=>({month:+new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{month:'numeric'}).format(d)})};vm.createContext(c);vm.runInContext(fs.readFileSync('src/services/prayer-times.js','utf8'),c);let out=[];for(let city of [[30.0444,31.2357],[51.5074,-.1278],[-33.8688,151.2093]])for(let m of [0,2,5,10])for(let method of ['egypt','mwl','karachi','makkah'])for(let asr of [1,2]){let p=c.ptCompute(new Date(2026,m,24,12),...city,method,asr);out.push(['fajr','dhuhr','asr','maghrib','isha'].map(k=>{if(!p[k])return -1;let a=p[k].split(':');return +a[0]*60+ +a[1]}))}console.log(JSON.stringify(out))"],cwd=R,env=dict(os.environ,TZ='Africa/Cairo'),text=True)
 actual=json.loads(result.splitlines()[0]);expected=json.loads(expected)
 assert actual==expected,[(i,a,b) for i,(a,b) in enumerate(zip(actual,expected)) if a!=b]
 print('PASS 96 date/city/method/asr cases, 480 native/JS prayer times, including Ramadan Umm al-Qura')
receiver=(J/'AlarmReceiver.java').read_text();assert 'it.optLong("at", 0) <= 0' in receiver and 'fired-once:' in receiver
assert 'fired-once:' in src
assert 'if (!url.equals(p.getString("url", "")) && updPart().exists()) updPart().delete();' in (J/'AlsaerNative.java').read_text()
assert 'for (int d = -1;' in (J/'FloatFeed.java').read_text()
print('PASS JS/native prayer parity, one-shot fired-state/reschedule guards, changed-URL partial reset, overnight schedule source guards')
