#!/usr/bin/env python3
"""Static + runtime i18n coverage audit. Extract every Arabic UI string literal from src/ and ask the real
engine (trS in headless Chrome) for its en / fr translation. Fails (exit 1) on any missing/untranslated string
that is not in docs/i18n/allowlist.json. Usage: i18n_audit.py [--write]"""
import re,glob,json,os,sys,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
R=Path(__file__).resolve().parents[1]
AR=re.compile(r'[\u0600-\u06FF]')
PROTECTED={'src/constants/adhkar.js':'adhkar text (stays Arabic)','src/services/hisn.js':'Hisn al-Muslim supplications (stays Arabic)',
 'src/services/asma.js':'Names of Allah + meanings (needs scholarly review, phase 2)','src/services/ahadith.js':'hadith text (stays Arabic)',
 'src/services/mushaf-img-data.js':'Mushaf data','src/i18n/packs.js':'generated packs','src/services/i18n.js':'engine patterns/comments',
 'android/app/src/main/java/com/ahmedalajmi/alsaer/NativeStrings.java':'generated i18n table (tools/native_strings_gen.py)',
 'android/app/src/main/AndroidManifest.xml':'FGS subtype declaration + app name (brand, manifest constants)',
 'android/app/src/main/res/values/strings.xml':'app name (brand, same in all languages)',
 'android/app/src/main/res/layout/alsaer_widget.xml':'layout defaults; all widget text set via NativeStrings in AlsaerWidget',
 'widget_res/res/layout/alsaer_widget.xml':'widget source layout defaults (same as above)'}
def lex(t):
    """yield string-literal bodies of JS/Java source, skipping comments (simple lexer; regex literals ignored)."""
    i=0;n=len(t)
    while i<n:
        c=t[i]
        if c=='/' and t.startswith('//',i):
            j=t.find('\n',i);i=n if j<0 else j;continue
        if c=='/' and t.startswith('/*',i):
            j=t.find('*/',i+2);i=n if j<0 else j+2;continue
        if c in '\'"`':
            j=i+1;buf=[]
            while j<n and t[j]!=c:
                if t[j]=='\\' and j+1<n:buf.append(t[j:j+2]);j+=2;continue
                if t[j]=='\n' and c!='`':break
                buf.append(t[j]);j+=1
            yield ''.join(buf);i=j+1;continue
        i+=1
ATTR=re.compile(r'(?:placeholder|aria-label|title|alt)=\\?"([^"\\]*)')
def segs(text):
    out=[]
    for s in lex(text):
        if not AR.search(s):continue
        s=s.replace("\\'","'").replace('\\"','"').replace('\\n',' ')
        for m in ATTR.finditer(s):
            if AR.search(m.group(1)):out.append(re.sub(r'\s+',' ',m.group(1)).strip())
        s=re.sub(r'[\w-]+=\\?"[^"]*"?','',s);s=re.sub(r'<[^>]*>|[<>]','\x00',s);s=s.strip('"\' =')
        for part in re.split(r'\x00|\$\{[^}]*\}',s):
            part=re.sub(r'&[a-z]+;',' ',part);part=re.sub(r'\s+',' ',part).strip()
            if AR.search(part):out.append(part)
    return out
def collect():
    res={}
    files=sorted(glob.glob(str(R/'src/**/*.js'),recursive=True))
    for f in files:
        rel=os.path.relpath(f,R)
        if rel in PROTECTED:continue
        t=open(f,encoding='utf-8').read()
        for s in segs(t):res.setdefault(s,set()).add(rel)
    for f in sorted(glob.glob(str(R/'src/shell/*.html'))):
        rel=os.path.relpath(f,R);t=open(f,encoding='utf-8').read()
        t=re.sub(r'<style.*?</style>|<script.*?</script>','',t,flags=re.S)
        for part in re.split(r'<[^>]*>',t):
            part=re.sub(r'\s+',' ',part).strip()
            if AR.search(part):res.setdefault(part,set()).add(rel)
        for m in re.finditer(r'(?:placeholder|aria-label|title|alt)="([^"]*)"',t):
            if AR.search(m.group(1)):res.setdefault(m.group(1).strip(),set()).add(rel)
    return res
def native():
    out={}
    for f in glob.glob(str(R/'android/**/*'),recursive=True)+glob.glob(str(R/'native_overlay/**/*'),recursive=True)+glob.glob(str(R/'widget_res/**/*'),recursive=True):
        if not os.path.isfile(f) or not f.endswith(('.kt','.java','.xml')):continue
        try:t=open(f,encoding='utf-8').read()
        except Exception:continue
        rel=os.path.relpath(f,R)
        if rel in PROTECTED:continue
        if f.endswith('.xml'):
            t=re.sub(r'<!--.*?-->','',t,flags=re.S)
            for m in re.finditer(r'<(?:string|item)[^>]*>([^<]*[\u0600-\u06FF][^<]*)</|"([^"]*[\u0600-\u06FF][^"]*)"',t):
                v=re.sub(r'\s+',' ',m.group(1) or m.group(2)).strip()
                if v:out.setdefault(v,set()).add(rel)
        else:
            for v in segs(t):out.setdefault(v,set()).add(rel)
    return out
def run(strings):
    from playwright.sync_api import sync_playwright
    class Q(SimpleHTTPRequestHandler):
        def log_message(self,*a):pass
    srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Q,directory=str(R/'www')));threading.Thread(target=srv.serve_forever,daemon=True).start()
    with sync_playwright() as p:
        b=p.chromium.launch(channel='chrome',args=['--no-sandbox']);pg=b.new_page()
        pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html?alsaertest');pg.wait_for_timeout(1500)
        res={}
        for l in ('en','fr'):
            res[l]=pg.evaluate('([a,l])=>a.map(s=>{try{return __I18N.trS(s,l)}catch(e){return null}})',[strings,l])
        b.close()
    srv.shutdown();return res
def main():
    st=collect();keys=sorted(st)
    al=json.load(open(R/'docs/i18n/allowlist.json',encoding='utf-8')) if (R/'docs/i18n/allowlist.json').exists() else {}
    quoted=set();tr=run(keys);rep={'total':len(keys),'protected_files_skipped':PROTECTED}
    for l in ('en','fr'):
        miss=[]
        for k,v in zip(keys,tr[l]):
            if k in al:continue
            if len(re.findall(r'[\u0621-\u063F\u0641-\u064A]',k))<2:continue   # digits/punctuation/single-letter fragment, not text
            if len(re.findall(r'[\u064B-\u0652]',k))>=4:quoted.add(k);continue   # fully vowelled Quran/hadith/dua text: stays Arabic by design
            if v is None or AR.search(re.sub(r'[\u0660-\u0669]','',v)):miss.append({'ar':k,'got':v,'files':sorted(st[k])})
        rep[l]={'missing':len(miss),'items':miss}
    rep['quoted_arabic_kept_by_design']=sorted(quoted)
    nat=native();rep['native_arabic_literals']=[{'ar':k,'files':sorted(v)} for k,v in sorted(nat.items())]
    if '--write' in sys.argv:
        (R/'docs/i18n').mkdir(parents=True,exist_ok=True)
        json.dump(rep,open(R/'docs/i18n/coverage-report.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print('strings',len(keys),'| missing en',rep['en']['missing'],'| missing fr',rep['fr']['missing'],'| native arabic literals',len(nat))
    sys.exit(1 if rep['en']['missing'] or rep['fr']['missing'] else 0)
main()
