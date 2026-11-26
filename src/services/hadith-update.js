function cleanHadithText(v){
  if(typeof v==='string')return v.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
  if(v&&typeof v==='object')return cleanHadithText(v.arabic||v.ar||v.text||v.content||'');
  return '';
}
/* مفتاح «شوهد» مشتق من رقم الإصدار: يتجدد تلقائيًا مع كل إصدار ولا ينسى طرفاه أبدًا */
function updateSeenKey(){return 'alsaer_seen_update_'+String(APP_VERSION).replace(/\D/g,'')}
/* «ما الجديد»: تظهر مرة واحدة بعد التحديث (أول تشغيل لكل versionCode)، وتقرأ أحدث مدخل في سجل الإصدارات.
   التثبيت الأول يُسجَّل بصمت دون عرض. */
var WN_KEY='alsaer_wn_build';
function wnGet(){try{return localStorage.getItem(WN_KEY)}catch(e){return null}}
function wnSet(v){try{localStorage.setItem(WN_KEY,String(v))}catch(e){}}
function wnInit(){if(wnGet()!==null)return;wnSet(S&&S.onboarded?'0':String(parseInt(APP_BUILD,10)||0))}
function wnMarkSeen(){wnSet(String(parseInt(APP_BUILD,10)||0))}
function wnLatest(){
  var raw=(typeof RL_RAW==='string'?RL_RAW:'').split('</p>')[0].replace(/^<p>/,'');
  var m=/^<b>([^<]*?)(?:\s·\s([^<]*))?<\/b><br>([\s\S]*)$/.exec(raw);
  if(!m)return null;
  var items=m[3].split(/\.\s+/).map(function(x){return x.replace(/<[^>]*>/g,'').replace(/\.$/,'').trim()}).filter(Boolean);
  return {ver:m[1],tag:m[2]||'',items:items};
}
function wnShouldShow(){
  if(!unlocked||!S.onboarded)return false;
  var b=parseInt(APP_BUILD,10)||0,last=parseInt(wnGet(),10);
  if(isNaN(last))return false;
  return b>last;
}
function renderFirstUpdateNotice(){
  var old=document.getElementById('update109-notice');
  if(!wnShouldShow()){if(old)old.remove();return}
  if(old)return;
  var L=wnLatest();if(!L||!L.items.length){wnMarkSeen();return}
  var wrap=document.createElement('div');wrap.id='update109-notice';wrap.className='update109-backdrop';
  wrap.innerHTML='<section class="update109-card" role="dialog" aria-modal="true" aria-labelledby="update109-title"><h2 id="update109-title">ما الجديد في السائر؟</h2><div class="ver">الإصدار '+esc(APP_VERSION)+(L.tag?' · '+esc(L.tag):'')+'</div><ul>'+L.items.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul><p class="free-note">تطبيق السائر إلى الله مجاني بالكامل</p><button class="btn" data-a="update109Done">متابعة إلى التطبيق</button><button class="btn ghost block" style="margin-top:8px" data-a="wnlog">عرض سجل الإصدارات كاملًا</button></section>';
  document.body.appendChild(wrap);
}
