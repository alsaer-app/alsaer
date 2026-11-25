/* ---------- المصحف: انتقال سريع · تقليب بالسحب · متابعة من حيث توقفت ---------- */
function mpJuzPage(j){var MU=window.MUSHAF;if(!MU)return 1;for(var i=0;i<MU.m.length;i++)if(MU.m[i][0]===j)return i+1;return 1}
function mpJump(p){
  var D=QD(),h='<section class="card mpj"><h3>انتقال سريع</h3><div class="mpj-r"><label>الصفحة<input id="mpj-p" class="qd-i" type="number" inputmode="numeric" min="1" max="604" placeholder="'+ar(p)+'"></label><button class="btn" data-a="qjgo" data-v="p">اذهب</button></div>'
   +'<div class="mpj-r"><label>السورة<select id="mpj-s" class="qd-i">'+D.n.map(function(n,i){return '<option value="'+(i+1)+'">'+ar(i+1)+' · '+esc(n)+'</option>'}).join('')+'</select></label><button class="btn" data-a="qjgo" data-v="s">اذهب</button></div>'
   +'<div class="mpj-r"><label>الجزء<select id="mpj-j" class="qd-i">'+Array.apply(null,Array(30)).map(function(_,i){return '<option value="'+(i+1)+'">الجزء '+ar(i+1)+'</option>'}).join('')+'</select></label><button class="btn" data-a="qjgo" data-v="j">اذهب</button></div>'
   +'<div class="mpj-r"><label>الحزب والربع<select id="mpj-q" class="qd-i">'+Array.apply(null,Array(240)).map(function(_,i){var h=Math.floor(i/4)+1,q=i%4;return '<option value="'+i+'">الحزب '+ar(h)+(q?' · '+['','الربع الأول','النصف','ثلاثة أرباع'][q]:'')+'</option>'}).join('')+'</select></label><button class="btn" data-a="qjgo" data-v="q">اذهب</button></div>'
   +mpMarksHtml()
   +(S.quran.last?'<div class="acts"><button class="btn ghost" data-a="qjgo" data-v="l">↩ آخر صفحة قرأتها ('+ar(S.quran.last)+')</button></div>':'')+'</section>';
  return h;
}
/* قائمة المصحف الجانبية: بحث + انتقال سريع + الورد اليومي + أقسام المصحف + العلامات */
function mpDrawerHtml(p){
  var D=QD(),q=S.quran,k=dk(),pg=qPages(k),goal=q.goal,done=pg>=goal,mt=rd.mt||'p';
  var tabs='<div class="rd-mt">'+[['p','صفحة'],['s','سورة'],['j','جزء'],['q','حزب']].map(function(x){return '<button type="button" class="'+(mt===x[0]?'on':'')+'" data-a="qmt" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
  var ctl='';
  if(mt==='p')ctl='<div class="mpj-r"><label>الصفحة<input id="mpj-p" class="qd-i" type="number" inputmode="numeric" min="1" max="604" placeholder="'+ar(p)+'"></label><button class="btn" data-a="qjgo" data-v="p">اذهب</button></div>';
  else if(mt==='s')ctl='<div class="mpj-r"><label>السورة<select id="mpj-s" class="qd-i">'+D.n.map(function(n,i){return '<option value="'+(i+1)+'">'+ar(i+1)+' \u00b7 '+esc(n)+'</option>'}).join('')+'</select></label><button class="btn" data-a="qjgo" data-v="s">اذهب</button></div>';
  else if(mt==='j')ctl='<div class="mpj-r"><label>الجزء<select id="mpj-j" class="qd-i">'+Array.apply(null,Array(30)).map(function(_,i){return '<option value="'+(i+1)+'">الجزء '+ar(i+1)+'</option>'}).join('')+'</select></label><button class="btn" data-a="qjgo" data-v="j">اذهب</button></div>';
  else ctl='<div class="mpj-r"><label>الحزب والربع<select id="mpj-q" class="qd-i">'+Array.apply(null,Array(240)).map(function(_,i){var h=Math.floor(i/4)+1,qq=i%4;return '<option value="'+i+'">الحزب '+ar(h)+(qq?' \u00b7 '+['','الربع الأول','النصف','ثلاثة أرباع'][qq]:'')+'</option>'}).join('')+'</select></label><button class="btn" data-a="qjgo" data-v="q">اذهب</button></div>';
  var res='';
  if(rd.mq){var R=rd.mr||[];
    res=!R.length?'<p class="note">لا نتائج. جرّب كلمة أقصر أو بدون تشكيل.</p>':'<div class="rd-sr rd-mr">'+R.map(function(x){
      if(x.sura)return '<button class="rd-ri" data-a="qsgo" data-v="'+x.pg+'"><b>سورة '+esc(D.n[x.sura-1])+'</b><small>ص '+ar(x.pg)+'</small></button>';
      var t=verseText(x.c,x.v);if(t.length>130)t=t.slice(0,130)+'…';
      return '<button class="rd-ri" data-a="qsgo" data-v="'+x.pg+'"><span class="rd-rt">'+esc(t)+'</span><small>'+esc(D.n[x.c-1])+' · آية '+ar(x.v)+' · ص '+ar(x.pg)+'</small></button>'}).join('')+'</div>'}
  var ward='<section class="card rd-mwc"><h3>وردك اليومي</h3><div class="bar"><div style="width:'+Math.min(100,Math.round(pg/goal*100))+'%"></div></div><p class="note" style="text-align:center;margin:8px 0">'+(done?'أتممت وردك اليوم، بارك الله فيك ('+ar(pg)+' صفحة).':'قرأت اليوم '+ar(pg)+' من '+ar(goal)+' '+(goal<11?'صفحات':'صفحة')+'.')+'</p><button class="btn block" data-a="qstart">'+ic('book')+(done?'اقرأ المزيد':'ابدأ الورد')+'</button><div class="row" style="justify-content:center;margin-top:8px"><button class="btn ghost" data-a="qgoal" data-v="-1">'+ic('minus')+'الورد</button><button class="btn ghost" data-a="qgoal" data-v="1">'+ic('plus')+'الورد</button></div></section>';
  var grid='<div class="rd-mg">'
    +'<button type="button" data-a="qidx">'+ic('doc')+'<small>فهرس السور</small></button>'
    +'<button type="button" data-a="qriw" data-v="'+(isW()?'hafs':'warsh')+'">'+ic('book')+'<small>الرواية: '+(isW()?'ورش':'حفص')+'</small></button>'
    +'<button type="button" class="'+(q.tj!==false?'on':'')+'" data-a="qtj">'+ic('sparkles')+'<small>التجويد: '+(q.tj!==false?'تشغيل':'إيقاف')+'</small></button>'
    +'<button type="button" class="'+(bmHas(p)?'on':'')+'" data-a="bmtog">'+(bmHas(p)?'★':'☆')+'<small>علامة الصفحة</small></button></div>';
  var last=q.last?'<button class="lrow" data-a="qjgo" data-v="l">'+ic('book')+'<span class="t">تابع من حيث توقفت<small class="muted">صفحة '+ar(q.last)+' · سورة '+esc(pageSura(q.last))+'</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>':'';
  return '<div class="rd-menb" data-a="qjump" aria-hidden="true"></div><aside class="rd-menu" role="dialog" aria-modal="true" aria-label="قائمة المصحف">'
    +'<div class="rd-mh"><b>المصحف</b><button class="rd-mx" data-a="qjump" aria-label="إغلاق">'+ic('x')+'</button></div>'
    +'<button class="lrow" data-a="qwird">'+ic('flag')+'<span class="t">الورد والرواية<small class="muted">وردك اليومي، الرواية، وتقدّم الختمة</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'
    +'<div class="rd-mq"><input id="mq-q" class="qd-i" type="search" enterkeyhint="search" autocomplete="off" placeholder="كلمة من آية، أو ٢:٢٥٥، أو اسم سورة" value="'+esc(rd.mq||'')+'"><button class="btn" data-a="qms">بحث</button></div>'
    +res+tabs+'<div class="rd-mtb">'+ctl+'</div>'
    +'<section class="card rd-tajweed-key"><h3>ألوان التجويد</h3><div class="tjl">'+TJL.map(function(x){return '<span><i class="t'+x[1]+'"></i>'+x[0]+'</span>'}).join('')+'</div></section>'+ward+grid+mpMarksHtml()+last
    +'<button class="btn block" data-a="qjump" style="margin-top:10px">تم</button></aside>';
}
function mpAct(a,v){
  if(!rd)return true;
  if(a==='qjump'){rd.jump=!rd.jump;if(!rd.jump){rd.mq='';rd.mr=null}return false}
  if(a==='qmt'){rd.mt=v;return false}
  if(a==='qjgo'){
    var t=0,g=function(i){return parseInt((document.getElementById(i)||{}).value,10)};
    if(v==='p')t=g('mpj-p');else if(v==='s')t=suraPage(g('mpj-s'));else if(v==='j')t=mpJuzPage(g('mpj-j'));else if(v==='q'){var qi=g('mpj-q');t=(typeof RUBP!=='undefined'&&RUBP[qi])||1}else if(v==='l')t=S.quran.last;
    if(!(t>=1&&t<=604)){toast('اكتب رقم صفحة بين ١ و٦٠٤');return true}
    mpSel='';rd.dir=t>rd.page?1:-1;rd.page=t;rd.jump=false;window.scrollTo(0,0);return false;
  }
  return false;
}
/* السحب: يمينًا = الصفحة السابقة، يسارًا = التالية (كالمصحف الورقي العربي) */
/* حارس النقرة الشبح: بعد ضغطة مطوّلة أو قلبة سحب يولّد المتصفح نقرة عند موضع رفع الإصبع
   قد تصيب زرًا ظهر تحت الإصبع. الابتلاع مرة واحدة فقط، خلال 400ms، وعلى بعد 60px من موضع
   الإصبع — أي نقرة حقيقية أبعد أو لاحقة تمر فورًا (كان 700ms تبتلع كل النقرات). */
var mpSwAt=0,mpSwX=0,mpSwY=0;
function mpSwallow(x,y){mpSwAt=Date.now();mpSwX=x;mpSwY=y}
document.addEventListener('click',function(e){
  if(!mpSwAt)return;
  if(Date.now()-mpSwAt>400){mpSwAt=0;return}
  var dx=e.clientX-mpSwX,dy=e.clientY-mpSwY;
  if(dx*dx+dy*dy>3600)return; /* نقرة بعيدة عن موضع الإصبع = نقرة مقصودة جديدة */
  mpSwAt=0;e.stopPropagation();e.preventDefault();
},true);

/* ---------- ملء الشاشة + البحث عن آية ---------- */
var MP_SV='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>',mpHint=false,mpIdx=null;
function mpImm(){return S.quran.imm!==false&&!!window.MUSHAF}
var mpFontWarmed=false;
function mpWrap(main,ctl,p,m){
  if(!mpFontWarmed&&document.fonts&&document.fonts.load){mpFontWarmed=true;try{document.fonts.load('64px KFGQPC','بسم الله').catch(function(){})}catch(e){}}
  /* Legacy non-fullscreen preference keeps its layout but shares one tools menu. */
  rd.ui=true;
  if(!mpImm()){
    var nav=ctl.replace(/<div class="fsz">[\s\S]*?<\/div>/g,'').replace(/<section class="card mpj">[\s\S]*?<\/section>/g,'');
    return '<div class="rd-fallback-tools"><button class="ib" data-a="goback" data-v="home" aria-label="رجوع">'+ic('chev')+'</button><b>سورة '+esc(QD().n[m[2]-1])+' · ص '+ar(p)+'</b><button class="ib" data-a="qjump" aria-label="قائمة المصحف">'+ic('menu')+'<small>القائمة</small></button></div>'+main+nav+(rd.jump?mpDrawerHtml(p):'')+mpSearchPanel()+mpIndexPanel();
  }
  if(!mpHint&&!S.quran.hint1){mpHint=true;S.quran.hint1=1;save();setTimeout(function(){toast('اضغط مطوّلًا على آية لخياراتها (تفسير · نسخ · علامة)؛ البحث والفهرس والخيارات داخل القائمة')},500)}
  var CH=ic('chev'),CHL=CH.replace('class="i"','class="i" style="transform:scaleX(-1)"');
  var D=QD(),mu=isW()?[(WD().p[p-1]||[])[4]||1,0,(WD().p[p-1]||[1])[0]]:window.MUSHAF.m[p-1],inR=(p>=rd.from&&p<=rd.to),bm=bmHas(p),n=p-rd.from+1;
  var mid=inR?'<span class="rd-pn"><b>'+ar(n)+' / '+ar(rd.to-rd.from+1)+'</b><small>من وردك</small></span>':'<span class="rd-pn"><b>ص '+ar(p)+'</b><small>تصفّح حر</small></span>';
  var _fs=(S.quran&&S.quran.fs)||26,_oth=(typeof uiMode==='function'&&uiMode()==='dark')?'light':'dark';
  return main+'<div class="rd-ov on" id="rd-ov"><div class="rd-t"><div class="rd-t1"><button class="ib" data-a="goback" data-v="home" aria-label="رجوع">'+ic('chev')+'</button>'
   +'<div class="rd-ti"><b>سورة '+esc(D.n[mu[2]-1])+'</b><small>الجزء '+ar(mu[0])+' · الحزب '+ar(mu[1])+' · صفحة '+ar(p)+'</small></div>'
   +'<span class="rd-ta"><button class="ib" data-a="qjump" aria-label="قائمة المصحف">'+ic('menu')+'<small>القائمة</small></button></span></div>'
   +'<div class="rd-t2"><button class="ib rd-th" data-a="umode" data-v="'+_oth+'" aria-label="تبديل المظهر">'+(_oth==='light'?ic('sun'):ic('moon'))+'</button>'
   +'<div class="rd-fs"><button class="ib" data-a="mpfs" data-v="-2" aria-label="تصغير الخط"><span class="ar" style="font-size:13px">ا</span>−</button><b>'+ar(_fs)+'</b><button class="ib" data-a="mpfs" data-v="2" aria-label="تكبير الخط"><span class="ar" style="font-size:17px">ا</span>+</button></div></div></div>'
   +'<div class="rd-b"><div class="rd-sl"><small>١</small><input type="range" id="rd-rg" min="1" max="604" value="'+p+'" aria-label="الانتقال بين الصفحات"><small>٦٠٤</small></div>'
   +'<div class="rd-r"><button class="ib bm" data-a="bmtog" aria-pressed="'+bm+'" aria-label="علامة">'+(bm?'★':'☆')+'</button><button class="ib" data-a="qpage" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'</button>'+mid
   +'<button class="ib" data-a="qpage" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+ic('chev')+'</button><button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button></div>'
   +'<div class="rd-sn"><button class="ib" data-a="qsurnav" data-v="-1"'+(mu[2]<=1?' disabled':'')+' aria-label="السورة السابقة">'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'<small>'+(mu[2]>1?esc(D.n[mu[2]-2]):'')+'</small></button><button class="ib" data-a="qsurnav" data-v="1"'+(mu[2]>=114?' disabled':'')+' aria-label="السورة التالية"><small>'+(mu[2]<114?esc(D.n[mu[2]]):'')+'</small>'+ic('chev')+'</button></div></div></div>'
   +(rd.jump?mpDrawerHtml(p):'')+mpSearchPanel()+mpIndexPanel();
}
function mpNorm(t){return String(t||'').replace(/[ً-ٰٟۖ-ۭـ-]/g,'').replace(/[آأإٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[ک]/g,'ك').replace(/[ی]/g,'ي').replace(/\s+/g,' ').trim()}
function mpVerPage(c,v){var P=curP();for(var i=0;i<P.length;i++){var r=P[i];if((c>r[0]||(c===r[0]&&v>=r[1]))&&(c<r[2]||(c===r[2]&&v<=r[3])))return i+1}return 1}
function mpBuild(){if(mpIdx)return mpIdx;var D=QD(),o=[];D.s.forEach(function(vs,ci){vs.forEach(function(t,vi){o.push({c:ci+1,v:vi+1,n:mpNorm(t)})})});return mpIdx=o}
function mpFind(q){
  var D=QD(),out=[],nq=mpNorm(q.replace(/[٠-٩]/g,function(d){return d.charCodeAt(0)-1632}));if(!nq)return out;
  var m=/^(\d{1,3})\s*[:\/\-\s]\s*(\d{1,3})$/.exec(nq);
  if(m){var c=+m[1],v=+m[2];if(c>=1&&c<=114&&v>=1&&v<=D.s[c-1].length)return [{c:c,v:v,pg:mpVerPage(c,v)}]}
  D.n.forEach(function(n,i){if(mpNorm(n).indexOf(nq)>=0)out.push({sura:i+1,pg:suraPage(i+1)})});
  var ws=nq.split(' '),idx=mpBuild(),k=0;
  for(var i=0;i<idx.length&&k<60;i++){var e=idx[i],ok=true;for(var j=0;j<ws.length;j++)if(e.n.indexOf(ws[j])<0){ok=false;break}if(ok){out.push({c:e.c,v:e.v,pg:mpVerPage(e.c,e.v)});k++}}
  return out;
}
function mpSearchPanel(){
  if(!rd||!rd.srch)return '';
  var D=QD(),R=rd.sr||[],h='<div class="rd-sp"><div class="rd-sh"><button class="ib" data-a="qsclose" aria-label="إغلاق">✕</button><input id="mps-q" class="qd-i" type="search" enterkeyhint="search" autocomplete="off" placeholder="كلمة من الآية، أو رقم مثل ٢:٢٥٥" value="'+esc(rd.sq||'')+'"><button class="btn" data-a="qsdo">بحث</button></div><div class="rd-sr">';
  if(rd.sq&&!R.length)h+='<p class="note">لا نتائج. جرّب كلمة أقصر أو بدون تشكيل.</p>';
  else if(!rd.sq)h+='<p class="note">اكتب كلمة أو أكثر من الآية فتظهر الآيات المطابقة، أو رقم السورة والآية مثل ٢:٢٥٥، أو اسم السورة.</p>';
  R.forEach(function(x){
    if(x.sura)h+='<button class="rd-ri" data-a="qsgo" data-v="'+x.pg+'"><b>سورة '+esc(D.n[x.sura-1])+'</b><small>ص '+ar(x.pg)+'</small></button>';
    else{var t=verseText(x.c,x.v);if(t.length>130)t=t.slice(0,130)+'…';h+='<button class="rd-ri" data-a="qsgo" data-v="'+x.pg+'"><span class="rd-rt">'+esc(t)+'</span><small>'+esc(D.n[x.c-1])+' · آية '+ar(x.v)+' · ص '+ar(x.pg)+'</small></button>'}
  });
  return h+'</div></div>';
}
function mpAct2(a,v){
  if(!rd)return true;
  if(a==='qsrch'){rd.srch=true;return false}
  if(a==='qms'){rd.mq=((document.getElementById('mq-q')||{}).value||'').trim();rd.mr=rd.mq?mpFind(rd.mq):[];return false}
  if(a==='qsclose'){rd.srch=false;return false}
  if(a==='qsdo'){rd.sq=((document.getElementById('mps-q')||{}).value||'').trim();rd.sr=rd.sq?mpFind(rd.sq):[];return false}
  if(a==='qsgo'){var t=parseInt(v,10);mpSel='';if(t>=1&&t<=604){rd.dir=t>rd.page?1:-1;rd.page=t}rd.srch=false;rd.jump=false;rd.mq='';rd.mr=null;rd.ui=false;window.scrollTo(0,0);return false}
  if(a==='qimm'){if(rd)rd.ui=true;return false} /* Retired action cannot hide tools. */
  return false;
}
document.addEventListener('click',function(e){
  if(tab!=='reader'||!rd||!mpImm())return;var t=e.target;
  if(mpSel&&t.closest&&t.closest('#mp')&&!t.closest('[data-a],[data-mp2]')){mpSel='';mpApplySel();return}
  if(t.closest&&t.closest('#mp')&&!(t.closest('[data-a]'))){var o=document.getElementById('rd-ov');if(o){rd.ui=true;o.classList.add('on')}}
});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&(e.target.id==='mps-q'||e.target.id==='mq-q')){var qid=e.target.id;e.preventDefault();if(!mpAct2(qid==='mq-q'?'qms':'qsdo')){render();setTimeout(function(){var i=document.getElementById(qid);if(i)i.blur()},50)}}});

