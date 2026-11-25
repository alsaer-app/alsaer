function verseText(c,v){
  var t=QD().s[c-1][v-1];
  if(v===1&&c!==1&&c!==9){ // مصدر النص يُلحق البسملة بأول آية؛ تُعرض مرة واحدة في ترويسة السورة
    var w=t.split(' '),n=w.slice(0,4).join(' ').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/\u0671/g,'\u0627');
    if(n==='\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645'&&w.length>4)return w.slice(4).join(' ');
  }
  return t;
}

var TJL=[['غنّة · إخفاء · إقلاب',0],['حرف لا يُنطق · إدغام',1],['مد لازم ٦',2],['مد واجب · جائز',3],['مد طبيعي · عارض',4],['قلقلة',5]];
/* السور المدنية (تصنيف ثابت معروف) — الباقي مكية */
var MEDINAN=[2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110];
function suraMeta(c){var n=QD().s[c-1].length;return (MEDINAN.indexOf(c)>=0?'مدنية':'مكية')+' · '+ar(n)+' '+(n<3?'آية':n<11?'آيات':'آية')}
/* قارئ حفص الجديد على نمط التقوى (إعادة تنفيذ من الأرقام): سورة واحدة في الشاشة، نص متدفق بتمرير رأسي، بلا صفحات */
function vHafsFlow(){
  var D=QD(),c=rd.sura,vs=D.s[c-1];
  var fs=Math.max(18,Math.min(40,S.quran.fs||26));
  S.quran.last=rd.page=mpVerPage(c,+(String(rd.cv||c+':1').split(':')[1]||1));
  var bm=S.quran.bm2,onBm=bm&&bm.c===c;
  var _oth=(typeof uiMode==='function'&&uiMode()==='dark')?'light':'dark';
  var body=(c!==1&&c!==9?'<div class="mq-bs">'+esc(D.s[0][0])+'</div>':'');
  for(var v=1;v<=vs.length;v++){
    body+='<span class="mq-v" data-v="'+c+':'+v+'">'+esc(verseText(c,v))+' <span class="mq-m aym"><span class="ayo">\u06DD<b>'+ar(v)+'</b></span></span> </span>';
  }
  var top='<div class="mq-top"><div class="mq-t1">'
    +'<button class="ib" data-a="goback" data-v="home" aria-label="رجوع">'+ic('chev')+'</button>'
    +'<div class="mq-ti"><b>سورة '+esc(D.n[c-1])+'</b> <small>'+suraMeta(c)+'</small></div>'
    +'</div><div class="mq-ta">'
    +'<button class="ib" data-a="tab" data-v="cards" aria-label="بطاقات">'+ic('doc')+'</button>'
    +'<button class="ib" data-a="qtafsir" aria-label="تفسير الآية الحالية">'+ic('book')+'</button>'
    +'<button class="ib" data-a="qfs" data-v="-2" aria-label="تصغير الخط"'+(fs<=18?' disabled':'')+'>'+ic('minus')+'</button>'
    +'<b class="mq-fsz">'+ar(fs)+'</b>'
    +'<button class="ib" data-a="qfs" data-v="2" aria-label="تكبير الخط"'+(fs>=40?' disabled':'')+'>'+ic('plus')+'</button>'
    +'<button class="ib mq-bm'+(onBm?' on':'')+'" data-a="qbm2" aria-label="العلامة المرجعية" aria-pressed="'+!!onBm+'">'+(onBm?'★':'☆')+'</button>'
    +'<button class="ib rd-th" data-a="umode" data-v="'+_oth+'" aria-label="تبديل المظهر">'+(_oth==='light'?ic('sun'):ic('moon'))+'</button>'
    +'<button class="ib" data-a="qjump" aria-label="القائمة">'+ic('menu')+'</button>'
    +'</div>'
    +'<div class="mq-t2"><button class="ib" data-a="qsurnav" data-v="-1"'+(c<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'<small>'+(c>1?esc(D.n[c-2]):'')+'</small></button>'
    +'<button class="ib" data-a="qsurnav" data-v="1"'+(c>=114?' disabled':'')+'><small>'+(c<114?esc(D.n[c]):'')+'</small>'+ic('chev')+'</button></div></div>';
  var bot='<div class="mq-bot"><span class="mq-pos" id="mq-pos">'+esc(D.n[c-1])+'</span>'
    +'<button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button></div>';
  return '<div class="mq-ov" id="mq-ov">'+top+'<div class="mq-sc" id="mq-sc"><div class="mq-t" lang="ar" dir="rtl" style="font-size:'+fs+'px">'
    +'<h1 class="mq-h">سورة '+esc(D.n[c-1])+'</h1>'+body+'</div></div>'+bot+'</div>'
    +(rd.jump?mpDrawerHtml(rd.page):'')+mpSearchPanel()+mpIndexPanel();
}
function vReader(){
  var MU=window.MUSHAF;
  if(rd&&isW())return vWarshReader();
  if(rd&&rd.flow)return vHafsFlow();
  if(rd&&!MU){try{loadHeavy()}catch(e){}return '<section class="card"><p class="note">جارٍ تجهيز المصحف…</p></section>'}
  if(!rd||!MU)return '<section class="card"><p class="note">لا توجد جلسة قراءة.</p><button class="btn block" data-a="goback" data-v="home">رجوع</button></section>';
  return '';
}
