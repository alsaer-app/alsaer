/* بطاقة التحكم بالصوت في شريط الإشعارات: تتابع عناصر Audio التي تنشئها الخدمات (إذاعة، قرّاء، فتاوى، حصن، مصحف)
   وتبلّغ الجسر الأصلي (AlsaerNative.mediaUpdate/mediaStop). الصوت يبقى في الصفحة؛ الأزرار تعود عبر alsaerMediaCmd. */
var MC={list:[],t:0,on:false,last:'',asked:false};
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
  if(!A){if(MC.on){MC.on=false;MC.last='';try{N.mediaStop()}catch(e){}}return}
  var pl=!A.paused&&!A.ended,t=mcTitle(A),k=t+'|'+pl;
  if(k===MC.last&&MC.on)return;
  MC.last=k;MC.on=true;
  if(!MC.asked&&N.notificationsEnabled&&N.requestNotificationPermission){MC.asked=true;try{if(!N.notificationsEnabled())N.requestNotificationPermission()}catch(e){}}
  try{N.mediaUpdate(t,pl)}catch(e){}}
function mcQueue(){if(!MC.t)MC.t=setTimeout(mcSync,200)}
function mcTrack(A){
  MC.list.push(A);
  ['play','playing','pause','ended','emptied','error','waiting'].forEach(function(ev){A.addEventListener(ev,mcQueue)});
  mcQueue()}
(function(){
  var NA=window.Audio;if(!NA||NA.__mc)return;
  var W=function(src){var A=arguments.length?new NA(src):new NA();if(!arguments.length)mcTrack(A);return A};
  W.prototype=NA.prototype;W.__mc=1;window.Audio=W;
})();
window.alsaerMediaCmd=function(c){
  var A=MC.list[MC.list.length-1];
  try{
    if((c==='pause'||c==='play')&&A&&typeof mqAu!=='undefined'&&mqAu.a===A){mqAu.pa=(c==='pause')}
    if(c==='pause'&&A)A.pause();
    else if(c==='play'&&A){var p=A.play();if(p&&p.catch)p.catch(function(){})}
    if((c==='pause'||c==='play')&&A&&typeof mqAu!=='undefined'&&mqAu.a===A&&typeof mqAuBar==='function')mqAuBar();
    else if(c==='stop'){
      try{if(typeof rdoStop==='function'){rdoStop();if(typeof rdoRefresh==='function')rdoRefresh()}}catch(e){}
      try{if(typeof rctStop==='function'){rctStop();if(typeof rctRefresh==='function')rctRefresh()}}catch(e){}
      try{if(typeof ftAuStop==='function'){ftAuStop();if(typeof ftAuUi==='function')ftAuUi()}}catch(e){}
      try{if(typeof mqAuStop==='function')mqAuStop()}catch(e){}
      try{if(typeof hsnAuStop==='function')hsnAuStop()}catch(e){}
    }
  }catch(e){}
  mcQueue()};
