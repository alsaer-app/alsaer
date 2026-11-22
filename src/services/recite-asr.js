/* ===== مصدر الصوت لشاشة «التلاوة» =====
   النموذج القرآني المحلي فقط (sherpa-onnx + نموذج مضبوط على القرآن، يُنزَّل لمرة واحدة).
   لا تعرّف Google ولا Web Speech: قرار المستخدم — جوجل لا يعرف القرآن ولا الحروف المقطعة.
   عند غياب النموذج أو فشله: رسالة خطأ واضحة فقط، بلا أي بديل سحابي. */
(function(){try{var md=navigator.mediaDevices;if(md&&md.getUserMedia&&!md.__alsaerWrap){var og=md.getUserMedia.bind(md);window.__alsaerStreams=[];md.getUserMedia=function(c){return og(c).then(function(st){window.__alsaerStreams.push(st);return st})};md.__alsaerWrap=1}}catch(e){}})();
function rcKillStreams(){try{(window.__alsaerStreams||[]).forEach(function(st){try{st.getTracks().forEach(function(t){t.stop()})}catch(e){}});window.__alsaerStreams=[]}catch(e){}}
var rcAsr={rec:null,nat:null};
/* ---- النموذج القرآني المحلي: دقة قريبة من ترتيل، بلا إنترنت بعد التنزيل، والصوت لا يغادر الهاتف ---- */
function rcLocSt(){try{if(!window.AlsaerNative||typeof AlsaerNative.asrStatus!=='function')return null;return JSON.parse(AlsaerNative.asrStatus()||'{}')}catch(e){return null}}
/* النموذج المختار إن كان منزَّلًا، وإلا أي نموذج منزّل (اختيار ضمني — لا محرك آخر يُقصَد) */
function rcLocKind(){
  try{
    var P=(typeof rcPref==='function')?rcPref():{},st=rcLocSt();if(!st)return null;
    if(P.lm&&st[P.lm]&&st[P.lm].installed)return P.lm;
    var ks=['vbase','base','tiny'],k;for(k=0;k<ks.length;k++)if(st[ks[k]]&&st[ks[k]].installed)return ks[k];
  }catch(e){}
  return null;
}
function rcLocOk(){return !!rcLocKind()}
window.__rcAsr=function(t,sid,d){
  var L=rcAsr.loc;if(!L||L.dead||sid!==L.sid)return;
  if(t==='ready'){L.ready=true;if(L.wd){clearTimeout(L.wd);L.wd=null}L.say('النموذج القرآني يعمل — تلُ الآن… أسمعك',false);return}
  if(t==='loading'){if(L.armWd)L.armWd();L.say('ما زال تجهيز النموذج جاريًا… (أول مرة فقط قد تأخذ دقيقة أو أكثر)',true);return}
  if(t==='err'){
    if(L.wd){clearTimeout(L.wd);L.wd=null}
    L.dead=true;rcAsr.loc=null;try{AlsaerNative.asrStop()}catch(e){}
    if(d==='9'){L.onErr('لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.');return}
    if(d==='nomodel'){L.onErr('النموذج القرآني غير منزّل على هذا الهاتف — نزّله من ⚙ إعدادات التلاوة ثم أعد المحاولة.');return}
    if(d==='dec'){L.onErr('حدث خطأ أثناء فك التشفير على جهازك (غالبًا ذاكرة). جرّب النموذج «الخفيف» من ⚙ إعدادات التلاوة.');return}
    /* تعذّر تحميل النموذج أو تشغيله (ذاكرة/ملفات): رسالة واضحة فقط — لا بديل سحابي */
    L.onErr('تعذّر تشغيل النموذج القرآني على جهازك. أغلق التطبيقات الثقيلة وأعد المحاولة، أو جرّب النموذج «الخفيف» من ⚙ إعدادات التلاوة.');return}
  if(t==='f'){var x=String(d||'').trim();if(x)L.onText([x],true);return}
  if(t==='fin'){ /* انتهى تصريف المقاطع المنتظرة بعد الإيقاف: نُغلق مستمع الجلسة بأمان */
    clearTimeout(rc.finWd);
    if(!(typeof rc==='object'&&rc&&rc.on))rcAsrStop();
    return}
};
function rcLocStart(onText,onErr,say){
  var sid=(rcAsr.lsid=(rcAsr.lsid||0)+1);
  var gen={dead:false,ready:false,wd:null,sid:sid,onText:onText,onErr:onErr,say:say};
  rcAsr.loc=gen;
  /* مراقب التحميل: أول تجهيز للنموذج قد يطول على الأجهزة الضعيفة؛ بعد ٤٥ ثانية بلا نبضة تحميل نعلن الفشل بوضوح */
  gen.armWd=function(){
    if(gen.wd)clearTimeout(gen.wd);
    gen.wd=setTimeout(function(){
      if(rcAsr.loc!==gen||gen.dead||gen.ready)return;
      gen.dead=true;rcAsr.loc=null;try{AlsaerNative.asrStop()}catch(e){}
      onErr('استغرق تجهيز النموذج أكثر من اللازم. أغلق التطبيقات الثقيلة وأعد المحاولة، أو جرّب النموذج «الخفيف» من ⚙ إعدادات التلاوة.');
    },45000);
  };
  gen.armWd();
  var md=navigator.mediaDevices;
  /* getUserMedia لطلب إذن الميكروفون عبر التطبيق (يملكه النظام بعدها AudioRecord) ثم نحرّره فورًا */
  var perm=(md&&md.getUserMedia)?md.getUserMedia({audio:true}).then(function(st){st.getTracks().forEach(function(t){t.stop()})}):Promise.resolve();
  say('جارٍ تجهيز النموذج القرآني المحلي… (أول مرة فقط قد تأخذ دقيقة أو أكثر)',true);
  perm.then(function(){
    if(rcAsr.loc!==gen||gen.dead)return;
    setTimeout(function(){
      if(rcAsr.loc!==gen||gen.dead)return;
      try{AlsaerNative.asrStart(rcLocKind(),sid)}catch(e){gen.dead=true;rcAsr.loc=null;onErr('تعذّر تشغيل النموذج القرآني على جهازك. أعد المحاولة، أو جرّب النموذج «الخفيف» من ⚙ إعدادات التلاوة.')}
    },250);
  }).catch(function(){
    gen.dead=true;rcAsr.loc=null;
    onErr('لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.');
  });
}

