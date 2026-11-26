(function(){var acts=["evlog","hab","pray","settarget","qdone"],lastTabY=0,rdBar=null;
  document.addEventListener('touchend',function(e){
    var b=e.target.closest&&e.target.closest('[data-a]');
    if(b&&acts.indexOf(b.getAttribute('data-a'))>=0)alsaerHap();
  },{passive:true});
  /* تفضيل شريط القراءة العائم: يعتم عند التمرير للأمام ويظهر عند الرجوع */
  window.addEventListener('scroll',function(){
    if(tab!=='reader')return;
    var y=window.scrollY||0;
    if(!rdBar||!rdBar.isConnected)rdBar=document.querySelector('.rbar');
    if(!rdBar)return;
    if(y>lastTabY+30&&y>130)rdBar.classList.add('rdim');
    else if(y<lastTabY-12)rdBar.classList.remove('rdim');
    if(y<130)rdBar.classList.remove('rdim');
    lastTabY=y;
  },{passive:true});
  document.addEventListener('touchstart',function(){
    if(tab==='reader'&&rdBar&&rdBar.isConnected)rdBar.classList.remove('rdim');
  },{passive:true});
})();
(function(){var _r=render;render=function(){var x=_r.apply(this,arguments);try{femizeDom(document.getElementById('app'));femizeDom(document.getElementById('top'))}catch(e){}return x}})();
(function(){var _t=toast;toast=function(t){return _t(isFem()?femStr(t):t)}})();
render();
/* تسخين أثناء الشعار الثابت: أول استدعاء لمنسّق التاريخ الهجري (Intl) مكلف، فنبنيه قبل انتهاء الشعار لا عنده */
setTimeout(function(){try{hijriNumeric(new Date())}catch(e){}},350);
setTimeout(function(){splash=false;render();checkNew();try{var _w=Math.round(performance.now()),_t=-1;if(window.AlsaerNative&&AlsaerNative.bootDone)_t=AlsaerNative.bootDone(_w);window.__alsaerBoot={webMs:_w,totalMs:typeof _t==='number'?_t:-1}}catch(e){}},window.__NOSPLASH?0:Math.max(0,300-Math.round(performance.now())));
setTimeout(function(){try{(window.requestIdleCallback||function(f){setTimeout(f,300)})(function(){loadHeavy()})}catch(e){}},window.__NOSPLASH?1500:6000);
(function(){
  window.addEventListener('resize',fitSoon);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitSoon);if(document.fonts)document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',fitSoon);
})();

/* === ALSAER DAILY REMINDERS PATCH 1 === */
