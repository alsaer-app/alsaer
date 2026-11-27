/* ===== مواقيت الصلاة والقبلة (حساب محلي بلا إنترنت) ===== */
var CITIES=[['القاهرة',30.0444,31.2357],['الإسكندرية',31.2001,29.9187],['الجيزة',30.0131,31.2089],['المنصورة',31.0364,31.3807],['أسيوط',27.1809,31.1837],['الأقصر',25.6872,32.6396],['أسوان',24.0889,32.8998],['مكة المكرمة',21.3891,39.8579],['المدينة المنورة',24.5247,39.5692],['الرياض',24.7136,46.6753],['جدة',21.4858,39.1925],['الدمام',26.4207,50.0888],['دبي',25.2048,55.2708],['أبوظبي',24.4539,54.3773],['الدوحة',25.2854,51.531],['الكويت',29.3759,47.9774],['المنامة',26.2285,50.586],['مسقط',23.588,58.3829],['عمّان',31.9454,35.9284],['القدس',31.7683,35.2137],['غزة',31.5017,34.4668],['بيروت',33.8938,35.5018],['دمشق',33.5138,36.2765],['بغداد',33.3152,44.3661],['صنعاء',15.3694,44.191],['الخرطوم',15.5007,32.5599],['طرابلس',32.8872,13.1913],['تونس',36.8065,10.1815],['الجزائر',36.7538,3.0588],['الرباط',34.0209,-6.8416],['الدار البيضاء',33.5731,-7.5898],['نواكشوط',18.0735,-15.9582],['إسطنبول',41.0082,28.9784],['لندن',51.5074,-0.1278],['باريس',48.8566,2.3522],['برلين',52.52,13.405],['نيويورك',40.7128,-74.006],['تورنتو',43.6532,-79.3832],['كوالالمبور',3.139,101.6869],['جاكرتا',-6.2088,106.8456],['كراتشي',24.8607,67.0011],['إسلام آباد',33.6844,73.0479],['سيدني',-33.8688,151.2093]];
var PT_METHODS={egypt:['الهيئة المصرية',19.5,17.5,0],mwl:['رابطة العالم الإسلامي',18,17,0],makkah:['أم القرى',18.5,0,90],karachi:['جامعة كراتشي',18,18,0]};
var KAABA=[21.4225,39.8262];
function ptRad(d){return d*Math.PI/180}function ptDeg(r){return r*180/Math.PI}
function ptFix(a,b){a=a-b*Math.floor(a/b);return a<0?a+b:a}
function ptJulian(y,m,d){if(m<=2){y-=1;m+=12}var A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function ptSun(jd){var D=jd-2451545.0,g=ptFix(357.529+0.98560028*D,360),q=ptFix(280.459+0.98564736*D,360),L=ptFix(q+1.915*Math.sin(ptRad(g))+0.02*Math.sin(ptRad(2*g)),360),e=23.439-0.00000036*D,RA=ptFix(ptDeg(Math.atan2(Math.cos(ptRad(e))*Math.sin(ptRad(L)),Math.cos(ptRad(L)))),360)/15,eqt=q/15-RA,decl=ptDeg(Math.asin(Math.sin(ptRad(e))*Math.sin(ptRad(L))));return{decl:decl,eqt:eqt}}
function ptCompute(date,lat,lng,method,asrF){
  var M=PT_METHODS[method]||PT_METHODS.egypt,tz=-date.getTimezoneOffset()/60;
  var J=ptJulian(date.getFullYear(),date.getMonth()+1,date.getDate())-lng/360;
  function mid(t){return ptFix(12-ptSun(J+t).eqt,24)}
  function ang(a,t,ccw){var dc=ptSun(J+t).decl,x=(-Math.sin(ptRad(a))-Math.sin(ptRad(dc))*Math.sin(ptRad(lat)))/(Math.cos(ptRad(dc))*Math.cos(ptRad(lat)));if(x>1||x<-1)return NaN;var v=ptDeg(Math.acos(x))/15;return mid(t)+(ccw?-v:v)}
  function asr(f,t){var dc=ptSun(J+t).decl,a=-ptDeg(Math.atan(1/(f+Math.tan(ptRad(Math.abs(lat-dc))))));return ang(a,t,false)}
  var fajr=ang(M[1],5/24,true),sunrise=ang(0.833,6/24,true),dhuhr=mid(12/24)+1/60,as=asr(asrF||1,13/24),maghrib=ang(0.833,18/24,false);
  /* أم القرى: العشاء بعد المغرب بـ ٩٠ دقيقة، وتُمدَّد إلى ١٢٠ دقيقة في رمضان */
  var ishaMin=M[3];
  if(ishaMin){try{if(typeof hijriNumeric==='function'){var hj=hijriNumeric(date);if(hj&&hj.month===9)ishaMin=120}}catch(e){}}
  var isha=ishaMin?maghrib+ishaMin/60:ang(M[2],18/24,false);
  /* خطوط العرض العالية: متى تعذّرت زاوية الفجر/العشاء (لا شفق) نقدّرهما بمنتصف الليل بين المغرب والشروق */
  if(!isNaN(sunrise)&&!isNaN(maghrib)){
    var night=ptFix(sunrise-maghrib+24,24);
    if(isNaN(fajr))fajr=ptFix(maghrib+night/2,24);
    if(isNaN(isha))isha=ptFix(maghrib+night/2,24);
  }
  var off=tz-lng/15,out={fajr:fajr,sunrise:sunrise,dhuhr:dhuhr,asr:as,maghrib:maghrib,isha:isha};
  Object.keys(out).forEach(function(k){var v=out[k];if(isNaN(v)){out[k]=null;return}v=ptFix(v+off+0.5/60,24);var h=Math.floor(v),m=Math.floor((v-h)*60);out[k]=(h<10?'0':'')+h+':'+(m<10?'0':'')+m});
  return out;
}
function qiblaBearing(lat,lng){var f=ptRad(lat),f2=ptRad(KAABA[0]),dl=ptRad(KAABA[1]-lng);return ptFix(ptDeg(Math.atan2(Math.sin(dl),Math.cos(f)*Math.tan(f2)-Math.sin(f)*Math.cos(dl))),360)}
function locOk(){var L=S.loc;return !!L&&typeof L.lat==='number'&&typeof L.lng==='number'&&isFinite(L.lat)&&isFinite(L.lng)}
function ptToday(){return locOk()?ptCompute(new Date(),S.loc.lat,S.loc.lng,S.loc.method||'egypt',S.loc.asr||1):null}
function autoPtimes(){
  if(!locOk()||!S.loc.auto)return false;var t=ptToday(),ch=false;if(!t)return false;
  PR.forEach(function(x){if(t[x[0]]&&S.ptimes[x[0]]!==t[x[0]]){S.ptimes[x[0]]=t[x[0]];ch=true}});
  if(ch)save();return ch;
}
function ptFmt(hm){return hmFmt(hm)}
var compassOn=false,compassHandler=null;
function compassStop(){if(compassHandler){window.removeEventListener('deviceorientationabsolute',compassHandler,true);window.removeEventListener('deviceorientation',compassHandler,true);compassHandler=null}compassOn=false}
function compassStart(bearing){
  compassStop();compassOn=true;
  compassHandler=function(ev){
    var n=document.getElementById('qib-needle');if(!n){compassStop();return}
    var h=null;if(typeof ev.webkitCompassHeading==='number')h=ev.webkitCompassHeading;else if(ev.alpha!=null)h=360-ev.alpha;
    if(h==null)return;n.style.transform='rotate('+(bearing-h)+'deg)';
    var d=Math.abs(ptFix(bearing-h+180,360)-180);n.classList.toggle('ok',d<5);var t=document.getElementById('qib-hint');if(t)t.textContent=d<5?'أنت متجه نحو القبلة ✅':'أدِر هاتفك حتى يشير السهم إلى الأعلى';
  };
  window.addEventListener('deviceorientationabsolute',compassHandler,true);window.addEventListener('deviceorientation',compassHandler,true);
}
try{if(/alsaertest/.test(location.search))window.__T={ptCompute:ptCompute,qiblaBearing:qiblaBearing,S:function(){return S},go:function(t,o){tab=t;if(o!==undefined)setOpen=o;render()}}}catch(e){}
function locCard(){
  var L=S.loc||{},auto=!!(L.auto&&locOk());
  var opts='<option value="">اختر مدينتك…</option>'+CITIES.map(function(c,i){return '<option value="'+i+'"'+(L.city===c[0]?' selected':'')+'>'+c[0]+'</option>'}).join('');
  var meths=Object.keys(PT_METHODS).map(function(k){return '<option value="'+k+'"'+((L.method||'egypt')===k?' selected':'')+'>'+PT_METHODS[k][0]+'</option>'}).join('');
  var t=locOk()?ptToday():null,qb=locOk()?Math.round(qiblaBearing(S.loc.lat,S.loc.lng)):null;
  var times=t?'<div class="pt-grid">'+[['fajr','الفجر'],['sunrise','الشروق'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']].map(function(x){return '<div><small>'+x[1]+'</small><b>'+(t[x[0]]?ptFmt(t[x[0]]):'—')+'</b></div>'}).join('')+'</div>':'';
  return '<section class="card pt-card"><div class="rm-sect" style="margin:0 0 10px">'+ic('mosque')+'<span>المواقيت التلقائية</span></div>'
   +'<div class="pt-form"><select class="rm-sel pt-sel" data-loc="city" aria-label="المدينة">'+opts+'</select><select class="rm-sel pt-sel" data-loc="method" aria-label="طريقة الحساب">'+meths+'</select></div>'
   +'<div class="pt-form"><label class="rm-clock"><span>المذهب في العصر</span></label><div class="rm-clock"><label class="'+((L.asr||1)===1?'on':'')+'"><input type="radio" name="pt-asr" data-loc="asr" value="1" '+((L.asr||1)===1?'checked':'')+'><b>الجمهور</b></label><label class="'+(L.asr===2?'on':'')+'"><input type="radio" name="pt-asr" data-loc="asr" value="2" '+(L.asr===2?'checked':'')+'><b>الحنفي</b></label></div></div>'
   +'<div class="pt-loc'+(L.gps?' ok':'')+'"><span class="pt-pin">'+ic('mosque')+'</span><div class="pt-lt"><b>'+(L.gps?esc(L.city||'موقعي'):'لم يُحدَّد الموقع بعد')+'</b><small id="gps-msg" class="pt-gps-msg">'+(L.gps?('محدَّث '+(L.gpsAt?(function(d){return hmFmt(d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes())})(new Date(L.gpsAt)):'')+(L.acc?' · الدقة ≈ '+ar(L.acc)+' م':'')+' · يتجدد تلقائيًا إذا انتقلت'):'اضغط الزر ليضبط التطبيق المواقيت والقبلة من موقعك')+'</small></div></div><div class="pt-gps"><button class="btn'+(L.gps&&L.gpsAt&&Date.now()-L.gpsAt<30*60e3?' dim':'')+'" data-a="gps">'+ic('mosque')+(L.gps?' تحديث موقعي':' حدّد موقعي (GPS)')+'</button></div>'
   +'<div class="pt-form"><label class="rm-clock"><span>نظام الساعة</span></label>'+clkSeg('loc')+'</div>'
   +times
   +(locOk()?'<div class="rm-row'+(auto?' on':'')+'" style="margin:10px 0 0"><div class="rm-tx"><b>ضبط مواقيت الصلوات تلقائيًا</b><small>'+esc(L.city||'موقعك')+' · تُحدَّث كل يوم وتُستخدم في تذكيرات الصلاة</small></div><label class="rm-sw"><input type="checkbox" data-loc="auto" '+(auto?'checked':'')+'><i></i></label></div>':'<p class="rm-hint">اختر مدينتك لتظهر المواقيت والقبلة بحسابٍ محلي دقيق دون إنترنت.</p>')
   +(qb!=null?'<div class="qib"><div class="qib-dial"><span class="qib-n">ش</span><div id="qib-needle" class="qib-needle" style="transform:rotate('+qb+'deg)"><i></i></div></div><div class="qib-tx"><b>اتجاه القبلة: '+ar(qb)+'°</b><small id="qib-hint">'+(compassOn?'أدِر هاتفك حتى يشير السهم إلى الأعلى':'السهم يوضح الاتجاه من الشمال. فعّل البوصلة لتتبعه بالحساس.')+'</small><button class="btn ghost" data-a="qibla" data-v="'+qb+'" style="margin-top:8px">'+(compassOn?'إيقاف البوصلة':'تفعيل البوصلة')+'</button></div></div>':'')
   +'</section>';
}

function gpsNear(lat,lng){var best=null,bd=1e9;CITIES.forEach(function(c){var dl=(c[1]-lat)*Math.PI/180,dg=(c[2]-lng)*Math.PI/180,a=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(lat*Math.PI/180)*Math.cos(c[1]*Math.PI/180)*Math.sin(dg/2)*Math.sin(dg/2),d=6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));if(d<bd){bd=d;best=c[0]}});return {n:best,d:Math.round(bd)}}
var gpsBusy=false,gpsBusyAt=0,locSetAt=0;
/* يفتح شاشة إعدادات «الموقع» في الهاتف (دالة النظام المعاد توجيهها في نسخة الأندرويد) ثم يعيد المحاولة عند الرجوع */
function openLocSettings(){
  var nv=window.AlsaerNative;if(!nv||!(nv.openLocationSettings||nv.openAppNotificationSettings))return false;
  try{if(nv.openLocationSettings)nv.openLocationSettings();else nv.openAppNotificationSettings();locSetAt=Date.now();return true}catch(e){return false}
}
function locDialog(){
  if(document.getElementById('loc-dlg'))return;
  var o=document.createElement('div');o.id='loc-dlg';o.setAttribute('role','alertdialog');o.dir='rtl';
  o.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:24px';
  o.innerHTML='<div style="width:100%;max-width:360px;background:var(--surface,#111);color:var(--fg,#fff);border:1px solid var(--line,#333);border-radius:22px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)"><div style="padding:18px 22px;font-weight:800;font-size:20px;background:var(--surface-2,#222)">معلومات</div><div style="padding:22px;font-size:18px;line-height:1.9">نظام تحديد المواقع غير مفعل، برجاء التفعيل ثم إعادة المحاولة</div><div style="padding:0 22px 22px;display:flex;gap:10px"><button id="loc-dlg-go" style="flex:1;padding:14px;border:0;border-radius:12px;background:var(--primary,#c00);color:var(--on-primary,#fff);font:inherit;font-weight:800;font-size:17px">الإعدادات</button><button id="loc-dlg-no" style="padding:14px 18px;border:1px solid var(--line,#444);border-radius:12px;background:transparent;color:var(--muted,#aaa);font:inherit;font-size:16px">إلغاء</button></div></div>';
  document.body.appendChild(o);
  document.getElementById('loc-dlg-go').onclick=function(){o.remove();if(!openLocSettings())toast('افتح إعدادات الهاتف ← الموقع وفعّله')};
  document.getElementById('loc-dlg-no').onclick=function(){o.remove()};
}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&locSetAt&&Date.now()-locSetAt<10*60e3){locSetAt=0;setTimeout(function(){gpsFix(false)},500)}});
function gpsFix(silent){
  /* الضغط اليدوي يتقدّم على أي محاولة تلقائية صامتة جارية (كانت تحجب الزر) */
  if(gpsBusy&&(silent||Date.now()-gpsBusyAt<1500))return;
  var tt=document.querySelector('.pt-lt b');
  /* العناصر تُعاد قراءتها كل مرة: الواجهة قد تُعاد رسمها أثناء انتظار الموقع */
  function say(t,cls){var gm=document.getElementById('gps-msg');if(gm){gm.textContent=t;gm.className='pt-gps-msg '+(cls||'')}}
  function busy(on,label){var bt=document.querySelector('[data-a=gps]');if(!bt)return;bt.classList.toggle('busy',!!on);if(label&&bt.lastChild)bt.lastChild.nodeValue=' '+label}
  if(!navigator.geolocation){if(!silent)say('الجهاز لا يدعم تحديد الموقع. اختر مدينتك يدويًا.','bad');return}
  gpsBusy=true;gpsBusyAt=Date.now();

  if(!silent){say('نطلب إذن الموقع… اضغط «سماح» إن ظهر لك طلب.','busy');busy(true,'جارٍ التحديد…');var t2=document.querySelector('.pt-lt b');if(t2)t2.textContent='جارٍ تحديد موقعك…'}
  function apply(p,final){
    S.loc=S.loc||{};
    var lat=Math.round(p.coords.latitude*1e4)/1e4,lng=Math.round(p.coords.longitude*1e4)/1e4,old=locOk()?Math.hypot(S.loc.lat-lat,S.loc.lng-lng)*111:1e9;
    var nr=gpsNear(lat,lng);
    S.loc.lat=lat;S.loc.lng=lng;S.loc.gps=1;S.loc.gpsAt=Date.now();S.loc.acc=Math.round(p.coords.accuracy||0);S.loc.city='موقعي'+(nr.d<=60?' · قرب '+nr.n:'');
    if(S.loc.auto===undefined)S.loc.auto=true;
    var moved=old>5;if(S.loc.auto)autoPtimes();save();
    if(!silent){compassStop();render()}else if(moved){render()}
  }
  function web(){
  /* مرحلة سريعة: آخر موقع معروف أو تقريبي خلال ثوانٍ، ثم تحسين صامت بدقة أعلى */
  navigator.geolocation.getCurrentPosition(function(p){
    gpsBusy=false;apply(p);
    if((p.coords.accuracy||0)>800){
      try{navigator.geolocation.getCurrentPosition(function(q){if((q.coords.accuracy||1e9)<(p.coords.accuracy||1e9))apply(q)},function(){},{enableHighAccuracy:true,timeout:25000,maximumAge:0})}catch(e){}
    }
  },function(er){
    if(!silent&&er&&er.code===2){gpsBusy=false;busy(false);say('تعذّر الحصول على الموقع. تحقق من الإعدادات أو جرّب في مكان مفتوح.','bad');locDialog();return}
    if(er&&er.code===1){gpsBusy=false;busy(false);if(!silent){say('لم يُسمح بالوصول للموقع. فعّله من إعدادات الهاتف ثم أعد المحاولة، أو اختر مدينتك يدويًا.','bad');var t2=document.querySelector('.pt-lt b');if(t2)t2.textContent='لم يُحدَّد الموقع بعد'}return}
    /* لم يصل موقع سريع: جرّب الدقة العالية مرة أخيرة */
    if(!silent)say('جارٍ البحث عن إشارة الموقع… قد يستغرق ذلك لحظات.','busy');
    function giveUp(e2){
      gpsBusy=false;busy(false);if(silent)return;
      var c=e2&&e2.code;
      if(c===2||c===3){say('تعذّر تحديد الموقع. تأكد أن خدمة الموقع مفعلة ثم أعد المحاولة.','bad');locDialog();return}
      say(c===1?'لم يُسمح بالوصول للموقع. فعّله من إعدادات الهاتف ثم أعد المحاولة، أو اختر مدينتك يدويًا.':c===2?'خدمة الموقع مغلقة أو لا تتوفر إشارة. فعّل «الموقع/GPS» من الإعدادات السريعة في هاتفك ثم أعد المحاولة، أو اختر مدينتك يدويًا.':'تعذّر تحديد الموقع الآن. جرّب في مكان مفتوح بعد تفعيل الموقع، أو اختر مدينتك يدويًا.','bad');var t2=document.querySelector('.pt-lt b');if(t2)t2.textContent='لم يُحدَّد الموقع بعد'
    }
    navigator.geolocation.getCurrentPosition(function(p){gpsBusy=false;apply(p)},function(e1){
      if(e1&&e1.code===1)return giveUp(e1);
      /* مرحلة أخيرة: مراقبة الموقع (بعض الهواتف لا تجيب إلا عبر watch) */
      var wid=null,done=false,tmo=null;
      function fin(f,e2){if(done)return;done=true;try{if(wid!=null)navigator.geolocation.clearWatch(wid)}catch(x){}clearTimeout(tmo);f(e2)}
      try{wid=navigator.geolocation.watchPosition(function(p){fin(function(){gpsBusy=false;apply(p)})},function(e2){if(e2&&e2.code===1)fin(giveUp,e2)},{enableHighAccuracy:true,timeout:40000,maximumAge:0})}catch(x){return giveUp(e1)}
      tmo=setTimeout(function(){fin(giveUp,e1)},42000);
    },{enableHighAccuracy:true,timeout:20000,maximumAge:0});
  },{enableHighAccuracy:false,timeout:8000,maximumAge:3600e3});
  }
  /* المسار الأصلي (LocationManager + طلب الإذن من أندرويد مباشرة): الصامت لا يطلب إذنًا. أي فشل غير الرفض أو إغلاق الموقع يعود للمسار القديم */
  var nv=window.AlsaerNative;
  if(nv&&typeof nv.locGet==='function'&&typeof nv.locHasPermission==='function'&&(!silent||nv.locHasPermission())){
    var fell=false;
    window.gpsOnNative=function(lat,lng,acc,err){
      window.gpsOnNative=null;
      if(!err){gpsBusy=false;apply({coords:{latitude:lat,longitude:lng,accuracy:acc}});return}
      var code=' (loc-'+String(err).replace(/[^a-z]/g,'').slice(0,12)+')';
      if(err==='denied'){gpsBusy=false;busy(false);if(!silent){say('لم يُسمح بالوصول للموقع. فعّله من إعدادات الهاتف ثم أعد المحاولة، أو اختر مدينتك يدويًا.'+code,'bad');var t3=document.querySelector('.pt-lt b');if(t3)t3.textContent='لم يُحدَّد الموقع بعد'}return}
      if(err==='off'){gpsBusy=false;busy(false);if(!silent){say('خدمة الموقع مغلقة أو لا تتوفر إشارة. فعّل «الموقع/GPS» من الإعدادات السريعة في هاتفك ثم أعد المحاولة، أو اختر مدينتك يدويًا.'+code,'bad');locDialog()}return}
      if(!fell){fell=true;web()}
    };
    if(!silent)say('نطلب إذن الموقع… اضغط «سماح» إن ظهر لك طلب.','busy');
    try{nv.locGet()}catch(e){window.gpsOnNative=null;web()}
    return;
  }
  web();
}
/* تحديد الموقع تلقائيًا دون انتظار ضغط الزر: عند فتح التطبيق وعند الرجوع إليه وكل نصف ساعة، ما لم يختر المستخدم المدينة يدويًا */
function autoLoc(){
  try{
    if(!S.onboarded||!unlocked||gpsBusy||document.hidden)return;
    S.loc=S.loc||{};if(S.loc.auto===false)return;
    /* لا نطلب إذن الموقع من تلقاء التطبيق: التحديث التلقائي يبدأ فقط بعد أن يضغط المستخدم «تحديد الموقع» مرة */
    if(!S.loc.gps||!S.loc.gpsAt)return;
    var need=Date.now()-(S.loc.gpsAt||0)>30*60e3;
    if(!need)return;
    var now=Date.now();if(now-(window.__gpsTry||0)<25000)return;window.__gpsTry=now+(S.loc.gps?0:90e3);
    gpsFix(true);
  }catch(e){}
}
setTimeout(autoLoc,2500);setTimeout(autoLoc,9000);
setInterval(autoLoc,30e3);
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(autoLoc,400)});
window.addEventListener('focus',function(){setTimeout(autoLoc,400)});
