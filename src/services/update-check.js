/* ===== فحص التحديثات: يقرأ update.json من الفرع الرئيسي ويقارن versionCode بالنسخة المثبتة =====
   المصدر: https://raw.githubusercontent.com/alsaer-app/alsaer/main/update.json (يحدَّث تلقائيًا مع كل إصدار).
   الفحص كل ١٢ ساعة كحد أقصى، وصامت تمامًا عند انقطاع الإنترنت أو أي خطأ. */
var UPD_URL='https://raw.githubusercontent.com/alsaer-app/alsaer/main/update.json';
var UPD_KEY='alsaer_update_check_v1';
function updState(){try{return JSON.parse(localStorage.getItem(UPD_KEY)||'{}')}catch(e){return {}}}
function updSave(x){try{localStorage.setItem(UPD_KEY,JSON.stringify(x))}catch(e){}}
/* مقارنة دلالية: تمنع إعلان إصدار أقدم رقمُ versionCode فيه أعلى (بقايا نظام الترقيم القديم ١٠١xx مقابل النظام الحالي M×100+m×10+p) */
function updSemverNewer(remote,local){
  var p=function(s){var m=/^(\d+)\.(\d+)\.(\d+)/.exec(String(s||''));return m?[+m[1],+m[2],+m[3]]:null};
  var r=p(remote),l=p(local);if(!r||!l)return true; /* تعذّر التحليل: عُد إلى المقارنة الرقمية فقط */
  for(var i=0;i<3;i++){if(r[i]!==l[i])return r[i]>l[i]}
  return false;
}
function updInfo(){var s=updState();return (s.info&&typeof APP_BUILD!=='undefined'&&s.info.versionCode>APP_BUILD&&updSemverNewer(s.info.versionName,(typeof APP_VERSION!=='undefined')?APP_VERSION:''))?s.info:null}
function updDismissed(){var s=updState(),i=updInfo();return !!(i&&s.dismissed===i.versionCode)}
function updCheck(force){
  if(typeof fetch!=='function')return Promise.resolve(false);
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return Promise.resolve(false);
  var s=updState();
  if(!force&&s.at&&Date.now()-s.at<12*3600*1000)return Promise.resolve(false);
  var ctl=(typeof AbortController==='function')?new AbortController():null,to=ctl?setTimeout(function(){try{ctl&&ctl.abort()}catch(e){}},8000):null;
  return fetch(UPD_URL,{headers:{'Accept':'application/json'},signal:ctl?ctl.signal:undefined,cache:'no-store'})
   .then(function(r){if(to)clearTimeout(to);if(!r.ok)throw new Error('http');return r.json()})
   .then(function(j){
    var st=updState();st.at=Date.now();
    if(j&&j.appId==='com.ahmedalajmi.alsaer'&&Number.isInteger(j.versionCode)&&j.versionCode>0){
      st.info={versionCode:j.versionCode,versionName:String(j.versionName||''),apkUrl:/^https:\/\//.test(j.apkUrl||'')?j.apkUrl:'https://github.com/alsaer-app/alsaer/releases/latest'};
      if(Number.isInteger(j.sizeBytes)&&j.sizeBytes>0)st.info.sizeBytes=j.sizeBytes;
      if(typeof j.sha256==='string'&&/^[0-9a-f]{64}$/i.test(j.sha256))st.info.sha256=j.sha256.toLowerCase();
      if(typeof j.notes==='string'&&j.notes.trim())st.info.notes=j.notes.trim().slice(0,500);
    }else delete st.info;
    updSave(st);
    var ii=updInfo();
    if(ii&&!updDismissed()){
      if(tab==='home'||tab==='more'||tab==='settings')render();
      try{
        if(!sessionStorage.getItem('upd_shown_'+ii.versionCode)){
          sessionStorage.setItem('upd_shown_'+ii.versionCode,'1');
          setTimeout(function(){if(!document.getElementById('upsheet')&&(tab==='home'||tab==='more'||tab==='settings'))updSheetOpen()},1500);
        }
      }catch(e){}
    }
    return true;
   })
   .catch(function(){if(to)clearTimeout(to);var st=updState();st.at=Date.now();updSave(st);return false});
}
/* ورقة «تحديث جديد» السفلية: تفتح تلقائيًا مرة واحدة لكل إصدار، وتبقى متاحة من الإعدادات ← التحديثات.
   التحميل الداخلي يتطلب الجسر الأصيل ورابط apk مباشرًا وبصمة sha256 في update.json؛ وإلا يُعرض رابط صفحة الإصدارات فقط.
   حالة التحميل محفوظة لدى الطبقة الأصيلة (تُستكمل بعد إغلاق التطبيق)، والواجهة تقرأها عبر updateProgress. */
var UPD_DL=null,UPD_T=null; /* {st:'downloading'|'verifying'|'done'|'failed',pct,done,total,err,url,run} */
function updNative(){return !!(window.AlsaerNative&&typeof AlsaerNative.updateStart==='function'&&typeof AlsaerNative.updateProgress==='function'&&typeof AlsaerNative.updateInstall==='function')}
function updFmtSize(n){if(!n||n<=0)return '';var mb=n/1048576;return mb>=1?(mb>=10?Math.round(mb):Math.round(mb*10)/10)+' م.ب':Math.max(1,Math.round(n/1024))+' ك.ب'}
function updRowSub(){
  var cur=ar(String((typeof APP_VERSION!=='undefined')?APP_VERSION:''));
  var i=updInfo();
  if(UPD_DL&&UPD_DL.st==='downloading')return 'جارٍ تحميل التحديث…';
  if(UPD_DL&&UPD_DL.st==='done')return 'التحديث جاهز للتثبيت';
  if(i)return 'الإصدار '+cur+' · يتوفر '+esc(i.versionName||String(i.versionCode));
  return 'الإصدار '+cur+' · أحدث إصدار';
}
function updSheetHtml(){
  var i=updInfo();
  var h='<div class="ups-back" data-a="updclose"></div><div class="ups-card"><div class="ups-grab"></div>';
  if(!i){
    return h+'<div class="ups-head"><span class="ups-ic ok">'+ic('check')+'</span><div><b>أنت على أحدث إصدار</b><small>الإصدار '+ar(String((typeof APP_VERSION!=='undefined')?APP_VERSION:''))+'</small></div></div>'
      +'<button class="btn block" data-a="updchecknow">'+ic('refresh')+' التحقق من جديد</button>'
      +'<button class="btn ghost block" data-a="updclose">إغلاق</button></div>';
  }
  h+='<div class="ups-head"><span class="ups-ic">'+ic('refresh')+'</span><div><b>تحديث جديد متاح</b><small>الإصدار '+esc(i.versionName||String(i.versionCode))+(i.sizeBytes?' · '+updFmtSize(i.sizeBytes):'')+'</small></div></div>';
  h+='<div class="ups-notes"><b>ما الجديد</b><p>'+esc(i.notes||'تحسينات وإصلاحات عامة.')+'</p></div>';
  var inApp=updNative()&&/^https:\/\/.+\.apk(\?|#|$)/i.test(i.apkUrl||'')&&!!i.sha256;
  if(UPD_DL&&UPD_DL.st==='downloading'){
    h+='<div class="upd-p"><div class="upd-bar"><div style="width:'+(UPD_DL.pct>=0?UPD_DL.pct:5)+'%"></div></div><small>'+(UPD_DL.pct>=0?ar(UPD_DL.pct)+'٪':'جارٍ التحميل…')+'</small></div>'
      +'<p class="note ups-st">'+(UPD_DL.run===false?'توقّف التحميل عند إغلاق التطبيق ويُستكمل من حيث توقف.':'يُستكمل التحميل تلقائيًا حتى لو أغلقت هذه النافذة.')+'</p>'
      +(UPD_DL.run===false?'<button class="btn block" data-a="updnow">'+ic('refresh')+' استئناف التحميل</button>':'')
      +'<button class="btn ghost block" data-a="updclose">إغلاق</button>';
  }else if(UPD_DL&&UPD_DL.st==='verifying'){
    h+='<p class="ups-st"><b>جارٍ التحقق من سلامة الملف…</b></p>';
  }else if(UPD_DL&&UPD_DL.st==='done'){
    h+='<p class="ups-st ups-ok">'+ic('check')+' اكتمل التحميل وتم التحقق من سلامة الملف.</p>'
      +'<button class="btn block" data-a="updinst">تثبيت الآن</button>'
      +'<button class="btn ghost block" data-a="updclose">لاحقًا</button>';
  }else if(UPD_DL&&UPD_DL.st==='failed'){
    h+='<p class="ups-st ups-err">تعذّر التحميل: '+esc(UPD_DL.err||'خطأ في الشبكة')+'.'+(UPD_DL.done>0?' وصل التحميل إلى '+updFmtSize(UPD_DL.done)+' وسيُستكمل من حيث توقف.':'')+'</p>'
      +'<button class="btn block" data-a="updnow">'+ic('refresh')+' إعادة المحاولة</button>'
      +'<button class="btn ghost block" data-a="updclose">لاحقًا</button>';
  }else{
    if(inApp)h+='<button class="btn block" data-a="updnow">'+ic('refresh')+' تحديث الآن</button>';
    h+='<a class="btn'+(inApp?' ghost':'')+' block" href="'+esc(i.apkUrl||'https://github.com/alsaer-app/alsaer/releases/latest')+'" target="_blank" rel="noopener noreferrer">صفحة الإصدار</a>';
    if(!inApp)h+='<p class="note ups-st">التحميل الداخلي غير متاح لهذا الإصدار — حمّل من صفحة الإصدار.</p>';
    h+='<button class="btn ghost block" data-a="updlater">لاحقًا</button>';
  }
  return h+'</div>';
}
function updSheetOpen(){if(document.getElementById('upsheet'))return;updPollNative();var d=document.createElement('div');d.id='upsheet';d.className='upsheet';d.innerHTML=updSheetHtml();document.body.appendChild(d)}
function updSheetPaint(){var d=document.getElementById('upsheet');if(d)d.innerHTML=updSheetHtml()}
function updSheetClose(){var d=document.getElementById('upsheet');if(d)d.remove()}
function updPollNative(){
  if(!updNative())return;
  var j=null;try{j=JSON.parse(AlsaerNative.updateProgress()||'{}')}catch(e){}
  if(!j||!j.st)return;
  var i=updInfo();
  if(i&&j.url&&j.url!==i.apkUrl)return; /* تحميل قديم لإصدار سابق */
  if(j.st==='downloading'||j.st==='verifying'||j.st==='done'||j.st==='failed'){
    UPD_DL={st:j.st,pct:j.pct,done:j.done,total:j.total,err:j.err,url:j.url,run:j.run};
    if(j.st==='downloading'||j.st==='verifying')updStartPoll();
  }
}
function updStartPoll(){
  clearInterval(UPD_T);
  UPD_T=setInterval(function(){
    var j=null;try{j=JSON.parse(AlsaerNative.updateProgress()||'{}')}catch(e){}
    if(!j||!j.st)return;
    var i=updInfo();
    if(i&&j.url&&j.url!==i.apkUrl){UPD_DL=null;clearInterval(UPD_T);UPD_T=null;updSheetPaint();return}
    var prev=UPD_DL?UPD_DL.st:null;
    UPD_DL={st:j.st,pct:j.pct,done:j.done,total:j.total,err:j.err,url:j.url,run:j.run};
    if(j.st==='downloading'&&prev==='downloading'){
      var bar=document.querySelector('#upsheet .upd-bar>div');if(bar&&j.pct>=0)bar.style.width=j.pct+'%';
      var sm=document.querySelector('#upsheet .upd-p small');if(sm)sm.textContent=j.pct>=0?ar(j.pct)+'٪':'جارٍ التحميل…';
    }else if(j.st!==prev){
      updSheetPaint();
      if(tab==='settings')render();
      if(j.st==='done'||j.st==='failed'||j.st==='idle'){clearInterval(UPD_T);UPD_T=null}
    }
  },700);
}
function updStartDl(){
  var i=updInfo();if(!i||!updNative())return;
  var r='';try{r=AlsaerNative.updateStart(i.apkUrl,i.sizeBytes||0,i.sha256||'')}catch(e){}
  if(r!=='started'&&r!=='busy'){toast('تعذّر بدء التحميل');return}
  if(!UPD_DL||UPD_DL.st!=='downloading')UPD_DL={st:'downloading',pct:-1,done:0,total:i.sizeBytes||0,url:i.apkUrl,run:true};
  UPD_DL.run=true;updSheetPaint();updStartPoll();
}
function updInstall(){
  if(!updNative())return;
  var r='';try{r=AlsaerNative.updateInstall()}catch(e){}
  if(r==='needperm')toast('اسمح للتطبيق بتثبيت التحديثات من الإعدادات، ثم عُد واضغط «تثبيت»');
  else if(r==='badpkg'||r==='badsig'||r==='badver')toast('ملف التحديث لا يطابق هذا التطبيق — حمّل من صفحة الإصدار');
  else if(r==='nofile')toast('لا يوجد ملف محمَّل بعد');
  else if(r!=='ok')toast('تعذّر فتح المثبّت — حمّل من صفحة الإصدار');
}
function updCheckNow(){toast('جارٍ التحقق من التحديثات…');updCheck(true).then(function(ok){if(ok&&!updInfo())toast('لا يوجد تحديث جديد');updSheetPaint();if(tab==='settings')render()})}
setTimeout(function(){updPollNative()},8000);
