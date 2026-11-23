var setCat='';
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
function sgLit(html,on){return on?html.replace('class="lrow','class="lrow lit').replace('class="sc-tile','class="sc-tile lit'):html}
function vSettings(){
  var CH=ic('chev').replace('class="i"','class="i chev"'),M='<p class="msg">'+esc(msg)+'</p>';
  var P=function(k,html){return setOpen===k?'<div class="panel">'+html+'</div>':''};
  var nat=window.AlsaerNative,rr={};try{rr=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'{}')}catch(e){}
  var dg=U().digits==='west'?'west':'east',auto=!!(S.loc&&S.loc.auto),pk=false,ek=false;
  try{pk=!!(nat&&nat.notificationsEnabled&&nat.notificationsEnabled())}catch(e){}try{ek=!!(nat&&nat.canExactAlarms&&nat.canExactAlarms())}catch(e){}
  var wOn=false,fOn=false;try{wOn=!!(nat&&nat.widgetActive&&nat.widgetActive());fOn=!!(nat&&nat.floatingEnabled&&nat.floatingEnabled()&&nat.canDrawOverlays&&nat.canDrawOverlays())}catch(e){}
  var nOn=!!(rr.enabled&&(nat?pk:true));
  var permN=nat?(pk?1:0)+(ek?1:0)+(rr.battDone?1:0):0;
  var A=''+srow('acct','shield','مركز الأمان',secLevelLabel())
  +P('acct',secPanel(M));
  var LOOK=''+srow('look',isDark()?'moon':'sun','المظهر',isDark()?'داكن':'فاتح')
  +P('look',vAppearance())
  +srow('digits','hash','نمط الأرقام',dg==='west'?'0-9 عادية':'٠-٩ مشرقية')
  +P('digits','<section class="card keepar"><p class="note">أرقام مشرقية (٠-٩) أو عادية (0-9) في كل التطبيق.</p>'+sgSeg([['east','٠-٩ مشرقية'],['west','0-9 عادية']],dg,'udigits')+'</section>')
  +srow('clk','clock','نظام الساعة',clk12()?'١٢ ساعة':'٢٤ ساعة')
  +P('clk','<section class="card"><p class="note">يُطبَّق على كل المواقيت وحقول الوقت والتذكيرات في التطبيق.</p>'+sgSeg([['12','١٢ ساعة'],['24','٢٤ ساعة']],clk12()?'12':'24','clkset')+'</section>');
  var HOME=''+srow('homecfg','menu','الصفحة الرئيسية','إظهار البطاقات وإخفاؤها')
  +P('homecfg','<section class="card"><h3 style="margin:0 0 8px">بطاقات الصفحة الرئيسية</h3>'+HOME_SECS.map(function(x){var on=!(S.homeHide&&S.homeHide[x[0]]);return '<div class="rm-row'+(on?' on':'')+'" style="margin:6px 0"><div class="rm-tx"><b>'+x[1]+'</b></div><label class="rm-sw"><input type="checkbox" data-hide="'+x[0]+'" '+(on?'checked':'')+'><i></i></label></div>'}).join('')+'<h3 style="margin:14px 0 8px">تخصيص الرئيسية</h3><div class="hc-btns"><button class="btn ghost" data-a="wkedit" data-v="quran">اختصارات القرآن</button><button class="btn ghost" data-a="wkedit" data-v="adhkar">اختصارات الأذكار</button><button class="btn ghost" data-a="wkedit" data-v="ibadat">اختصارات العبادات</button><button class="btn ghost" data-a="wkper">أوقات «ذكر هذا الوقت»</button></div></section>');
  var NOTIF=''+'<section class="card"><div class="rm-row'+(rr.enabled?' on':'')+'"><div class="rm-tx"><b>تفعيل التنبيهات</b><small>'+(rr.enabled?'تصلك التنبيهات حتى مع إغلاق التطبيق':'متوقفة')+'</small></div><label class="rm-sw"><input type="checkbox" data-rem-master '+(rr.enabled?'checked':'')+'><i></i></label></div></section>'
  +sgLit(lrow('reminders','bell','تذكيراتي','الملك والكهف والصلاة على النبي وغيرها'),nOn)
  +'<details class="sc-adv"'+(setOpen==='perm'?' open':'')+'><summary>خيارات متقدمة: نوافذ عائمة، ودجت، صلاحيات</summary>'
  +sgLit(lrow('floatfeed','bell','جدولة النوافذ العائمة','أوقاتها ومحتواها الإسلامي، ٢٤ ساعة أو فترة أو أوقات محددة'),fOn)
  +sgLit(lrow('floatset','sparkles','شكل النوافذ العائمة','التصميم والحركة والألوان ومدة الظهور'),fOn)
  +sgLit(lrow('widgetset','sparkles','الودجت','ألوانه وحجمه وما يعرضه'),wOn)
