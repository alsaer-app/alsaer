/* ===== مصدر الصوت لشاشة «التلاوة» =====
   تعرّف الكلام في أندرويد (Google): على الجهاز إن توفّر (أندرويد 13+ مع حزمة عربية)، وإلا تُرسَل الصوت لخدمة Google.
   تجربة بموافقة المستخدم. محرك V4 المحلي أُزيل (متاح في تاريخ git: exp/recite-judge). */
(function(){try{var md=navigator.mediaDevices;if(md&&md.getUserMedia&&!md.__alsaerWrap){var og=md.getUserMedia.bind(md);window.__alsaerStreams=[];md.getUserMedia=function(c){return og(c).then(function(st){window.__alsaerStreams.push(st);return st})};md.__alsaerWrap=1}}catch(e){}})();
function rcKillStreams(){try{(window.__alsaerStreams||[]).forEach(function(st){try{st.getTracks().forEach(function(t){t.stop()})}catch(e){}});window.__alsaerStreams=[]}catch(e){}}
var rcAsr={rec:null,nat:null};
/* ---- تعرّف أندرويد/Google (على الجهاز إن توفّر، وإلا خدمة Google عبر الإنترنت) ---- */
/* ---- التعرّف الأصلي لأندرويد (خدمة Google): فوري ولا يحتاج تنزيل نموذج ---- */
function rcNatOk(){
  try{return window.AlsaerNative&&typeof AlsaerNative.speechAvailable==='function'&&typeof AlsaerNative.speechStart==='function'&&AlsaerNative.speechAvailable()}catch(e){return false}
}
window.__rcNat=function(t,d){
  var n=rcAsr.nat;if(!n||n.dead)return;
  if(t==='stopped'){n.dead=true;rcAsr.nat=null;n.onErr('أُوقف الميكروفون تلقائيًا لأنك غادرت التطبيق. اضغط ابدأ للمتابعة.');return}
  if(t==='err'){
    var cd=parseInt(String(d).replace(/\D/g,''),10)||0;
    if(cd===12||cd===13){n.dead=true;rcAsr.nat=null;n.onErr('اللغة العربية غير مدعومة في خدمة التعرّف على هذا الهاتف.');return}
    var MS={1:'انقطاع الاتصال بالإنترنت',2:'لا يوجد اتصال بالإنترنت',3:'مشكلة في التقاط الصوت',4:'خدمة Google لم تستجب',5:'خطأ في خدمة التعرّف',9:'الإذن غير ممنوح للميكروفون',10:'الخدمة مشغولة',11:'انقطعت خدمة Google',idle:'لم نسمع تلاوة لفترة طويلة'};
    if(cd!==9&&d!=='idle'&&(rcAsr.nr||0)<3){
      rcAsr.nr=(rcAsr.nr||0)+1;n.dead=true;rcAsr.nat=null;n.say('إعادة تشغيل الاستماع… ('+ar(rcAsr.nr)+')',true);
      setTimeout(function(){if(!rcAsr.nat&&!rcAsr.stopped)rcNatStart(n.onText,n.onErr,n.say)},700);return}
    n.dead=true;rcAsr.nat=null;
    n.onErr(cd===9?'لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.':'توقّف الاستماع: '+(MS[cd]||MS[d]||'خطأ '+d)+'. اضغط ابدأ لإعادة المحاولة.');return}
  if(t==='ready'){n.say('تلُ الآن… أسمعك',false);return}
  if(t==='p'||t==='f'){
    var alts;try{alts=JSON.parse(d)}catch(e){alts=[String(d||'')]}
    if(!Array.isArray(alts))alts=[String(alts||'')];
    alts=alts.map(function(x){return String(x||'').trim()}).filter(Boolean);
    if(alts.length){rcAsr.nr=0;n.onText(alts,t==='f')}
    else if(t==='f')n.onText([],true);
    if(t==='f'){try{if(window.__rcBias&&AlsaerNative.speechBias)AlsaerNative.speechBias(JSON.stringify(window.__rcBias()))}catch(e){}}
  }
};
function rcNatStart(onText,onErr,say){
  var md=navigator.mediaDevices,gen={dead:false,n:0,onText:onText,onErr:onErr,say:say};
  rcAsr.nat=gen;
  /* getUserMedia هنا لطلب إذن الميكروفون فقط (يظهر الطلب عبر التطبيق) ثم نحرّره فورًا ليأخذه التعرّف الأصلي */
  var perm=(md&&md.getUserMedia)?md.getUserMedia({audio:true}).then(function(st){st.getTracks().forEach(function(t){t.stop()})}):Promise.resolve();
  perm.then(function(){
    if(rcAsr.nat!==gen||gen.dead)return;
    say('جارٍ تشغيل التعرّف…',true);
    setTimeout(function(){if(rcAsr.nat===gen&&!gen.dead){var bj='[]';try{bj=JSON.stringify(window.__rcBias?window.__rcBias():[])}catch(e){}
      try{if(AlsaerNative.speechOnDevice)AlsaerNative.speechOnDevice(true)}catch(e){}
      try{var PM=(typeof rcPref==='function')?rcPref():{};if(AlsaerNative.speechMute)AlsaerNative.speechMute(PM.beep!==false)}catch(e){}
      if(AlsaerNative.speechStart2)AlsaerNative.speechStart2(bj);else AlsaerNative.speechStart()}},250);
  }).catch(function(e){
    gen.dead=true;rcAsr.nat=null;
    onErr('لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.');
  });
}

function rcAsrStop(){rcAsr.stopped=true;
  if(rcAsr.nat){rcAsr.nat.dead=true;rcAsr.nat=null;try{AlsaerNative.speechStop()}catch(e){}}
}
var RC_NOASR='التعرّف الصوتي غير متاح أو تعذّر تشغيله. تأكد من الإنترنت ومن تفعيل «خدمات Google الصوتية» في إعدادات الهاتف ثم أعد المحاولة.';
window.ReciteASR={
  start:function(onText,onErr,say){
    say=say||function(){};
    rcAsrStop();rcAsr.stopped=false;rcAsr.nr=0;
    if(rcNatOk())rcNatStart(onText,onErr,say);else onErr(RC_NOASR);
  },
  stop:function(){rcAsrStop()}
};
/* لا كتم لصوت الهاتف بعد الآن (كان سبب مشاكل كثيرة). الدالة تبقى لإعادة أي صوت بقي مكتومًا من نسخ قديمة فقط. */
function rcSilence(on){
  try{if(rcAsr.restored||!window.AlsaerNative||typeof AlsaerNative.speechSilent!=='function')return;rcAsr.restored=true;AlsaerNative.speechSilent(false)}catch(e){}
}
function rcLeave(){rcSilence(false);rcKillStreams();if(rcAsr.nat||(typeof rc!=='undefined'&&rc.on)){try{rcStop()}catch(e){}try{rcAsrStop()}catch(e){}try{render()}catch(e){}}}
document.addEventListener('visibilitychange',function(){if(document.hidden)rcLeave();else if(typeof tab!=='undefined'&&tab==='recite'){rcSilence(true);try{render()}catch(e){}}});
window.addEventListener('pagehide',rcLeave);window.__rcLeave=function(){try{rcLeave()}catch(e){}};
window.addEventListener('blur',function(){if(document.hidden)rcLeave()});
