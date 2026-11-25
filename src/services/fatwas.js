/* فتاوى ابن باز رحمه الله: نصوص من الموقع الرسمي binbaz.org.sa (قائمتها من تطبيق التقوى). البيانات في www/fatwas/ تُحمَّل عند الحاجة: index.js (الفئات)، f###.js (الفتاوى، 150 في كل شريحة)، search.js (العناوين للبحث). */
var ftS={view:'cats',cat:'',q:'',id:0,lim:60};
function ftEsc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ftNorm(t){return String(t).normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase()}
var FT_REMOTE='https://raw.githubusercontent.com/alsaer-app/alsaer/exp/drive-account-recovery/www/fatwas/',FT_CACHE='alsaer-fatwas';
function ftJson(name,opt,cb){
  /* الترتيب: ذاكرة Cache API ثم الشبكة (وتُحفظ) ثم الملف المحلي (للتطوير فقط) */
  var url=FT_REMOTE+name,C=window.caches;
  var net=function(){fetch(url,opt.fresh?{cache:'no-store'}:{}).then(function(r){if(!r.ok)throw 0;var c=r.clone();return r.json().then(function(j){if(C)C.open(FT_CACHE).then(function(ch){ch.put(url,c)}).catch(function(){});cb(j)})}).catch(function(){
    fetch('fatwas/'+name).then(function(r){if(!r.ok)throw 0;return r.json()}).then(cb,function(){cb(null)})})};
  if(C&&!opt.fresh)C.open(FT_CACHE).then(function(ch){return ch.match(url)}).then(function(m){if(m)m.json().then(cb,net);else net()},net);else net()}
function ftIdx(cb){
  if(window.FTI){cb(true);return}
  var now=Date.now(),last=+localStorage.getItem('ftw_chk')||0,fresh=now-last>864e5;
  ftJson('index.json',{fresh:fresh},function(j){
    if(!j){cb(false);return}
    var ov=localStorage.getItem('ftw_v');
    if(fresh){localStorage.setItem('ftw_chk',String(now));
      if(ov&&ov!==j.v&&window.caches){window.caches.delete(FT_CACHE).then(function(){window.caches.open(FT_CACHE).then(function(ch){ch.put(FT_REMOTE+'index.json',new Response(JSON.stringify(j)))})}).catch(function(){})}}
    localStorage.setItem('ftw_v',j.v);window.FTI=j;cb(true)})}
function ftChunk(n,cb){window.FTW=window.FTW||{};if(window.FTW[n]){cb(true);return}ftJson('f'+('00'+n).slice(-3)+'.json',{},function(j){if(!j){cb(false);return}window.FTW[n]=j;cb(true)})}
function ftGet(id){var n=Math.floor((id-1)/window.FTI.per),c=window.FTW&&window.FTW[n];if(!c)return null;for(var i=0;i<c.length;i++)if(c[i][0]===id)return c[i];return null}
function ftCat(name){var c=window.FTI.cats;for(var i=0;i<c.length;i++)if(c[i][0]===name)return c[i];return null}
function ftBack(){return '<button class="rdo-back" data-a="ftwback">→ '+(ftS.view==='detail'&&ftS.cat?'القائمة':'الفئات')+'</button>'}
function ftCats(q){
  var n=ftNorm(q).trim(),h='';
  window.FTI.cats.forEach(function(c){if(n&&ftNorm(c[0]).indexOf(n)<0)return;
    h+='<button class="card rdo-row rct-s" data-a="ftwcat" data-v="'+ftEsc(c[0])+'"><span class="rdo-n keepar">'+ftEsc(c[0])+'</span><i class="rdo-ic ftw-n">'+c[1].length+'</i></button>'});
  return h}
function ftTitles(ids){
  var h='',lim=ftS.lim;
  ids.slice(0,lim).forEach(function(id){var t=(window.FTT&&window.FTT[id])||'';h+='<button class="card rdo-row rct-s" data-a="ftwopen" data-v="'+id+'"><span class="rdo-n keepar">'+ftEsc(t)+'</span><i class="rdo-ic">‹</i></button>'});
  if(ids.length>lim)h+='<button class="btn ghost ftw-more" data-a="ftwmore">عرض المزيد</button>';
  return h||'<p class="note">لا نتائج</p>'}
function ftTitleMap(cb){if(window.FTT){cb();return}
  var done=function(){var m={};(window.FTS||[]).forEach(function(r){m[r[0]]=r[1]});window.FTT=m;cb()};
  if(window.FTS){done();return}ftJson('search.json',{},function(j){var ok=!!j;if(j)window.FTS=j;if(!ok){try{toast('تعذّر تحميل فهرس الفتاوى')}catch(e){}return}done()})}
