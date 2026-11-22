function toast(t){if(lang()!=='ar'){var tt=trS(t);if(tt!==null)t=tt}toastEl.textContent=t;toastEl.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){toastEl.hidden=true},3500)}
function checkNew(){
  S.seen=S.seen||[];var fresh=achievements().filter(function(a){return a.done&&S.seen.indexOf(a.id)<0});
  if(fresh.length){fresh.forEach(function(a){S.seen.push(a.id)});save();toast('إنجاز جديد: '+fresh[0].title+(fresh.length>1?' (+'+(fresh.length-1)+')':''))}
}
function quote(q){return '<p>'+esc(q.t)+'</p>'+(q.s?'<small>'+esc(q.s)+'</small>':'')}
function dateLabel(){try{return new Date().toLocaleDateString('ar-EG',{weekday:'long'})}catch(e){return ''}}
function trigCounts(){
  var c={},r={},tot=0;
  Object.keys(S.days).forEach(function(k){var d=S.days[k];(d.trig||[]).forEach(function(t){c[t]=(c[t]||0)+1;if(d.status==='relapse')r[t]=(r[t]||0)+1;tot++})});
  return{c:c,r:r,tot:tot};
}
function topTrig(){
  var x=trigCounts(),best=null;
  TRIG.forEach(function(t){if(x.c[t[0]]&&(!best||x.c[t[0]]>x.c[best]))best=t[0]});
  return best;
}

var APP_VERSION='1.0.13',APP_BUILD=10145,COPY='';
try{if(window.AlsaerNative&&typeof AlsaerNative.appBuildInfo==='function'){var bi=AlsaerNative.appBuildInfo().split('|');if(bi.length===2&&parseInt(bi[1],10)>0){APP_VERSION=bi[0];APP_BUILD=parseInt(bi[1],10)}}}catch(e){}
function devBtn(){
  var ch=ic('chev').replace('class="i"','class="i dev-chev"');
  return '<button class="dev-btn" data-a="tab" data-v="developer" aria-label="مطوّر السائر إلى الله — Dr. Ahmed Elagamy"><span class="dev-av"><i>Æ</i></span><span class="dev-tx"><span class="dev-role">مطوّر السائر إلى الله · Developer</span><b>أحمد العجمي</b><span class="dev-en">Dr. Ahmed Elagamy</span><span class="dev-free">'+ic('check')+'تطبيق السائر إلى الله مجاني بالكامل · Completely free</span></span><span class="dev-side"><span class="dev-ver">v'+APP_VERSION+'</span>'+ch+'</span></button>'}

/* ---------- views ---------- */
