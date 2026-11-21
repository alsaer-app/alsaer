import asyncio
from playwright.async_api import async_playwright
MOCK="""window.AlsaerNative={notificationsEnabled:()=>true,canExactAlarms:()=>true,setSchedule(j){window.__sched=j},setSoundMode(){},getSoundMode:()=>'chime',testNotification(){},takePending:()=>'[]',takeRoute:()=>'',requestNotificationPermission(){},openAppNotificationSettings(){},openExactAlarmSettings(){},openBatterySettings(){}};"""
async def run(locale,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,locale=locale)
        await ctx.add_init_script(MOCK)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('file:///home/claude/w10036/alsaer/www/index.html'); await pg.wait_for_timeout(2500)
        ob=pg.locator('button[data-a=ob]')
        if await ob.count(): await ob.first.click()
        await pg.reload(); await pg.wait_for_timeout(3500)
        if await pg.locator('[data-a=update109Done]').count(): await pg.click('[data-a=update109Done]')
        await pg.click('[data-a=tab][data-v=more]'); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelector('[data-a=tab][data-v=reminders]').click()"); await pg.wait_for_timeout(500)
        print(tag,'ap present',await pg.locator('.rm-ap').count(),'hours',await pg.locator('#cu-h option').count(),'biotest',await pg.locator('[data-rem-action=biotest]').count())
        await pg.fill('#cu-name','ذكر الصباح')
        if await pg.locator('.rm-ap').count():
            await pg.select_option('#cu-h','7'); await pg.select_option('#cu-m','30')
            await pg.evaluate("document.querySelector('[data-rem-cu=ap][value=pm]').click()"); await pg.wait_for_timeout(300)
            await pg.fill('#cu-name','ذكر المساء')
        else:
            await pg.select_option('#cu-h','19'); await pg.select_option('#cu-m','30')
        await pg.click('[data-rem-action=cuadd]'); await pg.wait_for_timeout(400)
        st=await pg.evaluate("(()=>{var k=Object.keys(localStorage).filter(k=>/rem/i.test(k));return k.map(x=>[x,(JSON.parse(localStorage[x]).custom||[])])})()")
        print(tag,st)
        print(tag,await pg.evaluate("document.querySelector('.rm-row:last-of-type small, .rm-del') && [...document.querySelectorAll('.rm-del')].length"))
        # toggle off the custom
        await pg.evaluate("(()=>{var i=document.querySelector('[data-rem-cuon]');i.checked=false;i.dispatchEvent(new Event('change',{bubbles:true}))})()"); await pg.wait_for_timeout(400)
        print(tag,'on flag',await pg.evaluate("(()=>{var k=Object.keys(localStorage).filter(k=>/rem/i.test(k))[0];return JSON.parse(localStorage[k]).custom[0].on})()"))
        await pg.screenshot(path='/tmp/shots/%s_rem.png'%tag,full_page=True)
        # adhkar
        await pg.evaluate("document.querySelector('[data-a=tab][data-v=home]').click()"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelector('[data-a=tab][data-v=more]').click()"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelector('[data-a=tab][data-v=adhkar]').click()"); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelector('[data-a=grp][data-v=afterprayer]').click()"); await pg.wait_for_timeout(300)
        print(tag,'after items',await pg.locator('.dhikr').count(), await pg.locator('.chip').count())
        await pg.screenshot(path='/tmp/shots/%s_adk.png'%tag)
        await pg.evaluate("document.querySelector('[data-a=grp][data-v=morning]').click()"); await pg.wait_for_timeout(300)
        print(tag,'morning items',await pg.locator('.dhikr').count(),errs)
        await b.close()
asyncio.run(run('ar-EG','ar')); asyncio.run(run('en-GB','gb'))
