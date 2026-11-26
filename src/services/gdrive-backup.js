/* ===== نسخ احتياطي اختياري إلى Google Drive =====
   يعمل فقط بعد أن يضع مطوّر التطبيق معرّف عميل OAuth خاصه في GD_CLIENT_ID (انظر docs/GDRIVE-SETUP-AR.md).
   drive.file: ملفات أنشأها التطبيق أو أتاحها المستخدم له، لا وصول شامل إلى Drive.
   لا يُخزَّن أي سر في المستودع؛ رمز التحديث يبقى على الجهاز مثل بقية البيانات (غير مشفّر سكونًا). */
var GD_CLIENT_ID='794360516005-hrt6lc8vtrgd5k9ok9476f9gdkh98rt8.apps.googleusercontent.com'; /* عميل OAuth نوع Android — عام وليس سرًا */
var GD_REDIRECT='com.ahmedalajmi.alsaer://gdrive';
var GD_SCOPE='https://www.googleapis.com/auth/drive.file';
var GD_FILE='alsaer-backup.json';
var GD_RT_KEY='alsaer_gdrive_rt',GD_VER_KEY='alsaer_gd_verifier';
var GD_SAFETY_KEY='alsaer_drive_restore_safety_v1',gdRestoreRaw='',gdRestoreSource='drive',gdDiscArm=false;
var gdTok={t:'',exp:0},gdBusy=false;

