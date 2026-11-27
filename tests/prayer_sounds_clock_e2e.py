"""Five prayer reminders under 12h and 24h clocks (app setting 12 / 24, and «auto» with a 12h or 24h system locale).
For each: (1) the schedule handed to native has all five prayers (fajr, dhuhr, asr, maghrib, isha) at exactly the saved 24h hour/minute,
whatever the display format; (2) editing each prayer time through the digital time input (AM/PM in 12h, 0-23 in 24h, incl. 12 PM noon) stores the right 24h value
and the native schedule follows; (3) the sound setting (chime / system / silent) reaches native unchanged and does not alter any prayer time.
Native is a recording mock: real notification sound on a phone is not covered."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
F=[]
def ck(c,m):
    if not c:F.append(m)
MOCK="""window.__cap={sched:[],snd:[]};window.AlsaerNative=new Proxy({},{get:function(t,k){if(k==='setSchedule')return function(s){window.__cap.sched.push(s)};if(k==='setSoundMode')return function(m){window.__cap.snd.push(m)};if(k==='notificationsEnabled'||k==='canExactAlarms')return function(){return true};return function(){return ''}},has:function(){return true}});"""
IDS=['fajr','dhuhr','asr','maghrib','isha']
START={'fajr':'04:30','dhuhr':'12:05','asr':'15:30','maghrib':'18:15','isha':'19:45'}
EDIT={'fajr':(5,10,'am'),'dhuhr':(12,0,'pm'),'asr':(4,20,'pm'),'maghrib':(6,0,'pm'),'isha':(9,30,'pm')}
def h24(h,m,ap):return '%02d:%02d'%((h%12)+(12 if ap=='pm' else 0),m)
def sched(pg):
    s=pg.evaluate("window.__cap.sched.length?window.__cap.sched[window.__cap.sched.length-1]:null")
    d={}
    if s:
        for i in json.loads(s):
            if str(i.get('id','')).startswith('pray_'):d[i['id'][5:]]='%02d:%02d'%(i['h'],i['m'])
    return d
CASES=[('12','en-US',True),('24','en-US',False),('auto','en-US',True),('auto','en-GB',False)]
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    for mode,loc,is12 in CASES:
        tag='[%s %s]'%(mode,loc)
        ctx=b.new_context(viewport={'width':360,'height':780},locale=loc);ctx.add_init_script(MOCK)
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        st={'onboarded':True,'tour':1,'update109':1,'ptimes':dict(START)}
        if mode!='auto':st['clockMode']=mode
        pg.add_init_script("if(!localStorage.tawba_v1){localStorage.tawba_v1=%s;localStorage.alsaer_daily_reminders_v1=%s}"%(json.dumps(json.dumps(st)),json.dumps(json.dumps({'enabled':True,'consent':True,'prayers':True,'soundMode':'chime'}))))
        pg.goto((R/'www/index.html').as_uri());pg.wait_for_timeout(4500)
        ck(sched(pg)==START,tag+' initial schedule differs from saved times: %r'%sched(pg))
        # sounds: each mode reaches native and prayer times stay
        for sm in ('system','silent','chime'):
            pg.evaluate("m=>{var i=document.createElement('input');i.type='radio';i.setAttribute('data-rem-sound',m);document.body.append(i);i.dispatchEvent(new Event('change',{bubbles:true}));i.remove()}",sm)
            pg.wait_for_timeout(1600)
            ck(pg.evaluate("window.__cap.snd.slice(-1)[0]")==sm,tag+' sound %s did not reach native: %r'%(sm,pg.evaluate("window.__cap.snd")))
            ck(sched(pg)==START,tag+' prayer times changed after choosing sound '+sm)
        # edit times through the digital input
        pg.evaluate("v=>{var b=document.createElement('button');b.dataset.a='tab';b.dataset.v=v;document.body.append(b);b.click();b.remove()}",'prayers');pg.wait_for_timeout(800)
        want={}
        for pid in IDS:
            hh,mm,ap=EDIT[pid];want[pid]=h24(hh,mm,ap)
            ok=pg.evaluate("""([pid,hh,mm,ap,is12])=>{var hid=document.querySelector('input[type=hidden][data-pt='+pid+']');if(!hid||hid.type!=='hidden')return 'nohid';
              var w=hid.parentNode.querySelector('.tin');if(!w)return 'notin';var H=w.querySelector('.tin-h'),M=w.querySelector('.tin-m');
              var shown=!!w.querySelector('.tin-ap');if(shown!==is12)return 'ap-mismatch';
              H.value=String(hh);M.value=String(mm);if(is12){var b=w.querySelector('[data-ap='+ap+']');b.click()}else{/* 24h: hour is 0-23 */H.value=String(hh+(ap==='pm'&&hh<12?12:0))}
              H.dispatchEvent(new Event('change',{bubbles:true}));return 'ok'}""",[pid,hh,mm,ap,is12])
            ck(ok=='ok',tag+' %s time input: %s'%(pid,ok))
            pg.wait_for_timeout(200)
        pg.wait_for_timeout(2500)
        got=pg.evaluate("JSON.parse(localStorage.getItem('tawba_v1')||'{}').ptimes||{}")
        for pid in IDS:ck(got.get(pid)==want[pid],tag+' %s stored %r expected %r'%(pid,got.get(pid),want[pid]))
        ck(sched(pg)=={k:want[k] for k in IDS},tag+' schedule after edits: %r'%sched(pg))
        ck(not errs,tag+' page errors %r'%errs[:2])
        ctx.close()
    b.close()
print('OK' if not F else 'FAIL',F)
raise SystemExit(1 if F else 0)
