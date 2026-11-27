/* مقابلة آية بين الروايتين عبر جدول التفسير (ترقيم حفص ↔ ورش)؛ ترجع null إن لم توجد مقابلة */
function mqMapVerse(c,v,toW){
  try{
    if(!toW){var k=tfCover(c,v);return k?c+':'+k.a:null}
    var n=WD().s[c-1].length;
    for(var w=1;w<=n;w++){var k2=tfCover(c,w);if(k2&&k2.a<=v&&v<=k2.b)return c+':'+w}
  }catch(e){}
  return null;
}
function mqUseRiw(nr,cb){
  var go=function(){
    var oldP=null,oldV=null,wasPlaying=!!(mqAu.a&&!mqAu.a.paused&&!mqAu.pa);
    if(rd&&rd.flow&&rd.cv){var q=String(rd.cv).split(':');oldP=mpVerPage(+q[0],+q[1]);oldV=[+q[0],+q[1]]}
    var pk=wasPlaying&&mqAu.k?String(mqAu.k).split(':'):null;
    try{mqAuStop()}catch(e){}
    S.quran.riwaya=nr;save();mpIdx=null;mpSel='';
    var toW=nr==='warsh',nv=oldV&&mqMapVerse(oldV[0],oldV[1],toW);
    if(nv){var r0=nv.split(':');rd.sura=+r0[0];rd.cv=nv;rd._scrollCv=nv}
    else if(oldP){var r=curP()[oldP-1]||[1,1];rd.sura=r[0];rd.cv=r[0]+':'+r[1];rd._scrollCv=rd.cv}
    cb();
    /* تشغيل جارٍ: يُستأنف من مصدر الرواية الجديدة (ورش: السورة كاملة من أولها لعدم وجود توقيت آيات) */
    if(pk&&rd&&rd.cv){var pv=mqMapVerse(+pk[0],+pk[1],toW);if(pv)setTimeout(function(){try{mqAuPlay(pv)}catch(e){}},400)}
  };
  if(nr==='warsh'&&!window.WDATA)loadHeavy(go);else go();
}
/* ---------- المصحف: انتقال سريع · تقليب بالسحب · متابعة من حيث توقفت ---------- */
function mpJuzPage(j){var P=curP();for(var i=0;i<P.length;i++)if(P[i][4]===j)return i+1;return 1}
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
    +(rd&&rd.flow?'<button type="button" data-a="qpgm">'+ic('doc')+'<small>العرض: '+(S.quran.pgm!==false?'صفحات':'تدفق')+'</small></button>':'')
    +(rd&&rd.flow?'<button type="button" data-a="umode" data-v="'+((typeof uiMode==='function'&&uiMode()==='dark')?'light':'dark')+'">'+((typeof uiMode==='function'&&uiMode()==='dark')?ic('sun'):ic('moon'))+'<small>المظهر</small></button>':'')
    +'</div>';
  var last=q.last?'<button class="lrow" data-a="qjgo" data-v="l">'+ic('book')+'<span class="t">تابع من حيث توقفت<small class="muted">صفحة '+ar(q.last)+' · سورة '+esc(pageSura(q.last))+'</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>':'';
  return '<div class="rd-menb" data-a="qjump" aria-hidden="true"></div><aside class="rd-menu" role="dialog" aria-modal="true" aria-label="قائمة المصحف">'
    +'<div class="rd-mh"><b>المصحف</b><button class="rd-mx" data-a="qjump" aria-label="إغلاق">'+ic('x')+'</button></div>'
    +'<button class="lrow" data-a="qwird">'+ic('flag')+'<span class="t">الورد والرواية<small class="muted">وردك اليومي، الرواية، وتقدّم الختمة</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'
    +'<div class="rd-mq"><input id="mq-q" class="qd-i" type="search" enterkeyhint="search" autocomplete="off" placeholder="كلمة من آية، أو ٢:٢٥٥، أو اسم سورة" value="'+esc(rd.mq||'')+'"><button class="btn" data-a="qms">بحث</button></div>'
    +res+tabs+'<div class="rd-mtb">'+ctl+'</div>'
    +ward+grid+mpMarksHtml()+((rd&&rd.flow)?mqBmsHtml():'')+last+((rd&&rd.flow)?mqReadSet():'')
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
    mpSel='';rd.dir=t>rd.page?1:-1;rd.page=t;rd.pscr=0;if(rd.flow){var fr=curP()[t-1];if(fr){rd.sura=fr[0];rd.cv=fr[0]+':'+fr[1]}}rd.jump=false;window.scrollTo(0,0);return false;
  }
  return false;
}
/* السحب: يمينًا = الصفحة السابقة، يسارًا = التالية (كالمصحف الورقي العربي) */
/* حارس النقرة الشبح: بعد ضغطة مطوّلة أو قلبة سحب يولّد المتصفح نقرة عند موضع رفع الإصبع
   قد تصيب زرًا ظهر تحت الإصبع. الابتلاع مرة واحدة فقط، خلال 400ms، وعلى بعد 60px من موضع
   الإصبع — أي نقرة حقيقية أبعد أو لاحقة تمر فورًا (كان 700ms تبتلع كل النقرات). */
var mpSwAt=0,mpSwX=0,mpSwY=0;
document.addEventListener('click',function(e){
  if(!mpSwAt)return;
  if(Date.now()-mpSwAt>400){mpSwAt=0;return}
  var dx=e.clientX-mpSwX,dy=e.clientY-mpSwY;
  if(dx*dx+dy*dy>3600)return; /* نقرة بعيدة عن موضع الإصبع = نقرة مقصودة جديدة */
  mpSwAt=0;e.stopPropagation();e.preventDefault();
},true);

