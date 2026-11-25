"""Flow reader regression for both riwayat (Hafs and Warsh): verse counts, text integrity, bookmark migration.
Opens www/index.html from disk. Warsh text is checked against warsh.js itself: every verse must render as the
stored string minus its trailing verse number (display-only glyph substitutions applied), and the stored number
must equal the verse's position."""
import json,re,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
def fix(t):
    t=t.replace('\u06D2','\u064A')
    t=re.sub('(^|[\\s\u00A0\u06D6-\u06DF\u064B-\u0652]|[وف][\u064B-\u0652])ا[\u064B-\u0652]?\u06EC',lambda m:m.group(1)+'\u0671',t)
    return re.sub('(^|[\\s\u00A0])ا[\u064B-\u0652]?\u06EA',lambda m:m.group(1)+'\u0671',t)
def num(s): return int(s.translate({0x660+i:48+i for i in range(10)}))
def base(**q):
    Q={'pos':562,'fs':26,'hint1':1,'hint2':1};Q.update(q)
    return {'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'},'quran':Q}
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
def open_page(b,setup):
    pg=b.new_page(viewport={'width':360,'height':844});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps(setup));pg.goto(URL);pg.wait_for_timeout(1500)
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    pg.evaluate("()=>new Promise(r=>{if(window.WDATA)return r();var s=document.createElement('script');s.src='warsh.js';s.onload=r;document.head.appendChild(s)})")
    return pg,errs
def cur(pg): return pg.evaluate("(document.querySelector('.mq-v.cur')||{dataset:{}}).dataset.v")
def riw(pg): return json.loads(pg.evaluate("localStorage.tawba_v1"))['quran']['riwaya']
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    # 1) Warsh: every sura, every verse
    pg,errs=open_page(b,base(riwaya='warsh'))
    W=pg.evaluate("window.WDATA.s");B=pg.evaluate("window.WDATA.b");tot=0
    for c in range(1,115):
        click(pg,'qsura',str(c));pg.wait_for_timeout(90)
        vs=pg.evaluate("[].map.call(document.querySelectorAll('.mq-v'),e=>[e.textContent,(e.querySelector('.ayo b')||{}).textContent])")
        bs=pg.evaluate("(document.querySelector('.mq-bs')||{}).textContent||''")
        assert len(vs)==len(W[c-1]),(c,len(vs),len(W[c-1]))
        for i,(txt,mk) in enumerate(vs):
            m=re.match(r'^(.*?)\s+([٠-٩]+)$',W[c-1][i]);assert m and num(m.group(2))==i+1,(c,i+1)
            assert re.sub(r'\s+',' ',txt.split('\u06DD')[0]).strip()==re.sub(r'\s+',' ',fix(m.group(1))).strip(),(c,i+1,'text')
            assert mk and num(mk)==i+1,(c,i+1,'marker');tot+=1
        assert (bs==B) if c not in(1,9) else not bs,(c,'basmala')
    assert tot==6214,tot;assert not errs,errs
    # 2) legacy Warsh page bookmarks migrate through Warsh pages, originals untouched
    S=base(riwaya='warsh');S['bm']=[562,1,300];pg2,errs=open_page(b,S)
    click(pg2,'qsura','18');pg2.wait_for_timeout(400);click(pg2,'qjump');pg2.wait_for_timeout(400)
    P=pg2.evaluate("window.WDATA.p");st=json.loads(pg2.evaluate("localStorage.tawba_v1"))
    assert [(x['c'],x['v'],x.get('w')) for x in st['quran']['bms']]==[(P[n-1][0],P[n-1][1],'w') for n in (562,1,300)],st['quran']['bms']
    assert st['bm']==[562,1,300] and not errs
    # 3) Hafs + Warsh bookmark on the same surah reopen in their own riwaya and ayah; legacy untagged bm2 is Hafs
    S=base(riwaya='hafs');S['bm']=[562];S['quran']['bm2']={'c':18,'v':19,'w':'w'}
    S['quran']['bms']=[{'c':18,'v':19,'p':562},{'c':18,'v':19,'p':562,'w':'w'}];S['quran']['bmMig']=1
    pg3,errs=open_page(b,S);click(pg3,'qsura','18');pg3.wait_for_timeout(500);click(pg3,'qjump');pg3.wait_for_timeout(300)
    click(pg3,'qbmsgo','18:19:h');pg3.wait_for_timeout(500);assert cur(pg3)=='18:19' and riw(pg3)=='hafs'
    assert pg3.evaluate("document.querySelectorAll('.mq-v').length")==110
    click(pg3,'qidx');pg3.wait_for_timeout(300);pg3.click('.mq-ixc');pg3.wait_for_timeout(1500)
    print(cur(pg3),riw(pg3),pg3.evaluate("document.querySelectorAll('.mq-v').length"));assert cur(pg3)=='18:19' and riw(pg3)=='warsh' and pg3.evaluate("document.querySelectorAll('.mq-v').length")==105
    assert json.loads(pg3.evaluate("localStorage.tawba_v1"))['bm']==[562] and not errs
    S=base(riwaya='hafs');S['quran']['bm2']={'c':18,'v':19};pg4,errs=open_page(b,S);click(pg4,'qsura','18');pg4.wait_for_timeout(400)
    assert pg4.evaluate("document.querySelector('.mq-bm').classList.contains('on')") and not errs
    b.close()
print('OK: 114 Warsh suras, %d verses, bookmark migration and riwaya reopen'%tot)