;
  var PERM=''+srow('perm','shield','الصلاحيات للعمل في الخلفية',nat?(permN+'/3'):'')
  +P('perm',sgPerms());
  var LOC=''+srow('loc','mosque','الموقع والمواقيت',esc((S.loc&&S.loc.city)||'تحديد المدينة'))
  +P('loc','<section class="card"><b>مصدر الوقت</b><p class="note">تلقائي حسب موقعك، أو يدوي.</p>'+sgSeg([['1','تلقائي'],['0','يدوي']],auto?'1':'0','ptauto')+'</section>'+locCard());
  var PROF=''+srow('prof','user','الملف الشخصي',(S.profile&&S.profile.name)||'إضافة الاسم والصورة')
  +P('prof','<section class="card profile-edit"><div class="profile-preview" id="profile-preview"><div class="profile-photo-line"><div class="profile-edit-head"><button type="button" class="profile-photo-open" data-a="viewprofilephoto" aria-label="عرض الصورة بالحجم الكامل">'+profileAvatar(76)+'</button><div><h3 id="profile-preview-name">'+esc((S.profile&&S.profile.name)||'ملفك الشخصي')+'</h3><p class="note" id="profile-preview-age">'+((S.profile&&S.profile.age)?'العمر · '+esc(S.profile.age)+' سنة':'بياناتك الخاصة تظهر هنا بشكل أنيق')+'</p></div></div><button type="button" class="profile-photo-pencil" data-a="editprofilephoto" aria-label="تعديل الصورة">'+ic('pencil')+'</button></div></div><input id="profile-photo" type="file" accept="image/*" class="profile-file" style="display:none"><label class="profile-label" for="profile-name">الاسم</label><input id="profile-name" type="text" maxlength="40" value="'+esc(S.profile&&S.profile.name||'')+'" placeholder="اكتب اسمك"><label class="profile-label" for="profile-age">السن</label><input id="profile-age" type="number" inputmode="numeric" min="1" max="120" value="'+esc(S.profile&&S.profile.age||'')+'" placeholder="عمرك بالسنوات"><p class="note">يمكنك ترك السن أو الصورة دون إضافة.</p><p class="note">طريقة المخاطبة</p><div class="row"><button class="btn ghost" data-a="gender" data-v="male">ذكر</button><button class="btn ghost" data-a="gender" data-v="female">أنثى</button></div><button class="btn block" data-a="saveprofile" style="margin-top:10px">حفظ الملف الشخصي</button></section>');
  var BK=''+srow('bk','cloud','النسخ الاحتياطي','على هذا الجهاز')
  +P('bk','<section class="card"><p class="note">تنبيه خصوصية: النسخة الاحتياطية نص قابل للقراءة؛ احفظها في مكان خاص ولا ترسلها للآخرين.</p><textarea id="bk" placeholder="الصق النسخة هنا للاسترجاع"></textarea><input type="password" id="bkpw" autocomplete="off" placeholder="كلمة مرور للنسخة المشفّرة (٦ أحرف فأكثر)" style="margin:8px 0"><div class="row"><button class="btn" data-a="bkenc">نسخ مشفّر (موصى به)</button><button class="btn ghost" data-a="bkcopy">نسخ عادي</button></div><button class="btn ghost block" data-a="bkrestore" style="margin-top:8px">استرجاع (عادي أو مشفّر)</button>'+M+'</section>');
  var RST=''+srow('rst','trash','مسح كل البيانات','')
  +P('rst','<section class="card"><p class="note">سيُحذف كل ما سجّلته على هذا الجهاز نهائياً.</p><button class="btn bad" data-a="reset">'+(confirmReset?'تأكيد المسح النهائي؟ اضغط مرة أخرى':'مسح')+'</button>'+M+'</section>');
  var SYS=''+srow('sys','info','حالة النظام','')
  +P('sys',sgStatus())
  +'<button class="lrow" data-a="updopen">'+ic('refresh')+'<span class="t">التحديثات<small>'+updRowSub()+'</small></span>'+CH+'</button>'
  +'<a class="lrow" href="https://wa.me/201020372842" target="_blank" rel="noopener">'+ic('help')+'<span class="t">مساعدة ودعم</span>'+CH+'</a>'
  +'<button class="lrow" data-a="tourreplay">'+ic('sparkles')+'<span class="t">إعادة الجولة التعريفية</span>'+CH+'</button>'
  +'<button class="lrow" data-a="tab" data-v="developer">'+ic('info')+'<span class="t">عن التطبيق</span>'+CH+'</button>';
  var cats={
   look:['الشكل والعرض',isDark()?'moon':'sun',LOOK+HOME],
   notif:['التنبيهات','bell',NOTIF+PERM+'</details>'],
   loc:['الموقع والمواقيت','mosque',LOC],
   sec:['الأمان والبيانات','shield',A+BK+RST],
   prof:['ملفي الشخصي','user',PROF],
   about:['المساعدة والمعلومات','info',SYS]
  };
  var catSub={look:'المظهر · الأرقام · الساعة · الرئيسية',notif:'تنبيهات · نوافذ عائمة · ودجت',loc:esc((S.loc&&S.loc.city)||'تحديد المدينة'),sec:secLevelLabel()+' · نسخ احتياطي',prof:esc((S.profile&&S.profile.name)||'الاسم والصورة'),about:'حالة النظام · التحديثات · الدعم'};
  if(setCat&&cats[setCat]){
    var c=cats[setCat];
    return '<div class="sc-head"><button type="button" class="sc-back" data-a="scat" data-v="">'+ic('chev')+' الإعدادات</button><h2>'+ic(c[1])+c[0]+'</h2></div><div class="lrows">'+c[2]+'</div>'+COPY;
  }
  var nm=(S.profile&&S.profile.name)||'السائر إلى الله';
  return '<button type="button" class="sc-me" data-a="scat" data-v="prof"><span class="sc-av">'+profileAvatar(52)+'</span><span class="sc-mt"><b>'+esc(nm)+'</b><small>الملف الشخصي</small></span>'+ic('chev')+'</button>'
   +'<div class="sc-grid">'+Object.keys(cats).filter(function(k){return k!=='prof'}).map(function(k){return sgLit('<button type="button" class="sc-tile sc-'+k+'" data-a="scat" data-v="'+k+'"><span class="sc-ic">'+ic(cats[k][1])+'</span><b>'+cats[k][0]+'</b><small>'+catSub[k]+'</small></button>',(k==='notif'&&(nOn||fOn||wOn)))}).join('')+'</div>'
   +COPY;
}
