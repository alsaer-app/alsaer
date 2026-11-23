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
function mpAct(a,v){
  if(!rd)return true;
  if(a==='qjump'){rd.jump=!rd.jump;return false}
  if(a==='qjgo'){
    var t=0,g=function(i){return parseInt((document.getElementById(i)||{}).value,10)};
    if(v==='p')t=g('mpj-p');else if(v==='s')t=suraPage(g('mpj-s'));else if(v==='j')t=mpJuzPage(g('mpj-j'));else if(v==='q'){var qi=g('mpj-q');t=(typeof RUBP!=='undefined'&&RUBP[qi])||1}else if(v==='l')t=S.quran.last;
    if(!(t>=1&&t<=604)){toast('اكتب رقم صفحة بين ١ و٦٠٤');return true}
    mpSel='';rd.dir=t>rd.page?1:-1;rd.page=t;rd.jump=false;window.scrollTo(0,0);return false;
  }
  return false;
}
/* السحب: يمينًا = الصفحة السابقة، يسارًا = التالية (كالمصحف الورقي العربي) */
var mpSwAt=0;
document.addEventListener('click',function(e){if(mpSwAt&&Date.now()-mpSwAt<700){e.stopPropagation();e.preventDefault()}},true);

/* ---------- ملء الشاشة + البحث عن آية ---------- */
var MP_SV='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>',mpHint=false,mpIdx=null;
function mpImm(){return S.quran.imm!==false&&!!window.MUSHAF}
function mpWrap(main,ctl,p,m){
  if(!mpImm()){var ex=(window.MUSHAF)?'<div class="fsz"><button class="ib" data-a="qsrch">'+MP_SV+'بحث عن آية</button><button class="ib" data-a="qidx">'+ic('doc')+'فهرس السور</button><button class="ib" data-a="qimm">⛶ ملء الشاشة</button></div>':'';return main+ctl+ex+mpSearchPanel()+mpIndexPanel()}
  if(!mpHint&&!S.quran.hint1){mpHint=true;S.quran.hint1=1;save();setTimeout(function(){toast('اضغط مطوّلًا على آية لخياراتها (تفسير · نسخ · علامة)، واضغط مرة لإظهار الأدوات')},500)}
  var CH=ic('chev'),CHL=CH.replace('class="i"','class="i" style="transform:scaleX(-1)"');
  main=main.replace(/<div class="mp-f"><span class="pn">([^<]*)<\/span><\/div>/,function(_,n){return '<div class="mp-f"><button class="mp-fa" data-a="qpage" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+CHL+'</button><span class="pn">'+n+'</span><button class="mp-fa" data-a="qpage" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+CH+'</button></div>'})
   .replace('<div class="mp-h">','<div class="mp-h"><button class="mp-x" data-a="goback" data-v="quran" aria-label="خروج من المصحف">✕</button>');
  var D=QD(),mu=isW()?[(WD().p[p-1]||[])[4]||1,0,(WD().p[p-1]||[1])[0]]:window.MUSHAF.m[p-1],inR=(p>=rd.from&&p<=rd.to),bm=bmHas(p),n=p-rd.from+1;
  var mid=inR?'<span class="rd-pn"><b>'+ar(n)+' / '+ar(rd.to-rd.from+1)+'</b><small>من وردك</small></span>':'<span class="rd-pn"><b>ص '+ar(p)+'</b><small>تصفّح حر</small></span>';
  return main+'<div class="rd-ov'+(rd.ui?' on':'')+'" id="rd-ov"><div class="rd-t"><button class="ib" data-a="goback" data-v="quran" aria-label="رجوع">'+ic('chev')+'</button>'
   +'<div class="rd-ti"><b>سورة '+esc(D.n[mu[2]-1])+'</b><small>الجزء '+ar(mu[0])+' · الحزب '+ar(mu[1])+' · صفحة '+ar(p)+'</small></div>'
   +'<span class="rd-ta"><button class="ib" data-a="qsrch" aria-label="بحث عن آية">'+MP_SV+'</button><button class="ib" data-a="qidx" aria-label="فهرس السور">'+ic('doc')+'</button><button class="ib" data-a="qjump" aria-label="انتقال سريع">☰</button><button class="ib" data-a="mpset" aria-label="خيارات المصحف">'+ic('gear')+'</button></span></div>'
   +'<div class="rd-b"><div class="rd-sl"><small>١</small><input type="range" id="rd-rg" min="1" max="604" value="'+p+'" aria-label="الانتقال بين الصفحات"><small>٦٠٤</small></div>'
   +'<div class="rd-r"><button class="ib bm" data-a="bmtog" aria-pressed="'+bm+'" aria-label="علامة">'+(bm?'★':'☆')+'</button><button class="ib" data-a="qpage" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'</button>'+mid
   +'<button class="ib" data-a="qpage" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+ic('chev')+'</button><button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button></div></div></div>'
   +(rd.jump?'<div class="rd-js"><button class="rd-jx" data-a="qjump" aria-label="إغلاق">✕</button>'+mpJump(p)+'</div>':'')+mpSearchPanel()+mpIndexPanel();
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
  if(a==='qsclose'){rd.srch=false;return false}
  if(a==='qsdo'){rd.sq=((document.getElementById('mps-q')||{}).value||'').trim();rd.sr=rd.sq?mpFind(rd.sq):[];return false}
  if(a==='qsgo'){var t=parseInt(v,10);mpSel='';if(t>=1&&t<=604){rd.dir=t>rd.page?1:-1;rd.page=t}rd.srch=false;rd.ui=false;window.scrollTo(0,0);return false}
  if(a==='qimm'){var on=S.quran.imm!==false;S.quran.imm=!on;if(rd)rd.ui=false;save();toast(on?'العرض مع الأدوات الظاهرة':'وضع ملء الشاشة');return false}
  return false;
}
document.addEventListener('click',function(e){
  if(tab!=='reader'||!rd||!mpImm())return;var t=e.target;
  if(mpSel&&t.closest&&t.closest('#mp')&&!t.closest('[data-a],[data-mp2]')){mpSel='';mpApplySel();return}
  if(t.closest&&t.closest('#mp')&&!(t.closest('[data-a]'))&&!(t.closest('.pgi')&&mpiHit(e.clientX,e.clientY))){var o=document.getElementById('rd-ov');if(o){rd.ui=!rd.ui;o.classList.toggle('on',rd.ui)}}
});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&e.target.id==='mps-q'){e.preventDefault();if(!mpAct2('qsdo')){render();setTimeout(function(){var i=document.getElementById('mps-q');if(i)i.blur()},50)}}});

