var patSeq=[],patDown=false,patFirst='',patPid=null;
function patHtml(){
  var h='<div class="pat" id="pat"><svg viewBox="0 0 240 240" aria-hidden="true"><polyline id="patl" points=""/></svg>';
  for(var i=1;i<=9;i++){var x=(i-1)%3,y=Math.floor((i-1)/3);h+='<i data-n="'+i+'" style="left:'+(12+80*x)+'px;top:'+(12+80*y)+'px"></i>'}
  return h+'</div>';
}
function patCenter(n){return[40+80*((n-1)%3),40+80*Math.floor((n-1)/3)]}
function patDraw(cx,cy){
  var el=document.getElementById('patl');if(!el)return;
  var pts=patSeq.map(function(n){return patCenter(n).join(',')});
  if(cx!=null)pts.push(cx+','+cy);
  el.setAttribute('points',pts.join(' '));
  [].forEach.call(document.querySelectorAll('#pat i'),function(d){d.classList.toggle('on',patSeq.indexOf(+d.dataset.n)>-1)});
}
function patHit(e){
  var box=document.getElementById('pat');if(!box)return;
  var r=box.getBoundingClientRect(),k=240/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k;
  for(var n=1;n<=9;n++){var c=patCenter(n);if(Math.hypot(x-c[0],y-c[1])<=30&&patSeq.indexOf(n)<0){patSeq.push(n);if(navigator.vibrate)try{navigator.vibrate(12)}catch(_){}}}
  patDraw(Math.max(0,Math.min(240,x)),Math.max(0,Math.min(240,y)));
}
async function tryUnlock(l){
  var wait=lockRemaining();
  if(wait>0){msg='محاولات كثيرة؛ حاول بعد '+Math.ceil(wait/1000)+' ثانية';return}
  if(!l){msg=(S.lockType!=='pattern'&&S.security&&S.security.method==='password')?'أدخل كلمة المرور':'أدخل رمز PIN';return}
  try{if(await verifyPin(l,S.pin)){clearBadPins();if(typeof S.pin==='string'){S.pin=await makePinRecord(l)}unlocked=true;msg='';save()}else{var rem=recordBadPin(),mt=(S.lockType==='pattern')?'النمط':((S.security&&S.security.method)==='password'?'كلمة المرور':'رمز PIN'),fl=(lockState().fails||0),ng=(mt==='كلمة المرور')?'غير صحيحة':'غير صحيح';msg=rem>0?('✗ '+mt+' '+ng+'؛ تم إيقاف المحاولة مؤقتاً'):('✗ '+mt+' '+ng+'، حاول مرة أخرى'+(fl<5?' (المتبقي '+(5-fl)+' محاولات قبل الإيقاف المؤقت)':''))}}catch(err){msg='تعذر التحقق الآمن من الرمز على هذا الجهاز'}
}
async function patDone(code){
  if(!unlocked){await tryUnlock(code);render();return}
  if(!patFirst){patFirst=code;msg='أعد رسم النمط للتأكيد'}
  else if(patFirst===code){patFirst='';try{S.pin=await makePinRecord(code);S.lockType='pattern';save();msg='تم حفظ النمط بصورة مشتقة تشفيرياً'}catch(err){msg='تعذر إنشاء حماية آمنة على هذا الجهاز؛ لم يتم حفظ النمط'}}
  else{patFirst='';msg='النمطان غير متطابقين؛ ابدأ من جديد'}
  render();
}
document.addEventListener('pointerdown',function(e){
  var box=e.target.closest&&e.target.closest('#pat');if(!box)return;
  e.preventDefault();patDown=true;patSeq=[];patPid=e.pointerId;try{box.setPointerCapture(e.pointerId)}catch(_){}patHit(e);
});
document.addEventListener('pointermove',function(e){if(patDown&&e.pointerId===patPid)patHit(e)});
function patEnd(e){
  if(!patDown||(e&&e.pointerId!==patPid))return;
  patDown=false;var code=patSeq.join('');
  if(patSeq.length<4){patSeq=[];patDraw();msg='اربط ٤ نقاط على الأقل';var m=document.querySelector('.msg');if(m)m.textContent=msg;return}
  patSeq=[];patDone(code);
}
document.addEventListener('pointerup',patEnd);
document.addEventListener('pointercancel',function(e){if(patDown&&e.pointerId===patPid){patDown=false;patSeq=[];patDraw()}});
function vLock(){var meth=(S.security&&S.security.method)||'pin';return '<div class="lock"><div class="lock-emblem">'+ic('book-open')+'</div><div class="lock-panel"><h2>السائر</h2><p class="muted">مساحتك الإيمانية محفوظة بخصوصية</p><div style="font-size:30px;margin:4px 0 12px;color:#dfc17d">'+(S.lockType==='pattern'?'⌘':meth==='password'?'▤':'▦')+'</div><p class="muted">'+(S.lockType==='pattern'?'ارسم نمطك لفتح التطبيق':meth==='password'?'أدخل كلمة المرور للمتابعة':'أدخل رمز PIN للمتابعة')+'</p>'+(S.lockType==='pattern'?patHtml():'<input type="password" '+(meth==='pin'?'inputmode="numeric" maxlength="4"':'')+' id="lk" autocomplete="current-password" placeholder="'+(meth==='password'?'كلمة المرور':'••••')+'"><button class="lock-enter" data-a="unlock">فتح التطبيق</button>')+(bioUsable()?'<button class="lock-enter" style="margin-top:10px" data-a="biounlock">'+ic('fingerprint')+'فتح بالبصمة</button>':'')+'<p class="msg" role="alert" aria-live="polite">'+esc(msg)+'</p><div class="lock-foot">خطوة هادئة نحو الأفضل • بياناتك على جهازك</div></div></div>'}

