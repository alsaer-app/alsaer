"""«استمع لقارئ»: قائمة، بحث، فلتر رواية، فتح قارئ، تشغيل/إيقاف، التالي تلقائيًا، ترجمة الست لغات (الأسماء والروايات والسور تبقى عربية)."""
import json,re,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=(Path(__file__).resolve().parents[1]/'www/index.html').as_uri()
def click(pg,a,v=''):
    pg.evaluate("([a,v])=>{var b=document.createElement('button');b.dataset.a=a;b.dataset.v=v;document.body.append(b);b.click();b.remove()}",[a,v])
def page(b,lang):
    pg=b.new_page(viewport={'width':360,'height':780});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/index.html',lambda r:r.fulfill(body='<html></html>',content_type='text/html'),times=1)
    pg.goto(URL);pg.evaluate("s=>localStorage.setItem('tawba_v1',s)",json.dumps({'onboarded':True,'tour':1,'update109':1,'ui':{'lang':lang,'mode':'dark'}}));pg.goto(URL);pg.wait_for_timeout(1200)
    try:pg.wait_for_selector('#update109-notice',timeout=4000)
    except Exception:pass
    try:pg.click('[data-a=update109Done]',timeout=500)
    except Exception:pass
    return pg,errs
F=[]
def ck(c,m):
    if not c:F.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    pg,errs=page(b,'ar')
    # More tile opens the screen
    click(pg,'tab','more');pg.wait_for_timeout(500)
    ck(pg.locator('.mtile[data-v=reciters]').count()==1,'more tile missing');pg.locator('.mtile[data-v=reciters]').click();pg.wait_for_timeout(1500)
    n=pg.locator('#rct-l .rdo-row').count();ck(n==158,'rows %d'%n)
    for rw,exp in (('ورش عن نافع',8),('قالون عن نافع',10),('other',None),('',158)):
        click(pg,'rctrw',rw);pg.wait_for_timeout(300);c=pg.locator('#rct-l .rdo-row').count()
        ck(c==exp if exp else 0<c<158,'filter %s %d'%(rw,c))
    pg.fill('#rct-q','الحصري');pg.wait_for_timeout(500);ck(pg.locator('#rct-l .rdo-row').count()>=1,'search')
    pg.fill('#rct-q','zzzz');pg.wait_for_timeout(400);ck('لا نتائج' in pg.inner_text('#rct-l'),'empty')
    pg.fill('#rct-q','');pg.wait_for_timeout(300)
    pg.locator('#rct-l .rdo-row').first.click();pg.wait_for_timeout(500)
    ck(pg.locator('#rct-l .rdo-row').count()==114,'114 suras')
    pg.fill('#rct-sq','الكهف');pg.wait_for_timeout(400);ck(pg.locator('#rct-l .rdo-row').count()==1,'sura search')
    pg.fill('#rct-sq','');pg.wait_for_timeout(300)
    # fake audio so play/pause/next are testable without network
    pg.evaluate("""()=>{window.__au=[];window.Audio=function(){var a=window.__last={pause(){this.p=1},load(){},removeAttribute(){},play(){window.__au.push(this.src);var s=this;setTimeout(()=>s.onplaying&&s.onplaying(),10);return Promise.resolve()}};return a}}""")
    click(pg,'rctplay','2');pg.wait_for_timeout(300)
    ck((pg.evaluate("(()=>{var e=document.querySelector('#rct-l .rdo-row.on');return e?+e.dataset.v:0})()"))==2 and '⏸' in pg.inner_text('#rct-l .rdo-row.on'),'play state')
    ck(pg.evaluate('window.__au[0]').endswith('/002.mp3'),'url '+str(pg.evaluate('window.__au[0]')))
    ck('⏸' in pg.inner_text('#rct-l .rdo-row.on'),'pause icon')
    pg.evaluate('window.__last.onended()');pg.wait_for_timeout(300);ck((pg.evaluate("(()=>{var e=document.querySelector('#rct-l .rdo-row.on');return e?+e.dataset.v:0})()"))==3,'auto next')
    click(pg,'rctplay','3');pg.wait_for_timeout(200);ck((pg.evaluate("(()=>{var e=document.querySelector('#rct-l .rdo-row.on');return e?+e.dataset.v:0})()"))==0,'stop on second tap')
    click(pg,'rctplay','114');pg.wait_for_timeout(200);pg.evaluate('window.__last.onended()');pg.wait_for_timeout(200);ck((pg.evaluate("(()=>{var e=document.querySelector('#rct-l .rdo-row.on');return e?+e.dataset.v:0})()"))==0,'stop after 114')
    click(pg,'rctback');pg.wait_for_timeout(400);ck(pg.locator('#rct-q').count()==1,'back')
    ck(not errs,'js errors %s'%errs[:2])
    # translations: UI chrome translated, names/riwaya/suras Arabic
    for lang,exp in (('en','Listen to a Reciter'),('fr','Écouter un récitant'),('tr','Bir Kâriyi Dinle'),('de','Einem Rezitator zuhören'),('fa','گوش دادن به یک قاری'),('ur','قاری کو سنیں')):
        q,e2=page(b,lang);click(q,'tab','reciters');q.wait_for_timeout(1500)
        t=q.inner_text('.rdo-hero');ck(exp in q.inner_text('body') or exp in t,'%s title'%lang)
        ck(q.locator('#rct-q').get_attribute('placeholder')!='ابحث عن قارئ','%s placeholder'%lang)
        ck(not re.search('[\u0621-\u064A]',q.inner_text('.rdo-hero').replace('استمع','')) or lang in('fa','ur'),'%s hero arabic'%lang)
        foot=q.inner_text('.rdo-src');ck('Altaqwaa' in foot and ('mp3quran' in foot),'%s footer'%lang)
        ck(not re.search('[كيةى]',foot) or False,'%s footer untranslated'%lang)
        ck(not e2,'%s js errors'%lang)
    b.close()
print('FAIL',F) if F else print('PASS reciters: tile, 158 rows, riwaya filter, search, open, 114 suras, play/pause/auto-next/stop, back, 6 languages')
sys.exit(1 if F else 0)
