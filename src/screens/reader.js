function verseText(c,v){
  if(isW()){ // نص ورش المخزَّن ينتهي برقم الآية؛ يُنزع هنا ويُرسم الرقم بعلامة ۝ كحفص. لا بسملة في أول الآية
    return String(WD().s[c-1][v-1]).replace(/\s+[\u0660-\u06690-9]+$/,'');
  }
  return hafsVerse(c,v);
}
function hafsVerse(c,v){
  var t=QD().s[c-1][v-1];
  if(v===1&&c!==1&&c!==9){ // مصدر النص يُلحق البسملة بأول آية؛ تُعرض مرة واحدة في ترويسة السورة
    var w=t.split(' '),n=w.slice(0,4).join(' ').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/\u0671/g,'\u0627');
    if(n==='\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645'&&w.length>4)return w.slice(4).join(' ');
  }
  return t;
}
/* نص الآية كما يُعرض (ورش: استبدال شكلي للخط فقط) */
function qFs(){return isW()?(S.quran.fsw||22):(S.quran.fs||26)} /* حجم ورش مستقل عن حفص؛ الافتراضي ٢٢ لأن الخط أعرض */
function verseShow(c,v){return verseText(c,v)} /* ورش يُرسم بخط ورش الرسمي (Scheherazade New) فلا حاجة لاستبدال شكلي */
/* يفتح قارئ التدفق عند صفحة الرواية الحالية */
function mqRd(from,to,page,extra){
  var P=curP(),r=P[page-1]||[1,1],o={flow:true,from:from,to:to,page:page,sura:r[0],cv:r[0]+':'+r[1],_scrollCv:r[0]+':'+r[1]};
  if(extra)for(var k in extra)o[k]=extra[k];return o;
}
/* السور المدنية (تصنيف ثابت معروف) — الباقي مكية */
var MEDINAN=[2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110];
function suraMeta(c){var n=AD().s[c-1].length;return (MEDINAN.indexOf(c)>=0?'مدنية':'مكية')+' · '+ar(n)+' '+(n<3?'آية':n<11?'آيات':'آية')}
/* قارئ حفص الجديد على نمط التقوى (إعادة تنفيذ من الأرقام): سورة واحدة في الشاشة، نص متدفق بتمرير رأسي، بلا صفحات */
function vHafsFlow(){
  var D=AD(),c=rd.sura,vs=D.s[c-1];
  var fs=Math.max(18,Math.min(40,qFs()));
  S.quran.last=rd.page=mpVerPage(c,+(String(rd.cv||c+':1').split(':')[1]||1));
  var onBm=mqBmOn(c);
  var body=(c!==1&&c!==9?'<div class="mq-bs">'+esc(isW()?D.b:D.s[0][0])+'</div>':'');
  for(var v=1;v<=vs.length;v++){
    body+='<span class="mq-v'+(rd.cv===c+':'+v?' cur':'')+'" data-v="'+c+':'+v+'">'+esc(verseShow(c,v))+' <span class="mq-m aym"><span class="ayo">\u06DD<b>'+ar(v)+'</b></span></span> </span>';
  }
  var top='<div class="mq-hd"><button class="mq-bk" data-a="goback" data-v="home" aria-label="رجوع">'+ic('chev')+'</button><b class="mq-tt">سورة '+esc(D.n[c-1])+'</b></div>'
    +'<div class="mq-top"><div class="mq-ti"><small>'+suraMeta(c)+'</small></div>'
    +'<div class="mq-ta">'
    +'<button class="mq-pill" data-a="qtafsir" aria-label="تفسير الآية الحالية">'+ic('book')+'<span>التفسير</span></button>'
    +'<button class="mq-pill" data-a="tab" data-v="cards" aria-label="تعريف السورة">'+ic('doc')+'<span>تعريف السورة</span></button>'
    +'<div class="mq-stp"><button class="mq-cb" data-a="qfs" data-v="-2" aria-label="تصغير الخط"'+(fs<=18?' disabled':'')+'>'+ic('minus')+'</button><b class="mq-fsz">'+ar(fs)+'</b><button class="mq-cb" data-a="qfs" data-v="2" aria-label="تكبير الخط"'+(fs>=40?' disabled':'')+'>'+ic('plus')+'</button></div>'
    +'<button class="mq-cb mq-bm'+(onBm?' on':'')+'" data-a="qbm2" aria-label="العلامة المرجعية" aria-pressed="'+!!onBm+'">'+(onBm?'★':'☆')+'</button>'
    +'<button class="mq-cb" data-a="qsrch" aria-label="بحث في الآيات">'+ic('search')+'</button>'
    +'<button class="mq-pill" data-a="qjump" aria-label="القائمة">'+ic('menu')+'<span>قائمة</span></button>'
    +'</div>'
    +'<div class="mq-t2"><button class="mq-nav" data-a="qsurnav" data-v="-1"'+(c<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'<small>'+(c>1?esc(D.n[c-2]):'')+'</small></button>'
    +'<button class="mq-nav" data-a="qsurnav" data-v="1"'+(c>=114?' disabled':'')+'><small>'+(c<114?esc(D.n[c]):'')+'</small>'+ic('chev')+'</button></div></div>';
  var bot='<div class="mq-bot"><span class="mq-pos" id="mq-pos">'+esc(D.n[c-1])+'</span>'
    +'<button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button></div>';
  return '<div class="mq-ov" id="mq-ov">'+top+'<div class="mq-sc" id="mq-sc"><div class="mq-sn" aria-hidden="true">سورة '+esc(D.n[c-1])+'</div><div class="mq-t" lang="ar" dir="rtl" style="font-size:'+fs+'px">'
    +body+'</div></div>'+bot+'</div>'
    +(rd.jump?mpDrawerHtml(rd.page):'')+mpSearchPanel()+mpIndexPanel()+mqTafsirHtml();
}
function vReader(){
  if(!rd)return '<section class="card"><p class="note">لا توجد جلسة قراءة.</p><button class="btn block" data-a="goback" data-v="home">رجوع</button></section>';
  if(S.quran.riwaya==='warsh'&&!window.WDATA){try{loadHeavy()}catch(e){}return '<section class="card"><p class="note">جارٍ تجهيز رواية ورش…</p></section>'}
  if(S.quran.pgm!==false)return vPageMode();
  return vHafsFlow();
}
/* ===== عرض الصفحات (كالمصحف): صفحة واحدة بالشاشة بإطار وترويسة سورة، تقليب بالسحب أو الأزرار. النص هو نفسه نص التدفق دون أي تعديل؛ يتقلص الخط وحده إن ضاقت الصفحة ===== */
function vPageMode(){
  var D=AD(),P=curP(),q=String(rd.cv||'1:1').split(':'),pg=mpVerPage(+q[0],+q[1]||1),r=P[pg-1]||[1,1,1,7,1];
  rd.page=pg;S.quran.last=pg;rd._scrollCv=null;
  var fs=Math.max(18,Math.min(40,qFs())),body='';
  for(var c=r[0];c<=r[2];c++){
    var v1=(c===r[0]?r[1]:1),v2=(c===r[2]?r[3]:D.s[c-1].length);
    if(v1===1){
      body+='<div class="pg-sh"><span>سورة '+esc(D.n[c-1])+'</span></div>';
      if(c!==1&&c!==9)body+='<div class="mq-bs">'+esc(isW()?D.b:D.s[0][0])+'</div>';
    }
    for(var v=v1;v<=v2;v++)body+='<span class="mq-v'+(rd.cv===c+':'+v?' cur':'')+'" data-v="'+c+':'+v+'">'+esc(verseShow(c,v))+' <span class="mq-m aym"><span class="ayo">\u06DD<b>'+ar(v)+'</b></span></span> </span>';
  }
  var cur=+String(rd.cv).split(':')[0]||r[0],onBm=mqBmOn(cur);
  var top='<div class="mq-hd"><button class="mq-bk" data-a="goback" data-v="home" aria-label="رجوع">'+ic('chev')+'</button><b class="mq-tt">سورة '+esc(D.n[r[0]-1])+'</b></div>'
    +'<div class="mq-top"><div class="mq-ti"><small>الجزء '+ar(r[4]||1)+' · صفحة '+ar(pg)+'</small></div><div class="mq-ta">'
    +'<button class="mq-pill" data-a="qtafsir" aria-label="تفسير الآية الحالية">'+ic('book')+'<span>التفسير</span></button>'
    +'<button class="mq-pill" data-a="tab" data-v="cards" aria-label="تعريف السورة">'+ic('doc')+'<span>تعريف السورة</span></button>'
    +'<div class="mq-stp"><button class="mq-cb" data-a="qfs" data-v="-2" aria-label="تصغير الخط"'+(fs<=18?' disabled':'')+'>'+ic('minus')+'</button><b class="mq-fsz">'+ar(fs)+'</b><button class="mq-cb" data-a="qfs" data-v="2" aria-label="تكبير الخط"'+(fs>=40?' disabled':'')+'>'+ic('plus')+'</button></div>'
    +(S.quran.pgfit===false?'<button class="mq-pill pg-fitb" data-a="qfit" aria-label="ملاءمة الصفحة"><span>ملاءمة</span></button>':'')
    +'<button class="mq-cb mq-bm'+(onBm?' on':'')+'" data-a="qbm2" aria-label="العلامة المرجعية" aria-pressed="'+!!onBm+'">'+(onBm?'★':'☆')+'</button>'
    +'<button class="mq-cb" data-a="qsrch" aria-label="بحث في الآيات">'+ic('search')+'</button>'
    +'<button class="mq-pill" data-a="qjump" aria-label="القائمة">'+ic('menu')+'<span>قائمة</span></button></div></div>';
  var bot='<div class="mq-bot pg-bot"><button class="mq-cb" data-a="qpg" data-v="-1" aria-label="الصفحة السابقة"'+(pg<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'</button>'
    +'<span class="mq-pos" id="mq-pos">ص '+ar(pg)+' / '+ar(604)+'</span>'
    +'<button class="mq-cb" data-a="qpg" data-v="1" aria-label="الصفحة التالية"'+(pg>=604?' disabled':'')+'>'+ic('chev')+'</button>'
    +'<button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button></div>';
  return '<div class="mq-ov pg-ov" id="mq-ov">'+top+'<div class="mq-sc pg-sc" id="mq-sc">'+(wiOn()?wiBody(pg):'<div class="pg-fr" id="pg-fr"><div class="mq-t pg-t" id="pg-t" lang="ar" dir="rtl" data-fs="'+fs+'" style="font-size:'+fs+'px">'+body+'</div></div>')+'</div>'+bot+'</div>'
    +(rd.jump?mpDrawerHtml(rd.page):'')+mpSearchPanel()+mpIndexPanel()+mqTafsirHtml();
}
function pgFit(){
  var t=document.getElementById('pg-t'),f=document.getElementById('pg-fr'),sc=document.getElementById('mq-sc');if(!t||!f||!sc)return;
  var cap=+t.getAttribute('data-fs')||26,avail=sc.clientHeight-16;if(avail<100)return;
  f.style.height=avail+'px';
  var inner=function(){return t.scrollHeight<=f.clientHeight-4};
  t.style.fontSize=cap+'px';
  if(S.quran.pgfit===false){f.style.overflowY='auto';return}
  f.style.overflowY='hidden';
  if(inner())return;
  var lo=12,hi=cap;for(var i=0;i<9;i++){var m=(lo+hi)/2;t.style.fontSize=m+'px';if(inner())lo=m;else hi=m}
  t.style.fontSize=lo+'px';
}
function pgGo(d){
  if(!rd||!rd.flow)return;var np=Math.max(1,Math.min(604,(rd.page||1)+d));if(np===rd.page)return;
  var r=curP()[np-1];if(!r)return;mpSel='';rd.dir=d;rd.sura=r[0];rd.cv=r[0]+':'+r[1];rd.page=np;
  try{mqAuStop()}catch(e){}
  render();window.scrollTo(0,0);
}
(function(){
  var t0=null;
  new MutationObserver(function(){if(document.getElementById('pg-t'))pgFit()}).observe(document.getElementById('app'),{childList:true,subtree:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){try{pgFit()}catch(e){}});
  window.addEventListener('resize',function(){try{pgFit()}catch(e){}});
  document.addEventListener('touchstart',function(e){t0=null;if(tab!=='reader'||!rd||!e.touches||e.touches.length!==1)return;if(!(e.target.closest&&e.target.closest('#pg-fr')))return;t0={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}},{passive:true});
  document.addEventListener('touchend',function(e){
    if(!t0)return;var s=t0;t0=null;var c=e.changedTouches&&e.changedTouches[0];if(!c)return;
    var dx=c.clientX-s.x,dy=c.clientY-s.y;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6&&Date.now()-s.t<700)pgGo(dx<0?1:-1);
  },{passive:true});
})();
