"""2.0.4: backup reminder frequency sheet (off/daily/weekly/two weeks/monthly) and its schedule. Default (no backupEvery) stays Friday weekly."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
F=[]
def ck(c,m):
    if not c:F.append(m)
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
NAT="""(()=>{window.__sched=[];var o={notificationsEnabled:()=>true,canExactAlarms:()=>true,setSchedule:(s)=>{window.__sched.push(s);return 'ok'},setSoundMode:()=>'ok'};window.AlsaerNative=new Proxy(o,{get:(t,k)=>k in t?t[k]:(()=>'')})})()"""
KEY='alsaer_daily_reminders_v1'
def items(pg):
    pg.evaluate("window.__sched=[]");pg.evaluate("window.alsaerNativeSyncSoon(true)");pg.wait_for_timeout(1700)
    s=pg.evaluate("window.__sched")
    if not s:return None
    j=json.loads(s[-1]);return j if isinstance(j,list) else j.get('items',j.get('list',[]))
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780});ctx.add_init_script(NAT)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}));pg.goto(URL);pg.wait_for_timeout(1500)
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    def setr(d):
        pg.evaluate("([k,d])=>localStorage.setItem(k,JSON.stringify(Object.assign({consent:true,enabled:true,prayers:false,salat:false,wird:false,malik:false,kahf:false,dua:false,weekly:false,fasting:false},d)))",[KEY,d])
    def bk(d):
        setr(d);it=items(pg)
        return [] if it is None else [x for x in it if str(x.get('id','')).startswith('backup')]
    # default: weekly Friday, unchanged
    w=bk({'backup':True,'backupTime':'19:00'})
    ck(len(w)==1 and w[0]['id']=='backup' and w[0]['dow']==[5] and w[0]['h']==19 and w[0]['m']==0,'default weekly changed %r'%w)
    w=bk({'backup':True,'backupEvery':'7','backupTime':'19:00'});ck(len(w)==1 and w[0]['dow']==[5],'7 = weekly %r'%w)
    w=bk({'backup':True,'backupEvery':'1','backupTime':'08:30'});ck(len(w)==1 and w[0]['dow']==[] and w[0]['h']==8 and w[0]['m']==30,'daily %r'%w)
    w=bk({'backup':False,'backupEvery':'1'});ck(w==[],'off still schedules %r'%w)
    w=bk({'backup':True,'backupEvery':'14','backupTime':'19:00'})
    ck(1<=len(w)<=5 and all('at' in x for x in w),'14d entries %r'%[x.get('id') for x in w])
    if len(w)>=2:ck(abs((w[1]['at']-w[0]['at'])-14*86400000)<=3700000,'14d spacing')
    w=bk({'backup':True,'backupEvery':'30','backupTime':'19:00'});ck(1<=len(w)<=3 and all('at' in x for x in w),'monthly entries %r'%[x.get('id') for x in w])
    # pure date helper
    r=pg.evaluate("[window.alsaerBackupDates('14',new Date(2026,10,27),62).map(d=>d.toDateString()),window.alsaerBackupDates('30',new Date(2026,10,27),62).map(d=>d.toDateString())]")
    ck(r[0]==['Fri Dec 04 2026','Fri Dec 18 2026','Fri Jan 01 2027','Fri Jan 15 2027'],'14d dates %r'%r[0])
    ck(r[1]==['Fri Dec 04 2026','Fri Jan 01 2027'],'monthly dates %r'%r[1])
    # UI sheet
    setr({'backup':True,'backupTime':'19:00'});pg.reload();pg.wait_for_timeout(1200)
    try:pg.click('[data-a=update109Done]',timeout=400)
    except Exception:pass
    click(pg,'tab','reminders');pg.wait_for_timeout(500)
    pg.click('[data-rem-pane=g-friday]');pg.wait_for_timeout(300)
    pg.click('[data-rem-action=bkopen]');pg.wait_for_timeout(300)
    ck(pg.locator('#bk-sheet').count()==1,'sheet not open')
    ck(pg.locator('#bk-sheet .bk-big').inner_text()=='كل ٧ أيام','default not weekly: '+pg.locator('#bk-sheet .bk-big').inner_text())
    pg.click('[data-bk-pick="14"]');ck(pg.locator('#bk-sheet .bk-big').inner_text()=='كل ١٤ يومًا','chip')
    pg.click('[data-bk-save]');pg.wait_for_timeout(500)
    r=pg.evaluate("k=>JSON.parse(localStorage.getItem(k))",KEY);ck(r.get('backup') is True and r.get('backupEvery')=='14','saved %r'%r)
    pg.click('[data-rem-action=bkopen]');pg.click('[data-bk-pick=off]');pg.click('[data-bk-save]');pg.wait_for_timeout(400)
    r=pg.evaluate("k=>JSON.parse(localStorage.getItem(k))",KEY);ck(r.get('backup') is False,'off %r'%r)
    pg.click('[data-rem-action=bkopen]');pg.click('[data-bk-pick="7"]');pg.click('[data-bk-save]');pg.wait_for_timeout(400)
    r=pg.evaluate("k=>JSON.parse(localStorage.getItem(k))",KEY);ck(r.get('backup') is True and 'backupEvery' not in r,'weekly restore %r'%r)
    ck(not errs,'errors %r'%errs[:2]);b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
