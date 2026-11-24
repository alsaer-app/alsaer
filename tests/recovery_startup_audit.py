"""Disposable browser storage only. Not a real uninstall, phone cold start or live Drive test."""
import asyncio,json,tempfile,threading,statistics
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 html=(R/'www/index.html').read_text();hook='window.__recover={build:bkBuild,apply:bkApply};';html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */')
 with tempfile.TemporaryDirectory() as td:
  Path(td,'index.html').write_text(html)
  class Q(SimpleHTTPRequestHandler):
   def log_message(self,*args):pass
  srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Q,directory=td));threading.Thread(target=srv.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{srv.server_port}/index.html?alsaertest'
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox']);measure=[]
   for i in range(7):
    p=await b.new_page(viewport={'width':360,'height':780});await p.route('https://**/*',lambda route:route.abort())
    seed={'onboarded':True,'tour':{'done':1},'profile':{'name':'disposable-recovery-marker'}}
    await p.add_init_script('if(!localStorage.tawba_v1)localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_seen_update_200="1";new MutationObserver(()=>{if(!window.__homePaint&&document.querySelector("[data-a=tab][data-v=home]")){requestAnimationFrame(()=>{if(!window.__homePaint)window.__homePaint=performance.now()})}}).observe(document,{childList:true,subtree:true});')
    await p.goto(url);await p.wait_for_function('()=>window.__homePaint>0');measure.append(await p.evaluate('({dom:performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd,home:__homePaint})'))
    if i==6:
     backup=await p.evaluate('__recover.build()');await p.evaluate('localStorage.clear()');await p.close()
     q=await b.new_page();await q.route('https://**/*',lambda route:route.abort());await q.goto(url);await q.wait_for_timeout(1200)
     assert await q.evaluate('JSON.parse(localStorage.getItem("tawba_v1")||"{}").profile?.name')!=seed['profile']['name']
     assert await q.evaluate('(raw)=>__recover.apply(raw)',backup)=='';await q.wait_for_timeout(650);assert await q.evaluate('__T.S().profile.name')==seed['profile']['name'];await q.close()
    else:await p.close()
   await b.close();srv.shutdown()
  out={'environment':'Chrome headless local HTTP, 360x780, fresh contexts, seven samples, external HTTPS blocked, no phone claim','samples_ms':measure,'median_home_ms':round(statistics.median(x['home'] for x in measure),1),'min_home_ms':round(min(x['home'] for x in measure),1),'max_home_ms':round(max(x['home'] for x in measure),1),'recovery':'PASS disposable full browser storage cleared; independent exported JSON restores marker after reload; no working phone touched'}
  Path('/downloads/alsaer-startup-recovery-audit.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
asyncio.run(main())
