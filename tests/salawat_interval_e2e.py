"""Approved salawat interval: persistence, legacy preservation, native resync boundary."""
import asyncio,json,tempfile,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 with tempfile.TemporaryDirectory() as t:
  d=Path(t);h=(R/'www/index.html').read_text().replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */','window.__intervalShow=function(){tab="settings";setCat="notif";render()};})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */');(d/'index.html').write_text(h)
  for f in ['fonts','quran.js','warsh.js']:(d/f).symlink_to(R/'www'/f)
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*a):pass
  srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=t));threading.Thread(target=srv.serve_forever,daemon=True).start()
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for name,saved,expected in [('fresh',None,'15'),('saved',{'salatEvery':'60','enabled':True,'consent':True,'soundMode':'silent','salatFrom':'09:00','salatTo':'10:00','custom':[]},'60'),('legacy',{'enabled':False,'soundMode':'silent'},'120')]:
    p=await b.new_page(viewport={'width':360,'height':844})
    await p.add_init_script('if(!sessionStorage.seeded){sessionStorage.seeded=1;localStorage.tawba_v1='+json.dumps(json.dumps({'onboarded':True,'tour':{'done':1},'ui':{'mode':'dark','accent':'maleem','trans':'none'}}))+';localStorage.alsaer_snd_v8="1";'+('localStorage.alsaer_daily_reminders_v1='+json.dumps(json.dumps(saved))+';' if saved is not None else '')+'}')
    await p.goto(f'http://127.0.0.1:{srv.server_port}/index.html');await p.wait_for_timeout(1000)
    try:await p.wait_for_selector('#update109-notice',timeout=4000)
    except Exception:pass
    for sel in ['[data-a=update109Done]','text=تخطي']:
     try:await p.click(sel,timeout=250)
     except:pass
    await p.evaluate('__intervalShow()');control=p.locator('[data-rem-time=salatEvery]');assert await control.input_value()==expected,(name,await control.input_value())
    assert await control.locator('option').evaluate_all('(a)=>a.map(e=>e.value)')==['15','30','60','120','0']
    await p.evaluate('window.__syncCalls=[];window.alsaerNativeSyncSoon=function(force){__syncCalls.push({force,items:alsaerReminderItems()})}')
    before=await p.evaluate('JSON.parse(localStorage.alsaer_daily_reminders_v1||"{}")')
    for value in ['15','30','60','120','0']:
     await control.select_option(value)
     after=await p.evaluate('JSON.parse(localStorage.alsaer_daily_reminders_v1)');assert after['salatEvery']==value
     for k,v in before.items():
      if k!='salatEvery':assert after[k]==v,(name,k)
     calls=await p.evaluate('__syncCalls');assert calls[-1]['force'] is True
     if name=='saved':
      sal=[x for x in calls[-1]['items'] if x['id']=='salat' or x['id'].startswith('salat_')];assert len(sal)=={'15':5,'30':3,'60':2,'120':1,'0':1}[value],(value,len(sal))
    await p.reload();await p.wait_for_timeout(1000);await p.evaluate('__intervalShow()');assert await p.locator('[data-rem-time=salatEvery]').input_value()=='0'
    print('PASS interval',name,'default/preserved choice, all options persist, force resync receives updated schedule, other settings retained, reload')
    await p.close()
   await b.close()
  srv.shutdown();srv.server_close()
asyncio.run(main())
