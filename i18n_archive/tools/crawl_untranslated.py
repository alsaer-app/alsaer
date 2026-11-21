import json,sys,re
from playwright.sync_api import sync_playwright
lang=sys.argv[1] if len(sys.argv)>1 else 'en'
JS="""(function(){var out={};function add(t){t=t.replace(/\\s+/g,' ').trim();if(t&&/[\\u0600-\\u06FF]/.test(t))out[t]=1}
var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n;
while((n=w.nextNode())){var p=n.parentNode;if(!p||(p.closest&&p.closest('.mp,.keepar,script,style,.ar,.hadith-text,.new-day-hadith,.qv,.mushaf,textarea,.dhikr,.tsb-ar')))continue;add(n.nodeValue)}
document.querySelectorAll('[placeholder],[aria-label],[title],option').forEach(function(e){['placeholder','aria-label','title'].forEach(function(a){var v=e.getAttribute&&e.getAttribute(a);if(v)add(v)})});
return Object.keys(out)})()"""
allv={};notif={}
def grab(tag,pg):
    for v in pg.evaluate(JS): allv.setdefault(v,tag)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':900})
    pg.add_init_script("window.__sched=[];window.AlsaerNative={setSchedule(j){window.__sched.push(j)},notificationsEnabled(){return true},canExactAlarms(){return true},takePending(){return '[]'},takeRoute(){return ''},getSoundMode(){return 'chime'},setSoundMode(){},requestNotificationPermission(){},testNotification(){},openBatterySettings(){}}")
    pg.goto('file:///home/claude/w56/alsaer/www/index.html?alsaertest');pg.wait_for_timeout(2000)
    pg.evaluate("var s=JSON.parse(localStorage.getItem('tawba_v1')||'{}');s.ui=s.ui||{};s.ui.lang='%s';localStorage.setItem('tawba_v1',JSON.stringify(s))"%lang);pg.reload();pg.wait_for_timeout(2400)
    grab('splash/ob',pg)
    # onboarding step 2 if exists
    for sel in ['button[data-a=obnext]','[data-a=ob]']:
        try:
            pg.click(sel,timeout=800);pg.wait_for_timeout(300);grab('ob2',pg)
        except Exception:pass
    pg.evaluate("var s=JSON.parse(localStorage.getItem('tawba_v1'));s.ui=s.ui||{};s.ui.lang='%s';s.loc={city:'x',lat:30,lng:31,auto:true,method:'egypt',asr:1,gps:1,gpsAt:Date.now()};s.profile={name:'',age:'',photo:''};localStorage.setItem('tawba_v1',JSON.stringify(s));localStorage.removeItem('alsaer_seen_update_1010');localStorage.setItem('alsaer_daily_reminders_v1',JSON.stringify({consent:true,enabled:true,smart:true,malik:true,kahf:true,salat:true,weekly:true,custom:[{id:1,t:'ذكر',time:'10:00',n:2,ev:30}]}))"%lang)
    pg.reload();pg.wait_for_timeout(2800)
    grab('update-popup',pg)
    try: pg.click('[data-a=update109Done]',timeout=1500)
    except Exception: pass
    pg.wait_for_timeout(300)
    tabs=['home','worship','calendar','progress','more','fasting','prayers','quran','adhkar','habits','boost','ach','developer','settings','reminders','tasbih','log','privacy']
    for t in tabs:
        try:
            pg.evaluate("__T.go('%s')"%t);pg.wait_for_timeout(350);grab(t,pg)
        except Exception as e: pass
        if t=='settings':
            for o in ['lng','look','digits','clk','loc','notif','perm','homecfg','prof','bk','sys','help','about','rst','acct','appearance','security','data','profile','lang']:
                try:
                    pg.evaluate("__T.go('settings','%s')"%o);pg.wait_for_timeout(250);grab('settings:'+o,pg)
                except Exception: pass
        if t=='reminders':
            for pn in ['smart','mine','tools']:
                try: pg.click('[data-rem-pane=%s]'%pn,timeout=1500);pg.wait_for_timeout(250);grab(t+':'+pn,pg)
                except Exception: pass
        if t=='adhkar':
            for g in ['morning','evening','afterprayer','urge','sleep']:
                try: pg.evaluate("__T.go('adhkar')");pg.click('[data-a=grp][data-v=%s]'%g,timeout=1000);pg.wait_for_timeout(200);grab(t+':'+g,pg)
                except Exception: pass
        if t=='tasbih':
            for sel in ['[data-a=tsbmode][data-v=voice]','[data-a=tsbpanel]']:
                try: pg.click(sel,timeout=800);pg.wait_for_timeout(250);grab('tasbih:'+sel,pg)
                except Exception: pass
        if t=='habits':
            for sel in ['[data-a=newhabit]','[data-a=mgtarget]','[data-a=repr][data-v=week]','[data-a=repr][data-v=month]','[data-a=addhabit]']:
                try: pg.click(sel,timeout=800);pg.wait_for_timeout(250);grab('habits:'+sel,pg)
                except Exception: pass
        if t=='quran':
            for sel in ['[data-a=sura]','[data-a=readsura]','[data-a=mpset]','[data-mp=open]','[data-a=mps]']:
                try: pg.click(sel,timeout=800);pg.wait_for_timeout(300);grab('quran:'+sel,pg)
                except Exception: pass
    # reader + mushaf settings
    try:
        pg.evaluate("__T.go('quran')");pg.wait_for_timeout(300)
        pg.click('[data-a=openq],[data-a=sur],[data-sura],[data-a=read]',timeout=1000);pg.wait_for_timeout(1200);grab('reader',pg)
    except Exception: pass
    pg.wait_for_timeout(500)
    sch=pg.evaluate('window.__sched')
    for j in sch:
        try:
            o=json.loads(j) if isinstance(j,str) else j
            for it in (o if isinstance(o,list) else o.get('items',o.get('list',[]))):
                for k in ('title','body'):
                    v=it.get(k,'')
                    if re.search('[؀-ۿ]',v): notif[v]='notif'
                a=it.get('act') or {}
                if a.get('l') and re.search('[؀-ۿ]',a['l']):notif[a['l']]='notif-act'
        except Exception as e: print('sched err',e)
    out=dict(allv);out.update(notif)
json.dump(out,open('/tmp/crawl2_%s.json'%lang,'w'),ensure_ascii=False,indent=0)
print(len(allv),len(notif))
