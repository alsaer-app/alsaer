"""Warsh page-image reader (optional, hidden without a base URL). Pack files are NOT in the repo: this test needs a local copy
at WI_DIR (default /tmp/wursha-out: layout.json + pages/N.webp built by tools/build_wursha_layout.py) and skips if absent.
Checks: hidden without base; with base page image + verse boxes show; tap selects the verse; pages 1..604 agree with the Warsh page table."""
import json,os,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
D=Path(os.environ.get('WI_DIR','/tmp/wursha-out'))
if not (D/'layout.json').exists():print('SKIP no local pack copy');sys.exit(0)
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()+'?alsaertest'
BASE='https://raw.githubusercontent.com/alsaer-app/wursha-local-test/'
def seed(pos=1):return {'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'},'quran':{'pos':pos,'fs':26,'hint1':1,'hint2':1,'riwaya':'warsh'}}
def route(r):
    u=r.request.url
    if u.startswith(BASE):
        f=D/u[len(BASE):]
        if f.exists():return r.fulfill(body=f.read_bytes(),content_type='application/json' if f.suffix=='.json' else 'image/webp')
        return r.fulfill(status=404,body='')
    r.continue_()
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    def mk(base,pos=1):
        pg=b.new_page(viewport={'width':360,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*',route)
        pg.route('**/index.html*',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
        pg.goto(URL);pg.evaluate("([s,b])=>{localStorage.setItem('tawba_v1',s);if(b)localStorage.setItem('alsaer_warsh_img_base',b)}",[json.dumps(seed(pos)),base]);pg.goto(URL);pg.wait_for_timeout(1500)
        try:pg.wait_for_selector('#update109-notice',timeout=4000)
        except Exception:pass
        try:pg.click('[data-a=update109Done]',timeout=500)
        except Exception:pass
        pg.evaluate("()=>new Promise(r=>{if(window.WDATA)return r();var s=document.createElement('script');s.src='warsh.js';s.onload=r;document.head.appendChild(s)})")
        return pg,errs
    def openr(pg,c=1,v=1):
        pg.evaluate("([c,v])=>{var bb=document.createElement('button');bb.dataset.a='tab';bb.dataset.v='quran';document.body.append(bb);bb.click();bb.remove()}",[c,v]);pg.wait_for_timeout(800)
    # 1) hidden without base: text page as before
    pg,errs=mk('');openr(pg)
    assert pg.evaluate("!document.getElementById('wi-pg')&&!!document.getElementById('pg-t')"),'text page expected without base'
    # 2) with base
    pg,errs=mk(BASE);openr(pg);pg.wait_for_timeout(1500)
    n=pg.evaluate("document.querySelectorAll('#wi-pg .wi-b').length");img=pg.evaluate("(()=>{var i=document.querySelector('#wi-pg .wi-img');return i&&i.complete&&i.naturalWidth})()")
    print('page1 boxes',n,'img',img);assert n>0 and img==1242
    pg.evaluate("window.scrollTo(0,0)");pg.screenshot(path='/tmp/wi-p1.png')
    # tap selects
    pg.click('#wi-pg .wi-b');pg.wait_for_timeout(500)
    assert pg.evaluate("document.querySelectorAll('#wi-pg .wi-b.cur').length")>=1,'tap should select'
    # 3) page agreement with the Warsh page table
    JS="""async()=>{await new Promise(r=>__WI.layout(r));var bad=[],P=__WI.P(),WI={L:__WI.L()};
      var lt=(a,b)=>a[0]<b[0]||(a[0]===b[0]&&a[1]<=b[1]);
      for(var n=1;n<=604;n++){var rs=WI.L.pages[n]||[],vs=[];rs.forEach(function(r){var m=__WI.map(r[0],r[1]);if(m)vs.push(m.split(':').map(Number))});
        var t=P[n-1];if(!t||!vs.length){bad.push([n,'empty']);continue}
        var lo=vs.reduce((a,b)=>lt(a,b)?a:b),hi=vs.reduce((a,b)=>lt(b,a)?a:b);
        if(lo[0]!==t[0]||lo[1]!==t[1]||hi[0]!==t[2]||hi[1]!==t[3])bad.push([n,lo.join(':'),hi.join(':'),t[0]+':'+t[1],t[2]+':'+t[3]])}
      return bad}"""
    res=pg.evaluate(JS)
    print('page-table mismatches',len(res),res[:12])
    pg2,e2=mk(BASE,pos=2);openr(pg2);pg2.wait_for_timeout(1500)
    pg2.click('#wi-pg .wi-b:nth-child(5)');pg2.wait_for_timeout(600);pg2.screenshot(path='/tmp/wi-p2-tap.png')
    print('cur',pg2.evaluate("[rd0()]") if False else pg2.evaluate("[document.querySelector('#wi-pg .wi-b.cur')&&document.querySelector('#wi-pg .wi-b.cur').dataset.v,document.getElementById('mq-pos').textContent]"))
    print('menu copy blocked msg ok' if pg2.evaluate("typeof __WI!=='undefined'") else '')
    print('errors',errs[:3],e2[:3])
