from pathlib import Path
import subprocess,tempfile,os,shutil
r=Path(__file__).resolve().parents[1]
s=(r/'android/app/src/main/java/com/ahmedalajmi/alsaer/TfEngine.kt').read_text()
method=s[s.index('    private fun stallNote('):s.index('    private fun onEvent(')]
method=method.replace('private fun','fun').replace('org.json.JSONArray(okList)','okList').replace('org.json.JSONArray(missList)','missList')
h='''class JSONObject { fun put(k:String,v:Any) {} }
class Harness {
 var exp=intArrayOf(1,2,3,4,5,6,7,8,9,10,11,12)
 var expWordJs=intArrayOf(0,0,0,0,1,1,1,1,2,2,2,2)
 var wordUnits=intArrayOf(4,4,4)
 var totalJsWords=3
 var cursorAbs=0
 var heardAll=ArrayList<Int>()
 var dropIdx=0
 var judged=BooleanArray(3)
 var lastEmitPos=-1
 var lastProgressMs=0L
 var lastStallMs=0L
 var clock=0L
 val logs=ArrayList<String>()
 fun nowMs()=clock
 fun dbg(m:String){logs.add(m)}
 fun emit(s:Int,t:String,d:String) {}
'''+method+'''}
fun main() {
 val h=Harness()
 h.heardAll.addAll(listOf(1,2,3,4));h.alignAndJudge(1,false)
 check(!h.judged[0]) { "in-progress word judged too soon" }
 h.heardAll.addAll(listOf(5,6));h.alignAndJudge(1,false)
 check(h.judged[0]&&!h.judged[1]&&h.cursorAbs==4) { "first complete word not advanced" }
 check(h.heardAll==listOf(5,6)) { "consumed speech was not removed" }
 h.heardAll.addAll(listOf(7,8,9));h.alignAndJudge(1,false)
 check(h.judged[1]&&!h.judged[2]&&h.cursorAbs==8) { "second word alignment drift" }
 h.heardAll.addAll(listOf(10,11,12));h.alignAndJudge(1,true)
 check(h.judged.all{it}&&h.cursorAbs==12&&h.heardAll.isEmpty()) { "final word did not finish" }
 val noise=Harness();noise.heardAll.addAll(listOf(20,21,22,23));noise.alignAndJudge(1,true)
 check(noise.judged.none{it}) { "noise produced a judgement" }
 check(h.logs.count{it.startsWith("word ")}==3&&h.logs.any{it=="word 0 matched=4/4 ok"}) { "per-word diagnostics missing: "+h.logs }
 val st=Harness();st.heardAll.addAll(listOf(20,21,22,23,24,25,26,27));st.clock=5000;st.alignAndJudge(1,false)
 check(st.logs.size==1&&st.logs[0].startsWith("stall lowmatch heard=8")) { "stall not diagnosed: "+st.logs }
 st.clock=6000;st.alignAndJudge(1,false)
 check(st.logs.size==1) { "stall log not throttled" }
 val fresh=Harness();fresh.heardAll.addAll(listOf(20,21,22,23,24,25,26,27));fresh.clock=1000;fresh.alignAndJudge(1,false)
 check(fresh.logs.isEmpty()) { "stall logged before the 3 s grace" }
 val j6=Harness();j6.exp=intArrayOf(1,2,3,4,5,6);j6.expWordJs=intArrayOf(0,0,0,0,0,0);j6.wordUnits=intArrayOf(6);j6.totalJsWords=1;j6.judged=BooleanArray(1)
 j6.heardAll.addAll(listOf(1,2,90,4,91,6));j6.alignAndJudge(1,true)
 check(j6.judged[0]&&j6.logs.contains("word 0 matched=4/6 ok")) { "4/6 must be accepted: "+j6.logs }
 check(j6.logs.contains("word 0 units exp=[1,2,3,4,5,6] heard=[1,2,90,4,91,6] ops=MMSMSM ins=0")) { "unit log missing: "+j6.logs }
 val j6b=Harness();j6b.exp=j6.exp;j6b.expWordJs=j6.expWordJs;j6b.wordUnits=intArrayOf(6);j6b.totalJsWords=1;j6b.judged=BooleanArray(1)
 j6b.heardAll.addAll(listOf(1,2,3,90,91,92));j6b.alignAndJudge(1,true)
 check(j6b.logs.contains("word 0 matched=3/6 miss")) { "3/6 must stay a miss: "+j6b.logs }
 val j3=Harness();j3.exp=intArrayOf(1,2,3,4,5,6,7);j3.expWordJs=intArrayOf(0,0,0,0,1,1,1);j3.wordUnits=intArrayOf(4,3);j3.totalJsWords=2;j3.judged=BooleanArray(2)
 j3.heardAll.addAll(listOf(1,2,3,4,5,90,7));j3.alignAndJudge(1,true)
 check(j3.logs.contains("word 1 matched=2/3 ok")&&j3.logs.contains("word 0 matched=4/4 ok")) { "2/3 must be accepted: "+j3.logs }
 check(j3.logs.none{it.startsWith("word 0 units")}) { "perfect word must not log units" }
 val j2=Harness();j2.exp=intArrayOf(1,2,3,4,5,6,7);j2.expWordJs=intArrayOf(0,0,0,0,1,1,1);j2.wordUnits=intArrayOf(4,3);j2.totalJsWords=2;j2.judged=BooleanArray(2)
 j2.heardAll.addAll(listOf(1,2,3,4,5,90,91));j2.alignAndJudge(1,true)
 check(j2.logs.contains("word 1 matched=1/3 miss")) { "1/3 must be a miss: "+j2.logs }
 println("PASS judging rule 60%: 4/6 and 2/3 accepted, 3/6 and 1/3 missed, unit log")
 println("PASS phoneme alignment: partial, consume, continuation, final, noise, word and stall diagnostics")
}
'''
base=Path.home()/'.gradle/caches/modules-2/files-2.1'
patterns=['**/kotlin-compiler-embeddable-1.9.22.jar','**/kotlin-stdlib-1.9.22.jar','**/kotlin-reflect-1.6.10.jar','**/kotlin-script-runtime-1.9.22.jar','**/trove4j-*.jar','**/annotations-13.0.jar']
jars=[str(next(base.glob(p))) for p in patterns]
cp=':'.join(jars)
with tempfile.TemporaryDirectory() as d:
 p=Path(d)/'Harness.kt';p.write_text(h)
 subprocess.run([str(Path(os.environ['JAVA_HOME'])/'bin/java') if os.environ.get('JAVA_HOME') else shutil.which('java'),'-cp',cp,'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler','-no-stdlib','-no-reflect','-classpath',cp,'-d',d,str(p)],check=True,capture_output=True)
 subprocess.run([str(Path(os.environ['JAVA_HOME'])/'bin/java') if os.environ.get('JAVA_HOME') else shutil.which('java'),'-cp',d+':'+cp,'HarnessKt'],check=True)