/* شريط الصفحات: رقم الصفحة يتبع الإصبع أثناء السحب وتنتقل الصفحة فور التوقف، بدل انتظار الإفلات */
var rdRgT=0;
function rdRgGo(n){if(!rd)return;n=parseInt(n,10);if(n>=1&&n<=604&&n!==rd.page){rd.dir=n>rd.page?1:-1;rd.page=n;rd.ui=true;render()}}
document.addEventListener('input',function(e){
  var t=e.target;if(!t||t.id!=='rd-rg'||!rd)return;
  var n=parseInt(t.value,10);if(!(n>=1&&n<=604))return;
  var pn=document.querySelector('#rd-ov .rd-pn b');if(pn)pn.textContent='ص '+ar(n);
  clearTimeout(rdRgT);rdRgT=setTimeout(function(){rdRgGo(n)},140);
});
document.addEventListener('change',function(e){var t=e.target;if(!t||t.id!=='rd-rg'||!rd)return;clearTimeout(rdRgT);rdRgGo(t.value)});

/* ---------- تظليل الآية بتوهج يتبع الإصبع + علامات الحفظ ---------- */
var mpSt={c:1,v:1},mpSel='',mpHlLast='';
function mpInit(p){var r=QD().p[p-1];mpSt.c=r?r[0]:1;mpSt.v=r?r[1]:1}
function mpVAttr(t){
  var a=' data-v="'+mpSt.c+':'+mpSt.v+'"';
  if(t.charCodeAt(0)===0xE0F0){mpSt.v++;var D=QD();if(D.s[mpSt.c-1]&&mpSt.v>D.s[mpSt.c-1].length){mpSt.c++;mpSt.v=1}}
  return a;
}
function mpVm(){if(!S.quran.vm||typeof S.quran.vm!=='object')S.quran.vm={};return S.quran.vm}
function mpHl(v){
  mpHlLast=v;var L=document.querySelectorAll('#mp .mw.vhl');for(var i=0;i<L.length;i++)L[i].classList.remove('vhl','vhl-ls','vhl-le');
  if(!v)return;var W=document.querySelectorAll('#mp .mw[data-v="'+v+'"]');for(var j=0;j<W.length;j++)W[j].classList.add('vhl');
  /* شريط متصل لكل سطر: الحواف الدائرية عند أول كلمة وآخر كلمة في السطر فقط */
  var lines={};for(j=0;j<W.length;j++){var k=String(Math.round(W[j].offsetTop/4));if(!lines[k])lines[k]=[W[j],W[j]];else lines[k][1]=W[j]}
  for(var y in lines){lines[y][0].classList.add('vhl-ls');lines[y][1].classList.add('vhl-le')}
}
function mpVName(v){var q=String(v).split(':');return 'سورة '+QD().n[(+q[0])-1]+' · آية '+ar(+q[1])}
var mpTf={k:'',t:''},mpMk={k:'',t:''};
function mpApplySel(){
  var bar=document.getElementById('mp-vb');
  if(tab!=='reader'||!rd||!document.getElementById('mp')){if(bar)mpDismissBar(bar);mpSel='';return}
  var vm=mpVm(),W=document.querySelectorAll('#mp .mw[data-v]');
  for(var i=0;i<W.length;i++)W[i].classList.toggle('vmk',!!vm[W[i].getAttribute('data-v')]);
  mpHl(mpSel);
  if(mpImg.k&&mpImg.k!==mpSel)mpImgClear();
  if(!mpSel){if(bar)mpDismissBar(bar);return}
  if(!bar){bar=document.createElement('div');bar.id='mp-vb';bar.className='mp-vb';document.body.appendChild(bar)}else if(bar._closing){bar._closing=0;bar.classList.remove('mp-closing')}
  var mk=!!vm[mpSel];
  bar.innerHTML='<i class="mp-grip" aria-hidden="true"></i><div class="mp-vbh"><b>'+esc(mpVName(mpSel))+'</b><button data-mp2="x" class="mp-vx" aria-label="إغلاق">✕</button></div>'+((mpTf.k===mpSel&&mpTf.t)?'<div class="mp-tf" dir="rtl">'+esc(mpTf.t)+'</div>':'')+((mpMk.k===mpSel&&mpMk.t)?'<div class="mp-tf" dir="rtl">'+esc(mpMk.t)+'</div><div class="mp-src"><span>المختصر في التفسير · مركز تفسير للدراسات القرآنية</span><button data-mp2="mkre">تحديث</button></div>':'')+((mpImg.k===mpSel&&mpImg.loading)?'<div class="mp-tf">جارٍ تجهيز الصورة…</div>':'')+((mpImg.k===mpSel&&mpImg.url)?'<img class="mp-shi" src="'+mpImg.url+'" alt="بطاقة الآية"><span class="mp-shb"><button data-mp2="imgsh">مشاركة الصورة</button><button data-mp2="imgdl">حفظ</button></span>':'')+'<div class="mp-vbb"><div class="mp-br"><button data-mp2="tf" class="'+(mpTf.k===mpSel?'on':'')+'">تفسير</button><button data-mp2="mk" class="'+(mpMk.k===mpSel?'on':'')+'">مختصر</button><button data-mp2="img" class="'+(mpImg.k===mpSel?'on':'')+'">صورة</button></div><div class="mp-br"><button data-mp2="copy">نسخ</button><button data-mp2="mark" class="'+(mk?'on':'')+'">'+(mk?'★ علامة':'☆ علامة حفظ')+'</button><button data-mp2="share">مشاركة</button></div></div>';
  mpPlaceBar(bar);
  var im=bar.querySelector('img.mp-shi');if(im)im.addEventListener('load',function(){mpPlaceBar(bar)},{once:true});
}
/* إغلاق متحرك: يزيل الشريط بعد انتهاء حركة الخروج */
function mpDismissBar(bar){
  if(!bar||bar._closing)return;bar._closing=1;
  bar.classList.add('mp-closing');
  setTimeout(function(){if(bar._closing)bar.remove()},175);
}
/* يثبّت الشريط فوق الآية المحددة أو تحتها (أيهما أوسع) ولا يغطيها؛ وإن طال بمحتوى مفتوح يقلّص مساحة النص/الصورة داخله لتتّسع */
function mpPlaceBar(bar){
  bar.style.top='';bar.style.bottom='';
  var ws=document.querySelectorAll('#mp .mw.vhl');if(!ws||!ws.length)return;
  var top=1e9,bot=-1e9;
  for(var i=0;i<ws.length;i++){var r=ws[i].getBoundingClientRect();if(!(r.height>0))continue;if(r.top<top)top=r.top;if(r.bottom>bot)bot=r.bottom}
  if(top>1e8)return;
  var vh=window.innerHeight,gap=8,hd=56;
  var spaceAbove=(top-gap)-hd, spaceBelow=(vh-10)-(bot+gap);
  var useAbove=spaceAbove>=bar.offsetHeight||(spaceBelow<bar.offsetHeight&&spaceAbove>=spaceBelow);
  var space=useAbove?spaceAbove:spaceBelow;
  if(bar.offsetHeight>space){
    var flex=bar.querySelector('.mp-tf,img.mp-shi');
    if(flex){var over=bar.offsetHeight-space,cur=flex.getBoundingClientRect().height;
      flex.style.maxHeight=Math.max(80,cur-over)+'px'}
  }
  var h=bar.offsetHeight;
  if(useAbove){bar.style.top=Math.max(hd,top-gap-h)+'px';bar.style.bottom='auto'}
  else{bar.style.top=Math.max(hd,Math.min(bot+gap,vh-10-h))+'px';bar.style.bottom='auto'}
}
window.addEventListener('resize',function(){var b=document.getElementById('mp-vb');if(b&&mpSel)mpPlaceBar(b)});
function mpVerseText(v){var q=String(v).split(':'),t;try{if(isW()&&WD().s[+q[0]-1]&&WD().s[+q[0]-1][+q[1]-1])t=String(WD().s[+q[0]-1][+q[1]-1])}catch(e){}return '﴿'+(t||verseText(+q[0],+q[1]))+'﴾ — '+mpVName(v)}
/* ---------- مشاركة الآية كصورة: بطاقة بنفس نمط بطاقات المشاركة ---------- */
var mpImg={k:'',url:'',blob:null};
function mpImgClear(){if(mpImg.url){try{URL.revokeObjectURL(mpImg.url)}catch(e){}}mpImg={k:'',url:'',blob:null}}
function mpWrapLines(x,t,mw){var L=[];t.split('\n').forEach(function(par){var ws=par.split(' '),cur='';ws.forEach(function(w){var q=cur?cur+' '+w:w;if(x.measureText(q).width>mw&&cur){L.push(cur);cur=w}else cur=q});L.push(cur)});return L}
function mpAyahCard(k,cb){
  var q=k.split(':'),t='';try{t=verseText(+q[0],+q[1])}catch(e){}
  if(!t){cb(null);return}
  var ff=getComputedStyle(document.body).fontFamily||'sans-serif';
  var pal=(function(){var cs=function(n){try{return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}catch(e){return''}};
    var d=cs('--ac-d'),d2=cs('--ac2-d'),ag=cs('--ac-g'),hex=/^#[0-9a-f]{6}$/i;
    if(!hex.test(d)||!hex.test(d2))return{g0:'#0E2A2B',g1:'#1B4A45',hd:'#E8C873'}; /* بلا ثيم: النمط الأصلي */
    return{g0:mix(d,'#0E2A2B',.45),g1:mix(d2,'#1B4A45',.30),hd:hex.test(ag)?ag:'#E8C873'}})();
  var draw=function(fam){
    try{
      var c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d');
      var g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,pal.g0);g.addColorStop(1,pal.g1);x.fillStyle=g;x.fillRect(0,0,1080,1350);
      x.strokeStyle='#C9A24B';x.lineWidth=4;x.strokeRect(40,40,1000,1270);x.lineWidth=1.5;x.strokeRect(58,58,964,1234);
      x.direction='rtl';x.textAlign='center';
      x.fillStyle=pal.hd;x.font='bold 46px '+ff;x.fillText('السائر إلى الله',540,150);
      /* ابدأ من تقدير مبني على طول النص بدل النزول من 76: القياس 76*sqrt(254)≈68*sqrt(366)≈52*sqrt(567)≈1250 — يوفّر أغلب جولات measureText في الآيات الطويلة */
      var size=Math.max(34,Math.min(76,Math.round(1250/Math.sqrt(t.length||1)))),lines,lh;
      for(;;){x.font=size+'px '+fam;lines=mpWrapLines(x,t,880);lh=size*1.7;if(lines.length*lh<=760||size<=34)break;size-=4}
      x.fillStyle='#fff';var y0=640-lines.length*lh/2+lh*0.6;lines.slice(0,14).forEach(function(l,i){x.fillText(l,540,y0+i*lh)});
      x.fillStyle='#9FB3AE';x.font='36px '+ff;x.fillText(mpVName(k),540,1180);
      x.fillStyle='#C9A24B';x.font='30px '+ff;x.fillText('تطبيق السائر إلى الله · مجاني بالكامل',540,1250);
      cb(c)
    }catch(e){cb(null)}
  };
  if(document.fonts&&document.fonts.load){
    document.fonts.load('64px KFGQPC',t.slice(0,20)).then(function(){
      var ok=false;try{ok=document.fonts.check('64px KFGQPC')}catch(e){}
      draw(ok?'KFGQPC':ff)
    },function(){draw(ff)});
  }else draw(ff);
}

