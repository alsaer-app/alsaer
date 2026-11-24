var setCat='',setSub='',scAnim=0;
if(!IC.hash)IC.hash='<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>';
function sgGroup(t,rows){return '<div class="sg-t">'+t+'</div><div class="sg-card">'+rows+'</div>'}
function sgRow(icon,title,desc,ctl,extra){return '<div class="sg-row'+(extra||'')+'"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div>'+(ctl?'<div class="sg-ctl">'+ctl+'</div>':'')+'</div>'}
function sgSeg(items,cur,act,extraAttr){return '<div class="sg-seg">'+items.map(function(x){return '<button type="button" class="'+(cur===x[0]?'on':'')+'" '+(extraAttr?extraAttr.replace('%v',x[0]):'data-a="'+act+'" data-v="'+x[0]+'"')+'>'+x[1]+'</button>'}).join('')+'</div>'}

function sgPill(ok,okT,badT){return '<span class="sg-pill '+(ok?'ok':'bad')+'">'+(ok?okT+' ✓':badT)+'</span>'}
function sgDev(){
  var d=window.__devInfo||{},ua=navigator.userAgent||'',m=/Android\s([\d.]+)/.exec(ua),av=d.av||(m&&m[1])||'',model=d.model||'';
  if(!model){var mm=/;\s*([^;)]+?)\s*(?:Build|\))/.exec(ua);if(mm&&mm[1]&&mm[1].length>1&&!/^(K|Android)$/i.test(mm[1]))model=mm[1]}
  var api={'15':35,'14':34,'13':33,'12':31,'11':30,'10':29,'9':28,'8':26,'7':24}[String(av).split('.')[0]];
  var mf=/Xiaomi|Redmi|POCO|\bMI\b|^M\d{4}|^2\d{6}[A-Z]|^2[0-9]{3}[A-Z0-9]{4,}$/i.test(model)?'Xiaomi / Redmi / Poco':/^SM-|Samsung/i.test(model)?'Samsung':/^CPH|OPPO|Realme|RMX/i.test(model)?'OPPO / Realme':/HUAWEI|Honor|^[A-Z]{3}-L\d/i.test(model)?'Huawei / Honor':/Infinix|Tecno|itel/i.test(model)?'Infinix / Tecno':'';
  return {model:model,av:av,api:api,mf:mf};
}
try{if(navigator.userAgentData&&navigator.userAgentData.getHighEntropyValues)navigator.userAgentData.getHighEntropyValues(['model','platformVersion']).then(function(h){window.__devInfo={model:h.model||'',av:(h.platformVersion||'').split('.')[0]};try{if(tab==='settings')render()}catch(e){}}).catch(function(){})}catch(e){}
function sgPerms(){
  var nat=window.AlsaerNative,r={};try{r=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'{}')}catch(e){}
  var pk=false,ek=false;try{pk=!!(nat&&nat.notificationsEnabled&&nat.notificationsEnabled())}catch(e){}try{ek=!!(nat&&nat.canExactAlarms&&nat.canExactAlarms())}catch(e){}
  if(!nat)return sgGroup('الصلاحيات للعمل في الخلفية',sgRow('shield','تعمل داخل تطبيق الهاتف','تظهر حالة الإشعارات والمنبّهات والبطارية عند التشغيل على أندرويد',''));
  var dv=sgDev();
  var oem=dv.mf==='Xiaomi / Redmi / Poco'?['الإعدادات ← التطبيقات ← التطبيق','البطارية ← «لا قيود»','الإعدادات ← التطبيقات ← التأذين التلقائي ← فعّل لهذا التطبيق','الإعدادات ← البطارية ← تحسين البطارية ← أوقف تحسين هذا التطبيق']:['افتح إعدادات التطبيق ثم البطارية واختر «بلا قيود»','فعّل «التشغيل التلقائي» إن وُجد في هاتفك','ثبّت التطبيق في قائمة التطبيقات الحديثة (قفل التطبيق)'];
  return sgGroup('الصلاحيات للعمل في الخلفية',
    sgRow('bell','إشعارات النظام','',sgPill(pk,'مفوّض','غير مفعّل'))
    +sgRow('clock','المنبّهات الدقيقة (أندرويد 12+)','',sgPill(ek,'مفوّض','غير مفعّل'))
    +sgRow('shield','تحسين البطارية','',sgPill(!!r.battDone,'مفوّض','غير مؤكَّد'))
    +'<button type="button" class="sg-row sg-btn" data-a="tab" data-v="reminders"><span class="sg-ic">'+ic('check')+'</span><div class="sg-tx"><b>فحص وإصلاح الإشعارات</b><small>اختبار الإشعار وفتح إعدادات البطارية</small></div><div class="sg-ctl sg-val">'+ic('chev').replace('class="i"','class="i chev"')+'</div></button>')
  +'<div class="sg-t">إرشادات خاصة — '+(dv.mf||'الهواتف')+'</div><div class="sg-card"><ol class="sg-steps">'+oem.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol></div>';
}
function sgStatus(){
  var nat=window.AlsaerNative,r={};try{r=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'{}')}catch(e){}
  var pk=false;try{pk=!!(nat&&nat.notificationsEnabled&&nat.notificationsEnabled())}catch(e){}
  var dv=sgDev(),rows='';
  if(dv.model)rows+='<div class="sg-kv"><span>الجهاز:</span><b dir="ltr">'+esc(dv.model)+'</b></div>';
  if(dv.av)rows+='<div class="sg-kv"><span>نظام Android:</span><b dir="ltr">'+(dv.api?'API '+dv.api:'Android '+esc(dv.av))+'</b></div>';
  if(dv.mf)rows+='<div class="sg-kv"><span>نوع الشركة:</span><b dir="ltr">'+dv.mf+'</b></div>';
  rows+='<div class="sg-kv"><span>التذكيرات في الخلفية:</span><b class="'+((nat&&pk&&r.enabled)?'sg-good':'')+'">'+((nat&&pk&&r.enabled)?'مفعّل':'غير مفعّل')+'</b></div>';
  return sgGroup('حالة النظام',rows);
}
function sgLit(html,on){return on?html.replace('class="lrow','class="lrow lit').replace('class="sc-tile','class="sc-tile lit').replace('class="sg-row','class="sg-row lit'):html}

