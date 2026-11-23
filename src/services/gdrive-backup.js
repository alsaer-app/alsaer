/* ===== نسخ احتياطي اختياري إلى Google Drive =====
   يعمل فقط بعد أن يضع مطوّر التطبيق معرّف عميل OAuth خاصه في GD_CLIENT_ID (انظر docs/GDRIVE-SETUP-AR.md).
   أقل صلاحية ممكنة: drive.file — الوصول للملفات التي ينشئها التطبيق فقط (ملف alsaer-backup.json).
   لا يُخزَّن أي سر في المستودع؛ رمز التحديث يبقى على الجهاز مثل بقية البيانات (غير مشفّر سكونًا). */
var GD_CLIENT_ID='794360516005-hrt6lc8vtrgd5k9ok9476f9gdkh98rt8.apps.googleusercontent.com'; /* عميل OAuth نوع Android — عام وليس سرًا */
var GD_REDIRECT='com.ahmedalajmi.alsaer://gdrive';
var GD_SCOPE='https://www.googleapis.com/auth/drive.file';
var GD_FILE='alsaer-backup.json';
var GD_RT_KEY='alsaer_gdrive_rt',GD_VER_KEY='alsaer_gd_verifier';
var GD_SAFETY_KEY='alsaer_drive_restore_safety_v1',gdRestoreRaw='',gdRestoreSource='drive';
var gdTok={t:'',exp:0},gdBusy=false;

function gdConfigured(){return /^[0-9a-z-]+\.apps\.googleusercontent\.com$/i.test(GD_CLIENT_ID)}
function gdNative(){return !!(window.AlsaerNative&&typeof AlsaerNative.gdriveAuthorize==='function')}
function gdHasRt(){try{return gdNative()?localStorage.getItem('alsaer_gdrive_native')==='1':!!localStorage.getItem(GD_RT_KEY)}catch(e){return false}}
var gdNativePending=null;
function gdNativeToken(interactive){
  if(gdNativePending)return Promise.reject(new Error('busy'));
  return new Promise(function(resolve,reject){
    var timer=setTimeout(function(){gdNativePending=null;reject(new Error('timeout'))},120000);
    gdNativePending={resolve:resolve,reject:reject,timer:timer};
    try{AlsaerNative.gdriveAuthorize(!!interactive)}catch(e){clearTimeout(timer);gdNativePending=null;reject(e)}
  });
}
window.gdriveOnNativeToken=function(token,error,email){
  if(!error){try{if(email)localStorage.setItem('alsaer_gdrive_email',String(email));else localStorage.removeItem('alsaer_gdrive_email')}catch(e){}}
  var p=gdNativePending;if(!p)return;gdNativePending=null;clearTimeout(p.timer);
  if(error||!token){p.reject(new Error(error||'no-auth'));return}
  gdTok={t:token,exp:Date.now()+50*60000};
  try{localStorage.setItem('alsaer_gdrive_native','1');localStorage.removeItem(GD_RT_KEY)}catch(e){}
  p.resolve(token);
};

/* --- PKCE: مولّد رمز التحقق وتحدّيه (S256) --- */
function gdB64url(bytes){var s='';for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function gdSha256(txt){
  if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error('no-crypto'));
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)).then(function(b){return gdB64url(new Uint8Array(b))});
}

/* --- بدء الربط: يفتح متصفح الجهاز على صفحة موافقة Google --- */
function gdStartAuth(){
  if(gdNative()){bkSay('اختر حساب Google واسمح بالوصول إلى ملف النسخة…');gdNativeToken(true).then(function(){bkSay('تم ربط Google Drive ✓');render();setTimeout(gdOnOpen,300)},function(e){bkSay(e.message==='cancelled'?'أُلغي الربط.':'تعذّر الربط. تحقق من خدمات Google Play وإعداد عميل Android وحاول مجددًا.')});return}
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
      if(r.status===401||r.status===403)throw new Error('auth');
      if(!r.ok)throw new Error('http-'+r.status);
      return r;
    });
  });
}

