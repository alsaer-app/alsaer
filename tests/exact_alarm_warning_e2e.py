"""2.0.4: orange warning on the reminders screen only when exact alarms are not allowed; Allow opens the system permission, Steps opens the check-up; en translation."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
F=[]
def ck(c,m):
    if not c:F.append(m)
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
NAT="""(()=>{window.__calls=[];var o={canExactAlarms:()=>window.__ex,notificationsEnabled:()=>true,openExactAlarmSettings:()=>{window.__calls.push('exact')},setSchedule:()=>'ok',setSoundMode:()=>'ok'};window.__ex=%s;window.AlsaerNative=new Proxy(o,{get:(t,k)=>k in t?t[k]:(()=>'')})})()"""
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    for ex,lang in (('false','ar'),('true','ar'),('false','en')):
        ctx=b.new_context(viewport={'width':360,'height':780});ctx.add_init_script(NAT%ex)
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
        pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':lang,'mode':'dark'}}));pg.goto(URL);pg.wait_for_timeout(1500)
        try:pg.click('[data-a=update109Done]',timeout=500)
        except Exception:pass
        click(pg,'tab','reminders');pg.wait_for_timeout(700)
        n=pg.locator('.rm-warn').count()
        ck((n==1)==(ex=='false'),'warn count %d for exact=%s lang=%s'%(n,ex,lang))
        if n:
            t=pg.inner_text('.rm-warn')
            if lang=='en':ck('Exact alarms are not allowed' in t and 'Allow' in t and 'Steps' in t,'en text %r'%t)
            else:
                pg.click('.rm-warn [data-rem-action=exact]');ck(pg.evaluate('window.__calls')==['exact'],'allow does not open permission')
                pg.click('.rm-warn [data-rem-pane=checkup]');pg.wait_for_timeout(500)
                ck('اختبار الإشعار' in pg.inner_text('body'),'steps does not open check-up')
        ck(not errs,'errors %r'%errs[:2]);ctx.close()
    b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
