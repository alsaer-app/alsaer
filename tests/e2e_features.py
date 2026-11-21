import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,locale='ar-EG',timezone_id='Africa/Cairo')
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///home/claude/w10036/alsaer/www/index.html?alsaertest'); await pg.wait_for_timeout(2500)
        ob=pg.locator('button[data-a=ob]')
        if await ob.count(): await ob.first.click()
        await pg.reload(); await pg.wait_for_timeout(3500)
        if await pg.locator('[data-a=update109Done]').count(): await pg.click('[data-a=update109Done]')
        # accuracy: compute for several cities on fixed dates
        r=await pg.evaluate("""()=>{var out={};[['القاهرة',30.0444,31.2357,'egypt'],['مكة المكرمة',21.3891,39.8579,'makkah'],['لندن',51.5074,-0.1278,'mwl']].forEach(c=>{out[c[0]]=__T.ptCompute(new Date(2026,10,8,12),c[1],c[2],c[3],1)});return out}""")
        print(r)
        print('qibla cairo',await pg.evaluate("Math.round(__T.qiblaBearing(30.0444,31.2357))"),'london',await pg.evaluate("Math.round(__T.qiblaBearing(51.5074,-0.1278))"))
        # UI
        await pg.evaluate("document.querySelector('[data-a=tab][data-v=home]').click()")
        await pg.evaluate("__T.go('prayers')"); await pg.wait_for_timeout(300)
        await pg.select_option('select[data-loc=city]','0'); await pg.wait_for_timeout(400)
        print('ptimes',await pg.evaluate("JSON.stringify(__T.S().ptimes)"))
        await pg.screenshot(path='/tmp/shots/pray.png',full_page=True)
        await pg.evaluate("__T.go('tasbih')"); await pg.wait_for_timeout(200)
        for i in range(35): await pg.click('[data-a=tsbtap]')
        print('tasbih',await pg.evaluate("JSON.stringify(__T.S().tasbih)"))
        await pg.screenshot(path='/tmp/shots/tasbih.png')
        await pg.evaluate("__T.go('progress')"); await pg.wait_for_timeout(200)
        print('wr',await pg.locator('.wr-row').count())
        await pg.screenshot(path='/tmp/shots/progress.png',full_page=True)
        await pg.evaluate("__T.go('quran')"); await pg.wait_for_timeout(300)
        print('khe',await pg.locator('.khe').inner_text())
        # settings: lock delay + home hide
        await pg.evaluate("__T.go('settings','homecfg')"); await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{var i=document.querySelector('[data-hide=tiles]');i.checked=false;i.dispatchEvent(new Event('change',{bubbles:true}))})()"); await pg.wait_for_timeout(300)
        await pg.evaluate("__T.go('home')"); await pg.wait_for_timeout(300)
        print('tiles hidden',await pg.locator('.sura-tile').count())
        await pg.evaluate("__T.go('settings','lockdelay')"); await pg.wait_for_timeout(200)
        await pg.click('[data-a=lockdelay][data-v="0"]'); print('lockDelay',await pg.evaluate("__T.S().lockDelay"))
        # undo grace: pray toggle on then off immediately
        await pg.evaluate("__T.go('prayers')"); await pg.wait_for_timeout(200)
        await pg.locator('[data-a=pray]').first.click(); await pg.locator('[data-a=pray]').first.click()
        print('grace undo ok', await pg.evaluate("(()=>{var P=__T.S().prayers,k=Object.keys(P)[0];return JSON.stringify(k?P[k]:null)})()"))
        await pg.locator('[data-a=pray]').first.click()
        await pg.evaluate("(()=>{var k=Object.keys(__T.S().locks)[0];__T.S().locks[k]=Date.now()-20000})()")
        await pg.locator('[data-a=pray]').first.click(); print('after grace blocked', await pg.evaluate("(()=>{var P=__T.S().prayers,k=Object.keys(P)[0];return JSON.stringify(k?P[k]:null)})()"))
        print(errs); await b.close()
asyncio.run(main())
