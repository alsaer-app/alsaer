"""Fresh install: the default frequency for salat on the prophet is 15 minutes (also after enabling reminders through the app)."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
URL=(ROOT/'www/index.html').as_uri()
F=[]
def ck(c,m):
    if not c:F.append(m)
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
NAT="""(()=>{window.__sched=[];window.__st={n:false};var o={notificationsEnabled:()=>window.__st.n,canExactAlarms:()=>true,requestNotificationPermission:()=>{setTimeout(()=>{window.__st.n=true},200)},setSchedule:(s)=>{window.__sched.push(s);return 'ok'},setSoundMode:()=>'ok'};window.AlsaerNative=new Proxy(o,{get:(t,k)=>k in t?t[k]:(()=>'')})})()"""
def boot(b,seed):
    ctx=b.new_context(viewport={'width':360,'height':780});ctx.add_init_script(NAT)
    pg=ctx.new_page()
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}))
    if seed:pg.evaluate("s=>localStorage.setItem('alsaer_daily_reminders_v1',s)",json.dumps(seed))
    pg.goto(URL);pg.wait_for_timeout(1500)
    click(pg,'tab','settings');pg.wait_for_timeout(400);click(pg,'scat','notif');pg.wait_for_timeout(400)
    return pg
SEL="[data-rem-time=salatEvery]"
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    pg=boot(b,None)
    ck(pg.evaluate("[...document.querySelectorAll('%s')].map(e=>e.value)"%SEL)==['15'],'fresh default is 15 min')
    pg.select_option(SEL,'60');pg.wait_for_timeout(1800)
    ck(pg.evaluate("JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')).salatEvery")=='60','interval changeable from settings')
    pg.close()
    pg=boot(b,{'enabled':True,'salat':True,'salatEvery':'30'})
    ck(pg.evaluate("document.querySelector('%s').value"%SEL)=='30','saved choice untouched')
    b.close()
print('FAIL' if F else 'PASS',F)
sys.exit(1 if F else 0)
