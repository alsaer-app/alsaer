"""Actual app button clicks. Only native/HTTP transport is simulated, never live Google data."""
import asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 html=(R/'www/index.html').read_text();hook='''window.__driveButtons={status:gdStatus};window.__mode='ok';window.__revoked=0;window.__files=[];window.__deletes=0;gdFetch=function(url,opt){if(url.indexOf('revoke?')>=0){__revoked++;return Promise.resolve({ok:__mode!=='revoke-fail'})}if(opt&&opt.method==='DELETE'){__deletes++;return __mode==='partial'?Promise.reject(Error('uncertain')):Promise.resolve({ok:true,status:204})}if(__mode==='network')return Promise.reject(Error('offline'));return Promise.resolve({status:__mode==='auth'?401:__mode==='forbidden'?403:200,ok:__mode!=='auth'&&__mode!=='forbidden',json:()=>Promise.resolve({files:__files,incompleteSearch:__mode==='incomplete'})})};'''
 html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */')
 with tempfile.TemporaryDirectory() as td:
  f=Path(td)/'index.html';f.write_text(html)
  async with async_playwright() as w:
   b=await w.chromium.launch(channel='chrome',args=['--no-sandbox']);p=await b.new_page(viewport={'width':360,'height':780});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   seed={'onboarded':True,'tour':{'done':1},'ui':{'mode':'dark'}}
   await p.add_init_script('localStorage.alsaer_seen_update_200="1";localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_drive_prefs=JSON.stringify({auto:false});window.__calls=[];window.AlsaerNative={gdriveAuthorize(v){__calls.push(v);setTimeout(()=>gdriveOnNativeToken("token","","test@example.com"),0)},gdriveSaveBackup(){return true},gdriveSeal(){return ""},backupImport(){throw Error("picker-unavailable")}};')
   await p.goto(f.as_uri()+'?alsaertest');await p.wait_for_timeout(1700)
   await p.evaluate('let b=document.createElement("button");b.dataset.a="tab";b.dataset.v="backup";document.body.append(b);b.click();b.remove()');await p.wait_for_timeout(100)
   await p.click('[data-a=gdconnect]');await p.wait_for_timeout(150)
   for mode in ['network','forbidden','incomplete','ok']:
    await p.evaluate('(m)=>window.__mode=m',mode);await p.click('[data-a=gddown]');await p.wait_for_timeout(120)
    if mode=='ok':assert await p.locator('.gd-dialog').count()==1;assert await p.locator('[data-a=gdpickgo]').is_disabled();await p.click('[data-a=gdpickcancel]')
    else:assert await p.locator('.gd-dialog').count()==0;assert (await p.locator('#bk-msg').inner_text()).strip()
   await p.evaluate("window.__files=[{id:'owned',name:'alsaer-backup.json',ownedByMe:true,capabilities:{canDelete:true}},{id:'protected',name:'alsaer-backup.json',ownedByMe:false,capabilities:{canDelete:false}}]")
   await p.click('[data-a=gddelete]');assert await p.locator('[data-gd-select="protected"]').is_disabled();await p.check('[data-gd-select="owned"]');await p.click('[data-a=gdpickgo]');await p.click('[data-a=gddeleteback]');assert await p.locator('[data-gd-select="owned"]').is_checked();await p.click('[data-a=gdpickgo]');await p.check('#gd-delete-ack');await p.evaluate('window.__mode="partial"');await p.click('[data-a=gddeletego]');await p.wait_for_timeout(150);assert 'غير مؤكدة' in await p.locator('.gd-dialog-msg').inner_text();assert await p.evaluate('__deletes')==1;await p.click('[data-a=gdpickcancel]')
   await p.check('[data-gd-encrypt]');await p.fill('#gd-backup-pw','abc');await p.click('[data-a=gdpwsave]');assert not json.loads(await p.evaluate('localStorage.alsaer_drive_prefs'))['encrypt'] if 'encrypt' in json.loads(await p.evaluate('localStorage.alsaer_drive_prefs')) else True
   await p.fill('#gd-backup-pw','long-password');await p.click('[data-a=gdpwsave]');assert 'بأمان' in await p.locator('#bk-msg').inner_text();await p.uncheck('[data-gd-encrypt]')
   await p.evaluate('window.__mode="auth"');await p.click('[data-a=gddown]');await p.wait_for_timeout(150);assert await p.locator('[data-a=gddisc]').count()==0;assert await p.locator('[data-a=gdconnect]').is_enabled()
   await p.evaluate('window.__mode="ok"')  # reconnect now validates the new token (ce91490); a still-401 stub would correctly refuse it
   await p.click('[data-a=gdconnect]');await p.wait_for_timeout(150)
   # two-tap unlink: first tap arms, second confirms (Drive card v2)
   await p.evaluate('window.__mode="revoke-fail"');await p.click('[data-a=gddisc]');await p.wait_for_timeout(150);assert 'تأكيد' in await p.locator('[data-a=gddisc]').inner_text();await p.click('[data-a=gddisc]');await p.wait_for_timeout(200);assert await p.locator('[data-a=gddisc]').is_enabled();assert await p.locator('.dm-email').inner_text()=='test@example.com'
   await p.evaluate('window.__mode="ok"');await p.click('[data-a=gddisc]');await p.wait_for_timeout(120);assert 'تأكيد' in await p.locator('[data-a=gddisc]').inner_text();await p.click('[data-a=gddisc]');await p.wait_for_timeout(200);assert await p.locator('[data-a=gddisc]').count()==0;assert await p.evaluate('__revoked')==2
   await p.click('[data-a=gdauto]');assert json.loads(await p.evaluate('localStorage.alsaer_drive_prefs'))['auto']==True
   await p.click('[data-a=gdauto]');assert json.loads(await p.evaluate('localStorage.alsaer_drive_prefs'))['auto']==False
   await p.click('[data-a=gdfilein]');await p.wait_for_timeout(100);assert await p.locator('[data-a=gdfilein]').is_enabled();assert 'منتقي' in await p.locator('#bk-msg').inner_text()
   assert not errors,errors
   await p.screenshot(path='/downloads/drive-buttons-errors.png',full_page=True)
   print('PASS actual UI clicks: network/403/incomplete/empty lists,401->retry,revoke failure/success,auto on/off,picker throw unlocks UI; transport simulated');await b.close()
asyncio.run(main())
