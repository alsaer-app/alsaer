/* ---------- النوافذ العائمة المستقلة: جدولة خاصة بها ومحتوى إسلامي قصير (منفصلة تمامًا عن الإشعارات) ---------- */
var FF_DEF={mode:'interval',every:120,from:'07:00',to:'22:00',all:false,times:['08:00','13:00','20:00'],days:[],types:['ayah','hadith','dhikr','dua','tip'],custom:[],src:false,linked:false,order:'rand'};
var FF_LBL={ayah:'آية من القرآن',hadith:'حديث نبوي',dhikr:'ذكر',dua:'دعاء',tip:'تذكير'};
var FF_TYPES=[['ayah','آيات'],['hadith','أحاديث'],['dhikr','أذكار وصلاة على النبي'],['dua','أدعية'],['tip','نصائح وتذكيرات'],['custom','نصوصي']];
var FF_EVERY=[[15,'١٥ دقيقة'],[30,'٣٠ دقيقة'],[60,'ساعة'],[120,'ساعتان'],[180,'٣ ساعات'],[240,'٤ ساعات'],[360,'٦ ساعات'],[720,'١٢ ساعة']];
var FF_DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
var ffBusy=false;
function ffGet(){var o=JSON.parse(JSON.stringify(FF_DEF)),s=S.ff;if(s&&typeof s==='object')Object.keys(FF_DEF).forEach(function(k){if(s[k]!==undefined)o[k]=s[k]});return o}
function ffSet(k,v){if(!S.ff||typeof S.ff!=='object')S.ff={};S.ff[k]=v;save();ffPushCfg()}
function ffPushCfg(){var n=window.AlsaerNative;try{if(n&&typeof n.setFloatFeed==='function'){n.setFloatFeed(JSON.stringify(ffGet()));return true}}catch(e){}return false}
function ffKind(x){var k=String(x.kind||'');if(/آية/.test(k))return 'ayah';if(/حديث/.test(k)||x.grade)return 'hadith';if(/دعاء|الدعاء/.test(k))return 'dua';if(/الاستغفار|أذكار|الصلاة على النبي|تسبيح/.test(k))return 'dhikr';return 'tip'}
function ffAyat(){try{var a=JSON.parse(localStorage.getItem('alsaer_ff_ayat')||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function ffPool(){
  var out=[],seen={};
  function add(k,t,b,s){b=String(b||'').trim();if(!b||b.length>320||seen[b])return;seen[b]=1;out.push({k:k,t:t,b:b,s:String(s||'')})}
  try{dailyGeneralPool().forEach(function(x){var k=ffKind(x);add(k,FF_LBL[k],x.t,x.s)})}catch(e){}
  try{hadithOfflinePool().forEach(function(x){add('hadith',FF_LBL.hadith,x.t,x.s)})}catch(e){}
  ffAyat().forEach(function(x){add('ayah',FF_LBL.ayah,x.b,x.s)});
  return out.slice(0,500);
}
function ffPushPool(){var n=window.AlsaerNative;try{if(n&&typeof n.setFloatPool==='function'){n.setFloatPool(JSON.stringify(ffPool()));return true}}catch(e){}return false}
function ffJson(u){
  var ctl=(typeof AbortController==='function')?new AbortController():null,to=ctl?setTimeout(function(){ctl.abort()},9000):null;
  return fetch(u,{headers:{'Accept':'application/json'},signal:ctl?ctl.signal:undefined}).then(function(r){if(to)clearTimeout(to);if(!r.ok)throw new Error('x');return r.json()}).catch(function(){if(to)clearTimeout(to);return null});
}
/* آيات عشوائية من واجهة مجانية بلا مفتاح (api.alquran.cloud) */
function ffFetchAyat(){
  if(typeof fetch!=='function'||navigator.onLine===false)return Promise.resolve(0);
  var cur=ffAyat(),seen={},ns=[],i;cur.forEach(function(x){seen[x.b]=1});
  for(i=0;i<14;i++)ns.push(1+Math.floor(Math.random()*6236));
  return Promise.all(ns.map(function(n){return ffJson('https://api.alquran.cloud/v1/ayah/'+n+'/quran-uthmani')})).then(function(rs){
    var add=0;
    rs.forEach(function(j){var d=j&&j.data;if(!d||!d.text||!d.surah)return;var b='﴿'+String(d.text).trim()+'﴾';if(b.length>320||seen[b])return;seen[b]=1;cur.push({b:b,s:'سورة '+String(d.surah.name||'').replace(/^سورة\s*/,'')+' · آية '+ar(d.numberInSurah)});add++});
    try{localStorage.setItem('alsaer_ff_ayat',JSON.stringify(cur.slice(-150)))}catch(e){}
    return add;
  });
}
/* تجديد: يجلب محتوى جديدًا ثم يدفع الجدول والمحتوى للتطبيق الأصلي */
function ffRefresh(){
  if(ffBusy)return Promise.resolve(false);
  ffBusy=true;
  var p=[];
  try{p.push(ffFetchAyat())}catch(e){}
  try{p.push(refreshDailyCardFromApi())}catch(e){}
  return Promise.all(p).catch(function(){}).then(function(){
    try{localStorage.setItem('alsaer_ff_at',String(Date.now()))}catch(e){}
    ffPushCfg();ffPushPool();ffBusy=false;return true;
  });
}
setTimeout(function(){
  try{ffPushCfg();ffPushPool()}catch(e){}
  var at=0;try{at=Number(localStorage.getItem('alsaer_ff_at')||0)}catch(e){}
  if(Date.now()-at>20*3600*1000)try{ffRefresh().then(function(){if(tab==='floatfeed')render()})}catch(e){}
},4200);
/* حساب المواعيد القادمة (نسخة JS مطابقة لمنطق الجافا؛ تُستعمل للعرض عند عدم توفر الجزء الأصلي) */
function ffSlots(c){
  var out=[],hm=function(s,d){var m=/^(\d+):(\d+)$/.exec(String(s||''));return m?Math.min(1439,+m[1]*60+ +m[2]):d};
  if(c.mode==='times'){(c.times||[]).forEach(function(t){out.push(hm(t,480))})}
  else{var ev=Math.max(5,Math.min(1440,+c.every||120)),f=0,t=1439;if(!c.all){f=hm(c.from,420);t=hm(c.to,1320);if(t<=f)t+=1440}for(var m=f;m<=t&&out.length<300;m+=ev)out.push(m)}
  return out.sort(function(a,b){return a-b});
}
function ffUpcomingJs(c,n){
  var sl=ffSlots(c),out=[],t=Date.now();if(!sl.length)return out;
  for(var k=0;k<n;k++){
    var found=0;
    for(var d=-1;d<9&&!found;d++){
      var day=new Date();day.setHours(0,0,0,0);day.setDate(day.getDate()+d);
      if(c.days&&c.days.length&&c.days.indexOf(day.getDay())<0)continue;
      for(var i=0;i<sl.length;i++){var x=new Date(day.getTime());x.setMinutes(sl[i]);if(x.getTime()>t){out.push(x.getTime());t=x.getTime();found=1;break}}
    }
    if(!found)break;
  }
  return out;
}
function ffUpcoming(n){
  var nat=window.AlsaerNative;
  try{if(nat&&typeof nat.floatUpcoming==='function'){var a=JSON.parse(nat.floatUpcoming(n));if(Array.isArray(a))return a}}catch(e){}
  return ffUpcomingJs(ffGet(),n);
}
function ffFmt(ms){
  var d=new Date(ms),t=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2),n=new Date();
  var k=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);
  return (k===0?'اليوم':k===1?'غدًا':ar(d.getDate())+'/'+ar(d.getMonth()+1))+' · '+hmFmtSafe(t);
}
function ffChips(act,items,isOn){
  return '<div class="chips">'+items.map(function(x){return '<button type="button" class="chip'+(isOn(x[0])?' on':'')+'" data-a="'+act+'" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
}
function ffSetChips(key,items,cur){
  return '<div class="chips">'+items.map(function(x){return '<button type="button" class="chip'+(String(cur)===String(x[0])?' on':'')+'" data-a="ffset" data-v="'+key+':'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
}
function vFloatFeed(){
  var c=ffGet(),n=window.AlsaerNative,on=false,can=false,last=0,psz=0;
  try{on=!!(n&&n.floatingEnabled&&n.floatingEnabled());can=!!(n&&n.canDrawOverlays&&n.canDrawOverlays());last=Number(n&&n.floatLastShown&&n.floatLastShown())||0;psz=Number(n&&n.floatPoolSize&&n.floatPoolSize())||0}catch(e){}
  var ferr=null;try{if(n&&n.floatLastError)ferr=JSON.parse(n.floatLastError()||'null')}catch(e){}
  if(!psz)psz=ffPool().length;
  var up=ffUpcoming(8),nat=!!(n&&typeof n.setFloatFeed==='function');
  var h='<div class="ns">'+(nat?'':'<p class="note">تُحفظ اختياراتك، وتعمل النوافذ على هاتفك داخل تطبيق الأندرويد بعد التحديث.</p>');
  h+='<section class="card"><h3>التفعيل</h3><p class="note">'+(on&&can?'النوافذ العائمة تعمل بجدولتها الخاصة، ولا تظهر مع الإشعارات إلا إن اخترت ذلك أدناه.':!can?'تحتاج إذن «العرض فوق التطبيقات الأخرى» أولًا.':'النوافذ العائمة متوقفة.')+'</p>'
    +'<div class="acts"><button class="btn" data-a="nsfen">'+(!can?'منح الإذن':on?'إيقاف':'تشغيل')+'</button><button class="btn ghost" data-a="nsftest">جرّب الآن</button><button class="btn ghost" data-a="nsfpause">إيقاف مؤقت</button></div>'
    +(ferr&&ferr.m?'<p class="note">آخر خطأ مسجّل: '+esc(ferr.m)+(ferr.t?' · '+ffFmt(ferr.t):'')+'</p>':'')+'</section>';
  h+='<section class="card"><h3>أوقات الظهور القادمة</h3>'
    +(up.length?'<div class="chips">'+up.map(function(t){return '<span class="chip on ff-t">'+ffFmt(t)+'</span>'}).join('')+'</div>':'<p class="note">لا مواعيد قادمة؛ اختر أوقاتًا أو أيامًا.</p>')
    +'<p class="note">'+(last?'آخر ظهور: '+ffFmt(last):'لم تظهر نافذة بعد.')+'</p>'
    +'<div class="acts"><button class="btn" data-a="ffrefresh">'+(ffBusy?'جارٍ التجديد…':'تجديد')+'</button></div><p class="note">«تجديد» يعيد ضبط الجدولة ويجلب محتوى إسلاميًا جديدًا من الإنترنت.</p></section>';
  h+='<section class="card"><h3>الجدولة</h3>'
    +'<div class="ns-g"><b>طريقة الظهور</b>'+ffSetChips('mode',[['interval','كل فترة'],['times','أوقات أحددها']],c.mode)+'</div>';
  if(c.mode==='times'){
    h+='<div class="ns-g"><b>الأوقات</b><div class="chips">'+c.times.map(function(t,i){return '<button type="button" class="chip on" data-a="ffdel" data-v="'+i+'">'+hmFmtSafe(t)+' ✕</button>'}).join('')+'</div></div>'
      +'<div class="ff-add"><input id="ff-add" class="qd-i" type="time" value="09:00"><button class="btn ghost" data-a="ffadd">'+ic('plus')+' إضافة وقت</button></div>';
  }else{
    h+='<div class="ns-g"><b>على مدار ٢٤ ساعة</b>'+ffSetChips('all',[[true,'نعم، طوال اليوم'],[false,'لا، في فترة محددة']],c.all)+'</div>'
      +'<div class="ns-g"><b>تتكرر كل</b>'+ffSetChips('every',FF_EVERY,c.every)+'</div>';
    if(!c.all)h+='<div class="ns-g"><b>الفترة اليومية</b><div class="ff-add"><label>من<input id="ff-from" class="qd-i" type="time" value="'+esc(c.from)+'"></label><label>إلى<input id="ff-to" class="qd-i" type="time" value="'+esc(c.to)+'"></label><button class="btn ghost" data-a="ffsave">حفظ الفترة</button></div></div>';
  }
  h+='<div class="ns-g"><b>الأيام (بدون اختيار = كل يوم)</b>'+ffChips('ffday',FF_DAYS.map(function(d,i){return [i,d]}),function(v){return c.days.indexOf(+v)>=0})+'</div></section>';
  h+='<section class="card"><h3>المحتوى</h3><div class="ns-g"><b>ما الذي يظهر؟</b>'+ffChips('fftype',FF_TYPES,function(v){return c.types.indexOf(v)>=0})+'</div>'
    +'<p class="note">المتاح الآن: '+ar(String(psz))+' نصًّا بين مضمّن ومجلوب من الإنترنت، ويعمل بلا اتصال بعد الجلب.</p>'
    +'<div class="ns-g"><b>نصوصي الخاصة</b>'+(c.custom.length?'<div class="ff-cl">'+c.custom.map(function(t,i){return '<div class="ff-ci"><span>'+esc(t)+'</span><button type="button" class="ib" data-a="ffctdel" data-v="'+i+'" aria-label="حذف">✕</button></div>'}).join('')+'</div>':'')
    +'<textarea id="ff-ct" class="qd-i" rows="2" maxlength="260" placeholder="اكتب دعاءً أو تذكيرًا يظهر ضمن النوافذ"></textarea><div class="acts"><button class="btn ghost" data-a="ffct">'+ic('plus')+' أضف نصًا</button></div></div>'
    +'<div class="ns-g"><b>ترتيب الظهور</b>'+ffSetChips('order',[['rand','عشوائي'],['seq','بالتتابع']],c.order)+'</div>'
    +'<div class="ns-g"><b>سطر المصدر تحت النص</b>'+ffSetChips('src',[[false,'يخفى'],[true,'يظهر']],c.src)+'</div>'
    +'<div class="ns-g"><b>الربط بالإشعارات</b>'+ffSetChips('linked',[[false,'منفصلة (موصى به)'],[true,'تظهر أيضًا مع إشعارات الصلاة والتذكيرات']],c.linked)+'</div></section>';
  h+='<section class="card"><h3>الشكل والحركة</h3><p class="note">الأنماط والألوان والحركة ومدة الظهور في صفحة الشكل.</p><div class="acts"><button class="btn ghost" data-a="tab" data-v="floatset">تخصيص الشكل والحركة</button></div></section></div>';
  return h;
}
function ffAct(a,v){
  var c=ffGet(),n=window.AlsaerNative;
  if(a==='ffset'){
    var i=String(v).indexOf(':'),k=String(v).slice(0,i),r=String(v).slice(i+1),val=r==='true'?true:r==='false'?false:(/^-?\d+$/.test(r)?parseInt(r,10):r);
    ffSet(k,val);try{if(n&&n.floatRefresh)n.floatRefresh()}catch(e){}return false;
  }
  if(a==='fftype'){var t=c.types.slice(),x=t.indexOf(v);if(x>=0)t.splice(x,1);else t.push(v);ffSet('types',t);return false}
  if(a==='ffday'){var d=c.days.slice(),y=d.indexOf(+v);if(y>=0)d.splice(y,1);else d.push(+v);d.sort();ffSet('days',d);return false}
  if(a==='ffsave'){var f=(document.getElementById('ff-from')||{}).value,t2=(document.getElementById('ff-to')||{}).value;if(!/^\d\d:\d\d$/.test(f||'')||!/^\d\d:\d\d$/.test(t2||'')){toast('اختر وقتي البداية والنهاية');return true}S.ff=S.ff||{};S.ff.from=f;S.ff.to=t2;save();ffPushCfg();toast('حُفظت الفترة');return false}
  if(a==='ffadd'){var tv=(document.getElementById('ff-add')||{}).value;if(!/^\d\d:\d\d$/.test(tv||'')){toast('اختر وقتًا أولًا');return true}var ts=c.times.slice();if(ts.indexOf(tv)<0)ts.push(tv);ts.sort();ffSet('times',ts);return false}
  if(a==='ffdel'){var ts2=c.times.slice();ts2.splice(+v,1);ffSet('times',ts2);return false}
  if(a==='ffct'){var tx=((document.getElementById('ff-ct')||{}).value||'').trim();if(!tx){toast('اكتب النص أولًا');return true}var cu=c.custom.slice();cu.push(tx.slice(0,260));var ty=c.types.slice();if(ty.indexOf('custom')<0)ty.push('custom');S.ff=S.ff||{};S.ff.types=ty;ffSet('custom',cu);return false}
  if(a==='ffctdel'){var cu2=c.custom.slice();cu2.splice(+v,1);ffSet('custom',cu2);return false}
  if(a==='ffrefresh'){
    ffPushCfg();try{if(n&&n.floatRefresh)n.floatRefresh()}catch(e){}
    ffRefresh().then(function(){if(tab==='floatfeed')render();toast('تم التجديد')});
    toast('جارٍ التجديد…');render();return true;
  }
  return false;
}
