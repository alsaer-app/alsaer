"""Settings grid regression. Self-contained source build; no git history required."""
import asyncio,json,tempfile,threading,hashlib,os
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1];OUT=Path('/tmp/settings-grid-review');OUT.mkdir(exist_ok=True)
CATS={'look':6,'notif':6,'loc':1,'sec':3,'prof':1,'about':4}
EDITORS={'look':['mode','sty','acc','dgclk','homecfg'],'look-adv':['haptic','font','motion','press','trans'],'notif':['master','snd','perm'],'loc':['loc'],'sec':['acct','rst'],'prof':['prof'],'about':['sys']}
async def main():
 unchanged=json.loads((R/'tests/fixtures/settings-preserved-sha256.json').read_text())
 for f,h in unchanged.items():assert hashlib.sha256((R/f).read_bytes()).hexdigest()==h,f
 with tempfile.TemporaryDirectory() as t:
  d=Path(t);m=json.loads((R/'src/manifest.json').read_text());html=''.join(x['lit'] if 'lit'in x else (R/'src'/x['file']).read_text() for x in m)
  # Scoped harness: not shipped and only used to read current rendered pages/logic.
  html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */','window.__sgTest={back:innerBack,state:function(){return S},show:function(c,s,o,t){tab=t||"settings";setCat=c||"";setSub=s||"";setOpen=o||null;render()}};})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */');(d/'index.html').write_text(html)
  for f in ['fonts','quran.js','mushaf.js','warsh.js','tajweed_warsh.js']:(d/f).symlink_to(R/'www'/f)
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*a):pass
  srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=t));threading.Thread(target=srv.serve_forever,daemon=True).start()
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for mode in os.environ.get('SETTINGS_MODES','dark,light').split(','):
    for width in map(int,os.environ.get('SETTINGS_WIDTHS','320,360,412').split(',')):
     p=await b.new_page(viewport={'width':width,'height':844});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
     seed={'onboarded':True,'tour':{'done':1},'ui':{'mode':mode,'accent':'maleem','digits':'east','press':'glow','trans':'slide'}}
     await p.add_init_script('localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_drive_prefs=JSON.stringify({auto:false});localStorage.alsaer_ff_at=Date.now();')
     await p.goto(f'http://127.0.0.1:{srv.server_port}');await p.wait_for_timeout(1200)
     for sel in ['[data-a=update109Done]','text=تخطي']:
      try:await p.click(sel,timeout=250)
      except:pass
     async def show(c='',sub='',o='',tab='settings'):
      await p.evaluate('a=>__sgTest.show(...a)',[c,sub,o,tab]);await p.wait_for_timeout(90)
     async def snap(name):
      await p.wait_for_timeout(50)
      await p.locator('.mtile').evaluate_all('(a)=>a.forEach(e=>e.getAnimations().forEach(a=>a.finish()))')
      assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth'),name
      assert await p.locator('.dg-fail').count()==0,name
      bad=await p.locator('.mtile:visible').evaluate_all('(a)=>a.filter(e=>e.clientWidth<55||e.scrollWidth>e.clientWidth+2).map(e=>e.textContent)');assert not bad,(name,bad)
      await p.screenshot(path=str(OUT/f'{mode}-{width}-{name}.png'),full_page=True)
      if await p.evaluate('document.documentElement.scrollHeight>innerHeight+70'):
       await p.evaluate('scrollTo(0,document.documentElement.scrollHeight)');await p.wait_for_timeout(60)
       last=p.locator('#app button:visible,#app input:visible,#app select:visible,#app textarea:visible').last
       await last.scroll_into_view_if_needed();await p.wait_for_timeout(40)
       assert await last.evaluate('(e)=>{let r=e.getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight-70}'),(name,'last control hidden')
       await p.screenshot(path=str(OUT/f'bottom-{mode}-{width}-{name}.png'))
       await p.evaluate('scrollTo(0,0)')
     await show();assert await p.locator('.sg-main>.mtile').count()==8;await snap('main')
     assert await p.locator('.sg-main small').count()==0
     ani=await p.locator('.sg-main>.mtile').first.evaluate('(e)=>getComputedStyle(e).animationName');assert ani=='mtpop'
     for cat,count in CATS.items():
      await show(cat);assert await p.locator('#app .sg-nav-tile').count()==count,(cat,await p.locator('#app .sg-nav-tile').count());await snap(cat)
     for sub in ['look-adv','notif-float']:
      await show('look' if sub=='look-adv' else 'notif',sub);await snap(sub)
     for group,keys in EDITORS.items():
      for key in keys:
       cat='look' if group=='look-adv' else group;sub=group if group=='look-adv' else ''
       await show(cat,sub,key);assert await p.locator('.sg-editor').count()==1,key;await snap('edit-'+key)
       if key=='rst':
        await p.locator('[data-a=reset]').click();assert await p.locator('#app [data-a=reset]').count()==1;await p.evaluate('__sgTest.back()');await p.locator('[data-v=rst]').click();assert 'مرة أخرى' not in await p.locator('[data-a=reset]').inner_text()
       if key=='master':assert await p.locator('[data-rem-master]').count()==1
       await p.evaluate('__sgTest.back()');assert await p.locator('.sg-editor').count()==0
     # Selection persistence and independent motion controls.
     await show('look','','mode');await p.locator('[data-a=umode][data-v='+mode+']').click();assert await p.locator('[data-a=umode][aria-pressed=true]').count()==1
     await show('look','look-adv','motion');await p.locator('[data-a=umotion][data-v=reduced]').click();assert await p.locator('[data-a=umotion][data-v=reduced]').get_attribute('aria-pressed')=='true'
     await show('look','look-adv','press');assert await p.locator('[data-a=upress]').count()>2;assert await p.locator('[data-a=upress].on[aria-pressed=true]').count()==1
     await show('look','look-adv','trans');assert await p.locator('[data-a=utrans]').count()>2;assert await p.locator('[data-a=utrans].on[aria-pressed=true]').count()==1
     # Real profile form still saves, gender choice retains state.
     await show('prof','','prof');await p.locator('#profile-name').fill('Regression User');await p.locator('#profile-age').fill('27');await p.locator('[data-a=saveprofile]').click()
     await show('prof','','prof');assert await p.locator('#profile-name').input_value()=='Regression User';assert await p.locator('#profile-age').input_value()=='27'
     await p.locator('[data-a=gender][data-v=female]').click();assert await p.locator('[data-a=gender][data-v=female][aria-pressed=true]').count()==1
     # Backup is byte-preserved and still reachable from Security.
     await show('sec');await p.locator('[data-v=backup]').click();assert await p.locator('.bk').count()==1
     for tab,n in [('floatset',3),('widgetset',2),('floatfeed',5)]:
      await show(tab=tab);assert await p.locator('.sg-dest-grid>.mtile').count()==n,(tab,n);await snap(tab)
      for i in range(n):
       await p.locator('[data-a=sgdetail][data-v="'+str(i)+'"]').click();assert await p.locator('.sg-dest-detail:visible').count()==1;await snap(tab+'-'+str(i))
       if tab in ['floatset','widgetset'] and i==n-1:
        a='nsf' if tab=='floatset' else 'nsw';await p.locator('[data-a='+a+'][data-v="theme:ocean"]').click();assert await p.locator('[data-a='+a+'][data-v="theme:ocean"][aria-pressed=true]').count()==1
       await p.evaluate('__sgTest.back()')
     for tab in ['reminders','developer']:
      await show(tab=tab);await snap(tab)
     await show();await p.emulate_media(reduced_motion='reduce');assert await p.locator('.mtile').first.evaluate('(e)=>getComputedStyle(e).animationName')=='none'
     assert not errors,errors
     print('PASS Settings',mode,width,'all categories/editors/destinations, back, selected choices, reset guard, Backup preserved, animation/reduced motion')
     await p.close()
   await b.close()
  srv.shutdown()
asyncio.run(main())
