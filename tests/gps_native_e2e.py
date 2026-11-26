import asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 html=(R/'www/index.html').read_text()
 async with async_playwright() as w:
  b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
  for case in ('ok','denied','off','fail-then-web'):
   with tempfile.TemporaryDirectory() as td:
    f=Path(td)/'index.html';f.write_text(html)
    p=await b.new_page(viewport={'width':360,'height':800});seed={'onboarded':True,'tour':{'done':1},'loc':{'lat':30.0444,'lng':31.2357,'auto':True,'method':'egypt','asr':1}}
    res={'ok':"gpsOnNative(30.78,31.0,20,'')",'denied':"gpsOnNative(0,0,0,'denied')",'off':"gpsOnNative(0,0,0,'off')",'fail-then-web':"gpsOnNative(0,0,0,'timeout')"}[case]
    await p.add_init_script('localStorage.alsaer_seen_update_200="1";localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';window.__n=0;window.__web=0;window.AlsaerNative={locHasPermission(){return false},locGet(){window.__n++;setTimeout(()=>'+res+',30)},openLocationSettings(){}};Object.defineProperty(navigator,"geolocation",{value:{getCurrentPosition(ok,er){window.__web++;er({code:3})},watchPosition(ok,er){er({code:3});return 1},clearWatch(){}}});')
    await p.goto(f.as_uri()+'?alsaertest');await p.wait_for_timeout(1700)
    await p.evaluate('__T.go("ptloc")');await p.wait_for_timeout(300)
    await p.click('[data-a=gps]');await p.wait_for_timeout(250)
    n=await p.evaluate("window.__n");web=await p.evaluate("window.__web")
    loc=await p.evaluate("(JSON.parse(localStorage.tawba_v1).loc)||{}")
    msg=await p.evaluate("(document.getElementById('gps-msg')||{}).textContent||''")
    if case=='ok': assert n==1 and web==0 and loc.get('lat')==30.78 and loc.get('gps')==1,(n,web,loc)
    if case=='denied': assert n==1 and web==0 and 'loc-denied' in msg,(n,web,msg)
    if case=='off': assert n==1 and web==0 and 'loc-off' in msg,(n,web,msg)
    if case=='fail-then-web': assert n==1 and web>=1,(n,web)
    print('PASS',case,n,web,msg[:40]);await p.close()
  await b.close()
asyncio.run(main())
