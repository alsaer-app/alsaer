from pathlib import Path
import subprocess,tempfile,os,shutil
r=Path(__file__).resolve().parents[1]
s=(r/'android/app/src/main/java/com/ahmedalajmi/alsaer/TfEngine.kt').read_text()
method=s[s.index('    private fun alignAndJudge('):s.index('    private fun onEvent(')]
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
 println("PASS phoneme alignment: partial, consume, continuation, final, noise")
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