function gdConfigured(){return /^[0-9a-z-]+\.apps\.googleusercontent\.com$/i.test(GD_CLIENT_ID)}
function gdNative(){return !!(window.AlsaerNative&&typeof AlsaerNative.gdriveAuthorize==='function')}
function gdHasRt(){try{return gdNative()?localStorage.getItem('alsaer_gdrive_native')==='1':!!localStorage.getItem(GD_RT_KEY)}catch(e){return false}}
var gdNativePending=null,gdRevAt=0,gdAuthWait=false,gdLinkAt=0;
/* الإلغاء الأصلي لدى خدمات Play غير متزامن ولا يُبلغ بانتهائه؛ إن وصل متأخرًا بعد ربط جديد ألغى الإذن الجديد. نسجّل وقته لنؤخّر الربط التالي */
function gdNativeRevoke(){try{if(window.AlsaerNative&&typeof AlsaerNative.gdriveRevoke==='function'){gdRevAt=Date.now();AlsaerNative.gdriveRevoke()}}catch(e){}}
function gdResetAuthState(){
  gdTok={t:'',exp:0};gdSetPerm('');
  try{localStorage.removeItem('alsaer_gdrive_native');localStorage.removeItem(GD_RT_KEY);localStorage.removeItem('alsaer_gdrive_email')}catch(e){}
  /* امسح تخزين Google المحلي على الجهاز أيضًا: بلا ذلك قد تعيد خدمات Play الرمز الميت نفسه عند الربط التالي (علة «لا يربط بعد فك الربط») */
  gdNativeRevoke();
  /* Keep local backups, encryption choice/password and per-destination history. */
}
/* إثبات الرمز قبل إعلان الربط: خدمات Play قد تعيد رمزًا مخزَّنًا أُلغي للتو. 401 وحده = موت مؤكد فيُرفض (403 يعني نقص صلاحية أو حصة وليس رمزًا ميتًا، فلا يُرفض به ربط جديد)؛ أي خطأ آخر = لا نستطيع إثبات الموت فنقبل كما كان */
function gdValidateToken(t){
  return Promise.resolve().then(function(){
    return gdFetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)',{headers:{'Authorization':'Bearer '+t}},15000);
  }).then(function(r){
    try{localStorage.setItem('alsaer_gd_lastcheck',String(r&&r.status)+'@'+Date.now())}catch(e){}
    if(r&&r.status===401)return null;
    if(r&&r.status===403)return {forbidden:true,code:'http-403'};
    if(!r||!r.ok)throw new Error('http-'+(r&&r.status));
    return r.json().then(function(o){return o||{}});
  });
}
/* نجاح ربط أصلي مُثبت: خزّن العلامات والبريد، وأعد ضبط إحصاءات الحساب إن تغيّر */
/* حالة التحقق: 2xx مؤكد (يمسح العلم)، 403 صلاحية/حصة أو تعذر الفحص (يُبقى الحساب والنسخة، ويُعلَّم «غير متحقق» برمز عام فقط) */
var GD_PERM_KEY='alsaer_gd_perm';
function gdPerm(){try{return localStorage.getItem(GD_PERM_KEY)||''}catch(e){return ''}}
function gdPermBase(){return 'تم الربط لكن تعذّر التأكد من صلاحية النسخ على Drive. حسابك ونسختك محفوظان. اضغط «نسخ الآن» للمحاولة أو راجع أذونات Google.'}
function gdPermMsg(){return gdPermBase()+' ('+(gdPerm()||'unverified')+')'}
function gdSetPerm(code){try{if(code)localStorage.setItem(GD_PERM_KEY,code);else localStorage.removeItem(GD_PERM_KEY)}catch(e){}}
function gdNativeLinkOk(p,token,email,unverified){
  var priorEmail=gdEmail();gdLinkAt=Date.now();gdSetPerm(unverified||'');
  gdTok={t:token,exp:Date.now()+50*60000};
  try{
    localStorage.setItem('alsaer_gdrive_native','1');localStorage.removeItem(GD_RT_KEY);
    if(email)localStorage.setItem('alsaer_gdrive_email',String(email));else localStorage.removeItem('alsaer_gdrive_email');
  }catch(e){}
  if(p&&p.interactive&&(!email||!priorEmail||String(email)!==priorEmail)){var st=gdStatus();st.driveAt=0;st.driveRestoreAt=0;try{localStorage.setItem(GD_META,JSON.stringify(st))}catch(e){}S.gdAt=0;gdAutoTried=0;save()}
}
function gdAuthError(error){
  return ['consent-required','scope-not-granted','auth','no-auth','invalid_grant'].indexOf(String(error))>=0;
}
var GD_PENDING_KEY='alsaer_gdrive_pending_auth';
function gdNativeToken(interactive){
  if(gdNativePending)return Promise.reject(new Error('busy'));
  return new Promise(function(resolve,reject){
    /* 5 دقائق: شاشة اختيار الحساب قد تطول. عند انتهاء المهلة يبقى علم المحاولة التفاعلية حتى تصل النتيجة المتأخرة فتُستكمل بدل تجاهلها */
    var timer=setTimeout(function(){var wasInteractive=gdNativePending&&gdNativePending.interactive;gdNativePending=null;if(!wasInteractive){try{localStorage.removeItem(GD_PENDING_KEY)}catch(e){}}reject(new Error('timeout'));try{render()}catch(e){}},300000);
    gdNativePending={resolve:resolve,reject:reject,timer:timer,interactive:!!interactive};
    try{if(interactive)localStorage.setItem(GD_PENDING_KEY,'1')}catch(e){}
    try{if(!interactive&&typeof AlsaerNative.gdriveAuthorizeAccount==='function'&&gdEmail())AlsaerNative.gdriveAuthorizeAccount(false,gdEmail());else AlsaerNative.gdriveAuthorize(!!interactive)}catch(e){clearTimeout(timer);gdNativePending=null;try{localStorage.removeItem(GD_PENDING_KEY)}catch(x){}reject(e)}
  });
}
/* إن قتل أندرويد التطبيق أثناء اختيار الحساب ضاعت النتيجة بصمت؛ نوضح ذلك عند العودة لشاشة النسخ */
function gdPendingNotice(){
  try{
    if(localStorage.getItem(GD_PENDING_KEY)&&!gdNativePending){localStorage.removeItem(GD_PENDING_KEY);bkSay('محاولة الربط السابقة لم تكتمل. أعد المحاولة.');return true}
    if(!gdNativePending)localStorage.removeItem(GD_PENDING_KEY);
  }catch(e){}
  return false;
}
/* مسح الرمز القديم من Play ثم إعادة الطلب الصامت مرة واحدة (p.retried يمنع الحلقة) */
var gdClearWait=null;
window.gdriveOnTokenCleared=function(){var f=gdClearWait;gdClearWait=null;if(f)f()};
function gdRetryFresh(p,token,em){
  var done=false;
  var go=function(){
    if(done)return;done=true;gdClearWait=null;
    var timer=setTimeout(function(){gdNativePending=null;reject(new Error('timeout'));try{render()}catch(e){}},60000);
    var reject=p.reject;
    gdNativePending={resolve:p.resolve,reject:p.reject,timer:timer,interactive:p.interactive,retried:true};
    try{AlsaerNative.gdriveAuthorizeAccount(false,em)}catch(e){clearTimeout(timer);gdNativePending=null;p.reject(e)}
  };
  gdClearWait=go;
  try{AlsaerNative.gdriveClearToken(token)}catch(e){go();return}
  setTimeout(go,5000);
}
window.gdriveOnNativeToken=function(token,error,email){
  var p=gdNativePending;
  if(!p){
    /* نتيجة متأخرة بعد انتهاء مهلة JS: إن كانت محاولة تفاعلية معلّقة (علمها محفوظ) أكملها، وإلا فهي شاردة فتُتجاهل */
    var late=false;try{late=localStorage.getItem(GD_PENDING_KEY)==='1'}catch(e){}
    if(!late)return;
    try{localStorage.removeItem(GD_PENDING_KEY)}catch(e){}
    if(error||!token){if(gdAuthError(error||'no-auth'))gdResetAuthState();bkSay(gdAuthFailMsg(error||'no-auth'));try{render()}catch(e){}return}
    gdValidateToken(token).then(function(o){
      if(!o){gdResetAuthState();bkSay(gdAuthFailMsg('auth'));try{render()}catch(e){}return}
      var u=o.forbidden?o.code:'';
      gdNativeLinkOk(null,token,email||String((o.user&&o.user.emailAddress)||''),u);
      bkSay(u?gdPermMsg():'تم ربط Google Drive ✓');try{render()}catch(e){}
    },function(){gdNativeLinkOk(null,token,email,'unverified');bkSay(gdPermMsg());try{render()}catch(e){}});
    return;
  }
  gdNativePending=null;clearTimeout(p.timer);
  try{localStorage.removeItem(GD_PENDING_KEY)}catch(e){}
  if(error||!token){if(gdAuthError(error||'no-auth')&&!(!p.interactive&&Date.now()-gdLinkAt<120000&&gdHasRt())){gdResetAuthState();if(!p.interactive)bkSay('انتهى ربط Google Drive على هذا الجهاز. اضغط «ربط Google Drive» لإعادة الربط.')}p.reject(new Error(error||'no-auth'));try{render()}catch(e){}return}
  gdValidateToken(token).then(function(o){
    if(!o){
      /* 401 على رمز سلّمه Play: غالبًا رمز قديم مخزّن بعد فك الربط. امسحه من ذاكرة Play واطلب رمزًا جديدًا بصمت مرة واحدة فقط */
      var em=email||gdEmail();
      if(!p.retried&&em&&window.AlsaerNative&&typeof AlsaerNative.gdriveClearToken==='function'){gdRetryFresh(p,token,em);return}
      gdResetAuthState();p.reject(new Error('auth'));try{render()}catch(e){}return}
    gdNativeLinkOk(p,token,email||String((o.user&&o.user.emailAddress)||''),o.forbidden?o.code:'');
    p.resolve(token);
  },function(){gdNativeLinkOk(p,token,email,'unverified');p.resolve(token)});
};

/* --- PKCE: مولّد رمز التحقق وتحدّيه (S256) --- */
function gdB64url(bytes){var s='';for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function gdSha256(txt){
  if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error('no-crypto'));
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)).then(function(b){return gdB64url(new Uint8Array(b))});
}

