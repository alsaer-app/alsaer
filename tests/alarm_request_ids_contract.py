"""Compile and execute the production allocator; source guards cover Android identity migration."""
from pathlib import Path
import subprocess,tempfile,shutil,os
root=Path(__file__).resolve().parents[1];java=root/'android/app/src/main/java/com/ahmedalajmi/alsaer'
with tempfile.TemporaryDirectory() as t:
 p=Path(t);(p/'AlarmRequestIds.java').write_text((java/'AlarmRequestIds.java').read_text())
 (p/'TestIds.java').write_text('''package com.ahmedalajmi.alsaer;
import java.util.*;
class TestIds {
 static class Memory implements AlarmRequestIds.Store {
  Map<String,Integer> m=new HashMap<>();boolean fail=false;
  public int get(String k,int d){return m.getOrDefault(k,d);}
  public boolean save(String k,int v,int n){if(fail)return false;m.put(k,v);m.put("request-v2-next",n);return true;}
 }
 public static void main(String[] args){
  if("Aa".hashCode()!="BB".hashCode())throw new AssertionError();
  Memory m=new Memory();Set<Integer> ids=new HashSet<>();
  for(String id:new String[]{"Aa","BB","Aa#snz","BB#snz","","a:b","a"})for(String purpose:new String[]{"alarm","snooze","notification","done","snooze-action"}){
   int n=AlarmRequestIds.allocate(m,id,purpose);if(!ids.add(n))throw new AssertionError("collision");
   if(n!=AlarmRequestIds.allocate(m,id,purpose))throw new AssertionError("unstable");
  }
  if(AlarmRequestIds.allocate(m,"ab","c")==AlarmRequestIds.allocate(m,"a","bc"))throw new AssertionError("boundary");
  m.fail=true;try{AlarmRequestIds.allocate(m,"new","alarm");throw new AssertionError("failure ignored");}catch(IllegalStateException expected){}
  m.fail=false;m.m.put("request-v2-next",Integer.MAX_VALUE);try{AlarmRequestIds.allocate(m,"overflow","alarm");throw new AssertionError("overflow");}catch(IllegalStateException expected){}
  System.out.println("PASS production Java allocator: colliding strings, all purposes, stable persistence, separator boundaries, fail-closed commit/exhaustion");
 }
}''')
 compiler=['javac'] if shutil.which('javac') else ['java','-jar',os.environ.get('ECJ_JAR','/tmp/alsaer-java/ecj.jar'),'-11','-proc:none']
 subprocess.run(compiler+['-d',t,str(p/'AlarmRequestIds.java'),str(p/'TestIds.java')],check=True)
 subprocess.run(['java','-cp',t,'com.ahmedalajmi.alsaer.TestIds'],check=True)
s=(java/'AlarmScheduler.java').read_text()
for required in ['.setData(identity)','rememberAlarm(c,rc,identity)','alarm-records-v2','legacy-items-v2','legacyCode(id+"#snz")','cancelLegacyAction','legacy-identity-cleaned-v2','code(c,id,"notification")','code(c,id,"done")','code(c,id,"snooze-action")']:
 assert required in s,required
assert 'code(id' not in s
assert s.index('cancelAll(c);')<s.index('scheduleAt(c, it, at, false)')
print('PASS Android source guards: normal/snooze identity records, cancel old integer+legacy snooze/action IDs before rescheduling, unique notification/content/action IDs')
