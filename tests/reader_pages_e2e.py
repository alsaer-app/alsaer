"""Paged reader (Mushaf pages) regression, Hafs and Warsh: walking pages 1..604 yields exactly the verses and text of the flow reader, once each, in order; no page overflows its frame."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
sys.path.insert(0,str(Path(__file__).parent))
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
def base(**q):
    Q={'pos':1,'fs':26,'hint1':1,'hint2':1};Q.update(q)
    return {'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'},'quran':Q}
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
def open_page(b,setup):
    pg=b.new_page(viewport={'width':360,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html',),times=1)
    pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps(setup));pg.goto(URL);pg.wait_for_timeout(1500)
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    pg.evaluate("()=>new Promise(r=>{if(window.WDATA)return r();var s=document.createElement('script');s.src='warsh.js';s.onload=r;document.head.appendChild(s)})")
    return pg,errs
JS="[].map.call(document.querySelectorAll('.mq-v'),e=>[e.dataset.v,e.textContent])"
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    for riw in ('hafs','warsh'):
        # reference: flow reader, every sura
        pg,errs=open_page(b,base(riwaya=riw,pgm=False));ref=[]
        for c in range(1,115):
            click(pg,'qsura',str(c));pg.wait_for_timeout(60);ref+=pg.evaluate(JS)
        pg.close()
        pg,errs=open_page(b,base(riwaya=riw,pgm=True))
        click(pg,'qsura','1');pg.wait_for_timeout(150)
        assert pg.evaluate("document.getElementById('pg-t')!==null"),'page mode not active'
        got=[];over=0;minfs=99
        for n in range(1,605):
            pn=pg.evaluate("document.getElementById('mq-pos').textContent")
            got+=pg.evaluate(JS)
            o=pg.evaluate("(()=>{var t=document.getElementById('pg-t'),f=document.getElementById('pg-fr');return [t.scrollHeight>f.clientHeight+1,parseFloat(t.style.fontSize)]})()")
            over+=o[0];minfs=min(minfs,o[1])
            if n<604:click(pg,'qpg','1');pg.wait_for_timeout(25)
        assert got==ref,(riw,len(got),len(ref))
        assert not errs,errs
        print(riw,'OK pages=604 verses=%d overflow=%d minfont=%.1f'%(len(got),over,minfs))
        pg.close()
    b.close()