/* --- بدء الربط: يفتح متصفح الجهاز على صفحة موافقة Google --- */
function gdAuthFailMsg(m){
  if(m==='cancelled')return 'أُلغي اختيار الحساب؛ لم نغيّر ملفاتك.';
  if(m==='timeout')return 'انتهت مهلة الربط دون رد من Google. أعد المحاولة.';
  if(m==='busy')return 'محاولة ربط أخرى جارية. انتظر لحظة ثم أعد المحاولة.';
  if(m==='authorization-failed'||m==='consent-required'||m==='resolution-failed'||m==='scope-not-granted')return 'رفضت Google الربط. إن كان الحساب مربوطًا سابقًا فافتح myaccount.google.com/permissions وألغِ إذن «السائر» ثم أعد المحاولة.';
  /* رمز السبب بجانب الرسالة للتشخيص: auth = رد 401 من فحص الرمز */
  var code=m==='auth'?'http-401':(String(m||'unknown').replace(/[^A-Za-z0-9_-]/g,'').slice(0,30)||'unknown');
  return 'تعذّر الربط. اضغط ربط حساب جديد للمحاولة مجددًا.'+' ('+code+')';
}
function gdStartAuth(){
  if(gdNative()){
    if(gdAuthWait)return;
    var wait=Math.max(0,7000-(Date.now()-gdRevAt));
    var go=function(){gdAuthWait=false;bkSay('اختر حساب Google واسمح بالوصول إلى ملف النسخة…');gdNativeToken(true).then(function(){bkSay(gdPerm()?gdPermMsg():'تم ربط Google Drive ✓');render();setTimeout(gdOnOpen,300);
      /* تحقق ثانٍ بعد ثوانٍ: إن ألغى Google الإذن الجديد فور منحه نقول ذلك بدل ترك حالة فارغة */
      setTimeout(function(){var t=gdTok.t;if(!t||!gdHasRt())return;gdValidateToken(t).then(function(o){if(o&&o.forbidden){gdSetPerm(o.code);try{render()}catch(e){}return}if(!o){gdResetAuthState();bkSay('أُلغي الإذن فور منحه (غالبًا من فك الربط السابق). انتظر لحظات ثم اضغط ربط حساب جديد.');try{render()}catch(e){}}},function(){})},3000)},function(e){bkSay(gdAuthFailMsg(e&&e.message));render()})};
    if(wait>0){gdAuthWait=true;bkSay('جارٍ إنهاء فك الربط السابق ثم نفتح اختيار الحساب…');setTimeout(go,wait);render();return}
    go();render();return}
  if(!gdConfigured()){bkSay('ربط Google Drive غير مهيأ في هذه النسخة من التطبيق.');return}
  var rnd=new Uint8Array(32);crypto.getRandomValues(rnd);
  var ver=gdB64url(rnd);
  gdSha256(ver).then(function(ch){
    try{localStorage.setItem(GD_VER_KEY,ver)}catch(e){} /* localStorage لا sessionStorage: يبقى إن قتل أندرويد التطبيق أثناء الموافقة في المتصفح */
    var u='https://accounts.google.com/o/oauth2/v2/auth?client_id='+encodeURIComponent(GD_CLIENT_ID)
      +'&redirect_uri='+encodeURIComponent(GD_REDIRECT)+'&response_type=code&scope='+encodeURIComponent(GD_SCOPE)
      +'&access_type=offline&prompt=consent&code_challenge='+ch+'&code_challenge_method=S256';
    bkSay('أكمل الموافقة في المتصفح ثم عُد للتطبيق…');
    if(window.AlsaerNative&&AlsaerNative.openUrl){if(!AlsaerNative.openUrl(u)){location.href=u}}
    else location.href=u;
  },function(){bkSay('هذا المتصفح لا يدعم التشفير اللازم للربط الآمن.')});
}

/* --- عودة المتصفح بالرمز: يستدعيها MainActivity عبر الـintent --- */
window.gdriveOnRedirect=function(u){
  var code='',err='';
  try{var q=String(u).split('?')[1]||'';q.split('&').forEach(function(p){var kv=p.split('=');
    if(kv[0]==='code')code=decodeURIComponent(kv[1]||'');
    if(kv[0]==='error')err=decodeURIComponent(kv[1]||'')})}catch(e){}
  if(err){bkSay('لم يتم الربط: '+(err==='access_denied'?'رُفض الإذن.':err));return}
  if(!code)return;
  var ver='';try{ver=localStorage.getItem(GD_VER_KEY)||'';localStorage.removeItem(GD_VER_KEY)}catch(e){}
  bkSay('جارٍ إتمام الربط…');
  gdPost('https://oauth2.googleapis.com/token',{client_id:GD_CLIENT_ID,code:code,grant_type:'authorization_code',redirect_uri:GD_REDIRECT,code_verifier:ver})
    .then(function(o){
      if(!o||!o.refresh_token)throw new Error('no-refresh');
      try{localStorage.setItem(GD_RT_KEY,o.refresh_token)}catch(e){}
      gdTok={t:o.access_token||'',exp:Date.now()+((o.expires_in||3600)-60)*1000};
      bkSay('تم ربط Google Drive ✓');try{render()}catch(e){}
    },function(){bkSay('تعذّر إتمام الربط. تحقق من الإنترنت وحاول مجددًا.')});
};

/* مهلة على كل طلب شبكة: بلاها كانت شبكة معلّقة تبقي gdBusy=true وتعطّل الأزرار حتى إعادة تشغيل التطبيق */
function gdFetch(url,opt,ms){
  var ctl=(typeof AbortController==='function')?new AbortController():null;
  var to=ctl?setTimeout(function(){try{ctl.abort()}catch(e){}},ms):null;
  opt=opt||{};if(ctl)opt.signal=ctl.signal;
  return fetch(url,opt).then(function(r){if(to)clearTimeout(to);return r},function(e){
    if(to)clearTimeout(to);
    if(e&&e.name==='AbortError')throw new Error('timeout');
    throw e;
  });
}

function gdPost(url,params){
  var body=Object.keys(params).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(params[k])}).join('&');
  return gdFetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body},15000)
    .then(function(r){return r.json().then(function(o){if(!r.ok)throw new Error(o&&o.error||'http-'+r.status);return o})});
}

/* --- سحب رمز عودة معلّق من الطبقة الأصلية ---
   في الإقلاع البارد يصل الـintent قبل تحميل الصفحة فيضيع أي حقن مبكر؛ لذا تحتفظ MainActivity بالرابط
   وتسحبه الصفحة عند جاهزيتها. الاستهلاك مرة واحدة في الجهة الأصلية يمنع المعالجة المزدوجة. */
window.gdrivePullRedirect=function(){
  try{
    if(!(window.AlsaerNative&&AlsaerNative.consumeGdriveRedirect))return;
    var u=AlsaerNative.consumeGdriveRedirect();
    if(u)window.gdriveOnRedirect(u);
  }catch(e){}
};
/* بعد الإقلاع: اسحب أي رمز معلّق (لا يفعل شيئًا في المتصفح العادي أو بلا رمز معلّق) */
setTimeout(function(){try{window.gdrivePullRedirect()}catch(e){}},1500);