/* --- صفوف الاتجاه أ: تنقّل/لوحات داخل بطاقات مجمّعة --- */
function sgCtlV(val){return '<div class="sg-ctl">'+(val?'<span class="sg-val">'+val+'</span>':'')+ic('chev').replace('class="i"','class="i chev"')+'</div>'}
function sgNav(key,icon,title,desc,val){return '<button type="button" class="sg-row sg-btn" data-a="sopen" data-v="'+key+'" aria-expanded="'+(setOpen===key)+'"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div>'+sgCtlV(val)+'</button>'}
function sgNavTab(tabId,icon,title,desc,val){return '<button type="button" class="sg-row sg-btn" data-a="tab" data-v="'+tabId+'"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div>'+sgCtlV(val)+'</button>'}
function sgNavSub(sub,icon,title,desc,val){return '<button type="button" class="sg-row sg-btn" data-a="ssub" data-v="'+sub+'"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div>'+sgCtlV(val)+'</button>'}
function sgSwitch(icon,title,desc,attr,on){return '<div class="sg-row'+(on?' lit':'')+'"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div><div class="sg-ctl"><label class="rm-sw"><input type="checkbox" '+attr+' '+(on?'checked':'')+'><i></i></label></div></div>'}
function sgSegRow(icon,title,desc,segHtml){return '<div class="sg-row segrow"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div><div class="sg-ctl">'+segHtml+'</div></div>'}
var IC_BELLOFF='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 9.5-4.9M18 11c0 4 1.5 5.5 2 6H6"/><path d="M10 20a2 2 0 0 0 4 0M3 3l18 18"/></svg>';


