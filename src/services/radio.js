/* راديو قرآن: بث مباشر لقائمة إذاعات التقوى (Altaqwaa). البيانات في radio-stations.js تُحمَّل عند الحاجة. */
var rdoS={cat:'',q:'',ok:false,a:null,id:0,st:''};
var RDO_CATS=['إذاعات القراء','منوعات إسلامية','تفسير وعلوم القرآن','إذاعات رسمية','أحاديث وسيرة','أذكار ورقية'];
function rdoT(t){try{var r=typeof trS==='function'?trS(t):null;return r===null||r===undefined?t:r}catch(e){return t}}
function rdoEsc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rdoNorm(t){return String(t).normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase()}
function rdoEnsure(cb){
  if(window.RDO){rdoS.ok=true;cb();return}
  var sc=document.createElement('script');sc.src='radio-stations.js';
  sc.onload=function(){rdoS.ok=true;cb()};sc.onerror=function(){rdoS.ok=false;try{toast('تعذّر تحميل قائمة الإذاعات')}catch(e){}};
  document.head.appendChild(sc)}
function rdoRows(){
  var n=rdoNorm(rdoS.q).trim(),h='';
  window.RDO.forEach(function(r){
    if(rdoS.cat&&r[3]!==rdoS.cat)return;
    if(n&&rdoNorm(r[1]).indexOf(n)<0)return;
    var on=rdoS.id===r[0];
    h+='<button class="card rdo-row'+(on?' on':'')+'" data-a="rdoplay" data-v="'+r[0]+'"><span class="rdo-n keepar">'+rdoEsc(r[1])+'</span><small>'+rdoEsc(r[3])+'</small><i class="rdo-ic">'+(on?(rdoS.st==='load'?'…':'⏸'):'▶')+'</i></button>'});
  return h||'<p class="note">لا نتائج</p>'}
function vRadio(){
  var h='<div class="rdo">';
  if(!window.RDO){rdoEnsure(function(){if(typeof render==='function')render()});return h+'<p class="note" style="text-align:center">جارٍ التحميل…</p></div>'}
  h+='<section class="card rdo-hero"><b>راديو قرآن</b><span>بث مباشر للقرآن الكريم والبرامج الإسلامية</span></section>';
  h+='<div class="rdo-chips"><button class="'+(rdoS.cat?'':'on')+'" data-a="rdocat" data-v="">الكل</button>'+RDO_CATS.map(function(c){return '<button class="'+(rdoS.cat===c?'on':'')+'" data-a="rdocat" data-v="'+c+'">'+c+'</button>'}).join('')+'</div>';
  h+='<input type="search" id="rdo-q" class="rm-sel" placeholder="ابحث عن إذاعة" value="'+rdoEsc(rdoS.q)+'" autocomplete="off">';
  h+='<div id="rdo-l">'+rdoRows()+'</div>';
  h+='<p class="note rdo-src">قائمة الإذاعات من تطبيق التقوى (Altaqwaa). البث يحتاج اتصالًا بالإنترنت.</p></div>';
  return h}
function rdoStop(){if(rdoS.a){try{rdoS.a.pause();rdoS.a.removeAttribute('src');rdoS.a.load()}catch(e){}rdoS.a=null}rdoS.id=0;rdoS.st=''}
function rdoRefresh(){var l=document.getElementById('rdo-l');if(l&&window.RDO)l.innerHTML=rdoRows()}
function rdoAct(a,v){
  if(a==='rdocat'){rdoS.cat=v;if(typeof render==='function')render();return false}
  if(a==='rdoplay'){var id=+v;if(rdoS.id===id){rdoStop();rdoRefresh();return false}
    var r=window.RDO.filter(function(x){return x[0]===id})[0];if(!r)return false;
    rdoStop();try{if(typeof mqAuStop==='function')mqAuStop()}catch(e){}try{if(typeof hsnAuStop==='function')hsnAuStop()}catch(e){}
    var A=new Audio();rdoS.a=A;rdoS.id=id;rdoS.st='load';A.preload='none';A.src=r[2];
    A.onplaying=function(){if(rdoS.a===A){rdoS.st='play';rdoRefresh()}};
    var bad=function(){if(rdoS.a===A){rdoStop();rdoRefresh();toast('تعذّر تشغيل البث. تحتاج الميزة إلى اتصال بالإنترنت')}};
    A.onerror=bad;var pr=A.play();if(pr&&pr.catch)pr.catch(bad);rdoRefresh();return false}
  return true}
(function(){var tm;document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='rdo-q'){var val=e.target.value;clearTimeout(tm);tm=setTimeout(function(){rdoS.q=val;rdoRefresh()},150)}})})();