document.addEventListener('change',function(e){var t=e.target;if(!t||t.id!=='rd-rg'||!rd)return;var n=parseInt(t.value,10);if(n>=1&&n<=604&&n!==rd.page){rd.dir=n>rd.page?1:-1;rd.page=n;rd.ui=true;render()}});

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
  if(document.querySelector('#mp.mpi')){mpHlLast=v;try{mpiPaint(v)}catch(e){}return}
  mpHlLast=v;var L=document.querySelectorAll('#mp .mw.vhl');for(var i=0;i<L.length;i++)L[i].classList.remove('vhl');
  if(!v)return;var W=document.querySelectorAll('#mp .mw[data-v="'+v+'"]');for(var j=0;j<W.length;j++)W[j].classList.add('vhl');
}
function mpVName(v){var q=String(v).split(':');return 'سورة '+QD().n[(+q[0])-1]+' · آية '+ar(+q[1])}
var mpTf={k:'',t:''};
function mpApplySel(){
  var bar=document.getElementById('mp-vb');
  if(tab!=='reader'||!rd||!document.getElementById('mp')){if(bar)bar.remove();mpSel='';return}
  var vm=mpVm(),W=document.querySelectorAll('#mp .mw[data-v]');
  for(var i=0;i<W.length;i++)W[i].classList.toggle('vmk',!!vm[W[i].getAttribute('data-v')]);
  mpHl(mpSel);
  if(!mpSel){if(bar)bar.remove();return}
  if(!bar){bar=document.createElement('div');bar.id='mp-vb';bar.className='mp-vb';document.body.appendChild(bar)}
  var mk=!!vm[mpSel];
  bar.innerHTML='<b>'+esc(mpVName(mpSel))+'</b>'+((mpTf.k===mpSel&&mpTf.t)?'<div class="mp-tf" dir="rtl">'+esc(mpTf.t)+'</div>':'')+'<div class="mp-vbb"><button data-mp2="tf" class="'+(mpTf.k===mpSel?'on':'')+'">تفسير</button><button data-mp2="copy">نسخ</button><button data-mp2="mark" class="'+(mk?'on':'')+'">'+(mk?'★ علامة':'☆ علامة حفظ')+'</button><button data-mp2="share">مشاركة</button><button data-mp2="x" aria-label="إغلاق">✕</button></div>';
}
function mpVerseText(v){var q=String(v).split(':'),t;try{if(isW()&&WD().s[+q[0]-1]&&WD().s[+q[0]-1][+q[1]-1])t=String(WD().s[+q[0]-1][+q[1]-1])}catch(e){}return '﴿'+(t||verseText(+q[0],+q[1]))+'﴾ — '+mpVName(v)}
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
  if(k==='tf'){
    var kk=mpSel;if(mpTf.k===kk){mpTf={k:'',t:''};mpApplySel();return}
    var q8=kk.split(':'),ck='alsaer_tf_'+kk,c0='';try{c0=localStorage.getItem(ck)||''}catch(x){}if(c0)tfTouch(ck)
    mpTf={k:kk,t:c0||'جارٍ تحميل التفسير…'};mpApplySel();
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
  function inCtl(t){return t.closest&&t.closest('.rd-b,.rd-t,.rd-sp,.rd-js,.mp-vb,.mps-wrap')}
  function nextSign(dx){return ((S.quran&&S.quran.dr)==='ltr')?(dx<0?1:-1):(dx>0?1:-1)}
  function wordAt(x,y){if(document.querySelector('#mp.mpi')){var kv=mpiHit(x,y);return kv?{getAttribute:function(){return kv}}:null}var el=document.elementFromPoint(x,y),w=el&&el.closest?el.closest('.mw[data-v]'):null;return (w&&w.closest('#mp'))?w:null}
  function back(el){if(!el)return;el.style.transition='transform .26s cubic-bezier(.2,.9,.3,1.25),opacity .2s';el.style.transform='translateX(0)';el.style.opacity='1';setTimeout(function(){el.style.transition='';el.style.transform='';el.style.opacity=''},300)}
  document.addEventListener('touchstart',function(e){
    st=null;if(tab!=='reader'||!rd||!window.MUSHAF||!e.touches||e.touches.length!==1||inCtl(e.target))return;
    var x=e.touches[0].clientX,y=e.touches[0].clientY,m=document.getElementById('mp');if(!m)return;
    st={x:x,y:y,t:Date.now(),lock:'',lx:x,lt:Date.now(),v:0,el:m.querySelector('.mp-in'),w:m.clientWidth||360};
    mpHl('');
    var w0=wordAt(x,y);
    if(w0){var v0=w0.getAttribute('data-v');st.lp=setTimeout(function(){
      if(!st||st.lock)return;st.fired=1;mpSel=v0;mpHl(v0);var o=document.getElementById('rd-ov');if(o&&rd){rd.ui=false;o.classList.remove('on')}mpHap();mpApplySel();
    },430)}
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!st||!e.touches[0])return;var x=e.touches[0].clientX,y=e.touches[0].clientY,dx=x-st.x,dy=y-st.y,now=Date.now();
    if(now>st.lt){st.v=.6*st.v+.4*((x-st.lx)/(now-st.lt));st.lx=x;st.lt=now}
    var canSwipe=!!(S.quran&&S.quran.sw===true);
    if(!st.lock&&!st.fired){
      if(canSwipe&&Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.15){st.lock='h'}
      else if(Math.abs(dy)>12)st.lock='v';
    }
    if(st.lp&&(Math.abs(dx)>10||Math.abs(dy)>10)){clearTimeout(st.lp);st.lp=0}
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!st)return;var s=st;st=null;if(s.lp)clearTimeout(s.lp);
    if(s.fired){mpSwAt=Date.now();return}
    var x=(e.changedTouches&&e.changedTouches[0])?e.changedTouches[0].clientX:s.lx,dx=x-s.x,dt=Math.max(1,Date.now()-s.t);
    if(s.lock==='h'){
      var ns=nextSign(dx),np=rd.page+ns,fast=Math.abs(s.v)>.45&&Math.abs(dx)>28,far=Math.abs(dx)>s.w*.22;
      if((far||fast)&&np>=1&&np<=604){
        mpSwAt=Date.now();mpHap();
        mpSel='';rd.dir=ns;rd.page=np;rd.ui=false;render();window.scrollTo(0,0);
      }else if(far||fast){mpHap()}
      return;
    }
  },{passive:true});
  document.addEventListener('touchcancel',function(){if(st&&st.lp)clearTimeout(st.lp);st=null;if(!mpSel)mpHl('')},{passive:true});
})();

/* إغلاق النوافذ العائمة للمصحف (خيارات، شريط الآية، بحث، انتقال سريع) — يُستدعى مع زر الرجوع وعند مغادرة القارئ */
function mpCloseOverlays(){
  var c=false,e;
  if((e=document.getElementById('mps-wrap'))){e.remove();c=true}
  if((e=document.getElementById('mpi-ask'))){e.remove();c=true}
  if((e=document.getElementById('mp-vb'))){e.remove();mpSel='';try{mpHl('')}catch(x){}c=true}
  if(rd&&(rd.jump||rd.srch)&&tab==='reader'){rd.jump=false;rd.srch=false;c=true;render()}
  return c;
}
