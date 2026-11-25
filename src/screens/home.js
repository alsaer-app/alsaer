function vHome(){
  var s=stats(),k=dk(),t=S.days[k],note=draft!==null?draft:(t&&t.note)||'';
  var q=dailyCardContent||chooseDailyCardContent();
  var trigs=draftTrig!==null?draftTrig:((t&&t.trig)||[]),tt=topTrig();
  var nxt=MILES.filter(function(n){return n>s.cur})[0]||MILES[MILES.length-1];
  var C=2*Math.PI*76,off=C*(1-Math.min(1,s.cur/nxt));
  var wk='';
  for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var kk=dk(d),st=S.days[kk]?S.days[kk].status:'';wk+='<div class="wk '+st+(i===0?' today':'')+'"><i>'+(st==='success'?ic('check'):st==='relapse'?ic('x'):'')+'</i><span>'+WEEK[d.getDay()]+'</span></div>'}
  var dn=dayDone(k),T=dayTotal(),pdone=PR.filter(function(p){return S.prayers[k]&&S.prayers[k][p[0]]}).length;
  var hdone=allHabits().filter(function(h){return ((S.habits||{})[k]||{})[h[0]]}).length;
  var greet=greetingNow(),pname=S.privName?'':(S.profile&&S.profile.name||'').trim(),dates=calendarToday(),age=(S.profile&&S.profile.age||'').trim();
  var profile='<section class="profile-hero '+(greet.morning?'is-morning':'is-evening')+'"><div class="profile-main"><button class="profile-avatar-large" data-a="tab" data-v="settings" aria-label="تعديل الملف الشخصي">'+profileAvatar(82)+'</button><div class="profile-identity"><div class="salam-line">السلام عليكم ورحمة الله وبركاته</div><div class="welcome-line '+(greet.morning?'is-morning':'is-evening')+'">'+ic(greet.icon)+'<span>'+esc(greet.text||'أكمل ملفك الشخصي')+'</span></div><div class="profile-sub">'+(age?'<span class="age-chip">'+ic('user')+' العمر · '+esc(age)+' سنة</span>':'أضف عمرك إن أحببت')+'</div></div></div><div class="calendar-line"><span>'+ic('cal')+' '+esc(dates.greg)+'</span><span class="cal-sep">•</span><span>'+ic('moon')+' '+esc(dates.hijri)+'</span></div></section>';
  var nfix=(window.AlsaerNative&&window.alsaerNotifOk&&!window.alsaerNotifOk())?'<button class="notif-warn" data-a="notifFix">'+ic('bell')+'<span><b>الإشعارات متوقفة</b><small>اضغط لتفعيلها فتصلك التذكيرات في مواعيدها</small></span></button>':'';
  if(!nfix&&window.AlsaerNative&&AlsaerNative.canExactAlarms){var exOk=true;try{exOk=!!AlsaerNative.canExactAlarms()}catch(e){}if(!exOk)nfix='<button class="notif-warn" data-a="notifFix">'+ic('bell')+'<span><b>المنبّهات الدقيقة غير مسموحة</b><small>قد تتأخر الصلاة والتذكيرات عن موعدها. اضغط للسماح</small></span></button>'}
  var B={
   daily:function(){return dailyCardMarkup()},
   timeb:function(){return homeTimeBanner()},
   tiles:function(){return homeSpecialTiles()},
   worship:function(){return worshipHomeCard()},
   progress:function(){return '<section class="card flat dprog"><div class="row between"><span>تقدم اليوم</span><b>'+dn+' من '+T+'</b></div><div class="bar"><div style="width:'+Math.round(dn/T*100)+'%"></div></div></section>'},
   nav:function(){return '<div class="tiles">'+tile('prayers','mosque','الصلوات',pdone+' من 5')+tile('fasting','moon','الصيام','جدول الصيام')+tile('quran','book','القرآن',Math.min(qPages(k),99)+' / '+S.quran.goal+' صفحة')+tile('adhkar','beads','الأذكار','الصباح والمساء')+'</div>'
     +'<div class="tiles">'+tile('reminders','bell','التذكيرات','مركز التنبيهات')+tile('habits','target','العادات',hdone+' من '+allHabits().length)+'</div>'
     +'<div class="lrows" style="margin-top:10px">'+lrow('journal','clock','سجل النشاط اليومي','صلواتك وقراءتك وصيامك وعاداتك باليوم والساعة')+'</div>'},
   journey:function(){return '<div class="sect">'+ic('flag')+'رحلة الثبات</div>'
     +'<section class="card hero"><div class="ring"><svg viewBox="0 0 176 176"><circle class="tr" cx="88" cy="88" r="76" fill="none" stroke-width="12"/><circle class="pg" cx="88" cy="88" r="76" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div class="mid"><div class="count">'+s.cur+'</div><small>يوم متتالٍ</small></div></div><div class="next">الهدف القادم: '+nxt+' '+(nxt<11?'أيام':'يوماً')+' · '+rankName(s.best)+'</div><div class="week">'+wk+'</div></section>'
     +'<section class="grid3"><div class="stat o"><b>'+s.best+'</b><small>أطول سلسلة</small></div><div class="stat g"><b>'+s.ok+'</b><small>أيام النجاح</small></div><div class="stat"><b>'+s.rate+'%</b><small>نسبة النجاح</small></div></section>'},
   tracker:function(){return trackerCard()}
  };
  var body=homeEdit?heGrid():homeOrder().map(function(key){if(hidH(key))return '';var h=B[key]();return h?'<div class="hs" data-hs="'+key+'">'+h+'</div>':''}).join('');
  return nfix+profile+body
  +(homeEdit?'':(tt?'<section class="card tipc"><h3>نصيحة بحسب محفّزاتك</h3><p style="margin:0">'+TTIPS[tt]+'</p></section>':'')+'<button class="sos" data-a="goboost">'+ic('sos')+'أشعر برغبة الآن</button>'+COPY);
}




function nxInfo(){
  var dn=dayDone(dk()),T=dayTotal(),h=new Date().getHours(),pct=Math.min(100,Math.round(dn/Math.max(1,T)*100)),step,sub,v='adhkar';
  if(pct>=100){step='أتممت عبادات اليوم';sub='تقبّل الله منك — زِد من الذكر ما تيسّر'}
  else if(h<10){step='أذكار الصباح';sub='ابدأ يومك بذكر الله'}
  else if(h>=15&&h<19){step='أذكار المساء';sub='حان وقت أذكار المساء'}
  else if(h>=21||h<4){step='أذكار النوم';sub='اختم يومك بذكر الله'}
  else{step='وردك من القرآن';sub='أكمل وردك اليوم';v='quran'}
  return {pct:pct,step:step,sub:sub,v:v};
}
function nxRow(){var n=nxInfo();return '<button class="nx-card nx-in" data-a="tab" data-v="'+n.v+'"><span class="nx-ring" style="--p:'+n.pct+'"><b>'+ar(n.pct)+'٪</b></span><span class="nx-tx"><small>خطوتك التالية</small><b>'+n.step+'</b><em>'+n.sub+'</em></span><span class="nx-go">'+ic('chev')+'</span></button>'}
