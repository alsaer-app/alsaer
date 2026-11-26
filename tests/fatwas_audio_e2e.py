"""صوت الفتاوى: زر استماع وزر تنزيل. المسار الصوتي من حقل الفتوى السادس، الرابط يُبنى من files.zadapps.info فقط، بث ثم تنزيل اختياري (واحد في كل مرة) إلى Cache API مع إلغاء وإعادة محاولة وحذف، وفتوى بلا صوت لا يظهر لها شريط. الصوت يُحاكى بـroute (لا اتصال حقيقي). usage: fatwas_audio_e2e.py [mp3] [shots_dir]"""
import json,sys,threading,functools,http.server,re
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];WWW=R/'www'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=str(WWW)));threading.Thread(target=srv.serve_forever,daemon=True).start()
U='http://127.0.0.1:%d/index.html'%srv.server_port
MP3=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/t.mp3').read_bytes();SH=sys.argv[2] if len(sys.argv)>2 else ''
F=[]
def ck(c,m):
    if not c:F.append(m)
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
rows=json.load(open(WWW/'fatwas'/'f001.json'));withA=[r for r in rows if r[5]][0];noA=None
for n in range(0,133):
    try:
        for r in json.load(open(WWW/'fatwas'/('f%03d.json'%n))):
            if not r[5]:noA=r;break
    except Exception:break
    if noA:break
