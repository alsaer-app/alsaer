"""Offline whole-Quran word-map regression, using the production Kotlin helper.

Fixture: phonetic unit counts per word, derived from Quran Lab's public reference.
No network or Android device is needed. Set KOTLIN_TEST_CP to a Kotlin compiler
classpath, or first run the Android Gradle build to populate its compiler cache.
"""
from pathlib import Path
import gzip, json, subprocess, tempfile, os, shutil

ROOT = Path(__file__).resolve().parents[1]
fixture = json.loads(gzip.decompress((ROOT / 'tests/fixtures/tf-reference-word-units.json.gz').read_bytes()))
js = (ROOT / 'www/quran.js').read_text()
data = json.JSONDecoder().raw_decode(js.split('window.QDATA=', 1)[1])[0]
rows = []
changed = []
for s, surah in enumerate(fixture['surahs'], 1):
    assert len(surah) == len(data['s'][s-1]), s
    for a, counts in enumerate(surah, 1):
        words = data['s'][s-1][a-1].split()
        if s != 1 and a == 1 and s != 9:
            assert len(words) >= 5
            words = words[4:]  # same basmala removal as rcLoad
        ui = len(words)
        ref = len(counts)
        rows.append((s, a, ui, counts))
        if ref != ui:
            changed.append((s, a, ui, ref))
assert len(rows) == 6236
assert len(changed) == 27, changed
assert all(a == 1 or (s, a) == (42, 2) for s, a, _, _ in changed)

source = (ROOT / 'android/app/src/main/java/com/ahmedalajmi/alsaer/TfWordMap.kt').read_text()
checks = []
for s, a, ui, counts in rows:
    checks.append(f'checkAyah({s},{a},{ui},intArrayOf({",".join(map(str,counts))}))')
harness = '''
fun checkAyah(s:Int,a:Int,ui:Int,counts:IntArray) {
    val map=TfWordMap.map(s,a,counts.size,ui) ?: error("map rejected $s:$a UI=$ui ref=${counts.size}")
    check(map.size==counts.size)
    check(map.toSet()==(0 until ui).toSet()) { "written word omitted $s:$a" }
    check(map.zipWithNext().all { (x,y) -> y==x || y==x+1 }) { "map not monotonic $s:$a" }
    val total=IntArray(ui)
    for(i in counts.indices) { check(counts[i]>0);total[map[i]]+=counts[i] }
    check(total.all{it>0} && total.sum()==counts.sum()) { "units lost $s:$a" }
    check(TfWordMap.map(s,a,counts.size+1,ui)==null) { "unexplained mismatch accepted $s:$a" }
}
'''.replace('map.zipWithNext()', 'map.toList().zipWithNext()')
# Keep each JVM method small, including long surahs.
methods=[]
for start in range(0,len(checks),80):
    methods.append('fun batch'+str(start//80)+'(){\n'+'\n'.join(checks[start:start+80])+'\n}')
harness += '\n'.join(methods)
harness += '\nfun main(){\n'+'\n'.join('batch'+str(i)+'()' for i in range(len(methods)))+'''
check(TfWordMap.map(36,1,2,1)!!.contentEquals(intArrayOf(0,0)))
check(TfWordMap.map(42,2,3,1)!!.contentEquals(intArrayOf(0,0,0)))
check(TfWordMap.map(10,1,7,5)!!.contentEquals(intArrayOf(0,0,0,1,2,3,4)))
println("PASS whole Quran: 6236 ayat; 27 opening-word folds; no lost/reordered units; unexplained mismatches rejected")
}
'''
base=Path.home()/'.gradle/caches/modules-2/files-2.1'
cp=os.environ.get('KOTLIN_TEST_CP')
if not cp:
    patterns=['**/kotlin-compiler-embeddable-1.9.22.jar','**/kotlin-stdlib-1.9.22.jar','**/kotlin-reflect-1.6.10.jar','**/kotlin-script-runtime-1.9.22.jar','**/trove4j-*.jar','**/annotations-13.0.jar']
    cp=':'.join(str(next(base.glob(p))) for p in patterns)
java=str(Path(os.environ['JAVA_HOME'])/'bin/java') if os.environ.get('JAVA_HOME') else shutil.which('java')
with tempfile.TemporaryDirectory() as d:
    # One source package, same helper as the APK, not a reimplementation of it.
    p=Path(d)/'Harness.kt';p.write_text(source+'\n'+harness)
    out=subprocess.run([java,'-cp',cp,'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler','-no-stdlib','-no-reflect','-classpath',cp,'-d',d,str(p)],capture_output=True,text=True)
    if out.returncode:
        print(out.stdout); print(out.stderr); out.check_returncode()
    subprocess.run([java,'-cp',d+':'+cp,'com.ahmedalajmi.alsaer.HarnessKt'],check=True)
print('Fixture source:',fixture['source'])
print('Baseline mismatches:', changed)
