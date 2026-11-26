"""Approved screen at 360x780; native seal and Drive transport stubs only."""
import asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 html=(ROOT/'www/index.html').read_text()
 hook='window.__driveTest={prefs:gdPrefs,email:gdEmail,upload:gdRunBackup};gdUpload=function(c){window.__uploaded=c;return Promise.resolve()};'
 html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */')
 with tempfile.TemporaryDirectory() as tmp:
  f=Path(tmp)/'index.html';f.write_text(html)
  async with async_playwright() as pw:
   b=await pw.chromium.launch(channel='chrome',args=['--no-sandbox']);p=await b.new_page(viewport={'width':360,'height':780});errs=[];p.on('pageerror',lambda e:errs.append(str(e)))
   seed={'onboarded':True,'tour':{'done':1},'gdAt':1999999999999,'ui':{'mode':'dark','accent':'maleem','digits':'east','press':'glow','trans':'slide'}}
   await p.add_init_script('if(!localStorage.tawba_v1)localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_gdrive_native="1";localStorage.alsaer_gdrive_email="preview@example.com";window.AlsaerNative={gdriveAuthorize(){},gdriveSeal(p){return "sealed:"+p},gdriveOpen(s){return s.slice(7)},gdriveSaveBackup(c){window.__phone=c;return true}};')
   await p.goto(f.as_uri());await p.wait_for_timeout(1700)
   try:await p.wait_for_selector('#update109-notice',timeout=4000)
   except Exception:pass
   for sel in ['[data-a=update109Done]','text=تخطي']:
    try:await p.click(sel,timeout=400)
    except Exception:pass
   await p.evaluate('let b=document.createElement("button");b.dataset.a="tab";b.dataset.v="backup";document.body.append(b);b.click();b.remove()')
   assert await p.locator('[data-a=gdup]').count()==1
   assert await p.locator('[data-a=gddown]').count()==1
   assert await p.locator('[data-a=gdsafety]').count()==0
   assert await p.locator('.dm-email').inner_text()=='preview@example.com'
   assert await p.locator('[data-a=gdfileout]').count()==1
   assert await p.locator('[data-a=gddelete]').count()==1
   assert await p.locator('#gd-backup-pw').count()==0
   await p.wait_for_timeout(700);await p.screenshot(path='/tmp/drive-approved-screen-360.png')
   await p.click('[data-a=gdauto]');assert not await p.evaluate('__driveTest.prefs().auto')
   await p.check('[data-gd-encrypt]');await p.fill('#gd-backup-pw','test-password');await p.click('[data-a=gdpwsave]');assert await p.evaluate('__driveTest.prefs().encrypt')
   await p.click('[data-a=gdup]');await p.wait_for_timeout(700);assert await p.evaluate('__uploaded.startsWith("ALSAER-ENC1:")')
   await p.uncheck('[data-gd-encrypt]');await p.click('[data-a=gdup]');await p.wait_for_timeout(300)
   assert await p.evaluate('JSON.parse(__uploaded).app')=='alsaer'
   assert await p.evaluate('__phone===__uploaded')
   assert await p.evaluate('document.documentElement.scrollWidth<=360')
   assert not errs,errs
   print('PASS approved UI: real state changes; optional crypto; signed-in email; Drive and file destinations; auto off; phone copy; no overflow/errors')
   await b.close()
asyncio.run(main())
