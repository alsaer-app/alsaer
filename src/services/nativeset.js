/* ---------- التحكم في شكل النوافذ العائمة والودجت (الإعدادات تُحفظ هنا وتُدفع إلى الجزء الأصلي) ---------- */
var NS_PAL={
  green:['#102A27','#C9A24B','#E8C873','#FFFFFF','#9FB3AE','#E8C873','#102A27'],
  light:['#FFFFFF','#C9A24B','#7A5B14','#1F2A28','#5B6B67','#C9A24B','#1F2A28'],
  gold:['#E8C873','#7A5B14','#102A27','#1F2A28','#4A3E1E','#102A27','#E8C873'],
  black:['#000000','#3A3A3A','#E8C873','#FFFFFF','#A0A0A0','#E8C873','#000000'],
  glass:['#0E1A18','#66FFFFFF','#E8C873','#FFFFFF','#C8D4D0','#E8C873','#0E1A18'],
  ocean:['#0F2027','#4FA3C7','#8FD3F4','#FFFFFF','#A9C6D4','#8FD3F4','#0F2027','#2C5364'],
  sunset:['#3A1C71','#D76D77','#FFAF7B','#FFFFFF','#E0C3D6','#FFAF7B','#3A1C71','#D76D77'],
  forest:['#134E5E','#71B280','#C8F2A8','#FFFFFF','#BFE0CC','#C8F2A8','#134E5E','#71B280'],
  night:['#0F0C29','#6C63FF','#B8B5FF','#FFFFFF','#9D9BC9','#B8B5FF','#0F0C29','#302B63'],
  rose:['#FFF1F4','#E08CA0','#9C2F4E','#3B1F28','#7A5560','#C2456B','#FFFFFF','#FFD6E0']
};
var NS_THEMES=[['green','أخضر وذهبي'],['light','فاتح'],['gold','ذهبي'],['black','أسود'],['glass','زجاجي'],['ocean','محيط'],['sunset','غروب'],['forest','غابة'],['night','ليل'],['rose','وردي']];
var NS_FOPTS=[
 ['design','تصميم النافذة',[['mini','مصغّرة هادئة'],['bubble','فقاعة عائمة'],['card','بطاقة'],['pill','كبسولة'],['strip','شريط جانبي'],['quote','اقتباس'],['bar','شريط علوي كامل']]],
 ['anim','حركة الظهور',[['none','بلا حركة'],['fade','تلاشٍ'],['slide','انزلاق'],['rise','ارتفاع هادئ'],['pop','ظهور نابض'],['bounce','ارتداد'],['zoom','تكبير'],['flip','قلب']]],
 ['animMs','سرعة الحركة',[[200,'سريعة'],[350,'عادية'],[600,'بطيئة'],[900,'بطيئة جدًا']]],
 ['pos','الموضع على الشاشة',[['top','أعلى'],['center','وسط'],['bottom','أسفل']]],
 ['size','حجم الخط',[['s','صغير'],['m','متوسط'],['l','كبير']]],
 ['theme','الأسلوب واللون',NS_THEMES],
 ['radius','استدارة الزوايا',[[0,'حادة'],[12,'خفيفة'],[20,'متوسطة'],[32,'دائرية']]],
 ['alpha','الشفافية',[[100,'معتمة'],[85,'خفيفة'],[70,'متوسطة'],[50,'شفافة']]],
 ['secs','مدة الظهور',[[5,'٥ ثوانٍ'],[10,'١٠ ثوانٍ'],[15,'١٥ ثانية'],[30,'٣٠ ثانية'],[0,'حتى أغلقها']]],
 ['btn','أزرار الإجراءات (التالي / نسخ)',[[true,'تظهر'],[false,'تخفى']]],
 ['haptic','الاهتزاز اللطيف عند الظهور واللمس',[[true,'يعمل'],[false,'متوقف']]]
];
var NS_WOPTS=[
 ['design','تصميم الودجت',[['full','كامل'],['compact','مضغوط'],['prayers','مع الصلوات'],['clock','ساعة كبيرة']]],
 ['theme','الأسلوب واللون',NS_THEMES],
 ['radius','استدارة الزوايا',[[0,'حادة'],[12,'خفيفة'],[22,'متوسطة'],[36,'دائرية']]],
 ['alpha','الشفافية',[[100,'معتمة'],[85,'خفيفة'],[65,'متوسطة'],[40,'شفافة']]],
 ['size','حجم الخط',[['s','صغير'],['m','متوسط'],['l','كبير']]],
 ['date','التاريخ الهجري',[[true,'يظهر'],[false,'يخفى']]],
 ['left','العدّاد التنازلي',[[true,'يظهر'],[false,'يخفى']]],
 ['book','سطر «كتابي»',[[true,'يظهر'],[false,'يخفى']]]
];
var NS_FDEF={design:'card',anim:'slide',animMs:350,pos:'top',size:'m',theme:'green',radius:20,alpha:95,secs:15,btn:true,haptic:true};
var NS_WDEF={design:'full',theme:'green',radius:22,alpha:100,size:'m',date:true,left:true,book:true};
function nsGet(k){var d=k==='f'?NS_FDEF:NS_WDEF,o=Object.assign({},d),s=(k==='f'?S.nsf:S.nsw);if(s&&typeof s==='object')Object.keys(d).forEach(function(x){if(s[x]!==undefined)o[x]=s[x]});return o}
function nsPush(k){
  var n=window.AlsaerNative;if(!n)return false;
  try{if(k==='f'&&typeof n.setFloatStyle==='function'){n.setFloatStyle(JSON.stringify(nsGet('f')));return true}
      if(k==='w'&&typeof n.setWidgetStyle==='function'){n.setWidgetStyle(JSON.stringify(nsGet('w')));return true}}catch(e){}
  return false;
}
setTimeout(function(){try{if(S.nsf)nsPush('f');if(S.nsw)nsPush('w')}catch(e){}},3500);
function nsGroup(k,o,cur){
  return '<div class="ns-g"><b>'+o[1]+'</b><div class="chips">'+o[2].map(function(x){
    return '<button type="button" class="chip'+(String(cur[o[0]])===String(x[0])?' on':'')+'" data-a="ns'+k+'" data-v="'+o[0]+':'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div></div>';
}
function nsPrev(k,c){
  var p=NS_PAL[c.theme]||NS_PAL.green,al=k==='f'?Math.max(20,Math.min(100,c.alpha))/100:(c.theme==='glass'?.55:1),sc=c.size==='s'?.88:c.size==='l'?1.2:1;
  function rgba(h,a){var m=/^#(..)(..)(..)$/.exec(h);return 'rgba('+parseInt(m[1],16)+','+parseInt(m[2],16)+','+parseInt(m[3],16)+','+a+')'}
  var bg=p[7]?'linear-gradient(135deg,'+rgba(p[0],al)+','+rgba(p[7],al)+')':rgba(p[0],al);
  if(k==='f'){
    var d=c.design||'card';
    if(d==='bubble')return '<div class="ns-pv"><div class="ns-pvc" style="width:54px;height:54px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:'+bg+';border:2px solid '+p[1]+';color:'+p[2]+';font-size:'+(24*sc)+'px;margin:0 auto">☾</div><small style="display:block;text-align:center;margin-top:6px;opacity:.7">يظهر النص تلقائيًا ثم يتصغّر إلى فقاعة؛ المسها لتوسيعه واسحبها لتحريكها</small></div>';
    var rad=d==='mini'?18:d==='pill'?60:d==='bar'?0:Math.max(d==='quote'?20:0,c.radius),pad=d==='mini'?'10px 14px':d==='pill'?'10px 20px':d==='quote'?'18px 24px':'14px 18px',q=d==='quote';
    var btn=(c.btn&&d!=='pill')?'<div class="ns-pvb"><span style="background:'+p[5]+';color:'+p[6]+'">التالي</span><span style="border:1px solid '+p[5]+';color:'+p[5]+'">نسخ</span></div>':'';
    var inner=(q?'<div style="text-align:center;color:'+p[2]+';font-size:'+(30*sc)+'px;line-height:1">❝</div>':'')
      +(q?'':'<b style="color:'+p[2]+';font-size:'+((d==='pill'?13:17)*sc)+'px">آية من القرآن</b>')
      +'<div style="font-size:'+((q?18:d==='pill'?14:15)*sc)+'px;color:'+p[3]+(q?';text-align:center':'')+'">﴿وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ﴾</div>'
      +(q?'<b style="text-align:center;color:'+p[2]+';font-size:'+(13*sc)+'px;margin-top:8px">آية من القرآن</b>':'')+btn+(d==='pill'?'':'<small style="color:'+p[4]+'">إغلاق</small>');
    var box='<div class="ns-pvc" style="background:'+bg+';border:'+(d==='bar'?'0':'1px solid '+p[1])+';border-radius:'+rad+'px;padding:'+pad+';'+(d==='strip'?'border-right:6px solid '+p[2]+';':'')+(d==='bar'?'width:100%;':'')+(d==='mini'?'max-width:300px;margin:0 auto;':'')+'">'+inner+'</div>';
    return '<div class="ns-pv">'+box+'</div>';
  }
  var wd=c.design||'full',cp=wd==='compact',ck=wd==='clock',wb=p[7]?'linear-gradient(135deg,'+rgba(p[0],c.alpha/100)+','+rgba(p[7],c.alpha/100)+')':rgba(p[0],c.alpha/100);
  var pr=wd==='prayers'?'<div style="display:flex;gap:6px;justify-content:space-around;margin-top:6px;font-size:'+(10*sc)+'px;color:'+p[4]+'"><span style="color:'+p[5]+'">العصر<br>٣:١٠</span><span>المغرب<br>٥:٥٠</span><span>العشاء<br>٧:١٥</span><span>الفجر<br>٤:٣٠</span></div>':'';
  return '<div class="ns-pv"><div class="ns-pvc ns-pw" style="background:'+wb+';border:1px solid '+p[1]+';border-radius:'+(c.radius||22)+'px;color:'+p[3]+'"><small style="color:'+p[2]+';font-size:'+((ck?14:13)*sc)+'px">'+(ck?'العصر':'الصلاة القادمة: العصر')+'</small><b style="font-size:'+((ck?40:cp?22:26)*sc)+'px">٣:١٠ م</b>'
    +(c.left&&!ck?'<small style="color:'+p[4]+';font-size:'+(12*sc)+'px">متبقٍ ١:٢٥:٠٠</small>':'')+((c.date&&!cp)||(ck&&c.date)?'<small style="color:'+p[4]+';font-size:'+(11*sc)+'px">٤ جمادى الآخرة</small>':'')+pr+(c.book&&!cp&&!ck?'<small style="color:'+p[5]+';font-size:'+(11*sc)+'px">كتابي: رياض الصالحين · ٣٪</small>':'')+'</div></div>';
}
function nsNote(){
  var n=window.AlsaerNative;
  return (n&&typeof n.setFloatStyle==='function')?'':'<p class="note">تُحفظ اختياراتك، لكنها تظهر على هاتفك داخل تطبيق الأندرويد بعد تحديث التطبيق.</p>';
}
function vFloatSet(){
  var c=nsGet('f'),n=window.AlsaerNative,on=false,can=false;
  try{on=!!(n&&n.floatingEnabled&&n.floatingEnabled());can=!!(n&&n.canDrawOverlays&&n.canDrawOverlays())}catch(e){}
  var pu=0;try{pu=Number(n&&n.floatingPausedUntil&&n.floatingPausedUntil())||0}catch(e){}
  var pl=pu>Date.now()?'موقوفة حتى '+hmFmtSafe((function(d){return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)})(new Date(pu))):'إيقاف مؤقت';
  return '<div class="ns">'+nsNote()+'<section class="card"><h3>معاينة</h3>'+nsPrev('f',c)+'<div class="acts"><button class="btn ghost" data-a="nsftest">معاينة الحركة على هاتفي</button><button class="btn ghost" data-a="tab" data-v="floatfeed">الجدولة والمحتوى</button></div></section>'
   +'<section class="card"><h3>التفعيل</h3><p class="note">'+(on&&can?'التذكيرات العائمة مفعّلة.':!can?'تحتاج إذن «العرض فوق التطبيقات الأخرى» أولًا.':'التذكيرات العائمة متوقفة.')+'</p><div class="acts"><button class="btn" data-a="nsfen">'+(!can?'منح الإذن':on?'إيقاف':'تشغيل')+'</button><button class="btn ghost" data-a="nsftest">جرّب الآن</button><button class="btn ghost" data-a="nsfpause">'+pl+'</button></div></section>'
   +'<section class="card"><h3>الشكل</h3>'+NS_FOPTS.map(function(o){return nsGroup('f',o,c)}).join('')+'<div class="acts"><button class="btn ghost" data-a="nsfreset">استعادة الافتراضي</button></div></section></div>';
}
function vWidgetSet(){
  var c=nsGet('w');
  return '<div class="ns">'+nsNote()+'<section class="card"><h3>معاينة</h3>'+nsPrev('w',c)+'<p class="note">أضف الودجت من قائمة ودجت هاتفك (السائر). سطر «كتابي» يعرض كتابك الحالي ونسبة تقدّمه.</p></section>'
   +'<section class="card"><h3>الشكل والمحتوى</h3>'+NS_WOPTS.map(function(o){return nsGroup('w',o,c)}).join('')+'<div class="acts"><button class="btn ghost" data-a="nswreset">استعادة الافتراضي</button></div></section></div>';
}
function nsAct(a,v){
  var n=window.AlsaerNative;
  if(a==='nsf'||a==='nsw'){
    var k=a.charAt(2),i=String(v).indexOf(':'),key=String(v).slice(0,i),raw=String(v).slice(i+1),val=raw==='true'?true:raw==='false'?false:(/^-?\d+$/.test(raw)?parseInt(raw,10):raw);
    var f=k==='f'?'nsf':'nsw';if(!S[f]||typeof S[f]!=='object')S[f]={};S[f][key]=val;save();nsPush(k);
    if(k==='f'&&n&&typeof n.testFloating==='function'&&key!=='secs'){try{n.testFloating()}catch(e){}}
    return false;
  }
  if(a==='nsfreset'){S.nsf={};save();nsPush('f');return false}
  if(a==='nswreset'){S.nsw={};save();nsPush('w');return false}
  if(a==='nsfen'){
    try{
      if(!n||typeof n.canDrawOverlays!=='function'){toast('هذه الميزة تعمل في تطبيق الأندرويد بعد التحديث');return true}
      if(!n.canDrawOverlays()){n.openOverlaySettings();toast('فعّل «العرض فوق التطبيقات الأخرى» ثم ارجع');return true}
      var on=!!n.floatingEnabled();n.setFloating(!on);nsPush('f');toast(on?'أُوقفت التذكيرات العائمة':'فُعّلت التذكيرات العائمة');
    }catch(e){toast('هذه الميزة غير متاحة في هذه النسخة')}
    return false;
  }
  if(a==='nsftest'){try{if(n&&n.testFloating){nsPush('f');n.testFloating()}else toast('تعمل المعاينة داخل تطبيق الأندرويد')}catch(e){}return true}
  if(a==='nsfpause'){
    try{var pu=Number(n.floatingPausedUntil()),left=pu>Date.now()?(pu-Date.now())/60000:0,nx=left<=0?60:left<=61?180:left<=181?480:0;n.pauseFloating(nx);toast(nx?'أُوقفت العائمة '+ar(String(nx/60))+' ساعة':'عادت التذكيرات العائمة')}catch(e){toast('هذه الميزة غير متاحة في هذه النسخة')}
    return false;
  }
  return false;
}
