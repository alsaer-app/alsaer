"""2.0.4: screens that need the internet show «لا يوجد اتصال بالانترنت برجاء التحقق من اتصال الانترنت» when the device is offline
(radio and reciters playback failure), and keep their own message when online (server/stream error)."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
MSG='لا يوجد اتصال بالانترنت برجاء التحقق من اتصال الانترنت'
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
F=[]
def ck(c,m):
    if not c:F.append(m)
FAKE="""()=>{window.Audio=function(){var a={pause(){},load(){},removeAttribute(){},addEventListener(){},play(){var s=this;return Promise.reject(new Error('net'))}};return a}}"""
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    pg=b.new_page(viewport={'width':360,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':'ar','mode':'dark'}}));pg.goto(URL);pg.wait_for_timeout(1200)
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    for tile,play,sel in (('reciters','rctplay','#rct-l .rdo-row'),('radio','rdoplay','#rdo-l .rdo-row')):
        click(pg,'tab','more');pg.wait_for_timeout(400)
        pg.locator('.mtile[data-v=%s]'%tile).click();pg.wait_for_timeout(1500)
        if tile=='reciters':
            pg.locator(sel).first.click();pg.wait_for_timeout(400)
        pg.evaluate(FAKE)
        for off in (False,True):
            pg.context.set_offline(off);pg.evaluate("o=>Object.defineProperty(navigator,'onLine',{get:()=>!o,configurable:true})",off)
            click(pg,play,'2' if tile=='reciters' else pg.evaluate("window.RDO&&RDO[0]&&RDO[0][0]||1").__str__());pg.wait_for_timeout(700)
            t=pg.evaluate("document.body.innerText")
            ck((MSG in t)==off,'%s offline=%s message shown=%s'%(tile,off,MSG in t))
            pg.wait_for_timeout(3500)
        pg.context.set_offline(False)
        click(pg,'tab','home');pg.wait_for_timeout(300)
    ck(not errs,'page errors %r'%errs[:2])
    b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
