/* ===== مصدر الصوت لشاشة «التلاوة» =====
   النموذج القرآني المحلي (sherpa-onnx + نموذج Tarteel المضبوط على القرآن، يُنزَّل لمرة واحدة) إن اختاره المستخدم،
   وإلا تعرّف Google الأصلي (عبر الجسر) ثم Web Speech API في المتصفح. */
(function(){try{var md=navigator.mediaDevices;if(md&&md.getUserMedia&&!md.__alsaerWrap){var og=md.getUserMedia.bind(md);window.__alsaerStreams=[];md.getUserMedia=function(c){return og(c).then(function(st){window.__alsaerStreams.push(st);return st})};md.__alsaerWrap=1}}catch(e){}})();
function rcKillStreams(){try{(window.__alsaerStreams||[]).forEach(function(st){try{st.getTracks().forEach(function(t){t.stop()})}catch(e){}});window.__alsaerStreams=[]}catch(e){}}
var rcAsr={rec:null,nat:null};
/* ---- التعرّف الأصلي لأندرويد (خدمة Google): فوري ولا يحتاج تنزيل نموذج ---- */
function rcNatOk(){
  try{var P=(typeof rcPref==='function')?rcPref():{};return !rcAsr.natBad&&window.AlsaerNative&&typeof AlsaerNative.speechAvailable==='function'&&typeof AlsaerNative.speechStart==='function'&&AlsaerNative.speechAvailable()}catch(e){return false}
}
window.__rcNat=function(t,d){
  var n=rcAsr.nat;if(!n||n.dead)return;
  if(t==='stopped'){n.dead=true;rcAsr.nat=null;n.onErr('أُوقف الميكروفون تلقائيًا لأنك غادرت التطبيق. اضغط ابدأ للمتابعة.');return}
  if(t==='err'){
    var cd=parseInt(String(d).replace(/\D/g,''),10)||0;
    if(cd===12||cd===13){n.dead=true;rcAsr.nat=null;rcAsr.natBad=true;n.fallback();return}
    var MS={1:'انقطاع الاتصال بالإنترنت',2:'لا يوجد اتصال بالإنترنت',3:'مشكلة في التقاط الصوت',4:'خدمة Google لم تستجب',5:'خطأ في خدمة التعرّف',9:'الإذن غير ممنوح للميكروفون',10:'الخدمة مشغولة',11:'انقطعت خدمة Google',idle:'لم نسمع تلاوة لفترة طويلة'};
    if(cd!==9&&d!=='idle'&&(rcAsr.nr||0)<3){
      rcAsr.nr=(rcAsr.nr||0)+1;n.dead=true;rcAsr.nat=null;n.say('إعادة تشغيل الاستماع… ('+ar(rcAsr.nr)+')',true);
      setTimeout(function(){if(!rcAsr.nat&&!rcAsr.stopped)rcNatStart(n.onText,n.onErr,n.say,n.fallback)},700);return}
    n.dead=true;rcAsr.nat=null;
    n.onErr(cd===9?'لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.':'توقّف الاستماع: '+(MS[cd]||MS[d]||'خطأ '+d)+'. اضغط ابدأ لإعادة المحاولة، أو اختر «النموذج المحلي فقط» من خيارات متقدّمة.');return}
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
function rcNatStart(onText,onErr,say,fallback){
  var md=navigator.mediaDevices,gen={dead:false,n:0,onText:onText,onErr:onErr,say:say,fallback:fallback};
  rcAsr.nat=gen;
  /* getUserMedia هنا لطلب إذن الميكروفون فقط (يظهر الطلب عبر التطبيق) ثم نحرّره فورًا ليأخذه التعرّف الأصلي */
  var perm=(md&&md.getUserMedia)?md.getUserMedia({audio:true}).then(function(st){st.getTracks().forEach(function(t){t.stop()})}):Promise.resolve();
  perm.then(function(){
    if(rcAsr.nat!==gen||gen.dead)return;
    say('جارٍ تشغيل التعرّف…',true);
    setTimeout(function(){if(rcAsr.nat===gen&&!gen.dead){var bj='[]';try{bj=JSON.stringify(window.__rcBias?window.__rcBias():[])}catch(e){}
      try{if(AlsaerNative.speechOnDevice)AlsaerNative.speechOnDevice(!!(rcPref().od))}catch(e){}
      try{var PM=(typeof rcPref==='function')?rcPref():{};if(AlsaerNative.speechMute)AlsaerNative.speechMute(PM.beep!==false)}catch(e){}
      if(AlsaerNative.speechStart2)AlsaerNative.speechStart2(bj);else AlsaerNative.speechStart()}},250);
  }).catch(function(e){
    gen.dead=true;rcAsr.nat=null;
    onErr('لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.');
  });
}

/* ---- النموذج القرآني المحلي: دقة قريبة من ترتيل، بلا إنترنت بعد التنزيل، والصوت لا يغادر الهاتف ---- */
function rcLocSt(){try{if(!window.AlsaerNative||typeof AlsaerNative.asrStatus!=='function')return null;return JSON.parse(AlsaerNative.asrStatus()||'{}')}catch(e){return null}}
function rcLocOk(){
  try{var P=(typeof rcPref==='function')?rcPref():{};if(!P.lm)return false;var st=rcLocSt();return !!(st&&st[P.lm]&&st[P.lm].installed)}catch(e){return false}
}
window.__rcAsr=function(t,sid,d){
  var L=rcAsr.loc;if(!L||L.dead||sid!==L.sid)return;
  if(t==='ready'){L.ready=true;if(L.wd){clearTimeout(L.wd);L.wd=null}L.say('النموذج القرآني يعمل — تلُ الآن… أسمعك',false);return}
  if(t==='err'){
    if(L.wd){clearTimeout(L.wd);L.wd=null}
    L.dead=true;rcAsr.loc=null;try{AlsaerNative.asrStop()}catch(e){}
    if(d==='9'){L.onErr('لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.');return}
    if(d==='nomodel'){L.fallback();return}
    /* تعذّر تحميل النموذج أو تشغيله (ذاكرة/ملفات): نعود لتعرّف Google مرة واحدة مع تنبيه */
    L.say('تعذّر تشغيل النموذج المحلي؛ عدنا لتعرّف Google مؤقتًا.',true);
    L.fallback();return}
  if(t==='f'){var x=String(d||'').trim();if(x)L.onText([x],true)}
};
function rcLocStart(onText,onErr,say,fallback){
  var sid=(rcAsr.lsid=(rcAsr.lsid||0)+1);
  var gen={dead:false,ready:false,wd:null,sid:sid,onText:onText,onErr:onErr,say:say,fallback:fallback};
  rcAsr.loc=gen;
  /* مراقب التحميل: أول تجهيز للنموذج قد يطول على الأجهزة الضعيفة؛ بعد ٤٥ ثانية نعود لجوجل برسالة واضحة */
  gen.wd=setTimeout(function(){
    if(rcAsr.loc!==gen||gen.dead||gen.ready)return;
    gen.dead=true;rcAsr.loc=null;try{AlsaerNative.asrStop()}catch(e){}
    say('تعذّر تجهيز النموذج في الوقت المناسب — جرّب «الخفيف» من الإعدادات؛ عدنا لتعرّف Google مؤقتًا.',true);
    fallback();
  },45000);
  var md=navigator.mediaDevices;
  /* getUserMedia لطلب إذن الميكروفون عبر التطبيق (يملكه النظام بعدها AudioRecord) ثم نحرّره فورًا */
  var perm=(md&&md.getUserMedia)?md.getUserMedia({audio:true}).then(function(st){st.getTracks().forEach(function(t){t.stop()})}):Promise.resolve();
  say('جارٍ تجهيز النموذج القرآني المحلي…',true);
  perm.then(function(){
    if(rcAsr.loc!==gen||gen.dead)return;
    setTimeout(function(){
      if(rcAsr.loc!==gen||gen.dead)return;
      try{AlsaerNative.asrStart(rcPref().lm)}catch(e){gen.dead=true;rcAsr.loc=null;fallback()}
    },250);
  }).catch(function(){
    gen.dead=true;rcAsr.loc=null;
    onErr('لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.');
  });
}

/* ---- محرّك Web Speech API (المتصفح) كبديل سريع بلا تنزيل — لا يعمل في WebView الأندرويد، وهناك يقوم الجسر الأصلي مقامه ---- */
function rcWsCls(){return window.SpeechRecognition||window.webkitSpeechRecognition||null}
function rcWsOk(){
  try{var P=(typeof rcPref==='function')?rcPref():{};return !!rcWsCls()&&!rcAsr.wsBad}catch(e){return false}
}
function rcWsStart(onText,onErr,say,fallback){
  var C=rcWsCls(),gen={dead:false,rec:null,n:0};rcAsr.ws=gen;
  var md=navigator.mediaDevices;
  function go(){
    if(gen.dead||rcAsr.stopped)return;
    var r;try{r=new C()}catch(e){gen.dead=true;rcAsr.ws=null;rcAsr.wsBad=true;fallback();return}
    gen.rec=r;r.lang='ar-SA';r.continuous=true;r.interimResults=true;r.maxAlternatives=5;
    var gotAny=false,watch=setTimeout(function(){if(!gotAny&&!gen.dead){try{r.abort()}catch(e){}}},12000);
    r.onstart=function(){say('تلُ الآن… أسمعك',false)};
    r.onresult=function(ev){
      gotAny=true;gen.n=0;
      for(var i=ev.resultIndex;i<ev.results.length;i++){
        var R=ev.results[i],alts=[],k;for(k=0;k<R.length;k++){var t=String(R[k].transcript||'').trim();if(t)alts.push(t)}
        if(alts.length)onText(alts,!!R.isFinal)}
    };
    r.onerror=function(ev){
      var c=ev&&ev.error;clearTimeout(watch);
      if(c==='not-allowed'||c==='service-not-allowed'){gen.dead=true;rcAsr.ws=null;onErr('لم يُسمح بالميكروفون. فعّله من إعدادات المتصفح/الهاتف.');return}
      if(c==='network'||c==='language-not-supported'){gen.dead=true;rcAsr.ws=null;rcAsr.wsBad=true;say('تعذّر تعرّف المتصفح ('+c+')؛ نجرّب محرّكًا آخر…',true);fallback();return}
      /* no-speech / aborted / audio-capture: تُعالج في onend بإعادة التشغيل */
    };
    r.onend=function(){
      clearTimeout(watch);if(gen.dead||rcAsr.stopped)return;
      if(++gen.n>8){gen.dead=true;rcAsr.ws=null;onErr('توقّف الاستماع بعد محاولات متكررة. اضغط ابدأ لإعادة المحاولة.');return}
      setTimeout(go,400)
    };
    try{r.start()}catch(e){setTimeout(go,600)}
  }
  var perm=(md&&md.getUserMedia)?md.getUserMedia({audio:true}).then(function(st){st.getTracks().forEach(function(t){t.stop()})}):Promise.resolve();
  say('جارٍ تشغيل التعرّف…',true);
  perm.then(go).catch(function(){gen.dead=true;rcAsr.ws=null;onErr('لم يُسمح بالميكروفون. فعّله من إعدادات المتصفح/الهاتف.')});
}
function rcAsrStop(){rcAsr.stopped=true;
  if(rcAsr.ws){var wg=rcAsr.ws;wg.dead=true;rcAsr.ws=null;try{wg.rec&&wg.rec.abort()}catch(e){}}
  if(rcAsr.nat){rcAsr.nat.dead=true;rcAsr.nat=null;try{AlsaerNative.speechStop()}catch(e){}}
  if(rcAsr.loc){if(rcAsr.loc.wd)clearTimeout(rcAsr.loc.wd);rcAsr.loc.dead=true;rcAsr.loc=null;try{AlsaerNative.asrStop()}catch(e){}}
  var r=rcAsr.rec;rcAsr.rec=null;if(!r)return;r.dead=true;
  try{r.node.disconnect()}catch(e){}try{r.src.disconnect()}catch(e){}
  try{r.stream.getTracks().forEach(function(t){t.stop()})}catch(e){}try{r.ctx.close()}catch(e){}
}
var RC_NOASR='التعرّف الصوتي غير متاح أو تعذّر تشغيله. تأكد من الإنترنت ومن تفعيل «خدمات Google الصوتية» في إعدادات الهاتف ثم أعد المحاولة.';
window.ReciteASR={
  start:function(onText,onErr,say){
    say=say||function(){};
    rcAsrStop();rcAsr.stopped=false;rcAsr.nr=0;
    function ws(){
      if(rcWsOk()){rcWsStart(onText,onErr,say,function(){onErr(RC_NOASR)});return true}
      return false;
    }
    function nat(){if(rcNatOk()){rcNatStart(onText,onErr,say,function(){if(!ws())onErr(RC_NOASR)});return true}return false}
    /* النموذج القرآني المحلي أولًا إن اختاره المستخدم من إعدادات التلاوة وكان منزَّلًا */
    if(rcLocOk()){
      rcLocStart(onText,onErr,say,function(){if(!nat()&&!ws())onErr(RC_NOASR)});
      return;
    }
    if(nat())return;
    if(!ws())onErr(RC_NOASR);
  },
  stop:function(){rcAsrStop()}
};
/* لا كتم لصوت الهاتف بعد الآن (كان سبب مشاكل كثيرة). الدالة تبقى لإعادة أي صوت بقي مكتومًا من نسخ قديمة فقط. */
function rcSilence(on){
  try{if(rcAsr.restored||!window.AlsaerNative||typeof AlsaerNative.speechSilent!=='function')return;rcAsr.restored=true;AlsaerNative.speechSilent(false)}catch(e){}
}
function rcLeave(){rcSilence(false);rcKillStreams();if(rcAsr.rec||rcAsr.nat||(typeof rc!=='undefined'&&rc.on)){try{rcStop()}catch(e){}try{rcAsrStop()}catch(e){}try{render()}catch(e){}}}
document.addEventListener('visibilitychange',function(){if(document.hidden)rcLeave();else if(typeof tab!=='undefined'&&tab==='recite'){rcSilence(true);try{render()}catch(e){}}});
window.addEventListener('pagehide',rcLeave);window.__rcLeave=function(){try{rcLeave()}catch(e){}};
window.addEventListener('blur',function(){if(document.hidden)rcLeave()});
