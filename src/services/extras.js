/* ===== قضاء ما فاتك + النسخ الاحتياطي اليدوي ===== */
var QD_ROWS=[['f','الفجر','s'],['d','الظهر','s'],['a','العصر','s'],['m','المغرب','s'],['i','العشاء','s'],['w','الوتر','s'],['s','أيام الصيام','d']];
function qdGet(){var q=S.qada;if(!q||typeof q!=='object'||Array.isArray(q))q=S.qada={};QD_ROWS.forEach(function(r){var n=parseInt(q[r[0]],10);q[r[0]]=(n>=0&&n<=99999)?n:0});return q}
function qdTotal(){var q=qdGet();return QD_ROWS.reduce(function(t,r){return t+q[r[0]]},0)}
function vQada(){
  var q=qdGet(),tot=qdTotal(),done=parseInt(q.done,10)||0;
  var rows=QD_ROWS.map(function(r){
    return '<div class="qd-row"><div class="qd-n"><b>'+r[1]+'</b><small>'+(r[2]==='d'?'يوم':'صلاة')+'</small></div>'
     +'<button class="qd-b" data-a="qdchg" data-v="'+r[0]+':-1" aria-label="قضيت" '+(q[r[0]]?'':'disabled')+'>'+ic('check')+'<span>قضيت</span></button>'
     +'<input class="qd-i" type="number" inputmode="numeric" min="0" max="99999" data-qd="'+r[0]+'" value="'+q[r[0]]+'" aria-label="'+r[1]+'">'
     +'<button class="qd-b add" data-a="qdchg" data-v="'+r[0]+':1" aria-label="أضف">'+ic('plus')+'</button></div>'}).join('');
  return '<div class="qd"><section class="qd-hero"><small>المتبقّي عليك</small><b id="qd-tot">'+ar(tot)+'</b><span>تم قضاء <b id="qd-done">'+ar(done)+'</b> بفضل الله</span></section>'
   +'<section class="card"><p class="note" style="margin-top:0">اكتب عدد ما فاتك في كل خانة، وكلما قضيت واحدًا اضغط «قضيت». تُحفظ الأرقام على هاتفك فقط.</p>'+rows+'</section></div>';
}
function qdPaint(){var q=qdGet(),t=document.getElementById('qd-tot');if(t)t.textContent=ar(qdTotal());var d=document.getElementById('qd-done');if(d)d.textContent=ar(parseInt(q.done,10)||0);
  var bs=document.querySelectorAll('.qd-b:not(.add)');QD_ROWS.forEach(function(r,i){if(bs[i])bs[i].disabled=!q[r[0]]});
  QD_ROWS.forEach(function(r){var el=document.querySelector('[data-qd="'+r[0]+'"]');if(el&&document.activeElement!==el)el.value=q[r[0]]})}
document.addEventListener('change',function(e){var t=e.target;if(t&&t.getAttribute&&t.hasAttribute('data-qd')){var k=t.getAttribute('data-qd'),q=qdGet(),n=Math.max(0,Math.min(99999,parseInt(t.value,10)||0));q[k]=n;save();qdPaint()}});

