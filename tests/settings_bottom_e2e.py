import asyncio,json,tempfile,threading,os
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 with tempfile.TemporaryDirectory() as t:
  d=Path(t);(d/'index.html').write_text((ROOT/'www/index.html').read_text())
  for f in ['fonts','quran.js','warsh.js']:
   if (ROOT/'www'/f).exists():os.symlink(ROOT/'www'/f,d/f)
  server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=t));th=threading.Thread(target=server.serve_forever,daemon=True);th.start()
  async with async_playwright() as pw:
   b=await pw.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for mode,accent in [('dark','maleem'),('light','maleem'),('dark','pink')]:
    p=await b.new_page(viewport={'width':360,'height':780});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    seed={'onboarded':True,'tour':{'done':1},'ui':{'mode':mode,'accent':accent,'digits':'east','press':'glow','trans':'slide'}}
    await p.add_init_script('localStorage.tawba_v1='+json.dumps(json.dumps(seed)))
    await p.goto(f'http://127.0.0.1:{server.server_port}/index.html');await p.wait_for_timeout(1200)
    async def act(a,v=''):
     await p.evaluate('([a,v])=>{let b=document.createElement("button");b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}',[a,v]);await p.wait_for_timeout(350)
    try:await p.wait_for_selector('#update109-notice',timeout=4000)
    except Exception:pass
    for sel in ['[data-a=update109Done]','text=تخطي']:
     try:await p.click(sel,timeout=300)
     except:pass
    await act('tab','settings');await act('scat','account');await p.locator('.settings-dev').scroll_into_view_if_needed();await p.wait_for_timeout(400)
    assert await p.locator('.settings-dev-name b').inner_text()=='Ahmed Elagamy'
    assert await p.locator('.settings-dev a').count()==2
    feedback=p.locator('.settings-app a')
    assert await feedback.get_attribute('href')==await p.locator('.settings-dev a[aria-label=Facebook]').get_attribute('href')
    assert await feedback.get_attribute('aria-disabled') is None
    assert await feedback.get_attribute('target')=='_blank'
    labels=await p.locator('.settings-dev a').evaluate_all('(a)=>a.map(x=>({label:x.ariaLabel,x:x.getBoundingClientRect().x}))')
    assert labels[0]['x']<labels[1]['x'],labels
    assert await p.locator('.settings-dev a').all_text_contents()==['','']
    assert await p.evaluate('document.documentElement.scrollWidth<=360')
    await p.screenshot(path=f'/tmp/settings-bottom-{mode}-{accent}-360.png')
    await act('ssub','account-about');assert await p.locator('[data-a=tourreplay]').count()==1
    await act('sopen','sys');assert await p.locator('.sg-kv').count()>0
    await act('tab','developer');assert await p.locator('.devc').count()==0
    assert await p.locator('[data-a=showlog]').count()==1
    assert await p.locator('[data-a=showprivacy]').count()==1
    await act('showprivacy');assert 'Google Drive' in await p.locator('#app').inner_text();assert 'كل بياناتك تُحفظ على جهازك فقط' not in await p.locator('#app').inner_text()
    assert not errors,errors
    print('PASS settings',mode,accent,labels)
    await p.close()
   await b.close()
  server.shutdown();server.server_close();th.join()
asyncio.run(main())
