/* ===== ترتيب الرئيسية على طريقة آيفون: ضغطة مطوّلة ← اهتزاز، سحب للترتيب، (−) للإخفاء ===== */
var homeEdit=false;
var HOME_BLK=[['daily','كل يوم بداية جديدة','sparkles'],['timeb','ذكر هذا الوقت','clock'],['tiles','الكهف والملك والأذكار','book'],['worship','عباداتي اليوم','mosque'],['progress','تقدّم اليوم','chart'],['nav','الأقسام السريعة','menu'],['journey','رحلة الثبات','flag'],['tracker','تسجيل اليوم','target']];
function homeOrder(){
  var def=HOME_BLK.map(function(x){return x[0]}),o=Array.isArray(S.homeOrd)?S.homeOrd.filter(function(k){return def.indexOf(k)>=0}):[];
  def.forEach(function(k){if(o.indexOf(k)<0)o.push(k)});
  return o.filter(function(k,i){return o.indexOf(k)===i});
}
function heGrid(){
  var ord=homeOrder(),M={};HOME_BLK.forEach(function(x){M[x[0]]=x});
  return '<div class="he-bar"><div><b>ترتيب الرئيسية</b><small>اسحب الأيقونة لتغيير مكانها · (−) للإخفاء · (+) للإظهار</small></div><button class="btn" data-a="hedone">تم</button></div>'
   +'<div class="he-grid" id="he-grid">'+ord.map(function(k){var off=hidH(k);return '<div class="he-t'+(off?' off':'')+'" data-hk="'+k+'"><button class="he-b" data-a="hetog" data-v="'+k+'" aria-label="'+(off?'إظهار':'إخفاء')+'">'+(off?'+':'−')+'</button><span class="he-i">'+ic(M[k][2])+'</span><b>'+M[k][1]+'</b></div>'}).join('')+'</div>'
   +'<button class="btn ghost block he-reset" data-a="hereset">استعادة الترتيب الافتراضي</button>';
}
function heAct(a,v){
  if(a==='hedone'){homeEdit=false;return true}
  if(a==='hetog'){S.homeHide=S.homeHide||{};if(S.homeHide[v])delete S.homeHide[v];else S.homeHide[v]=1;save();return true}
  if(a==='hereset'){delete S.homeOrd;S.homeHide={};save();return true}
  return false;
}
function heEnter(){if(homeEdit)return;homeEdit=true;try{navigator.vibrate&&navigator.vibrate(25)}catch(e){}render();try{window.scrollTo(0,0)}catch(e){}}
(function(){
  var lp=null,swallow=false,hd=null,clone=null;
  /* ضغطة مطوّلة على أي بطاقة بالرئيسية تدخل وضع الترتيب */
  document.addEventListener('pointerdown',function(e){
    if(tab!=='home'||homeEdit||e.button>0)return;
    var s=e.target.closest&&e.target.closest('.hs');if(!s||e.target.closest('input,textarea,select'))return;
    var x=e.clientX,y=e.clientY;clearTimeout(lp);
    lp=setTimeout(function(){lp=null;swallow=true;document.addEventListener('pointerup',function f(){document.removeEventListener('pointerup',f);setTimeout(function(){swallow=false},350)});heEnter()},550);
    lp.x=x;lp.y=y;
    var mv=function(ev){if(Math.hypot(ev.clientX-x,ev.clientY-y)>10){clearTimeout(lp);cl()}};
    var up=function(){clearTimeout(lp);cl()};
    function cl(){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up)}
    document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
  });
  document.addEventListener('click',function(e){if(swallow){swallow=false;e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('contextmenu',function(e){if(e.target.closest&&e.target.closest('.hs,.he-t'))e.preventDefault()});
  /* سحب الأيقونات لإعادة الترتيب */
  document.addEventListener('pointerdown',function(e){
    if(!homeEdit)return;var el=e.target.closest&&e.target.closest('.he-t');if(!el||e.target.closest('.he-b'))return;
    hd={el:el,id:e.pointerId,sx:e.clientX,sy:e.clientY,r:el.getBoundingClientRect(),on:false};
  });
  document.addEventListener('pointermove',function(e){
    if(!hd||e.pointerId!==hd.id)return;var dx=e.clientX-hd.sx,dy=e.clientY-hd.sy;
    if(!hd.on){if(Math.hypot(dx,dy)<6)return;hd.on=true;
      clone=hd.el.cloneNode(true);clone.classList.add('he-clone');clone.style.cssText='left:'+hd.r.left+'px;top:'+hd.r.top+'px;width:'+hd.r.width+'px;height:'+hd.r.height+'px';
      document.body.appendChild(clone);hd.el.classList.add('ph');try{navigator.vibrate&&navigator.vibrate(12)}catch(x){}}
    clone.style.transform='translate('+dx+'px,'+dy+'px) scale(1.07)';
    var cx=hd.r.left+hd.r.width/2+dx,cy=hd.r.top+hd.r.height/2+dy,g=document.getElementById('he-grid');if(!g)return;
    var ts=g.querySelectorAll('.he-t');
    for(var i=0;i<ts.length;i++){var t=ts[i];if(t===hd.el)continue;var r=t.getBoundingClientRect();
      if(cx>r.left&&cx<r.right&&cy>r.top&&cy<r.bottom){var kids=[].slice.call(g.children);g.insertBefore(hd.el,kids.indexOf(t)>kids.indexOf(hd.el)?t.nextSibling:t);break}}
  });
  function end(){
    if(!hd)return;var was=hd.on;
    if(clone){clone.remove();clone=null}hd.el.classList.remove('ph');
    if(was){var g=document.getElementById('he-grid');if(g){S.homeOrd=[].map.call(g.querySelectorAll('.he-t'),function(t){return t.getAttribute('data-hk')});save()}}
    hd=null;
  }
  document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
})();
