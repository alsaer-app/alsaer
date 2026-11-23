"""Real app UI/crypto/storage. Only Android picker and HTTP transports are stubbed."""
import asyncio,json,tempfile,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 html=(ROOT/'www/index.html').read_text()
 hook='''window.__backup={status:gdStatus,stage:gdStage};window.__files=[{id:'new-id',name:'alsaer-backup-2026-11-23T22-05-00Z.json',size:128000,modifiedTime:'2026-11-23T22:05:00Z',ownedByMe:true,capabilities:{canDelete:true},appProperties:{alsaerBackup:'v2',backupAt:'1795471500000'}},{id:'legacy-id',name:'alsaer-backup.json',size:120000,modifiedTime:'2026-11-20T18:15:00Z',ownedByMe:true,capabilities:{canDelete:true}}];window.__deleted=[];gdReq=function(url,opt){if(opt&&opt.method==='DELETE'){let id=decodeURIComponent(url.split('/').pop());__deleted.push(id);__files=__files.filter(f=>f.id!==id);return Promise.resolve({})}return Promise.resolve({json:()=>Promise.resolve({files:__files}),text:()=>Promise.resolve(JSON.stringify({app:'alsaer',at:1795471500000,S:{days:{},counters:{},profile:{name:'restored'}}}))})};gdStatusSet('driveAt',1795471500000);gdStatusSet('driveRestoreAt',1795460700000);'''
 html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */')
 with tempfile.TemporaryDirectory() as tmp:
  Path(tmp,'index.html').write_text(html)
  class Quiet(SimpleHTTPRequestHandler):
   def log_message(self,*args):pass
  srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=tmp));threading.Thread(target=srv.serve_forever,daemon=True).start()
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for mode in ['dark','light']:
    p=await b.new_page(viewport={'width':360,'height':780});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    seed={'onboarded':True,'tour':{'done':1},'ui':{'mode':mode,'accent':'green','digits':'east','press':'glow','trans':'slide'}}
    await p.add_init_script('localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_gdrive_native="1";localStorage.alsaer_drive_prefs=JSON.stringify({auto:false});window.AlsaerNative={gdriveAuthorize(){},backupExport(c,n){window.__export={c,n}},backupImport(){window.__imported=true},gdriveSaveBackup(){return true}};')
    await p.goto(f'http://127.0.0.1:{srv.server_port}');await p.wait_for_timeout(1700)
    for sel in ['[data-a=update109Done]','text=تخطي']:
     try:await p.click(sel,timeout=300)
     except:pass
    await p.evaluate('let b=document.createElement("button");b.dataset.a="tab";b.dataset.v="backup";document.body.append(b);b.click();b.remove()');await p.wait_for_timeout(300)
    await p.add_style_tag(content='.tabbar{visibility:hidden!important}');await p.locator('.bk').screenshot(path=f'/tmp/backup-implemented-{mode}.png')
    await p.click('[data-a=gddown]');assert await p.locator('[data-gd-select]').count()==2
    await p.check('[data-gd-select="new-id"]');await p.screenshot(path=f'/tmp/backup-picker-implemented-{mode}.png');await p.click('[data-a=gdpickgo]');await p.click('[data-a=gdverify]');await p.screenshot(path=f'/tmp/backup-confirm-implemented-{mode}.png');assert await p.locator('[data-a=gdrestore]').count()==1;assert await p.evaluate('document.querySelector(".gd-dialog").getBoundingClientRect().top===0');await p.click('[data-a=gdcancel]')
    await p.click('[data-a=gddelete]');await p.check('[data-gd-select="legacy-id"]');await p.click('[data-a=gdpickgo]');assert await p.locator('[data-a=gddeletego]').is_disabled();await p.check('#gd-delete-ack');await p.screenshot(path=f'/tmp/backup-delete-implemented-{mode}.png');await p.click('[data-a=gddeletego]');assert await p.evaluate('__deleted.join()')=='legacy-id';assert await p.locator('[data-gd-select]').count()==1;await p.click('[data-a=gdpickcancel]')
    await p.click('[data-a=gdfileout]');await p.wait_for_function('window.__export');assert await p.evaluate('JSON.parse(__export.c).app')=='alsaer';assert not await p.evaluate('__backup.status().fileAt||false');await p.evaluate('gdriveOnDocument("cancelled","","",0)');assert not await p.evaluate('__backup.status().fileAt||false')
    await p.click('[data-a=gdfileout]');await p.wait_for_function('document.querySelector("[data-a=gdfileout]").disabled');await p.evaluate('gdriveOnDocument("saved","","chosen.txt",100)');assert await p.evaluate('__backup.status().fileAt>0')
    await p.click('[data-a=gdfilein]');assert await p.evaluate('__imported');await p.evaluate('gdriveOnDocument("opened",JSON.stringify({app:"alsaer",at:1795471500000,S:{days:{},counters:{}}}),"chosen.txt",100)');await p.click('[data-a=gdverify]');assert 'ملف مستقل' in await p.locator('#gd-restore').inner_text();await p.click('[data-a=gdcancel]')
    assert await p.evaluate('document.documentElement.scrollWidth<=360');assert not errors,errors;await p.close()
   await b.close()
  srv.shutdown()
 print('PASS dark/light full UI: dated list, verify-confirm-cancel, exact legacy delete+ack, no collateral delete, independent file save/cancel/open callbacks, no overflow/page errors')
asyncio.run(main())
