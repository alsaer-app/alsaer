/* ===== شاشة التسميع على صفحة المصحف (إعادة تصميم التلاوة والتسميع — المرحلة ١) =====
   تبويب «التلاوة والتسميع» نفسه بنطاق صفحة مصحف كاملة بدل سورة/آية، بشكل مستوحى من ترتيل.
   المحرّكات (rcNorm/rcFeed/rcHyp/rcResult/SherpaAsr/TfEngine) بلا تغيير في قواعدها —
   الجديد هنا: مصدر الكلمات (سطور المصحف من window.MUSHAF) وشكل العرض فقط.
   خريطة الصفحة←الكلمات يحرصها tests/mushaf_wordmap_regression.py على الصفحات الـ604 كلها. */
var rp={page:0,html:'',err:false,jump:false,list:false};
/* توحيد كلمة المصحف للمطابقة: إزالة علامات ألوان التجويد (PUA) ثم rcNorm نفسها */
function rpClean(t){return String(t||'').replace(/[\uE000-\uE005\uE0FF]/g,'')}
/* فرق رسم موثّق: مصحف المدينة يكتب «دَائِرَ ةٌ» في 5:52 كلمتين وتنزيل كلمة واحدة؛
   نعرضها كما في المصحف لكن نحسبها كلمة منطقية واحدة كي تتطابق النوافذ الصوتية والمطابقة.
   الشكل: {سورة:آية: {فهرس_الكلمة_في_الآية: عدد_الكلمات_المدموجة}} — انظر الاختبار */