function vFatwas(){
  var h='<div class="rdo ftw">';
  if(!window.FTI){ftIdx(function(ok){if(!ok){try{toast('تعذّر تحميل الفتاوى')}catch(e){}return}if(typeof render==='function')render()});return h+'<p class="note" style="text-align:center">جارٍ التحميل…</p></div>'}
  if(ftS.view==='detail'){
    var id=ftS.id,n=Math.floor((id-1)/window.FTI.per);
    var f=ftGet(id);
    if(!f){ftChunk(n,function(){if(typeof render==='function')render()});return h+ftBack()+'<p class="note" style="text-align:center">جارٍ التحميل…</p></div>'}
    h+=ftBack()+'<section class="card ftw-d"><b class="ftw-t keepar">'+ftEsc(f[1])+'</b>';
    h+='<div class="ftw-q keepar"><small>السؤال</small><p>'+ftEsc(f[2])+'</p></div>';
    h+='<div class="ftw-a keepar"><small>الجواب</small>'+f[3].split(/\n+/).map(function(p){return p.trim()?'<p>'+ftEsc(p)+'</p>':''}).join('')+'</div></section>';
    h+='<div class="ftw-act"><button class="btn ghost" data-a="ftwcopy" data-v="'+id+'">نسخ</button><button class="btn ghost" data-a="ftwshare" data-v="'+id+'">مشاركة</button><button class="btn ghost" data-a="ftwsrc" data-v="'+id+'">المصدر</button></div>';
    h+='<p class="note rdo-src">الفتوى من موقع الشيخ ابن باز الرسمي binbaz.org.sa (مؤسسة الشيخ عبد العزيز بن باز الخيرية).</p></div>';return h}
  if(ftS.view==='list'){
    var c=ftCat(ftS.cat);
    if(!c)return h+ftBack()+'<p class="note">لا نتائج</p></div>';
    if(!window.FTT){ftTitleMap(function(){if(typeof render==='function')render()});return h+ftBack()+'<p class="note" style="text-align:center">جارٍ التحميل…</p></div>'}
    h+=ftBack()+'<section class="card rdo-hero"><b class="keepar">'+ftEsc(c[0])+'</b><span>'+c[1].length+' فتوى</span></section><div id="ftw-l">'+ftTitles(c[1])+'</div>';
    return h+'</div>'}
  h+='<section class="card rdo-hero"><b>فتاوى ابن باز رحمه الله</b><span>فتاوى سماحة الشيخ عبد العزيز بن باز المكتوبة، حسب الموضوع</span></section>';
  h+='<input type="search" id="ftw-q" class="rm-sel" placeholder="ابحث في الفتاوى أو الفئات" value="'+ftEsc(ftS.q)+'" autocomplete="off">';
  h+='<div id="ftw-l">'+ftHome()+'</div>';
  h+='<p class="note rdo-src">النصوص من الموقع الرسمي للشيخ binbaz.org.sa (مؤسسة الشيخ عبد العزيز بن باز الخيرية)، وقائمتها من تطبيق التقوى (Altaqwaa).</p></div>';
  return h}
function ftHome(){
  var q=ftS.q.trim();if(!q)return ftCats('');
  if(!window.FTT){ftTitleMap(function(){ftRefresh()});return '<p class="note" style="text-align:center">جارٍ التحميل…</p>'}
  var n=ftNorm(q),hits=[],T=window.FTT;
  for(var k in T){if(ftNorm(T[k]).indexOf(n)>=0){hits.push(+k);if(hits.length>=ftS.lim)break}}
  var cs=ftCats(q);
  return (cs?'<small class="ftw-h">الفئات</small>'+cs:'')+(hits.length?'<small class="ftw-h">الفتاوى</small>'+ftTitles(hits):'')||'<p class="note">لا نتائج</p>'}
function ftRefresh(){var l=document.getElementById('ftw-l');if(l&&window.FTI)l.innerHTML=ftS.view==='cats'?ftHome():ftS.view==='list'?ftTitles(ftCat(ftS.cat)[1]):l.innerHTML}
function ftText(f){return f[1]+'\n\nالسؤال: '+f[2]+'\n\nالجواب: '+f[3]+'\n\nالمصدر: https://binbaz.org.sa/fatwas/'+f[4]}
function ftwAct(a,v){
  if(a==='ftwcat'){ftS.view='list';ftS.cat=v;ftS.lim=60;if(typeof render==='function')render();return false}
  if(a==='ftwopen'){ftS.id=+v;ftS.view='detail';if(typeof render==='function')render();return false}
  if(a==='ftwback'){if(ftS.view==='detail'&&ftS.cat)ftS.view='list';else{ftS.view='cats';ftS.cat=''}ftS.lim=60;if(typeof render==='function')render();return false}
  if(a==='ftwmore'){ftS.lim+=60;ftRefresh();return false}
  var f=window.FTI&&ftGet(+v);
  if(a==='ftwcopy'&&f){try{navigator.clipboard.writeText(ftText(f));toast('تم نسخ الفتوى')}catch(e){toast('تعذّر النسخ')}return false}
  if(a==='ftwshare'&&f){try{if(navigator.share){navigator.share({text:ftText(f)});return false}}catch(e){}try{navigator.clipboard.writeText(ftText(f));toast('تم نسخ الفتوى')}catch(e){toast('تعذّر النسخ')}return false}
  if(a==='ftwsrc'&&f){if(typeof cdOpenUrl==='function')cdOpenUrl('https://binbaz.org.sa/fatwas/'+f[4]);return false}
  return true}
(function(){var tm;document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='ftw-q'){var val=e.target.value;clearTimeout(tm);tm=setTimeout(function(){ftS.q=val;ftS.lim=60;ftRefresh()},200)}})})();