function gdFindFile(){
  return gdReq('https://www.googleapis.com/drive/v3/files?q='+encodeURIComponent("name='"+GD_FILE+"' and trashed=false")+'&orderBy=modifiedTime%20desc&fields=files(id,modifiedTime)&pageSize=1')
    .then(function(r){return r.json()}).then(function(o){return o.files&&o.files.length?o.files[0]:null});
}

/* --- رفع النسخة (إنشاء أو استبدال الملف نفسه) --- */
function gdUpload(provided){
  var content=provided||bkBuild();
  return gdFindFile().then(function(f){
    if(f){
      return gdReq('https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(f.id)+'?uploadType=media',
        {method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body:content});
    }
    var b='gd'+Date.now();
    var meta=JSON.stringify({name:GD_FILE,mimeType:'application/json'});
    var body='--'+b+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta
      +'\r\n--'+b+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+content+'\r\n--'+b+'--';
    return gdReq('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body:body});
  });
}

/* --- استعادة آخر نسخة إلى صندوق الاستيراد (دون تطبيقها؛ التأكيد يبقى بيد المستخدم) --- */
function gdDownload(){
  return gdFindFile().then(function(f){
    if(!f)throw new Error('no-file');
    return gdReq('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media')
      .then(function(r){return r.text()});
  });
}

/* Restore stays pending until the explicit replacement button is pressed. */
function gdSafetyExists(){try{return !!localStorage.getItem(GD_SAFETY_KEY)}catch(e){return false}}
function gdRestorePanel(){
  var h='';
  if(gdRestoreRaw){
    h+='<div class="panel" id="gd-restore"><p class="note">'+(gdRestoreSource==='safety'?'استرجاع النسخة المحلية قبل آخر استعادة.':'نُزّلت آخر نسخة من Google Drive.')+' ستُستبدل بياناتك الحالية بعد التأكيد. تُحفظ نسخة أمان محلية تلقائيًا أولًا، للحماية عند حدوث خطأ.</p>';
    if(gdRestoreRaw.trim().indexOf('ALSAER-ENC1:')===0)h+='<input type="password" id="gd-restore-pw" autocomplete="off" aria-label="كلمة مرور النسخة" placeholder="كلمة مرور النسخة المشفّرة">';
    h+='<div class="acts"><button class="btn bad" data-a="gdrestore">تأكيد الاستعادة واستبدال البيانات</button><button class="btn ghost" data-a="gdcancel">إلغاء</button></div></div>';
  }
  return h;
}
function gdRestoreApply(raw){
  /* Parse before creating the safety copy. Invalid downloads must not replace it. */
  var o;try{o=JSON.parse(raw);if(!(o&&o.app==='alsaer'&&o.S&&typeof o.S==='object'&&!Array.isArray(o.S))&&!validBackup(o))throw new Error('invalid');fixShape(Object.assign(def(),o.S||o))}catch(e){throw new Error('invalid-backup')}
  var safety=bkBuild();
  try{localStorage.setItem(GD_SAFETY_KEY,safety);if(localStorage.getItem(GD_SAFETY_KEY)!==safety)throw new Error('storage')}catch(e){throw new Error('safety-failed')}
  var er=bkApply(raw);if(er)throw new Error(er);
  gdRestoreRaw='';bkSay('تمت الاستعادة وحُفظت نسخة الأمان المحلية. جارٍ إعادة التشغيل…');
}

function gdDisconnect(){
  if(gdNative())return gdToken().then(function(t){return gdFetch('https://oauth2.googleapis.com/revoke?token='+encodeURIComponent(t),{method:'POST'},15000)}).then(function(r){if(!r.ok)throw new Error('revoke');gdTok={t:'',exp:0};gdForgetLocalAuth();try{localStorage.removeItem('alsaer_gdrive_native');localStorage.removeItem(GD_RT_KEY)}catch(e){}});
  gdForgetLocalAuth();var rt='';try{rt=localStorage.getItem(GD_RT_KEY)||''}catch(e){}
  gdTok={t:'',exp:0};try{localStorage.removeItem(GD_RT_KEY)}catch(e){}
  if(rt)fetch('https://oauth2.googleapis.com/revoke?token='+encodeURIComponent(rt)).catch(function(){});
}

/* --- بطاقة Google Drive داخل شاشة النسخ الاحتياطي --- */
function vGdCard(){
  if(!gdConfigured())return '';
  var h='<section class="card"><h3>نسخة Google Drive</h3>';
  if(!gdHasRt()){
    h+='<p class="note">اربط حساب Google لرفع نسختك الاحتياطية إلى ملف واحد في درايف («'+GD_FILE+'») واستعادتها على أي جهاز. لا يرى التطبيق إلا الملفات التي ينشئها هو.</p>'
      +'<div class="acts"><button class="btn" data-a="gdconnect">'+ic('cloud')+' ربط Google Drive</button></div>';
  }else{
    h+='<p class="note">الحساب مربوط ✓'+(S.gdAt?' — آخر رفع: <b>'+bkAgo(S.gdAt)+'</b>':' — لم ترفع نسخة بعد')+'</p>'
      +'<div class="acts"><button class="btn'+(gdBusy?' dis':'')+'" data-a="gdup">رفع نسخة الآن</button>'
      +'<button class="btn ghost'+(gdBusy?' dis':'')+'" data-a="gddown">استعادة آخر نسخة</button>'
      +'<button class="btn ghost" data-a="gddisc">فصل الحساب</button></div>';
  }
  return h+'</section>';
}

function gdAct(a,v){
  if(a==='gdauto'){var p=gdPrefs();p.auto=!p.auto;gdSetPrefs(p);render();return true}
  if(a==='gdstore'){if(gdBusy)return true;var p=gdPrefs();p.storage=v==='drive'?'drive':'both';gdSetPrefs(p);render();return true}
  if(a==='gdpwsave'){
    var pw=(document.getElementById('gd-backup-pw')||{}).value||'';
    if(pw.length<6){bkSay('استخدم كلمة مرور من ٦ أحرف فأكثر واحفظها؛ لا يمكن استعادة النسخة بدونها.');return true}
    try{if(!gdSealPassword(pw))throw Error('seal');var p=gdPrefs();p.encrypt=true;gdSetPrefs(p);gdPwOpen=false;bkSay('فُعّل التشفير الاختياري.');render()}catch(e){bkSay('تعذّر حفظ كلمة المرور بأمان على هذا الجهاز؛ لم يُفعّل التشفير.')}
    return true;
  }
  if(a==='gdcancel'){if(gdBusy)return true;gdRestoreRaw='';bkSay('أُلغيت الاستعادة؛ لم تتغير بياناتك.');render();return true}
  if(a==='gdsafety'){
    if(gdBusy)return true;
    try{gdRestoreRaw=localStorage.getItem(GD_SAFETY_KEY)||''}catch(e){gdRestoreRaw=''}
    gdRestoreSource='safety';bkSay(gdRestoreRaw?'راجع تأكيد استرجاع نسخة الأمان.':'لا توجد نسخة أمان محلية.');render();return true;
  }
  if(a==='gdrestore'){
    if(gdBusy||!gdRestoreRaw)return true;
    var raw=gdRestoreRaw,pw=(document.getElementById('gd-restore-pw')||{}).value||'';
    if(raw.trim().indexOf('ALSAER-ENC1:')===0&&!pw){bkSay('أدخل كلمة مرور النسخة المشفّرة أولًا.');return true}
    gdBusy=true;bkSay('جارٍ التحقق من النسخة وحفظ نسخة الأمان…');
    var dec=raw.trim().indexOf('ALSAER-ENC1:')===0?bkDecrypt(raw.trim(),pw).catch(function(){throw new Error('decrypt-failed')}):Promise.resolve(raw);
    dec.then(gdRestoreApply).catch(function(e){
      bkSay(e.message==='decrypt-failed'?'كلمة المرور غير صحيحة أو النسخة تالفة؛ لم تتغير بياناتك.':e.message==='safety-failed'?'تعذّر حفظ نسخة الأمان المحلية. أُوقفت الاستعادة ولم تتغير بياناتك.':e.message==='invalid-backup'?'ملف النسخة غير صالح؛ لم تتغير بياناتك.':e.message);
    }).finally(function(){gdBusy=false});return true;
  }
  if(a==='gdconnect'){gdStartAuth();return true}
  if(a==='gddisc'){if(gdBusy)return true;Promise.resolve(gdDisconnect()).then(function(){bkSay('فُصل حساب Google Drive. ملف النسخة يبقى في درايف حتى تحذفه بنفسك.');render()},function(){bkSay('تعذّر إلغاء الوصول. تحقق من الإنترنت، أو ألغِ إذن السائر من حساب Google ثم أعد المحاولة.')});return true}
  if(a==='gdup'){gdRunBackup(false);return true}
  if(a==='gddown'){
    if(!gdHasRt()){bkSay('اربط حساب Google أولًا.');return true}
    if(gdBusy)return true;gdBusy=true;bkSay('جارٍ استعادة آخر نسخة من درايف…');
    gdDownload().then(function(txt){
      gdBusy=false;gdRestoreRaw=String(txt||'');gdRestoreSource='drive';bkConfirm=false;
      bkSay(gdRestoreRaw.trim()?'نُزّلت النسخة. أكّد الاستعادة أدناه لاستبدال بياناتك.':'ملف النسخة فارغ؛ لم تتغير بياناتك.');render();
    },function(e){
      gdBusy=false;var m2=String(e&&e.message);
      bkSay(m2==='no-file'?'لا توجد نسخة في درايف بعد — ارفع نسخة أولًا.':(m2==='no-auth'||m2==='auth')?'انتهت صلاحية الربط — افصل الحساب وأعد ربطه.':'تعذّر التنزيل. تحقق من الإنترنت وحاول مجددًا.');
      try{render()}catch(x){} /* كذلك بعد فشل التنزيل */
    });
    return true}
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
  var p=gdPrefs();p.phoneAt=Date.now();gdSetPrefs(p);
}
function gdRunBackup(automatic){
  if(gdBusy||!gdHasRt()){if(!automatic)bkSay('اربط حساب Google أولًا.');return Promise.resolve(false)}
  var pref=gdPrefs(),password=pref.encrypt?gdOpenPassword():'';
  if(pref.encrypt&&!password){if(!automatic){gdPwOpen=true;bkSay('أدخل كلمة مرور النسخ المشفّرة لتفعيلها على هذا الجهاز.');render()}return Promise.resolve(false)}
  gdBusy=true;bkSay('جارٍ تجهيز النسخة ورفعها إلى Google Drive…');
  var raw=bkBuild(),prepare=pref.encrypt?bkEncrypt(raw,password):Promise.resolve(raw);
  return prepare.then(function(content){return gdUpload(content).then(function(){S.gdAt=Date.now();save();if(pref.storage==='both')gdSavePhone(content);return true})}).then(function(){bkSay(pref.storage==='both'?'تم النسخ إلى Drive والهاتف داخل مجلد ملفات التطبيق.':'تم النسخ إلى Google Drive.');return true},function(e){bkSay(e.message==='phone-save'?'تم الرفع إلى Drive، لكن تعذّر حفظ نسخة الهاتف.':'تعذّر النسخ. تحقق من الاتصال وصلاحية الربط وحاول مجددًا.');return false}).finally(function(){gdBusy=false;try{render()}catch(e){}});
}
function gdOnOpen(){
  if(document.hidden||!S.onboarded||!gdHasRt()||gdBusy)return;
  if(!gdEmail()&&!gdEmailLoading&&gdNative()){gdEmailLoading=true;gdNativeToken(false).then(function(t){return gdReq('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)').then(function(r){return r.json()}).then(function(o){if(o.user&&o.user.emailAddress)localStorage.setItem('alsaer_gdrive_email',o.user.emailAddress)})},function(){}).catch(function(){}).finally(function(){gdEmailLoading=false;render();gdAutoOnOpen()});return}
  gdAutoOnOpen();
}
function gdAutoOnOpen(){
  if(document.hidden||!S.onboarded||!gdHasRt()||gdBusy)return;
  var now=Date.now(),p=gdPrefs();if(!p.auto||now-(S.gdAt||0)<7*864e5||now-gdAutoTried<3600000)return;
  gdAutoTried=now;gdRunBackup(true);
}
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(gdOnOpen,1000)});
setTimeout(gdOnOpen,3500);
