import asyncio,json,sys
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as w:
  b=await w.chromium.launch(channel='chrome',args=['--no-sandbox']);p=await b.new_page();r=Path(__file__).resolve().parents[1]
  seed={'onboarded':True,'tour':{'done':1},'ui':{'lang':'en'},'profile':{'name':'الملف الشخصي'},'myHabits':[{'id':'xh1','t':'الملف الشخصي'}],'customWorship':[{'id':'cw1','t':'الملف الشخصي'}],'books':[{'id':'b1','n':'الملف الشخصي','au':'الملف الشخصي','pages':100,'read':1,'per':2,'log':{},'note':'الملف الشخصي'}],'notes':[{'id':'n1','t':'الملف الشخصي','d':'2026-11-24','at':1}]}
  await p.add_init_script('localStorage.alsaer_seen_update_200="1";localStorage.tawba_v1='+json.dumps(json.dumps(seed)))
  await p.goto((r/'www/index.html').as_uri()+'?alsaertest');await p.wait_for_timeout(1000)
  await p.evaluate("__I18N.go('notes','','',null)");await p.wait_for_timeout(200)
  assert await p.locator('.nt-i p.keepar').inner_text()=='الملف الشخصي'
  assert 'My notes' in await p.locator('#app').inner_text()
  assert await p.evaluate("__I18N.trS('صباح الخير يا الملف الشخصي','en')")== 'Good morning, الملف الشخصي'
  assert await p.evaluate("__I18N.trS('الملف الشخصي','en')")== 'Profile'
  for target,sel in [('habits','.nm.keepar'),('worship','.worship-name.keepar'),('books','.bo-t b.keepar')]:
   await p.evaluate("t=>__I18N.go(t,'','',null)",target);await p.wait_for_timeout(100)
   assert await p.locator(sel).first.inner_text()=='الملف الشخصي',(target,await p.locator('#app').inner_text())
  await p.evaluate("__I18N.go('settings','account','account-prof','prof')");await p.wait_for_timeout(100)
  assert await p.locator('#profile-preview-name').inner_text()=='الملف الشخصي'
  await p.evaluate("__I18N.go('notes','','',null)")
  before=await p.evaluate('localStorage.tawba_v1')
  await p.evaluate("__I18N.setLang('fr')");await p.wait_for_timeout(120)
  assert await p.locator('.nt-i p.keepar').inner_text()=='الملف الشخصي'
  assert 'Mes notes' in await p.locator('#app').inner_text()
  assert json.loads(await p.evaluate('localStorage.tawba_v1'))['notes'][0]['t']=='الملف الشخصي'
  print('PASS personal note/name preserved in EN/FR while matching UI labels translate; saved data unchanged')
  await b.close()
asyncio.run(main())
