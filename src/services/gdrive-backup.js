/* ===== نسخ احتياطي اختياري إلى Google Drive =====
   يعمل فقط بعد أن يضع مطوّر التطبيق معرّف عميل OAuth خاصه في GD_CLIENT_ID (انظر docs/GDRIVE-SETUP-AR.md).
   أقل صلاحية ممكنة: drive.file — الوصول للملفات التي ينشئها التطبيق فقط (ملف alsaer-backup.json).
   لا يُخزَّن أي سر في المستودع؛ رمز التحديث يبقى على الجهاز مثل بقية البيانات (غير مشفّر سكونًا). */
var GD_CLIENT_ID=''; /* ← يملؤه المطوّر قبل البناء: xxxx.apps.googleusercontent.com */
var GD_REDIRECT='com.ahmedalajmi.alsaer://gdrive';
var GD_SCOPE='https://www.googleapis.com/auth/drive.file';
var GD_FILE='alsaer-backup.json';
var GD_RT_KEY='alsaer_gdrive_rt',GD_VER_KEY='alsaer_gd_verifier';
var gdTok={t:'',exp:0},gdBusy=false;

function gdConfigured(){return /^[0-9a-z-]+\.apps\.googleusercontent\.com$/i.test(GD_CLIENT_ID)}
function gdHasRt(){try{return !!localStorage.getItem(GD_RT_KEY)}catch(e){return false}}

/* --- PKCE: مولّد رمز التحقق وتحدّيه (S256) --- */
function gdB64url(bytes){var s='';for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function gdSha256(txt){
  if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error('no-crypto'));
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)).then(function(b){return gdB64url(new Uint8Array(b))});
}

/* --- بدء الربط: يفتح متصفح الجهاز على صفحة موافقة Google --- */
function gdStartAuth(){
  if(!gdConfigured()){bkSay('ربط Google Drive غير مهيأ في هذه النسخة من التطبيق.');return}
  var rnd=new Uint8Array(32);crypto.getRandomValues(rnd);
  var ver=gdB64url(rnd);
  gdSha256(ver).then(function(ch){
    try{sessionStorage.setItem(GD_VER_KEY,ver)}catch(e){}
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
  var ver='';try{ver=sessionStorage.getItem(GD_VER_KEY)||'';sessionStorage.removeItem(GD_VER_KEY)}catch(e){}
  bkSay('جارٍ إتمام الربط…');
  gdPost('https://oauth2.googleapis.com/token',{client_id:GD_CLIENT_ID,code:code,grant_type:'authorization_code',redirect_uri:GD_REDIRECT,code_verifier:ver})
    .then(function(o){
      if(!o||!o.refresh_token)throw new Error('no-refresh');
      try{localStorage.setItem(GD_RT_KEY,o.refresh_token)}catch(e){}
      gdTok={t:o.access_token||'',exp:Date.now()+((o.expires_in||3600)-60)*1000};
      bkSay('تم ربط Google Drive ✓');try{render()}catch(e){}
    },function(){bkSay('تعذّر إتمام الربط. تحقق من الإنترنت وحاول مجددًا.')});
};

function gdPost(url,params){
  var body=Object.keys(params).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(params[k])}).join('&');
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body})
    .then(function(r){return r.json().then(function(o){if(!r.ok)throw new Error(o&&o.error||'http-'+r.status);return o})});
}

/* --- رمز وصول صالح (من الذاكرة أو عبر رمز التحديث) --- */
function gdToken(){
  if(gdTok.t&&Date.now()<gdTok.exp)return Promise.resolve(gdTok.t);
  var rt='';try{rt=localStorage.getItem(GD_RT_KEY)||''}catch(e){}
  if(!rt)return Promise.reject(new Error('no-auth'));
  return gdPost('https://oauth2.googleapis.com/token',{client_id:GD_CLIENT_ID,refresh_token:rt,grant_type:'refresh_token'})
    .then(function(o){gdTok={t:o.access_token,exp:Date.now()+((o.expires_in||3600)-60)*1000};return gdTok.t});
}

function gdReq(url,opt){
  opt=opt||{};
  return gdToken().then(function(t){
    opt.headers=Object.assign({'Authorization':'Bearer '+t},opt.headers||{});
    return fetch(url,opt).then(function(r){
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
  if(a==='gddisc'){gdDisconnect();bkSay('فُصل حساب Google Drive. ملف النسخة يبقى في درايف حتى تحذفه بنفسك.');try{render()}catch(e){}return true}
  if(a==='gdup'){
    if(gdBusy)return true;gdBusy=true;bkSay('جارٍ الرفع إلى Google Drive…');
    gdUpload().then(function(){
      gdBusy=false;S.gdAt=Date.now();save();bkSay('رُفعت النسخة إلى درايف ✓ («'+GD_FILE+'»)');try{render()}catch(e){}
    },function(e){
      gdBusy=false;bkSay(String(e&&e.message)==='no-auth'||String(e&&e.message)==='auth'?'انتهت صلاحية الربط — افصل الحساب وأعد ربطه.':'تعذّر الرفع. تحقق من الإنترنت وحاول مجددًا.');
    });
    return true}
  if(a==='gddown'){
    if(gdBusy)return true;gdBusy=true;bkSay('جارٍ تنزيل آخر نسخة من درايف…');
    gdDownload().then(function(txt){
      gdBusy=false;bkIn=String(txt||'');bkConfirm=false;
      var ta=document.getElementById('bk-in');if(ta)ta.value=bkIn;
      bkSay('نُزّلت النسخة في صندوق الاستيراد. راجعها ثم اضغط «استيراد» و«تأكيد» إن أردت استبدال بياناتك.');
    },function(e){
      gdBusy=false;bkSay(String(e&&e.message)==='no-file'?'لا توجد نسخة في درايف بعد — ارفع نسخة أولًا.':'تعذّر التنزيل. تحقق من الإنترنت وحاول مجددًا.');
    });
    return true}
  return false;
}
