"""«فتاوى ابن باز»: فئات، بحث، قائمة، عرض المزيد، فتوى، نسخ، تحميل أونلاين (رابط بعيد محاكى بـroute) مع Cache API وفحص النسخة، العمل بلا شبكة بعد القراءة، وترجمة الواجهة (نص الفتاوى يبقى عربيًا)."""
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
def remote(hits):
    def h(r):
        n=r.request.url.split('/www/fatwas/')[1];hits.append(n)
        r.fulfill(path=str(WWW/'fatwas'/n),content_type='application/json',headers={'access-control-allow-origin':'*'})
    return h
def page(ctx,lang,mode,hits,first=False):
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**raw.githubusercontent.com/**',remote(hits) if mode=='remote' else (lambda r:r.abort()))
    if mode=='cacheonly':pg.route('**/fatwas/**',lambda r:r.abort())
    if first:
        pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
        pg.goto(U);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':lang,'mode':'dark'}}))
    pg.goto(U);pg.wait_for_timeout(1200)
    try:pg.wait_for_selector('#update109-notice',timeout=4000)
    except Exception:pass
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    return pg,errs
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':360,'height':780});hits=[]
    pg,errs=page(ctx,'ar','remote',hits,True)
    click(pg,'tab','more');pg.wait_for_timeout(500)
    ck(pg.locator('.mtile[data-v=fatwas]').count()==1,'tile');click(pg,'tab','fatwas');pg.wait_for_timeout(1200)
    ck(pg.locator('#ftw-l .rdo-row').count()==215,'cats %d'%pg.locator('#ftw-l .rdo-row').count())
    ck(hits==['index.json'],'only index on open %s'%hits)
    pg.fill('#ftw-q','الزكاة');pg.wait_for_timeout(1500);ck(pg.locator('#ftw-l .rdo-row').count()>=1,'search')
    pg.fill('#ftw-q','zzzzqq');pg.wait_for_timeout(500);ck('لا نتائج' in pg.inner_text('#ftw-l'),'empty')
    pg.fill('#ftw-q','');pg.wait_for_timeout(400)
    click(pg,'ftwcat','قضايا المرأة');pg.wait_for_timeout(1500)
    ck(pg.locator('#ftw-l .rdo-row').count()==60,'page1 60');click(pg,'ftwmore');pg.wait_for_timeout(500)
    ck(pg.locator('#ftw-l .rdo-row').count()==120,'more 120')
    vid=pg.locator('#ftw-l .rdo-row').first.get_attribute('data-v');click(pg,'ftwopen',vid);pg.wait_for_timeout(1500)
    ck(pg.locator('.ftw-a p').count()>=1,'answer');ck('السؤال' in pg.inner_text('#app'),'q label')
    ck(any(h.startswith('f') and h!='index.json' for h in hits),'chunk fetched remotely')
    pg.evaluate("window.__c=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{window.__c.push(t);return Promise.resolve()}},configurable:true})")
    click(pg,'ftwcopy',vid);pg.wait_for_timeout(300);t=pg.evaluate('window.__c[0]||""');ck('binbaz.org.sa/fatwas/' in t and 'الجواب' in t,'copy text')
    click(pg,'ftwback');pg.wait_for_timeout(500);ck(pg.locator('#ftw-l .rdo-row').count()>=60,'back to list')
    keys=pg.evaluate("caches.open('alsaer-fatwas').then(c=>c.keys()).then(k=>k.length)");ck(keys>=3,'cache entries %s'%keys)
    # offline: remote and local blocked, only the Cache API serves
    pg2,e2=page(ctx,'ar','cacheonly',[]);click(pg2,'tab','fatwas');pg2.wait_for_timeout(1500)
    ck(pg2.locator('#ftw-l .rdo-row').count()==215,'offline cats');click(pg2,'ftwcat','قضايا المرأة');pg2.wait_for_timeout(1500)
    ck(pg2.locator('#ftw-l .rdo-row').count()==60,'offline list');click(pg2,'ftwopen',vid);pg2.wait_for_timeout(1000);ck(pg2.locator('.ftw-a p').count()>=1,'offline detail (cached chunk)')
    # version bump clears the old cache on the daily check
    pg3,e3=page(ctx,'ar','remote',[]);pg3.evaluate("localStorage.setItem('ftw_chk','0');localStorage.setItem('ftw_v','old')")
    pg3.reload();pg3.wait_for_timeout(1200);click(pg3,'tab','fatwas');pg3.wait_for_timeout(1500)
    ck(pg3.evaluate("localStorage.getItem('ftw_v')")!='old','version updated')
    ck(pg3.evaluate("caches.open('alsaer-fatwas').then(c=>c.keys()).then(k=>k.length)")==1,'old cache cleared')
    for e in errs+e2+e3:F.append('js '+e)
    # languages: UI translated, fatwa text Arabic
    exp={'en':'Fatawa of Ibn Baz','fr':'Fatawa d','de':'Fatawa von','tr':'Fetvaları','fa':'فتاوای','ur':'فتاویٰ'}
    for l,s in exp.items():
        c=b.new_context(viewport={'width':360,'height':780});pg,e=page(c,l,'remote',[],True);click(pg,'tab','fatwas');pg.wait_for_timeout(1300)
        ck(s in pg.inner_text('#app'),l+' title');ck('الأدعية والأذكار' in pg.inner_text('#app'),l+' category names stay Arabic')
        click(pg,'ftwcat','قضايا المرأة');pg.wait_for_timeout(1300);click(pg,'ftwopen',pg.locator('#ftw-l .rdo-row').first.get_attribute('data-v'));pg.wait_for_timeout(1200)
        ck(pg.locator('.ftw-a p').count()>=1,l+' detail');ck('ج' in pg.inner_text('.ftw-a'),l+' fatwa text Arabic');F.extend(l+' js '+x for x in e)
        c.close()
    b.close()
print('FAIL' if F else 'PASS',F[:8])
raise SystemExit(1 if F else 0)
