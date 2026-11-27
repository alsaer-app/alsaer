/* بطاقة التحكم بالصوت في شريط الإشعارات: تتابع عناصر Audio التي تنشئها الخدمات (إذاعة، قرّاء، فتاوى، حصن، مصحف)
   وتبلّغ الجسر الأصلي (AlsaerNative.mediaUpdate/mediaStop). الصوت يبقى في الصفحة؛ الأزرار تعود عبر alsaerMediaCmd. */
var MC={list:[],t:0,on:false,last:'',asked:false};
function mcDiag(t){try{var N=window.AlsaerNative;if(N&&N.diagLog)N.diagLog(String(t).slice(0,150))}catch(e){}}
window.mcDiag=mcDiag;
function mcSrc(A){
  try{
    if(typeof rdoS!=='undefined'&&rdoS.a===A)return 'radio';
    if(typeof rctS!=='undefined'&&rctS.a===A)return 'reciter';
    if(typeof ftA!=='undefined'&&ftA.a===A)return 'fatwa';
    if(typeof hsnF!=='undefined'&&hsnF.a===A)return 'hisn';
    if(typeof mqAu!=='undefined'&&mqAu.a===A)return 'mushaf';
  }catch(e){}
  return 'other'}
function mcBridge(){var N=window.AlsaerNative;return N&&N.mediaUpdate?N:null}
function mcT(t){try{var r=typeof trS==='function'?trS(t):null;return r===null||r===undefined?t:r}catch(e){return t}}
function mcTitle(A){
  try{
    if(typeof rdoS!=='undefined'&&rdoS.a===A){var r=(window.RDO||[]).filter(function(x){return x[0]===rdoS.id})[0];return r?r[1]:mcT('الإذاعة')}
    if(typeof rctS!=='undefined'&&rctS.a===A){var c=rctGet(rctS.sel),nm=(typeof AD==='function'&&rctS.sura)?AD().n[rctS.sura-1]:'';return (c?c[1]:mcT('التلاوة'))+(nm?' · سورة '+nm:'')}
    if(typeof ftA!=='undefined'&&ftA.a===A)return mcT('الفتاوى الصوتية');
    if(typeof hsnF!=='undefined'&&hsnF.a===A)return 'حصن المسلم · استماع';
    if(typeof mqAu!=='undefined'&&mqAu.a===A){if(mqAu.nm)return mqAu.nm;var q=String(mqAu.k||'').split(':'),n=(typeof AD==='function'&&+q[0])?AD().n[+q[0]-1]:'';return mcT('تلاوة')+(n?' · سورة '+n:'')}
  }catch(e){}
  return ''}
function mcSync(){
  MC.t=0;var N=mcBridge();if(!N)return;
  MC.list=MC.list.filter(function(A){return !!mcTitle(A)});
  var A=MC.list[MC.list.length-1];
  if(!A){if(MC.on){MC.on=false;MC.last='';if(!(typeof rdoS!=='undefined'&&rdoS.n)){try{N.mediaStop()}catch(e){}}}return}
  var pl=!A.paused&&!A.ended,t=mcTitle(A),k=t+'|'+pl;
  if(k===MC.last&&MC.on)return;
  MC.last=k;MC.on=true;
  if(!MC.asked&&N.notificationsEnabled&&N.requestNotificationPermission){MC.asked=true;try{if(!N.notificationsEnabled())N.requestNotificationPermission()}catch(e){}}
  try{N.mediaUpdate(t,pl)}catch(e){}}
function mcQueue(){if(!MC.t)MC.t=setTimeout(mcSync,200)}
function mcTrack(A){
  MC.list.push(A);
  ['play','playing','pause','ended','emptied','error','waiting'].forEach(function(ev){A.addEventListener(ev,mcQueue)});
  ['play','pause','ended','emptied','error','waiting','stalled'].forEach(function(ev){A.addEventListener(ev,function(){mcDiag('audio '+mcSrc(A)+' '+ev+(ev==='error'&&A.error?' code'+A.error.code:'')+' vis='+document.visibilityState)})});
  /* إيقاف غير مطلوب والصفحة مخفية (لا أمر من البطاقة ولا ضغط مستخدم): نعيد التشغيل حتى ٣ مرات ونسجّل النتيجة */
  var rs=0;
  A.addEventListener('pause',function(){
    if(!document.hidden||A.ended||!A.src&&!A.currentSrc)return;
    if(Date.now()-(MC.cmdAt||0)<3000)return;
    if(!mcTitle(A)||rs>=3)return;
    rs++;mcDiag('unexpected pause while hidden -> resume #'+rs+' '+mcSrc(A));
    setTimeout(function(){
      if(!A.paused||!mcTitle(A)||Date.now()-(MC.cmdAt||0)<3000)return;
      var p=A.play();if(p&&p.then)p.then(function(){mcDiag('resume ok '+mcSrc(A))},function(e){mcDiag('resume rejected '+(e&&e.name))})},300)});
  A.addEventListener('playing',function(){rs=0});
  mcQueue()}
(function(){
  var NA=window.Audio;if(!NA||NA.__mc)return;
  var W=function(src){var A=arguments.length?new NA(src):new NA();if(!arguments.length)mcTrack(A);return A};
  W.prototype=NA.prototype;W.__mc=1;window.Audio=W;
})();
window.alsaerMediaCmd=function(c){
  MC.list=MC.list.filter(function(A){return !!mcTitle(A)});
  var A=MC.list[MC.list.length-1];
  mcDiag('cmd '+c+' '+(A?mcSrc(A):'no-audio'));
  MC.cmdAt=Date.now();
  try{
    if(c==='stop'){
      /* الإيقاف يوقف كل المصادر دائمًا، قبل أي فرع آخر */
      try{if(typeof rdoStop==='function'){rdoStop();if(typeof rdoRefresh==='function')rdoRefresh()}}catch(e){}
      try{if(typeof rctStop==='function'){rctStop();if(typeof rctRefresh==='function')rctRefresh()}}catch(e){}
      try{if(typeof ftAuStop==='function'){ftAuStop();if(typeof ftAuUi==='function')ftAuUi()}}catch(e){}
      try{if(typeof mqAuStop==='function')mqAuStop()}catch(e){}
      try{if(typeof hsnAuStop==='function')hsnAuStop()}catch(e){}
    }else if(A&&(c==='pause'||c==='play')){
      var isMq=typeof mqAu!=='undefined'&&mqAu.a===A;
      if(isMq)mqAu.pa=(c==='pause');
      if(c==='pause')A.pause();
      else{var p=A.play();if(p&&p.catch)p.catch(function(e){mcDiag('play rejected '+(e&&e.name))})}
      if(isMq&&typeof mqAuBar==='function')mqAuBar();
    }
  }catch(e){mcDiag('cmd error '+(e&&e.name))}
  mcQueue()};
try{document.addEventListener('visibilitychange',function(){mcDiag('vis '+document.visibilityState+' audio='+(MC.list.filter(function(A){return !A.paused}).length))})}catch(e){}
