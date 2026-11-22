from pathlib import Path
import subprocess,tempfile,os,shutil
r=Path(__file__).resolve().parents[1]
src=(r/'android/app/src/main/java/com/ahmedalajmi/alsaer/TfAgc.kt').read_text().replace('package com.ahmedalajmi.alsaer\n','')
h=src+'''
fun tone(n:Int,amp:Float):FloatArray=FloatArray(n){ (amp*Math.sin(it*0.3)).toFloat() }
fun rms(f:FloatArray):Double=Math.sqrt(f.map{it.toDouble()*it}.average())
fun main() {
 val quiet=TfAgc()
 var last=FloatArray(0)
 repeat(40){ last=tone(512,0.01f); quiet.process(last,512) }
 check(quiet.gain>8f&&quiet.gain<=20f) { "quiet raw voice not amplified: "+quiet.gain }
 check(rms(last)>0.05&&rms(last)<0.09) { "quiet voice not near the 0.07 target: "+rms(last) }
 val hiss=TfAgc()
 repeat(40){ val f=tone(512,0.0015f); hiss.process(f,512) }
 check(hiss.gain==1f) { "noise under the gate was amplified: "+hiss.gain }
 val loud=TfAgc()
 repeat(40){ val f=tone(512,0.9f); loud.process(f,512); check(f.all{Math.abs(it)<=0.981f}) { "clipped output" } }
 val mix=TfAgc()
 repeat(20){ mix.process(tone(512,0.02f),512) }
 val sm=mix.summary()
 check(sm.contains("voiced=20")&&sm.contains("frames=20")&&sm.contains("clipped=0")) { "summary wrong: "+sm }
 check(mix.windowLine().contains("n=20")&&mix.windowLine().contains("n=0")) { "window did not reset" }
 println("PASS V4 mic AGC: quiet boost to target, noise gate, no clipping, level stats")
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
