import asyncio,json,tempfile,re
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
INIT=[l for l in (R/'tests/gdrive_account_recovery_e2e.py').read_text().split('\n') if 'add_init_script' in l][0].strip()
async def main():
 html=(R/'www/index.html').read_text()
 async with async_playwright() as w:
  b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
  for status,name in ((200,'2xx'),(401,'401'),(403,'403')):
   with tempfile.TemporaryDirectory() as td:
    f=Path(td)/'index.html';f.write_text(html)
    p=await b.new_page(viewport={'width':360,'height':800});seed={'onboarded':True,'tour':{'done':1},'ui':{'lang':'ar','mode':'dark'}}
    await p.route('**/www.googleapis.com/drive/v3/about*',(lambda s:(lambda r,q=None:r.fulfill(status=s,content_type='application/json',body='{"user":{"emailAddress":"a@example.com"}}' if s==200 else '{"error":{"message":"secret raw text"}}')))(status))
    await p.add_init_script('localStorage.alsaer_seen_update_200="1";localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_drive_prefs=JSON.stringify({auto:false});window.AlsaerNative={gdriveAuthorize(v){},gdriveRevoke(){}};')
    await p.goto(f.as_uri()+'?alsaertest');await p.wait_for_timeout(1700)
    await p.evaluate("let b=document.createElement('button');b.dataset.a='tab';b.dataset.v='backup';document.body.append(b);b.click();b.remove()");await p.wait_for_timeout(120)
    await p.evaluate("document.querySelector('[data-a=gdconnect]').click()");await p.wait_for_timeout(100)
    await p.evaluate("gdriveOnNativeToken('tok-secret','','')");await p.wait_for_timeout(500)
    body=await p.evaluate("document.body.innerText");linked=await p.evaluate("localStorage.getItem('alsaer_gdrive_native')")
    perm=await p.evaluate("localStorage.getItem('alsaer_gd_perm')");msg=await p.evaluate("document.querySelector('#bk-msg')?document.querySelector('#bk-msg').textContent:''")
    assert 'tok-secret' not in body and 'secret raw text' not in body
    D=lambda t:t.translate(str.maketrans('٠١٢٣٤٥٦٧٨٩','0123456789'))  # ar UI may show eastern digits
    if name=='2xx':
     assert linked=='1' and not perm and 'يلزم التحقق' not in body and 'تم ربط Google Drive' in msg
    elif name=='401':
     assert linked is None and not perm and 'http-401' in D(msg) and 'يلزم التحقق' not in body
    else:
     assert linked=='1' and perm=='http-403' and 'يلزم التحقق' in body and 'http-403' in D(body) and 'تم ربط Google Drive' not in msg
     await p.add_style_tag(content='.tabbar{visibility:hidden!important}');await p.locator('.gd-perm').scroll_into_view_if_needed();await p.screenshot(path='/downloads/drive-403-state.png',full_page=False)
    print('PASS',name,'linked=',linked,'perm=',perm,'|',msg[:60]);await p.close()
  await b.close()
asyncio.run(main())
