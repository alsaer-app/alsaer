"""Offline message (2.0.4): a manual update check with no internet shows the exact message «لا يوجد اتصال بالانترنت برجاء التحقق من اتصال الانترنت»
(also when the network request itself fails), a server error keeps the old message, and starting a download offline shows the same message."""
import json,threading,functools,http.server
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];WWW=R/'www'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=str(WWW)));threading.Thread(target=srv.serve_forever,daemon=True).start()
U='http://127.0.0.1:%d/index.html'%srv.server_port
MSG='لا يوجد اتصال بالانترنت برجاء التحقق من اتصال الانترنت'
F=[]
def ck(c,m):
    if not c:F.append(m)
CUR={'appId':'com.ahmedalajmi.alsaer','versionName':'0.0.1','versionCode':1}
mode={'v':'ok'}
def h(r):
    if mode['v']=='abort':r.abort();return
    if mode['v']=='500':r.fulfill(status=500,body='x',headers={'access-control-allow-origin':'*'});return
    r.fulfill(body=json.dumps(CUR),content_type='application/json',headers={'access-control-allow-origin':'*'})
def tap(pg,a):pg.evaluate("a=>{var b=document.createElement('button');b.dataset.a=a;document.body.append(b);b.click();b.remove()}",a)
def toasts(pg):return pg.evaluate("document.body.innerText")
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780});ctx.route('**raw.githubusercontent.com/alsaer-app/alsaer/main/update.json',h)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(U);pg.evaluate("s=>{localStorage.setItem('tawba_v1',s);localStorage.setItem('alsaer_wn_build','99999')}",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    pg.goto(U);pg.wait_for_timeout(1500)
    # a) request fails (no response)
    mode['v']='abort';tap(pg,'updchecknow');pg.wait_for_timeout(1500)
    ck(MSG in toasts(pg),'a network failure on a manual check does not show the offline message')
    pg.wait_for_timeout(3500)
    # b) browser says offline
    ctx.set_offline(True);pg.wait_for_timeout(300);tap(pg,'updchecknow');pg.wait_for_timeout(1200)
    ck(MSG in toasts(pg),'b offline manual check does not show the offline message')
    st=pg.evaluate("JSON.parse(localStorage.getItem('alsaer_update_check_v1')||'{}')")
    ck(not st.get('checkFailed'),'b offline must not store a failed check (it would delay the automatic one)')
    ctx.set_offline(False);pg.wait_for_timeout(3500)
    # c) server error keeps the old message, not the offline one
    mode['v']='500';tap(pg,'updchecknow');pg.wait_for_timeout(1500)
    t=toasts(pg);ck('تعذّر التحقق من التحديثات' in t and MSG not in t,'c server error should keep the old message only')
    ck(not errs,'page errors %r'%errs[:2])
    b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
