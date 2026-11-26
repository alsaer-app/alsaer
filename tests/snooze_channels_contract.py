"""Execute current category x sound-mode channel mapping and snooze constant on host JVM. No Android sound proof."""
from pathlib import Path
import re,subprocess,tempfile
R=Path(__file__).resolve().parents[1];j=R/'android/app/src/main/java/com/ahmedalajmi/alsaer';s=(j/'AlarmScheduler.java').read_text();expr=re.search(r'SNOOZE_MS = ([^;]+);',s).group(1);mapping=s[s.index('    static String categoryOf('):s.index('    /** أيقونة كبيرة')].replace('Context c','String mode').replace('        String mode = soundMode(c);','')
main='''public static void main(String[] a){
 if(SNOOZE_MS!=600000)throw new AssertionError();
 for(String cat:new String[]{"pray","fast","habit"}){
  if(!channelFor("chime","x").startsWith("alsaer_"))throw new AssertionError();
  if(!chId(cat,"chime").equals("alsaer_"+cat+"_v2"))throw new AssertionError();
  if(!chId(cat,"silent").equals("alsaer_"+cat+"_silent_v2"))throw new AssertionError();
  if(!chId(cat,"system").equals("alsaer_"+cat+"_system_v2"))throw new AssertionError();
  if(!chId(cat,"unknown").equals("alsaer_"+cat+"_v2"))throw new AssertionError();
 }
 for(String id:new String[]{"pray_fajr","prep_fajr"})if(!channelFor("silent",id).equals("alsaer_pray_silent_v2"))throw new AssertionError(id);
 for(String id:new String[]{"fs_suhur","fi_iftar"})if(!channelFor("system",id).equals("alsaer_fast_system_v2"))throw new AssertionError(id);
 for(String id:new String[]{"habit_x","goal_y",""})if(!channelFor("chime",id).equals("alsaer_habit_v2"))throw new AssertionError(id);
 String[] pk={"fajr","dhuhr","asr","maghrib","isha"};
 for(String k:pk){
  if(!channelFor("chime","pray_"+k).equals("alsaer_pray_"+k+"_v2"))throw new AssertionError(k);
  if(!channelFor("silent","pray_"+k).equals("alsaer_pray_silent_v2"))throw new AssertionError(k);
  if(!channelFor("system","pray_"+k).equals("alsaer_pray_system_v2"))throw new AssertionError(k);
  if(!channelFor("chime","prep_"+k).equals("alsaer_pray_v2"))throw new AssertionError(k);
 }
 for(String id:new String[]{"pray_sunrise","pray_","pray_fajr2"})if(!channelFor("chime",id).equals("alsaer_pray_v2"))throw new AssertionError(id);
 if(!channelFor("chime","fs_suhur").equals("alsaer_fast_v2"))throw new AssertionError();
 System.out.println("PASS category x sound-mode channel mapping and fixed 600000ms snooze");
}'''
with tempfile.TemporaryDirectory() as t:
 p=Path(t)/'ChannelAudit.java';p.write_text('class ChannelAudit{static long SNOOZE_MS='+expr+';'+mapping+main+'}');subprocess.run(['java','-jar','/tmp/alsaer-java/ecj.jar','-11','-proc:none','-d',t,str(p)],check=True);subprocess.run(['java','-cp',t,'ChannelAudit'],check=True)
a=(j/'ActionReceiver.java').read_text();assert 'System.currentTimeMillis() + AlarmScheduler.SNOOZE_MS, true' in a
for old in ['alsaer_reminders_v7','alsaer_reminders_silent_v7','alsaer_reminders_system_v7']:assert 'deleteNotificationChannel(CH_OLD' in s and old in s,old
assert 'if (nm.getNotificationChannel(id) != null) return;' in s
assert '"silent".equals(sound)?null:"system".equals(sound)?Settings.System.DEFAULT_NOTIFICATION_URI' in s
import hashlib
RAW=R/'android/app/src/main/res/raw'
for n in ['alsaer_notify','alsaer_pray_fajr','alsaer_pray_dhuhr','alsaer_pray_asr','alsaer_pray_maghrib','alsaer_pray_isha']:
 f=RAW/(n+'.wav');d=f.read_bytes();assert d[:4]==b'RIFF' and d[8:12]==b'WAVE' and len(d)>100000,n
assert 'rawUri(c, "alsaer_tone")' in s and 'alsaer_notify' not in s and '{"fajr","dhuhr","asr","maghrib","isha"}' in s and 'rawUri(c, "alsaer_pray_" + PRAYER_KEYS[i])' in s
assert 'R.raw.' not in s and (RAW/'alsaer_tone.mp3').exists()
assert 'alsaer_pray_" + PRAYER_KEYS[i] + "_v2"' in s and 'for (String cat0' in s
print('PASS source guards: snooze scheduled separately, category channels created once, old sound-mode channels deleted, API24/25 silent/system/custom branch; real audio and delivery untested')