/* ---------- ملء الشاشة + البحث عن آية ---------- */
var MP_SV='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>',mpHint=false,mpIdx=null;
function mpNorm(t){return String(t||'').replace(/[ً-ٰٟۖ-ۭـ-]/g,'').replace(/[آأإٱ]/g,'ا').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ء/g,'').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[ک]/g,'ك').replace(/[ی]/g,'ي').replace(/\s+/g,' ').trim()}
function mpVerPage(c,v){var P=curP();for(var i=0;i<P.length;i++){var r=P[i];if((c>r[0]||(c===r[0]&&v>=r[1]))&&(c<r[2]||(c===r[2]&&v<=r[3])))return i+1}return 1}
var mpIdxW=null;
function mpBuild(){var w=isW();if(mpIdx&&mpIdxW===w)return mpIdx;var D=AD(),o=[];D.s.forEach(function(vs,ci){vs.forEach(function(t,vi){o.push({c:ci+1,v:vi+1,n:mpNorm(w?verseText(ci+1,vi+1):t)})})});mpIdxW=w;return mpIdx=o}
function mpFind(q){
  var D=AD(),out=[],nq=mpNorm(q.replace(/[٠-٩]/g,function(d){return d.charCodeAt(0)-1632}));if(!nq)return out;
  var m=/^(\d{1,3})\s*[:\/\-\s]\s*(\d{1,3})$/.exec(nq);
  if(m){var c=+m[1],v=+m[2];if(c>=1&&c<=114&&v>=1&&v<=D.s[c-1].length)return [{c:c,v:v,pg:mpVerPage(c,v)}]}
  D.n.forEach(function(n,i){if(mpNorm(n).indexOf(nq)>=0)out.push({sura:i+1,pg:suraPage(i+1)})});
  var ws=nq.split(' '),idx=mpBuild(),k=0,rest=[]; /* العبارة المتصلة أولاً ثم الكلمات بأي ترتيب؛ السقف ٦٠ للمجموع */
  for(var i=0;i<idx.length;i++){var e=idx[i],ok=true;for(var j=0;j<ws.length;j++)if(e.n.indexOf(ws[j])<0){ok=false;break}if(!ok)continue;
    var it={c:e.c,v:e.v,pg:mpVerPage(e.c,e.v)};
    if(ws.length>1&&e.n.indexOf(nq)>=0){if(k<60){out.push(it);k++}}else if(rest.length<60)rest.push(it)}
  for(var r=0;r<rest.length&&k<60;r++,k++)out.push(rest[r]);
  return out;
}
function mpSrHtml(){
  var D=QD(),R=rd.sr||[],h='';
  if(rd.sq&&!R.length)h+='<p class="note">لا نتائج. جرّب كلمة أقصر أو بدون تشكيل.</p>';
  else if(!rd.sq)h+='<p class="note">اكتب كلمة أو أكثر من الآية فتظهر الآيات المطابقة، أو رقم السورة والآية مثل ٢:٢٥٥، أو اسم السورة.</p>';
  R.forEach(function(x){
    if(x.sura)h+='<button class="rd-ri" data-a="qsgo" data-v="'+x.pg+'"><b>سورة '+esc(D.n[x.sura-1])+'</b><small>ص '+ar(x.pg)+'</small></button>';
    else{var t=verseText(x.c,x.v);if(t.length>130)t=t.slice(0,130)+'…';h+='<button class="rd-ri" data-a="'+(rd.flow?'qsgov':'qsgo')+'" data-v="'+(rd.flow?x.c+':'+x.v:x.pg)+'"><span class="rd-rt">'+esc(t)+'</span><small>'+esc(D.n[x.c-1])+' · آية '+ar(x.v)+' · ص '+ar(x.pg)+'</small></button>'}
  });
  return h;
}
function mpSearchPanel(){
  if(!rd||!rd.srch)return '';
  return '<div class="rd-sp"><div class="rd-sh"><button class="ib" data-a="qsclose" aria-label="إغلاق">✕</button><input id="mps-q" class="qd-i" type="search" enterkeyhint="search" autocomplete="off" placeholder="كلمة من الآية، أو رقم مثل ٢:٢٥٥" value="'+esc(rd.sq||'')+'"><button class="btn" data-a="qsdo">بحث</button></div><div class="rd-sr">'+mpSrHtml()+'</div></div>';
}
/* بحث لحظي أثناء الكتابة: يحدّث قائمة النتائج فقط دون إعادة رسم الشاشة، فيبقى المؤشر ولوحة المفاتيح */
(function(){var tm;document.addEventListener('input',function(e){
  var t=e.target;if(!t||t.id!=='mps-q'||!rd||!rd.srch)return;
  clearTimeout(tm);tm=setTimeout(function(){
    var el=document.getElementById('mps-q');if(!el||!rd||!rd.srch)return;
    rd.sq=(el.value||'').trim();rd.sr=rd.sq?mpFind(rd.sq):[];
    var box=document.querySelector('.rd-sp .rd-sr');if(box)box.innerHTML=mpSrHtml()},220)})})();
function mpAct2(a,v){
  if(!rd)return true;
  if(a==='qms'){rd.mq=((document.getElementById('mq-q')||{}).value||'').trim();rd.mr=rd.mq?mpFind(rd.mq):[];return false}
  if(a==='qsrch'){if(wiOn()){toast(WI_NOTXT);return true}rd.srch=true;rd.jump=false;rd.idx=false;return false}
  if(a==='qsgov'){var q=String(v).split(':'),sc=+q[0],sv=+q[1];if(sc>=1&&sc<=114&&sv>=1){mpSel='';rd.sura=sc;rd.cv=sc+':'+sv;rd._scrollCv=rd.cv;rd.dir=1;rd.srch=false;rd.jump=false;rd.ui=false}return false}
  if(a==='qsclose'){rd.srch=false;return false}
  if(a==='qsdo'){rd.sq=((document.getElementById('mps-q')||{}).value||'').trim();rd.sr=rd.sq?mpFind(rd.sq):[];return false}
  if(a==='qsgo'){var t=parseInt(v,10);mpSel='';if(t>=1&&t<=604){rd.dir=t>rd.page?1:-1;rd.page=t;rd.pscr=0;if(rd.flow){var fr2=curP()[t-1];if(fr2){rd.sura=fr2[0];rd.cv=fr2[0]+':'+fr2[1]}}}rd.srch=false;rd.jump=false;rd.mq='';rd.mr=null;rd.ui=false;window.scrollTo(0,0);return false}
  return false;
}
(function(){
  var lt=null,comp=false;
  function run(){
    var i=document.getElementById('mq-q');if(!i||!rd||tab!=='reader')return;
    var q=(i.value||'').trim();
    if(q===(rd.mq||''))return;
    if(q&&q.length<2&&!/[0-9\u0660-\u0669]/.test(q))return;
    rd.mq=q;rd.mr=q?mpFind(q):null;
    var pos=i.selectionStart;
    render();
    var back=function(){var n=document.getElementById('mq-q');if(n&&document.activeElement!==n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}};
    back();setTimeout(back,0);setTimeout(back,60);
  }
  function sched(){clearTimeout(lt);lt=setTimeout(run,250)}
  document.addEventListener('input',function(e){if(e.target&&e.target.id==='mq-q'&&!comp&&!e.isComposing)sched()});
  document.addEventListener('compositionstart',function(e){if(e.target&&e.target.id==='mq-q')comp=true});
  document.addEventListener('compositionend',function(e){if(e.target&&e.target.id==='mq-q'){comp=false;sched()}});
})();
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&(e.target.id==='mps-q'||e.target.id==='mq-q')){var qid=e.target.id;e.preventDefault();if(!mpAct2(qid==='mq-q'?'qms':'qsdo')){render();setTimeout(function(){var i=document.getElementById(qid);if(i)i.blur()},50)}}});

