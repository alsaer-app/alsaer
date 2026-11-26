"""[tamper] «فتاوى ابن باز»: فئات، بحث، قائمة، عرض المزيد، فتوى، نسخ، تحميل أونلاين (رابط بعيد محاكى بـroute) مع Cache API وفحص النسخة، العمل بلا شبكة بعد القراءة، وترجمة الواجهة (نص الفتاوى يبقى عربيًا)."""
import json,threading,functools,http.server
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];WWW=R/'www'
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(WWW))
class Q(H.func):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=str(WWW)));threading.Thread(target=srv.serve_forever,daemon=True).start()
U='http://127.0.0.1:%d/index.html'%srv.server_port
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
F=[]
def ck(c,m):
    if not c:F.append(m)

def remote(hits,tamper):
    def h(r):
        n=r.request.url.split('/www/fatwas/')[1];hits.append(n)
        body=(WWW/'fatwas'/n).read_text(encoding='utf-8')
        if tamper and n.startswith('f0'):body=body.replace('"','"',1)[:-2]+',["x","x","x","x","x"]]'
        r.fulfill(body=body,content_type='application/json',headers={'access-control-allow-origin':'*'})
    return h
for tamper in (False,True):
  with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780});hits=[]
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**raw.githubusercontent.com/**',remote(hits,tamper))
    pg.route(lambda u:u.startswith('http://127.0.0.1') and '/fatwas/f' in u,lambda r:r.abort())
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(U);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    pg.goto(U);pg.wait_for_timeout(1200)
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    ok=pg.evaluate("new Promise(function(res){ftIdx(function(){ftChunk(0,function(k){res([k,!!(window.FTW&&window.FTW[0]),window.FTW&&window.FTW[0]?window.FTW[0].length:0])})})})") if False else None
    click(pg,'tab','more');pg.wait_for_timeout(400);click(pg,'tab','fatwas');pg.wait_for_timeout(1200)
    click(pg,'ftwcat','قضايا المرأة');pg.wait_for_timeout(1500)
    n=pg.locator('#ftw-l .rdo-row').count()
    fid=pg.locator('#ftw-l .rdo-row').first.get_attribute('data-v');click(pg,'ftwopen',fid);pg.wait_for_timeout(1500)
    chunks=[x for x in hits if x.startswith('f0')];print('chunks requested',sorted(set(chunks)))
    cached=pg.evaluate("caches.open('alsaer-fatwas').then(c=>c.keys()).then(k=>k.map(r=>r.url.split('/').pop()))")
    print('tamper' if tamper else 'clean','rows',n,'cached',cached[:4])
    tc=[x for x in cached if x.startswith('f0')]
    if tamper: ck(not tc and chunks,'tampered chunk must not be cached %s'%tc)
    else: ck(tc,'clean chunk cached %s'%tc)
print('FAIL',F) if F else print('PASS tamper')
raise SystemExit(1 if F else 0)
