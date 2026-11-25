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
var BK_KEEP=['pin','security','biometric','lockDelay','lockType'],bkMsg='';
function bkBuild(){
  var c=JSON.parse(JSON.stringify(S));BK_KEEP.forEach(function(k){delete c[k]});
  var rem=null;try{rem=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'null')}catch(e){}
  return JSON.stringify({app:'alsaer',v:1,at:Date.now(),S:c,rem:rem});
}
function bkCopyOld(txt){try{var ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();return !!ok}catch(e){return false}}
function bkApply(raw){
  var o;try{o=JSON.parse(String(raw||'').trim())}catch(e){return 'الملف غير صالح (ليس بصيغة النسخة الاحتياطية).'}
  if(!o||o.app!=='alsaer'||!o.S||typeof o.S!=='object'||Array.isArray(o.S)){
    /* صيغة قديمة: حالة التطبيق كاملة (قبل صيغة {app:'alsaer'}) — تُقبل حتى لا تضيع نسخ المستخدمين القدامى */
    if(o&&typeof validBackup==='function'&&validBackup(o)){
      var n0;try{n0=fixShape(Object.assign(def(),o))}catch(e){return 'تعذّرت قراءة البيانات.'}
      if(n0.pin!==null&&typeof n0.pin!=='string'&&(!n0.pin||n0.pin.type!=='pbkdf2-sha256'||typeof n0.pin.salt!=='string'||typeof n0.pin.hash!=='string'))return 'النسخة غير صالحة أو ناقصة؛ لم تتغير بياناتك';
      n0.onboarded=true;n0.updatedAt=Date.now();
      saveOff=true;if(saveTm){clearTimeout(saveTm);saveTm=0}
      try{localStorage.setItem(KEY,JSON.stringify(n0))}catch(e){saveOff=false;return 'تعذّر الحفظ: قد تكون مساحة التخزين ممتلئة.'}
      try{if(window.AlsaerNative&&AlsaerNative.mirrorSet)AlsaerNative.mirrorSet(KEY,JSON.stringify(n0))}catch(e){}
      S=n0;mem=n0;setTimeout(function(){location.reload()},400);
      return '';
    }
    return 'هذا ليس ملف نسخة احتياطية من «السائر إلى الله».';
  }
  if(!validBackup(o.S))return 'النسخة غير صالحة أو ناقصة؛ لم تتغير بياناتك';
  var keep={};BK_KEEP.forEach(function(k){if(S[k]!==undefined)keep[k]=S[k]});
  var n;try{n=fixShape(Object.assign(def(),o.S))}catch(e){return 'تعذّرت قراءة البيانات.'}
  BK_KEEP.forEach(function(k){delete n[k]});Object.assign(n,keep);n.onboarded=true;n.updatedAt=Date.now();
  saveOff=true;if(saveTm){clearTimeout(saveTm);saveTm=0}
  var previousRem;try{previousRem=localStorage.getItem('alsaer_daily_reminders_v1')}catch(e){saveOff=false;return 'تعذّر قراءة الإعدادات الحالية؛ أُوقفت الاستعادة.'}
  try{if(o.rem&&typeof o.rem==='object'&&!Array.isArray(o.rem))localStorage.setItem('alsaer_daily_reminders_v1',JSON.stringify(o.rem));localStorage.setItem(KEY,JSON.stringify(n))}catch(e){try{if(previousRem===null)localStorage.removeItem('alsaer_daily_reminders_v1');else localStorage.setItem('alsaer_daily_reminders_v1',previousRem)}catch(rollback){}saveOff=false;return 'تعذّر الحفظ: قد تكون مساحة التخزين ممتلئة.'}
  try{if(window.AlsaerNative&&AlsaerNative.mirrorSet)AlsaerNative.mirrorSet(KEY,JSON.stringify(n))}catch(e){} /* حدّث النسخة الاحتياطية المحلية فور الاسترجاع */

  S=n;mem=n;setTimeout(function(){location.reload()},400);
  return '';
}
function gdDriveCard(st,disabled){
  var linked=gdHasRt(),em=gdEmail();
  var h='<section class="sg-card gd-dest"><div class="gd-head"><b>Google Drive</b><span class="sg-pill">'+(linked?'مربوط':'غير مربوط')+'</span></div>';
  if(!linked){
    return h+'<div class="gd-hero"><span class="gd-hero-ic">'+ic('cloud')+'</span><b>احمِ نسختك في Google Drive</b></div>'
      +'<p class="note gd-c">نسخ مؤرخة ترجع على هذا الهاتف أو أي هاتف آخر، حتى بعد إعادة التثبيت. لا يرى التطبيق إلا الملفات التي ينشئها.</p>'
      +'<button class="btn block" data-a="gdconnect"'+disabled+'>'+ic('cloud')+' ربط Google Drive</button></section>';
  }
  var ini=(em||'؟').trim().charAt(0);
  return h+'<div class="gd-hero"><span class="gd-hero-ic">'+ic('clup')+'</span><b>نسختك محفوظة في Google Drive</b></div>'
    +'<div class="gd-acct"><span class="gd-ava">'+esc(ini)+'</span><div class="gd-acct-tx"><b>حساب Google</b><span class="dm-email" dir="ltr">'+esc(em)+'</span></div><span class="gd-dot">● متصل</span></div>'
    +'<div class="gd-stats"><div class="gd-stat">'+ic('clup')+'<span>آخر رفع ناجح</span><b>'+esc(gdDate(st.driveAt))+'</b></div>'
    +'<div class="gd-stat">'+ic('dl')+'<span>آخر استعادة ناجحة</span><b>'+esc(gdDate(st.driveRestoreAt))+'</b></div></div>'
    +'<div class="gd-col">'+gdBtn('up','نسخ الآن',false,disabled)+gdBtn('down','استعادة من Drive',true,disabled)+gdProgBar()+'</div>'
    +'<div class="gd-pair"><button class="btn ghost" data-a="gdconnect"'+disabled+'>'+ic('refresh')+' ربط حساب جديد</button>'
    +'<button class="btn ghost bad" data-a="gddisc"'+disabled+'>'+ic('x')+' '+(gdDiscArm?'تأكيد فك الارتباط':'فك الارتباط')+'</button></div>'
    +'<button class="btn ghost bad block gd-delete" data-a="gddelete"'+disabled+'>حذف نسخ السائر من Drive</button>'
    +'<p class="note">فك الارتباط يطلب تأكيدًا ولا يحذف ملفات النسخ من Drive. تُحفظ كل النسخ المؤرخة دون حذف تلقائي. يصل التطبيق إلى الملفات التي أنشأها أو أُتيحت له فقط.</p></section>';
}
function vBackup(){
 if(typeof gdPendingNotice==='function')gdPendingNotice();
 var p=gdPrefs(),st=gdStatus(),disabled=gdBusy||gdDocPending||gdPicker||gdRestoreRaw||gdNativePending?' disabled':'';
 var h='<div class="bk drive-mock"><section class="sg-card"><div class="panel dm-intro"><span class="sg-ic">'+ic('cloud')+'</span><b>نسختك في أكثر من مكان</b><p class="note">نسخ مؤرخة على Google Drive، وملف مستقل تختار مكانه. احتفظ بالملف على جهاز أو خدمة أخرى للحماية عند فقد الهاتف.</p></div><div class="sg-row"><span class="sg-ic">'+ic('lock')+'</span><div class="sg-tx"><b>تشفير النسخة بكلمة مرور</b><small>اختياري، احفظ كلمة المرور خارج الهاتف</small></div><div class="sg-ctl"><label class="rm-sw"><input type="checkbox" data-gd-encrypt '+((p.encrypt||gdPwOpen)?'checked':'')+disabled+'><i></i></label></div></div><div class="sg-row"><span class="sg-ic">'+ic('bell')+'</span><div class="sg-tx"><b>نسخ تلقائي إلى Drive</b><small>عند فتح التطبيق بعد مرور المدة، وليس أثناء إغلاقه</small></div><div class="sg-ctl"><button class="dm-period" data-a="gdauto"'+disabled+'>'+(p.auto?'كل ٧ أيام':'متوقف')+'</button></div></div>'+gdPasswordPanel()+'</section>';
 h+=gdDriveCard(st,disabled);
 h+='<section class="sg-card gd-dest"><div class="gd-head"><b>ملف مستقل خارج التطبيق</b><span class="sg-pill">'+(st.fileAt?'حُفظ ملف':'لم يُحفظ بعد')+'</span></div><p class="note">اختر مكان الحفظ من ملفات Android. يمكن حفظ الملف دون إنترنت أو حساب Google.</p><div class="gd-status"><b>آخر حفظ ناجح</b><span>'+esc(gdDate(st.fileAt))+'</span><b>آخر استعادة ناجحة من ملف</b><span>'+esc(gdDate(st.fileRestoreAt))+'</span></div><div class="dm-actions"><button class="btn" data-a="gdfileout"'+disabled+'>حفظ ملف نسخة</button><button class="btn ghost" data-a="gdfilein"'+disabled+'>استعادة من ملف</button></div><p class="note">الحفظ على الهاتف وحده لا يحمي من فقده. انقل نسخة إلى جهاز أو خدمة أخرى. منتقي الملفات يعرض المواقع التي تتيحها خدمات ملفاتك، لا نفحصها تلقائيًا.</p></section>';
 h+='<section class="sg-card gd-dest"><b>نسخة الأمان داخل التطبيق</b><p class="note">تساعد عند خطأ الاستعادة، لكنها تُحذف مع التطبيق. لا نعدّها بديلًا للملف المستقل.</p></section><p class="note bk-msg" id="bk-msg"'+(bkMsg?'':' hidden')+'>'+esc(bkMsg)+'</p>'+gdPickerPanel()+gdRestorePanel()+'</div>';return h;
}
function bkDirty(){var d=false;try{[].forEach.call(document.querySelectorAll('#app input,#app textarea,body > input,body > textarea'),function(el){if((el.type==='text'||el.type==='number'||el.type==='search'||el.type==='tel'||el.type==='email'||el.type==='password'||el.tagName==='TEXTAREA')&&el.value!==el.defaultValue)d=true})}catch(e){}return d}
function bkSay(t){bkMsg=t;var msg=document.querySelector('.gd-dialog-msg');if(msg)msg.textContent=t;var q=document.getElementById('bk-msg');if(q){q.textContent=t;q.hidden=!t}else if(!bkDirty())try{render()}catch(e){}}
function extraAct(a,v){
  if(a.indexOf('gd')===0){return gdAct(a,v)}
  if(a==='qdchg'){var p=String(v).split(':'),k=p[0],d=parseInt(p[1],10)||0,q=qdGet();
    if(d<0&&q[k]>0){q[k]--;q.done=(parseInt(q.done,10)||0)+1;hapGo([40])}else if(d>0&&q[k]<99999)q[k]++;
    save();qdPaint();return true}
  return false;
}