/* ---------- تظليل الآية بتوهج يتبع الإصبع + علامات الحفظ ---------- */
var mpSel='',mpHlLast='';
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
  if(tab!=='reader'||!rd||(!document.getElementById('mp')&&!document.getElementById('mq-ov'))){if(bar)mpDismissBar(bar);mpSel='';return}
  var vm=mpVm(),W=document.querySelectorAll('#mp .mw[data-v]');
  for(var i=0;i<W.length;i++)W[i].classList.toggle('vmk',!!vm[W[i].getAttribute('data-v')]);
  mpHl(mpSel);
  if(mpImg.k&&mpImg.k!==mpSel)mpImgClear();
  if(!mpSel){if(bar)mpDismissBar(bar);return}
  if(!bar){bar=document.createElement('div');bar.id='mp-vb';bar.className='mp-vb';document.body.appendChild(bar)}else if(bar._closing){bar._closing=0;bar.classList.remove('mp-closing')}
  var mk=!!vm[mpSel];
  var flow=!!(rd&&rd.flow),onB=mqBmOn(+mpSel.split(':')[0],+mpSel.split(':')[1]);
  bar.innerHTML='<i class="mp-grip" aria-hidden="true"></i><div class="mp-vbh"><b>'+esc(mpVName(mpSel))+'</b><button data-mp2="x" class="mp-vx" aria-label="إغلاق">✕</button></div>'+((mpTf.k===mpSel&&mpTf.t)?'<div class="mp-tf" dir="rtl" style="font-size:'+tfSz()+'px">'+esc(mpTf.t)+'</div>':'')+((mpMk.k===mpSel&&mpMk.t)?'<div class="mp-tf" dir="rtl" style="font-size:'+tfSz()+'px">'+esc(mpMk.t)+'</div><div class="mp-src"><span>المختصر في التفسير · مركز تفسير للدراسات القرآنية</span><button data-mp2="mkre">تحديث</button></div>':'')+((mpImg.k===mpSel&&mpImg.loading)?'<div class="mp-tf">جارٍ تجهيز الصورة…</div>':'')+((mpImg.k===mpSel&&mpImg.url)?'<img class="mp-shi" src="'+mpImg.url+'" alt="بطاقة الآية"><span class="mp-shb"><button data-mp2="imgsh">مشاركة الصورة</button><button data-mp2="imgdl">حفظ</button></span>':'')+'<div class="mp-vbb">'
  +('<button data-mp2="bmrk" class="'+(onB?'on':'')+'">'+ic('star')+'<span>حفظ علامة مرجعية</span></button>'
     +'<button data-mp2="tf" class="'+(mpTf.k===mpSel?'on':'')+'">'+ic('book')+'<span>التفسير</span></button>'
     +'<button data-mp2="copy">'+ic('pen')+'<span>نسخ الآية</span></button>'
     +'<button data-mp2="share">'+ic('clup')+'<span>مشاركة</span></button>')
  +'</div>';
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
  var ws=document.querySelectorAll('#mp .mw.vhl');
  if((!ws||!ws.length)&&rd&&rd.flow){ /* القارئ المتدفق: الشريط يثبّت قرب الآية الحالية */
    var cur=document.querySelector('.mq-v.cur')||document.querySelector('.mq-v[data-v="'+(mpSel||'')+'"]');
    if(!cur)return;
    var cr=cur.getBoundingClientRect(),vh2=window.innerHeight,gap2=8;
    var below=(vh2-10)-(cr.bottom+gap2),above=(cr.top-gap2)-70;
    var tt;
    if(below>=bar.offsetHeight||below>=above)tt=cr.bottom+gap2;
    else tt=Math.max(60,(cr.top-gap2)-bar.offsetHeight);
    bar.style.top=Math.max(56,Math.min(tt,vh2-10-bar.offsetHeight))+'px';
    bar.style.bottom='auto';
    return;
  }
  if(!ws||!ws.length)return;
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
function mpVerseText(v){var q=String(v).split(':');return '﴿'+verseText(+q[0],+q[1])+'﴾ — '+mpVName(v)}
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
      /* قياس أولًا ثم رسم: النص كاملًا دون أي اقتطاع؛ يطول ارتفاع الصورة عند الحاجة بدل حذف كلمات */
      var m0=document.createElement('canvas').getContext('2d');m0.direction='rtl';
      var size=Math.max(34,Math.min(76,Math.round(1250/Math.sqrt(t.length||1)))),lines,lh;
      for(;;){m0.font=size+'px '+fam;lines=mpWrapLines(m0,t,880);lh=size*1.7;if(lines.length*lh<=760||size<=34)break;size-=4}
      var Hc=Math.max(1350,Math.ceil(lines.length*lh+590));
      var c=document.createElement('canvas');c.width=1080;c.height=Hc;var x=c.getContext('2d');
      var g=x.createLinearGradient(0,0,1080,Hc);g.addColorStop(0,pal.g0);g.addColorStop(1,pal.g1);x.fillStyle=g;x.fillRect(0,0,1080,Hc);
      x.strokeStyle='#C9A24B';x.lineWidth=4;x.strokeRect(40,40,1000,Hc-80);x.lineWidth=1.5;x.strokeRect(58,58,964,Hc-116);
      x.direction='rtl';x.textAlign='center';
      x.fillStyle=pal.hd;x.font='bold 46px '+ff;x.fillText('السائر إلى الله',540,150);
      x.font=size+'px '+fam;x.fillStyle='#fff';var y0=Hc/2-35-lines.length*lh/2+lh*0.6;lines.forEach(function(l,i){x.fillText(l,540,y0+i*lh)});
      x.fillStyle='#9FB3AE';x.font='36px '+ff;x.fillText(mpVName(k),540,Hc-170);
      x.fillStyle='#C9A24B';x.font='30px '+ff;x.fillText('تطبيق السائر إلى الله · مجاني بالكامل',540,Hc-100);
      cb(c)
    }catch(e){cb(null)}
  };
  if(document.fonts&&document.fonts.load){
    var FN=isW()?'KFGQPCWarshV2':'KFGQPC';document.fonts.load('64px '+FN,t.slice(0,20)).then(function(){
      var ok=false;try{ok=document.fonts.check('64px '+FN)}catch(e){}
      draw(ok?FN:ff)
    },function(){draw(ff)});
  }else draw(ff);
}