/* كاش التفسير بسقف: ٣٠٠ آية كحد أقصى، الأقدم يُمسح أولًا، حتى لا تمتلئ مساحة التخزين بصمت */
var TF_CAP=300,TF_IDX='alsaer_tf_idx',tfMig=false;
function tfIdx(){try{var a=JSON.parse(localStorage.getItem(TF_IDX)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function tfSaveIdx(a){try{localStorage.setItem(TF_IDX,JSON.stringify(a))}catch(e){}}
function tfMigrate(){if(tfMig)return;tfMig=true;try{var a=tfIdx(),add=[];for(var n=0;n<localStorage.length;n++){var k2=localStorage.key(n);if(k2&&k2.indexOf('alsaer_tf_')===0&&k2!==TF_IDX&&a.indexOf(k2)<0)add.push(k2)}if(add.length){a=add.concat(a);tfSaveIdx(a)}}catch(e){}}
function tfTouch(ck){tfMigrate();var a=tfIdx(),i=a.indexOf(ck);if(i>=0){a.splice(i,1);a.push(ck);tfSaveIdx(a)}}
function tfPut(ck,t){
  tfMigrate();var a=tfIdx(),i=a.indexOf(ck);if(i>=0)a.splice(i,1);
  try{localStorage.setItem(ck,t)}catch(e){
    /* امتلأت المساحة: امسح الأقدم حتى النصف وحاول مرة أخيرة */
    while(a.length>Math.floor(TF_CAP/2)){var o0=a.shift();try{localStorage.removeItem(o0)}catch(e2){}}
    try{localStorage.setItem(ck,t)}catch(e3){}
  }
  a.push(ck);
  while(a.length>TF_CAP){var old=a.shift();try{localStorage.removeItem(old)}catch(e4){}}
  tfSaveIdx(a);
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-mp2]');if(!b)return;e.stopPropagation();
  var k=b.getAttribute('data-mp2');
  if(k==='x'){mpSel='';mpApplySel();return}
  if(k==='img'){
    var kk3=mpSel;if(mpImg.k===kk3){mpImgClear();mpApplySel();return}
    mpImgClear();mpImg={k:kk3,loading:1};mpApplySel(); /* رد فوري: «جارٍ التجهيز» حتى تكتمل الصورة */
    mpAyahCard(kk3,function(cv){
      if(!cv){toast('تعذّر إنشاء الصورة');return}
      try{cv.toBlob(function(b){
        if(!b){toast('تعذّر إنشاء الصورة');return}
        mpImg={k:kk3,url:URL.createObjectURL(b),blob:b};
        if(mpSel===kk3)mpApplySel();
      },'image/jpeg',0.92)}catch(e){toast('تعذّر إنشاء الصورة')}
    });
    return}
  if(k==='imgsh'){var b2=mpImg.blob;if(!b2)return;try{var f=new File([b2],'alsaer-ayah.jpg',{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){});return}}catch(e){}toast('المشاركة غير متاحة هنا — اضغط مطوّلًا على الصورة لحفظها');return}
  if(k==='imgdl'){if(!mpImg.url)return;try{var an=document.createElement('a');an.href=mpImg.url;an.download='alsaer-ayah.jpg';document.body.appendChild(an);an.click();an.remove();toast('إن لم يبدأ التنزيل، اضغط مطوّلًا على الصورة لحفظها')}catch(e){toast('اضغط مطوّلًا على الصورة لحفظها')}return}
  if(k==='mk'||k==='mkre'){
    var kk2=mpSel,re=(k==='mkre');
    if(!re&&mpMk.k===kk2){mpMk={k:'',t:''};mpApplySel();return}
    var q9=kk2.split(':'),ck2='alsaer_mk_'+kk2,c1='';
    if(re){try{localStorage.removeItem(ck2)}catch(x3){}}else{try{c1=localStorage.getItem(ck2)||''}catch(x4){}if(c1)tfTouch(ck2)}
    mpTf={k:'',t:''};mpMk={k:kk2,t:c1||'جارٍ تحميل المختصر…'};mpApplySel();
    if(c1)return;
    var u1='https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-al-mukhtasar/'+q9[0]+'/'+q9[1]+'.json'
      ,u2='https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/ar-tafsir-al-mukhtasar/'+q9[0]+'/'+q9[1]+'.json';
    var got=function(j){var t=j&&j.text;if(!t)throw 0;tfPut(ck2,t);if(mpMk.k===kk2){mpMk.t=t;mpApplySel()}};
    var bad=function(){if(mpMk.k===kk2){mpMk.t='تعذّر تحميل المختصر. يحتاج إنترنتًا أول مرة لكل آية.';mpApplySel()}};
    fetch(u1).then(function(r){if(!r.ok)throw 0;return r.json()}).then(got)
     .catch(function(){fetch(u2).then(function(r){if(!r.ok)throw 0;return r.json()}).then(got).catch(bad)});
    return}
  if(k==='tf'){
    var kk=mpSel;if(mpTf.k===kk){mpTf={k:'',t:''};mpApplySel();return}
    var q8=kk.split(':'),ck='alsaer_tf_'+kk,c0='';try{c0=localStorage.getItem(ck)||''}catch(x){}if(c0)tfTouch(ck)
    mpMk={k:'',t:''};mpTf={k:kk,t:c0||'جارٍ تحميل التفسير…'};mpApplySel();
    if(!c0){
      fetch('https://api.alquran.cloud/v1/ayah/'+q8[0]+':'+q8[1]+'/ar.muyassar').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
        var t=j&&j.data&&j.data.text;if(!t)throw 0;tfPut(ck,t)
        if(mpTf.k===kk){mpTf.t=t;mpApplySel()}
      }).catch(function(){if(mpTf.k===kk){mpTf.t='تعذّر تحميل التفسير. يحتاج إنترنتًا أول مرة لكل آية.';mpApplySel()}});
    }
    return}
  if(k==='copy'){try{navigator.clipboard.writeText(mpVerseText(mpSel));toast('نُسخت الآية')}catch(x){toast('تعذّر النسخ')}return}
  if(k==='share'){var t=mpVerseText(mpSel);if(navigator.share){navigator.share({text:t}).catch(function(){})}else{try{navigator.clipboard.writeText(t);toast('نُسخت الآية للمشاركة')}catch(x){}}return}
  if(k==='mark'){var vm=mpVm();if(vm[mpSel]){delete vm[mpSel];toast('أُزيلت العلامة')}else{vm[mpSel]=Date.now();toast('وُضعت علامة حفظ')}S.quran.vm=vm;save();mpApplySel()}
},true);


