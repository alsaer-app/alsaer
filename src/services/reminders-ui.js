(function(){
  var REM_KEY='alsaer_daily_reminders_v1';
  function remDefaults(){return {
    consent:false, enabled:false, malik:true, malikTime:'21:30',
    kahf:true, kahfTime:'17:00', salat:true, salatTime:'12:00',
    dua:true, duaTime:'16:00', prayers:true, fasting:true, wird:true, wirdTime:'20:00', soundMode:'chime', weekly:true, weeklyTime:'20:00', backup:true, backupTime:'19:00', custom:[], cuDow:[], last:{}, salatEvery:'15', salatFrom:'08:00', salatTo:'22:00', wirdSmart:true, smart:false, respectSilent:false, praySkip:true, prayPre:'0', cuDone:{}, battDone:false
  };}
  function remLoad(){
    var d=remDefaults(),x;
    try{x=JSON.parse(localStorage.getItem(REM_KEY)||'null')}catch(e){}
    if(x&&typeof x==='object'&&!Object.prototype.hasOwnProperty.call(x,'salatEvery'))d.salatEvery='120';
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
  /* Re-entering the center must not strand its main tabs behind the checkup subpage. */
  window.alsaerRemindersEnter=function(){if(REM_PANE==='checkup'||['main','smart','mine'].indexOf(REM_PANE)<0)REM_PANE='main'};
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
    function sgRemRow(icon,title,desc,field){
      var rr=remLoad(), active=rr.enabled&&rr[field];
      return '<div class="sg-row'+(active?' lit':'')+'"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+title+'</b><small>'+desc+'</small></div><div class="sg-ctl">'+sw('data-rem-toggle="'+field+'"',rr[field])+'</div></div>';
    }
    function selO(field,val,list){return '<select class="rm-sel" data-rem-time="'+field+'">'+list.map(function(x){return '<option value="'+x[0]+'"'+(String(val)===String(x[0])?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'}
    function tm(field,val){return '<input class="rm-sel" type="time" data-rem-time="'+field+'" value="'+remEsc(val)+'">'}
    function ctlRow(title,ctl){return '<div class="sg-row"><div class="sg-tx"><b>'+title+'</b></div><div class="sg-ctl">'+ctl+'</div></div>'}
    function noteRow(t){return '<div class="sg-row"><div class="sg-tx"><small>'+t+'</small></div></div>'}
    function swRow(title,desc,field,on){return '<div class="sg-row'+(on?' lit':'')+'"><div class="sg-tx"><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div><div class="sg-ctl">'+sw('data-rem-toggle="'+field+'"',on)+'</div></div>'}
    function upRows(L){return L.map(function(x){return '<div class="up-r"><span>'+remEsc(x.t)+'</span><b>'+remEsc(x.w)+'</b></div>'}).join('')}
    window.alsaerUpRefresh=function(){var e=document.getElementById('rm-up-l');if(!e)return;try{var L=window.alsaerUpcoming(6)||[];e.innerHTML=upRows(L)}catch(x){}};
    function upcomingCard(){
      var L=[];try{L=(window.alsaerUpcoming&&window.alsaerUpcoming(6))||[]}catch(x){}
      if(!L.length)return '';
      return '<div class="sg-t">'+ic('clock')+' المجدول فعلًا على هاتفك</div><section class="card flat rm-up"><h4>'+ic('clock')+'الإشعارات القادمة</h4><div id="rm-up-l">'+upRows(L)+'</div><p class="note">هذه هي التذكيرات المجدولة فعلًا على هاتفك.</p></section>';
    }
    function smartGroups(r){
      var ev=parseInt(r.salatEvery,10)||0,cnt=0;if(ev>=15){var a1=r.salatFrom.split(':'),a2=r.salatTo.split(':');cnt=Math.floor(((+a2[0])*60+(+a2[1])-(+a1[0])*60-(+a1[1]))/ev)+1}
      var tk=dk(),sc=(S.salawat&&S.salawat[tk])||0;
      return '<div class="sg-t">'+ic('heart')+' الصلاة على النبي ﷺ</div><div class="sg-card">'
        +noteRow('اختر التكرار والفترة، وسيصلك تذكير بصيغة مختلفة كل مرة.'+(sc?' صلّيتَ اليوم '+remAr(sc)+' مرة.':''))
        +ctlRow('التكرار',selO('salatEvery',ev,[[0,'مرة يوميًا'],[120,'كل ساعتين'],[60,'كل ساعة'],[30,'كل نصف ساعة'],[15,'كل ١٥ دقيقة']]))
        +(ev>=15?ctlRow('من',tm('salatFrom',r.salatFrom))+ctlRow('إلى',tm('salatTo',r.salatTo))+noteRow('≈ '+remAr(cnt)+' إشعارًا في اليوم'):ctlRow('الوقت',tm('salatTime',r.salatTime)))
        +'</div>'
       +'<div class="sg-t">'+ic('sparkles')+' ورد القرآن اليومي</div><div class="sg-card">'
        +noteRow('يُذكّرك بما بقي من وردك، ولا يُرسَل إذا أتممته.')
        +ctlRow('الوقت',tm('wirdTime',r.wirdTime))
        +swRow('تخطَّ التذكير إذا أتممت ورد اليوم','','wirdSmart',r.wirdSmart!==false)
        +'</div>'
       +'<div class="sg-t">'+ic('clock')+' مواقيت الصلاة</div><div class="sg-card">'
        +noteRow('تنبيه عند دخول وقت الصلاة بحسب مدينتك، وزر «صلّيت» لتسجيلها من الإشعار نفسه.')
        +ctlRow('تنبيه قبل دخول الوقت',selO('prayPre',r.prayPre,[[0,'بلا تنبيه'],[5,'٥ دقائق'],[10,'١٠ دقائق'],[15,'١٥ دقيقة'],[30,'٣٠ دقيقة']]))
        +swRow('تخطَّ تذكير الصلاة التي سجّلتها','','praySkip',r.praySkip!==false)
        +swRow('جدولة ذكية للأذكار','أذكار الصباح بعد الفجر، والمساء بعد العصر، والنوم بعد العشاء، وفق مواقيتك — قواعد تعمل على هاتفك دون إنترنت','smart',!!r.smart)
        +'</div>'
       +'<div class="sg-t">'+ic('chart')+' التقرير الأسبوعي</div><div class="sg-card">'
        +noteRow('ملخص بأرقام أسبوعك في الإشعار نفسه، كل جمعة.')
        +ctlRow('الوقت',tm('weeklyTime',r.weeklyTime))
        +'</div>';
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
    if(REM_PANE==='checkup'){
      var CHV=ic('chev').replace('class="i"','class="i chev"');
      function tRow(icon,t,sub,act){return '<button type="button" class="sg-row sg-btn" data-rem-action="'+act+'"><span class="sg-ic">'+ic(icon)+'</span><div class="sg-tx"><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div><div class="sg-ctl">'+CHV+'</div></button>'}
      var sndN=cur==='chime'?'نغمة السائر':(cur==='silent'?'بلا صوت':'صوت النظام');
      var h='<div class="sc-head"><button type="button" class="sc-back" data-rem-pane="main">'+ic('chev')+' مركز التذكيرات</button><h2>'+ic('check')+'فحص وإصلاح الإشعارات</h2></div>';
      if(nat){
        var pOk=false,eOk=false;try{pOk=!!nat.notificationsEnabled()}catch(x){}try{eOk=!!nat.canExactAlarms()}catch(x){}
        var cOk=!!(r.consent&&r.enabled);
        var allOk=pOk&&cOk&&eOk&&!!r.battDone;
        if(allOk){
          h+='<div class="okcard"><span class="oki">'+ic('check')+'</span><div><b>كل إعدادات الإشعارات سليمة</b><small>الإذن والمنبّهات الدقيقة والبطارية مضبوطة</small></div></div>'
            +'<div class="acts" style="margin:6px 0"><button class="btn ghost dim" data-rem-action="battery">فتح الإعدادات</button><button class="btn ghost" data-rem-action="battreset">إعادة الفحص</button></div>';
        }else{
          var stp=function(n,ok,t,sub,btn){return '<div class="stp'+(ok?' done':'')+'"><span class="stp-n">'+(ok?'✓':remAr(n))+'</span><div class="stp-b"><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>'+(ok?'':btn||'')+'</div>'};
          var oem='<details class="stp-oem"'+(r.battDone?'':' open')+'><summary>خطوات الهواتف الخاصة (شاومي · ريدمي · بوكو · أوبو · سامسونج)</summary><ol><li>افتح <b>إعدادات التطبيق</b> ثم <b>التشغيل التلقائي</b> وفعّله.</li><li>اجعل <b>البطارية «بلا قيود»</b> للتطبيق.</li><li>ثبّت التطبيق في <b>قائمة التطبيقات الحديثة</b> (قفل التطبيق).</li><li>ارجع واضغط <b>«تم ✓»</b>. لا يقرأ التطبيق هذا الإعداد تلقائيًا، فتأكيدك هو المعتمد.</li></ol></details>';
          h+='<section class="card flat rm-help"><h4>فحص الإشعارات</h4><div class="stp-list">'
           +stp(1,pOk,'إذن الإشعارات','من نظام الهاتف','<button class="btn ghost" data-rem-action="permission">تفعيل</button>')
           +stp(2,cOk,'جدول التذكيرات','تفعيله داخل التطبيق','<button class="btn ghost" data-rem-action="permission">تفعيل</button>')
           +stp(3,eOk,'المنبّهات الدقيقة','ليصل الإشعار في موعده','<button class="btn ghost" data-rem-action="exact">السماح</button>')
           +stp(4,!!r.battDone,'البطارية والتشغيل التلقائي','بلا قيود حتى لا يوقف الهاتف الإشعارات','<button class="btn ghost'+(r.battOpened?' dim':'')+'" data-rem-action="battery">فتح الإعدادات</button><button class="btn" data-rem-action="battdone">تم ✓</button>')
           +'</div>'+(r.battDone?'':oem)
           +(r.battDone?'<div class="acts"><button class="btn ghost dim" data-rem-action="battery">فتح الإعدادات</button></div>':'')+'</section>';
        }
      }
      h+='<div class="sg-t">اختبار</div><div class="sg-card">'
        +tRow('bell','اختبار الإشعار','يصلك إشعار حقيقي بعد ثوانٍ','test')
        +tRow('sparkles','اختبار الصوت','تشغيل نغمة السائر','soundtest')
        +tRow('phone','اختبار الاهتزاز','','vibtest')
        +'</div>'
        +'<div class="sg-t">الصوت</div><div class="sg-card">'
        +'<button type="button" class="sg-row sg-btn" data-rem-action="sndopen"><span class="sg-ic">'+ic('bell')+'</span><div class="sg-tx"><b>صوت الإشعار</b><small>النغمة أو بلا صوت أو صوت النظام</small></div><div class="sg-ctl"><span class="sg-val">'+sndN+'</span>'+CHV+'</div></button>'
        +tRow('gear','صوت الإشعارات في الهاتف','قناة النظام وأهميتها','sndset')
        +'</div>'
        +upcomingCard()
        +'<p id="rem-status" class="rm-status">'+st+'</p>';
      return h;
    }
    return '<section class="rm-hero"><span class="rm-hic">'+ic('bell')+'</span><div><h2>مركز التذكيرات</h2><p>تذكيرات تلقائية بأوقات مدروسة، تصلك حتى والتطبيق مغلق</p></div></section>'
      +'<div class="sg-card" style="margin-top:10px"><div class="sg-row'+(r.enabled?' lit':'')+'"><span class="sg-ic">'+ic('bell')+'</span><div class="sg-tx"><b>جدول التذكيرات التلقائي</b><small>'+(nat?'يعمل على مستوى النظام: مع الشاشة المقفلة وبعد إعادة تشغيل الهاتف':'يعمل أثناء فتح التطبيق')+'</small></div><div class="sg-ctl"><span class="sg-pill '+(r.enabled?'ok':'bad')+'">'+(r.enabled?'مفعّل ✓':'متوقف')+'</span>'+sw('data-rem-master',r.enabled)+'</div></div></div>'
      +'<div class="rm-seg">'+[['main','التذكيرات'],['smart','ذكي'],['mine','تذكيري']].map(function(x){return '<button type="button" class="'+(REM_PANE===x[0]?'on':'')+'" data-rem-pane="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'
      +'<div class="rm-pane'+(REM_PANE==='main'?' on':'')+'">'
      +'<div class="sg-t">تذكيرات يومية</div><div class="sg-card">'
      +sgRemRow('book','سورة الملك','كل ليلة · وقت تلقائي مدروس','malik')
      +sgRemRow('mosque','الصلاة على النبي ﷺ','تذكير يومي','salat')
      +sgRemRow('sparkles','ورد القرآن اليومي','قبل النوم إذا لم تتم','wird')
      +sgRemRow('mosque','مواقيت الصلوات','بحسب أوقات مدينتك المحفوظة عندك','prayers')
      +sgRemRow('moon','تذكيرات الصيام','سحور وإفطار وقبل يوم الصيام','fasting')
      +'</div><div class="sg-t">تذكيرات أسبوعية</div><div class="sg-card">'
      +sgRemRow('cal','سورة الكهف','كل جمعة بعد العصر','kahf')
      +sgRemRow('beads','ساعة إجابة الجمعة','وقت الدعاء يوم الجمعة','dua')
      +sgRemRow('chart','تقرير الأسبوع','كل جمعة مساءً · ملخص إنجازك','weekly')
      +sgRemRow('check','النسخة الاحتياطية الأسبوعية','كل جمعة مساءً · تذكير بتصدير نسخة مشفرة','backup')
      +'</div><div class="sg-t">النظام</div><div class="sg-card">'
      +'<button type="button" class="sg-row sg-btn" data-rem-pane="checkup"><span class="sg-ic">'+ic('check')+'</span><div class="sg-tx"><b>فحص وإصلاح الإشعارات</b><small>خطوات الإذن والبطارية + اختبار حقيقي</small></div><div class="sg-ctl">'+ic('chev').replace('class="i"','class="i chev"')+'</div></button>'
      +'</div>'
      +'</div><div class="rm-pane'+(REM_PANE==='smart'?' on':'')+'">'
      +smartGroups(r)
      +'</div><div class="rm-pane'+(REM_PANE==='mine'?' on':'')+'"><div class="rm-sect">'+ic('pen')+'<span>تذكيرك الخاص</span></div>'
      +'<p class="rm-hint">أضف أي تذكير تريده باسمك ووقتك وأيامك المفضلة.</p>'
      +cus
      +'<div class="rm-add"><input id="cu-name" type="text" maxlength="40" placeholder="اسم التذكير (مثال: ذكر الصباح)"><div class="rm-now">'+ic('clock')+'<span>الوقت الحالي في هاتفك: <b>'+remNow()+'</b></span></div>'+remPickHtml()+'<div class="rm-clock"><span>نظام الوقت</span></div>'+clkSeg('rem')+'<div class="sm-g" style="margin:8px 0"><label>عدد الإشعارات</label><select id="cu-n" class="rm-sel">'+[1,2,3,4,5,6,8,10,12].map(function(n){return '<option value="'+n+'">'+remAr(n)+'</option>'}).join('')+'</select><label>كل</label><select id="cu-ev" class="rm-sel">'+[[15,'١٥ دقيقة'],[30,'نصف ساعة'],[60,'ساعة'],[120,'ساعتان']].map(function(x){return '<option value="'+x[0]+'"'+(x[0]===30?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div><div class="rm-days">'+dayChips+'</div><button class="btn" data-rem-action="cuadd">'+ic('check')+'إضافة التذكير</button></div>'
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
    if(sura&&sura.indexOf(':')>=0&&typeof window.alsaerReminderGo==='function'){window.alsaerReminderGo(sura);return}
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
    var checks=typeof window.alsaerReminderItems==='function'?window.alsaerReminderItems():[
      {id:'malik',on:r.malik,h:+r.malikTime.split(':')[0],m:+r.malikTime.split(':')[1],title:'قراءة سورة الملك',body:'حان وقت ورد سورة الملك قبل النوم.',route:'sura:الملك'},
      {id:'salat',on:r.salat,h:+r.salatTime.split(':')[0],m:+r.salatTime.split(':')[1],title:'الصلاة على النبي ﷺ',body:'اللهم صل وسلم على نبينا محمد ﷺ'},
      {id:'kahf',on:r.kahf,h:+r.kahfTime.split(':')[0],m:+r.kahfTime.split(':')[1],dow:[5],title:'قراءة سورة الكهف',body:'حان وقت قراءة سورة الكهف.',route:'sura:الكهف'},
      {id:'dua',on:r.dua,h:+r.duaTime.split(':')[0],m:+r.duaTime.split(':')[1],dow:[5],title:'ساعة إجابة يوم الجمعة',body:'أكثر من الدعاء.'}
    ];
    var changed=false;if(!r.last||typeof r.last!=='object')r.last={};
    checks.forEach(function(x){
      if(x.on===false||x.skipDate===dk(d))return;
      if(x.prayer&&typeof ptCompute==='function'){var pt=ptCompute(d,x.prayer.lat,x.prayer.lng,x.prayer.method,x.prayer.asr)[x.prayer.key];if(!pt)return;var pta=pt.split(':'),pmin=(+pta[0]*60+ +pta[1]-x.prayer.pre+1440)%1440;x.h=Math.floor(pmin/60);x.m=pmin%60;}
      if(x.at){if(x.at>Date.now()||Date.now()-x.at>45000)return}
      else if(x.h!==d.getHours()||x.m!==d.getMinutes()||(x.dow&&x.dow.length&&x.dow.indexOf(day)<0))return;
      var k=x.id+'_'+date;if(r.last[k])return;
      r.last[k]=true;changed=true;remNotify(x.title,x.body,x.route||'');
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
    if(act==='sndopen'){try{setCat='notif';setSub='';setOpen='snd';scAnim=1;tab='settings';window.scrollTo(0,0);render()}catch(x){}return}
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