/* كاش التفسير بسقف: ٣٠٠ آية كحد أقصى، الأقدم يُمسح أولًا، حتى لا تمتلئ مساحة التخزين بصمت */
var TF_CAP=300,TF_IDX='alsaer_tf_idx',tfMig=false;
function tfIdx(){try{var a=JSON.parse(localStorage.getItem(TF_IDX)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function tfSaveIdx(a){try{localStorage.setItem(TF_IDX,JSON.stringify(a))}catch(e){}}
function tfMigrate(){if(tfMig)return;tfMig=true;try{var a=tfIdx(),add=[];for(var n=0;n<localStorage.length;n++){var k2=localStorage.key(n);if(k2&&k2.indexOf('alsaer_tf_')===0&&k2!==TF_IDX&&a.indexOf(k2)<0)add.push(k2)}if(add.length){a=add.concat(a);tfSaveIdx(a)}}catch(e){}}
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
  if(k==='mk'||k==='mkre'){return}
  if(k==='tf'){if(rd&&rd.flow)mqOpenTf(mpSel);return}
  if(k==='bmrk'){var q3=mpSel.split(':');if(mqBmOn(+q3[0],+q3[1])){S.quran.bm2=null;save();toast('أُزيلت العلامة')}else{mqBmSet(+q3[0],+q3[1]);save();toast('تم حفظ العلامة المرجعية')}mpApplySel();return}
  if(k==='copy'){if(wiOn()){toast(WI_NOTXT);return}try{navigator.clipboard.writeText(mpVerseText(mpSel));toast('تم نسخ الآية')}catch(x){toast('تعذّر النسخ')}return}
  if(k==='share'){var t=mpVerseText(mpSel);if(navigator.share){navigator.share({text:t}).catch(function(){})}else{try{navigator.clipboard.writeText(t);toast('نُسخت الآية للمشاركة')}catch(x){}}return}
  if(k==='mark'){var vm=mpVm();if(vm[mpSel]){delete vm[mpSel];toast('أُزيلت العلامة')}else{vm[mpSel]=Date.now();toast('وُضعت علامة حفظ')}S.quran.vm=vm;save();mpApplySel()}
},true);


function mpMarksHtml(){
  var vm=mpVm(),ks=Object.keys(vm).sort(function(a,b){return vm[b]-vm[a]}).slice(0,30);if(!ks.length)return '';
  return '<h4 style="margin:14px 0 6px">علامات الحفظ</h4><div class="mpj-m">'+ks.map(function(k){var q=k.split(':');return '<button class="chip" data-a="qsgo" data-v="'+mpVerPage(+q[0],+q[1])+'">'+esc(mpVName(k))+'</button>'}).join('')+'</div>';
}

/* ---------- لمس موحّد: الصفحة تتبع الإصبع + توهج الآية + اهتزاز خفيف ---------- */
function mpHap(){try{if(typeof hapGo==='function')hapGo([14]);else if(navigator.vibrate)navigator.vibrate(14)}catch(e){}}
/* قارئ حفص المتدفق: ضغطة = آية حالية (بمهلة ٣٠٠ms ضد الضغطة المزدوجة) · مزدوجة = تفسير · مطوّلة = قائمة الآية · تتبع تلقائي عند ٤٥٪ */
var mqTapT=null;
document.addEventListener('click',function(e){
  if(tab!=='reader'||!rd||!rd.flow)return;
  var v=e.target&&e.target.closest&&e.target.closest('.mq-v[data-v]');if(!v)return;
  var vv=v.getAttribute('data-v');
  if(mqTapT){clearTimeout(mqTapT);mqTapT=null;mqOpenTf(vv);return}
  mqTapT=setTimeout(function(){mqTapT=null;mqSetCur(vv,true)},300);
});
function mqSetCur(vv,hap){
  if(!rd||!rd.flow)return;rd.cv=vv;
  document.querySelectorAll('.mq-v.cur').forEach(function(o){o.classList.remove('cur')});
  document.querySelectorAll('.mq-v[data-v="'+vv+'"]').forEach(function(e){e.classList.add('cur')});
  var pos=document.getElementById('mq-pos');if(pos){var q=vv.split(':');pos.textContent='آية '+ar(+q[1])}
  if(hap)mpHap();
}
function mqOpenTf(vv){mqSetCur(vv,false);tfOpen(vv)}
/* قائمة الآية العائمة (نموذج التقوى): ضغطة مطوّلة ٥٠٠ms، تلغى بحركة >١٠px، لوحة عند نقطة الضغط */
function mqHl(){}
function mqMenuClose(){var d=document.getElementById('mq-mbd');if(d)d.remove();mqHl()}
/* استماع لحفص: بث مباشر فقط من Quran Foundation (المنشاوي مرتل، recitation id 9)، ملف لكل آية بترقيم حفص. لا تنزيل ولا تخزين ولا إعادة استضافة */
var mqAu={a:null,k:'',pa:false},mqAuT=null;
/* مصدر التلاوة لكل رواية: حفص = المنشاوي مرتل (Quran Foundation)؛ ورش = لا مصدر موثّق بعد (null) فيُخفى الاستماع بدل تلاوة حفص على نص ورش */
/* ورش = عبدالباسط عبدالصمد (ورش عن نافع، مرتل) من mp3quran.net، سورة كاملة (لا توقيت آيات متاح)، بث مباشر فقط. الترخيص غير مؤكد (لا شروط منشورة) */
var MQ_AUSRC={h:{n:'المنشاوي (مرتل)',u:function(c,v){return 'https://verses.quran.com/Minshawi/Murattal/mp3/'+('00'+c).slice(-3)+('00'+v).slice(-3)+'.mp3'}},w:{n:'ياسين الجزائري (ورش)',tm:1,u:function(c){return 'https://cdn.mp3quran.net/audio/yassen-jazairi/r1/'+('00'+c).slice(-3)+'.mp3'}},w2:{n:'عبدالباسط (ورش)',whole:1,u:function(c){return 'https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r2/'+('00'+c).slice(-3)+'.mp3'}}};
function mqWtEnsure(cb){
  if(window.WTIM){cb(true);return}
  var q=window.__wtq||(window.__wtq=[]);q.push(cb);if(window.__wtl)return;window.__wtl=1;
  var sc=document.createElement('script');sc.src='warsh-timing-yassin.js';
  sc.onload=sc.onerror=function(){window.__wtl=0;var ok=!!window.WTIM;q.splice(0).forEach(function(f){try{f(ok)}catch(e){}})};
  document.head.appendChild(sc);
}
/* الآية الجارية في ملف ورش المؤقَّت: آخر آية بدأت قبل الزمن الحالي (ثوانٍ) */
function mqWtAyah(c,t){var a=window.WTIM&&window.WTIM.s[c-1];if(!a)return 0;var ms=t*1000,i=0;while(i+1<a.length-1&&a[i+1]<=ms)i++;return i+1}
function mqAuS(){return isW()?(window.WTIM||!window.__wtfail?MQ_AUSRC.w:MQ_AUSRC.w2):MQ_AUSRC.h}
function mqAuOn(){return !!mqAuS()}
function mqAuName(){var s=mqAuS();return s?s.n:''}
function mqAuUrl(c,v){var s=mqAuS();return s?s.u(c,v):''}
function mqAuBar(){
  mqHl();
  var d=document.getElementById('mq-au');
  if(!mqAu.a||(tab!=='reader'&&!(mqAu.ext&&tab==='cards'))){if(d)d.remove();try{mqAuSync()}catch(e){}return}
  if(!d){d=document.createElement('div');d.id='mq-au';d.className='mq-au';document.body.appendChild(d);
    d.addEventListener('click',function(e){var b=e.target.closest('[data-au]');if(!b)return;var k=b.getAttribute('data-au');
      if(k==='x'){mqAuStop();return}
      if(k==='pp'&&mqAu.a){if(mqAu.a.paused){mqAu.pa=false;var r=mqAu.a.play();if(r&&r.catch)r.catch(function(){})}else{mqAu.pa=true;mqAu.a.pause()}mqAuBar()}
      if(k==='nx'&&mqAu.k){var q=mqAu.k.split(':');mqAuPlay(q[0]+':'+(+q[1]+1))}
    })}
  var P='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',Z='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',N='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14l8-7zM16 5h2v14h-2z" fill="currentColor" transform="translate(24 0) scale(-1 1)"/></svg>';
  d.innerHTML='<div class="mq-aut"><b>'+(mqAu.ext?esc(mqAu.nm):tr0(mqAuName()))+'</b><small>'+(mqAu.ext?'albitaqat.com':mqAuS().whole?tr0('السورة كاملة')+' · '+esc(AD().n[+mqAu.k.split(':')[0]-1]):esc(mpVName(mqAu.k)))+'</small></div>'
    +'<button data-au="pp" aria-label="'+tr0(mqAu.pa?'متابعة':'إيقاف مؤقت')+'">'+(mqAu.pa?P:Z)+'</button>'
    +((mqAu.ext||mqAuS().whole)?'':'<button data-au="nx" aria-label="'+tr0('الآية التالية')+'">'+N+'</button>')
    +'<button data-au="x" aria-label="'+tr0('إيقاف')+'">'+ic('x')+'</button>';
  mqAuSync()
}
/* أزرار الاستماع في شاشة التفسير: الزر يعرض حالة التشغيل لآيته، وسطر زمن مستقل تحت الأزرار */
var MQ_PI='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',MQ_ZI='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';
function mqAuFmt(x){x=isFinite(x)?Math.max(0,Math.floor(x)):0;return ar(Math.floor(x/60)+':'+('0'+(x%60)).slice(-2))}
function mqAuSync(){
  var L=document.querySelectorAll('.mq-tc .mq-tcact button[data-a=qtfau]');
  for(var i=0;i<L.length;i++){
    var b=L[i],on=!!(mqAu.a&&mqAu.k===b.getAttribute('data-v')),act=b.parentNode,ln=act.querySelector('.mq-tcau');
    b.classList.toggle('on',on);
    var want=on?(mqAu.pa?'متابعة':'إيقاف مؤقت'):'استماع';
    if(b.getAttribute('data-k')!==want){b.setAttribute('data-k',want);b.innerHTML=(on&&!mqAu.pa?MQ_ZI:MQ_PI)+'<span>'+tr0(want)+'</span>'}
    if(on){if(!ln){ln=document.createElement('small');ln.className='mq-tcau';act.appendChild(ln)}
      ln.textContent=((typeof lang==='function'&&lang()!=='ar'&&typeof trS==='function'&&trS(mqAuName()))||mqAuName())+' · '+mqAuFmt(mqAu.a.currentTime)+' / '+mqAuFmt(mqAu.a.duration)}
    else if(ln)ln.remove();
  }
}
function tr0(t){var r=(typeof lang==='function'&&lang()!=='ar'&&typeof trS==='function')?trS(t):null;return esc(r||t)}
function mqAuTick(){
  if(!mqAu.a||!mqAu.sc||!mqAuS().tm||!window.WTIM||mqAu.a.paused&&!mqAu.a.ended)return;
  var c=mqAu.sc,n=mqWtAyah(c,mqAu.a.currentTime),cv=+String(mqAu.k).split(':')[1];
  if(n>=1&&n!==cv&&n<=AD().s[c-1].length){var nv=c+':'+n;mqAu.k=nv;mqSetCur(nv,false);var el=document.querySelector('.mq-v[data-v="'+nv+'"]');if(el&&el.scrollIntoView){try{el.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}mqAuBar()}
}
function mqAuStop(){
  var a=mqAu.a;mqAu={a:null,k:'',pa:false};clearInterval(mqAuT);mqAuT=null;
  if(a){try{a.onended=a.onerror=null;a.pause();a.removeAttribute('src');a.load()}catch(e){}}
  mqAuBar()
}
function mqAuPlay(vv){
  if(!mqAuOn()){mqAuStop();return}
  var q=String(vv).split(':'),c=+q[0],v=+q[1];
  if(!(c>=1&&c<=114)||!(v>=1)||v>AD().s[c-1].length){mqAuStop();return}
  if(isW()&&!window.WTIM&&!window.__wtfail){mqWtEnsure(function(ok){if(!ok)window.__wtfail=1;mqAuPlay(vv)});return}
  if(mqAuS().tm&&mqAu.a&&mqAu.sc===c&&mqAu.a.readyState>0){mqAu.k=vv;mqAu.a.currentTime=window.WTIM.s[c-1][v-1]/1000;mqAu.pa=false;var r0=mqAu.a.play();if(r0&&r0.catch)r0.catch(function(){});mqAuBar();return}
  var old=mqAu.a;if(old){try{old.onended=old.onerror=null;old.pause();old.removeAttribute('src');old.load()}catch(e){}}
  var a=new Audio();a.preload='auto';a.src=mqAuUrl(c,v);mqAu={a:a,k:vv,pa:false,sc:c};
  if(mqAuS().tm){var go=function(){try{a.currentTime=window.WTIM.s[c-1][v-1]/1000}catch(e){}};if(a.readyState>0)go();else a.addEventListener('loadedmetadata',go,{once:true})}
  a.onended=function(){if(mqAu.a!==a)return;if(mqAuS().whole||mqAuS().tm){mqAuStop();return}if(v<AD().s[c-1].length){var nv=c+':'+(v+1);mqSetCur(nv,false);var el=document.querySelector('.mq-v[data-v="'+nv+'"]');if(el&&el.scrollIntoView){try{el.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}mqAuPlay(nv)}else mqAuStop()};
  a.onerror=function(){if(mqAu.a!==a)return;mqAuStop();toast(netMsg('تعذّر تشغيل التلاوة. تحتاج الميزة إلى اتصال بالإنترنت'))};
  var pr=a.play();if(pr&&pr.catch)pr.catch(function(){if(mqAu.a===a&&!a.error){mqAu.pa=true;mqAuBar()}});
  if(!mqAuT)mqAuT=setInterval(function(){if(mqAu.a&&tab!=='reader'&&!(mqAu.ext&&tab==='cards'))mqAuStop();else try{mqAuTick();mqAuSync()}catch(e){}},250);
  mqAuBar()
}
/* صورة الآية: تُرسم من النص المخزَّن كما هو (verseText) دون أي تعديل، وتُعرض للمعاينة ثم المشاركة أو الحفظ */
function mqImgClose(){var d=document.getElementById('mq-ish');if(d)d.remove();mpImgClear()}
function mqImgSheet(vv){
  mqImgClose();
  var d=document.createElement('div');d.id='mq-ish';d.className='mq-ish';d.innerHTML='<div class="mq-ishm">جارٍ تجهيز الصورة…</div>';document.body.appendChild(d);
  d.addEventListener('click',function(e){
    if(e.target===d||e.target.closest('[data-ish=x]')){mqImgClose();return}
    var b=e.target.closest('[data-ish]');if(!b||!mpImg.blob)return;var k=b.getAttribute('data-ish');
    if(k==='sh'){try{var f=new File([mpImg.blob],'alsaer-ayah.jpg',{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){});return}}catch(x){}toast('المشاركة غير متاحة هنا — اضغط مطوّلًا على الصورة لحفظها')}
    else if(k==='dl'){try{var an=document.createElement('a');an.href=mpImg.url;an.download='alsaer-ayah.jpg';document.body.appendChild(an);an.click();an.remove();toast('إن لم يبدأ التنزيل، اضغط مطوّلًا على الصورة لحفظها')}catch(x2){toast('اضغط مطوّلًا على الصورة لحفظها')}}
  });
  mpAyahCard(vv,function(cv){
    if(!cv){mqImgClose();toast('تعذّر إنشاء الصورة');return}
    try{cv.toBlob(function(bl){
      if(!bl||!document.getElementById('mq-ish')){if(!bl){mqImgClose();toast('تعذّر إنشاء الصورة')}return}
      mpImg={k:vv,url:URL.createObjectURL(bl),blob:bl};
      d.innerHTML='<img class="mq-ishi" src="'+mpImg.url+'" alt="بطاقة الآية"><div class="mq-ishb"><button class="btn" data-ish="sh">مشاركة الصورة</button><button class="btn ghost" data-ish="dl">حفظ</button><button class="btn ghost" data-ish="x">إغلاق</button></div>';
    },'image/jpeg',0.92)}catch(e){mqImgClose();toast('تعذّر إنشاء الصورة')}
  });
}
function mqMenuOpen(vv,x,y){
  mqMenuClose();
  var q=vv.split(':'),c=+q[0],v=+q[1],onB=mqBmOn(c,v);
  var bd=document.createElement('div');bd.id='mq-mbd';bd.className='mq-mbd';
  bd.innerHTML='<div class="mq-mn hz" role="menu">'
   +'<div class="mq-mnh"><b>الآية '+ar(v)+'</b><button class="mq-mnx" data-mqx="1" aria-label="إغلاق">\u2715</button></div>'
   +'<button data-mqm="bmrk"'+(onB?' class="on"':'')+'>'+ic('star')+'<span>حفظ علامة مرجعية</span></button>'
   +'<button data-mqm="tf">'+ic('book')+'<span>التفسير</span></button>'
   +'<button data-mqm="copy">'+ic('pen')+'<span>نسخ الآية</span></button>'
   +'<button data-mqm="share">'+ic('clup')+'<span>مشاركة</span></button>'
   +(!mqAuOn()?'':'<button data-mqm="aud">'+ic('bell')+'<span>استماع</span></button>')
   +'<button data-mqm="img">'+ic('doc')+'<span>صورة الآية</span></button></div>';
  bd.addEventListener('touchmove',function(e){if(e.target.closest&&e.target.closest('.mq-mn')&&bd.firstChild.scrollWidth>bd.firstChild.clientWidth+1)return;e.preventDefault()},{passive:false});
  bd.addEventListener('click',function(e){
    if(e.target===bd||e.target.closest('[data-mqx]')){mqMenuClose();return}
    var b=e.target.closest('[data-mqm]');if(!b)return;
    var k=b.getAttribute('data-mqm');mqMenuClose();
    if(k==='bmrk'){if(mqBmOn(c,v)){S.quran.bm2=null;save();toast('أُزيلت العلامة')}else{mqBmSet(c,v);save();toast('تم حفظ العلامة المرجعية')}render()}
    else if(k==='tf'){mqOpenTf(vv)}
    else if(k==='copy'){if(wiOn())toast(WI_NOTXT);else try{navigator.clipboard.writeText(mpVerseText(vv));toast('تم نسخ الآية')}catch(x2){toast('تعذّر النسخ')}}
    else if(k==='aud'){mqSetCur(vv,false);mqAuPlay(vv)}
    else if(k==='img'){if(wiOn())wiShare(vv);else mqImgSheet(vv)}
    else if(k==='share'&&wiOn()){wiShare(vv)}
    else if(k==='share'){var t=mpVerseText(vv);if(navigator.share){navigator.share({text:t}).catch(function(){})}else{try{navigator.clipboard.writeText(t);toast('نُسخت الآية للمشاركة')}catch(x3){}}}
  });
  document.body.appendChild(bd);mqHl();
  var pn=bd.firstChild;
  var vw=window.innerWidth,ph=pn.offsetHeight||64,pw=pn.offsetWidth||vw-16;
  pn.style.left=Math.max(8,Math.min(x-pw/2,vw-pw-8))+'px';
  pn.style.top=Math.max(8,Math.min(y-ph-14<8?y+14:y-ph-14,window.innerHeight-ph-8))+'px';
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')mqMenuClose()});
(function(){
  var lp=null,lpt=null,lx=0,ly=0;
  document.addEventListener('touchstart',function(e){
    if(tab!=='reader'||!rd||!rd.flow||!e.touches||e.touches.length!==1)return;
    var el=e.target&&e.target.closest&&e.target.closest('.mq-v[data-v]');if(!el)return;
    lp=el.getAttribute('data-v');lx=e.touches[0].clientX;ly=e.touches[0].clientY;
    lpt=setTimeout(function(){if(!lp)return;var vv=lp;mqSetCur(vv,false);mpHap();mqMenuOpen(vv,lx,ly);lp=null},500);
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!lpt||!e.touches||!e.touches.length)return;
    var dx=e.touches[0].clientX-lx,dy=e.touches[0].clientY-ly;
    if(dx*dx+dy*dy>100){clearTimeout(lpt);lpt=null;lp=null}
  },{passive:true});
  document.addEventListener('touchend',function(){if(lpt){clearTimeout(lpt);lpt=null}lp=null},{passive:true});
  /* التتبع التلقائي: الآية الأقرب إلى ٤٥٪ من ارتفاع الشاشة تصبح الحالية (لا تُحفظ) */
  var sct=null;
  document.addEventListener('scroll',function(e){
    if(tab!=='reader'||!rd||!rd.flow)return;
    if(sct)return;sct=setTimeout(function(){
      sct=null;
      if(rd&&rd._pin)return; /* أثناء تثبيت القفز إلى آية لا يغيّرها التتبع التلقائي؛ يُفكّ التثبيت بلمس المستخدم */
      var vs=document.querySelectorAll('.mq-v[data-v]'),target=window.innerHeight*.45,best=null,bd=1e9;
      for(var i=0;i<vs.length;i++){var r=vs[i].getBoundingClientRect();if(r.bottom<0||r.top>window.innerHeight)continue;var d=Math.abs((r.top+r.bottom)/2-target);if(d<bd){bd=d;best=vs[i]}}
      if(best)mqSetCur(best.getAttribute('data-v'),false);
    },150);
  },true);
  ['touchstart','wheel','keydown'].forEach(function(t){document.addEventListener(t,function(){if(rd)rd._pin=null},{capture:true,passive:true})});
  /* التمرير لمرة واحدة إلى آية مقصودة عند الفتح (متابعة القراءة/الورد) */
  new MutationObserver(function(){
    if(tab!=='reader'||!rd||!rd.flow||!rd._scrollCv)return;
    var v=document.querySelector('.mq-v[data-v="'+rd._scrollCv+'"]');if(!v)return;
    var cv=rd._scrollCv;rd._scrollCv=null;
    v.scrollIntoView({block:'center'});mqSetCur(cv,false);
    /* بعد تبديل الرواية قد يعاد البناء مرة ثانية بعد أول تمرير فيرجع التمرير إلى الأعلى؛ نعيد التثبيت قليلًا ما لم يلمس المستخدم الشاشة */
    rd._pin=cv;
    [60,160,320,600].forEach(function(ms){setTimeout(function(){if(tab!=='reader'||!rd||rd._pin!==cv)return;var e=document.querySelector('.mq-v[data-v="'+cv+'"]');if(!e)return;var r=e.getBoundingClientRect(),mid=(r.top+r.bottom)/2;if(Math.abs(mid-window.innerHeight*.5)>window.innerHeight*.25){e.scrollIntoView({block:'center'})}rd.cv=cv;mqSetCur(cv,false)},ms)});
  }).observe(document.getElementById('app'),{childList:true,subtree:true});
})();

/* إخفاء رأس القارئ تلقائيًا بعد فترة قصيرة؛ يُجدَّد بعد كل تنقّل. يتوقف إن كانت النوافذ أو القوائم مفتوحة */
var mpChromeT=0;
function mpArmChromeHide(){
  clearTimeout(mpChromeT);
  if(tab!=='reader'||!rd)return;
  mpChromeT=setTimeout(function(){
    var o=document.getElementById('rd-ov');if(!o||tab!=='reader'||!rd)return;
    if(document.getElementById('mp-vb')||document.querySelector('#rd-ov .rd-sp')||rd.jump||rd.srch)return;
    o.classList.add('hd-hide');rd.ui=false;
  },2600);
}
window.mpArmChromeHide=mpArmChromeHide;

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
  +'<div class="sg-row"><span class="sg-ic">'+ic('book')+'</span><div class="sg-tx"><b>الرواية</b><small>التبديل يعيد تحميل المصحف بروايتك.</small></div><div class="sg-ctl"><div class="sg-seg">'+seg(!w,'hafs','حفص')+seg(w,'warsh','ورش')+'</div></div></div>'
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
/* ترحيل علامات الصفحات القديمة إلى (سورة،آية أول الصفحة) — تُحفظ الأصلية S.bm لورش دون مساس */
/* وسم رواية العلامة: w=ورش، وغيابه=حفص (سجلات حفص القديمة بلا وسم تبقى صالحة) */
function mqRw(){return isW()?'w':'h'}
function mqBmSet(c,v){S.quran.bm2={c:c,v:v,w:mqRw()}}
function mqBmOn(c,v){var b=S.quran.bm2;return !!(b&&((b.w==='w')===isW())&&b.c===c&&(v===undefined||b.v===v))}
/* يبدّل الرواية (يحمّل ورش عند الحاجة) ويحوّل موضع القارئ المفتوح إلى أول آية في الصفحة نفسها، لأن ترقيم الآيات يختلف بين الروايتين */
/* ترحيل علامات الصفحات القديمة إلى (سورة،آية أول الصفحة) — تُحفظ الأصلية S.bm دون مساس.
   حفص: عند أول فتح. ورش: تمرّ علامات الصفحات (S.bm) على صفحات ورش مرة واحدة عند أول فتح بروايته */
function bmMigrate(){
  var q=S.quran,L=q.bms=Array.isArray(q.bms)?q.bms:[],seen={},ch=false;
  L.forEach(function(x){seen[x.c+':'+x.v+':'+(x.w==='w'?'w':'h')]=1});
  var add=function(w,P){bmList().forEach(function(p){p=+p;if(!(p>=1&&p<=604))return;var r=P[p-1];if(!r)return;var k=r[0]+':'+r[1]+':'+w;if(seen[k])return;seen[k]=1;var o={c:r[0],v:r[1],p:p};if(w==='w')o.w='w';L.push(o);ch=true})};
  if(!q.bmMig){add(isW()?'w':'h',curP());q.bmMig=1;ch=true}
  if(isW()&&!q.bmMigW){add('w',WD().p);q.bmMigW=1;ch=true}
  if(ch)save();
}
function mqBmsHtml(){
  bmMigrate();
  var L=(S.quran.bms||[]).filter(function(x){return (x.w==='w')===isW()});if(!L.length)return '';
  return '<h4 style="margin:14px 0 6px">العلامات المرجعية</h4><div class="mpj-m">'+L.map(function(x){return '<button class="chip" data-a="qbmsgo" data-v="'+x.c+':'+x.v+':'+(x.w==='w'?'w':'h')+'">'+esc(QD().n[x.c-1])+' · آية '+ar(x.v)+'</button>'}).join('')+'</div>';
}
/* إعدادات القراءة (قارئ التدفق): خط القرآن وخط التفسير بمعاينة حية + آخر موضع قراءة ومسحه */
function mqClrOpen(){
  var old=document.getElementById('mq-cbd');if(old)old.remove();
  var d=document.createElement('div');d.id='mq-cbd';d.className='mq-mbd';
  d.innerHTML='<div class="mq-cdlg" role="alertdialog" aria-modal="true"><b>مسح موضع القراءة؟</b><p>سيُحذف موضع قراءتك المحفوظ وعلامتك المرجعية.</p><div class="mq-cda"><button class="btn" data-mqc="no">إلغاء</button><button class="btn mq-danger" data-mqc="ok">مسح</button></div></div>';
  d.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});
  d.addEventListener('click',function(e){
    if(e.target===d||e.target.closest('[data-mqc="no"]')){d.remove();return}
    if(e.target.closest('[data-mqc="ok"]')){d.remove();S.quran.bm2=null;save();toast('تم مسح موضع القراءة');render()}
  });
  document.body.appendChild(d);
}
function tfSz(){return Math.max(16,Math.min(38,S.quran.tfs||16))}
function mqReadSet(){
  var q=S.quran,fs=Math.max(18,Math.min(40,qFs())),tfs=tfSz(),bm=q.bm2;
  return '<section class="card mq-rs"><h3>إعدادات القراءة</h3>'
  +'<div class="mq-rs-row"><b>خط القرآن</b><div class="step"><button class="ib" data-a="qfs" data-v="-2" aria-label="تصغير خط القرآن"'+(fs<=18?' disabled':'')+'>'+ic('minus')+'</button><b>'+ar(fs)+'</b><button class="ib" data-a="qfs" data-v="2" aria-label="تكبير خط القرآن"'+(fs>=40?' disabled':'')+'>'+ic('plus')+'</button></div></div>'
  +'<div class="mq-rs-pv mq-pv-q" lang="ar" dir="rtl" style="font-size:'+fs+'px">الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</div>'
  +'<div class="mq-rs-row"><b>خط التفسير</b><div class="step"><button class="ib" data-a="qtfs" data-v="-2" aria-label="تصغير خط التفسير"'+(tfs<=16?' disabled':'')+'>'+ic('minus')+'</button><b>'+ar(tfs)+'</b><button class="ib" data-a="qtfs" data-v="2" aria-label="تكبير خط التفسير"'+(tfs>=38?' disabled':'')+'>'+ic('plus')+'</button></div></div>'
  +'<div class="mq-rs-pv" lang="ar" dir="rtl" style="font-size:'+tfs+'px">أي: الحمد لله ربّ العالمين — نموذج لنص التفسير</div>'
  +'<div class="mq-rs-row"><b>آخر موضع قراءة</b><span class="mq-rs-val">'+(bm?'سورة '+esc(QD().n[bm.c-1])+' — الآية '+ar(bm.v):'لا يوجد')+'</span></div>'
  +(bm?'<button class="btn block mq-rs-clr" data-a="qbm2clr">مسح موضع القراءة</button>':'')
  +'</section>';
}
/* بانر متوهج بعد تبديل الرواية يؤكد للمستخدم أين هو */
function qwBanner(riw){
  var old=document.getElementById('riwbanner');if(old)old.remove();
  var d=document.createElement('div');d.id='riwbanner';d.className='riw-banner';
  d.innerHTML=ic('sparkles')+' أنت الآن على رواية '+(riw==='warsh'?'ورش':'حفص');
  document.body.appendChild(d);
  setTimeout(function(){d.classList.add('out');setTimeout(function(){if(d.parentNode)d.remove()},420)},1600);
}
