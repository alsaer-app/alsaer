(function(){
  var REM_KEY='alsaer_daily_reminders_v1',lastSig='',timer=null;
  function nat(){return window.AlsaerNative||null}
  function cfg(){
    var d={weekly:true,weeklyTime:'20:00',backup:true,backupTime:'19:00',salatEvery:'15',salatFrom:'08:00',salatTo:'22:00',wirdSmart:true,smart:false,respectSilent:false,praySkip:true,prayPre:'0',cuDone:{},consent:false,enabled:false,snoozeAuto:true,malik:true,malikTime:'21:30',kahf:true,kahfTime:'17:00',salat:true,salatTime:'12:00',dua:true,duaTime:'16:00',prayers:true,fasting:true,wird:true,wirdTime:'20:00',custom:[],soundMode:'chime'},x;
    try{x=JSON.parse(localStorage.getItem(REM_KEY)||'null')}catch(e){}
    if(x&&typeof x==='object'&&!Object.prototype.hasOwnProperty.call(x,'salatEvery'))d.salatEvery='120';
    return Object.assign(d,x||{});
  }
  function hm(t,def){var m=/^(\d{1,2}):(\d{2})$/.exec(t||'')||/^(\d{1,2}):(\d{2})$/.exec(def);return [parseInt(m[1],10),parseInt(m[2],10)]}
  function nt(x){try{if(typeof lang==='function'&&lang()!=='ar'&&typeof x==='string'){var r=trS(x);if(r)return r}}catch(e){}return x}
  function ntA(a){if(a&&a.l){a=Object.assign({},a);a.l=nt(a.l)}return a}
  function build(){
    var r=cfg(),out=[];if(typeof autoPtimes==='function')autoPtimes();
    if(!r.enabled||!r.consent)return out;
    function daily(id,title,body,time,def,route,act,dow){var t=hm(time,def);out.push({id:id,title:nt(title),body:nt(body),h:t[0],m:t[1],dow:dow||[],route:route||'',act:ntA(act)||null})}
    function one(id,title,body,day,time,def,route,act){var t=hm(time,def),at=new Date(day.getFullYear(),day.getMonth(),day.getDate(),t[0],t[1],0,0).getTime();if(at<=Date.now()-45000)return;out.push({id:id,title:nt(title),body:nt(body),at:at,route:route||'',act:ntA(act)||null})}
    if(r.malik)daily('malik','قراءة سورة الملك','حان وقت ورد سورة الملك قبل النوم.',r.malikTime,'21:30','sura:الملك');
    if(r.kahf)daily('kahf','قراءة سورة الكهف','اليوم الجمعة؛ لا تنس قراءة سورة الكهف.',r.kahfTime,'17:00','sura:الكهف',null,[5]);
    var TD=new Date(),TK=dk(TD);
    if(r.smart){
      var PT=(S&&S.ptimes)||{};
      function plus(t,def,add){var a=hm(t||def,def),m=(a[0]*60+a[1]+add)%1440;return (Math.floor(m/60)<10?'0':'')+Math.floor(m/60)+':'+(m%60<10?'0':'')+(m%60)}
      daily('smart_morning','أذكار الصباح','حان وقت أذكار الصباح — ابدأ يومك بذكر الله.',plus(PT.fajr,'05:00',35),'05:35','adk:morning');
      daily('smart_evening','أذكار المساء','حان وقت أذكار المساء.',plus(PT.asr,'15:30',40),'16:10','adk:evening');
      daily('smart_sleep','أذكار النوم','اختم يومك بأذكار النوم.',plus(PT.isha,'20:00',75),'21:15','adk:sleep');
    }
    function exd(dow){return dow&&dow.length?dow.slice():[]}
    function mins(t,def){var a=hm(t,def);return a[0]*60+a[1]}
    function fmt(m){return (Math.floor(m/60)<10?'0':'')+Math.floor(m/60)+':'+(m%60<10?'0':'')+(m%60)}
    /* كتابي: تذكير يومي بموعد القراءة (يُتخطّى اليوم إن سُجّلت قراءته) */
    try{(S.books||[]).forEach(function(b){
      if(!b||!b.rem||b.st==='pause'||b.read>=b.pages||!/^\d{1,2}:\d{2}$/.test(b.t||''))return;
      var bd=(b.days&&b.days.length)?b.days:[],lg=b.log&&b.log[TK]>0,dwb=lg?exd(bd):bd,per=(typeof boPer==='function')?boPer(b):b.per;

      daily('book_'+b.id,'وقت القراءة','«'+b.n+'» — اقرأ '+(per===1?'صفحة':per===2?'صفحتين':per+(per<=10?' صفحات':' صفحة'))+' اليوم، بقي '+(b.pages-b.read)+' صفحة.',b.t,'20:00','tab:books',{k:'book:'+b.id,l:'قرأت'},dwb);
    })}catch(e){}
    var SAL=['اللهم صلِّ وسلِّم على نبينا محمد ﷺ','«من صلى عليّ صلاةً صلى الله عليه بها عشرًا» ﷺ','صلّوا على النبي ﷺ ولو مرة','اللهم صلِّ على محمد وعلى آل محمد كما صليت على إبراهيم','أكثروا من الصلاة عليه ﷺ فهي نور وبركة','«أولى الناس بي يوم القيامة أكثرهم عليّ صلاة» ﷺ'];
    if(r.salat){
      var ev=parseInt(r.salatEvery,10)||0;
      if(ev>=15){var a1=mins(r.salatFrom,'08:00'),a2=mins(r.salatTo,'22:00'),c=0,sc=(S.salawat&&S.salawat[TK])||0;
        for(var mm=a1;mm<=a2&&c<96;mm+=ev,c++){var tt=fmt(mm);daily('salat_'+tt.replace(':',''),'الصلاة على النبي ﷺ',SAL[c%SAL.length]+(sc?'\nصلّيتَ اليوم '+sc+' مرة':''),tt,tt,'tab:tasbih',{k:'salat:1',l:'صلّيت ﷺ'})}
      }else daily('salat','الصلاة على النبي ﷺ','اللهم صل وسلم على نبينا محمد ﷺ',r.salatTime,'12:00','',{k:'salat:1',l:'صلّيت ﷺ'});
    }
    if(r.dua)daily('dua','ساعة إجابة يوم الجمعة','أكثر من الدعاء في ساعة الإجابة، وادعُ بما تحب.',r.duaTime,'16:00','',null,[5]);
    if(r.weekly){var wa=null;try{wa=weekAgg(0)}catch(e){}
      daily('weekly','تقريرك الأسبوعي',wa?('هذا الأسبوع: '+wa.pr+' صلاة من ٣٥، و'+wa.qp+' صفحة قرآن، و'+wa.hb+' عادة حسنة. اضغط للمقارنة بالأسبوع الماضي.'):'اطّلع على إنجازك هذا الأسبوع وقارنه بما قبله.',r.weeklyTime,'20:00','tab:progress',null,[5])}
    if(r.backup)daily('backup','النسخة الاحتياطية الأسبوعية','صدّر نسخة احتياطية مشفرة من بياناتك واحفظها في مكان آمن: الإعدادات ← الأمان والبيانات ← النسخ الاحتياطي.',r.backupTime,'19:00','tab:backup',null,[5]);
    if(r.wird){
      var got=qPages(TK),goal=S.quran.goal||1,left=Math.max(0,goal-got),doneW=left<=0;
      daily('wird','ورد القرآن',(got>0?'بقي عليك '+left+' من '+goal+' صفحات لإتمام وردك اليوم.':'وردك اليوم '+goal+' من الصفحات. اضغط للبدء من حيث توقفت.'),r.wirdTime,'20:00','quran:start',null,null);
    }
    if(r.prayers&&S.ptimes)PR.forEach(function(p){var t=S.ptimes[p[0]];if(!(t&&/^\d{1,2}:\d{2}$/.test(t)))return;
      var did=!!(r.praySkip!==false&&S.prayers[TK]&&S.prayers[TK][p[0]]),dw=did?exd([]):[];

      var pre=parseInt(r.prayPre,10)||0;
      if(pre>0){var pm=mins(t,t)-pre;if(pm>=0)daily('prep_'+p[0],'بقي '+pre+' دقيقة على صلاة '+p[1],'استعدّ للصلاة وتهيّأ لها بالوضوء.',fmt(pm),fmt(pm),'tab:prayers',null,dw)}
      daily('pray_'+p[0],'حان وقت صلاة '+p[1],'قم إلى الصلاة، تقبّل الله منك.',t,t,'tab:prayers',{k:'pray:'+p[0],l:'صلّيت'},dw);
    });
    var fr=S.fasting&&S.fasting.reminders;
    (r.custom||[]).forEach(function(cu){
      if(!cu||!cu.t||!cu.time||cu.on===false)return;
      var cn=Math.max(1,Math.min(12,parseInt(cu.n,10)||1)),ce=Math.max(5,parseInt(cu.ev,10)||30),c0=mins(cu.time,'07:00'),cdone=(r.cuDone||{})[cu.id]===TK,cdw=(cu.dow&&cu.dow.length)?cu.dow.slice():[];
      if(cdone){cdw=exd(cdw)}
      for(var ci=0;ci<cn;ci++){var cm=c0+ci*ce;if(cm>=1440)break;var ct=fmt(cm);
        daily('cu_'+cu.id+'_'+ci,cn>1?cu.t+' ('+(ci+1)+'/'+cn+')':cu.t,'ذكّرك: '+cu.t,ct,ct,'',{k:'cu:'+cu.id,l:'تم'},cdw)}
    });
    if(r.fasting&&fr&&fr.enabled){      var today=new Date();today.setHours(0,0,0,0);
      for(var i=0;i<=21;i++){
        var d=new Date(today);d.setDate(d.getDate()+i);var rs=fastingReasons(d);if(!rs.length)continue;
        var key=dk(d),why=rs.join(' · ');
        if(fastingStatus(key)==='done')continue;
        if(fr.suhoor)one('fs_'+key,'تذكير السحور',why,d,fr.suhoorTime,'03:30','tab:fasting',{k:'fast:done',l:'صمت'});
        if(fr.iftar)one('fi_'+key,'تذكير الإفطار','حان وقت الإفطار. لا تنسَ الدعاء.',d,fr.iftarTime,'17:00','tab:fasting',{k:'fast:done',l:'صمت'});
        if(fr.beforeDay){var e=new Date(d);e.setDate(e.getDate()-1);one('fb_'+key,'غدًا يوم صيام',why,e,'20:00','20:00','tab:fasting')}
      }
    }
    /* تنبيه قبل المناسبات الهجرية (أول ليلة 20:00) ويوم المناسبة 07:30 */
    if(r.occ!==false&&typeof occCache==='function'){try{occCache().forEach(function(o){
      if(o.days>3)return;var key=dk(o.date),e=new Date(o.date);e.setDate(e.getDate()-1);
      one('oc_b_'+key,'غدًا: '+o.n,'تذكير بقرب المناسبة.',e,'20:00','20:00','tab:occasions');
      if(o.n.indexOf('البيض')<0)one('oc_d_'+key,'اليوم: '+o.n,'بارك الله لك في يومك.',o.date,'07:30','07:30','tab:occasions');
    })}catch(e){}}
    /* وضع هادئ للمصلين: تُؤجَّل التذكيرات غير الصلاة إذا وقعت في أول ٢٠ دقيقة بعد وقت الصلاة */
    if(typeof S!=='undefined'&&S.calm){
      var PTc=(S&&S.ptimes)||{},starts=[];Object.keys(PTc).forEach(function(k){var mm=/^(\d{1,2}):(\d{2})$/.exec(PTc[k]||'');if(mm&&k!=='sunrise')starts.push(parseInt(mm[1],10)*60+parseInt(mm[2],10))});
      out.forEach(function(x){if(typeof x.h!=='number'||/^(pray_|prep_)/.test(x.id))return;var k=x.h*60+x.m;starts.forEach(function(st){if(k>=st&&k<st+20){var t=(st+21)%1440;x.h=Math.floor(t/60);x.m=t%60;k=t}})});
    }
    /* لا يتزاحم إشعاران في الدقيقة نفسها: يبقى إشعار الصلاة في وقته وتُزاح البقية دقيقة أو أكثر */
    (function(){
      var taken={};function share(a,b){return !a||!a.length||!b||!b.length||a.some(function(d){return b.indexOf(d)>=0})}
      var pr=function(x){return /^(pray_|prep_)/.test(x.id)?0:(/^salat_/.test(x.id)?2:1)};
      out.map(function(x,i){return [x,i]}).sort(function(a,b){return pr(a[0])-pr(b[0])||a[1]-b[1]}).forEach(function(z){
        var x=z[0];if(typeof x.h!=='number')return;
        var g=0;while(g<6){var k=x.h*60+x.m,list=taken[k]||[],hit=list.some(function(o){return share(o,x.dow)});if(!hit)break;var t=k+1;x.h=Math.floor((t%1440)/60);x.m=t%60;g++}
        var kk=x.h*60+x.m;(taken[kk]=taken[kk]||[]).push(x.dow||[]);
      });
    })();
    out.forEach(function(x){
      var skip=/^pray_|^prep_/.test(x.id)?!!(r.praySkip!==false&&S.prayers[TK]&&S.prayers[TK][x.id.replace(/^(pray_|prep_)/,'')]):/^book_/.test(x.id)?(S.books||[]).some(function(b){return x.id==='book_'+b.id&&b.log&&b.log[TK]>0}):/^cu_/.test(x.id)?(r.custom||[]).some(function(c){return x.id.indexOf('cu_'+c.id+'_')===0&&(r.cuDone||{})[c.id]===TK}):false;
      if(x.id==='wird'&&r.wirdSmart!==false&&qPages(TK)>=(S.quran.goal||1))skip=true;
      if(skip)x.skipDate=TK;
      if(S.loc&&S.loc.auto&&typeof locOk==='function'&&locOk()){
        var pk=/^(pray_|prep_)/.test(x.id)?x.id.replace(/^(pray_|prep_)/,''):({smart_morning:'fajr',smart_evening:'asr',smart_sleep:'isha'})[x.id];
        if(pk)x.prayer={key:pk,lat:S.loc.lat,lng:S.loc.lng,method:S.loc.method||'egypt',asr:S.loc.asr||1,pre:/^prep_/.test(x.id)?(parseInt(r.prayPre,10)||0):({smart_morning:-35,smart_evening:-40,smart_sleep:-75})[x.id]||0};
      }
    });
    return out;
  }
  var lastW='';
  function wsync(){
    var n=nat();if(!n||typeof n.setWidget!=='function'||typeof S==='undefined')return;
    try{
      var out=[],now=Date.now();
      for(var dd=0;dd<3;dd++){
        var day=new Date(now);day.setDate(day.getDate()+dd);var T=null;
        try{if(typeof locOk==='function'&&locOk())T=ptCompute(day,S.loc.lat,S.loc.lng,S.loc.method||'egypt',S.loc.asr||1)}catch(e){}
        T=T||S.ptimes||{};
        PR.forEach(function(p){var m=/^(\d{1,2}):(\d{2})$/.exec(T[p[0]]||'');if(!m)return;
          var at=new Date(day.getFullYear(),day.getMonth(),day.getDate(),parseInt(m[1],10),parseInt(m[2],10),0,0).getTime();
          if(at>now-60000)out.push({n:p[1],at:at,t:(typeof ptFmt==='function'?ptFmt(T[p[0]]):T[p[0]])})});
      }
      var hj='';try{var hd=hijriNumeric(new Date());hj=ar(hd.day)+' '+['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'][hd.month-1]}catch(e){}
      var bw='';try{bw=typeof boWidget==='function'?boWidget():''}catch(e){}
      var js=JSON.stringify({l:out.slice(0,12),h:hj,b:bw});
      if(js===lastW)return;lastW=js;n.setWidget(js);
    }catch(e){}
  }
  function sync(force){
    var n=nat();if(!n||typeof S==='undefined')return;wsync();
    var items=build();if(typeof isFem==='function'&&isFem())items.forEach(function(x){if(String(x.id).indexOf('cu_')!==0){x.title=femStr(x.title);x.body=femStr(x.body)}});
    var sig=JSON.stringify(items);
    var r0=typeof remLoad==='function'?remLoad():cfg();
    try{if(typeof n.setSnoozeAuto==='function')n.setSnoozeAuto(r0.snoozeAuto!==false)}catch(e){}
    if(!force&&sig===lastSig)return;
    lastSig=sig;try{n.setSchedule(sig)}catch(e){}
  }
  window.alsaerReminderItems=build;
  window.alsaerUpcoming=function(max){
    var items=[];try{items=build()}catch(e){return []}
    var now=new Date(),out=[];
    items.forEach(function(x){
      var at=null;
      if(typeof x.at==='number'){at=x.at}
      else if(typeof x.h==='number'){
        for(var i=0;i<8&&!at;i++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i,x.h,x.m,0,0);if(x.skipDate===dk(d))continue;if(x.prayer&&typeof ptCompute==='function'){var pt=ptCompute(d,x.prayer.lat,x.prayer.lng,x.prayer.method,x.prayer.asr)[x.prayer.key];if(!pt)continue;var hm0=pt.split(':');d.setHours(+hm0[0],+hm0[1]-x.prayer.pre,0,0);}
          if(d.getTime()>now.getTime()&&(!x.dow||!x.dow.length||x.dow.indexOf(d.getDay())>=0))at=d.getTime()}
      }
      if(at&&at>now.getTime())out.push({t:x.title,at:at});
    });
    out.sort(function(a,b){return a.at-b.at});
    var seen={};out=out.filter(function(o){var k=String(o.t).replace(/\s*\d+$/,'');if(seen[k])return false;seen[k]=1;return true});
    return out.slice(0,max||5).map(function(o){var d=new Date(o.at),td=d.toDateString()===now.toDateString();
      var hm=(typeof ptFmt==='function')?ptFmt((d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes()):d.toTimeString().slice(0,5);
      return {t:o.t,w:(td?'اليوم ':['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][d.getDay()]+' ')+hm}});
  };
  setInterval(function(){try{if(!document.hidden&&window.alsaerUpRefresh)window.alsaerUpRefresh()}catch(e){}},20000);
  function syncSoon(force){clearTimeout(timer);timer=setTimeout(function(){sync(force===true)},1200)}
  window.alsaerNativeSyncSoon=syncSoon;
  function go(route){
    var p=String(route).split(':');
    if(p[0]==='tab'&&p[1]){tab=p[1];window.scrollTo(0,0);render()}
    else if(p[0]==='adk'&&p[1]){group=p[1];hsnOpen(p[1]);window.scrollTo(0,0);render()}
    else if(p[0]==='quran'&&p[1]==='start'){var st=S.quran.pos;rd={from:st,to:Math.min(604,st+S.quran.goal-1),page:st};tab='reader';render();window.scrollTo(0,0)}
    else if(p[0]==='sura'){loadHeavy(function(){var name=p.slice(1).join(':'),si=QD().n.indexOf(name),pg=si>=0?suraPage(si+1):S.quran.pos;rd=mqRd(pg,pg,pg,si>=0?{sura:si+1,cv:(si+1)+':1'}:null);tab='reader';render();window.scrollTo(0,0)})}
  }
  window.alsaerReminderGo=go;
  window.alsaerPoll=function(quiet){
    var n=nat();if(!n||typeof S==='undefined')return;
    var changed=false,list=[];
    try{list=JSON.parse(n.takePending()||'[]')}catch(e){}
    list.forEach(function(x){
      var k=dk(new Date(x.t||Date.now())),a=String(x.a||'').split(':');
      if(a[0]==='pray'&&PR.some(function(q){return q[0]===a[1]})){S.prayers[k]=S.prayers[k]||{};S.prayers[k][a[1]]=true;if(typeof mtSet==='function')mtSet('p:'+a[1],k);changed=true}
      else if(a[0]==='salat'){S.salawat=S.salawat||{};S.salawat[k]=(S.salawat[k]||0)+1;changed=true}
      else if(a[0]==='cu'&&a[1]){var rc=remLoad();rc.cuDone=rc.cuDone||{};rc.cuDone[a[1]]=k;remSave(rc)}
      else if(a[0]==='book'&&a[1]){if(typeof boFromNotif==='function'&&boFromNotif(a[1],k))changed=true}
      else if(a[0]==='fast'&&a[1]==='done'){S.fasting.records=S.fasting.records||{};S.fasting.records[k]='done';if(typeof mtSet==='function')mtSet('fast',k);changed=true}
    });
    if(changed){save();if(typeof checkNew==='function')checkNew();if(typeof toast==='function')toast('تم تسجيل إجابتك من الإشعار')}
    var route='';try{route=n.takeRoute()||''}catch(e){}
    if(route)go(route);else if(changed)render();
    if(quiet!==true)syncSoon();
  };
  /* أي حفظ لبيانات التطبيق أو إعدادات التذكير يعيد مزامنة الجدول */
  var _save=save;save=function(){var r=_save.apply(this,arguments);syncSoon();return r};
  /* syncSoon مربوط بـ save() فقط — إزالة مزامنة كل ضغطة/تغيير توفيرًا للبطارية */
  document.addEventListener('visibilitychange',function(){if(!document.hidden)window.alsaerPoll()});
  window.addEventListener('focus',function(){window.alsaerPoll()});
  window.addEventListener('pageshow',function(){window.alsaerPoll()});
  setInterval(function(){if(!document.hidden)window.alsaerPoll(true)},30000);
  function remLoad(){var x=null;try{x=JSON.parse(localStorage.getItem(REM_KEY)||'null')}catch(e){}return Object.assign(cfg(),x||{})}
  function remSave(x){try{localStorage.setItem(REM_KEY,JSON.stringify(x))}catch(e){}}
  function permOk(){var n=nat();try{return !!(n&&n.notificationsEnabled&&n.notificationsEnabled())}catch(e){return false}}
  function enableNow(){var r=remLoad();if(!r.consent||!r.enabled){r.consent=true;r.enabled=true;remSave(r)}syncSoon(true)}
  function enableOnce(){var r=remLoad();if(!r.autoOn){var prior=null;try{prior=JSON.parse(localStorage.getItem(REM_KEY)||'null')}catch(e){}r.autoOn=true;if(!(prior&&prior.enabled===false)){r.consent=true;r.enabled=true}remSave(r);syncSoon(true)}}
  window.alsaerNotifOk=function(){var r=remLoad();return permOk()&&r.consent&&r.enabled};
  window.alsaerNotifFix=function(){
    var n=nat();if(!n)return;
    if(permOk()){enableNow();return}
    try{n.requestNotificationPermission()}catch(e){}
    var t=0,iv2=setInterval(function(){t++;if(permOk()){clearInterval(iv2);enableNow();if(typeof render==='function')render();if(typeof toast==='function')toast('تم تفعيل الإشعارات')}else if(t>60)clearInterval(iv2)},500);
  };
  function autoEnable(){
    var n=nat();if(!n||typeof S==='undefined'||!S.onboarded)return;
    if(permOk()){enableOnce()}
    else if(!S.notifAsked&&!document.hidden){S.notifAsked=1;save();window.alsaerNotifFix()}
  }
  var _poll=window.alsaerPoll;window.alsaerPoll=function(){try{autoEnable()}catch(e){}return _poll.apply(this,arguments)};
  var tries=0,iv=setInterval(function(){tries++;if(nat()){clearInterval(iv);window.alsaerPoll();sync(true)}else if(tries>40)clearInterval(iv)},500);
})();
