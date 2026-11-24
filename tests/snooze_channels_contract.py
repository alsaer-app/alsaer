"""Execute current channel mapping and snooze constant on host JVM. No Android sound proof."""
from pathlib import Path
import re,subprocess,tempfile
R=Path(__file__).resolve().parents[1];j=R/'android/app/src/main/java/com/ahmedalajmi/alsaer';s=(j/'AlarmScheduler.java').read_text();expr=re.search(r'SNOOZE_MS = ([^;]+);',s).group(1);mapping=s[s.index('    static String channelFor('):s.index('    /** أيقونة كبيرة')].replace('Context c','String mode').replace('        String mode = soundMode(c);','')
with tempfile.TemporaryDirectory() as t:
 p=Path(t)/'ChannelAudit.java';p.write_text('class ChannelAudit{static String CH_SILENT="silent",CH_SYSTEM="system",CH_CHIME="chime";static long SNOOZE_MS='+expr+';'+mapping+'public static void main(String[] a){if(SNOOZE_MS!=600000)throw new AssertionError();for(String mode:new String[]{"silent","system","chime","unknown"})if(!channelFor(mode).equals(mode.equals("unknown")?"chime":mode))throw new AssertionError();System.out.println("PASS production channel mapping and fixed 600000ms snooze");}}');subprocess.run(['java','-jar','/tmp/alsaer-java/ecj.jar','-11','-proc:none','-d',t,str(p)],check=True);subprocess.run(['java','-cp',t,'ChannelAudit'],check=True)
a=(j/'ActionReceiver.java').read_text();assert 'System.currentTimeMillis() + AlarmScheduler.SNOOZE_MS, true' in a
for ch in ['CH_CHIME','CH_SILENT','CH_SYSTEM']:assert 'getNotificationChannel('+ch+') == null' in s
assert '"silent".equals(sound)?null:"system".equals(sound)?Settings.System.DEFAULT_NOTIFICATION_URI' in s
print('PASS source guards: snooze scheduled separately, existing channel settings not recreated, API24/25 silent/system/custom branch; real audio and delivery untested')