/* --- رمز وصول صالح (من الذاكرة أو عبر رمز التحديث) --- */
function gdToken(){
  if(gdTok.t&&Date.now()<gdTok.exp)return Promise.resolve(gdTok.t);
  if(gdNative()){if(!gdHasRt())return Promise.reject(new Error('no-auth'));return gdNativeToken(false)}
  var rt='';try{rt=localStorage.getItem(GD_RT_KEY)||''}catch(e){}
  if(!rt)return Promise.reject(new Error('no-auth'));
  return gdPost('https://oauth2.googleapis.com/token',{client_id:GD_CLIENT_ID,refresh_token:rt,grant_type:'refresh_token'})
    .then(function(o){gdTok={t:o.access_token,exp:Date.now()+((o.expires_in||3600)-60)*1000};return gdTok.t},function(e){
      /* invalid_grant = رمز التحديث أُلغي أو انتهى: الربط ميت فعليًا — امسحه واطلب إعادة الربط برسالة صحيحة */
      if(String(e&&e.message)==='invalid_grant'){gdTok={t:'',exp:0};try{localStorage.removeItem(GD_RT_KEY)}catch(x){}throw new Error('no-auth')}
      throw e;
    });
}

function gdReq(url,opt){
  opt=opt||{};
  return gdToken().then(function(t){
    opt.headers=Object.assign({'Authorization':'Bearer '+t},opt.headers||{});
    return gdFetch(url,opt,30000).then(function(r){
      if(r.status===401){gdResetAuthState();throw new Error('auth');}
      if(r.status===403)throw new Error('forbidden');
      if(!r.ok)throw new Error('http-'+r.status);
      return r;
    });
  });
}