var RP_MERGE={'5:52':{11:2}};
/* بناء كلمات الصفحة ورسمها في مسار واحد: كلمات rc.w وspans بترتيب واحد مضمون التطابق */
function rpBuild(p){
  var MU=window.MUSHAF,D=QD();if(!MU||!D.p||!D.p[p-1])return null;
  var st={c:D.p[p-1][0],v:D.p[p-1][1],wi:0},words=[],html=[];
  MU.p[p-1].forEach(function(l){
    if(l[0]==='h'){st.c=+l[1];st.v=1;st.wi=0;html.push('<div class="ml hd"><span>سورة '+esc(D.n[l[1]-1])+'</span></div>');return}
    if(l[0]==='b'){html.push('<div class="ml bs"><span>'+esc(D.s[0][0])+'</span></div>');return}
    var toks=l[1].split(' '),spans=[],ti,tk,dv,disp,g,gi,n;
    for(ti=0;ti<toks.length;ti++){
      tk=toks[ti];if(!tk)continue;
      dv=' data-v="'+st.c+':'+st.v+'"';
      if(tk.charCodeAt(0)===0xE0F0){ /* علامة نهاية آية: تحمل رقم الآية التي تُنهيها */
        spans.push('<span class="mw rcm"'+dv+'>'+mTok(tk)+'</span>');
        st.v++;st.wi=0;if(D.s[st.c-1]&&st.v>D.s[st.c-1].length){st.c++;st.v=1}
        continue;
      }
      var mg=RP_MERGE[st.c+':'+st.v];g=(mg&&mg[st.wi])||1;
      disp=tk;for(gi=1;gi<g;gi++)disp+=' '+toks[ti+gi];ti+=g-1;st.wi+=g;
      n=rcNorm(rpClean(disp));if(!n)continue;
      words.push({t:disp,n:n,a:st.v,c:st.c});
      spans.push('<span class="mw rcw"'+dv+'>'+mTok(disp)+'</span>');
    }
    html.push('<div class="ml"><div class="mi">'+spans.join(' ')+'</div></div>');
  });
  return {words:words,html:html.join('')};
}
function rpLoad(p){
  var b=rpBuild(p);if(!b||!b.words.length)return false;
  rp.page=p;rp.html=b.html;
  rc.sura=b.words[0].c;rc.ay=0;rc.pgScope=p;rc.w=b.words;rc.st=[];rc.hd=[];rc.pos=0;rc.ok=0;rc.miss=0;rc.hear='';rc.res=null;rc.wk=-1;rc.u=null;rc.hlog=[];rc.fin=false;
  rc.muq=b.words.some(function(x){return !!RC_MUQ[x.n]});
  try{var P=rcPref();P.pg=p;save()}catch(e){}
  try{S.quran.last=p;save()}catch(e){}
  /* تسخين النموذج المحلي مبكرًا كما في rcLoad */
  return true;
}
/* تقليب الصفحات: أثناء التسميع أول تقليبة تُنهي الجلسة وتُظهر نتيجتها، والتالية تنقل فعليًا */
function rpGo(n){
  n=Math.max(1,Math.min(604,n));
  if(n===rp.page)return;
  if(rc.on){rcFinish();return}
  rcStop();try{rcAsrStop()}catch(e){}
  rp.err=false;rp.jump=false;
  if(rpLoad(n))rc.msg='';
}
function rpErrHtml(){
  var items=[],i;
  if(rc.res)items=rc.res.weak;
  else{for(i=0;i<rc.w.length;i++)if(rc.st[i]===2)items.push({i:i,sim:0})}
  if(!items.length)return '<p class="note">لا كلمات متخطاة حتى الآن'+(rc.on?'':' — ابدأ التسميع بالميكروفون')+'.</p>';
  var h='<div class="rc-wks">'+items.slice(0,60).map(function(x){return '<button class="rc-wk'+(x.sim===0?' miss':'')+(rc.wk===x.i?' on':'')+'" data-a="rcwk" data-v="'+x.i+'">'+mTok(rc.w[x.i].t)+'</button>'}).join('')+'</div>';
  if(rc.wk>=0&&rc.w[rc.wk]){var w=rc.w[rc.wk];h+='<div class="rc-wd"><b>'+mTok(w.t)+'</b><small>'+(rc.st[rc.wk]===1?'سمعناها: «'+esc(rc.hd[rc.wk]||'')+'»':'لم نسمع هذه الكلمة أو تخطّيتها')+'</small></div>'}
  return h;
}
function rpAct(a,v){
  if(a==='rpbm'){var B=bmList(),i=B.indexOf(rp.page);if(i>=0)B.splice(i,1);else B.push(rp.page);save();try{hapGo([30])}catch(e){}return false}
  if(a==='rpjump'){rp.jump=!rp.jump;return false}
  if(a==='rpgo'){
    var g=function(x){return parseInt((document.getElementById(x)||{}).value,10)},t=0;
    if(v==='p')t=g('rpj-p');else if(v==='s')t=suraPage(g('rpj-s'));else if(v==='j')t=mpJuzPage(g('rpj-j'));
    if(!(t>=1&&t<=604)){toast('اكتب رقم صفحة بين ١ و٦٠٤');return true}
    rp.jump=false;rpGo(t);window.scrollTo(0,0);return false;
  }
  if(a==='rplist'){rp.list=!rp.list;return false}
  if(a==='rpsura'){var tp2=suraPage(parseInt(v,10));rp.list=false;if(tp2>=1&&tp2<=604)rpGo(tp2);return false}
  if(a==='rppg'){rpGo(rp.page+(parseInt(v,10)||0));return false}
  if(a==='rperr'){rp.err=!rp.err;return false}
  if(a==='rpset'){rc.adv=true;rc.stat=false;return false}
  if(a==='rpstat'){rc.stat=true;rc.adv=false;return false}
  if(a==='rpclose'){rp.list=false;rc.adv=false;rc.stat=false;rp.jump=false;rp.err=false;return false}
  return false;
}
/* الشاشة نفسها — تحل محل vRecite القديمة (المحفوظة vReciteOld لمرحلة لاحقة) */
function vRecite(){
  var D=QD(),MU=window.MUSHAF;
  if(!D.n||!D.n.length)return '<section class="card"><p class="note">تعذّر تحميل نص المصحف.</p></section>';
  if(!MU){try{loadHeavy(function(){if(tab==='recite')render()})}catch(e){}return '<section class="card"><p class="note">جارٍ تجهيز المصحف…</p></section>'}
  var P=rcPref(),last=P.hist[P.hist.length-1];
  if(!rp.page)rp.page=Math.max(1,Math.min(604,P.pg||S.quran.last||1));
  if(rc.pgScope!==rp.page||!rp.html){
    /* رابط القارئ المحفوظ: «سمّع» من آية محددة (ضغطة مطوّلة) — نفتح صفحتها ونقف عند أول كلمة فيها */
    var c0=rc.sura,a0=rc.ay;
    if(!rc.pgScope&&a0>0&&c0>0){
      var tp=mpVerPage(c0,a0);
      if(rpLoad(tp)){
        for(var qi=0;qi<rc.w.length;qi++)if(rc.w[qi].c===c0&&rc.w[qi].a===a0){rc.pos=qi;break}
        setTimeout(function(){try{mpHl(c0+':'+a0)}catch(e){}},450);
      }
    }else rpLoad(rp.page);
  }
  var p=rp.page,m=MU.m[p-1],tj=S.quran.tj!==false,bm=bmHas(p),sn=esc(D.n[m[2]-1]);(MU.p[p-1]||[]).some(function(l){if(l[0]==='h'){sn=esc(D.n[l[1]-1]);return true}return false});
  var SV=function(d){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>'};
  var I_BACK='<path d="M9 5l7 7-7 7"/>',I_LIST='<path d="M4 6h16M4 12h16M4 18h10"/>',I_SRCH='<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',I_GEAR=IC.gear,
      I_PREV='<path d="M9 5l7 7-7 7"/>',I_NEXT='<path d="M15 5l-7 7 7 7"/>',I_REP='<path d="M4 12a8 8 0 0114-5.3L20 9M20 4v5h-5M20 12a8 8 0 01-14 5.3L4 15M4 20v-5h5"/>';
  return '<div class="rp">'
   +'<div class="rp-t"><button class="rp-ib" data-a="goback" data-v="more" aria-label="رجوع">'+SV(I_BACK)+'</button>'
   +'<div class="rp-ttl"><b>'+sn+'</b><small>صفحة '+ar(p)+' · جزء '+ar(m[0])+' · حزب '+ar(m[1])+'</small></div>'
   +'<button class="rp-ib" data-a="rpbm" aria-pressed="'+bm+'" aria-label="علامة">'+(bm?'★':'☆')+'</button>'
   +'<button class="rp-ib" data-a="rplist" aria-label="قائمة السور">'+SV(I_LIST)+'</button>'
   +'<button class="rp-ib" data-a="rpjump" aria-label="انتقال سريع">'+SV(I_SRCH)+'</button>'
   +'<button class="rp-ib" data-a="rpset" aria-label="إعدادات التسميع">'+SV(I_GEAR)+'</button></div>'
   +'<div class="mp'+(tj?'':' notj')+'" id="mp"><div class="mp-in">'
   +'<div class="mp-l'+(P.hifz?' rc-hifz':'')+'" id="rc-text" style="visibility:hidden">'+rp.html+'</div></div></div>'
   +'<div class="rp-dock">'
   +'<p class="rc-hear rp-hear" id="rc-hear">'+(rc.hear?esc(rc.hear):(rc.on?'تلُ الآن… أسمعك':'اضغط الميكروفون وابدأ التسميع'))+'</p>'
   +'<div id="rc-status" class="rc-status'+(rc.busy?' busy':'')+(rc.msg?'':' empty')+'">'+esc(rc.msg)+'</div>'
   +'<div class="rp-chips"><span class="rp-cnt">صحيح <b id="rc-ok">'+ar(rc.ok)+'</b></span><span class="rp-cnt">متخطّى <b id="rc-miss">'+ar(rc.miss)+'</b></span>'
   +'<button class="rp-b'+(rp.err?' on':'')+'" data-a="rperr" aria-expanded="'+rp.err+'">أخطاء</button><button class="rp-b'+(tj?' on':'')+'" data-a="qtj" aria-pressed="'+tj+'">تجويد</button><button class="rp-b'+(P.hifz?' on':'')+'" data-a="rchifz" aria-pressed="'+!!P.hifz+'">إخفاء</button></div>'
   +'<div class="rp-nav"><button class="rp-pg" data-a="rppg" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+SV(I_NEXT)+'<small>التالية</small></button>'
   +'<button class="rp-pg rp-rep" data-a="rcagain" aria-label="إعادة التسميع من أول الصفحة">'+SV(I_REP)+'<small>إعادة</small></button>'
   +'<button class="rc-mic rp-fab'+(rc.on?' on':'')+(rc.busy?' busy':'')+'" data-a="rcstart" aria-label="'+(rc.on?'إنهاء التسميع':'ابدأ التسميع')+'">'+ic('mic')+'</button>'
   +'<button class="rp-pg" data-a="rplist" aria-label="قائمة السور">'+SV(I_LIST)+'<small>السور</small></button>'
   +'<button class="rp-pg" data-a="rppg" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+SV(I_PREV)+'<small>السابقة</small></button></div></div>'
   +(rc.consentAsk?'<div class="rp-ov"><div class="rp-ov-in"><section class="card rc-consent"><h4>🔒 قبل أن نبدأ</h4><p class="note">التسميع في هذه النسخة التجريبية يستخدم تعرّف الكلام في أندرويد (Google): قد يُرسَل صوتك إلى خدمة Google عبر الإنترنت ليتحوّل إلى نص، ولا يحفظ تطبيق «السائر» أي تسجيل. الميكروفون يعمل فقط أثناء شاشة التسميع ويتوقف عند الخروج أو بعد دقيقتين صمت.</p><div class="acts"><button class="btn" data-a="rcconsent">أوافق وأبدأ</button><button class="btn ghost" data-a="rcconsentno">ليس الآن</button></div></section></div></div>':'')
   +(rc.res?'<div class="rp-ov"><div class="rp-ov-in rp-sh">'+rcResHtml()+'</div></div>':'')
   +(rp.list?'<div class="rp-ov"><div class="rp-ov-in"><div class="rp-ovh"><b>السور</b><button class="rp-ib" data-a="rplist" aria-label="إغلاق">✕</button></div><div class="rp-sl">'+D.n.map(function(nm,i){return '<button class="rp-si'+(i+1===m[2]?' on':'')+'" data-a="rpsura" data-v="'+(i+1)+'"><em>'+ar(i+1)+'</em><b>'+esc(nm)+'</b><small>'+ar(suraPage(i+1))+'</small></button>'}).join('')+'</div></div></div>':'')
   +(rp.err?'<div class="rp-ov"><div class="rp-ov-in"><div class="rp-ovh"><b>كلمات تحتاج مراجعة</b><button class="rp-ib" data-a="rperr" aria-label="إغلاق">✕</button></div>'+rpErrHtml()+'</div></div>':'')
   +(rp.jump?'<div class="rp-ov"><div class="rp-ov-in"><div class="rp-ovh"><b>انتقال سريع</b><button class="rp-ib" data-a="rpjump" aria-label="إغلاق">✕</button></div>'
     +'<div class="mpj-r"><label>الصفحة<input id="rpj-p" class="qd-i" type="number" inputmode="numeric" min="1" max="604" placeholder="'+ar(p)+'"></label><button class="btn" data-a="rpgo" data-v="p">اذهب</button></div>'
     +'<div class="mpj-r"><label>السورة<select id="rpj-s" class="qd-i">'+D.n.map(function(nm,i){return '<option value="'+(i+1)+'">'+ar(i+1)+' · '+esc(nm)+'</option>'}).join('')+'</select></label><button class="btn" data-a="rpgo" data-v="s">اذهب</button></div>'
     +'<div class="mpj-r"><label>الجزء<select id="rpj-j" class="qd-i">'+Array.apply(null,Array(30)).map(function(_,i){return '<option value="'+(i+1)+'">الجزء '+ar(i+1)+'</option>'}).join('')+'</select></label><button class="btn" data-a="rpgo" data-v="j">اذهب</button></div>'
     +'</div></div>':'')
   +(rc.adv||rc.stat?'<div class="rp-ov"><div class="rp-ov-in"><div class="rp-ovt"><button class="rp-b'+(rc.adv?' on':'')+'" data-a="rpset">الإعدادات</button><button class="rp-b'+(rc.stat?' on':'')+'" data-a="rpstat">الإحصائيات</button><button class="rp-ib" data-a="rpclose" aria-label="إغلاق">✕</button></div>'+(rc.adv?rcSheet(P,last):rcStatSheet(P))+'</div></div>':'')
   +(window.ReciteASR?'':'<p class="note rc-warn rp-warn">التعرّف على الصوت غير متاح في هذه النسخة.</p>')
   +'</div>';
}
/* تقليب الصفحة بالسحب: يمينًا = السابقة، يسارًا = التالية (كالمصحف الورقي) */
(function(){
  var st=null;
  function inCtl(t){return t.closest&&t.closest('.rp-t,.rp-dock,.rp-ov,.mp-vb')}
  document.addEventListener('touchstart',function(e){
    st=null;if(tab!=='recite'||!window.MUSHAF||!rp.page||!e.touches||e.touches.length!==1||inCtl(e.target))return;
    st={x:e.touches[0].clientX,y:e.touches[0].clientY};
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!st)return;var s=st;st=null;
    var x=(e.changedTouches&&e.changedTouches[0])?e.changedTouches[0].clientX:s.x;
    var y=(e.changedTouches&&e.changedTouches[0])?e.changedTouches[0].clientY:s.y;
    var dx=x-s.x,dy=y-s.y;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){
      rpGo(rp.page+(dx>0?-1:1));
      try{render()}catch(e){}
      window.scrollTo(0,0);
    }
  },{passive:true});
})();
