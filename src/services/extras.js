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
var BK_KEEP=['pin','security','biometric','lockDelay','lockType'],bkText='',bkMsg='',bkConfirm=false,bkIn='',bkMode='';
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
  if(!o||o.app!=='alsaer'||!o.S||typeof o.S!=='object'||Array.isArray(o.S)){
    /* صيغة قديمة: حالة التطبيق كاملة (قبل صيغة {app:'alsaer'}) — تُقبل حتى لا تضيع نسخ المستخدمين القدامى */
    if(o&&typeof validBackup==='function'&&validBackup(o)){
      var n0;try{n0=fixShape(Object.assign(def(),o))}catch(e){return 'تعذّرت قراءة البيانات.'}
      if(n0.pin!==null&&typeof n0.pin!=='string'&&(!n0.pin||n0.pin.type!=='pbkdf2-sha256'||typeof n0.pin.salt!=='string'||typeof n0.pin.hash!=='string'))return 'النسخة غير صالحة أو ناقصة؛ لم تتغير بياناتك';
      n0.onboarded=true;
      saveOff=true;if(saveTm){clearTimeout(saveTm);saveTm=0}
      try{localStorage.setItem(KEY,JSON.stringify(n0))}catch(e){saveOff=false;return 'تعذّر الحفظ: قد تكون مساحة التخزين ممتلئة.'}
      try{if(window.AlsaerNative&&AlsaerNative.mirrorSet)AlsaerNative.mirrorSet(KEY,JSON.stringify(n0))}catch(e){}
      setTimeout(function(){location.reload()},400);
      return '';
    }
    return 'هذا ليس ملف نسخة احتياطية من «السائر إلى الله».';
  }
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
function bkRow(a,icon,title,desc,val){return '<button type="button" class="sg-row sg-btn" data-a="'+a+'"'+(a==='bkmode'?' data-v="'+val+'"':'')+'><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div><div class="sg-ctl">'+ic('chev').replace('class="i"','class="i chev"')+'</div></button>'}
function vGdRows(){
  if(!gdConfigured())return '';
  var h='<div class="sg-t">Google Drive</div><div class="sg-card">';
  if(!gdHasRt()){
    h+='<div class="sg-row"><span class="sg-ic">'+ic('cloud')+'</span><div class="sg-tx"><b>النسخة السحابية</b><small>ملف واحد في درايف لا يرى التطبيق غيره — استعده على أي جهاز</small></div><div class="sg-ctl"><span class="sg-pill">غير مربوط</span></div></div>'
      +'<div class="panel"><button class="btn block" data-a="gdconnect">'+ic('cloud')+' ربط Google Drive</button></div>';
  }else{
    h+='<div class="sg-row lit"><span class="sg-ic">'+ic('cloud')+'</span><div class="sg-tx"><b>النسخة السحابية</b><small>'+(S.gdAt?'آخر رفع: '+bkAgo(S.gdAt):'لم ترفع نسخة بعد')+'</small></div><div class="sg-ctl"><span class="sg-pill ok">مربوط ✓</span></div></div>'
      +'<div class="panel"><div class="acts" style="margin:2px 0"><button class="btn'+(gdBusy?' dis':'')+'" data-a="gdup">رفع نسخة الآن</button>'
      +'<button class="btn ghost'+(gdBusy?' dis':'')+'" data-a="gddown">تنزيل آخر نسخة</button>'
      +'<button class="btn ghost" data-a="gddisc">فصل الحساب</button></div></div>';
  }
  return h+'</div>';
}
function vBackup(){
  var rr={};try{rr=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'{}')}catch(e){}
  var ago=S.bkAt?('آخر نسخة: <b>'+bkAgo(S.bkAt)+'</b>'):'لم تصدّر أي نسخة بعد';
  var h='<div class="bk">'
   +'<div class="okcard"><span class="oki">'+ic('shield')+'</span><div><b>'+ago+'</b><small>بياناتك على جهازك ولا تتضمن النسخة رمز القفل'+(S.bkAt&&Date.now()-S.bkAt>7*864e5?' · يُستحسن تصدير نسخة جديدة':'')+'</small></div></div>'
   +'<div class="sg-t">على هذا الجهاز</div><div class="sg-card">'
   +bkRow('bkmode','lock','تصدير نسخة مشفّرة','ملف واحد تحفظه أين تشاء (موصى به)','export')
   +(bkMode==='export'?'<div class="panel"><p class="note" style="margin-top:0">كلمة المرور تحمي النسخة؛ لا يمكن استرجاعها بدونها.</p><input type="password" id="bk-pw" autocomplete="off" placeholder="كلمة مرور (٦ أحرف فأكثر)" style="margin:0 0 8px"><button class="btn block" data-a="bkexenc">'+ic('check')+' تصدير مشفّر</button>'+(bkText?'<textarea id="bk-out" class="bk-ta" readonly rows="5" dir="ltr" style="margin-top:8px">'+esc(bkText)+'</textarea><button class="btn ghost block" data-a="bkcopy" style="margin-top:6px">نسخ النص</button>':'')+'</div>':'')
   +bkRow('bkmode','up','استيراد نسخة','من ملف أو نص — تظهر خياراته عند الحاجة فقط','import')
   +(bkMode==='import'?'<div class="panel"><textarea id="bk-in" class="bk-ta" rows="4" dir="ltr" placeholder="الصق نص النسخة هنا">'+esc(bkIn)+'</textarea><input type="password" id="bk-pw" autocomplete="off" placeholder="كلمة المرور (للنسخة المشفّرة فقط)" style="margin:8px 0"><div class="acts"><label class="btn ghost bk-file">اختيار ملف<input id="bk-file" type="file" accept=".json,.txt,application/json,text/plain" hidden></label><button class="btn'+(bkConfirm?' bad':'')+'" data-a="bkimport">'+(bkConfirm?'تأكيد الاستبدال الآن':'استيراد')+'</button></div><p class="note">سيحلّ محلّ بياناتك الحالية بعد التأكيد.</p></div>':'')
   +'</div>'
   +vGdRows()
   +'<div class="sg-t">تذكير</div><div class="sg-card"><div class="sg-row'+(rr.backup?' lit':'')+'"><span class="sg-ic">'+ic('bell')+'</span><div class="sg-tx"><b>تذكير أسبوعي بالنسخ</b><small>كل جمعة مساءً</small></div><div class="sg-ctl"><label class="rm-sw"><input type="checkbox" data-rem-toggle="backup" '+(rr.backup?'checked':'')+'><i></i></label></div></div></div>'
   +'<p class="note bk-msg" id="bk-msg"'+(bkMsg?'':' hidden')+'>'+esc(bkMsg)+'</p></div>';
  return h;
}
function bkSay(t){bkMsg=t;var q=document.getElementById('bk-msg');if(q){q.textContent=t;q.hidden=!t}else try{render()}catch(e){}}
document.addEventListener('input',function(e){var t=e.target;if(t&&t.id==='bk-in')bkIn=t.value});
document.addEventListener('change',function(e){var t=e.target;if(t&&t.id==='bk-file'&&t.files&&t.files[0]){var r=new FileReader();r.onload=function(){var ta=document.getElementById('bk-in');if(ta){ta.value=bkIn=String(r.result||'');bkConfirm=false;bkSay('قُرئ الملف. اضغط «استيراد» ثم «تأكيد».')}};r.onerror=function(){bkSay('تعذّرت قراءة الملف.')};r.readAsText(t.files[0])}});
function extraAct(a,v){
  if(a.indexOf('gd')===0){return gdAct(a)}
  if(a==='qdchg'){var p=String(v).split(':'),k=p[0],d=parseInt(p[1],10)||0,q=qdGet();
    if(d<0&&q[k]>0){q[k]--;q.done=(parseInt(q.done,10)||0)+1;hapGo([40])}else if(d>0&&q[k]<99999)q[k]++;
    save();qdPaint();return true}
  if(a==='bkmode'){bkMode=(bkMode===v)?'':v;bkMsg='';bkConfirm=false;return false}
  if(a==='bkexenc'){
    var pw=(document.getElementById('bk-pw')||{}).value||'';
    if(pw.length<6){bkSay('كلمة مرور النسخة يجب ألا تقل عن ٦ أحرف. احفظها جيدًا؛ لا يمكن استرجاع النسخة بدونها.');return true}
    bkEncrypt(bkBuild(),pw).then(function(et){
      bkText=et;S.bkAt=Date.now();save();
      var done=false;
      try{var f=new File([et],'alsaer-backup-'+dk()+'.txt',{type:'text/plain'});
        if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'نسخة السائر المشفّرة'}).then(function(){bkSay('تمت المشاركة. احفظ الملف وكلمة المرور في مكان آمن.')},function(){});done=true}}catch(e){}
      if(!done)bkCopy(et).then(function(ok){bkSay(ok?'نُسخت النسخة المشفّرة — احفظها مع كلمة المرور في مكان آمن.':'انسخ النص من الصندوق واحفظه مع كلمة المرور في مكان آمن.')});
      try{render()}catch(e){}
    },function(){bkSay('تعذّر التشفير على هذا الجهاز')});
    return true}
  if(a==='bkcopy'){bkCopy(bkText).then(function(ok){bkSay(ok?'تم نسخ النص.':'تعذّر النسخ التلقائي؛ حدّد النص في الصندوق وانسخه.')});return true}
  if(a==='bkimport'){
    var ta=document.getElementById('bk-in'),raw=ta?ta.value:bkIn;bkIn=raw;
    if(!raw.trim()){bkSay('الصق النص أو اختر ملفًا أولًا.');return true}
    var bb=document.querySelector('[data-a=bkimport]');
    if(!bkConfirm){bkConfirm=true;bkSay('سيحلّ هذا محلّ بياناتك الحالية. اضغط «تأكيد الاستبدال الآن» للمتابعة.');
      if(bb){bb.classList.add('bad');bb.textContent='تأكيد الاستبدال الآن'}
      return true} /* بلا إعادة عرض حتى لا يُمحى حقل كلمة المرور */
    bkConfirm=false;
    var bkResetBtn=function(){var b2=document.querySelector('[data-a=bkimport]');if(b2){b2.classList.remove('bad');b2.textContent='استيراد'}};
    var pw2=(document.getElementById('bk-pw')||{}).value||'';
    if(raw.trim().indexOf('ALSAER-ENC1:')===0){
      bkDecrypt(raw.trim(),pw2).then(function(dec){
        var er2=bkApply(dec);if(er2){bkSay(er2);bkResetBtn();return}
        bkIn='';bkSay('تم الاستيراد، جارٍ إعادة التشغيل…');
      },function(){bkSay('كلمة المرور غير صحيحة أو النسخة تالفة؛ لم تتغير بياناتك');bkResetBtn()});
      return true}
    var er=bkApply(raw);if(er){bkSay(er);bkResetBtn();return true}bkIn='';
    bkSay('تم الاستيراد، جارٍ إعادة التشغيل…');return true}
  return false;
}
