"""Automatic update discovery (2.0.3): the app reads update.json by itself on open and on return from the background,
shows the existing «تحديث جديد» sheet on its own (never while locked / covered / on another screen), «لاحقًا» only hides it
and it returns on the next open, a failed automatic check is silent, the 6-hour throttle holds, and the notification route
('update') opens the same sheet. Nothing downloads or installs here: approval stays on the sheet's buttons."""
import json,threading,functools,http.server
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];WWW=R/'www'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=str(WWW)));threading.Thread(target=srv.serve_forever,daemon=True).start()
U='http://127.0.0.1:%d/index.html'%srv.server_port
F=[]
def ck(c,m):
    if not c:F.append(m)
UPD={'appId':'com.ahmedalajmi.alsaer','versionName':'9.9.9','versionCode':99999,'apkUrl':'https://github.com/alsaer-app/alsaer/releases/download/v9.9.9/Alsaer-v9.9.9.apk','sha256':'a'*64,'notes':'ملاحظة تجريبية'}
def sheet(pg,ms=0):
    if ms:
        try:pg.wait_for_selector('#upsheet',timeout=ms)
        except Exception:return False
    return pg.query_selector('#upsheet') is not None
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780});mode={'v':'ok'};hits=[]
    def h(r):
        hits.append(1)
        if mode['v']=='fail':r.abort();return
        r.fulfill(body=json.dumps(UPD),content_type='application/json',headers={'access-control-allow-origin':'*'})
    ctx.route('**raw.githubusercontent.com/alsaer-app/alsaer/main/update.json',h)
    def page(first=False):
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.errs=errs
        if first:
            pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
            pg.goto(U);pg.evaluate("s=>{localStorage.setItem('tawba_v1',s);localStorage.setItem('alsaer_wn_build','99999')}",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
        pg.goto(U);return pg
    # 1) first open: automatic check -> sheet by itself, one network read, no tap
    pg=page(True)
    ck(sheet(pg,12000),'1 sheet did not open by itself after the first open')
    ck(len(hits)==1,'1 expected one update.json read, got %d'%len(hits))
    _tx=pg.inner_text('#upsheet') if sheet(pg) else '';ck('9.9.9' in _tx or '٩.٩.٩' in _tx,'1 sheet does not show the new version: %r'%_tx[:120])
    st=pg.evaluate("JSON.parse(localStorage.getItem('alsaer_update_check_v1')||'{}')")
    ck(st.get('info',{}).get('versionCode')==99999 and not st.get('dismissed'),'1 state not saved as expected (or dismissed is set)')
    # 2) «لاحقًا» hides only; no reappearing in the same session; nothing marked skipped
    pg.evaluate("(()=>{var b=document.createElement('button');b.dataset.a='updlater';document.body.append(b);b.click();b.remove()})()")
    pg.wait_for_timeout(300)
    ck(not sheet(pg),'2 later did not hide the sheet')
    pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))");pg.wait_for_timeout(4500)
    ck(not sheet(pg),'2 sheet came back in the same session')
    ck(len(hits)==1,'2 throttle: no second network read inside 6 hours, got %d'%len(hits))
    st=pg.evaluate("JSON.parse(localStorage.getItem('alsaer_update_check_v1')||'{}')")
    ck(not st.get('dismissed'),'2 later must not store a permanent dismissal')
    # 3) next app open (new tab = new session, same storage): throttled (no network) but the saved update is offered again
    pg2=page()
    ck(sheet(pg2,12000),'3 sheet did not return on the next open')
    ck(len(hits)==1,'3 next open inside 6 hours must not hit the network, got %d'%len(hits))
    # 4) never while locked: a PIN-locked app checks quietly, shows nothing, then offers the sheet right after unlocking
    ctx4=b.new_context(viewport={'width':360,'height':780});ctx4.route('**raw.githubusercontent.com/alsaer-app/alsaer/main/update.json',h)
    hits.clear()
    pg3=ctx4.new_page();pg3.errs=[];pg3.on('pageerror',lambda e:pg3.errs.append(str(e)))
    pg3.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg3.goto(U);pg3.evaluate("s=>{localStorage.setItem('tawba_v1',s);localStorage.setItem('alsaer_wn_build','99999')}",json.dumps({'onboarded':True,'tour':1,'update109':1,'pin':'1234','ui':{'lang':'ar','mode':'dark'}}))
    pg3.goto(U);pg3.wait_for_timeout(7000)
    ck(pg3.query_selector('.lock') is not None,'4 test setup: the app is not locked')
    ck(len(hits)>=1,'4 the locked app did not run its automatic check')
    ck(not sheet(pg3),'4 sheet opened while the app was locked')
    pg3.fill('#lk','1234');pg3.click('.lock-enter')
    ck(sheet(pg3,9000),'4 sheet did not open once unlocked')
    # 5) notification route opens the same sheet even after it was shown (and hidden) this session
    pg3.evaluate("(()=>{var b=document.createElement('button');b.dataset.a='updlater';document.body.append(b);b.click();b.remove()})()")
    pg3.wait_for_timeout(300)
    ck(not sheet(pg3),'5 later did not hide the sheet')
    pg3.evaluate("alsaerReminderGo('update')")
    ck(sheet(pg3,8000),'5 notification route did not open the sheet')
    # 6) failed automatic check is silent and does not delay the next try
    ctx2=b.new_context(viewport={'width':360,'height':780})
    mode['v']='fail';hits.clear()
    ctx2.route('**raw.githubusercontent.com/alsaer-app/alsaer/main/update.json',h)
    pg4=ctx2.new_page();pg4.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg4.goto(U);pg4.evaluate("s=>{localStorage.setItem('tawba_v1',s);localStorage.setItem('alsaer_wn_build','99999')}",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    pg4.goto(U);pg4.wait_for_timeout(6000)
    ck(len(hits)>=1,'6 automatic check did not try the network')
    st=pg4.evaluate("JSON.parse(localStorage.getItem('alsaer_update_check_v1')||'{}')")
    ck(not st.get('checkFailed') and not st.get('at'),'6 silent failure must not store state or start the throttle: %s'%st)
    ck(not sheet(pg4),'6 sheet appeared although the check failed')
    # 7) same version: nothing offered
    UPD['versionCode']=10203;UPD['versionName']='2.0.3';mode['v']='ok'
    ctx3=b.new_context(viewport={'width':360,'height':780});ctx3.route('**raw.githubusercontent.com/alsaer-app/alsaer/main/update.json',h)
    pg5=ctx3.new_page();pg5.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg5.goto(U);pg5.evaluate("s=>{localStorage.setItem('tawba_v1',s);localStorage.setItem('alsaer_wn_build','99999')}",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    pg5.goto(U);pg5.wait_for_timeout(6000)
    ck(not sheet(pg5),'7 sheet opened although the installed version is current')
    for x in (pg,pg2,pg3,pg4,pg5):
        ck(not getattr(x,'errs',[]),'page errors: %s'%getattr(x,'errs',[])[:2])
    b.close()
print('FAIL' if F else 'OK',F)
raise SystemExit(1 if F else 0)
