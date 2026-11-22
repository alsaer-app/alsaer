/* ===== كشف الأخطاء والفحص الذاتي =====
   1) يلتقط أخطاء JavaScript والوعود المرفوضة وفشل تحميل الموارد ويحفظ آخر ٤٠ في التخزين المحلي.
   2) render() لا يترك شاشة بيضاء إن فشلت شاشة: يعرض بطاقة خطأ ويسجّل السبب.
   3) شاشة «فحص التطبيق»: تشغّل فحوصًا داخلية (تخزين، نص المصحف، كل الشاشات، الجسر الأصلي، النموذج) وتنسخ تقريرًا يمكن إرساله للمطوّر. */
var DG_KEY='alsaer_errlog_v1',dgRes=null,dgRunning=false;
function dgRead(){try{var a=JSON.parse(localStorage.getItem(DG_KEY)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function dgLog(kind,msg,where){
  try{
    var a=dgRead(),m=String(msg&&msg.message||msg||'').slice(0,300),k=kind+'|'+m+'|'+(where||''),last=a[a.length-1];
    if(last&&last.k===k){last.n=(last.n||1)+1;last.t=Date.now()}
    else a.push({t:Date.now(),k:k,kind:kind,m:m,w:String(where||'').slice(0,120),n:1,tab:(typeof tab!=='undefined'?tab:'')});
    while(a.length>40)a.shift();
    localStorage.setItem(DG_KEY,JSON.stringify(a));
  }catch(e){}
}
try{
  window.addEventListener('error',function(ev){
    if(ev&&ev.target&&ev.target!==window&&(ev.target.src||ev.target.href)){dgLog('resource','تعذّر تحميل: '+String(ev.target.src||ev.target.href).slice(-80));return}
    dgLog('js',ev&&ev.message,((ev&&ev.filename)||'').split('/').pop()+':'+(ev&&ev.lineno||''));
  },true);
  window.addEventListener('unhandledrejection',function(ev){dgLog('promise',ev&&ev.reason)});
}catch(e){}
function vRenderFail(e,t){
  return '<section class="card dg-fail"><h3>⚠ تعذّر عرض هذه الشاشة</h3><p class="note">حدث خطأ غير متوقع، وسُجّل في «فحص التطبيق». بقية التطبيق يعمل.</p>'
   +'<p class="note dg-m">'+esc(String(e&&e.message||e||'').slice(0,160))+'</p>'
   +'<div class="acts"><button class="btn" data-a="tab" data-v="home">الرئيسية</button><button class="btn ghost" data-a="tab" data-v="diag">فحص التطبيق</button></div></section>';
}
function dgViews(){
  return {home:vHome,worship:vWorship,calendar:vCal,progress:vProgress,more:vMore,fasting:vFasting,prayers:vPrayers,quran:vQuran,reminders:vReminders,books:vBooks,chal:vChal,month:vMonth,sacred:vSacred,muh:vMuh,floatfeed:vFloatFeed,floatset:vFloatSet,widgetset:vWidgetSet,habits:vHabits,boost:vBoost,ach:vAch,developer:vDeveloper,settings:vSettings,qada:vQada,ramadan:vRamadan,occasions:vOccasions,cards:vCards,hifz:vHifz,khushu:vKhushu,khatma:vKhatma,weekly:vWeekly,notes:vNotes,zakat:vZakat,backup:vBackup,msb:vMsb,asma:vAsma,hisn:vHisn,ahadith:vAhadith,ptloc:vPtLoc};
}
function dgCheck(){
  var R=[],t0;
  function add(n,ok,d,warn){R.push({n:n,ok:ok,d:d||'',w:!!warn})}
  /* التخزين */
  try{
    localStorage.setItem('alsaer_dg_t','1');var ok=localStorage.getItem('alsaer_dg_t')==='1';localStorage.removeItem('alsaer_dg_t');
    var kb=Math.round(JSON.stringify(S).length/1024),tot=0,k;for(k in localStorage)if(Object.prototype.hasOwnProperty.call(localStorage,k))tot+=(localStorage[k]||'').length+k.length;
    var tkb=Math.round(tot*2/1024);
    add('التخزين المحلي',ok,'بياناتك '+kb+' ك.ب · كل المخزَّن ≈ '+tkb+' ك.ب (الحد الأقصى ≈ ٥٠٠٠ ك.ب)',tkb>3500);
  }catch(e){add('التخزين المحلي',false,String(e&&e.message||e))}
  /* نص المصحف */
  try{var Q=QD();add('نص المصحف',!!(Q&&Q.n&&Q.n.length===114),Q&&Q.n?('عدد السور '+Q.n.length):'غير محمّل')}catch(e){add('نص المصحف',false,String(e&&e.message||e))}
  /* كل الشاشات */
  var V=dgViews(),bad=[],cnt=0,slow=[],nm;
  for(nm in V){
    cnt++;
    if(typeof V[nm]!=='function'){bad.push(nm+': غير معرّفة');continue}
    t0=Date.now();
    try{var h=V[nm]();if(typeof h!=='string'||h.length<20)bad.push(nm+': ناتج فارغ')}catch(e){bad.push(nm+': '+String(e&&e.message||e).slice(0,70))}
    if(Date.now()-t0>400)slow.push(nm+' '+(Date.now()-t0)+'ms');
  }
  add('الشاشات ('+cnt+')',!bad.length,bad.length?bad.join(' | '):'كلها تُبنى دون أخطاء'+(slow.length?' (بطيئة: '+slow.join('، ')+')':''),!bad.length&&slow.length>0);
  /* الجسر الأصلي */
  var N=window.AlsaerNative;
  if(!N)add('الجسر الأصلي (أندرويد)',true,'غير موجود — أنت في متصفح، الميزات الأصلية (التذكيرات) لا تعمل هنا',true);
  else{
    var need=['appBuildInfo'],miss=need.filter(function(x){return typeof N[x]!=='function'});
    add('الجسر الأصلي (أندرويد)',!miss.length,miss.length?('دوال ناقصة: '+miss.join('، ')):'متصل');
  }
  add('الإنترنت',true,navigator.onLine?'متصل':'غير متصل',!navigator.onLine);
  var er=dgRead().filter(function(x){return Date.now()-x.t<86400000});
  add('أخطاء آخر ٢٤ ساعة',!er.length,er.length?(er.length+' نوع — راجع السجل أدناه'):'لا يوجد');
  return R;
}
function dgReport(){
  var L=['تقرير فحص «السائر إلى الله»  v'+(typeof APP_VERSION!=='undefined'?APP_VERSION:'')+' ('+(typeof APP_BUILD!=='undefined'?APP_BUILD:'')+')','التاريخ: '+new Date().toLocaleString('en-GB'),'الجهاز: '+navigator.userAgent.slice(0,140),''];
  (dgRes||dgCheck()).forEach(function(r){L.push((r.ok?(r.w?'⚠ ':'✅ '):'❌ ')+r.n+' — '+r.d)});
  var lg=dgRead();L.push('','سجل الأخطاء ('+lg.length+'):');
  lg.slice(-15).forEach(function(x){L.push('['+new Date(x.t).toLocaleString('en-GB')+'] '+x.kind+' ×'+x.n+' @'+x.tab+' '+x.w+' :: '+x.m)});
  return L.join('\n');
}
function vDiag(){
  if(!dgRes)dgRes=dgCheck();
  var bad=dgRes.filter(function(r){return !r.ok}).length,warn=dgRes.filter(function(r){return r.ok&&r.w}).length;
  var head='<section class="card dg-sum '+(bad?'bad':warn?'warn':'ok')+'"><b>'+(bad?'❌ '+ar(bad)+' مشكلة تحتاج انتباهًا':warn?'⚠ يعمل مع '+ar(warn)+' ملاحظة':'✅ كل شيء سليم')+'</b><small>آخر فحص: '+new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'})+'</small></section>';
  var rows='<section class="card"><h4>نتائج الفحص</h4>'+dgRes.map(function(r){return '<div class="dg-r '+(r.ok?(r.w?'w':'g'):'b')+'"><i>'+(r.ok?(r.w?'⚠':'✓'):'✕')+'</i><span><b>'+esc(r.n)+'</b><small>'+esc(r.d)+'</small></span></div>'}).join('')+'</section>';
  var lg=dgRead().slice().reverse();
  var log='<section class="card"><h4>سجل الأخطاء</h4>'+(lg.length?lg.slice(0,15).map(function(x){return '<div class="dg-l"><small>'+new Date(x.t).toLocaleString('ar-EG')+' · '+esc(x.kind)+(x.n>1?' ×'+ar(x.n):'')+(x.tab?' · '+esc(x.tab):'')+'</small><span>'+esc(x.m)+'</span></div>'}).join(''):'<p class="note">لا أخطاء مسجّلة 🎉</p>')+'</section>';
  var acts='<div class="acts dg-acts"><button class="btn" data-a="dgrun">إعادة الفحص</button><button class="btn ghost" data-a="dgcopy">نسخ التقرير</button>'+(lg.length?'<button class="btn ghost" data-a="dgclear">مسح السجل</button>':'')+'</div>';
  return '<div class="dg">'+head+acts+rows+log+'</div>';
}
function dgAct(a){
  if(a==='dgrun'){dgRes=dgCheck();toast('تم الفحص');return false}
  if(a==='dgclear'){try{localStorage.removeItem(DG_KEY)}catch(e){}dgRes=null;toast('تم مسح السجل');return false}
  if(a==='dgcopy'){
    var t=dgReport();
    try{navigator.clipboard.writeText(t).then(function(){toast('نُسخ التقرير — الصقه في رسالة للمطوّر')},function(){dgCopyFallback(t)})}catch(e){dgCopyFallback(t)}
    return true;
  }
  return false;
}
function dgCopyFallback(t){try{var x=document.createElement('textarea');x.value=t;x.style.cssText='position:fixed;opacity:0';document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();toast('نُسخ التقرير')}catch(e){toast('تعذّر النسخ')}}
try{if(/alsaertest/.test(location.search)&&window.__T)window.__T.dg={dgLog:dgLog,dgRead:dgRead,dgCheck:dgCheck,dgViews:dgViews}}catch(e){}
