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
setTimeout(function(){splash=false;render();checkNew();try{var _w=Math.round(performance.now()),_t=-1;if(window.AlsaerNative&&AlsaerNative.bootDone)_t=AlsaerNative.bootDone(_w);window.__alsaerBoot={webMs:_w,totalMs:typeof _t==='number'?_t:-1}}catch(e){}},window.__NOSPLASH?0:1000);
setTimeout(function(){try{(window.requestIdleCallback||function(f){setTimeout(f,300)})(function(){loadHeavy()})}catch(e){}},window.__NOSPLASH?1500:6000);
(function(){var x0=null,y0=null;
  document.addEventListener('touchstart',function(e){var m=e.target.closest&&e.target.closest('#mp');if(m&&e.touches.length===1){x0=e.touches[0].clientX;y0=e.touches[0].clientY}else x0=null},{passive:true});
  document.addEventListener('touchend',function(e){if(x0===null)return;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6){var b=document.querySelector('.rbar [data-a=qpage][data-v="'+(dx>0?'1':'-1')+'"]');if(b&&!b.disabled)b.click()}},{passive:true});
  window.addEventListener('resize',fitSoon);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitSoon);if(document.fonts)document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',fitSoon);
})();

/* === ALSAER DAILY REMINDERS PATCH 1 === */
