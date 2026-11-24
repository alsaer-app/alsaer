"""Old Settings look regression, retained filename for existing CI wiring."""
import asyncio,json,tempfile,threading,hashlib
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];OUT=Path('/tmp/settings-old-review');OUT.mkdir(exist_ok=True)
async def main():
 unchanged=json.loads((R/'tests/fixtures/settings-preserved-sha256.json').read_text())
 for f,h in unchanged.items():assert hashlib.sha256((R/f).read_bytes()).hexdigest()==h,f
 with tempfile.TemporaryDirectory() as t:
  d=Path(t);html=(R/'www/index.html').read_text();html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */','window.__oldSettings={show:function(c,s,o){tab="settings";setCat=c||"";setSub=s||"";setOpen=o||null;render()}};})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */');(d/'index.html').write_text(html)
  for f in ['fonts','quran.js','mushaf.js','warsh.js','tajweed_warsh.js']:(d/f).symlink_to(R/'www'/f)
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
     await show();assert await p.locator('.sc-grid .sc-tile').count()==5;assert await p.locator('.sc-me').count()==1;assert await p.locator('.settings-app').count()==1;assert await p.locator('.sg-main').count()==0
     await p.screenshot(path=str(OUT/f'settings-{mode}-{width}.png'))
     for cat in ['look','notif','loc','sec','prof','about']:
      await show(cat);assert await p.locator('.sg-card,.profile-edit,.lrow').count()>0;assert await p.locator('.sg-choice,.sg-nav-tile').count()==0
      assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth'),(mode,width,cat)
     await show('look');assert await p.locator('.sg-seg [data-a=umode]').count()==3
     await p.locator('[data-a=sopen][data-v=acc]').click();assert await p.locator('.panel .acc').count()>0
     await p.screenshot(path=str(OUT/f'appearance-{mode}-{width}.png'))
     await show('sec');assert await p.locator('[data-a=tab][data-v=backup]').count()==1
     await p.locator('[data-a=tab][data-v=backup]').click();assert await p.locator('.bk').count()>0
     assert not errors,errors
     print('PASS old Settings',mode,width,'profile/category cards, inline choices, backup route, preserved sources, no grid redesign')
     await p.close()
   await b.close()
  srv.shutdown();srv.server_close()
asyncio.run(main())