function rcAsrStop(){rcAsr.stopped=true;
  if(rcAsr.loc){if(rcAsr.loc.wd)clearTimeout(rcAsr.loc.wd);rcAsr.loc.dead=true;rcAsr.loc=null;try{AlsaerNative.asrStop()}catch(e){}}
  var r=rcAsr.rec;rcAsr.rec=null;if(!r)return;r.dead=true;
  try{r.node.disconnect()}catch(e){}try{r.src.disconnect()}catch(e){}
  try{r.stream.getTracks().forEach(function(t){t.stop()})}catch(e){}try{r.ctx.close()}catch(e){}
}
var RC_NOASR='التسميع يعمل بالنموذج القرآني المحلي فقط (بلا إنترنت، والصوت لا يغادر هاتفك). نزّل النموذج من ⚙ إعدادات التلاوة ثم أعد المحاولة.';
window.ReciteASR={
  start:function(onText,onErr,say){
    say=say||function(){};
    rcAsrStop();rcAsr.stopped=false;rcAsr.nr=0;
    if(!rcLocOk()){onErr(RC_NOASR);return}
    rcLocStart(onText,onErr,say);
  },
  stop:function(){rcAsrStop()}
};
/* لا كتم لصوت الهاتف بعد الآن (كان سبب مشاكل كثيرة). الدالة تبقى لإعادة أي صوت بقي مكتومًا من نسخ قديمة فقط. */
function rcSilence(on){
  try{if(rcAsr.restored||!window.AlsaerNative||typeof AlsaerNative.speechSilent!=='function')return;rcAsr.restored=true;AlsaerNative.speechSilent(false)}catch(e){}
}
function rcLeave(){rcSilence(false);rcKillStreams();if(rcAsr.rec||rcAsr.loc||(typeof rc!=='undefined'&&rc.on)){try{rcStop()}catch(e){}try{rcAsrStop()}catch(e){}try{render()}catch(e){}}}
document.addEventListener('visibilitychange',function(){if(document.hidden)rcLeave();else if(typeof tab!=='undefined'&&tab==='recite'){rcSilence(true);try{render()}catch(e){}}});
window.addEventListener('pagehide',rcLeave);window.__rcLeave=function(){try{rcLeave()}catch(e){}};
window.addEventListener('blur',function(){if(document.hidden)rcLeave()});
