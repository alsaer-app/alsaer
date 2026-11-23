"""Controls only. Verify legacy hidden state, menu paths, both riwayas and fallback."""
import asyncio,json,tempfile,threading,shutil
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 with tempfile.TemporaryDirectory() as tmp:
  out=Path(tmp);html=(ROOT/'www/index.html').read_text()
  hook='window.__toolbarTest={hide:function(){rd.ui=false;render()},legacy:function(){return mpAct2("qimm")}};'
  html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */');(out/'index.html').write_text(html)
  for f in ['quran.js','mushaf.js','warsh.js','tajweed_warsh.js','fonts']:
   if (ROOT/'www'/f).is_dir():shutil.copytree(ROOT/'www'/f,out/f)
   elif (ROOT/'www'/f).exists():shutil.copy(ROOT/'www'/f,out/f)
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*args):pass
  server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=tmp));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
  async with async_playwright() as pw:
   b=await pw.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for riwaya,immersive,mode in [(r,i,m) for m in ['dark','light'] for r,i in [('hafs',True),('hafs',False),('warsh',True),('warsh',False)]]:
    p=await b.new_page(viewport={'width':360,'height':780});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    seed={'onboarded':True,'tour':{'done':1},'ui':{'mode':mode,'accent':'maleem','digits':'east','press':'glow','trans':'slide'},'quran':{'pos':5,'last':8,'goal':2,'riwaya':riwaya,'log':{},'hint1':1,'sw':1,'imm':immersive,'ui':False}}
    await p.add_init_script('if(!localStorage.tawba_v1)localStorage.tawba_v1='+json.dumps(json.dumps(seed)))
    await p.goto(f'http://127.0.0.1:{server.server_port}/index.html');await p.wait_for_timeout(1800)
    for sel in ['[data-a=update109Done]','text=تخطي']:
     try:await p.click(sel,timeout=400)
     except Exception:pass
    async def act(a,v=''):
     await p.evaluate('([a,v])=>{let b=document.createElement("button");b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}',[a,v]);await p.wait_for_timeout(350)
    await act('tab','quran');await p.locator('#mp').wait_for();await p.wait_for_timeout(1000)
    if immersive:
     assert await p.locator('.rd-t button').count()==2
     assert await p.locator('.rd-ta [data-a=qjump]').is_visible()
     assert 'on' in await p.locator('#rd-ov').get_attribute('class')
     await p.evaluate('__toolbarTest.hide()');assert 'on' in await p.locator('#rd-ov').get_attribute('class')
     await p.locator('#mp .mp-l').click(force=True);assert 'on' in await p.locator('#rd-ov').get_attribute('class')
    else:
     assert await p.locator('.rd-fallback-tools [data-a=qjump]').is_visible()
     assert await p.locator('.fsz').count()==0
    assert await p.locator('[data-a=qimm]').count()==0
    assert await p.locator('[data-a=qidx]').count()==0
    assert await p.locator('[data-a=mpset]').count()==0
    if riwaya=='hafs' and immersive:await p.screenshot(path='/tmp/mushaf-toolbar-final-360.png')
    assert await p.locator('.tjl').count()==0
    content=await p.locator('#mp').inner_html()
    await act('qjump')
    assert await p.locator('.rd-menu [data-a=qidx]').count()==1
    assert await p.locator('.rd-menu [data-a=mpset]').count()==1
    assert await p.locator('.rd-menu #mq-q').is_visible()
    assert await p.evaluate('document.querySelector(".rd-mg").getBoundingClientRect().top>document.querySelector(".rd-mwc").getBoundingClientRect().top')
    assert await p.locator('.rd-tajweed-key .tjl span').count()==6
    assert await p.evaluate('document.querySelector(".rd-tajweed-key").compareDocumentPosition(document.querySelector(".rd-mtb"))&2')
    assert await p.locator('[data-a=qimm]').count()==0
    assert 'أدوات ظاهرة' not in await p.locator('.rd-menu').inner_text()
    if riwaya=='hafs' and immersive:
     await p.screenshot(path=f'/tmp/mushaf-menu-final-{mode}-360.png')
     await p.locator('.rd-mg').scroll_into_view_if_needed()
     await p.screenshot(path=f'/tmp/mushaf-menu-tools-{mode}-360.png')
    await act('qjump');assert content==await p.locator('#mp').inner_html()
    await act('qjump');await p.fill('#mq-q','البقرة');await act('qms');assert await p.locator('.rd-mr .rd-ri').count()>0
    await act('qjump');await act('qpage','1');assert '٩' in await p.locator('.mp-f').inner_text()
    assert await p.evaluate('document.documentElement.scrollWidth<=360')
    assert not errors,errors
    print('PASS',mode,riwaya,'immersive' if immersive else 'legacy fallback','menu/search/index/options; no hidden-state trap; page navigation')
    await p.close()
   await b.close()
  server.shutdown();server.server_close();thread.join()
asyncio.run(main())
