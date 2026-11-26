/* فتاوى ابن باز رحمه الله: نصوص من الموقع الرسمي binbaz.org.sa (قائمتها من تطبيق التقوى). البيانات في www/fatwas/ تُحمَّل عند الحاجة: index.js (الفئات)، f###.js (الفتاوى، 150 في كل شريحة)، search.js (العناوين للبحث). */
var ftS={view:'cats',cat:'',q:'',id:0,lim:60,menu:0};
function ftEsc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ftNorm(t){return String(t).normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase()}
var FT_REMOTE='https://raw.githubusercontent.com/alsaer-app/alsaer/exp/drive-account-recovery/www/fatwas/',FT_CACHE='alsaer-fatwas';
/* بصمة sha256 لكل ملف تأتي من index.json (حقل h). أي ملف لا يطابق بصمته يُرفض ولا يُخزَّن (تلف أو تبديل أو تحميل ناقص). index.json نفسه هو الجذر: تثبيت الفرع/الوسم FT_REMOTE هو ما يحمي الجذر */
function ftSha(txt,cb){
  try{crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)).then(function(b){var a=new Uint8Array(b),s='',i;for(i=0;i<a.length;i++)s+=('0'+a[i].toString(16)).slice(-2);cb(s)},function(){cb('')})}catch(e){cb('')}
}
function ftVerified(name,txt,cb){
  var want=window.FTI&&FTI.h&&FTI.h[name];
  if(!want){cb(name==='index.json'||!(window.FTI&&FTI.h)?txt:null);return}
  ftSha(txt,function(h){cb(h===want?txt:null)})
}
function ftJson(name,opt,cb){
  /* الترتيب: ذاكرة Cache API ثم الشبكة (وتُحفظ) ثم الملف المحلي (للتطوير فقط). كل ملف غير index يُتحقق من بصمته قبل الاستعمال */
  var url=FT_REMOTE+name,C=window.caches;
  var parse=function(txt,ok,bad){ftVerified(name,txt,function(t){if(t===null){bad();return}try{ok(JSON.parse(t))}catch(e){bad()}})};
  var local=function(){fetch('fatwas/'+name).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){parse(t,cb,function(){cb(null)})},function(){cb(null)})};
  var net=function(){fetch(url,opt.fresh?{cache:'no-store'}:{}).then(function(r){if(!r.ok)throw 0;var c=r.clone();return r.text().then(function(t){parse(t,function(j){if(C)C.open(FT_CACHE).then(function(ch){ch.put(url,c)}).catch(function(){});cb(j)},local)})}).catch(local)};
  if(C&&!opt.fresh)C.open(FT_CACHE).then(function(ch){return ch.match(url)}).then(function(m){if(m)m.text().then(function(t){parse(t,cb,net)},net);else net()},net);else net()}
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

