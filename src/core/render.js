function vRenderFail(e,t){
  return '<section class="card dg-fail"><h3>⚠ تعذّر عرض هذه الشاشة</h3><p class="note">حدث خطأ غير متوقع. بقية التطبيق يعمل.</p>'
   +'<div class="acts"><button class="btn" data-a="tab" data-v="home">الرئيسية</button></div></section>';
}
function render(){
  var oldReaderOverlay=document.getElementById('rd-ov');if(oldReaderOverlay)oldReaderOverlay.remove();
  app.style.removeProperty('padding-top');
  document.body.style.removeProperty('padding-bottom');
  var backupDialog=document.getElementById('gd-dialog-host');if(backupDialog)backupDialog.remove();
  var popping=backPopHandling;backPopHandling=false;
  applyUI();
  if(splash||!unlocked||!S.onboarded||covered){var qf=document.getElementById('qfab');if(qf)qf.hidden=true}
  if(splash){tabs.hidden=true;top.innerHTML='';app.innerHTML=vSplash();if(lang()!=='ar')trWalk(app);return}
  if(!unlocked){tabs.hidden=true;top.innerHTML='';app.innerHTML=vLock();if(lang()!=='ar')trWalk(app);bioAuto();return}
  if(!S.onboarded){tabs.hidden=true;top.innerHTML='';app.innerHTML=vOb();if(lang()!=='ar')trWalk(app);return}
  if(covered){tabs.hidden=true;top.innerHTML='';app.innerHTML='<button class="cover" data-a="uncover">اضغط للمتابعة</button>';if(lang()!=='ar')trWalk(app);return}
  tabs.hidden=false;
  if(tab!=='home')homeEdit=false;
  if(tab==='adhkar'||tab==='tasbih')hsnRedirect();
  var par=tab;while(PARENT[par])par=PARENT[par];
  if(tab==='home'){top.innerHTML='';top.style.display='none';top.style.position=''}
  else{top.style.display='';top.style.position=(tab==='reader'?'static':'');top.innerHTML='<h1>'+ic(TICON[tab])+TITLES[tab]+'</h1>'+(PARENT[tab]?'<button class="ib" data-a="goback" data-v="'+PARENT[tab]+'" aria-label="رجوع">'+ic('chev')+'</button>':'<span></span>')}
  tabs.hidden=(tab==='reader');app.style.paddingBottom=(tab==='reader'?'16px':'');document.body.classList.toggle('rd',tab==='reader');document.body.classList.toggle('rdi',tab==='reader'&&mpImm());document.body.classList.toggle('orn',tab==='reader'&&!!window.MUSHAF&&S.quran.pg===undefined||tab==='reader'&&S.quran.pg==='ornate');
  tabs.innerHTML=NAV.map(function(t){return '<button class="tab'+(par===t[0]?' on':'')+'" data-a="tab" data-v="'+t[0]+'"><span class="pill">'+ic(t[2])+'</span>'+t[1]+'</button>'}).join('');
  var v={home:vHome,worship:vWorship,calendar:vCal,progress:vProgress,more:vMore,fasting:vFasting,prayers:vPrayers,quran:vQuran,reader:vReader,reminders:vReminders,books:vBooks,chal:vChal,month:vMonth,sacred:vSacred,muh:vMuh,floatfeed:vFloatFeed,floatset:vFloatSet,widgetset:vWidgetSet,habits:vHabits,boost:vBoost,ach:vAch,developer:vDeveloper,settings:vSettings,qada:vQada,ramadan:vRamadan,occasions:vOccasions,cards:vCards,hifz:vHifz,khushu:vKhushu,khatma:vKhatma,weekly:vWeekly,notes:vNotes,zakat:vZakat,backup:vBackup,msb:vMsb,asma:vAsma,hisn:vHisn,ahadith:vAhadith,ptloc:vPtLoc}[tab];
  if(tab==='reminders'&&lastTab!=='reminders'&&typeof window.alsaerRemindersEnter==='function')window.alsaerRemindersEnter();
  var vh;try{if(typeof v!=='function')throw new Error('شاشة غير معروفة: '+tab);vh=v()}catch(ex){vh=vRenderFail(ex,tab)}
  app.innerHTML=vh;
  if(typeof gdMountDialog==='function')gdMountDialog();
  if(tab!==lastTab){
    if(lastTab!==null&&!popping){
      if(navTrail[navTrail.length-1]!==tab)navTrail.push(tab);
      if(backHistoryReady)history.pushState({alsaerStep:navTrail.length},'',location.href);
    }
    lastTab=tab;app.classList.remove('vin');void app.offsetWidth;app.classList.add('vin')
  }
  if(pressKey){var pe=document.querySelector(pressKey);pressKey=null;if(pe){pe.classList.add('pressed');setTimeout(function(){pe&&pe.classList.remove('pressed')},460);
    if(document.documentElement.getAttribute('data-press')==='ripple'&&pressXY&&pressXY[0]!==undefined){var bb=pe.getBoundingClientRect(),sz=Math.max(bb.width,bb.height)*2,rp=document.createElement('span');rp.className='rip';rp.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(pressXY[0]-bb.left-sz/2)+'px;top:'+(pressXY[1]-bb.top-sz/2)+'px';pe.classList.add('rp-clip');pe.appendChild(rp);setTimeout(function(){rp.remove()},480)}}}
  if(lang()!=='ar'){trWalk(app);trWalk(top);trWalk(tabs)}
  /* A transformed view animation must not become the fixed controls' viewport. */
  var readerOverlay=document.getElementById('rd-ov');if(readerOverlay)document.body.appendChild(readerOverlay);
  if(tab==='reader'){fitSoon();if(tab==='reader')setTimeout(mpiAskMaybe,350)}else if(typeof mpCloseOverlays==='function'){var kw=document.getElementById('mps-wrap');if(!(kw&&kw.dataset.keep===tab))mpCloseOverlays()}
  renderFirstUpdateNotice();tourAuto();trkFix();qfabSync();
  /* Apply synchronously after every render; MutationObserver remains for later timer/dialog changes. */
  if(typeof digitsApply==='function')digitsApply(false);
}
function stopTimer(){clearInterval(tmr);tmr=null;secs=null;timerDeadline=0}
function startTimerTick(){clearInterval(tmr);if(!timerDeadline)return;secs=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));if(secs<=0){stopTimer();render();toast('انتهت الدقائق الخمس، ثبّتك الله');return}var el=document.getElementById('timer');if(el)el.textContent=digitsConv(fmt(secs),U().digits==='west');if(document.visibilityState==='hidden')return;tmr=setInterval(function(){if(document.visibilityState==='hidden'){clearInterval(tmr);tmr=null;return}secs=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));var node=document.getElementById('timer');if(node)node.textContent=digitsConv(fmt(secs),U().digits==='west');if(secs<=0){stopTimer();render();toast('انتهت الدقائق الخمس، ثبّتك الله')}},1000)}
var alsaerWasBackgrounded=false;
var bgAt=0;
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='hidden'){
    alsaerWasBackgrounded=true;bgAt=Date.now();
    clearInterval(tmr);tmr=null;
  }else{
    if(timerDeadline)startTimerTick();
    if(alsaerWasBackgrounded){
      alsaerWasBackgrounded=false;
      if(S.pin&&unlocked&&Date.now()-bgAt>((S.lockDelay>=0&&S.lockDelay!=null)?S.lockDelay*1000:30000)){unlocked=false;bioPrompted=false;msg='';render();return}
      dailyCardContent=null;refreshDailyCardFromApi();
      if(tab==='home'&&unlocked&&!splash&&!covered)render();
    }
  }
});

