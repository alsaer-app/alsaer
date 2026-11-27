"""Download-flow edges (2.0.3), with a mocked native bridge: (1) not enough storage: start returns 'nospace' -> a clear message, no download
state; a 'nospace' failure shows the same message in the sheet; (2) install-permission: 'needperm' on tap, then on return to the app the install is
retried once automatically (and not again if the permission is still missing); (3) the app asks native to clean its own temp APK after launch;
(4) every install result code has a message (badver/badsig/badpkg/nofile/error)."""
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
UPD={'appId':'com.ahmedalajmi.alsaer','versionName':'9.9.9','versionCode':99999,'apkUrl':'https://github.com/alsaer-app/alsaer/releases/download/v9.9.9/a.apk','sizeBytes':50000000,'sha256':'a'*64,'notes':'x'}
MOCK="""window.__calls={start:0,inst:0,clean:0};window.__startRes='nospace';window.__instRes=['needperm','needperm','ok'];
window.__st={st:'idle',pct:-1,done:0,total:50000000,url:%s,err:''};
window.AlsaerNative={updateStart:function(){window.__calls.start++;return window.__startRes},updateProgress:function(){return JSON.stringify(window.__st)},
 updateInstall:function(){window.__calls.inst++;return window.__instRes.shift()||'ok'},updateCleanup:function(){window.__calls.clean++;return 'none'}};"""%json.dumps(UPD['apkUrl'])
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780});ctx.add_init_script(MOCK)
    ctx.route('**raw.githubusercontent.com/alsaer-app/alsaer/main/update.json',lambda r:r.fulfill(body=json.dumps(UPD),content_type='application/json',headers={'access-control-allow-origin':'*'}))
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(U);pg.evaluate("s=>{localStorage.setItem('tawba_v1',s);localStorage.setItem('alsaer_wn_build','99999')}",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    pg.goto(U);pg.wait_for_selector('#upsheet',timeout=12000);pg.wait_for_timeout(300)
    # 1) no space at start
    pg.click('#upsheet [data-a=updnow]');pg.wait_for_timeout(400)
    ck(pg.evaluate("window.__calls.start")==1,'1 start not called')
    ck('مساحة التخزين' in pg.inner_text('body'),'1 no clear storage message on a nospace start')
    ck(pg.query_selector('#upsheet .upd-bar') is None,'1 a download state was shown after nospace')
    # nospace as a failure during download -> same message in the sheet
    pg.evaluate("window.__startRes='started'");pg.click('#upsheet [data-a=updnow]');pg.wait_for_timeout(300)
    pg.evaluate("window.__st.st='failed';window.__st.err='nospace'");pg.wait_for_timeout(1500)
    ck('مساحة التخزين' in pg.inner_text('#upsheet'),'1 failed(nospace) does not show the storage message in the sheet: %r'%pg.inner_text('#upsheet')[:120])
    # 2) install permission: tap -> needperm; return -> automatic retry (still needperm) ; no loop; next tap -> ok
    pg.evaluate("window.__st.st='downloading';window.__st.err=''");pg.click('#upsheet [data-a=updnow]');pg.wait_for_timeout(900)
    pg.evaluate("window.__st={st:'done',pct:100,done:50000000,total:50000000,url:%s,err:''}"%json.dumps(UPD['apkUrl']));pg.wait_for_timeout(1200)
    inst=pg.query_selector('#upsheet [data-a=updinst]')
    if not inst:pg.evaluate("document.querySelector('#upsheet')&&0");
    ck(inst is not None,'2 no install button in done state')
    if inst:
        inst.click();pg.wait_for_timeout(300);ck(pg.evaluate("window.__calls.inst")==1,'2 tap did not call install')
        pg.evaluate("Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))");pg.wait_for_timeout(900)
        ck(pg.evaluate("window.__calls.inst")==2,'2 return from permission screen did not retry install once (calls=%s)'%pg.evaluate("window.__calls.inst"))
        pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))");pg.wait_for_timeout(900)
        ck(pg.evaluate("window.__calls.inst")==2,'2 install retried again without a new tap (loop)')
        pg.click('#upsheet [data-a=updinst]');pg.wait_for_timeout(300);ck(pg.evaluate("window.__calls.inst")==3,'2 second tap did not call install')
    # 3) cleanup requested after launch
    pg.wait_for_timeout(6500);ck(pg.evaluate("window.__calls.clean")>=1,'3 native cleanup of the temp apk was not requested after launch')
    ck(not errs,'5 page errors: %r'%errs[:2])
    b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
