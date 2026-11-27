"""Run after tools/build_web.py. Requires Playwright and Chrome."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]

async def main():
    async with async_playwright() as pw:
        for name, saved in [('fresh', {}), ('legacy', {'profile': {'name': 'اختبار'}, 'ui': {'digits': 'east'}, 'quran': {'goal': 2, 'pos': 100}})]:
            saved.update(onboarded=True, tour={'done': 1})
            browser = await pw.chromium.launch(channel='chrome', args=['--no-sandbox'])
            page = await browser.new_page(viewport={'width': 360, 'height': 780})
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.add_init_script('if(!localStorage.tawba_v1)localStorage.tawba_v1='+json.dumps(json.dumps(saved)))
            await page.goto((ROOT/'www/index.html').as_uri())
            await page.wait_for_timeout(1600)
            for selector in ['[data-a=update109Done]', 'text=تخطي']:
                try:
                    await page.click(selector, timeout=400)
                except Exception:
                    pass
            async def go(target):
                await page.evaluate('(v)=>{let b=document.createElement("button");b.dataset.a="tab";b.dataset.v=v;document.body.append(b);b.click();b.remove()}', target)
            await go('reminders')
            assert await page.locator('[data-rem-pane=g-azkar]').count() == 1
            await page.click('[data-rem-pane=checkup]')
            assert await page.locator('[data-rem-pane=g-azkar]').count() == 0
            await go('home')
            await go('settings')
            await page.click('[data-a=scat][data-v=notif]')
            await go('reminders')
            assert await page.locator('[data-rem-pane^=g-], [data-rem-pane=mine]').count() == 4
            await page.click('[data-rem-pane=g-azkar]')
            assert await page.locator('[data-rem-time=wirdTime]').count() == 1
            await page.reload()
            await page.wait_for_timeout(1500)
            await go('reminders')
            assert await page.locator('[data-rem-pane=g-azkar]').count() == 1
            assert not errors, errors
            print('PASS', name, 'checkup exit/re-entry and reload retain the notifications hub groups without clearing data')
            await browser.close()

asyncio.run(main())