/* --- رفع النسخة (إنشاء أو استبدال الملف نفسه) --- */
function gdUpload(provided){
  var content=provided||bkBuild(),now=Date.now(),boundary='gd'+now;
  var meta=JSON.stringify({name:'alsaer-backup-'+new Date(now).toISOString().replace(/[:.]/g,'-')+'.json',mimeType:'application/json',appProperties:{alsaerBackup:'v2',backupAt:String(now),encrypted:content.trim().indexOf('ALSAER-ENC1:')===0?'true':'false'}});
  var body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+content+'\r\n--'+boundary+'--';
  return gdReq('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:body});
}

/* --- استعادة آخر نسخة إلى صندوق الاستيراد (دون تطبيقها؛ التأكيد يبقى بيد المستخدم) --- */
/* Restore stays pending until the explicit replacement button is pressed. */
function gdRestorePanel(){
 if(!gdRestoreRaw)return '';
 var h='<section class="gd-dialog" role="dialog" aria-modal="true"><div class="gd-box" id="gd-restore"><h3>'+(gdVerified?'تأكيد استعادة هذه النسخة؟':'التحقق من النسخة المختارة')+'</h3><p class="gd-file-name keepar" dir="ltr">'+esc((gdChosen||{}).name||'backup')+'</p><p class="note">المصدر: '+(gdRestoreSource==='file'?'ملف مستقل':gdRestoreSource==='safety'?'نسخة أمان داخل التطبيق':'Google Drive')+' · '+gdBytes((gdChosen||{}).size)+'</p>';
 if(!gdVerified){if(gdRestoreRaw.trim().indexOf('ALSAER-ENC1:')===0)h+='<input type="password" id="gd-restore-pw" autocomplete="off" aria-label="كلمة مرور النسخة" placeholder="كلمة مرور النسخة المشفّرة">';h+='<button class="btn block" data-a="gdverify">التحقق من الملف</button>'}
 else h+='<p class="note">تاريخ الإنشاء داخل الملف: <b>'+esc(gdDate((gdChosen||{}).at))+'</b><br>بتوقيت هذا الجهاز. الملفات القديمة دون تاريخ لا نختلق لها تاريخًا.</p><p class="note gd-warning">ستُستبدل بيانات التطبيق الحالية. تُحفظ نسخة أمان محلية أولًا، وإن تعذّر حفظها تتوقف الاستعادة.</p><button class="btn bad block" data-a="gdrestore">تأكيد الاستعادة واستبدال البيانات</button>';
 return h+'<p class="note gd-dialog-msg" role="status">'+esc(bkMsg)+'</p><button class="btn ghost block" data-a="gdcancel">إلغاء والاحتفاظ بالبيانات</button></div></section>';
}
function gdRestoreApply(raw){
  /* Parse before creating the safety copy. Invalid downloads must not replace it. */
  var o;try{o=JSON.parse(raw);if(!(o&&o.app==='alsaer'&&o.S&&typeof o.S==='object'&&!Array.isArray(o.S))&&!validBackup(o))throw new Error('invalid');if(!validBackup(o.S||o))throw Error('invalid-backup');fixShape(Object.assign(def(),o.S||o))}catch(e){throw new Error('invalid-backup')}
  var safety=bkBuild();
  try{localStorage.setItem(GD_SAFETY_KEY,safety);if(localStorage.getItem(GD_SAFETY_KEY)!==safety)throw new Error('storage')}catch(e){throw new Error('safety-failed')}
  var statusBefore=gdStatus(),statusAfter=Object.assign({},statusBefore);statusAfter[gdRestoreSource==='file'?'fileRestoreAt':gdRestoreSource==='safety'?'safetyRestoreAt':'driveRestoreAt']=Date.now();
  try{localStorage.setItem(GD_META,JSON.stringify(statusAfter))}catch(e){throw Error('safety-failed')}
  var er=bkApply(raw);if(er){localStorage.setItem(GD_META,JSON.stringify(statusBefore));throw new Error(er)}
  gdVerified='';
  gdRestoreRaw='';bkSay('تمت الاستعادة وحُفظت نسخة الأمان المحلية. جارٍ إعادة التشغيل…');
}

function gdDisconnect(){
  if(gdNative())return gdToken().then(function(t){return gdFetch('https://oauth2.googleapis.com/revoke?token='+encodeURIComponent(t),{method:'POST'},15000)}).then(function(r){if(!r.ok)throw new Error('revoke');gdTok={t:'',exp:0};gdForgetLocalAuth();try{localStorage.removeItem('alsaer_gdrive_native');localStorage.removeItem(GD_RT_KEY)}catch(e){}/* إلغاء محلي كامل: تخزين خدمات Play يمسح أيضًا وإلا أعاد الربطُ التالي رمزًا ملغًى */
  gdNativeRevoke();});
  gdForgetLocalAuth();var rt='';try{rt=localStorage.getItem(GD_RT_KEY)||''}catch(e){}
  gdTok={t:'',exp:0};try{localStorage.removeItem(GD_RT_KEY)}catch(e){}
  if(rt)fetch('https://oauth2.googleapis.com/revoke?token='+encodeURIComponent(rt)).catch(function(){});
}

/* حالة أزرار الرفع/الاستعادة: مشغول (مؤشر دوّار + شريط تقدم) ثم نجاح مؤقت */
var gdPhase='',gdDoneKind='',gdDoneAt=0;
function gdBtnDone(k){return gdDoneKind===k&&Date.now()-gdDoneAt<2600}
function gdBtn(kind,label,ghost,extraDis){
  if(gdPhase===kind)return '<button class="btn'+(ghost?' ghost':'')+'" disabled><span class="gd-spin"></span> '+(kind==='up'?'جارٍ الرفع…':'جارٍ الاستعادة…')+'</button>';
  if(gdBtnDone(kind))return '<button class="btn done" disabled>'+ic('check')+' '+(kind==='up'?'تم الرفع':'تمت الاستعادة')+'</button>';
  return '<button class="btn'+(ghost?' ghost':'')+'" data-a="'+(kind==='up'?'gdup':'gddown')+'"'+((gdBusy||extraDis)?' disabled':'')+'>'+label+'</button>';
}
function gdProgBar(){return gdPhase?'<div class="gd-prog" aria-hidden="true"><i></i></div>':''}
function gdFlashDone(kind){gdDoneKind=kind;gdDoneAt=Date.now();setTimeout(function(){if(gdDoneKind===kind){gdDoneKind='';try{render()}catch(e){}}},2600)}

/* --- بطاقة Google Drive داخل شاشة النسخ الاحتياطي --- */
function gdAct(a,v){
  if(a==='gdfileout'){gdExportFile();return true}
  if(a==='gdfilein'){gdImportFile();return true}
  if(a==='gddelete'){gdLoadPicker('delete');return true}
  if(a==='gdverify'){gdVerifyRestore();return true}
  if(a==='gdpickcancel'){if(!gdBusy){gdPicker=null;gdSelected=[];render()}return true}
  if(a==='gddeleteback'){if(!gdBusy&&gdPicker){gdPicker.confirm=false;render()}return true}
  if(a==='gddeletego'){gdDeleteSelected();return true}
  if(a==='gdpickgo'){
    if(gdBusy||!gdPicker||!gdSelected.length)return true;
    if(gdPicker.mode==='delete'){gdPicker.confirm=true;render();return true}
    var f=gdPicker.files.filter(function(f){return f.id===gdSelected[0]})[0];if(!f)return true;
    gdBusy=true;gdReq('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media').then(function(r){return r.text()}).then(function(raw){gdStage(raw,'drive',f)},function(e){bkSay(gdFailure(e))}).finally(function(){gdBusy=false;render()});return true;
  }

  if(a==='gdauto'){if(gdBusy||gdPicker||gdRestoreRaw||gdDocPending)return true;var p=gdPrefs();p.auto=!p.auto;gdSetPrefs(p);render();return true}
  if(a==='gdpwsave'){
    var pw=(document.getElementById('gd-backup-pw')||{}).value||'';
    if(pw.length<6){bkSay('استخدم كلمة مرور من ٦ أحرف فأكثر واحفظها؛ لا يمكن استعادة النسخة بدونها.');return true}
    try{if(!gdSealPassword(pw))throw Error('seal');var p=gdPrefs();p.encrypt=true;gdSetPrefs(p);gdPwOpen=false;bkSay('فُعّل التشفير الاختياري.');render()}catch(e){bkSay('تعذّر حفظ كلمة المرور بأمان على هذا الجهاز؛ لم يُفعّل التشفير.')}
    return true;
  }
  if(a==='gdcancel'){if(gdBusy)return true;gdRestoreRaw='';gdVerified='';gdChosen=null;bkSay('أُلغيت الاستعادة؛ لم تتغير بياناتك.');render();return true}
  if(a==='gdrestore'){
    if(gdBusy||!gdVerified)return true;
    gdBusy=true;try{gdRestoreApply(gdVerified);gdFlashDone('down')}catch(e){bkSay(e.message==='safety-failed'?'تعذّر حفظ نسخة الأمان؛ أُوقفت الاستعادة.':e.message)}finally{gdBusy=false;render()}return true;
  }
  if(a==='gdconnect'){if(gdBusy||gdPicker||gdRestoreRaw||gdDocPending||gdNativePending)return true;gdStartAuth();return true}
  if(a==='gddisc'){if(gdBusy||gdPicker||gdRestoreRaw||gdDocPending||gdNativePending)return true;
    if(!gdDiscArm){gdDiscArm=true;render();setTimeout(function(){gdDiscArm=false;try{render()}catch(e){}},4000);return true}
    gdDiscArm=false;gdBusy=true;render();Promise.resolve().then(gdDisconnect).then(function(){bkSay('فُصل حساب Google Drive. ملف النسخة يبقى في درايف حتى تحذفه بنفسك.');render()},function(){bkSay('تعذّر إلغاء الوصول. تحقق من الإنترنت، أو ألغِ إذن السائر من حساب Google ثم أعد المحاولة.')}).finally(function(){gdBusy=false;render()});return true}
  if(a==='gdup'){gdRunBackup(false);return true}
  if(a==='gddown'){gdLoadPicker('restore');return true}
  return false;
}

/* Device-only preferences and credentials are intentionally outside S/bkBuild. */
var gdPwOpen=false,gdAutoTried=0,gdEmailLoading=false;
function gdPrefs(){try{return Object.assign({auto:true,encrypt:false,storage:'both',phoneAt:0},JSON.parse(localStorage.getItem('alsaer_drive_prefs')||'{}'))}catch(e){return {auto:true,encrypt:false,storage:'both',phoneAt:0}}}
function gdSetPrefs(p){localStorage.setItem('alsaer_drive_prefs',JSON.stringify(p))}
function gdEmail(){try{return localStorage.getItem('alsaer_gdrive_email')||''}catch(e){return ''}}
function gdForgetLocalAuth(){try{localStorage.removeItem('alsaer_gdrive_email');localStorage.removeItem('alsaer_drive_sealed_pw');var p=gdPrefs();p.encrypt=false;gdSetPrefs(p)}catch(e){}}
function gdSealPassword(pw){if(!window.AlsaerNative||!AlsaerNative.gdriveSeal)return false;var sealed=AlsaerNative.gdriveSeal(pw);if(!sealed)return false;localStorage.setItem('alsaer_drive_sealed_pw',sealed);return true}
function gdOpenPassword(){try{var sealed=localStorage.getItem('alsaer_drive_sealed_pw');return sealed&&window.AlsaerNative&&AlsaerNative.gdriveOpen?AlsaerNative.gdriveOpen(sealed):''}catch(e){return ''}}
function gdPasswordPanel(){return gdPwOpen?'<div class="panel"><p class="note">اختر كلمة مرور للنسخ المشفّرة. تُحفظ على هذا الجهاز بحماية Android لتشغيل النسخ التلقائي. احفظها لديك للاستعادة على جهاز آخر.</p><input id="gd-backup-pw" type="password" autocomplete="new-password" placeholder="كلمة مرور (٦ أحرف فأكثر)"><button class="btn block" data-a="gdpwsave">حفظ كلمة المرور وتفعيل التشفير</button></div>':''}
document.addEventListener('change',function(e){if(e.target&&e.target.hasAttribute('data-gd-encrypt')){var p=gdPrefs();if(e.target.checked){gdPwOpen=true}else{gdPwOpen=false;p.encrypt=false;gdSetPrefs(p);try{localStorage.removeItem('alsaer_drive_sealed_pw')}catch(x){}}render()}});
function gdSavePhone(content){
  if(window.AlsaerNative&&AlsaerNative.gdriveSaveBackup){if(!AlsaerNative.gdriveSaveBackup(content))throw Error('phone-save');}
  else{localStorage.setItem('alsaer_phone_backup_v1',content);if(localStorage.getItem('alsaer_phone_backup_v1')!==content)throw Error('phone-save');}
  var p=gdPrefs();p.phoneAt=Date.now();p.phoneRetry=false;gdSetPrefs(p);
}
function gdPrepareBackup(){
  var pref=gdPrefs(),password=pref.encrypt?gdOpenPassword():'';
  if(pref.encrypt&&!password){gdPwOpen=true;throw Error('password-required')}
  var raw=bkBuild();return pref.encrypt?bkEncrypt(raw,password):Promise.resolve(raw);
}
function gdRunBackup(automatic){
  if(gdBusy||gdPicker||gdRestoreRaw||gdDocPending||gdNativePending)return Promise.resolve(false);
  var pref=gdPrefs(),now=Date.now(),localDue=!automatic||!pref.phoneAt||now-pref.phoneAt>=7*864e5||pref.phoneRetry;
  var driveDue=gdHasRt()&&(!automatic||!gdStatus().driveAt||now-gdStatus().driveAt>=7*864e5);
  gdBusy=true;bkSay('جارٍ تجهيز النسخة…');
  if(!automatic){gdPhase='up';try{render()}catch(e){}}
  return Promise.resolve().then(gdPrepareBackup).then(function(content){
    var localOK=!localDue,driveOK=!driveDue;
    /* A network error must never prevent the independent app-private safety copy. */
    if(localDue)try{gdSavePhone(content);localOK=true}catch(e){var retry=gdPrefs();retry.phoneRetry=true;try{gdSetPrefs(retry)}catch(x){}}
    return (driveDue?gdUpload(content).then(function(){S.gdAt=Date.now();gdStatusSet('driveAt',S.gdAt);save();driveOK=true},function(){}):Promise.resolve()).then(function(){
      if(!automatic&&driveDue&&driveOK)gdFlashDone('up');
      bkSay((localDue?(localOK?'حُفظت نسخة الأمان داخل التطبيق. ':'تعذّر حفظ نسخة الأمان داخل التطبيق. '):'')+(driveDue?(driveOK?'تم الرفع إلى Drive.':'تعذّر الرفع إلى Drive؛ تحقق من الاتصال وصلاحية الربط.'):(gdHasRt()?'نسخة Drive حديثة ولم تُرفع مجددًا.':'لم يُرفع شيء إلى Drive؛ الحساب غير مربوط.')));
      return localOK&&driveOK;
    });
  }).catch(function(e){bkSay(e.message==='password-required'?'أدخل كلمة مرور النسخ المشفّرة أولًا.':'تعذّر تجهيز النسخة؛ لم يُرفع شيء.');return false}).finally(function(){gdBusy=false;gdPhase='';if(automatic&&typeof bkDirty==='function'&&bkDirty())return;try{render()}catch(e){}});
}
function gdOnOpen(){
  if(document.hidden||!S.onboarded||gdBusy||gdPicker||gdRestoreRaw||gdDocPending||gdNativePending)return;
  if(gdHasRt()&&!gdEmail()&&!gdEmailLoading&&gdNative()){gdEmailLoading=true;gdToken().then(function(t){return gdReq('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)').then(function(r){return r.json()}).then(function(o){if(o.user&&o.user.emailAddress)localStorage.setItem('alsaer_gdrive_email',o.user.emailAddress)})},function(){}).catch(function(){}).finally(function(){gdEmailLoading=false;render();gdAutoOnOpen()});return}
  gdAutoOnOpen();
}
function gdAutoOnOpen(){
  if(document.hidden||!S.onboarded||gdBusy||gdPicker||gdRestoreRaw||gdDocPending||gdNativePending)return;
  var now=Date.now(),p=gdPrefs();if(!p.auto||now-gdAutoTried<3600000)return;
  var localDue=!p.phoneAt||now-p.phoneAt>=7*864e5||p.phoneRetry,driveDue=gdHasRt()&&now-(gdStatus().driveAt||0)>=7*864e5;
  if(!localDue&&!driveDue)return;
  if(gdPicker||gdRestoreRaw||gdDocPending)return;
  gdAutoTried=now;gdRunBackup(true);
}
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(gdOnOpen,1000)});
setTimeout(gdOnOpen,3500);
/* Versioned backup metadata is device-local and cannot be rolled back by restore. */
var GD_META='alsaer_backup_status_v2',gdPicker=null,gdSelected=[],gdChosen=null,gdVerified='',gdDocPending=false;
function gdStatus(){try{var p=JSON.parse(localStorage.getItem(GD_META)||'null');if(p)return p;p={driveAt:S.gdAt||0};localStorage.setItem(GD_META,JSON.stringify(p));return p}catch(e){return {}}}
function gdStatusSet(k,t){if(k==='driveAt'||k==='driveRestoreAt')gdSetPerm('');var p=gdStatus();p[k]=t;localStorage.setItem(GD_META,JSON.stringify(p))}
function gdDate(t){if(!t)return 'لا يوجد بعد';var d=new Date(Number(t)||t);return isNaN(d.getTime())?'تاريخ غير معروف':d.toLocaleString('ar-EG')}
function gdBytes(n){return ar(Math.ceil((Number(n)||0)/1024))+' كيلوبايت'}
function gdListFiles(){
  var all=[],seen={};
  function page(token){
    var q="trashed=false and (appProperties has { key='alsaerBackup' and value='v2' } or name='alsaer-backup.json')";
    return gdReq('https://www.googleapis.com/drive/v3/files?spaces=drive&corpora=user&q='+encodeURIComponent(q)+'&orderBy=modifiedTime%20desc&pageSize=100&fields='+encodeURIComponent('nextPageToken,incompleteSearch,files(id,name,size,modifiedTime,appProperties,capabilities(canDelete),ownedByMe,mimeType)')+(token?'&pageToken='+encodeURIComponent(token):''))
      .then(function(r){return r.json()}).then(function(o){
        if(o.incompleteSearch)throw Error('incomplete-list');
        (o.files||[]).forEach(function(f){if(f.id&&!seen[f.id]&&f.mimeType!=='application/vnd.google-apps.folder'&&((f.appProperties||{}).alsaerBackup==='v2'||f.name===GD_FILE)){seen[f.id]=true;all.push(f)}});
        if(o.nextPageToken){if(seen['page:'+o.nextPageToken])throw Error('incomplete-list');seen['page:'+o.nextPageToken]=true;return page(o.nextPageToken)}
        return all;
      });
  }return page('');
}
function gdFailure(e){var m=String(e&&e.message);return m==='auth'||m==='no-auth'?'انتهت صلاحية الربط. أعد ربط حساب Google.':m==='forbidden'?'لا يوجد إذن كافٍ لهذه العملية. لم نؤكد نجاحها.':m==='incomplete-list'?'قائمة Drive غير مكتملة؛ أُوقفت العملية بأمان.':'تعذّر الاتصال أو التحقق من النتيجة. حاول مجددًا؛ لا نعدّ العملية ناجحة.'}
function gdLoadPicker(mode){
  if(gdBusy||gdPicker||gdRestoreRaw||gdDocPending||gdNativePending)return Promise.resolve(false);
  if(!gdHasRt()){bkSay('اربط حساب Google أولًا.');return Promise.resolve(false)}
  gdBusy=true;bkSay('جارٍ قراءة نسخ Drive…');
  if(mode==='restore'){gdPhase='down';try{render()}catch(e){}}
  return gdListFiles().then(function(files){gdPicker={mode:mode,files:files,confirm:false};gdSelected=[];bkSay(files.length?'اختر الملف المطلوب.':'لا توجد نسخ متاحة لهذا التطبيق في Drive.');render();return true},function(e){bkSay(gdFailure(e));return false}).finally(function(){gdBusy=false;gdPhase='';render()});
}
function gdPickerPanel(){
  if(!gdPicker)return '';
  var del=gdPicker.mode==='delete',h='<section class="gd-dialog" role="dialog" aria-modal="true"><div class="gd-box"><h3>'+(del?'اختر نسخ Drive للحذف':'اختر النسخة للاستعادة')+'</h3><p class="note">Google Drive · '+ar(gdPicker.files.length)+' ملفات · الأوقات بتوقيت هذا الجهاز</p>';
  if(gdPicker.confirm){
    h+='<p class="note">ستُحذف نهائيًا الملفات المحددة فقط:</p>';
    gdPicker.files.filter(function(f){return gdSelected.indexOf(f.id)>=0}).forEach(function(f){h+='<p class="gd-file-name keepar" dir="ltr">'+esc(f.name)+'<small>'+esc(f.id)+'</small></p>'});
    h+='<p class="note gd-warning">الحذف نهائي دون سلة المهملات. احفظ نسخة مستقلة أولًا. لن تُحذف بيانات التطبيق أو ملفاتك الأخرى.</p><p class="note">النسخ التلقائي '+(gdPrefs().auto?'مفعّل، وقد ينشئ نسخة جديدة عند فتح التطبيق لاحقًا.':'متوقف.')+'</p><label class="note"><input id="gd-delete-ack" type="checkbox"> أفهم الحذف النهائي للملفات المحددة</label><button class="btn bad block" data-a="gddeletego" disabled>حذف الملفات المحددة نهائيًا</button><button class="btn ghost block" data-a="gddeleteback">رجوع</button>';
  }else{
    gdPicker.files.forEach(function(f){var legacy=(f.appProperties||{}).alsaerBackup!=='v2',disabled=del&&(!f.ownedByMe||!(f.capabilities||{}).canDelete);h+='<label class="gd-option"><input type="'+(del?'checkbox':'radio')+'" name="gd-version" data-gd-select="'+esc(f.id)+'" '+(gdSelected.indexOf(f.id)>=0?'checked ':'')+(disabled?'disabled':'')+'><span><b>'+esc(gdDate((f.appProperties||{}).backupAt||f.modifiedTime))+'</b><small><bdi class="keepar" dir="ltr">'+esc(f.name)+'</bdi> · '+gdBytes(f.size)+(legacy?' · ملف قديم، تاريخ تعديل Drive':' · تاريخ إنشاء مسجّل'+((f.appProperties||{}).encrypted==='true'?' · مشفّرة':''))+(disabled?' · غير قابل للحذف':'')+'</small></span></label>'});
    h+='<p class="note">لا نحذف تلقائيًا أي نسخة. تواريخ القائمة تُراجع داخل الملف بعد اختياره. الملفات القديمة تُحدد صراحةً ولا نؤكد مصدرها من الاسم وحده.</p><button class="btn block" data-a="gdpickgo" '+(!gdSelected.length?'disabled':'')+'>'+(del?'مراجعة الملفات المحددة للحذف':'متابعة والتحقق من النسخة')+'</button>';
    if(!del)h+='<button class="btn ghost block" data-a="gdfilein">اختيار ملف مستقل من ملفات Android</button>';
  }
  return h+'<p class="note gd-dialog-msg" role="status">'+esc(bkMsg)+'</p><button class="btn ghost block" data-a="gdpickcancel">إلغاء</button></div></section>';
}
function gdStage(raw,source,file){gdRestoreRaw=String(raw||'');gdRestoreSource=source;gdChosen=file||{};gdVerified='';gdPicker=null;gdSelected=[];bkSay('اختر كلمة المرور إن لزم ثم تحقق من الملف قبل الاستعادة.');render()}
function gdValidateRestore(raw){var o=JSON.parse(raw);if(!(o&&o.app==='alsaer'&&o.S&&typeof o.S==='object'&&!Array.isArray(o.S))&&!validBackup(o))throw Error('invalid-backup');if(!validBackup(o.S||o))throw Error('invalid-backup');fixShape(Object.assign(def(),o.S||o));return o}
function gdVerifyRestore(){
  if(gdBusy||!gdRestoreRaw)return Promise.resolve(false);var pw=(document.getElementById('gd-restore-pw')||{}).value||'';
  gdBusy=true;
  return Promise.resolve().then(function(){return gdRestoreRaw.trim().indexOf('ALSAER-ENC1:')===0?bkDecrypt(gdRestoreRaw.trim(),pw):gdRestoreRaw}).then(function(raw){var o=gdValidateRestore(raw);gdChosen=gdChosen||{};gdChosen.at=o.at||0;gdVerified=raw;bkSay('تم التحقق. راجع النسخة قبل تأكيد استبدال البيانات.');return true}).catch(function(){bkSay('كلمة المرور غير صحيحة أو الملف غير صالح؛ لم تتغير بياناتك.');return false}).finally(function(){gdBusy=false;render()});
}
function gdDeleteSelected(){
  if(gdBusy||!gdPicker||!gdPicker.confirm||!(document.getElementById('gd-delete-ack')||{}).checked)return Promise.resolve(false);
  var targets=gdPicker.files.filter(function(f){return gdSelected.indexOf(f.id)>=0&&f.ownedByMe&&(f.capabilities||{}).canDelete}),deleted=0,uncertain=0;
  if(!targets.length)return Promise.resolve(false);gdBusy=true;
  return targets.reduce(function(chain,f){return chain.then(function(){return gdReq('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id),{method:'DELETE'}).then(function(){deleted++},function(){uncertain++})})},Promise.resolve()).then(function(){
    /* Listing reconciles uncertainty, but absence alone cannot prove deletion after a permission change. */
    return gdListFiles().then(function(files){var remain=targets.filter(function(t){return files.some(function(f){return f.id===t.id})}).length;bkSay('حذف مؤكد: '+ar(deleted)+' من '+ar(targets.length)+' · ما زال ظاهرًا: '+ar(remain)+(uncertain?' · نتائج غير مؤكدة: '+ar(uncertain)+'. راجع Drive قبل إعادة المحاولة.':'.'));gdPicker={mode:'delete',files:files,confirm:false};gdSelected=[]},function(e){bkSay('حذف مؤكد: '+ar(deleted)+' من '+ar(targets.length)+'. تعذّر تحديث القائمة. '+gdFailure(e));gdPicker=null});
  }).finally(function(){gdBusy=false;render()});
}
function gdExportFile(){
  if(gdBusy||gdDocPending||gdPicker||gdRestoreRaw||gdNativePending)return Promise.resolve(false);
  if(!(window.AlsaerNative&&AlsaerNative.backupExport)){bkSay('حفظ الملف المستقل متاح في تطبيق Android عبر منتقي الملفات.');return Promise.resolve(false)}
  gdBusy=true;return Promise.resolve().then(gdPrepareBackup).then(function(content){gdDocPending=true;AlsaerNative.backupExport(content,'alsaer-backup-'+new Date().toISOString().replace(/[:.]/g,'-')+'.txt');bkSay('اختر مكان الملف ثم أكّد الحفظ من Android.');return true}).catch(function(){gdDocPending=false;bkSay('تعذّر تجهيز الملف.');return false}).finally(function(){gdBusy=false;render()});
}
function gdImportFile(){
  if(gdBusy||gdDocPending||gdRestoreRaw||gdNativePending)return;
  if(!(window.AlsaerNative&&AlsaerNative.backupImport)){bkSay('اختيار الملفات متاح في تطبيق Android.');return}
  gdPicker=null;gdDocPending=true;try{AlsaerNative.backupImport()}catch(e){gdDocPending=false;bkSay('تعذّر فتح منتقي الملفات؛ أعد المحاولة.')}render();
}
window.gdriveOnDocument=function(status,raw,name,size){
  gdDocPending=false;
  if(status==='saved'){try{gdStatusSet('fileAt',Date.now())}catch(e){bkSay('حُفظ الملف لكن تعذّر تسجيل وقت الحفظ.');render();return}bkSay('حُفظ الملف المستقل. احتفظ بنسخة على جهاز أو خدمة أخرى.')}
  else if(status==='opened'){gdStage(raw,'file',{name:name,size:size});return}
  else bkSay(status==='cancelled'?'أُلغي اختيار الملف؛ لم تتغير البيانات.':'تعذّر حفظ/قراءة الملف. قد يكون ملف الحفظ جزئيًا؛ لا تعتمد عليه قبل إعادة الحفظ بنجاح.');render();
};
document.addEventListener('change',function(e){var t=e.target;if(!t)return;if(t.hasAttribute('data-gd-select')&&gdPicker&&!gdBusy){var id=t.getAttribute('data-gd-select');if(gdPicker.mode==='delete'){var i=gdSelected.indexOf(id);if(t.checked&&i<0)gdSelected.push(id);if(!t.checked&&i>=0)gdSelected.splice(i,1)}else gdSelected=[id];render()}if(t.id==='gd-delete-ack'){var b=document.querySelector('[data-a=gddeletego]');if(b)b.disabled=!t.checked}});

function gdMountDialog(){
 var old=document.getElementById('gd-dialog-host');if(old)old.remove();
 var dialog=app.querySelector('.gd-dialog');if(!dialog)return;
 var host=document.createElement('div');host.id='gd-dialog-host';host.appendChild(dialog);document.body.appendChild(host);
             }