/* صوت الفتوى: بث مباشر من files.zadapps.info (مصدر الصوت موقع الشيخ binbaz.org.sa) مع تنزيل اختياري إلى ذاكرة الجهاز (Cache API)، ملف واحد في كل مرة، مع إعادة المحاولة والحذف. لا يُضمَّن أي صوت في التطبيق. المسار يأتي من حقل الفتوى السادس ويُتحقق منه قبل بناء الرابط */
var FT_AU='https://files.zadapps.info/binbaz.org.sa/',FT_ACACHE='alsaer-fatwa-audio';
var ftA={a:null,id:0,st:'',dl:0,pct:0,err:0,ctl:null,have:{},url:''};
function ftAuPath(f){var p=f&&f[5];return(typeof p==='string'&&p&&p.indexOf('..')<0&&!/[?#\\:]|^\//.test(p)&&/\.mp3$/i.test(p))?p:''}
function ftAuUrl(f){var p=ftAuPath(f);return p?FT_AU+p.split('/').map(function(x){try{x=decodeURIComponent(x)}catch(e){}return encodeURIComponent(x)}).join('/'):''}
function ftAuStop(){if(ftA.a){try{ftA.a.pause();ftA.a.removeAttribute('src');ftA.a.load()}catch(e){}ftA.a=null}if(ftA.url){try{URL.revokeObjectURL(ftA.url)}catch(e){}ftA.url=''}ftA.id=0;ftA.st=''}
function ftAuAbort(){if(ftA.ctl){try{ftA.ctl.abort()}catch(e){}ftA.ctl=null}ftA.dl=0;ftA.pct=0}
function ftAuHave(id,u){var C=window.caches;if(!C||!u){ftA.have[id]=false;return}C.open(FT_ACACHE).then(function(c){return c.match(u)}).then(function(m){ftA.have[id]=!!m;ftAuUi()},function(){ftA.have[id]=false})}
function ftAuUi(){var e=document.getElementById('ftw-au');if(e&&ftS.view==='detail'){var f=window.FTI&&ftGet(ftS.id);if(f)e.outerHTML=ftAuBar(f)}}
var FTI_={play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>',dl:'<svg viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>',x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',re:'<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 10-3 6.2M20 5v5h-5"/></svg>',more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',cp:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>',sh:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>',ext:'<svg viewBox="0 0 24 24"><path d="M10 14L21 3M21 3h-6M21 3v6M19 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6"/></svg>',tr:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>'};
function ftIb(a,v,ic,lb){return '<button class="ftw-ic" data-a="'+a+'" data-v="'+v+'" aria-label="'+lb+'">'+FTI_[ic]+'</button>'}
function ftAuBar(f){
  var u=ftAuUrl(f),id=f[0],h='<div id="ftw-au" class="ftw-au">';
  var more=ftIb('ftwmenu',id,'more','المزيد');
  if(u){
    var on=ftA.id===id,pl=on&&ftA.st==='play',ld=on&&ftA.st==='load',dl=ftA.dl===id,hv=ftA.have[id],er=ftA.err===id;
    h+='<div class="ftw-bar"><button class="ftw-p" data-a="ftwplay" data-v="'+id+'" aria-label="'+(pl?'إيقاف':'استماع')+'">'+(pl?FTI_.pause:FTI_.play)+'</button>';
    h+='<div class="ftw-tx">';
    if(dl)h+='<b>جارٍ التنزيل '+ftA.pct+'%</b><div class="ftw-pr"><i style="width:'+ftA.pct+'%"></i></div>';
    else if(er)h+='<b class="ftw-bad">تعذّر التنزيل</b><small>اضغط للمحاولة مرة أخرى</small>';
    else h+='<b>'+(pl?'قيد التشغيل':ld?'جارٍ التحميل…':'استماع إلى الفتوى')+'</b><small>'+(hv?'✓ محفوظ على الجهاز':'بث مباشر')+'</small>';
    h+='</div>';
    if(dl)h+=ftIb('ftwdlx',id,'x','إلغاء التنزيل');
    else if(er)h+=ftIb('ftwdl',id,'re','إعادة المحاولة');
    else if(!hv)h+=ftIb('ftwdl',id,'dl','تنزيل'+(ftA.dl?' (ينتظر انتهاء تنزيل آخر)':''));
    h+=more+'</div>'}
  else h+='<div class="ftw-bar ftw-bar0"><div class="ftw-tx"></div>'+more+'</div>';
  if(ftS.menu===id){
    h+='<div class="ftw-menu"><button data-a="ftwcopy" data-v="'+id+'">'+FTI_.cp+'نسخ الفتوى</button><button data-a="ftwshare" data-v="'+id+'">'+FTI_.sh+'مشاركة</button><button data-a="ftwsrc" data-v="'+id+'">'+FTI_.ext+'فتح في الموقع الرسمي</button>'+(u&&ftA.have[id]?'<button class="ftw-md" data-a="ftwdel" data-v="'+id+'">'+FTI_.tr+'حذف الصوت المحفوظ</button>':'')+'</div>'}
  return h+'</div>'}
function ftAuPlay(f){
  var id=f[0],u=ftAuUrl(f);if(!u)return;
  if(ftA.id===id){ftAuStop();ftAuUi();return}
  ftAuStop();try{if(typeof rdoStop==='function')rdoStop()}catch(e){}try{if(typeof mqAuStop==='function')mqAuStop()}catch(e){}try{if(typeof hsnAuStop==='function')hsnAuStop()}catch(e){}try{if(typeof rctStop==='function')rctStop()}catch(e){}
  var A=new Audio();ftA.a=A;ftA.id=id;ftA.st='load';A.preload='none';
  var go=function(src){if(ftA.a!==A)return;A.src=src;A.onplaying=function(){if(ftA.a===A){ftA.st='play';ftAuUi()}};A.onended=function(){if(ftA.a===A){ftAuStop();ftAuUi()}};var bad=function(){if(ftA.a===A){ftAuStop();ftAuUi();try{toast('تعذّر تشغيل الصوت. يحتاج اتصالًا بالإنترنت أو تنزيله مسبقًا')}catch(e){}}};A.onerror=bad;var pr=A.play();if(pr&&pr.catch)pr.catch(bad)};
  ftAuUi();
  var C=window.caches;
  if(C&&ftA.have[id])C.open(FT_ACACHE).then(function(c){return c.match(u)}).then(function(m){return m?m.blob():null}).then(function(b){if(b){ftA.url=URL.createObjectURL(b);go(ftA.url)}else{ftA.have[id]=false;go(u)}},function(){go(u)});
  else go(u)}
function ftAuDl(f){
  var id=f[0],u=ftAuUrl(f),C=window.caches;if(!u||ftA.dl)return;
  if(!C||typeof AbortController==='undefined'||!window.ReadableStream){try{toast('التنزيل غير مدعوم على هذا الجهاز')}catch(e){}return}
  ftA.dl=id;ftA.pct=0;ftA.err=0;var ctl=new AbortController();ftA.ctl=ctl;ftAuUi();
  var fail=function(){if(ftA.ctl===ctl){ftA.ctl=null;ftA.dl=0;ftA.pct=0;ftA.err=id;ftAuUi()}};
  fetch(u,{signal:ctl.signal}).then(function(r){
    if(!r.ok||!r.body)throw 0;var len=+r.headers.get('content-length')||0,rd=r.body.getReader(),parts=[],got=0;
    var pump=function(){return rd.read().then(function(x){
      if(x.done)return;parts.push(x.value);got+=x.value.length;if(len){var p=Math.min(99,Math.floor(got*100/len));if(p!==ftA.pct){ftA.pct=p;ftAuUi()}}return pump()})};
    return pump().then(function(){if(len&&got!==len)throw 0;return new Blob(parts,{type:'audio/mpeg'})})
  }).then(function(b){
    return C.open(FT_ACACHE).then(function(c){return c.put(u,new Response(b,{headers:{'content-type':'audio/mpeg'}}))}).then(function(){ftA.have[id]=true;if(ftA.ctl===ctl){ftA.ctl=null;ftA.dl=0;ftA.pct=0}ftAuUi();try{toast('تم تنزيل الصوت')}catch(e){}})
  }).catch(function(){if(ctl.signal.aborted){ftA.dl=0;ftA.pct=0;ftA.ctl=null;ftAuUi()}else fail()})}
function ftAuDel(f){var u=ftAuUrl(f),C=window.caches;if(!C||!u)return;if(ftA.id===f[0])ftAuStop();C.open(FT_ACACHE).then(function(c){return c.delete(u)}).then(function(){ftA.have[f[0]]=false;ftA.err=0;ftAuUi();try{toast('تم حذف الصوت من الجهاز')}catch(e){}},function(){})}
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
    h+=ftAuBar(f);if(ftAuUrl(f)&&ftA.have[id]===undefined)ftAuHave(id,ftAuUrl(f));
    h+='<div class="ftw-q keepar"><small>السؤال</small><p>'+ftEsc(f[2])+'</p></div>';
    h+='<div class="ftw-a keepar"><small>الجواب</small>'+f[3].split(/\n+/).map(function(p){return p.trim()?'<p>'+ftEsc(p)+'</p>':''}).join('')+'</div>';
    h+='<div class="ftw-sep"></div><button class="ftw-src" data-a="ftwsrc" data-v="'+id+'">'+FTI_.ext+'المصدر: binbaz.org.sa</button></section></div>';return h}
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
  if(a==='ftwopen'){ftS.menu=0;ftAuStop();ftS.id=+v;ftS.view='detail';if(typeof render==='function')render();return false}
  if(a==='ftwback'){ftS.menu=0;ftAuStop();if(ftS.view==='detail'&&ftS.cat)ftS.view='list';else{ftS.view='cats';ftS.cat=''}ftS.lim=60;if(typeof render==='function')render();return false}
  if(a==='ftwmore'){ftS.lim+=60;ftRefresh();return false}
  var f=window.FTI&&ftGet(+v);
  if((a==='ftwcopy'||a==='ftwshare'||a==='ftwsrc'||a==='ftwdel')&&f&&ftS.menu){ftS.menu=0;setTimeout(ftAuUi,0)}
  if(a==='ftwmenu'&&f){ftS.menu=ftS.menu===f[0]?0:f[0];ftAuUi();return false}
  if(a==='ftwplay'&&f){ftAuPlay(f);return false}
  if(a==='ftwdl'&&f){ftAuDl(f);return false}
  if(a==='ftwdlx'){ftAuAbort();ftAuUi();return false}
  if(a==='ftwdel'&&f){ftAuDel(f);return false}
  if(a==='ftwcopy'&&f){try{navigator.clipboard.writeText(ftText(f));toast('تم نسخ الفتوى')}catch(e){toast('تعذّر النسخ')}return false}
  if(a==='ftwshare'&&f){try{if(navigator.share){navigator.share({text:ftText(f)});return false}}catch(e){}try{navigator.clipboard.writeText(ftText(f));toast('تم نسخ الفتوى')}catch(e){toast('تعذّر النسخ')}return false}
  if(a==='ftwsrc'&&f){if(typeof cdOpenUrl==='function')cdOpenUrl('https://binbaz.org.sa/fatwas/'+f[4]);return false}
  return true}
(function(){var tm;document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='ftw-q'){var val=e.target.value;clearTimeout(tm);tm=setTimeout(function(){ftS.q=val;ftS.lim=60;ftRefresh()},200)}})})();
