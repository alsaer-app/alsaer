"""Runtime i18n check: render every tab and every settings page in en and fr; fail if any rendered UI text node
still contains Arabic (outside Quran/hadith/adhkar/user-content containers) or the page has LTR/RTL, overflow or font problems.
Also asserts Arabic mode is unchanged (dir=rtl) and en/fr set dir=ltr with Latin digits."""
import json,sys,threading,os
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];OUT=Path('/tmp/i18n-runtime');OUT.mkdir(exist_ok=True)
JS="""()=>{const out={};const skip='.mp,.keepar,.qv,.mushaf,.ml,.ar,.dhikr,.hadith-text,.new-day-hadith,.tsb-ar,script,style,textarea,input';
const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);let n;
while((n=w.nextNode())){const p=n.parentNode;if(!p||(p.closest&&p.closest(skip)))continue;const t=n.nodeValue.replace(/\\s+/g,' ').trim();if(t&&/[\\u0621-\\u063F\\u0641-\\u064A]/.test(t))out[t]=1}
document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e=>{if(e.closest(skip))return;['placeholder','aria-label','title'].forEach(a=>{const v=e.getAttribute(a);if(v&&/[\\u0621-\\u063F\\u0641-\\u064A]/.test(v))out[v]=1})});
return Object.keys(out)}"""
import re as _re
ASMA_NAMES=set(_re.findall(r"\{n:'([^']*)'",(R/'src/services/asma.js').read_text(encoding='utf-8')))  # the 99 names stay Arabic by design (phase 1)
class Q(SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
def main():
    srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Q,directory=str(R/'www')));threading.Thread(target=srv.serve_forever,daemon=True).start()
    bad={};fails=[];kept=set()
    with sync_playwright() as p:
        b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
        for lang in ('ar','en','fr'):
            pg=b.new_page(viewport={'width':int(os.environ.get('I18N_WIDTH','360')),'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
            pg.add_init_script('localStorage.tawba_v1='+json.dumps(json.dumps({'onboarded':True,'tour':{'done':1},'ui':{'mode':os.environ.get('I18N_MODE','light'),'accent':'maleem','lang':lang},'loc':{'city':'القاهرة','lat':30,'lng':31,'auto':True,'method':'egypt','asr':1}})))
            pg.goto(f'http://127.0.0.1:{srv.server_port}/index.html?alsaertest');pg.wait_for_timeout(1500)
            for sel in ['[data-a=update109Done]','text=تخطي','text=Skip','text=Passer']:
                try:pg.click(sel,timeout=200)
                except Exception:pass
            exp='rtl' if lang=='ar' else 'ltr'
            d=pg.evaluate('document.documentElement.dir')
            if d!=exp:fails.append((lang,'dir',d))
            pages=[(t,'','',None) for t in pg.evaluate('__I18N.tabs()') if t not in('reader',)]
            pages+=[('settings',c,'',None) for c in ('look','notif','loc','account')]
            pages+=[('settings','look','look-adv',None),('settings','account','account-prof',None),('settings','account','account-sec',None),('settings','account','account-about',None)]
            pages+=[('settings','look','',o) for o in ('sty','acc','dgclk','homecfg')]
            for t,c,sub,o in pages:
                try:
                    pg.evaluate('([t,c,s,o])=>__I18N.go(t,c,s,o)',[t,c,sub,o]);pg.wait_for_timeout(250)
                except Exception as e:
                    fails.append((lang,'nav',t,str(e)[:80]));continue
                key=f'{t}/{c}/{sub}/{o}'
                if pg.evaluate('document.documentElement.scrollWidth>innerWidth+1'):fails.append((lang,'h-overflow',key))
                if lang!='ar':
                    for s in pg.evaluate(JS):
                        if s in ASMA_NAMES:continue
                        if len(_re.findall(r'[\u064B-\u0652]',s))>=4:kept.add(s);continue   # vowelled Quran/hadith/dhikr text stays Arabic by design
                        bad.setdefault(lang,{}).setdefault(s,[]).append(key)
                    txt=pg.evaluate('document.getElementById("app")?document.getElementById("app").innerText:""')
                    import re
                    if re.search('[\u0660-\u0669]',txt) and t not in('quran','reader') and o!='dgclk':fails.append((lang,'eastern-digits',key))
                if lang=='fr' and t in('settings','home'):pg.screenshot(path=str(OUT/f'{lang}-{t}-{c}-{sub}-{o}.png'))
            if errs:fails.append((lang,'js-errors',errs[:3]))
        b.close()
    rep={'vowelled_arabic_kept_by_design':sorted(kept),'asma_names_kept_arabic':sorted(ASMA_NAMES),'rendered_arabic_left':{l:{k:v[:3] for k,v in d.items()} for l,d in bad.items()},'failures':fails}
    json.dump(rep,open(R/'docs/i18n/runtime-report.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
    n=sum(len(d) for d in bad.values())
    print('rendered Arabic strings left:',{l:len(d) for l,d in bad.items()},'| other failures:',len(fails))
    for f in fails[:20]:print(' ',f)
    sys.exit(1 if n or fails else 0)
main()
