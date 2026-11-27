"""2.0.4: notifications hub, one-step wizard (UI only, never touches salatEvery/backup), and the generic one-tap fix chain."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
F=[]
def ck(c,m):
    if not c:F.append(m)
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
NAT="""(()=>{window.__calls=[];window.__st={n:false,e:false};var o={notificationsEnabled:()=>window.__st.n,canExactAlarms:()=>window.__st.e,requestNotificationPermission:()=>{window.__calls.push('perm');setTimeout(()=>{window.__st.n=true},300)},openExactAlarmSettings:()=>{window.__calls.push('exact');window.__st.e=true},openBatterySettings:()=>{window.__calls.push('battery')},testNotification:()=>{window.__calls.push('test')},setSchedule:()=>'ok',setSoundMode:()=>'ok'};window.AlsaerNative=new Proxy(o,{get:(t,k)=>k in t?t[k]:(()=>'')})})()"""
KEY='alsaer_daily_reminders_v1'
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780});ctx.add_init_script(NAT)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}));pg.goto(URL);pg.wait_for_timeout(1500)
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    click(pg,'tab','reminders');pg.wait_for_timeout(600)
    before=pg.evaluate("k=>JSON.parse(localStorage.getItem(k)||'{}')",KEY)
    ck(pg.locator('[data-rem-pane=wizard]').count()>=1,'wizard CTA missing when not enabled')
    ck(pg.locator('[data-rem-pane=g-prayers]').count()==1 and pg.locator('[data-rem-pane=g-azkar]').count()==1 and pg.locator('[data-rem-pane=g-friday]').count()==1 and pg.locator('[data-rem-pane=mine]').count()==1,'4 hub groups')
    for pack in ('basic','full'):
        pg.click('[data-rem-pane=wizard]') if pg.locator('[data-rem-pane=wizard]').count() else None
        pg.wait_for_timeout(200)
        pg.click('[data-rem-wz=%s]'%pack);pg.click('[data-rem-action=wzapply]');pg.wait_for_timeout(500)
        r=pg.evaluate("k=>JSON.parse(localStorage.getItem(k)||'{}')",KEY)
        full=pack=='full'
        ck(r.get('prayers') and r.get('salat') and r.get('wird'),pack+' base toggles')
        ck(all(bool(r.get(k))==full for k in ('malik','kahf','dua','weekly','fasting')),pack+' extra toggles %r'%{k:r.get(k) for k in ('malik','kahf','dua','weekly','fasting')})
        ck(r.get('salatEvery')==before.get('salatEvery') and r.get('backup')==before.get('backup'),pack+' touched salatEvery/backup %r %r'%(r.get('salatEvery'),r.get('backup')))
        pg.evaluate("window.alsaerRemindersEnter&&window.alsaerRemindersEnter()")
        click(pg,'tab','home');click(pg,'tab','reminders');pg.wait_for_timeout(400)
    # custom pack: no change, back to hub
    pg.evaluate("localStorage.setItem(%r,%r)"%(KEY,json.dumps({'consent':False,'enabled':False})))
    pg.reload();pg.wait_for_timeout(1200)
    try:pg.click('[data-a=update109Done]',timeout=400)
    except Exception:pass
    click(pg,'tab','reminders');pg.wait_for_timeout(500)
    pg.click('[data-rem-pane=checkup]') if pg.locator('[data-rem-pane=checkup]').count() else ck(False,'no checkup route')
    pg.wait_for_timeout(300)
    ck(pg.locator('[data-rem-action=fixall]').count()==1,'fixall button missing')
    pg.click('[data-rem-action=fixall]');pg.wait_for_timeout(3500)
    ck(pg.evaluate('window.__calls')==['perm','exact'],'before return from exact %r'%pg.evaluate('window.__calls'))
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))");pg.wait_for_timeout(900)
    calls=pg.evaluate('window.__calls')
    ck(calls==['perm','exact','battery'],'chain order %r'%calls)
    pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))");pg.wait_for_timeout(900)
    calls=pg.evaluate('window.__calls')
    ck(calls[-1]=='test','test notification not last %r'%calls)
    ck(not errs,'errors %r'%errs[:2])
    b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
