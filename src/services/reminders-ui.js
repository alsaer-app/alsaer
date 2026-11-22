(function(){
  var REM_KEY='alsaer_daily_reminders_v1';
  function remDefaults(){return {
    consent:false, enabled:false, malik:true, malikTime:'21:30',
    kahf:true, kahfTime:'17:00', salat:true, salatTime:'12:00',
    dua:true, duaTime:'16:00', prayers:true, fasting:true, wird:true, wirdTime:'20:00', soundMode:'chime', weekly:true, weeklyTime:'20:00', backup:true, backupTime:'19:00', custom:[], cuDow:[], last:{}, salatEvery:'120', salatFrom:'08:00', salatTo:'22:00', wirdSmart:true, smart:false, respectSilent:false, praySkip:true, prayPre:'0', cuDone:{}, battDone:false
  };}
  function remLoad(){
    var d=remDefaults(),x;
    try{x=JSON.parse(localStorage.getItem(REM_KEY)||'null')}catch(e){}
    return Object.assign(d,x||{});
  }
  function remSave(x){
    try{localStorage.setItem(REM_KEY,JSON.stringify(x));return true}catch(e){return false}
  }
  function remEsc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function remRow(id,title,desc,field,timeField){
    var r=remLoad();
    return '<div class="card" style="margin:12px 0;padding:15px;border:1px solid var(--line,rgba(150,170,210,.2));">'
      +'<div style="display:flex;gap:12px;align-items:center;justify-content:space-between">'
      +'<div style="flex:1"><b>'+title+'</b><div class="note" style="margin-top:5px">'+desc+'</div></div>'
      +'<label style="display:flex;align-items:center;gap:7px"><input type="checkbox" data-rem-toggle="'+field+'" '+(r[field]?'checked':'')+'><span>تفعيل</span></label></div>'
      +'<div style="display:flex;align-items:center;gap:10px;margin-top:12px"><label for="rem-'+id+'">وقت التذكير</label><input id="rem-'+id+'" type="time" data-rem-time="'+timeField+'" value="'+remEsc(r[timeField])+'" style="padding:9px;border-radius:10px;background:var(--surface);color:var(--text);border:1px solid var(--line);font:inherit"></div></div>';
  }
  var IC_BELLOFF='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0 1 9.5-4.9M18 11c0 4 1.5 5.5 2 6H6"/><path d="M10 20a2 2 0 0 0 4 0M3 3l18 18"/></svg>';
  var SOUND_PLAYER=null;
  function remPlayTone(){
    try{
      if(!SOUND_PLAYER){SOUND_PLAYER=new Audio('notification_1.mp3');SOUND_PLAYER.preload='auto'}
      SOUND_PLAYER.pause();SOUND_PLAYER.currentTime=0;
      var pr=SOUND_PLAYER.play();if(pr&&pr.catch)pr.catch(function(){remStatus('تعذّر تشغيل الصوت؛ تأكد من رفع صوت الوسائط في هاتفك.')});
      return true;
    }catch(x){remStatus('تعذّر تشغيل الصوت على هذا الجهاز.');return false}
  }
  function remSoundTest(){
    var mode=remLoad().soundMode||'chime',nv=window.AlsaerNative;
    if(mode==='silent'){remStatus('الوضع الحالي «بلا صوت»؛ ستصلك التذكيرات صامتة.');return}
    if(mode==='chime'){if(remPlayTone())remStatus('تشغيل نغمة السائر الهادئة…');return}
    if(nv){try{nv.testNotification('اختبار صوت النظام');remStatus('سيصل إشعار بعد ثوانٍ بصوت النظام الافتراضي.')}catch(x){remStatus('تعذّر إرسال إشعار الاختبار.')}}
    else remStatus('صوت النظام يُختبر على الهاتف نفسه عند وصول إشعار.');
  }
  var CU_DRAFT=null,REM_PANE='main';
  function apL(pm){try{if(typeof lang==='function'&&lang()!=='ar')return pm?'PM':'AM'}catch(e){}return pm?'م':'ص'}
  function remAr(x){try{if(typeof lang==='function'&&lang()!=='ar')return String(x);return typeof ar==='function'?ar(x):String(x)}catch(e){return String(x)}}
  function remPad(n){return (n<10?'0':'')+n}
  function remIs12(){
    return clk12()
  }
  function remFmt(hm){
    var m=/^(\d{1,2}):(\d{2})$/.exec(hm||'');if(!m)return remAr(hm||'');
    var h=+m[1],mi=m[2];
    if(!remIs12())return remAr(remPad(h)+':'+mi);
    return remAr((h%12||12)+':'+mi)+' '+apL(h>=12);
  }
  function remNow(){var d=new Date();return remFmt(remPad(d.getHours())+':'+remPad(d.getMinutes()))}
  function remDraft(){
    if(!CU_DRAFT){var d=new Date(Date.now()+5*60000);CU_DRAFT={h:d.getHours(),m:Math.ceil(d.getMinutes()/5)*5%60}}
    return CU_DRAFT;
  }
  function remReadPick(){
    var he=document.getElementById('cu-h'),me=document.getElementById('cu-m'),ae=document.querySelector('[data-rem-cu=ap]:checked');
    if(!he||!me)return remDraft();
    var h=parseInt(he.value,10)||0,m=parseInt(me.value,10)||0;
    if(remIs12()){var pm=ae&&ae.value==='pm';h=(h%12)+(pm?12:0)}
    CU_DRAFT={h:h,m:m};return CU_DRAFT;
  }
  function remPickHtml(){
    var d=remDraft(),is12=remIs12(),hs='',ms='',i;
    if(is12){for(i=1;i<=12;i++)hs+='<option value="'+i+'"'+((d.h%12||12)===i?' selected':'')+'>'+remAr(i)+'</option>'}
    else for(i=0;i<24;i++)hs+='<option value="'+i+'"'+(d.h===i?' selected':'')+'>'+remAr(remPad(i))+'</option>';
    for(i=0;i<60;i++)ms+='<option value="'+i+'"'+(d.m===i?' selected':'')+'>'+remAr(remPad(i))+'</option>';
    return '<div class="rm-timepick"><select id="cu-h" class="rm-sel" data-rem-cu="h" aria-label="الساعة">'+hs+'</select><span class="rm-colon">:</span><select id="cu-m" class="rm-sel" data-rem-cu="m" aria-label="الدقائق">'+ms+'</select>'
      +(is12?'<div class="rm-ap"><label class="'+(d.h<12?'on':'')+'"><input type="radio" name="cu-ap" id="cu-ap" value="am" data-rem-cu="ap" '+(d.h<12?'checked':'')+'><span>'+apL(false)+'</span></label><label class="'+(d.h>=12?'on':'')+'"><input type="radio" name="cu-ap" value="pm" data-rem-cu="ap" '+(d.h>=12?'checked':'')+'><span>'+apL(true)+'</span></label></div>':'')+'</div>';
  }
  vReminders=function(){
    var r=remLoad(), nat=window.AlsaerNative||null, cur=r.soundMode||'chime';
    function sw(attr,on){return '<label class="rm-sw"><input type="checkbox" '+attr+' '+(on?'checked':'')+'><i></i></label>'}
    function remRow2(id,icon,title,desc,field){
      var rr=remLoad(), active=rr.enabled&&rr[field];
      return '<div class="rm-row'+(active?' on':'')+'"><span class="rm-ic">'+ic(icon)+'</span><div class="rm-tx"><b>'+title+'</b><small>'+desc+'</small></div>'+sw('data-rem-toggle="'+field+'"',rr[field])+'</div>';
    }
    function sndOpt(val,icon,label,sub){
      var on=cur===val;
      return '<label class="snd-opt'+(on?' on':'')+'" data-snd-name="'+val+'"><span class="snd-ic">'+icon+'</span><b>'+remEsc(label)+'</b><small>'+remEsc(sub)+'</small><span class="snd-chk">'+ic('check')+'</span><input type="radio" name="alsaer-snd" data-rem-sound="'+val+'" '+(on?'checked':'')+'></label>';
    }
    function selO(field,val,list){return '<select class="rm-sel" data-rem-time="'+field+'">'+list.map(function(x){return '<option value="'+x[0]+'"'+(String(val)===String(x[0])?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'}
    function tm(field,val){return '<input class="rm-sel" type="time" data-rem-time="'+field+'" value="'+remEsc(val)+'">'}
    function upRows(L){return L.map(function(x){return '<div class="up-r"><span>'+remEsc(x.t)+'</span><b>'+remEsc(x.w)+'</b></div>'}).join('')}
    window.alsaerUpRefresh=function(){var e=document.getElementById('rm-up-l');if(!e)return;try{var L=window.alsaerUpcoming(6)||[];e.innerHTML=upRows(L)}catch(x){}};
    function upcomingCard(){
      var L=[];try{L=(window.alsaerUpcoming&&window.alsaerUpcoming(6))||[]}catch(x){}
      if(!L.length)return '';
      return '<section class="card flat rm-up"><h4>'+ic('clock')+'الإشعارات القادمة</h4><div id="rm-up-l">'+upRows(L)+'</div><p class="note">هذه هي التذكيرات المجدولة فعلًا على هاتفك.</p></section>';
    }
    function smartCards(r){
      var ev=parseInt(r.salatEvery,10)||0,cnt=0;if(ev>=15){var a1=r.salatFrom.split(':'),a2=r.salatTo.split(':');cnt=Math.floor(((+a2[0])*60+(+a2[1])-(+a1[0])*60-(+a1[1]))/ev)+1}
      var tk=dk(),sc=(S.salawat&&S.salawat[tk])||0;
      return '<section class="card sm-card"><h4>'+ic('heart')+'الصلاة على النبي ﷺ</h4><p class="note">اختر التكرار والفترة، وسيصلك تذكير بصيغة مختلفة كل مرة.'+(sc?' · صلّيتَ اليوم '+remAr(sc)+' مرة.':'')+'</p>'
        +'<div class="sm-g"><label>التكرار</label>'+selO('salatEvery',ev,[[0,'مرة يوميًا'],[120,'كل ساعتين'],[60,'كل ساعة'],[30,'كل نصف ساعة'],[15,'كل ١٥ دقيقة']])+'</div>'
        +(ev>=15?'<div class="sm-g"><label>من</label>'+tm('salatFrom',r.salatFrom)+'<label>إلى</label>'+tm('salatTo',r.salatTo)+'</div><p class="note">≈ '+remAr(cnt)+' إشعارًا في اليوم</p>':'<div class="sm-g"><label>الوقت</label>'+tm('salatTime',r.salatTime)+'</div>')+'</section>'
       +'<section class="card sm-card"><h4>'+ic('sparkles')+'ورد القرآن اليومي</h4><p class="note">يُذكّرك بما بقي من وردك، ولا يُرسَل إذا أتممته.</p>'
        +'<div class="sm-g"><label>الوقت</label>'+tm('wirdTime',r.wirdTime)+'</div>'
        +'<div class="rm-row'+(r.wirdSmart!==false?' on':'')+'" style="margin:8px 0 0"><div class="rm-tx"><b>تخطَّ التذكير إذا أتممت ورد اليوم</b></div>'+sw('data-rem-toggle="wirdSmart"',r.wirdSmart!==false)+'</div></section>'
       +'<section class="card sm-card"><h4>'+ic('clock')+'مواقيت الصلاة</h4><p class="note">تنبيه عند دخول وقت الصلاة بحسب مدينتك، وزر «صلّيت» لتسجيلها من الإشعار نفسه.</p>'
        +'<div class="sm-g"><label>تنبيه قبل دخول الوقت</label>'+selO('prayPre',r.prayPre,[[0,'بلا تنبيه'],[5,'٥ دقائق'],[10,'١٠ دقائق'],[15,'١٥ دقيقة'],[30,'٣٠ دقيقة']])+'</div>'
        +'<div class="rm-row'+(r.praySkip!==false?' on':'')+'" style="margin:8px 0 0"><div class="rm-tx"><b>تخطَّ تذكير الصلاة التي سجّلتها</b></div>'+sw('data-rem-toggle="praySkip"',r.praySkip!==false)+'</div>'
        +'<div class="rm-row'+(r.smart?' on':'')+'" style="margin:8px 0 0"><div class="rm-tx"><b>جدولة ذكية للأذكار</b><small>أذكار الصباح بعد الفجر، والمساء بعد العصر، والنوم بعد العشاء، وفق مواقيتك — قواعد تعمل على هاتفك دون إنترنت</small></div>'+sw('data-rem-toggle="smart"',!!r.smart)+'</div></section>'
       +'<section class="card sm-card"><h4>'+ic('chart')+'التقرير الأسبوعي</h4><p class="note">ملخص بأرقام أسبوعك في الإشعار نفسه، كل جمعة.</p><div class="sm-g"><label>الوقت</label>'+tm('weeklyTime',r.weeklyTime)+'</div></section>';
    }
    var st=(r.consent&&r.enabled?'✅ جدول التذكيرات مفعّل':'⏳ غير مفعّل بعد');
    if(nat&&nat.notificationsEnabled&&nat.notificationsEnabled()&&r.consent&&r.enabled)st='✅ تعمل حتى مع الشاشة المقفلة';
    var days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    var cus=(r.custom||[]).map(function(cu){
      var dl=(cu.dow&&cu.dow.length)?cu.dow.map(function(d){return days[d]||''}).join(' ، '):'كل الأيام';
      var on=cu.on!==false;
      return '<div class="rm-row'+(r.enabled&&on?' on':'')+'"><span class="rm-ic">'+ic('bell')+'</span><div class="rm-tx"><b>'+remEsc(cu.t)+'</b><small>'+dl+' · <b>'+remFmt(cu.time)+'</b>'+((cu.n||1)>1?' · '+remAr(cu.n)+' مرات كل '+remAr(cu.ev||30)+' دقيقة':'')+'</small></div>'+sw('data-rem-cuon="'+remEsc(cu.id)+'"',on)+'<button class="rm-del" data-rem-action="cudel" data-v="'+remEsc(cu.id)+'" aria-label="حذف التذكير">'+ic('trash')+'</button></div>';
    }).join('');
    var dayChips=days.map(function(d,i){
      var sel=!((r.custom||[]).length)||(r.cuDow||[]).indexOf(i)>=0;
      return '<label class="rm-day'+(sel?' on':'')+'"><input type="checkbox" data-rem-cday="'+i+'" '+(sel?'checked':'')+'><span>'+d+'</span></label>';
    }).join('');
    return '<section class="rm-hero"><span class="rm-hic">'+ic('bell')+'</span><div><h2>مركز التذكيرات</h2><p>تذكيرات تلقائية بأوقات مدروسة، تصلك حتى والتطبيق مغلق</p></div></section>'
      +'<div class="rm-master"><div class="rm-tx"><b>جدول التذكيرات التلقائي</b><small>'+(nat?'يعمل على مستوى النظام: مع الشاشة المقفلة وبعد إعادة تشغيل الهاتف':'يعمل أثناء فتح التطبيق')+'</small></div><span class="rm-state" style="font-size:12px;font-weight:800;color:'+(r.enabled?'var(--gold)':'var(--muted)')+'">'+(r.enabled?'مفعّل':'متوقف')+'</span>'+sw('data-rem-master',r.enabled)+'</div>'
      +'<div class="rm-seg">'+[['main','التذكيرات'],['smart','ذكي'],['mine','تذكيري'],['tools','الفحص']].map(function(x){return '<button type="button" class="'+(REM_PANE===x[0]?'on':'')+'" data-rem-pane="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'
      +'<div class="rm-pane'+(REM_PANE==='main'?' on':'')+'">'
      +remRow2('malik','book','سورة الملك','كل ليلة · وقت تلقائي مدروس','malik')
      +remRow2('kahf','cal','سورة الكهف','كل جمعة بعد العصر','kahf')
      +remRow2('salat','mosque','الصلاة على النبي ﷺ','تذكير يومي','salat')
      +remRow2('dua','beads','ساعة إجابة الجمعة','وقت الدعاء يوم الجمعة','dua')
      +remRow2('wird','sparkles','ورد القرآن اليومي','قبل النوم إذا لم تتم','wird')
      +remRow2('prayers','mosque','مواقيت الصلوات','بحسب أوقات مدينتك المحفوظة عندك','prayers')
      +remRow2('fasting','moon','تذكيرات الصيام','سحور وإفطار وقبل يوم الصيام','fasting')
      +remRow2('weekly','chart','تقرير الأسبوع','كل جمعة مساءً · ملخص إنجازك','weekly')+remRow2('backup','check','النسخة الاحتياطية الأسبوعية','كل جمعة مساءً · تذكير بتصدير نسخة مشفرة','backup')
      +'</div><div class="rm-pane'+(REM_PANE==='smart'?' on':'')+'">'
      +smartCards(r)
      +'</div><div class="rm-pane'+(REM_PANE==='mine'?' on':'')+'"><div class="rm-sect">'+ic('pen')+'<span>تذكيرك الخاص</span></div>'
      +'<p class="rm-hint">أضف أي تذكير تريده باسمك ووقتك وأيامك المفضلة.</p>'
      +cus
      +'<div class="rm-add"><input id="cu-name" type="text" maxlength="40" placeholder="اسم التذكير (مثال: ذكر الصباح)"><div class="rm-now">'+ic('clock')+'<span>الوقت الحالي في هاتفك: <b>'+remNow()+'</b></span></div>'+remPickHtml()+'<div class="rm-clock"><span>نظام الوقت</span></div>'+clkSeg('rem')+'<div class="sm-g" style="margin:8px 0"><label>عدد الإشعارات</label><select id="cu-n" class="rm-sel">'+[1,2,3,4,5,6,8,10,12].map(function(n){return '<option value="'+n+'">'+remAr(n)+'</option>'}).join('')+'</select><label>كل</label><select id="cu-ev" class="rm-sel">'+[[15,'١٥ دقيقة'],[30,'نصف ساعة'],[60,'ساعة'],[120,'ساعتان']].map(function(x){return '<option value="'+x[0]+'"'+(x[0]===30?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div><div class="rm-days">'+dayChips+'</div><button class="btn" data-rem-action="cuadd">'+ic('check')+'إضافة التذكير</button></div>'
      +'</div><div class="rm-pane'+(REM_PANE==='tools'?' on':'')+'">'
      +(nat?'<div class="rm-sect">'+ic('bell')+'<span>صوت الإشعارات</span></div><div class="snd-grid">'
        +sndOpt('chime',ic('bell'),'نغمة هادئة','نغمة السائر')+sndOpt('silent',IC_BELLOFF,'بلا صوت','إشعار صامت')+sndOpt('system',ic('phone'),'صوت النظام','نغمة هاتفك')
        +'</div><div class="rm-row'+(r.respectSilent?' on':'')+'" style="margin:10px 0 0"><div class="rm-tx"><b>احترام وقت الصامت</b><small>عند صمت الهاتف تصل الإشعارات بلا صوت. يستخدم قناة النظام التي تلتزم بوضع الصامت بدل النغمة الخاصة</small></div>'+sw('data-rem-toggle="respectSilent"',!!r.respectSilent)+'</div>':'')
      +'<div class="rm-sect">'+ic('check')+'<span>الاختبار</span></div>'
      +'<div class="rm-tests"><button class="rm-test" data-rem-action="soundtest"><span>'+ic('sparkles')+'</span><b>اختبار الصوت</b></button><button class="rm-test" data-rem-action="test"><span>'+ic('bell')+'</span><b>اختبار الإشعار</b></button><button class="rm-test" data-rem-action="vibtest"><span>'+ic('phone')+'</span><b>اختبار الاهتزاز</b></button>'+'<button class="rm-test" data-rem-action="sndset"><span>'+ic('gear')+'</span><b>صوت الإشعارات في الهاتف</b></button>'+(nat&&typeof nat.canDrawOverlays==='function'?'<button class="rm-test" data-rem-action="float"><span>'+ic('bell')+'</span><b>التذكيرات العائمة: '+((function(){try{return nat.floatingEnabled()&&nat.canDrawOverlays()}catch(x){return false}})()?'تشغيل':'إيقاف')+'</b></button>':'')+(nat&&typeof nat.pauseFloating==='function'&&(function(){try{return nat.floatingEnabled()}catch(x){return false}})()?'<button class="rm-test" data-rem-action="floatpause"><span>'+ic('bell')+'</span><b>'+((function(){try{var pu=Number(nat.floatingPausedUntil());if(pu>Date.now()){var dd=new Date(pu);return 'موقوفة حتى '+ar(('0'+dd.getHours()).slice(-2)+':'+('0'+dd.getMinutes()).slice(-2))}}catch(x){}return 'إيقاف العائمة مؤقتًا'})())+'</b></button>':'')+'<button class="rm-test" data-a="tab" data-v="floatset"><span>'+ic('gear')+'</span><b>التحكم في النوافذ العائمة</b></button><button class="rm-test" data-a="tab" data-v="widgetset"><span>'+ic('gear')+'</span><b>التحكم في الودجت</b></button></div>'
      +(function(){var pk=false,ek=false;try{pk=!!(nat&&nat.notificationsEnabled())}catch(x){}try{ek=!!(nat&&nat.canExactAlarms())}catch(x){}
        var bs=(!(r.consent&&r.enabled&&pk)?'<button class="btn" data-rem-action="permission">'+ic('check')+'تفعيل الإشعارات</button>':'')
          +(nat&&!ek?'<button class="btn ghost" data-rem-action="exact">إذن المنبه الدقيق</button>':'')
          +(nat&&!r.battDone?'<button class="btn ghost'+(r.battOpened?' dim':'')+'" data-rem-action="battery">استثناء البطارية</button>':'');
        return bs?'<div class="rm-actions">'+bs+'</div>':'';})()+(nat?(function(){
        var pOk=false,eOk=false;try{pOk=!!nat.notificationsEnabled()}catch(x){}try{eOk=!!nat.canExactAlarms()}catch(x){}
        var cOk=!!(r.consent&&r.enabled),row=function(ok,t,fix){return '<div class="dg-r '+(ok?'ok':'bad')+'"><i>'+(ok?'✓':'✗')+'</i><span>'+t+'</span>'+(!ok&&fix?fix:'')+'</div>'};
        var allOk=pOk&&cOk&&eOk&&!!r.battDone;
        if(allOk)return '<section class="card flat rm-help rm-allok"><div class="dg-r ok"><i>✓</i><span><b>كل إعدادات الإشعارات سليمة</b><br><small>الإذن والمنبّهات الدقيقة والبطارية مضبوطة</small></span></div><div class="acts"><button class="btn" data-rem-action="test">اختبار الإشعار الآن</button><button class="btn ghost dim" data-rem-action="battery">فتح الإعدادات</button><button class="btn ghost" data-rem-action="battreset">إعادة الفحص</button></div></section>'+upcomingCard();
        var stp=function(n,ok,t,sub,btn){return '<div class="stp'+(ok?' done':'')+'"><span class="stp-n">'+(ok?'✓':remAr(n))+'</span><div class="stp-b"><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>'+(ok?'':btn||'')+'</div>'};
        var oem='<details class="stp-oem"'+(r.battDone?'':' open')+'><summary>خطوات الهواتف الخاصة (شاومي · ريدمي · بوكو · أوبو · سامسونج)</summary><ol><li>افتح <b>إعدادات التطبيق</b> ثم <b>التشغيل التلقائي</b> وفعّله.</li><li>اجعل <b>البطارية «بلا قيود»</b> للتطبيق.</li><li>ثبّت التطبيق في <b>قائمة التطبيقات الحديثة</b> (قفل التطبيق).</li><li>ارجع واضغط <b>«تم ✓»</b>. لا يقرأ التطبيق هذا الإعداد تلقائيًا، فتأكيدك هو المعتمد.</li></ol></details>';
        return '<section class="card flat rm-help"><h4>فحص الإشعارات</h4><div class="stp-list">'
         +stp(1,pOk,'إذن الإشعارات','من نظام الهاتف','<button class="btn ghost" data-rem-action="permission">تفعيل</button>')
         +stp(2,cOk,'جدول التذكيرات','تفعيله داخل التطبيق','<button class="btn ghost" data-rem-action="permission">تفعيل</button>')
         +stp(3,eOk,'المنبّهات الدقيقة','ليصل الإشعار في موعده','<button class="btn ghost" data-rem-action="exact">السماح</button>')
         +stp(4,!!r.battDone,'البطارية والتشغيل التلقائي','بلا قيود حتى لا يوقف الهاتف الإشعارات','<button class="btn ghost'+(r.battOpened?' dim':'')+'" data-rem-action="battery">فتح الإعدادات</button><button class="btn" data-rem-action="battdone">تم ✓</button>')
         +'</div>'+(r.battDone?'':oem)
         +'<div class="acts"><button class="btn" data-rem-action="test">اختبار الإشعار الآن</button>'+(r.battDone?'<button class="btn ghost dim" data-rem-action="battery">فتح الإعدادات</button>':'')+'</div></section>'+upcomingCard();
      })():'')
      +'</div><p id="rem-status" class="rm-status">'+st+'</p>';
  };
  function remStatus(t){var e=document.getElementById('rem-status');if(e)e.textContent=t; if(typeof toast==='function')toast(t);}
  function remNativeTest(){
    if(!('Notification' in window)){remStatus('هذا الإصدار من WebView لا يوفّر واجهة إشعارات النظام؛ الاختبار الخلفي غير متاح بعد.');return}
    if(Notification.permission==='granted'){
      try{new Notification('السائر إلى الله',{body:'هذا إشعار تجريبي للتأكد من وصول الإشعارات.'});remStatus('تم إرسال إشعار تجريبي عبر النظام.')}
      catch(e){remStatus('تعذر إرسال الإشعار التجريبي: '+e.message)}
    }else remStatus('لم تُمنح صلاحية الإشعارات بعد. اضغط «موافقة وتفعيل الإشعارات».');
  }
  function remOpenReader(sura){
    try{
      if(typeof tab!=='undefined'&&typeof render==='function'){
        tab='quran'; if(typeof S!=='undefined'){S.quran=S.quran||{};S.quran.sura=sura;save()}
        render(); window.scrollTo(0,0);
      }else remStatus('افتح تبويب القرآن ثم اختر سورة '+sura+'.');
    }catch(e){remStatus('افتح القرآن واختر سورة '+sura+'.')}
  }
  function remNotify(title,body,sura){
    if('Notification' in window && Notification.permission==='granted'){
      try{var n=new Notification(title,{body:body,tag:'alsaer-'+title});n.onclick=function(){window.focus();remOpenReader(sura)};return}catch(e){}
    }
    var box=document.createElement('div');
    box.style.cssText='position:fixed;z-index:99999;left:16px;right:16px;bottom:90px;padding:16px;border-radius:18px;background:#172033;color:#fff;box-shadow:0 10px 35px #0008;text-align:right;direction:rtl';
    box.innerHTML='<b>'+remEsc(title)+'</b><p style="margin:8px 0">'+remEsc(body)+'</p><button style="padding:10px 16px;border:0;border-radius:12px;background:#4c8df0;color:white" id="rem-go">ابدأ القراءة</button> <button style="padding:10px 16px;border:0;border-radius:12px" id="rem-close">إغلاق</button>';
    document.body.appendChild(box);
    box.querySelector('#rem-go').onclick=function(){box.remove();remOpenReader(sura)};
    box.querySelector('#rem-close').onclick=function(){box.remove()};
  }
  function remCheck(){
    try{if(window.AlsaerNative&&AlsaerNative.notificationsEnabled&&AlsaerNative.notificationsEnabled())return; /* الإشعارات الأصلية المفعّلة تتولى التسليم */}catch(e){} /* بلا إذن إشعارات: تذكيرات داخل التطبيق كما كانت */
    var r=remLoad(); if(!r.enabled||!r.consent||!document.hasFocus())return;
    var d=new Date(),day=d.getDay(),hh=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    var date=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    var checks=[
      ['malik',r.malik,r.malikTime,0,'قراءة سورة الملك','حان وقت ورد سورة الملك قبل النوم.','الملك'],
      ['kahf',r.kahf,r.kahfTime,5,'قراءة سورة الكهف','اليوم الجمعة؛ لا تنس قراءة سورة الكهف بعد العصر.','الكهف'],
      ['salat',r.salat,r.salatTime,-1,'الصلاة على النبي ﷺ','اللهم صل وسلم على نبينا محمد ﷺ',''],
      ['dua',r.dua,r.duaTime,5,'ساعة إجابة يوم الجمعة','أكثر من الدعاء في ساعة الإجابة، وادعُ بما تحب.','']
    ];
    var changed=false;
    checks.forEach(function(x){
      if(!x[1]||x[2]!==hh||(x[3]!==-1&&x[3]!==day))return;
      var k=x[0]+'_'+date;if(r.last[k])return;
      r.last[k]=true;changed=true;remNotify(x[4],x[5],x[6]);
    });
    if(changed)remSave(r);
  }
  document.addEventListener('click',function(e){
    var pb=e.target.closest&&e.target.closest('[data-rem-pane]');
    if(pb){REM_PANE=pb.getAttribute('data-rem-pane');if(typeof render==='function')render();return}
    var b=e.target.closest&&e.target.closest('[data-rem-action]');
    if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    var act=b.getAttribute('data-rem-action');
    if(act==='cuadd'){
      var nn=document.getElementById('cu-name');
      var nm=nn?nn.value.trim():'';
      var pk=remReadPick(),tm=remPad(pk.h)+':'+remPad(pk.m);
      if(!nm){remStatus('اكتب اسم التذكير أولًا');return}
      var r2=remLoad();r2.custom=r2.custom||[];
      if(r2.custom.length>=12){remStatus('وصلت الحد الأقصى (١٢ تذكيرًا خاصًا). حذف واحد لإضافة غيره');return}
      var dow=(r2.cuDow&&r2.cuDow.length)?r2.cuDow.slice():[];
      var cnE=document.getElementById('cu-n'),ceE=document.getElementById('cu-ev');r2.custom.push({id:'cu'+Date.now().toString(36),t:nm,time:tm,dow:dow,on:true,n:cnE?parseInt(cnE.value,10)||1:1,ev:ceE?parseInt(ceE.value,10)||30:30});CU_DRAFT=null;
      r2.consent=true;r2.enabled=true;remSave(r2);
      remStatus('تمت إضافة التذكير «'+nm+'» الساعة '+remFmt(tm));if(window.alsaerNativeSyncSoon)window.alsaerNativeSyncSoon(true);
      render();return;
    }
    if(act==='cudel'){
      var r3=remLoad();r3.custom=(r3.custom||[]).filter(function(x){return String(x.id)!==String(b.getAttribute('data-v'))});remSave(r3);
      remStatus('تم حذف التذكير');if(window.alsaerNativeSyncSoon)window.alsaerNativeSyncSoon(true);
      render();return;
    }
    if(act==='battdone'){var rbd=remLoad();rbd.battDone=true;remSave(rbd);remStatus('تم تسجيل ضبط البطارية ✓');render();return}
    if(act==='battreset'){var rbr=remLoad();rbr.battDone=false;rbr.battOpened=false;remSave(rbr);render();return}
    if(act==='float'){
      var nf=window.AlsaerNative;
      try{
        if(!nf.canDrawOverlays()){nf.openOverlaySettings();remStatus('فعّل «العرض فوق التطبيقات الأخرى» للسائر ثم ارجع واضغط الزر مرة أخرى')}
        else if(nf.floatingEnabled()){nf.setFloating(false);remStatus('أُوقفت التذكيرات العائمة')}
        else{nf.setFloating(true);remStatus('فُعّلت التذكيرات العائمة — ستظهر فوق التطبيقات عند كل تذكير');try{nf.testFloating()}catch(x){}}
      }catch(x){remStatus('هذه الميزة غير متاحة في هذه النسخة')}
      render();return}
    if(act==='floatpause'){
      var nq=window.AlsaerNative;
      try{var pu2=Number(nq.floatingPausedUntil()),left=pu2>Date.now()?(pu2-Date.now())/60000:0,nx=left<=0?60:left<=61?180:left<=181?480:0;
        nq.pauseFloating(nx);remStatus(nx?'أُوقفت التذكيرات العائمة '+ar(String(nx/60))+' ساعة (اضغط للتمديد)':'عادت التذكيرات العائمة')}catch(x){remStatus('هذه الميزة غير متاحة في هذه النسخة')}
      render();return}
    if(act==='sndset'){remStatus('افتح: إعدادات الهاتف ← التطبيقات ← السائر ← الإشعارات، ثم فعّل الصوت واجعل الأهمية «عالية»');return}
    if(act==='soundtest'){remSoundTest();return}
    var nv=window.AlsaerNative;
    if(nv){
      if(act==='permission'){
        try{nv.requestNotificationPermission()}catch(x){}
        var tries=0,iv=setInterval(function(){tries++;var ok=false;try{ok=nv.notificationsEnabled()}catch(x){}
          if(ok){clearInterval(iv);var r=remLoad();r.consent=true;r.enabled=true;remSave(r);remStatus('تم تفعيل إشعارات النظام بنجاح.');if(window.alsaerNativeSyncSoon)window.alsaerNativeSyncSoon(true);vReminders&&render()}
          else if(tries>40){clearInterval(iv);remStatus('لم يتم منح الإذن. افتح: إعدادات الهاتف ← التطبيقات ← السائر ← الإشعارات.')}},500);
      }else if(act==='test'){
        var tt='تذكير تجريبي';
        try{
          var rT=remLoad(),opts=[['قراءة سورة الملك',rT.malik],['قراءة سورة الكهف',rT.kahf],['الصلاة على النبي ﷺ',rT.salat],['ساعة إجابة يوم الجمعة',rT.dua],['ورد القرآن',rT.wird]];
          opts.forEach(function(o){if(o[1]&&tt==='تذكير تجريبي')tt=o[0]});
          if((rT.custom||[]).length)tt=(rT.custom[0].t||tt);
        }catch(x2){}
        try{nv.testNotification(tt);remStatus('سيصل إشعار «'+tt+'» بعد ثوانٍ (بنغمة السائر).')}catch(x){remStatus('لم نتمكن من إرسال إشعار تجريبي.')}
      }
      else if(act==='vibtest'){var vok=false;try{vok=navigator.vibrate&&navigator.vibrate([250,120,250])}catch(x){}remStatus(vok?'أُرسلت اهتزازة. إن لم تشعر بها فاهتزاز اللمس مُعطَّل في إعدادات هاتفك (الصوت والاهتزاز ← ردود الفعل اللمسية).':'هذا الهاتف لا يسمح باهتزاز اللمس داخل التطبيق.')}
      else if(act==='exact'){try{nv.openExactAlarmSettings()}catch(x){}}
      else if(act==='battery'){if(b&&b.classList&&b.classList.contains('dim'))return;try{nv.openBatterySettings()}catch(x){}try{var rbo=remLoad();rbo.battOpened=true;remSave(rbo);setTimeout(render,400)}catch(x){}}
      return;
    }
    if(act==='permission'){
      if(!('Notification' in window)){remStatus('هذا الإصدار من WebView لا يوفّر إشعارات النظام.');return}
      Notification.requestPermission().then(function(p){
        var r=remLoad();r.consent=(p==='granted');r.enabled=(p==='granted');remSave(r);
        remStatus(p==='granted'?'تمت الموافقة وتفعيل جدول التذكيرات.':'لم تتم الموافقة على الإشعارات.');
        render();
      }).catch(function(){remStatus('تعذر طلب الإذن من النظام.')});
    }else if(act==='test')remNativeTest();
  },true);
  document.addEventListener('change',function(e){
    var t=e.target;if(!t)return;
    var r=remLoad(),changed=false;
    if(t.hasAttribute('data-rem-cday')){
      var rd=remLoad(),di=parseInt(t.getAttribute('data-rem-cday'),10);
      var set=[];document.querySelectorAll('[data-rem-cday]').forEach(function(x){if(x.checked)set.push(parseInt(x.getAttribute('data-rem-cday'),10))});
      rd.cuDow=set;remSave(rd);return;
    }
    if(t.hasAttribute('data-rem-cu')){remReadPick();if(t.getAttribute('data-rem-cu')==='ap')render();return}
    if(t.hasAttribute('data-rem-clock')){remReadPick();setClockMode(t.getAttribute('data-rem-clock'));CU_DRAFT=remDraft();render();return}
    if(t.hasAttribute('data-rem-cuon')){var cid=t.getAttribute('data-rem-cuon');(r.custom||[]).forEach(function(cu){if(String(cu.id)===String(cid))cu.on=!!t.checked});remSave(r);remStatus(t.checked?'تم تفعيل التذكير':'تم إيقاف التذكير');if(window.alsaerNativeSyncSoon)window.alsaerNativeSyncSoon(true);render();return}
    if(t.hasAttribute('data-rem-sound')){r.soundMode=t.getAttribute('data-rem-sound');changed=true;
      var nv2=window.AlsaerNative;if(nv2){try{nv2.setSoundMode(r.respectSilent&&r.soundMode==='chime'?'system':r.soundMode)}catch(x){}}
      remStatus(r.soundMode==='chime'?'تم اختيار نغمتك الخاصة':(r.soundMode==='silent'?'الإشعارات بلا صوت':'صوت النظام الافتراضي'));
      remSave(r);render();return}
    if(t.hasAttribute('data-rem-master')){r.enabled=t.checked;changed=true}
    if(t.hasAttribute('data-rem-toggle')){r[t.getAttribute('data-rem-toggle')]=t.checked;changed=true;
      if(t.getAttribute('data-rem-toggle')==='respectSilent'&&window.AlsaerNative){try{window.AlsaerNative.setSoundMode(t.checked&&(r.soundMode||'chime')==='chime'?'system':(r.soundMode||'chime'))}catch(x){}}}
    if(t.hasAttribute('data-rem-time')){r[t.getAttribute('data-rem-time')]=t.value;changed=true}
    if(changed){remSave(r);remStatus('تم حفظ إعدادات التذكيرات على هذا الجهاز.');if(window.alsaerNativeSyncSoon)window.alsaerNativeSyncSoon(true)}
  },true);
  /* ترحيل لمرة واحدة: بعض الهواتف (مثل شاومي) تُصمِت النغمة المخصصة، فيصبح الافتراضي «صوت النظام» الموثوق، ويبقى للمستخدم اختيار نغمة السائر أو الصامت من مركز التذكيرات */
  try{
    if(!localStorage.getItem('alsaer_snd_v8')){
      localStorage.setItem('alsaer_snd_v8','1');
      var rr=remLoad();if(rr.soundMode!=='silent'){rr.soundMode='chime';remSave(rr)}
    }
    var nvm=window.AlsaerNative,rm=remLoad();
    if(nvm&&nvm.setSoundMode){nvm.setSoundMode(rm.respectSilent&&rm.soundMode==='chime'?'system':(rm.soundMode||'chime'))}
  }catch(e){}
  setInterval(remCheck,15000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)remCheck()});
})();

/* === ALSAER NATIVE NOTIFICATIONS BRIDGE (يتصل بكود أندرويد الأصلي AlsaerNative) === */