ck(withA and noA,'need rows');ck(all((r[5].endswith('.mp3') and not re.search(r'[?#\\:]|\.\.|^/',r[5])) for r in rows if r[5]),'path shape')
reqs=[];mode={'fail':0,'slow':0}
def au(r):
    reqs.append(r.request.url)
    if mode['fail']:r.abort();return
    r.fulfill(body=MP3,content_type='audio/mpeg',headers={'access-control-allow-origin':'*','accept-ranges':'bytes'})
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    ctx=b.new_context(viewport={'width':360,'height':780});pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**raw.githubusercontent.com/**',lambda r:r.abort());pg.route('**files.zadapps.info/**',au)
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(U);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    pg.goto(U);pg.wait_for_timeout(1200)
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    csp=pg.evaluate("document.querySelector('meta[http-equiv=Content-Security-Policy]').content")
    ck('media-src' in csp and 'https://files.zadapps.info' in csp.split('media-src')[1].split(';')[0],'csp media');ck('https://files.zadapps.info' in csp.split('connect-src')[1].split(';')[0],'csp connect')
    click(pg,'tab','fatwas');pg.wait_for_timeout(1200)
    click(pg,'ftwopen',str(withA[0]));pg.wait_for_timeout(1500)
    ck(pg.locator('#ftw-au .ftw-p').count()==1,'play btn');ck(pg.evaluate("document.querySelector('.ftw-t').nextElementSibling.id")=='ftw-au','bar right after title');ck(pg.locator('#ftw-au [data-a=ftwdl]').count()==1,'dl btn')
    if SH:(pg.evaluate("document.getElementById('ftw-au').scrollIntoView({block:'center'})"),pg.wait_for_timeout(150),pg.screenshot(path=SH+'/a1.png'))
    ck(not reqs,'no audio request before click: %s'%reqs)
    # stream
    click(pg,'ftwplay',str(withA[0]));pg.wait_for_timeout(1500)
    ck(len(reqs)>=1 and reqs[0].startswith('https://files.zadapps.info/binbaz.org.sa/'),'stream url %s'%reqs[:1])
    ck(pg.get_attribute('#ftw-au .ftw-p','aria-label')=='إيقاف','playing state')
    if SH:(pg.evaluate("document.getElementById('ftw-au').scrollIntoView({block:'center'})"),pg.wait_for_timeout(150),pg.screenshot(path=SH+'/a2.png'))
    click(pg,'ftwplay',str(withA[0]));pg.wait_for_timeout(300);ck(pg.get_attribute('#ftw-au .ftw-p','aria-label')=='استماع','stop')
    # failed download then retry
    mode['fail']=1;click(pg,'ftwdl',str(withA[0]));pg.wait_for_timeout(800)
    ck(pg.locator('#ftw-au [data-a=ftwdl]').count()==1 and 'تعذّر' in pg.inner_text('#ftw-au'),'fail shows retry')
    if SH:(pg.evaluate("document.getElementById('ftw-au').scrollIntoView({block:'center'})"),pg.wait_for_timeout(150),pg.screenshot(path=SH+'/a4.png'))
    mode['fail']=0;click(pg,'ftwdl',str(withA[0]));pg.wait_for_timeout(1500)
    ck(pg.locator('#ftw-au [data-a=ftwdl]').count()==0 and 'محفوظ' in pg.inner_text('#ftw-au'),'saved: '+pg.inner_text('#ftw-au'))
    ck(pg.evaluate("caches.open('alsaer-fatwa-audio').then(c=>c.keys()).then(k=>k.length)")==1,'cache has 1')
    if SH:(pg.evaluate("document.getElementById('ftw-au').scrollIntoView({block:'center'})"),pg.wait_for_timeout(150),pg.screenshot(path=SH+'/a3.png'))
    n0=len(reqs);click(pg,'ftwplay',str(withA[0]));pg.wait_for_timeout(1500)
    ck(len(reqs)==n0,'plays from cache without network');ck(pg.get_attribute('#ftw-au .ftw-p','aria-label')=='إيقاف','cached play');click(pg,'ftwplay',str(withA[0]))
    click(pg,'ftwmenu',str(withA[0]));pg.wait_for_timeout(300)
    ck(pg.locator('.ftw-menu button').count()==4 and pg.locator('[data-a=ftwdel]').count()==1,'menu has 4 incl delete')
    if SH:(pg.evaluate("document.getElementById('ftw-au').scrollIntoView({block:'center'})"),pg.wait_for_timeout(150),pg.screenshot(path=SH+'/a5.png'))
    click(pg,'ftwdel',str(withA[0]));pg.wait_for_timeout(500);ck(pg.locator('.ftw-menu').count()==0,'menu closes')
    ck(pg.evaluate("caches.open('alsaer-fatwa-audio').then(c=>c.keys()).then(k=>k.length)")==0,'deleted');ck(pg.locator('#ftw-au [data-a=ftwdl]').count()==1,'dl back')
    # no audio fatwa
    click(pg,'ftwback');click(pg,'ftwopen',str(noA[0]));pg.wait_for_timeout(1500)
    ck(pg.locator('#ftw-au .ftw-p').count()==0 and pg.locator('#ftw-au [data-a=ftwmenu]').count()==1,'no player without audio, menu kept')
    ck(not errs,'page errors %s'%errs);b.close()
import subprocess
js=open(WWW.parent/'src'/'services'/'fatwas.js',encoding='utf-8').read()
m=re.search(r"function ftAuPath.*?\nfunction ftAuUrl[^\n]*",js,re.S)
t=subprocess.run(['node','-e',"var FT_AU='https://files.zadapps.info/binbaz.org.sa/';"+m.group(0)+";console.log(JSON.stringify([ftAuUrl([1,0,0,0,0,'../x.mp3']),ftAuUrl([1,0,0,0,0,'a/b?x.mp3']),ftAuUrl([1,0,0,0,0,'a/b c.mp3']),ftAuUrl([1,0,0,0,0,'']),ftAuUrl([1,0,0,0,0,'a/%D9%87 b.MP3']),ftAuUrl([1,0,0,0,0,'http://evil/x.mp3'])]))"],capture_output=True,text=True).stdout.strip()
ck(t=='["","","https://files.zadapps.info/binbaz.org.sa/a/b%20c.mp3","","https://files.zadapps.info/binbaz.org.sa/a/%D9%87%20b.MP3",""]','url builder %s'%t)
print('FAIL',F) if F else print('fatwas audio e2e OK')
sys.exit(1 if F else 0)
