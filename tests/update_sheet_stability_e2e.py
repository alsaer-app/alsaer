"""Update sheet stability (2.0.3): while the download runs the sheet must not flicker or jump. A state change (start, downloading,
verifying, done) repaints only the card's content: the backdrop and the card keep the same DOM nodes (their entrance animation does not
restart = no flash), the card never shrinks between download states (its top edge, anchored from the bottom, does not jump down),
and the progress ticks update the bar in place without replacing it. No design change."""
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
UPD={'appId':'com.ahmedalajmi.alsaer','versionName':'9.9.9','versionCode':99999,'apkUrl':'https://github.com/alsaer-app/alsaer/releases/download/v9.9.9/a.apk','sizeBytes':50000000,'sha256':'a'*64,'notes':'ملاحظة تجريبية'}
MOCK="""window.__st={st:'idle',pct:-1,done:0,total:50000000,url:%s};
window.AlsaerNative={updateStart:function(){window.__st.st='downloading';return 'started'},updateProgress:function(){return JSON.stringify(window.__st)},updateInstall:function(){return 'ok'}};"""%json.dumps(UPD['apkUrl'])
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780})
    ctx.add_init_script(MOCK)
    ctx.route('**raw.githubusercontent.com/alsaer-app/alsaer/main/update.json',lambda r:r.fulfill(body=json.dumps(UPD),content_type='application/json',headers={'access-control-allow-origin':'*'}))
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(U);pg.evaluate("s=>{localStorage.setItem('tawba_v1',s);localStorage.setItem('alsaer_wn_build','99999')}",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    pg.goto(U)
    pg.wait_for_selector('#upsheet',timeout=12000);pg.wait_for_timeout(600)
    pg.evaluate("window.__back=document.querySelector('#upsheet .ups-back');window.__card=document.querySelector('#upsheet .ups-card')")
    geo="(()=>{var c=document.querySelector('#upsheet .ups-card'),r=c.getBoundingClientRect();return {same:c===window.__card&&document.querySelector('#upsheet .ups-back')===window.__back,top:r.top,h:r.height,bottom:r.bottom}})()"
    g0=pg.evaluate(geo);tops=[g0]
    pg.click('#upsheet [data-a=updnow]');pg.wait_for_timeout(150)
    g=pg.evaluate(geo);tops.append(g);ck(g['same'],'1 start repainted the backdrop/card nodes (entrance animation restarts = flash)')
    pg.evaluate("window.__bar=document.querySelector('#upsheet .upd-bar>div')")
    for pct in (12,40,75):
        pg.evaluate("p=>{window.__st.pct=p;window.__st.done=p*500000}",pct);pg.wait_for_timeout(1000)
        ck(pg.evaluate("document.querySelector('#upsheet .upd-bar>div')===window.__bar"),'2 progress tick replaced the bar at %d%%'%pct)
        ck(pg.evaluate("document.querySelector('#upsheet .upd-bar>div').style.width")==('%d%%'%pct),'2 bar did not follow progress at %d%%'%pct)
        g=pg.evaluate(geo);tops.append(g);ck(g['same'],'2 nodes replaced during progress at %d%%'%pct)
    for st in ('verifying','done'):
        pg.evaluate("s=>{window.__st.st=s;window.__st.pct=100}",st);pg.wait_for_timeout(1000)
        g=pg.evaluate(geo);tops.append(g);ck(g['same'],'3 nodes replaced at state '+st)
    ck(all(t['bottom']==tops[0]['bottom'] for t in tops),'4 card bottom edge moved: %r'%[t['bottom'] for t in tops])
    hs=[t['h'] for t in tops][1:]  # from the first downloading state on
    ck(all(hs[i+1]>=hs[i]-0.5 for i in range(len(hs)-1)),'4 card shrank between download states (top edge would jump): %r'%hs)
    ck(not errs,'5 page errors: %r'%errs[:2])
    b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