function mpMarksHtml(){
  var vm=mpVm(),ks=Object.keys(vm).sort(function(a,b){return vm[b]-vm[a]}).slice(0,30);if(!ks.length)return '';
  return '<h4 style="margin:14px 0 6px">علامات الحفظ</h4><div class="mpj-m">'+ks.map(function(k){var q=k.split(':');return '<button class="chip" data-a="qsgo" data-v="'+mpVerPage(+q[0],+q[1])+'">'+esc(mpVName(k))+'</button>'}).join('')+'</div>';
}

/* ---------- لمس موحّد: الصفحة تتبع الإصبع + توهج الآية + اهتزاز خفيف ---------- */
function mpHap(){try{if(typeof hapGo==='function')hapGo([14]);else if(navigator.vibrate)navigator.vibrate(14)}catch(e){}}
(function(){
  var st=null;
  function inCtl(t){return t.closest&&t.closest('.rd-b,.rd-t,.rd-sp,.rd-js,.rd-menu,.rd-menb,.mp-vb,.mps-wrap')}
  function nextSign(dx){return dx<0?1:-1} /* السحب يسارًا = التالية، يمينًا = السابقة (كالمصحف الورقي العربي) */
  function wordAt(x,y){var el=document.elementFromPoint(x,y),w=el&&el.closest?el.closest('.mw[data-v]'):null;return (w&&w.closest('#mp'))?w:null}
  function back(el){if(!el)return;el.style.transition='transform .26s cubic-bezier(.2,.9,.3,1.25),opacity .2s';el.style.transform='translateX(0)';el.style.opacity='1';setTimeout(function(){el.style.transition='';el.style.transform='';el.style.opacity=''},300)}
  document.addEventListener('touchstart',function(e){
    st=null;if(tab!=='reader'||!rd||!window.MUSHAF||!e.touches||e.touches.length!==1||inCtl(e.target))return;
    var x=e.touches[0].clientX,y=e.touches[0].clientY,m=document.getElementById('mp');if(!m)return;
    st={x:x,y:y,t:Date.now(),lock:'',lx:x,lt:Date.now(),v:0,el:m.querySelector('.mp-in'),w:m.clientWidth||360};
    mpHl('');
    var w0=wordAt(x,y);
    if(w0){var v0=w0.getAttribute('data-v');st.lp=setTimeout(function(){
      if(!st||st.lock)return;st.fired=1;mpSel=v0;mpHl(v0);var o=document.getElementById('rd-ov');if(o&&rd){rd.ui=true;o.classList.add('on')}mpHap();mpApplySel();
    },430)}
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!st||!e.touches[0])return;var x=e.touches[0].clientX,y=e.touches[0].clientY,dx=x-st.x,dy=y-st.y,now=Date.now();
    if(now>st.lt){st.v=.6*st.v+.4*((x-st.lx)/(now-st.lt));st.lx=x;st.lt=now}
    var canSwipe=true; /* قلب الصفحات بالسحب مفعّل دائمًا في المصحف النصي */
    if(!st.lock&&!st.fired){
      if(canSwipe&&Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.15){st.lock='h'}
      else if(Math.abs(dy)>12)st.lock='v';
    }
    if(st.lp&&(Math.abs(dx)>10||Math.abs(dy)>10)){clearTimeout(st.lp);st.lp=0}
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!st)return;var s=st;st=null;if(s.lp)clearTimeout(s.lp);
    var ct=e.changedTouches&&e.changedTouches[0];
    if(s.fired){mpSwallow(ct?ct.clientX:s.lx,ct?ct.clientY:s.y);return}
    var x=ct?ct.clientX:s.lx,dx=x-s.x,dt=Math.max(1,Date.now()-s.t);
    if(s.lock==='h'){
      var ns=nextSign(dx),np=rd.page+ns,fast=Math.abs(s.v)>.45&&Math.abs(dx)>28,far=Math.abs(dx)>s.w*.22;
      if((far||fast)&&np>=1&&np<=604){
        mpSwallow(x,ct?ct.clientY:s.y);mpHap();
        mpSel='';rd.dir=ns;rd.page=np;rd.ui=false;render();window.scrollTo(0,0);
      }else if(far||fast){mpHap()}
      return;
    }
    if(!s.lock&&!s.fired){
      var w2=wordAt(x,ct?ct.clientY:s.y);
      if(w2){var vv=w2.getAttribute('data-v');mpHl(mpHlLast===vv?'':vv)}
    }
  },{passive:true});
  document.addEventListener('touchcancel',function(){if(st&&st.lp)clearTimeout(st.lp);st=null;if(!mpSel)mpHl('')},{passive:true});
})();

