"""Recovered More grid, no new design. Build source directly, compare to 40ff739."""
import asyncio,json,threading,tempfile
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];OUT=Path('/tmp/more-grid-review');OUT.mkdir(exist_ok=True)
async def main():
 old=(R/'tests/fixtures/more-grid-historical.js.txt').read_text();cur=(R/'src/screens/more.js').read_text()
 assert cur[cur.index('function mtile('):cur.index('function vDeveloper()')]==old
 assert (R/'src/styles/inputs.css').read_text()==(R/'tests/fixtures/more-grid-inputs.css').read_text()
 with tempfile.TemporaryDirectory() as t:
  d=Path(t);man=json.loads((R/'src/manifest.json').read_text())
  for stage in ['before','after']:
   html=''.join(x['lit'] if 'lit'in x else ((R/'tests/fixtures/more-before-grid.js.txt').read_text() if stage=='before' and x['file']=='screens/more.js' else (R/'src'/x['file']).read_text()) for x in man);(d/(stage+'.html')).write_text(html)
  for f in ['fonts','quran.js','mushaf.js','warsh.js','tajweed_warsh.js']:(d/f).symlink_to(R/'www'/f)
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*a):pass
  srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=t));threading.Thread(target=srv.serve_forever,daemon=True).start()
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for mode in ['dark','light']:
    for stage in ['before','after']:
     p=await b.new_page(viewport={'width':360,'height':780});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
     seed={'onboarded':True,'tour':{'done':1},'ui':{'mode':mode,'accent':'maleem','digits':'east','press':'glow','trans':'slide'}}
     await p.add_init_script('localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_drive_prefs=JSON.stringify({auto:false})')
     await p.goto(f'http://127.0.0.1:{srv.server_port}/{stage}.html');await p.wait_for_timeout(1500)
     for sel in ['[data-a=update109Done]','text=تخطي']:
      try:await p.click(sel,timeout=300)
      except:pass
     async def act(a,v):
      await p.evaluate('([a,v])=>{let b=document.createElement("button");b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}',[a,v]);await p.wait_for_timeout(800)
     await act('tab','more');await p.screenshot(path=str(OUT/f'more-{mode}-{stage}.png'),full_page=True)
     if stage=='after':
      assert await p.locator('.mtile').count()==24
      assert await p.locator('#mr-list [data-v=backup],#mr-list [data-v=recite]').count()==0
      assert await p.locator('.mtile small,.mtile .sg-val').count()==0
      anim=await p.locator('.mtile').first.evaluate('(e)=>({name:getComputedStyle(e).animationName,duration:getComputedStyle(e).animationDuration,columns:getComputedStyle(e.parentElement).gridTemplateColumns})')
      assert anim['name']=='mtpop' and anim['duration']=='0.42s' and len(anim['columns'].split())==3,anim
      await p.fill('#mr-q','عدّاد تسبيح');assert await p.locator('.mtile:visible').count()==1
      await p.fill('#mr-q','zzzz');assert await p.locator('#mr-none').is_visible()
      await p.fill('#mr-q','');assert await p.locator('.mtile:visible').count()==24
      await p.locator('.mtile[data-v=settings]').click();await p.wait_for_timeout(300);await act('scat','sec');assert await p.locator('[data-v=backup]').count()==1
      await p.locator('[data-v=backup]').click();await p.wait_for_timeout(300);assert await p.locator('.bk').count()==1
      for width in [320,412]:
       await p.set_viewport_size({'width':width,'height':780});await act('tab','more');assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth')
      await p.emulate_media(reduced_motion='reduce');assert await p.locator('.mtile').first.evaluate('(e)=>getComputedStyle(e).animationName')=='none'
      print('PASS',mode,'exact historical grid/CSS, 24 tiles, search/empty/reset, Settings backup route, reduced motion, widths 320/360/412')
     assert not errors,errors;await p.close()
   await b.close()
  srv.shutdown()
asyncio.run(main())
