import asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 html=(R/'www/index.html').read_text();hook='window.__gdAccount={view:vBackup,act:gdAct};'
 html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */')
 with tempfile.TemporaryDirectory() as td:
  f=Path(td)/'index.html';f.write_text(html)
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
   for lang in ['ar','en','fr']:
    p=await b.new_page(viewport={'width':320,'height':800});seed={'onboarded':True,'tour':{'done':1},'ui':{'lang':lang,'mode':'dark'}}
    await p.route('**/www.googleapis.com/drive/v3/about*',lambda r:r.fulfill(status=200,content_type='application/json',body='{"user":{"emailAddress":"selected@example.com"}}'))  # token check before declaring success (ce91490)
    await p.add_init_script('localStorage.alsaer_seen_update_200="1";localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_drive_prefs=JSON.stringify({auto:false});window.__authCalls=[];window.AlsaerNative={gdriveAuthorize(v){__authCalls.push(v)}};')
    await p.goto(f.as_uri()+'?alsaertest');await p.wait_for_timeout(1700)
    async def draw():
     await p.evaluate("let b=document.createElement('button');b.dataset.a='tab';b.dataset.v='backup';document.body.append(b);b.click();b.remove()");await p.wait_for_timeout(120)
    await draw();assert await p.locator('[data-a=gdconnect]').count()==1;assert await p.locator('[data-a=gddisc]').count()==0
    await p.evaluate("document.querySelector('[data-a=gdconnect]').click()");await p.wait_for_timeout(100);assert await p.evaluate('__authCalls')==[True]
    await p.evaluate("gdriveOnNativeToken('new-token','','selected@example.com')");await p.wait_for_timeout(100);await draw()
    assert await p.locator('[data-a=gdconnect]').count()==1;assert await p.locator('[data-a=gddisc]').count()==1;assert await p.locator('.dm-email').inner_text()=='selected@example.com'
    await p.evaluate("document.querySelector('[data-a=gdconnect]').click()");await p.evaluate("gdriveOnNativeToken('changed-token','','changed@example.com')");await p.wait_for_timeout(100);await draw();assert await p.locator('.dm-email').inner_text()=='changed@example.com'
    await p.evaluate("document.querySelector('[data-a=gdconnect]').click()");await p.evaluate("gdriveOnNativeToken('','cancelled','')");await p.wait_for_timeout(100);await draw();assert await p.locator('.dm-email').inner_text()=='changed@example.com'
    await p.evaluate("document.querySelector('[data-a=gdconnect]').click()");await p.evaluate("gdriveOnNativeToken('','consent-required','')");await p.wait_for_timeout(100);await draw();assert await p.locator('[data-a=gdconnect]').count()==1;assert await p.locator('[data-a=gddisc]').count()==0
    assert await p.evaluate('document.documentElement.scrollWidth<=320')
    await p.locator('[data-a=gdconnect]').scroll_into_view_if_needed();await p.add_style_tag(content='.tabbar{visibility:hidden!important}');await p.screenshot(path='/downloads/drive-account-'+lang+'-320.png',full_page=True)
    print('PASS',lang,'unlinked/link/change/cancel/stale-consent/retry320px, native transport simulated');await p.close()
   await b.close()
asyncio.run(main())
