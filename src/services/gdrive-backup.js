/* ===== نسخ احتياطي اختياري إلى Google Drive =====
   يعمل فقط بعد أن يضع مطوّر التطبيق معرّف عميل OAuth خاصه في GD_CLIENT_ID (انظر docs/GDRIVE-SETUP-AR.md).
   أقل صلاحية ممكنة: drive.file — الوصول للملفات التي ينشئها التطبيق فقط (ملف alsaer-backup.json).
   لا يُخزَّن أي سر في المستودع؛ رمز التحديث يبقى على الجهاز مثل بقية البيانات (غير مشفّر سكونًا). */
var GD_CLIENT_ID='794360516005-hrt6lc8vtrgd5k9ok9476f9gdkh98rt8.apps.googleusercontent.com'; /* عميل OAuth نوع Android — عام وليس سرًا */
var GD_REDIRECT='com.ahmedalajmi.alsaer://gdrive';
var GD_SCOPE='https://www.googleapis.com/auth/drive.file';
var GD_FILE='alsaer-backup.json';
var GD_RT_KEY='alsaer_gdrive_rt',GD_VER_KEY='alsaer_gd_verifier';
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
window.gdriveOnNativeToken=function(token,error){
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
  if(gdNative()){bkSay('اختر حساب Google واسمح بالوصول إلى ملف النسخة…');gdNativeToken(true).then(function(){bkSay('تم ربط Google Drive ✓');render()},function(e){bkSay(e.message==='cancelled'?'أُلغي الربط.':'تعذّر الربط. تحقق من خدمات Google Play وإعداد عميل Android وحاول مجددًا.')});return}
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
  return gdReq('https://www.googleapis.com/drive/v3/files?q='+encodeURIComponent("name='"+GD_FILE+"' and trashed=false")+'&fields=files(id,modifiedTime)&pageSize=1')
    .then(function(r){return r.json()}).then(function(o){return o.files&&o.files.length?o.files[0]:null});
}

/* --- رفع النسخة (إنشاء أو استبدال الملف نفسه) --- */
function gdUpload(){
  var content=bkBuild();
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

/* --- تنزيل آخر نسخة إلى صندوق الاستيراد (دون تطبيقها؛ التأكيد يبقى بيد المستخدم) --- */
function gdDownload(){
  return gdFindFile().then(function(f){
    if(!f)throw new Error('no-file');
    return gdReq('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media')
      .then(function(r){return r.text()});
  });
}

function gdDisconnect(){
  if(gdNative())return gdToken().then(function(t){return gdFetch('https://oauth2.googleapis.com/revoke?token='+encodeURIComponent(t),{method:'POST'},15000)}).then(function(r){if(!r.ok)throw new Error('revoke');gdTok={t:'',exp:0};try{localStorage.removeItem('alsaer_gdrive_native');localStorage.removeItem(GD_RT_KEY)}catch(e){}});
  var rt='';try{rt=localStorage.getItem(GD_RT_KEY)||''}catch(e){}
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
      +'<button class="btn ghost'+(gdBusy?' dis':'')+'" data-a="gddown">تنزيل آخر نسخة</button>'
      +'<button class="btn ghost" data-a="gddisc">فصل الحساب</button></div>';
  }
  return h+'</section>';
}

function gdAct(a){
  if(a==='gdconnect'){gdStartAuth();return true}
  if(a==='gddisc'){Promise.resolve(gdDisconnect()).then(function(){bkSay('فُصل حساب Google Drive. ملف النسخة يبقى في درايف حتى تحذفه بنفسك.');render()},function(){bkSay('تعذّر إلغاء الوصول. تحقق من الإنترنت، أو ألغِ إذن السائر من حساب Google ثم أعد المحاولة.')});return true}
  if(a==='gdup'){
    if(gdBusy)return true;gdBusy=true;bkSay('جارٍ الرفع إلى Google Drive…');
    gdUpload().then(function(){
      gdBusy=false;S.gdAt=Date.now();save();bkSay('رُفعت النسخة إلى درايف ✓ («'+GD_FILE+'»)');try{render()}catch(e){}
    },function(e){
      gdBusy=false;var m1=String(e&&e.message);
      bkSay(m1==='no-auth'||m1==='auth'?'انتهت صلاحية الربط — افصل الحساب وأعد ربطه.':'تعذّر الرفع. تحقق من الإنترنت وحاول مجددًا.');
      try{render()}catch(x){} /* أعد عرض البطاقة بعد أي فشل حتى يزول تعطيل الأزرار بصريًا */
    });
    return true}
  if(a==='gddown'){
    if(gdBusy)return true;gdBusy=true;bkSay('جارٍ تنزيل آخر نسخة من درايف…');
    gdDownload().then(function(txt){
      gdBusy=false;bkIn=String(txt||'');bkConfirm=false;
      var ta=document.getElementById('bk-in');if(ta)ta.value=bkIn;
      bkSay('نُزّلت النسخة في صندوق الاستيراد. راجعها ثم اضغط «استيراد» و«تأكيد» إن أردت استبدال بياناتك.');
    },function(e){
      gdBusy=false;var m2=String(e&&e.message);
      bkSay(m2==='no-file'?'لا توجد نسخة في درايف بعد — ارفع نسخة أولًا.':(m2==='no-auth'||m2==='auth')?'انتهت صلاحية الربط — افصل الحساب وأعد ربطه.':'تعذّر التنزيل. تحقق من الإنترنت وحاول مجددًا.');
      try{render()}catch(x){} /* كذلك بعد فشل التنزيل */
    });
    return true}
  return false;
     }
