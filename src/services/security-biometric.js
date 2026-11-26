var LOCK_KEY='alsaer_lock_guard_v1';
function lockState(){try{return JSON.parse(localStorage.getItem(LOCK_KEY)||'{"fails":0,"until":0}')}catch(e){return{fails:0,until:0}}}
function setLockState(v){try{localStorage.setItem(LOCK_KEY,JSON.stringify(v))}catch(e){}}
function lockRemaining(){return Math.max(0,(lockState().until||0)-Date.now())}
function recordBadPin(){var x=lockState();x.fails=(x.fails||0)+1;if(x.fails>=5){var level=Math.min(6,Math.floor(x.fails/5));x.until=Date.now()+Math.min(30*60*1000,Math.pow(2,level-1)*30000)}setLockState(x);return lockRemaining()}
function clearBadPins(){setLockState({fails:0,until:0})}

/* ---------- ALSAER: biometric unlock ---------- */
var bioReady=false,bioBusy=false,bioPrompted=false,bioTries=0;
function bPlug(){return window.Biometric||(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Biometric)||null}
function bioOn(){return !!(S.biometric&&S.biometric.enabled)}
function bioUsable(){return bioOn()&&bioReady}
async function bioProbe(){
  var b=bPlug();if(!b){bioReady=false;return}
  var was=bioReady;
  try{var r=await b.isAvailable({});bioReady=!!(r&&r.available)}catch(_){bioReady=false}
  if(bioReady!==was)render();
}
function bioProbePoll(){
  if(bPlug()){bioProbe();return}
  if(bioTries<20){bioTries++;setTimeout(bioProbePoll,300)}
}
function bioUnlockNow(){
  clearBadPins();unlocked=true;msg='';bioPrompted=true;save();render();
  if(typeof toast==='function')toast('تم فتح التطبيق بالبصمة');
}
function bioPrompt(auto){
  var b=bPlug();
  if(!b||bioBusy||unlocked||!bioUsable())return;
  bioBusy=true;
  b.authenticate({reason:'مصادقة بصمة السائر إلى الله'}).then(function(r){
    bioBusy=false;
    if(r&&r.success)bioUnlockNow();
  }).catch(function(){
    bioBusy=false;
    if(auto)return;
    msg='لم يتم التعرف على البصمة. استخدم كلمة المرور أو أعد المحاولة.';
    var m=document.querySelector('.lock .msg');if(m)m.textContent=msg;
  });
}
function bioAuto(){if(bioUsable()&&!unlocked&&!bioPrompted){bioPrompted=true;setTimeout(function(){bioPrompt(true)},400)}}
function bioToggle(){
  msg='';
  if(!bPlug()){secOk='هذا الجهاز لا يدعم فتح التطبيق بالبصمة';render();return}
  if(!bioReady){bioProbe();secOk='جارٍ التحقق من قارئ البصمة… انقر مرة أخرى بعد لحظة';render();return}
  var want=!(S.biometric&&S.biometric.enabled);
  if(want){
    if(!S.pin){secOk='فعِّل قفل الرقم السري (أو كلمة المرور) أولًا لكي تظل فرصة فتح التطبيق متاحة إذا تعذر قارئ البصمة';render();return}
    var b=bPlug();
    b.authenticate({reason:'تأكيد تفعيل قفل التطبيق بالبصمة'}).then(function(r){
      if(r&&r.success){S.biometric={enabled:true};save();secOk='تم تفعيل قفل التطبيق بالبصمة'}else secOk='لم تتم المصادقة. لم يُفعَّل قفل البصمة.';
      render();
    }).catch(function(){secOk='تم إلغاء تفعيل قفل البصمة';render()});
  }else{
    S.biometric={enabled:false};save();secOk='تم إيقاف قفل التطبيق بالبصمة';render();
  }
}
/* ---------- end biometric ---------- */