/* إغلاق النوافذ العائمة للمصحف (خيارات، شريط الآية، بحث، انتقال سريع) — يُستدعى مع زر الرجوع وعند مغادرة القارئ */
function mpCloseOverlays(){
  var c=false,e;
  if((e=document.getElementById('mps-wrap'))){e.remove();c=true}
  if((e=document.getElementById('mpi-ask'))){e.remove();c=true}
  if((e=document.getElementById('mp-vb'))){mpDismissBar(e);mpSel='';try{mpHl('')}catch(x){}try{mpImgClear()}catch(x5){}c=true}
  if(rd&&(rd.jump||rd.srch)&&tab==='reader'){rd.jump=false;rd.srch=false;c=true;render()}
  return c;
}

/* ---------- ورقة «الورد والرواية»: فتح «القرآن» يدخل المصحف مباشرة، وما كان في الشاشة الوسيطة يعيش هنا ---------- */
function qwSheetHtml(){
  var k=dk(),pg=qPages(k),goal=S.quran.goal,pos=Math.max(1,S.quran.pos||1),to=Math.min(604,pos+goal-1),last=Math.max(pos,S.quran.last||pos);
  var done=pg>=goal,pct=Math.min(100,Math.round(pg/goal*100));
  var total=0;Object.keys(S.quran.log).forEach(function(d){total+=S.quran.log[d]||0});
  var prog=Math.round((total%QURAN_PAGES)/QURAN_PAGES*100),w=isW();
  var seg=function(on,v,label){return '<button class="'+(on?'on':'')+'" data-a="qriw" data-v="'+v+'">'+label+'</button>'};
  return '<div class="ups-back" data-a="qwclose"></div><div class="ups-card qws"><div class="ups-grab"></div>'
  +'<h3 class="qws-t">الورد والرواية</h3>'
  +'<p class="qws-sub">كل ما كان في شاشة القرآن الوسيطة صار هنا داخل المصحف</p>'
  +'<div class="sg-card">'
  +'<div class="sg-row"><span class="sg-ic">'+ic('book')+'</span><div class="sg-tx"><b>الرواية</b><small>التبديل يعيد تحميل المصحف بروايتك</small></div><div class="sg-ctl"><div class="sg-seg">'+seg(!w,'hafs','حفص')+seg(w,'warsh','ورش')+'</div></div></div>'
  +'<div class="sg-row qws-col"><div class="qws-head"><span class="sg-ic">'+ic('check')+'</span><div class="sg-tx"><b>وردك اليومي</b><small>'+(done?'أتممت وردك اليوم، بارك الله فيك':'قرأت اليوم '+ar(pg)+' من '+ar(goal)+' '+(goal<11?'صفحات':'صفحة'))+' · '+(pos===to?'صفحة '+ar(pos):'من ص '+ar(pos)+' إلى '+ar(to))+' · '+esc(pageSura(pos))+'</small></div></div><div class="upd-bar qws-bar"><div style="width:'+pct+'%"></div></div><div class="step qws-step"><button class="ib" data-a="qgoal" data-v="-1" aria-label="إنقاص الورد">'+ic('minus')+'</button><b>'+ar(goal)+'</b><button class="ib" data-a="qgoal" data-v="1" aria-label="زيادة الورد">'+ic('plus')+'</button></div></div>'
  +'<button class="sg-row" data-a="qopen" data-v="'+last+'"><span class="sg-ic">'+ic('book')+'</span><div class="sg-tx"><b>تابع من حيث توقفت</b></div><div class="sg-ctl"><span class="sg-val">صفحة '+ar(last)+' · '+esc(pageSura(last))+'</span>'+ic('chev').replace('class="i"','class="i chev"')+'</div></button>'
  +'<button class="sg-row" data-a="tab" data-v="khatma"><span class="sg-ic">'+ic('flag')+'</span><div class="sg-tx"><b>تقدّم الختمة</b></div><div class="sg-ctl"><span class="sg-val">'+ar(prog)+'٪ · '+ar(total)+' صفحة</span>'+ic('chev').replace('class="i"','class="i chev"')+'</div></button>'
  +'<div class="sg-row qws-col"><div class="qws-head"><span class="sg-ic">'+ic('pen')+'</span><div class="sg-tx"><b>قرأت من مصحف ورقي؟</b><small>سجّل ما قرأته ورقيًا ليُحسب في وردك اليوم</small></div></div><div class="step qws-step"><button class="ib" data-a="qsub" aria-label="إنقاص">'+ic('minus')+'</button><b>'+ar(pg)+'</b><button class="ib" data-a="qadd" aria-label="إضافة صفحة">'+ic('plus')+'</button></div></div>'
  +'</div>'
  +'<button class="btn block" data-a="qstart" style="margin-top:12px">'+ic('book')+' '+(done?'اقرأ المزيد':'ابدأ الورد من صفحة '+ar(pos))+'</button>'
  +'<button class="btn ghost block" data-a="qwclose">إغلاق</button></div>';
}
function qwSheetOpen(){if(document.getElementById('qwirdsheet'))return;if(typeof rd!=='undefined'&&rd&&rd.jump){rd.jump=false;render()}var d=document.createElement('div');d.id='qwirdsheet';d.className='upsheet';d.innerHTML=qwSheetHtml();document.body.appendChild(d)}
function qwSheetClose(){var d=document.getElementById('qwirdsheet');if(d)d.remove()}
function qwSheetPaint(){var d=document.getElementById('qwirdsheet');if(d)d.innerHTML=qwSheetHtml()}
/* بانر متوهج بعد تبديل الرواية يؤكد للمستخدم أين هو */
function qwBanner(riw){
  var old=document.getElementById('riwbanner');if(old)old.remove();
  var d=document.createElement('div');d.id='riwbanner';d.className='riw-banner';
  d.innerHTML=ic('sparkles')+' أنت الآن على رواية '+(riw==='warsh'?'ورش':'حفص');
  document.body.appendChild(d);
  setTimeout(function(){d.classList.add('out');setTimeout(function(){if(d.parentNode)d.remove()},420)},1600);
}
