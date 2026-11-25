"""Reader shell regression. Uses source manifest, actual fonts and unchanged layout engine."""
import asyncio,json,tempfile,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 with tempfile.TemporaryDirectory() as tmp:
  out=Path(tmp);manifest=json.loads((ROOT/'src/manifest.json').read_text())
  html=''.join(x['lit'] if 'lit' in x else (ROOT/'src'/x['file']).read_text() for x in manifest)
  hook='window.__shell={page:function(n){rd.page=n;render()},home:function(){tab="home";render()}};'
  html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */')
  (out/'index.html').write_text(html)
  for f in ['fonts','quran.js']:(out/f).symlink_to(ROOT/'www'/f)
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*args):pass
  srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=tmp));threading.Thread(target=srv.serve_forever,daemon=True).start()
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for riw in ['hafs']:
    for mode in ['dark','light']:
     p=await b.new_page(viewport={'width':360,'height':780});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
     seed={'onboarded':True,'tour':{'done':1},'ui':{'mode':mode,'accent':'green','digits':'east','press':'glow','trans':'slide'},'quran':{'pos':8,'last':8,'riwaya':riw,'log':{},'hint1':1,'sw':1,'imm':True,'ui':True}}
     await p.add_init_script('localStorage.tawba_v1='+json.dumps(json.dumps(seed)))
     await p.goto(f'http://127.0.0.1:{srv.server_port}/index.html');await p.wait_for_timeout(1800)
     for sel in ['[data-a=update109Done]','text=تخطي']:
      try:await p.click(sel,timeout=300)
      except:pass
     await p.evaluate('let b=document.createElement("button");b.dataset.a="tab";b.dataset.v="quran";document.body.append(b);b.click();b.remove()')
     await p.locator('#mp').wait_for();await p.wait_for_timeout(1400)
     for width,height in [(360,780),(320,640),(412,915)]:
      await p.set_viewport_size({'width':width,'height':height})
      for pg in [11,1,3,100]:
       await p.evaluate('(n)=>__shell.page(n)',pg);await p.wait_for_timeout(500)
       v=await p.evaluate('''()=>{let mp=document.querySelector('#mp').getBoundingClientRect(),h=document.querySelector('.rd-t').getBoundingClientRect(),f=document.querySelector('.rd-b').getBoundingClientRect();return {top:mp.top,bottom:mp.bottom,head:h.bottom,foot:f.top,footBottom:f.bottom,scroll:scrollY,parent:document.querySelector('#rd-ov').parentElement===document.body,width:document.documentElement.scrollWidth}}''')
       assert v['parent'] and v['top']>=v['head']-.1 and v['bottom']<=v['foot']+.1,v
       assert abs(v['footBottom']-height)<1 and v['width']<=width and v['scroll']==0,v
     await p.evaluate('__shell.home()');assert await p.locator('#rd-ov').count()==0
     assert await p.evaluate('document.body.style.paddingBottom==="" && document.querySelector("#app").style.paddingTop===""')
     assert not errors,errors
     print('PASS shell',riw,mode,'3 viewports x 4 pages, top/bottom clear, viewport anchor, cleanup')
     await p.close()
   await b.close()
  srv.shutdown()
asyncio.run(main())
