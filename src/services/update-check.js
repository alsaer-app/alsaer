/* ===== فحص التحديثات: يقرأ update.json من الفرع الرئيسي ويقارن versionCode بالنسخة المثبتة =====
   المصدر: https://raw.githubusercontent.com/alsaer-app/alsaer/main/update.json (يحدَّث تلقائيًا مع كل إصدار).
   الفحص كل ١٢ ساعة كحد أقصى، وصامت تمامًا عند انقطاع الإنترنت أو أي خطأ. */
var UPD_URL='https://raw.githubusercontent.com/alsaer-app/alsaer/main/update.json';
var UPD_KEY='alsaer_update_check_v1';
function updState(){try{return JSON.parse(localStorage.getItem(UPD_KEY)||'{}')}catch(e){return {}}}
function updSave(x){try{localStorage.setItem(UPD_KEY,JSON.stringify(x))}catch(e){}}
function updInfo(){var s=updState();return (s.info&&typeof APP_BUILD!=='undefined'&&s.info.versionCode>APP_BUILD)?s.info:null}
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
    }else delete st.info;
    updSave(st);
    if(updInfo()&&!updDismissed()&&(tab==='home'||tab==='more'))render();
    return true;
   })
   .catch(function(){if(to)clearTimeout(to);var st=updState();st.at=Date.now();updSave(st);return false});
}
/* بانر «تحديث متاح»: نفس شكل تنبيه الإشعارات، ورابط يفتح صفحة الإصدارات مثل روابط «عرض المصدر» الموجودة */
function updBanner(){
  var i=updInfo();if(!i||updDismissed())return '';
  var url=i.apkUrl||'https://github.com/alsaer-app/alsaer/releases/latest';
  return '<div class="upd-wrap"><a class="notif-warn upd-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+ic('refresh')+'<span><b>تحديث جديد متاح: الإصدار '+esc(i.versionName||String(i.versionCode))+'</b><small>اضغط لفتح صفحة الإصدارات وتحميل أحدث نسخة</small></span></a><button class="upd-x" data-a="updlater" aria-label="إخفاء التنبيه">×</button></div>';
}
setTimeout(function(){updCheck(false)},6000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)updCheck(false)});
