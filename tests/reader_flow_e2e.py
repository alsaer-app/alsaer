"""Flow reader regression (Hafs only; Warsh was removed): verse counts for all 114 suras, ayah markers, bookmarks,
and safe fallback of a saved riwaya=warsh to Hafs. Opens www/index.html from disk."""
import json,re,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
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
    return pg,errs
def cur(pg): return pg.evaluate("(document.querySelector('.mq-v.cur')||{dataset:{}}).dataset.v")
def riw(pg): return json.loads(pg.evaluate("localStorage.tawba_v1"))['quran']['riwaya']
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    # 1) saved riwaya=warsh falls back to Hafs; every sura renders all Hafs verses with ayah markers
    pg,errs=open_page(b,base(riwaya='warsh'));assert riw(pg)=='hafs',riw(pg)
    Q=pg.evaluate("window.QDATA.s");tot=0
    for c in range(1,115):
        click(pg,'qsura',str(c));pg.wait_for_timeout(90)
        vs=pg.evaluate("[].map.call(document.querySelectorAll('.mq-v'),e=>(e.querySelector('.ayo b')||{}).textContent)")
        assert len(vs)==len(Q[c-1]),(c,len(vs),len(Q[c-1]))
        for i,mk in enumerate(vs):
            assert mk and num(mk)==i+1,(c,i+1,'marker');tot+=1
    assert tot==6236,tot;assert not errs,errs
    assert not pg.evaluate("!!window.WDATA") and not pg.evaluate("!!document.querySelector('[data-a=qriw]')")
    # 2) old Warsh-tagged bookmarks stay in storage but are not shown/used
    S=base(riwaya='warsh');S['quran']['bms']=[{'c':18,'v':19,'p':562,'w':'w'}];S['quran']['bmMig']=1;S['quran']['bmMigW']=1
    pg2,errs=open_page(b,S);click(pg2,'qsura','18');pg2.wait_for_timeout(400);click(pg2,'qjump');pg2.wait_for_timeout(400)
    st=json.loads(pg2.evaluate("localStorage.tawba_v1"));assert st['quran']['riwaya']=='hafs' and not errs
    # 3) Hafs + Warsh bookmark on the same surah reopen in their own riwaya and ayah; legacy untagged bm2 is Hafs
    S=base(riwaya='hafs');S['bm']=[562];S['quran']['bm2']={'c':18,'v':19}
    S['quran']['bms']=[{'c':18,'v':19,'p':562},{'c':18,'v':19,'p':562,'w':'w'}];S['quran']['bmMig']=1
    pg3,errs=open_page(b,S);click(pg3,'qsura','18');pg3.wait_for_timeout(500);click(pg3,'qjump');pg3.wait_for_timeout(300)
    click(pg3,'qbmsgo','18:19:h');pg3.wait_for_timeout(500);assert cur(pg3)=='18:19' and riw(pg3)=='hafs'
    assert pg3.evaluate("document.querySelectorAll('.mq-v').length")==110
    assert json.loads(pg3.evaluate("localStorage.tawba_v1"))['bm']==[562] and not errs
    S=base(riwaya='hafs');S['quran']['bm2']={'c':18,'v':19};pg4,errs=open_page(b,S);click(pg4,'qsura','18');pg4.wait_for_timeout(400)
    assert pg4.evaluate("document.querySelector('.mq-bm').classList.contains('on')") and not errs
    b.close()
print('OK: 114 Hafs suras, %d verses, Warsh fallback to Hafs'%tot)