document.addEventListener('change',function(e){
  if(e.target&&e.target.name==='ob-gender'){
    obGender=e.target.value;
    document.querySelectorAll('.ob-gender').forEach(function(x){x.classList.toggle('selected',!!x.querySelector('input:checked'))});
  }
});
document.addEventListener('change',function(e){
  var t=e.target,k=t&&t.dataset&&t.dataset.loc;if(!k)return;
  S.loc=S.loc||{};
  if(k==='city'){var c=CITIES[parseInt(t.value,10)];if(c){delete S.loc.gps;S.loc.city=c[0];S.loc.lat=c[1];S.loc.lng=c[2];if(S.loc.auto===undefined)S.loc.auto=true;if(S.loc.auto)autoPtimes()}}
  else if(k==='method'){S.loc.method=t.value}
  else if(k==='clk'){setClockMode(t.value)}
  else if(k==='asr'){S.loc.asr=parseInt(t.value,10)===2?2:1}
  else if(k==='auto'){S.loc.auto=!!t.checked;if(S.loc.auto)autoPtimes()}
  save();compassStop();render();
});
document.addEventListener('input',function(e){if(e.target.id==='note')draft=e.target.value});
document.addEventListener('input',function(e){if(e.target&&e.target.id==='secnew'&&secMethod==='password'){var sc=pwScore(e.target.value),m=document.getElementById('pwmeter'),t=document.getElementById('pwtxt');if(m){m.className='pw-meter s'+sc}if(t)t.textContent=e.target.value?['ضعيفة جدًا','ضعيفة','مقبولة','جيدة','قوية'][sc]:'قوة كلمة المرور'}});
document.addEventListener('change',function(e){var sk=e.target&&e.target.dataset&&e.target.dataset.sec;if(sk==='privName'){if(e.target.checked)S.privName=1;else delete S.privName;save();render();return}});
document.addEventListener('change',function(e){var h=e.target&&e.target.dataset&&e.target.dataset.hide;if(h){S.homeHide=S.homeHide||{};if(e.target.checked)delete S.homeHide[h];else S.homeHide[h]=1;save();render()}});
document.addEventListener('change',function(e){
  var id=e.target.dataset&&e.target.dataset.pt;
  if(id&&PR.some(function(p){return p[0]===id})){var v=e.target.value;if(/^\d{2}:\d{2}$/.test(v)||v===''){if(v)S.ptimes[id]=v;else delete S.ptimes[id];save()}}
});
document.addEventListener('change',function(e){
  if(e.target&&e.target.id==='suhoor-time'){S.fasting.reminders.suhoorTime=e.target.value;save()}
  if(e.target&&e.target.id==='iftar-time'){S.fasting.reminders.iftarTime=e.target.value;save()}
});
