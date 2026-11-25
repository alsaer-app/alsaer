"""Approved four-tab Settings regression, retained filename for existing CI wiring."""
import asyncio,json,tempfile,threading,hashlib
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];OUT=Path('/tmp/settings-tabs-review');OUT.mkdir(exist_ok=True)
async def main():
 unchanged=json.loads((R/'tests/fixtures/settings-preserved-sha256.json').read_text())
 for f,h in unchanged.items():assert hashlib.sha256((R/f).read_bytes()).hexdigest()==h,f
 with tempfile.TemporaryDirectory() as t:
  d=Path(t);html=(R/'www/index.html').read_text();html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */','window.__oldSettings={show:function(c,s,o){tab="settings";setCat=c||"";setSub=s||"";setOpen=o||null;render()}};})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */');(d/'index.html').write_text(html)
  for f in ['fonts','quran.js','warsh.js']:(d/f).symlink_to(R/'www'/f)
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*a):pass
  srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=t));threading.Thread(target=srv.serve_forever,daemon=True).start()
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for mode in ['dark','light']:
    for width in [320,360,412]:
     p=await b.new_page(viewport={'width':width,'height':844});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
     await p.add_init_script('localStorage.tawba_v1='+json.dumps(json.dumps({'onboarded':True,'tour':{'done':1},'ui':{'mode':mode,'accent':'maleem','digits':'east','trans':'none'}})))
     await p.goto(f'http://127.0.0.1:{srv.server_port}/index.html');await p.wait_for_timeout(1000)
     for sel in ['[data-a=update109Done]','text=تخطي']:
      try:await p.click(sel,timeout=250)
      except:pass
     async def show(c='',s='',o=''):
      await p.evaluate('([c,s,o])=>__oldSettings.show(c,s,o)',[c,s,o]);await p.wait_for_timeout(350)
     async def frame():
      assert await p.locator('.sg-tabs button').evaluate_all('(a)=>a.every(e=>{while(e){let c=getComputedStyle(e);if(c.opacity!=="1"||c.animationName!=="none")return false;e=e.parentElement}return true})')
     await show();assert await p.locator('.sg-tabs [role=tab]').count()==0
     assert await p.locator('.sg-tab-body [data-a=scat]').count()==4
     assert await p.locator('.sg-tab-body [data-a=ssub]').count()==2
     await p.screenshot(path=str(OUT/f'index-{mode}-{width}.png'))
     for cat in ['look','notif','loc','account']:
      await show();await p.locator('.sg-tab-body [data-a=scat][data-v='+cat+']').click();await frame()
      assert await p.locator('.sg-tabs [role=tab]').count()==4
      assert await p.locator('[role=tab][aria-selected=true]').get_attribute('data-v')==cat
      assert await p.locator('.sc-head [data-a=scat][data-v=""]').count()==1
      assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth'),(mode,width,cat)
      await p.screenshot(path=str(OUT/f'{cat}-{mode}-{width}.png'))
     for sub in ['account-prof','account-sec','account-about']:
      await show('account');await p.locator('[data-a=ssub][data-v='+sub+']').click();await frame()
      if sub=='account-sec':
       await p.locator('[data-a=tab][data-v=backup]').click();assert await p.locator('.bk').count()>0
     await show('look')
     for row in ['sty','acc','dgclk','homecfg']:
      await p.locator('[data-a=sopen][data-v='+row+']').click();await frame()
      assert await p.locator('.panel').count()==1
     await show('look','look-adv','trans')
     for trans in ['fade','zoom','flow','none','slide']:
      await p.locator('[data-a=utrans][data-v='+trans+']').click();await frame()
      assert await p.locator('[data-a=utrans]').evaluate_all('(a)=>a.every(e=>{while(e){let c=getComputedStyle(e);if(c.opacity!=="1"||c.animationName!=="none")return false;e=e.parentElement}return true})')
     assert not errors,errors
     print('PASS Settings tabs',mode,width,'all four tabs, account subpages, inline rows, backup route, all-ancestor immediate opacity, five transitions')
     await p.close()
   await b.close()
  srv.shutdown();srv.server_close()
asyncio.run(main())
