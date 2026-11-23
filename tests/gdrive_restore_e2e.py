"""Build first. Browser test stubs only the Drive download, not restore or crypto."""
import asyncio,json,tempfile
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
    html=(ROOT/'www/index.html').read_text()
    hook="window.__driveTest={download:function(raw){gdDownload=function(){return Promise.resolve(raw)}},encrypt:bkEncrypt};"
    html=html.replace('})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */',hook+'})(); /* إغلاق الغلاف الخارجي المفتوح في core/bootstrap.js */')
    with tempfile.TemporaryDirectory() as tmp:
      target=Path(tmp)/'index.html';target.write_text(html)
      async with async_playwright() as pw:
        b=await pw.chromium.launch(channel='chrome',args=['--no-sandbox'])
        p=await b.new_page(viewport={'width':360,'height':780});errors=[]
        p.on('pageerror',lambda e:errors.append(str(e)))
        seed={'onboarded':True,'tour':{'done':1},'profile':{'name':'الحالي'},'ui':{'mode':'dark','accent':'maleem','digits':'east','press':'glow','trans':'slide'}}
        await p.add_init_script('if(!localStorage.tawba_v1)localStorage.tawba_v1='+json.dumps(json.dumps(seed))+';localStorage.alsaer_gdrive_rt="test";localStorage.alsaer_drive_prefs=JSON.stringify({auto:false});')
        await p.goto(target.as_uri());await p.wait_for_timeout(1500)
        for sel in ['[data-a=update109Done]','text=تخطي']:
          try:await p.click(sel,timeout=400)
          except Exception:pass
        async def backup():
          await p.evaluate('let b=document.createElement("button");b.dataset.a="tab";b.dataset.v="backup";document.body.append(b);b.click();b.remove()')
        await backup()
        raw=json.dumps({'app':'alsaer','S':{'profile':{'name':'المستعاد'}}})
        await p.evaluate('(r)=>__driveTest.download(r)',raw)
        await p.click('[data-a=gddown]');await p.locator('[data-a=gdrestore]').wait_for()
        assert await p.evaluate('JSON.parse(localStorage.tawba_v1).profile.name')=='الحالي'
        await p.locator('[data-a=gdcancel]').scroll_into_view_if_needed();await p.screenshot(path='/tmp/drive-restore-confirm.png')
        await p.click('[data-a=gdcancel]');assert await p.locator('[data-a=gdrestore]').count()==0
        enc=await p.evaluate('(r)=>__driveTest.encrypt(r,"test-password")',raw)
        await p.evaluate('(r)=>__driveTest.download(r)',enc);await p.click('[data-a=gddown]');await p.fill('#gd-restore-pw','wrong')
        await p.click('[data-a=gdrestore]');await p.wait_for_timeout(600)
        assert 'غير صحيحة' in await p.locator('#bk-msg').inner_text()
        assert await p.evaluate('JSON.parse(localStorage.tawba_v1).profile.name')=='الحالي'
        await p.fill('#gd-restore-pw','test-password');await p.screenshot(path='/tmp/drive-restore-password.png');await p.click('[data-a=gdrestore]');await p.wait_for_function('()=>JSON.parse(localStorage.tawba_v1).profile.name==="المستعاد"');await p.wait_for_timeout(1700)
        assert await p.evaluate('JSON.parse(localStorage.tawba_v1).profile.name')=='المستعاد'
        assert await p.evaluate('JSON.parse(localStorage.alsaer_drive_restore_safety_v1).S.profile.name')=='الحالي'
        await backup();assert await p.locator('[data-a=gdsafety]').count()==0
        assert await p.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth')
        assert not errors,errors
        print('PASS UI: download opens confirmation without replacing; cancel; actual AES wrong/correct password; restore persists through reload; internal safety snapshot retained; recovery button hidden; no page errors/overflow')
        await b.close()
asyncio.run(main())
