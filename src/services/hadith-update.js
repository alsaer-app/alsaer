function cleanHadithText(v){
  if(typeof v==='string')return v.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
  if(v&&typeof v==='object')return cleanHadithText(v.arabic||v.ar||v.text||v.content||'');
  return '';
}
/* مفتاح «شوهد» مشتق من رقم الإصدار: يتجدد تلقائيًا مع كل إصدار ولا ينسى طرفاه أبدًا */
function updateSeenKey(){return 'alsaer_seen_update_'+String(APP_VERSION).replace(/\D/g,'')}
function renderFirstUpdateNotice(){
  var key=updateSeenKey(),old=document.getElementById('update109-notice');
  var seen=false;try{seen=localStorage.getItem(key)==='1'}catch(e){seen=false}
  if(!unlocked||!S.onboarded||seen){if(old)old.remove();return}
  if(old)return;
  var wrap=document.createElement('div');wrap.id='update109-notice';wrap.className='update109-backdrop';
  wrap.innerHTML='<section class="update109-card" role="dialog" aria-modal="true" aria-labelledby="update109-title"><h2 id="update109-title">ما الجديد في السائر إلى الله؟</h2><div class="ver">الإصدار '+APP_VERSION+' · جديد</div><ul><li>جولة تعريفية بالتطبيق تُعاد في أي وقت من الإعدادات.</li><li>«المسبحة» صفحة مستقلة بعدّاد وذكر مخصّص وصوت نقر.</li><li>«حصن المسلم» و«أسماء الله الحسنى» و«الأحاديث النبوية» من قائمة المزيد.</li><li>شاشة الصلوات منفصلة مع عدّ تنازلي للصلاة القادمة.</li><li>إصلاحات عامة في الأداء والتصميم.</li></ul><p class="free-note">تطبيق السائر إلى الله مجاني بالكامل</p><button class="btn" data-a="update109Done">متابعة إلى التطبيق</button></section>';
  document.body.appendChild(wrap);
}
