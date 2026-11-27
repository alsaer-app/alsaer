"""Real method/Asr controls and slow GPS UI. Location transport is simulated."""
import asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 with tempfile.TemporaryDirectory() as td:
  f=Path(td)/'index.html';f.write_text((R/'www/index.html').read_text())
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox']);p=await b.new_page(viewport={'width':360,'height':780})
   await p.add_init_script('localStorage.alsaer_wn_build="999999";localStorage.alsaer_seen_update_200="1";localStorage.tawba_v1='+json.dumps(json.dumps({'onboarded':True,'tour':{'done':1},'loc':{'lat':30.0444,'lng':31.2357,'auto':True,'method':'egypt','asr':1}}))+';Object.defineProperty(navigator,"geolocation",{value:{getCurrentPosition(ok,fail){window.__gpsOK=ok;window.__gpsFail=fail}}});')
   await p.goto(f.as_uri()+'?alsaertest');await p.wait_for_timeout(1700);await p.evaluate('__T.go("ptloc")')
   await p.select_option('[data-loc=method]','karachi');assert await p.evaluate('__T.S().ptimes.fajr===__T.ptCompute(new Date(),30.0444,31.2357,"karachi",1).fajr')
   await p.check('[data-loc=asr][value="2"]');assert await p.evaluate('__T.S().ptimes.asr===__T.ptCompute(new Date(),30.0444,31.2357,"karachi",2).asr')
   await p.click('[data-a=gps]');await p.wait_for_timeout(7600);assert await p.locator('#loc-dlg').count()==0;print('GPS pending text:',await p.locator('#gps-msg').inner_text());assert await p.evaluate('typeof __gpsFail')=='function'
   await p.evaluate('__gpsFail({code:2})');assert await p.locator('#loc-dlg').count()==1;await p.click('#loc-dlg-no');assert await p.locator('#loc-dlg').count()==0
   print('PASS actual method/Asr changes recalculate immediately; 7.6-second pending GPS does not claim disabled; API error opens dialog; simulated location');await b.close()
asyncio.run(main())
