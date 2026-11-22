"""Run the production Java merge methods without Android, not a second implementation."""
from pathlib import Path
import subprocess, tempfile
root=Path(__file__).resolve().parents[1]
s=(root/'android/app/src/main/java/com/ahmedalajmi/alsaer/SherpaAsr.java').read_text()
a=s.index('    private void mergeAdd(')
b=s.index('    private void submitDecode(',a)
methods=s[a:b]
harness='''import java.util.*;
public class MergeRegression {
 static final int SAMPLE_RATE=16000;
 final ArrayList<float[]> mergeAcc=new ArrayList<>();
 int mergeLen=0;
 final ArrayList<Integer> decoded=new ArrayList<>();
 static void diag(String s) {}
 void submitDecode(int sid,float[] data) { decoded.add(data.length); }
'''+methods+'''
 static float[] sec(double n) { float[] a=new float[(int)(SAMPLE_RATE*n)]; Arrays.fill(a,.1f); return a; }
 static void check(boolean c,String s) { if(!c)throw new AssertionError(s);System.out.println("PASS "+s); }
 public static void main(String[] args) {
   MergeRegression m=new MergeRegression();
   m.mergeAdd(1,sec(1.4));
   check(m.decoded.isEmpty(),"1.4 second VAD stays pending");
   // No wall-time callback exists in v2: a long next phrase cannot flush pending audio.
   m.mergeAdd(1,sec(2.7));
   check(m.decoded.isEmpty(),"4.1 seconds stays pending across pauses");
   m.mergeAdd(1,sec(2));
   check(m.decoded.size()==1&&m.decoded.get(0)==(int)(6.1*SAMPLE_RATE),"three VAD segments decode together at 6.1s");
   m.mergeAdd(1,sec(1.6));
   m.mergeAdd(1,sec(8));
   check(m.decoded.size()==2&&m.decoded.get(1)==(int)(9.6*SAMPLE_RATE),"early split merges pending phrase, no short preflush");
   m.mergeAdd(1,sec(1.9));
   check(m.decoded.size()==2,"short final phrase waits");
   m.mergeFlush(1);
   check(m.decoded.size()==3&&m.decoded.get(2)==(int)(1.9*SAMPLE_RATE),"stop is the only short flush");
   m.mergeFlush(1);
   check(m.decoded.size()==3,"empty stop does not duplicate audio");
   MergeRegression padded=new MergeRegression();
   float[] eight=new float[SAMPLE_RATE*8];Arrays.fill(eight,SAMPLE_RATE*3,SAMPLE_RATE*5,.1f);
   padded.mergeAdd(1,eight);
   check(padded.decoded.isEmpty()&&padded.mergeLen==SAMPLE_RATE*2,"8s early split with 2s speech cannot defeat minimum");
   padded.mergeAdd(1,sec(4));
   check(padded.decoded.size()==1&&padded.decoded.get(0)==SAMPLE_RATE*6,"minimum counts trimmed context, not silence");
 }
}
'''
assert 'elapsedRealtime() - lastVadSegAt' not in s
assert 'mergeFlush(mySid); /*' not in s
with tempfile.TemporaryDirectory() as d:
    p=Path(d)/'MergeRegression.java';p.write_text(harness)
    subprocess.run(['/home/sandbox/jdk17/bin/javac',str(p)],check=True)
    subprocess.run(['/home/sandbox/jdk17/bin/java','-cp',d,'MergeRegression'],check=True)