function sgDeveloperCard(){return '<section class="sg-card settings-dev"><div class="settings-dev-head"><span class="settings-dev-avatar" aria-hidden="true">AE</span><div class="settings-dev-name"><b dir="ltr">Ahmed Elagamy</b><p>مطور السائر إلى الله</p></div><span class="settings-dev-version" dir="ltr">v'+esc(APP_VERSION)+'</span></div><div class="settings-dev-links"><a href="https://github.com/alsaer-app/alsaer" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.61-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg></a><a href="https://www.facebook.com/share/1BsNZ3BKX3/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/></svg></a><a href="https://wa.me/qr/Y6QVW6757YOCE1?s=v" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4z"/><path d="M8.3 7.7c-.8.4-.7 1.8-.1 3.1 1 2.1 2.7 3.6 4.8 4.1 1.1.3 2.3 0 2.5-1.1l-2.1-1.3-.9.9c-1.3-.5-2.3-1.5-2.9-2.8l.7-.9-1-2.1z"/></svg></a></div></section>'}

function vSettings(){
  var M='<p class="msg">'+esc(msg)+'</p>';
  var P=function(k,html){return setOpen===k?'<div class="panel">'+html+'</div>':''};
  var nat=window.AlsaerNative,rr={};try{rr=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'{}')}catch(e){}
  var dg=U().digits==='west'?'west':'east',auto=!!(S.loc&&S.loc.auto),pk=false,ek=false;
  try{pk=!!(nat&&nat.notificationsEnabled&&nat.notificationsEnabled())}catch(e){}try{ek=!!(nat&&nat.canExactAlarms&&nat.canExactAlarms())}catch(e){}
  var wOn=false,fOn=false;try{wOn=!!(nat&&nat.widgetActive&&nat.widgetActive());fOn=!!(nat&&nat.floatingEnabled&&nat.floatingEnabled()&&nat.canDrawOverlays&&nat.canDrawOverlays())}catch(e){}
  var nOn=!!(rr.enabled&&(nat?pk:true));
  var permN=nat?(pk?1:0)+(ek?1:0)+(rr.battDone?1:0):0;

  /* ===== الشكل والعرض ===== */
  var u=U(),md=uiMode(),sid=pick(Object.keys(STY),u.style,'calm'),lk=pick(LOOKS,u.look,'classic');
  var lkE=LOOKS.filter(function(x){return x[0]===lk})[0]||LOOKS[0];
  var fn=pick(FONTS,u.font,'plex'),fnN=(FONTS.filter(function(x){return x[0]===fn})[0]||[])[1]||'';
  var pr=pick(PRESSES,u.press,'bounce'),prN=(PRESSES.filter(function(x){return x[0]===pr})[0]||[])[1]||'';
  var tr=pick(TRANSES,u.trans,'rise'),trN=(TRANSES.filter(function(x){return x[0]===tr})[0]||[])[1]||'';
  var ac=apAcc();
  var hidN=HOME_SECS.filter(function(x){return !(S.homeHide&&S.homeHide[x[0]])}).length;
  var LOOK='<div class="sg-card">'
   +sgSegRow(isDark()?'moon':'sun','الوضع','تلقائي يتبع نظام هاتفك',sgSeg([['system','تلقائي'],['light','فاتح'],['dark','داكن']],md,'umode'))
   +sgNav('sty','sparkles','النمط','الثيم وشكل الواجهة في اختيار واحد',STY[sid].n+' · '+lkE[1])
   +P('sty','<div style="padding:4px 2px 8px"><p class="sg-pl">الثيم</p><div class="sty-grid">'+Object.keys(STY).map(function(k){var s=STY[k];return oBtn('ustyle',k,sid,'<span class="pv" style="background:'+s.pv[0]+'"><i style="background:'+s.pv[1]+'"></i><b style="background:'+s.pv[2]+'"></b></span><small>'+s.n+'</small>','uo sty')}).join('')+'</div><p class="sg-pl" style="margin-top:12px">شكل الواجهة</p><div class="look-row">'+LOOKS.map(function(x){return oBtn('ulook',x[0],lk,'<span class="lk-pv '+x[0]+'"><i></i><i></i></span><b>'+x[1]+'</b>','uo lo')}).join('')+'</div><p class="note">'+lkE[2]+'</p></div>')
   +sgNav('acc','target','لون التطبيق','','<span class="sg-dot" style="background:'+ac.col+'"></span>'+(ac.name?' '+ac.name:''))
   +P('acc','<div style="padding:4px 2px 8px"><div class="acc-row">'+ACC.map(function(x){var on=ac.id===x.id;return '<button class="acc" data-a="uacc" data-v="'+x.id+'" aria-pressed="'+on+'" aria-label="'+x.n+'" style="background:'+(isDark()?x.d:x.l)+'">'+(on?'✓':'')+'</button>'}).join('')+'</div></div>')
   +sgNav('dgclk','hash','الأرقام والساعة','',(dg==='west'?'0-9 عادية':'٠-٩ مشرقية')+' · '+(clk12()?'١٢ ساعة':'٢٤ ساعة'))
   +P('dgclk','<div class="keepar" style="padding:4px 2px 8px"><p class="sg-pl">نمط الأرقام</p>'+sgSeg([['east','٠-٩ مشرقية'],['west','0-9 عادية']],dg,'udigits')+'<p class="sg-pl" style="margin-top:12px">نظام الساعة</p>'+sgSeg([['12','١٢ ساعة'],['24','٢٤ ساعة']],clk12()?'12':'24','clkset')+'</div>')
   +sgNav('homecfg','menu','الصفحة الرئيسية','إظهار البطاقات وإخفاؤها',ar(hidN)+' بطاقات ظاهرة')
   +P('homecfg','<section class="card"><h3 style="margin:0 0 8px">بطاقات الصفحة الرئيسية</h3>'+HOME_SECS.map(function(x){var on=!(S.homeHide&&S.homeHide[x[0]]);return '<div class="rm-row'+(on?' on':'')+'" style="margin:6px 0"><div class="rm-tx"><b>'+x[1]+'</b></div><label class="rm-sw"><input type="checkbox" data-hide="'+x[0]+'" '+(on?'checked':'')+'><i></i></label></div>'}).join('')+'<h3 style="margin:14px 0 8px">تخصيص الرئيسية</h3><div class="hc-btns"><button class="btn ghost" data-a="wkedit" data-v="quran">اختصارات القرآن</button><button class="btn ghost" data-a="wkedit" data-v="adhkar">اختصارات الأذكار</button><button class="btn ghost" data-a="wkedit" data-v="ibadat">اختصارات العبادات</button><button class="btn ghost" data-a="wkper">أوقات «ذكر هذا الوقت»</button></div></section>')
   +sgNavSub('look-adv','gear','خيارات متقدمة','','الاهتزاز · الخط · الحركات')
   +'</div>';
  var ADV='<div class="sg-card">'
   +sgSegRow('phone','الاهتزاز','',sgSeg(HAPS,(u.hap)||'mid','uhap'))
   +sgNav('font','pen','الخط','',fnN+' · '+(u.fontW==='bold'?'عريض':'عادي'))
   +P('font','<div style="padding:4px 2px 8px"><div class="font-grid">'+FONTS.map(function(x){return oBtn('ufont',x[0],fn,'<span class="fo-s fo-'+x[0]+'">أبجد</span><small>'+x[1]+'</small>','uo fo')}).join('')+'</div><div class="seg" style="margin-top:10px"><button class="'+(u.fontW!=='bold'?'on':'')+'" data-a="ufw" data-v="normal">عادي</button><button class="'+(u.fontW==='bold'?'on':'')+'" data-a="ufw" data-v="bold" style="font-weight:800">عريض</button></div></div>')
   +sgSegRow('sparkles','الحركات','حركة الضغط والانتقالات في مفتاح واحد',sgSeg([['full','كاملة'],['reduced','مخففة'],['none','بلا']],apMotionCur(),'umotion'))
   +sgNav('press','star','حركة الضغط','',prN)
   +P('press','<div style="padding:4px 2px 8px"><div class="opt-list">'+PRESSES.map(function(x){return oBtn('upress',x[0],pr,'<b>'+x[1]+'</b><small>'+x[2]+'</small>','uo ol')}).join('')+'</div></div>')
   +sgNav('trans','up','حركة الانتقال','',trN)
   +P('trans','<div style="padding:4px 2px 8px"><div class="opt-list">'+TRANSES.map(function(x){return oBtn('utrans',x[0],tr,'<b>'+x[1]+'</b><small>'+x[2]+'</small>','uo ol')}).join('')+'</div></div>')
   +'</div><p class="note" style="margin:10px 6px 0">«مخففة» تُبقي الانتقالات الأساسية فقط · «بلا» توقف كل الحركة · ويمكنك ضبط الضغط والانتقال كلٌّ على حدة من الصفين أعلاه</p>'
   +'<p class="note" style="margin:8px 6px 0">الاهتزاز: يهتز الهاتف قليلًا عند المسبحة وتسجيل العبادات. إن لم تشعر به فعّل «ردود الفعل اللمسية» من إعدادات الصوت والاهتزاز في هاتفك.</p>';

  /* ===== التنبيهات ===== */
  var snd=rr.soundMode||'chime',sndN=snd==='chime'?'نغمة السائر':(snd==='silent'?'بلا صوت':'صوت النظام');
  var REMK=['malik','kahf','salat','dua','wird','prayers','fasting','weekly','backup'];
  var onN=rr.enabled?REMK.filter(function(k){return rr[k]}).length:0;
  function sndOpt(val,icon,label,sub){
    var on=snd===val;
    return '<label class="snd-opt'+(on?' on':'')+'"><span class="snd-ic">'+icon+'</span><b>'+label+'</b><small>'+sub+'</small><span class="snd-chk">'+ic('check')+'</span><input type="radio" name="alsaer-snd" data-rem-sound="'+val+'" '+(on?'checked':'')+'></label>';
  }
  var NOTIF='<div class="sg-card">'
   +sgSwitch('bell','تفعيل التنبيهات',rr.enabled?'تصلك التنبيهات حتى مع إغلاق التطبيق':'متوقفة','data-rem-master',rr.enabled)
   +sgSegRow('bell','الصلاة على النبي ﷺ','تكرار التذكير · المواعيد من تذكيراتي ← ذكي','<select class="rm-sel" data-rem-time="salatEvery" aria-label="تكرار الصلاة على النبي">'+[[15,'١٥ دقيقة'],[30,'نصف ساعة'],[60,'ساعة'],[120,'ساعتان'],[0,'مرة يوميًا']].map(function(x){var ev=rr.salatEvery==null?(Object.keys(rr).length?'120':'15'):String(rr.salatEvery);return '<option value="'+x[0]+'"'+(String(x[0])===ev?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>')
   +sgLit(sgNavTab('reminders','bell','تذكيراتي','الملك والكهف والصلاة على النبي وغيرها',ar(onN)+' مفعّلة'),nOn)
   +sgLit(sgNavSub('notif-float','bell','النوافذ العائمة','تظهر فوق التطبيقات في أوقاتها','الجدولة والشكل'),fOn)
   +sgNav('snd','bell','صوت الإشعار','النغمة أو بلا صوت أو صوت النظام',sndN)
   +P('snd','<div style="padding:4px 2px 8px"><div class="snd-grid">'+sndOpt('chime',ic('bell'),'نغمة هادئة','نغمة السائر')+sndOpt('silent',IC_BELLOFF,'بلا صوت','إشعار صامت')+sndOpt('system',ic('phone'),'صوت النظام','نغمة هاتفك')+'</div><div class="rm-row'+(rr.respectSilent?' on':'')+'" style="margin:10px 0 0"><div class="rm-tx"><b>احترام وقت الصامت</b><small>عند صمت الهاتف تصل الإشعارات بلا صوت. يستخدم قناة النظام التي تلتزم بوضع الصامت بدل النغمة الخاصة</small></div><label class="rm-sw"><input type="checkbox" data-rem-toggle="respectSilent" '+(rr.respectSilent?'checked':'')+'><i></i></label></div></div>')
   +sgNav('perm','shield','الصلاحيات للعمل في الخلفية','الإشعارات · المنبّهات · البطارية',nat?(ar(permN)+'/٣'):'')
   +P('perm',sgPerms())
   +'</div>'
   +'<div class="sg-t">'+ic('gear')+' خيارات متقدمة</div><div class="sg-card">'
   +sgLit(sgNavTab('widgetset','sparkles','الودجت','','ألوانه وحجمه وما يعرضه'),wOn)
   +'</div>';
  var FLOAT='<div class="sg-card">'
   +sgLit(sgNavTab('floatfeed','bell','جدولة النوافذ العائمة','أوقاتها ومحتواها الإسلامي، ٢٤ ساعة أو فترة أو أوقات محددة',''),fOn)
   +sgLit(sgNavTab('floatset','sparkles','شكل النوافذ العائمة','التصميم والحركة والألوان ومدة الظهور',''),fOn)
   +'</div><p class="note" style="margin:10px 6px 0">تظهر النوافذ فوق التطبيقات الأخرى في أوقاتها، وتحتاج إذن «العرض فوق التطبيقات» من هاتفك.</p>';

  /* ===== الموقع والمواقيت (كما هو) ===== */
  var LOC=''+srow('loc','mosque','الموقع والمواقيت',esc((S.loc&&S.loc.city)||'تحديد المدينة'))
  +P('loc','<section class="card"><b>مصدر الوقت</b><p class="note">تلقائي حسب موقعك، أو يدوي.</p>'+sgSeg([['1','تلقائي'],['0','يدوي']],auto?'1':'0','ptauto')+'</section>'+locCard());

  /* ===== الأمان والبيانات ===== */
  var SEC='<div class="sg-card">'
   +sgNav('acct','shield','مركز الأمان','القفل والبصمة وستر المحتوى',secLevelLabel())
   +P('acct',secPanel(M))
   +sgNavTab('backup','cloud','النسخ الاحتياطي','نسخ واسترجاع وتشفير',(typeof gdConfigured==='function'&&gdConfigured())?'محلي + درايف':'على هذا الجهاز')
   +'</div>'
   +'<div class="sg-t dng">'+ic('shield')+' منطقة خطرة</div><div class="sg-card dng">'
   +sgNav('rst','trash','مسح كل البيانات','حذف نهائي لكل ما سجّلته على هذا الجهاز','')
   +P('rst','<section class="card"><p class="note">سيُحذف كل ما سجّلته على هذا الجهاز نهائياً.</p><button class="btn bad" data-a="reset">'+(confirmReset?'تأكيد المسح النهائي؟ اضغط مرة أخرى':'مسح')+'</button>'+M+'</section>')
   +'</div>';

  /* ===== ملفي الشخصي (كما هو) ===== */
  var PROF=''+srow('prof','user','الملف الشخصي',(S.profile&&S.profile.name)||'إضافة الاسم والصورة')
  +P('prof','<section class="card profile-edit"><div class="profile-preview" id="profile-preview"><div class="profile-photo-line"><div class="profile-edit-head"><button type="button" class="profile-photo-open" data-a="viewprofilephoto" aria-label="عرض الصورة بالحجم الكامل">'+profileAvatar(76)+'</button><div><h3 id="profile-preview-name">'+esc((S.profile&&S.profile.name)||'ملفك الشخصي')+'</h3><p class="note" id="profile-preview-age">'+((S.profile&&S.profile.age)?'العمر · '+esc(S.profile.age)+' سنة':'بياناتك الخاصة تظهر هنا بشكل أنيق')+'</p></div></div><button type="button" class="profile-photo-pencil" data-a="editprofilephoto" aria-label="تعديل الصورة">'+ic('pencil')+'</button></div></div><input id="profile-photo" type="file" accept="image/*" class="profile-file" style="display:none"><label class="profile-label" for="profile-name">الاسم</label><input id="profile-name" type="text" maxlength="40" value="'+esc(S.profile&&S.profile.name||'')+'" placeholder="اكتب اسمك"><label class="profile-label" for="profile-age">السن</label><input id="profile-age" type="number" inputmode="numeric" min="1" max="120" value="'+esc(S.profile&&S.profile.age||'')+'" placeholder="عمرك بالسنوات"><p class="note">يمكنك ترك السن أو الصورة دون إضافة.</p><p class="note">طريقة المخاطبة</p><div class="row"><button class="btn ghost" data-a="gender" data-v="male">ذكر</button><button class="btn ghost" data-a="gender" data-v="female">أنثى</button></div><button class="btn block" data-a="saveprofile" style="margin-top:10px">حفظ الملف الشخصي</button></section>');

  /* ===== المساعدة والمعلومات ===== */
  var upd=(typeof updInfo==='function')?updInfo():null;
  var ABOUT='<div class="sg-card">'
   +sgNav('sys','info','حالة النظام','الجهاز والإصدار وحالة التذكيرات','')
   +P('sys',sgStatus())
   +'<button type="button" class="sg-row sg-btn" data-a="updopen"><span class="sg-ic">'+ic('refresh')+'</span><div class="sg-tx"><b>التحديثات</b><small>التحقق والتنزيل داخل التطبيق</small></div><div class="sg-ctl"><span class="sg-val">'+(upd?('يتوفر '+esc(upd.versionName||String(upd.versionCode))):updCurrentLabel())+'</span>'+ic('chev').replace('class="i"','class="i chev"')+'</div></button>'
   +'<button type="button" class="sg-row sg-btn" data-a="tourreplay"><span class="sg-ic">'+ic('sparkles')+'</span><div class="sg-tx"><b>إعادة الجولة التعريفية</b><small>جولة سريعة على أهم الشاشات</small></div>'+sgCtlV('')+'</button>'
   +sgNavTab('developer','info','عن التطبيق','سجل الإصدارات · الخصوصية','')
   +'</div>';

  var APPBOTTOM='<div class="sg-t">التطبيق</div><div class="sg-card settings-app">'
   +'<button type="button" class="sg-row sg-btn" data-a="updopen"><span class="sg-ic">'+ic('refresh')+'</span><div class="sg-tx"><b>التحديثات</b><small>الإصدار '+esc(APP_VERSION)+' · التحقق من وجود تحديث</small></div>'+sgCtlV('')+'</button>'
   +'<a class="sg-row sg-btn" href="https://www.facebook.com/share/1BsNZ3BKX3/" target="_blank" rel="noopener noreferrer"><span class="sg-ic">'+ic('mail')+'</span><div class="sg-tx"><b>اقتراحات وملاحظات</b><small>شارك فكرة أو أبلغ عن مشكلة</small></div>'+sgCtlV('')+'</a></div>'+sgDeveloperCard();

  var tabsHtml='<div class="sg-tabs" role="tablist" aria-label="أقسام الإعدادات">'+[['look','العرض'],['notif','التنبيهات'],['loc','الموقع'],['account','حسابي']].map(function(x){return '<button type="button" role="tab" aria-selected="'+((setCat||'look')===x[0])+'" class="'+((setCat||'look')===x[0]?'on':'')+'" data-a="scat" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
  var ACCOUNT='<div class="sg-card">'+sgNavSub('account-prof','user','الملف الشخصي','الاسم والصورة وطريقة المخاطبة',(S.profile&&S.profile.name)||'')+sgNavSub('account-sec','shield','الأمان والبيانات','القفل والبصمة والنسخ الاحتياطي','')+sgNavSub('account-about','info','المساعدة والمعلومات','حالة النظام والجولة وعن التطبيق','')+'</div>'+APPBOTTOM;
  var views={look:LOOK,notif:NOTIF,loc:LOC,account:ACCOUNT};
  var subs={
   'look-adv':['look','خيارات متقدمة',ADV],
   'notif-float':['notif','النوافذ العائمة',FLOAT],
   'account-prof':['account','الملف الشخصي',PROF],
   'account-sec':['account','الأمان والبيانات',SEC],
   'account-about':['account','المساعدة والمعلومات',ABOUT]
  };
  scAnim=0;
  if(setSub&&subs[setSub]){
    var sub=subs[setSub];
    return '<section class="sg-tab-page">'+tabsHtml+'<div class="sc-head"><button type="button" class="sc-back" data-a="ssub" data-v="">'+ic('chev')+' رجوع</button><h2>'+sub[1]+'</h2></div>'+sub[2]+'</section>'+COPY;
  }
  return '<section class="sg-tab-page">'+tabsHtml+'<div class="sg-tab-body" role="tabpanel">'+(views[setCat||'look']||LOOK)+'</div></section>'+COPY;
}
