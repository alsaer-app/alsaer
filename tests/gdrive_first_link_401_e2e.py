import asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 html=(R/'www/index.html').read_text()
 async with async_playwright() as w:
  b=await w.chromium.launch(channel='chrome',args=['--no-sandbox'])
  for case in ('fresh-ok','fresh-also-401'):
   with tempfile.TemporaryDirectory() as td:
    f=Path(td)/'index.html';f.write_text(html)
    p=await b.new_page(viewport={'width':360,'height':800});seed={'onboarded':True,'tour':{'done':1},'ui':{'lang':'ar','mode':'dark'}}
    good='tok-fresh' if case=='fresh-ok' else 'none'
    await p.route('**/www.googleapis.com/drive/v3/about*',(lambda g:lambda r,q:r.fulfill(status=200 if q.headers.get('authorization')=='Bearer '+g else 401,content_type='application/json',body='{"user":{"emailAddress":"a@example.com"}}' if q.headers.get('authorization')=='Bearer '+g else '{"error":{"code":401,"status":"UNAUTHENTICATED","errors":[{"reason":"authError"}]}}'))(good))
    native=("window.__calls=[];window.AlsaerNative={gdriveAuthorize(v){window.__calls.push('auth-ui');setTimeout(()=>gdriveOnNativeToken((window.__calls.filter(x=>x==='auth-ui').length>1?(window.__fresh||'tok-fresh'):'tok-stale'),'',''),20)},"
      "gdriveClearToken(t){window.__calls.push('clear:'+t);setTimeout(()=>window.gdriveOnTokenCleared(),20)},"
      "gdriveAuthorizeAccount(v,e){window.__calls.push('silent:'+e);setTimeout(()=>gdriveOnNativeToken(window.__fresh||'tok-fresh','','a@example.com'),20)},gdriveRevoke(){}};")
    await p.add_init_script('localStorage.alsaer_seen_update_200="1";localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_drive_prefs=JSON.stringify({auto:false});'+native+('window.__fresh="tok-other";' if case!='fresh-ok' else ''))
    await p.goto(f.as_uri()+'?alsaertest');await p.wait_for_timeout(1700)
    await p.evaluate("let b=document.createElement('button');b.dataset.a='tab';b.dataset.v='backup';document.body.append(b);b.click();b.remove()");await p.wait_for_timeout(120)
    await p.evaluate("document.querySelector('[data-a=gdconnect]').click()");await p.wait_for_timeout(8500)
    calls=await p.evaluate("window.__calls");linked=await p.evaluate("localStorage.getItem('alsaer_gdrive_native')")
    msg=await p.evaluate("document.querySelector('#bk-msg')?document.querySelector('#bk-msg').textContent:''")
    D=lambda t:t.translate(str.maketrans('٠١٢٣٤٥٦٧٨٩','0123456789'))
    if case=='fresh-ok':
     assert calls==['auth-ui','clear:tok-stale','auth-ui'],calls
     assert linked=='1' and 'http-401' not in D(msg),(linked,msg)
    else:
     assert calls==['auth-ui','clear:tok-stale','auth-ui'],calls  # exactly one retry
     assert linked is None and 'http-401-UNAUTHENTICATED-authError' in D(msg) and 'tok-' not in msg,(linked,msg)
    print('PASS',case,calls,linked,msg[:50]);await p.close()
  await b.close()
asyncio.run(main())
