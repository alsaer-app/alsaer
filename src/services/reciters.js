/* استمع لقارئ: بث سور كاملة من سيرفرات mp3quran.net لقائمة القراء المأخوذة من تطبيق التقوى (Altaqwaa). البيانات في reciters.js تُحمَّل عند الحاجة. */
var rctS={q:'',sq:'',rw:'',sel:0,a:null,sura:0,st:''};
var RCT_RW=['حفص عن عاصم','قالون عن نافع','ورش عن نافع'];
function rctT(t){try{var r=typeof trS==='function'?trS(t):null;return r===null||r===undefined?t:r}catch(e){return t}}
function rctEsc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rctNorm(t){return String(t).normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase()}
function rctEnsure(cb){
  if(window.RCT){cb();return}
  var sc=document.createElement('script');sc.src='reciters.js';
  sc.onload=function(){cb()};sc.onerror=function(){try{toast(netMsg('تعذّر تحميل قائمة القراء'))}catch(e){}};
  document.head.appendChild(sc)}
function rctGet(id){return (window.RCT||[]).filter(function(x){return x[0]===id})[0]}
function rctRows(){
  var n=rctNorm(rctS.q).trim(),h='';
  window.RCT.forEach(function(r){
    if(rctS.rw==='other'?RCT_RW.indexOf(r[2])>=0:(rctS.rw&&r[2]!==rctS.rw))return;
    if(n&&rctNorm(r[1]).indexOf(n)<0)return;
    h+='<button class="card rdo-row" data-a="rctopen" data-v="'+r[0]+'"><span class="rdo-n keepar">'+rctEsc(r[1])+'</span><small class="keepar">'+rctEsc(r[2])+'</small><i class="rdo-ic">‹</i></button>'});
  return h||'<p class="note">لا نتائج</p>'}
function rctSuras(){
  var r=rctGet(rctS.sel),N=(typeof QD==='function'?QD().n:[])||[],q=rctNorm(rctS.sq).trim(),h='';
  for(var i=1;i<=114;i++){
    var nm=N[i-1]||('سورة '+i);
    if(q&&rctNorm(nm).indexOf(q)<0&&String(i)!==q)continue;
    var on=rctS.sura===i;
    h+='<button class="card rdo-row rct-s'+(on?' on':'')+'" data-a="rctplay" data-v="'+i+'"><span class="rdo-n keepar"><bdi class="rct-no">'+i+'</bdi> '+rctEsc(nm)+'</span><i class="rdo-ic">'+(on?(rctS.st==='load'?'…':'⏸'):'▶')+'</i></button>'}
  return h||'<p class="note">لا نتائج</p>'}
function vReciters(){
  var h='<div class="rdo">';
  if(!window.RCT){rctEnsure(function(){if(typeof render==='function')render()});return h+'<p class="note" style="text-align:center">جارٍ التحميل…</p></div>'}
  var r=rctS.sel?rctGet(rctS.sel):null;
  if(r){
    h+='<button class="rdo-back" data-a="rctback">→ القراء</button>';
    h+='<section class="card rdo-hero"><b class="keepar">'+rctEsc(r[1])+'</b><span class="keepar">'+rctEsc(r[2])+'</span></section>';
    h+='<input type="search" id="rct-sq" class="rm-sel" placeholder="ابحث عن سورة" value="'+rctEsc(rctS.sq)+'" autocomplete="off">';
    h+='<div id="rct-l">'+rctSuras()+'</div>';
  }else{
    h+='<section class="card rdo-hero"><b>استمع لقارئ</b><span>سور القرآن كاملة بأصوات القراء</span></section>';
    h+='<div class="rdo-chips"><button class="'+(rctS.rw?'':'on')+'" data-a="rctrw" data-v="">الكل</button>'+RCT_RW.map(function(c){return '<button class="keepar '+(rctS.rw===c?'on':'')+'" data-a="rctrw" data-v="'+c+'">'+c+'</button>'}).join('')+'<button class="'+(rctS.rw==='other'?'on':'')+'" data-a="rctrw" data-v="other">روايات أخرى</button></div>';
    h+='<input type="search" id="rct-q" class="rm-sel" placeholder="ابحث عن قارئ" value="'+rctEsc(rctS.q)+'" autocomplete="off">';
    h+='<div id="rct-l">'+rctRows()+'</div>';
  }
  h+='<p class="note rdo-src">قائمة القراء من تطبيق التقوى (Altaqwaa)، والصوت من mp3quran.net. يحتاج اتصالًا بالإنترنت.</p></div>';
  return h}
function rctStop(){if(rctS.a){try{rctS.a.pause();rctS.a.removeAttribute('src');rctS.a.load()}catch(e){}rctS.a=null}rctS.sura=0;rctS.st=''}
function rctRefresh(){var l=document.getElementById('rct-l');if(l&&window.RCT)l.innerHTML=rctS.sel?rctSuras():rctRows()}
function rctPlay(i){
  var r=rctGet(rctS.sel);if(!r)return;
  rctStop();try{if(typeof rdoStop==='function')rdoStop()}catch(e){}try{if(typeof mqAuStop==='function')mqAuStop()}catch(e){}try{if(typeof hsnAuStop==='function')hsnAuStop()}catch(e){}
  var A=new Audio();rctS.a=A;rctS.sura=i;rctS.st='load';A.preload='none';A.src=r[3]+'/'+('00'+i).slice(-3)+'.mp3';
  A.onplaying=function(){if(rctS.a===A){rctS.st='play';rctRefresh()}};
  A.onended=function(){if(rctS.a===A){var nx=i<114?i+1:0;if(nx)rctPlay(nx);else{rctStop();rctRefresh()}}};
  var bad=function(){if(rctS.a===A){rctStop();rctRefresh();toast(netMsg('تعذّر تشغيل السورة. تحتاج الميزة إلى اتصال بالإنترنت'))}};
  A.onerror=bad;var pr=A.play();if(pr&&pr.catch)pr.catch(bad);rctRefresh()}
function rctAct(a,v){
  if(a==='rctrw'){rctS.rw=v;if(typeof render==='function')render();return false}
  if(a==='rctopen'){rctS.sel=+v;rctS.sq='';rctStop();if(typeof render==='function')render();return false}
  if(a==='rctback'){rctS.sel=0;rctS.sq='';rctStop();if(typeof render==='function')render();return false}
  if(a==='rctplay'){var i=+v;if(rctS.sura===i){rctStop();rctRefresh();return false}rctPlay(i);return false}
  return true}
(function(){var tm;document.addEventListener('input',function(e){
  var t=e.target;if(!t)return;
  if(t.id==='rct-q'||t.id==='rct-sq'){var val=t.value,id=t.id;clearTimeout(tm);tm=setTimeout(function(){if(id==='rct-q')rctS.q=val;else rctS.sq=val;rctRefresh()},150)}})})();