/* ----- النسخ الاحتياطي ----- */
var BK_KEEP=['pin','security','biometric','lockDelay','lockType'],bkText='',bkMsg='',bkConfirm=false,bkIn='';
function bkBuild(){
  var c=JSON.parse(JSON.stringify(S));BK_KEEP.forEach(function(k){delete c[k]});
  var rem=null;try{rem=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'null')}catch(e){}
  return JSON.stringify({app:'alsaer',v:1,at:Date.now(),S:c,rem:rem});
}
function bkCopy(txt){
  try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(txt).then(function(){return true},function(){return bkCopyOld(txt)})}catch(e){}
  return Promise.resolve(bkCopyOld(txt));
}
function bkCopyOld(txt){try{var ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();return !!ok}catch(e){return false}}
function bkApply(raw){
  var o;try{o=JSON.parse(String(raw||'').trim())}catch(e){return 'الملف غير صالح (ليس بصيغة النسخة الاحتياطية).'}
  if(!o||o.app!=='alsaer'||!o.S||typeof o.S!=='object'||Array.isArray(o.S))return 'هذا ليس ملف نسخة احتياطية من «السائر إلى الله».';
  var keep={};BK_KEEP.forEach(function(k){if(S[k]!==undefined)keep[k]=S[k]});
  var n;try{n=fixShape(Object.assign(def(),o.S))}catch(e){return 'تعذّرت قراءة البيانات.'}
  BK_KEEP.forEach(function(k){delete n[k]});Object.assign(n,keep);n.onboarded=true;
  saveOff=true;if(saveTm){clearTimeout(saveTm);saveTm=0}
  try{localStorage.setItem(KEY,JSON.stringify(n))}catch(e){saveOff=false;return 'تعذّر الحفظ: قد تكون مساحة التخزين ممتلئة.'}
  try{if(window.AlsaerNative&&AlsaerNative.mirrorSet)AlsaerNative.mirrorSet(KEY,JSON.stringify(n))}catch(e){} /* حدّث النسخة الاحتياطية المحلية فور الاسترجاع */
  if(o.rem&&typeof o.rem==='object'&&!Array.isArray(o.rem)){try{localStorage.setItem('alsaer_daily_reminders_v1',JSON.stringify(o.rem))}catch(e){}}
  setTimeout(function(){location.reload()},400);
  return '';
}
function bkAgo(t){
  var d=Math.floor((Date.now()-t)/864e5);
  if(d<=0)return 'اليوم';
  if(d===1)return 'أمس';
  if(d===2)return 'منذ يومين';
  if(d<=10)return 'منذ '+ar(d)+' أيام';
  return 'منذ '+ar(d)+' يومًا';
}
function vBackup(){
  var ago=S.bkAt?('آخر نسخة احتياطية: <b>'+bkAgo(S.bkAt)+'</b>'+(Date.now()-S.bkAt>7*864e5?' — يُستحسن تصدير نسخة جديدة.':'')):'لم تصدّر أي نسخة احتياطية بعد — ابدأ الآن.';
  return '<div class="bk"><section class="card"><h3>نسخة احتياطية بيدك</h3><p class="note">بياناتك محفوظة على هذا الهاتف فقط. صدِّرها إلى ملف أو نص واحفظه حيث تشاء (درايف أو ملاحظاتك أو رسالة لنفسك)، واستورده متى احتجت. لا تتضمن النسخةُ رمزَ القفل.</p><p class="note">'+ago+'</p>'

   +'<div class="acts"><button class="btn" data-a="bkexport">'+ic('check')+' تصدير بياناتي</button></div>'
   +(bkText?'<textarea id="bk-out" class="bk-ta" readonly rows="5" dir="ltr">'+esc(bkText)+'</textarea><div class="acts"><button class="btn ghost" data-a="bkcopy">نسخ النص</button></div>':'')
   +'</section><section class="card"><h3>استيراد</h3><p class="note">الصق نص النسخة الاحتياطية أو اختر الملف. سيحلّ محلّ بياناتك الحالية.</p>'
   +'<textarea id="bk-in" class="bk-ta" rows="4" dir="ltr" placeholder="الصق النص هنا">'+esc(bkIn)+'</textarea>'
   +'<label class="btn ghost bk-file">اختيار ملف<input id="bk-file" type="file" accept=".json,application/json,text/plain" hidden></label>'
   +'<div class="acts"><button class="btn'+(bkConfirm?' bad':'')+'" data-a="bkimport">'+(bkConfirm?'تأكيد الاستبدال الآن':'استيراد')+'</button></div></section>'
   +(bkMsg?'<p class="note bk-msg" id="bk-msg">'+esc(bkMsg)+'</p>':'')+'</div>';
}
function bkSay(t){bkMsg=t;var q=document.getElementById('bk-msg');if(q)q.textContent=t;else try{render()}catch(e){}}
document.addEventListener('input',function(e){var t=e.target;if(t&&t.id==='bk-in')bkIn=t.value});
document.addEventListener('change',function(e){var t=e.target;if(t&&t.id==='bk-file'&&t.files&&t.files[0]){var r=new FileReader();r.onload=function(){var ta=document.getElementById('bk-in');if(ta){ta.value=bkIn=String(r.result||'');bkConfirm=false;bkSay('قُرئ الملف. اضغط «استيراد» ثم «تأكيد».')}};r.onerror=function(){bkSay('تعذّرت قراءة الملف.')};r.readAsText(t.files[0])}});
function extraAct(a,v){
  if(a==='qdchg'){var p=String(v).split(':'),k=p[0],d=parseInt(p[1],10)||0,q=qdGet();
    if(d<0&&q[k]>0){q[k]--;q.done=(parseInt(q.done,10)||0)+1;hapGo([40])}else if(d>0&&q[k]<99999)q[k]++;
    save();qdPaint();return true}
  if(a==='bkexport'){
    bkText=bkBuild();bkMsg='';bkConfirm=false;S.bkAt=Date.now();save();
    var done=false;
    try{var f=new File([bkText],'alsaer-backup-'+dk()+'.json',{type:'application/json'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'نسخة السائر الاحتياطية'}).then(function(){bkSay('تمت المشاركة. احفظ الملف في مكان آمن.')},function(){});done=true}}catch(e){}
    if(!done)bkCopy(bkText).then(function(ok){bkSay(ok?'نُسخ النص إلى الحافظة — الصقه في مكان آمن (ملاحظات أو درايف).':'انسخ النص من الصندوق أدناه واحفظه في مكان آمن.')});
    return false}
  if(a==='bkcopy'){bkCopy(bkText).then(function(ok){bkSay(ok?'تم نسخ النص.':'تعذّر النسخ التلقائي؛ حدّد النص في الصندوق وانسخه.')});return true}
  if(a==='bkimport'){
    var ta=document.getElementById('bk-in'),raw=ta?ta.value:bkIn;bkIn=raw;
    if(!raw.trim()){bkSay('الصق النص أو اختر ملفًا أولًا.');return true}
    if(!bkConfirm){bkConfirm=true;bkSay('سيحلّ هذا محلّ بياناتك الحالية. اضغط «تأكيد الاستبدال الآن» للمتابعة.');return false}
    bkConfirm=false;var er=bkApply(raw);if(er){bkSay(er);return false}bkIn='';
    bkSay('تم الاستيراد، جارٍ إعادة التشغيل…');return true}
  return false;
}
