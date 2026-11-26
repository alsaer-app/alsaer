/* ===== سبع ميزات: يوم راحة · أذكار بعد الصلاة · المناسبات الهجرية · بطاقات المشاركة · متابعة الحفظ · الوضع الهادئ · مؤقت الخشوع ===== */
function f7add(k,n){var d=parse(k);d.setDate(d.getDate()+n);return dk(d)}
function f7day(d){var x=new Date(d);x.setHours(0,0,0,0);return x}

/* ---------- ١) أيام الراحة (تجميد السلسلة) ---------- */
var FR_MAX=2;
function frGet(){var F=S.freeze;if(!F||typeof F!=='object'||Array.isArray(F))F=S.freeze={};var m=dk().slice(0,7);if(F.m!==m){F.m=m;F.used=0}if(!Array.isArray(F.days))F.days=[];if(typeof F.used!=='number')F.used=0;return F}
function frozen(k){var F=S.freeze;return !!(F&&Array.isArray(F.days)&&F.days.indexOf(k)>=0)}
function frCard(){
  var F=frGet(),left=Math.max(0,FR_MAX-F.used),t=dk(),y=f7add(t,-1);
  return '<section class="card"><h3>أيام الراحة</h3><p class="note">لك '+ar(FR_MAX)+' يومين راحة في الشهر: لا تقطع السلسلة إذا فاتك يوم لعذر. المتبقّي هذا الشهر: <b>'+ar(left)+'</b></p>'
   +'<div class="acts"><button class="btn ghost" data-a="frz" data-v="'+y+'"'+((left<=0||frozen(y))?' disabled':'')+'>'+(frozen(y)?'أمس مجمَّد ✓':'جمّد أمس')+'</button><button class="btn" data-a="frz" data-v="'+t+'"'+((left<=0||frozen(t))?' disabled':'')+'>'+(frozen(t)?'اليوم مجمَّد ✓':'جمّد اليوم')+'</button></div></section>';
}

/* ---------- ٢) أذكار بعد الصلاة ---------- */
var apTimer=null;
function apShow(){
  var o=document.getElementById('ap-bar');if(o)o.remove();
  o=document.createElement('div');o.id='ap-bar';o.className='ap-bar';o.setAttribute('role','status');
  o.innerHTML='<span>تقبّل الله صلاتك</span><button data-a="adkopen" data-v="afterprayer">أذكار بعد الصلاة ‹</button><button class="x" aria-label="إغلاق">✕</button>';
  document.body.appendChild(o);
  o.querySelector('.x').onclick=function(){o.remove()};
  o.querySelector('[data-a]').addEventListener('click',function(){o.remove()});
  clearTimeout(apTimer);apTimer=setTimeout(function(){if(o.parentNode)o.remove()},14000);
}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('[data-a=pray]');if(!b)return;var id=b.dataset.v;setTimeout(function(){try{if(S.prayers[dk()]&&S.prayers[dk()][id])apShow()}catch(x){}},250)});

/* ---------- ٣) المناسبات الهجرية ---------- */
var OCC=[['رأس السنة الهجرية',1,1],['يوم عاشوراء',10,1],['أول رمضان',1,9],['بداية العشر الأواخر',21,9],['عيد الفطر',1,10],['أول ذي الحجة',1,12],['يوم عرفة',9,12],['عيد الأضحى',10,12]];
function occList(){
  var now=f7day(new Date()),found={},wb=null,i;
  for(i=0;i<=420;i++){var d=new Date(now.getTime()+i*864e5),h=hijriNumeric(d);if(!h)continue;
    OCC.forEach(function(o){if(!found[o[0]]&&h.day===o[1]&&h.month===o[2])found[o[0]]={n:o[0],days:i,date:d,h:h}});
    if(!wb&&h.day>=13&&h.day<=15)wb={n:'الأيام البيض (١٣–١٥)',days:i,date:d,h:h}}
  var out=Object.keys(found).map(function(k){return found[k]});if(wb)out.push(wb);
  return out.sort(function(a,b){return a.days-b.days});
}
function vOccasions(){
  var L=occList(),fm=function(d){try{return new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long'}).format(d)}catch(e){return ''}};
  if(!L.length)return '<section class="card"><p class="note">تعذّر حساب التاريخ الهجري على هذا الجهاز.</p></section>';
  return '<div class="oc">'+L.map(function(o,i){return '<section class="card oc-i'+(i===0?' first':'')+'"><div class="oc-d"><b>'+(o.days===0?'اليوم':ar(o.days))+'</b><small>'+(o.days===0?'':(o.days===1?'يوم':'يومًا'))+'</small></div><div class="oc-t"><b>'+o.n+'</b><small>'+fm(o.date)+' · '+ar(o.h.day)+'/'+ar(o.h.month)+'/'+ar(o.h.year)+'هـ</small></div></section>'}).join('')+'<p class="note" style="text-align:center">المواعيد بحساب أم القرى وقد تختلف يومًا بحسب رؤية الهلال.</p></div>';
}
setTimeout(function(){try{
  if(!S.onboarded||S.occSeen===dk())return;
  var L=occList().filter(function(o){return o.days<=1&&o.n.indexOf('البيض')<0});if(!L.length)return;
  S.occSeen=dk();save();toast((L[0].days===0?'اليوم: ':'غدًا: ')+L[0].n)}catch(e){}},4500);

/* ---------- ٤) بطاقات المشاركة ---------- */
var cdSrc='weekly',cdText='',cdUrl='';
function cdLines(){
  if(cdSrc==='custom')return {t:cdText.trim()||'اكتب نصًا لتصنع بطاقة',s:''};
  if(cdSrc==='fav'){var F=(S.adkFav||[]).map(adkFind).filter(Boolean);if(F.length)return {t:F[Math.floor(Date.now()/864e5)%F.length].t,s:'من أذكاري'};return {t:'سبحان الله وبحمده، سبحان الله العظيم',s:'من أذكاري'}}
  var T=dayTotal(),tp=0,tq=0,i;for(i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-i);var k=dk(d);PR.forEach(function(x){if((S.prayers[k]||{})[x[0]])tp++});tq+=(S.quran.log||{})[k]||0}
  var st=stats();return {t:'هذا الأسبوع بفضل الله:\n'+ar(tp)+' صلاة · '+ar(tq)+' صفحة من القرآن\nسلسلتي '+ar(st.cur)+' يوم',s:'إنجازي الأسبوعي'};
}
function cdMake(){
  var c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d'),L=cdLines();
  var g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#0E2A2B');g.addColorStop(1,'#1B4A45');x.fillStyle=g;x.fillRect(0,0,1080,1350);
  x.strokeStyle='#C9A24B';x.lineWidth=4;x.strokeRect(40,40,1000,1270);x.lineWidth=1.5;x.strokeRect(58,58,964,1234);
  var ff=getComputedStyle(document.body).fontFamily||'sans-serif';
  x.direction='rtl';x.textAlign='center';x.fillStyle='#E8C873';x.font='bold 46px '+ff;x.fillText('السائر',540,150);
  x.fillStyle='#fff';var size=L.t.length>140?44:(L.t.length>70?54:64);x.font=size+'px '+ff;
  var lines=[];L.t.split('\n').forEach(function(par){var w=par.split(' '),cur='';w.forEach(function(wd){var t=cur?cur+' '+wd:wd;if(x.measureText(t).width>880&&cur){lines.push(cur);cur=wd}else cur=t});lines.push(cur)});
  var lh=size*1.7,y0=675-lines.length*lh/2+lh*0.6;lines.slice(0,12).forEach(function(l,i){x.fillText(l,540,y0+i*lh)});
  if(L.s){x.fillStyle='#9FB3AE';x.font='36px '+ff;x.fillText(L.s,540,1180)}
  x.fillStyle='#C9A24B';x.font='30px '+ff;x.fillText('تطبيق السائر · مجاني بالكامل',540,1250);
  return c;
}
/* ---------- بطاقة السورة: محتوى «البطاقات» للأستاذ الدكتور ياسر بن إسماعيل راضي (albitaqat.com). الحقوق محفوظة للمؤلف؛ يُعرض بنصه كما هو مع نسبته إليه ومسؤولية استعماله على مالك التطبيق. البيانات في www/albitaqat.js وحدها (قابلة للإزالة) ---------- */
var cdTab='sura',cdSura=1;
function abqEnsure(cb){
  if(window.ALBQ){cb();return}
  var q=window.__abq||(window.__abq=[]);q.push(cb);if(window.__abl)return;window.__abl=1;
  var sc=document.createElement('script');sc.src='albitaqat.js';
  sc.onload=sc.onerror=function(){window.__abl=0;q.splice(0).forEach(function(f){try{f()}catch(e){}})};
  document.head.appendChild(sc);
}
function abqRow(c){var D=window.ALBQ;return D&&D.rows&&D.rows[c-1]}
function cdPlayIc(on){return on?'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>':'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>'}
function cdSuraInfo(c){
  var st=suraPage(c),en=c<114?Math.max(st,suraPage(c+1)-1):604,P=curP(),j1=(P[st-1]||[])[4]||1,j2=(P[en-1]||[])[4]||j1,n=AD().s[c-1].length;
  return {c:c,name:AD().n[c-1],en:(typeof SUR_EN!=='undefined'&&SUR_EN[c-1])||'',n:n,med:MEDINAN.indexOf(c)>=0,st:st,en2:en,j1:j1,j2:j2};
}
function vCards(){
  var tabs='<div class="cd-tabs"><button class="chip'+(cdTab==='sura'?' on':'')+'" data-a="cdtab" data-v="sura">تعريف السورة</button><button class="chip'+(cdTab==='share'?' on':'')+'" data-a="cdtab" data-v="share">بطاقات المشاركة</button></div>';
  if(cdTab==='share')return tabs+vCardsShare();
  if(!window.ALBQ){abqEnsure(function(){if(tab==='cards')render()});return '<div class="cd cds">'+tabs+'<p class="note" style="text-align:center">جارٍ التحميل…</p></div>'}
  var I=cdSuraInfo(cdSura),R=abqRow(cdSura),D=window.ALBQ,playing=!!(mqAu&&mqAu.a&&mqAu.ext&&+mqAu.k.split(':')[0]===cdSura&&!mqAu.pa);
  var jz=I.j1===I.j2?'<span>الجزء</span> '+ar(I.j1):'<span>الجزء</span> '+ar(I.j1)+'–'+ar(I.j2);
  var secs=D.titles.map(function(t,i){return '<section class="card cds-s"><h3>'+esc(t)+'</h3><p class="keepar">'+esc(R[i+1])+'</p></section>'}).join('');
  return '<div class="cd cds">'+tabs
   +'<section class="cds-h"><div class="cds-b">'+ar(I.c)+'</div><h2>'+esc(I.name)+'</h2><div class="cds-en">'+esc(I.en)+'</div><div class="cds-m">'+ar(I.n)+' <span>'+(I.n<3?'آية':I.n<11?'آيات':'آية')+'</span> · <span>'+(I.med?'مدنية':'مكية')+'</span> · '+jz+' · <span>ص</span> '+ar(I.st)+(I.en2>I.st?'–'+ar(I.en2):'')+'</div></section>'
   +'<div class="cds-r"><button class="card cds-a" data-a="cdplay"><span class="cds-ic gold">'+cdPlayIc(playing)+'</span><span class="cds-t"><b>'+(playing?'إيقاف مؤقت':'صوت')+'</b><small>تلاوة البطاقة بصوت المؤلف</small></span></button>'
   +'<button class="card cds-a" data-a="cdopen" data-v="pdf"><span class="cds-ic pdf">PDF</span><span class="cds-t"><b>PDF</b><small>بطاقة السورة</small></span></button></div>'
   +'<button class="card cds-yt" data-a="cdopen" data-v="yt"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg><span>مشاهدة البطاقة على يوتيوب</span></button>'
   +secs
   +'<p class="cds-cr">المحتوى من «كتاب البطاقات» لأ.د. ياسر بن إسماعيل راضي، موقع <a href="#" data-a="cdopen" data-v="site">albitaqat.com</a>. الحقوق محفوظة للمؤلف. الصوت وملفات PDF والفيديو تُفتح من مصادرها الأصلية وتحتاج إنترنت.</p></div>';
}
function cdOpenUrl(u){
  try{if(window.AlsaerNative&&AlsaerNative.openUrl&&AlsaerNative.openUrl(u))return}catch(e){}
  try{window.open(u,'_blank','noopener')}catch(e2){try{location.href=u}catch(e3){}}
}
function cdPlay(){
  var R=abqRow(cdSura);if(!R)return;
  if(mqAu&&mqAu.a&&mqAu.ext&&+mqAu.k.split(':')[0]===cdSura){if(mqAu.a.paused){mqAu.pa=false;var r0=mqAu.a.play();if(r0&&r0.catch)r0.catch(function(){})}else{mqAu.pa=true;mqAu.a.pause()}mqAuBar();return}
  if(typeof mqAuStop==='function')mqAuStop();
  var a=new Audio();a.preload='auto';a.src=R[9];mqAu={a:a,k:cdSura+':1',pa:false,ext:1,nm:'بطاقة '+AD().n[cdSura-1]+' · ياسر راضي'};
  a.onended=function(){if(mqAu.a===a)mqAuStop()};
  a.onerror=function(){if(mqAu.a!==a)return;mqAuStop();toast('تعذّر تشغيل الصوت. تحتاج الميزة إلى اتصال بالإنترنت')};
  var pr=a.play();if(pr&&pr.catch)pr.catch(function(){if(mqAu.a===a&&!a.error){mqAu.pa=true;mqAuBar()}});
  if(!mqAuT)mqAuT=setInterval(function(){if(mqAu.a&&tab!=='reader'&&!(mqAu.ext&&tab==='cards'))mqAuStop();else try{mqAuSync()}catch(e){}},500);
  mqAuBar();
}
function vCardsShare(){
  var src=[['weekly','إنجازي الأسبوعي'],['fav','من أذكاري'],['custom','نص أكتبه']];
  return '<div class="cd"><section class="card"><h3>بطاقة للمشاركة</h3><div class="chips">'+src.map(function(s){return '<button class="chip'+(cdSrc===s[0]?' on':'')+'" data-a="cdsrc" data-v="'+s[0]+'">'+s[1]+'</button>'}).join('')+'</div>'
   +(cdSrc==='custom'?'<textarea id="cd-text" class="bk-ta" rows="3" maxlength="300" dir="rtl" placeholder="اكتب آية أو دعاءً أو فائدة…">'+esc(cdText)+'</textarea>':'')
   +'<div class="acts"><button class="btn" data-a="cdmake">إنشاء البطاقة</button></div></section>'
   +(cdUrl?'<section class="card"><img class="cd-img" src="'+cdUrl+'" alt="البطاقة"><div class="acts"><button class="btn" data-a="cdshare">مشاركة</button><button class="btn ghost" data-a="cddl">حفظ الصورة</button></div><p class="note">إن لم تعمل المشاركة، اضغط مطوّلًا على الصورة لحفظها.</p></section>':'')+'</div>';
}
document.addEventListener('input',function(e){var t=e.target;if(t&&t.id==='cd-text')cdText=t.value});
function cdBlob(cb){try{var c=cdMake();c.toBlob(function(b){cb(b)},'image/png')}catch(e){cb(null)}}

/* ---------- ٥) متابعة الحفظ بالمراجعة المتباعدة ---------- */
var HF_INT=[1,2,4,7,14,30,60];
function hfList(){if(!Array.isArray(S.hifz))S.hifz=[];return S.hifz}
function vHifz(){
  var Q=QD(),L=hfList(),t=dk();
  if(!Q.n||!Q.n.length)return '<section class="card"><p class="note">تعذّر تحميل نص المصحف.</p></section>';
  var opts=Q.n.map(function(n,i){return '<option value="'+(i+1)+'">'+ar(i+1)+' · '+esc(n)+'</option>'}).join('');
  var due=L.filter(function(x){return x.next<=t}),rest=L.filter(function(x){return x.next>t}),ay=L.reduce(function(s,x){return s+(x.b-x.a+1)},0);
  var row=function(x,isDue){var nm=Q.n[x.s-1]||'';return '<div class="hf-i"><div><b>'+esc(nm)+'</b><small>الآيات '+ar(x.a)+'–'+ar(x.b)+' · '+(isDue?'حان موعد مراجعتها':'المراجعة القادمة '+esc(x.next))+'</small></div>'
    +(isDue?'<div class="hf-b"><button class="btn" data-a="hfrev" data-v="'+x.id+':1">راجعتها ✓</button><button class="btn ghost" data-a="hfrev" data-v="'+x.id+':0">صعبت عليّ</button></div>':'')+'<button class="nt-x" data-a="hfdel" data-v="'+x.id+'" aria-label="حذف">✕</button></div>'};
  return '<div class="hf"><section class="rm5-hero"><small>محفوظك</small><b>'+ar(ay)+' آية</b><span>للمراجعة اليوم: '+ar(due.length)+'</span></section>'
   +'<section class="card"><h3>مراجعة اليوم</h3>'+(due.length?due.map(function(x){return row(x,true)}).join(''):'<p class="note">لا شيء للمراجعة اليوم، بارك الله فيك.</p>')+'</section>'
   +'<section class="card"><h3>أضف محفوظًا</h3><select id="hf-s" class="rm-sel" style="width:100%">'+opts+'</select><div class="hf-r"><label>من آية<input id="hf-a" class="qd-i" type="number" inputmode="numeric" min="1" value="1"></label><label>إلى آية<input id="hf-b" class="qd-i" type="number" inputmode="numeric" min="1" value="7"></label></div><div class="acts"><button class="btn" data-a="hfadd">إضافة</button></div></section>'
   +(rest.length?'<section class="card"><h3>قادم لاحقًا</h3>'+rest.sort(function(a,b){return a.next<b.next?-1:1}).map(function(x){return row(x,false)}).join('')+'</section>':'')+'</div>';
}

/* ---------- ٦ + ٧) الخشوع: مؤقت + وضع هادئ للمصلين ---------- */
var kt={dur:10,end:0,iv:null,wl:null};
function ktLog(){if(!S.khlog||typeof S.khlog!=='object'||Array.isArray(S.khlog))S.khlog={};return S.khlog}
function ktFmt(ms){var s=Math.max(0,Math.ceil(ms/1000));return digitsConv(Math.floor(s/60)+':'+String(s%60).padStart(2,'0'),U().digits==='west')}
function ktStop(done){
  clearInterval(kt.iv);kt.iv=null;
  try{if(kt.wl){kt.wl.release();kt.wl=null}}catch(e){}
  var was=kt.end;kt.end=0;
  if(done&&was){var L=ktLog(),k=dk();L[k]=(L[k]||0)+kt.dur;save();hapGo([200,100,200,100,300]);toast('أتممت '+ar(kt.dur)+' دقيقة — تقبّل الله')}
}
function ktTick(){
  if(!kt.end)return;
  if(typeof tab!=='undefined'&&tab!=='khushu'&&Date.now()<kt.end){/* يستمر في الخلفية */}
  var left=kt.end-Date.now(),el=document.getElementById('kt-t');
  if(left<=0){ktStop(true);try{render()}catch(e){}return}
  if(el)el.textContent=ktFmt(left);
  var bar=document.getElementById('kt-bar');if(bar)bar.style.width=Math.round((1-left/(kt.dur*60000))*100)+'%';
}
function ktWeek(){var L=ktLog(),s=0,i;for(i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-i);s+=L[dk(d)]||0}return s}
function vKhushu(){
  var run=!!kt.end,L=ktLog(),t=L[dk()]||0,chips=[5,10,15,20,30,45].map(function(n){return '<button class="chip'+(kt.dur===n?' on':'')+'" data-a="ktdur" data-v="'+n+'"'+(run?' disabled':'')+'>'+ar(n)+' د</button>'}).join('');
  return '<div class="kt"><section class="rm5-hero"><small>'+(run?'جارٍ…':'مؤقت الخشوع')+'</small><b id="kt-t">'+(run?ktFmt(kt.end-Date.now()):ktFmt(kt.dur*60000))+'</b><span>اقرأ ورده أو اجلس مع الذكر دون مشتّتات</span><div class="bar"><div id="kt-bar" style="width:'+(run?Math.round((1-(kt.end-Date.now())/(kt.dur*60000))*100):0)+'%"></div></div></section>'
   +'<section class="card"><div class="chips">'+chips+'</div><div class="acts"><button class="btn'+(run?' ghost':'')+'" data-a="'+(run?'ktstop':'ktstart')+'">'+(run?'إيقاف':'ابدأ')+'</button></div><p class="note">وقتك اليوم: <b>'+ar(t)+'</b> دقيقة · هذا الأسبوع: <b>'+ar(ktWeek())+'</b> دقيقة</p></section>'
   +'<section class="card"><h3>وضع هادئ للمصلين</h3><div class="rm-row'+(S.calm?' on':'')+'" style="margin:0"><div class="rm-tx"><b>تأجيل الإشعارات وقت الصلاة</b><small>تُؤجَّل التذكيرات غير الصلاة بعد وقت كل صلاة بنحو ٢٠ دقيقة، ويبقى تنبيه الصلاة نفسه. يعمل مع الأوقات التلقائية بعد تحديد موقعك.</small></div><label class="rm-sw"><input type="checkbox" data-calm="1" '+(S.calm?'checked':'')+'><i></i></label></div></section></div>';
}
document.addEventListener('change',function(e){var t=e.target;if(t&&t.getAttribute&&t.hasAttribute('data-calm')){S.calm=!!t.checked;save();try{if(window.alsaerNativeSyncSoon)window.alsaerNativeSyncSoon(true)}catch(x){}try{render()}catch(x){}}});

/* ---------- الأوامر ---------- */
function f7Act(a,v,d){
  if(a==='frz'){var F=frGet();if(F.used<FR_MAX&&!frozen(v)){F.days.push(v);F.used++;save();toast('جُمِّد اليوم — سلسلتك محفوظة')}return false}
  if(a==='cdtab'){cdTab=v==='share'?'share':'sura';return false}
  if(a==='cdplay'){abqEnsure(cdPlay);return false}
  if(a==='cdopen'){var R2=abqRow(cdSura),u=v==='site'?'https://albitaqat.com/':R2&&(v==='pdf'?R2[10]:'https://www.youtube.com/watch?v='+R2[11]);if(u)cdOpenUrl(u);return true}
  if(a==='cdsrc'){cdSrc=v;cdUrl='';return false}
  if(a==='cdmake'){var el=document.getElementById('cd-text');if(el)cdText=el.value;try{cdUrl=cdMake().toDataURL('image/png')}catch(e){toast('تعذّر إنشاء الصورة')}return false}
  if(a==='cdshare'){cdBlob(function(b){if(!b){toast('تعذّر إنشاء الصورة');return}try{var f=new File([b],'alsaer-card.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){});return}}catch(e){}toast('المشاركة غير متاحة هنا — اضغط مطوّلًا على الصورة لحفظها')});return true}
  if(a==='cddl'){try{var an=document.createElement('a');an.href=cdUrl;an.download='alsaer-card.png';document.body.appendChild(an);an.click();an.remove();toast('إن لم يبدأ التنزيل، اضغط مطوّلًا على الصورة لحفظها')}catch(e){toast('اضغط مطوّلًا على الصورة لحفظها')}return true}
  if(a==='hfadd'){var Q=QD(),s=parseInt((document.getElementById('hf-s')||{}).value,10)||1,A=parseInt((document.getElementById('hf-a')||{}).value,10)||1,B=parseInt((document.getElementById('hf-b')||{}).value,10)||A,mx=(Q.s&&Q.s[s-1]||[]).length||286;
    A=Math.max(1,Math.min(A,mx));B=Math.max(A,Math.min(B,mx));var L=hfList();L.push({id:'h'+Date.now().toString(36),s:s,a:A,b:B,box:0,next:f7add(dk(),1),last:dk()});if(L.length>300)L.shift();save();toast('أُضيف إلى محفوظك — أولى مراجعاته غدًا');return false}
  if(a==='hfrev'){var p=String(v).split(':'),it=hfList().filter(function(x){return x.id===p[0]})[0];if(it){it.box=p[1]==='1'?Math.min(HF_INT.length-1,it.box+1):Math.max(0,it.box-1);it.next=f7add(dk(),p[1]==='1'?HF_INT[it.box]:1);it.last=dk();save();hapGo([40])}return false}
  if(a==='hfdel'){S.hifz=hfList().filter(function(x){return x.id!==v});save();return false}
  if(a==='bmdel'){S.bm=bmList().filter(function(x){return String(x)!==String(v)});save();return false}
  if(a==='ktdur'){var n=parseInt(v,10);if(n>0)kt.dur=n;return false}
  if(a==='ktstart'){kt.end=Date.now()+kt.dur*60000;clearInterval(kt.iv);kt.iv=setInterval(ktTick,1000);try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(w){kt.wl=w},function(){})}catch(e){}return false}
  if(a==='ktstop'){ktStop(false);return false}
  return true;
}

/* ---------- أهداف أسبوعية ---------- */
function wgGet(){var w=S.wg;if(!w||typeof w!=='object'||Array.isArray(w))w=S.wg={};return w}
function wgCard(pages,prayers){
  var w=wgGet(),mins=ktWeek(),row=function(k,l,cur,u){var t=parseInt(w[k],10)||0,pct=t?Math.min(100,Math.round(cur/t*100)):0;return '<div class="wg-r"><div class="wg-h"><span>'+l+'</span><input class="qd-i" type="number" inputmode="numeric" min="0" max="9999" data-wg="'+k+'" value="'+(t||'')+'" placeholder="الهدف"></div>'+(t?'<div class="bar"><div style="width:'+pct+'%"></div></div><small class="wg-s">'+ar(cur)+' من '+ar(t)+' '+u+(cur>=t?' ✓':'')+'</small>':'')+'</div>'};
  return '<section class="card"><h3>أهدافي هذا الأسبوع</h3>'+row('pages','صفحات القرآن',pages,'صفحة')+row('prayers','الصلوات',prayers,'صلاة')+row('mins','دقائق الخشوع',mins,'دقيقة')+'</section>';
}
document.addEventListener('change',function(e){var t=e.target;if(t&&t.getAttribute&&t.hasAttribute('data-wg')){wgGet()[t.getAttribute('data-wg')]=Math.max(0,Math.min(9999,parseInt(t.value,10)||0));save();try{render()}catch(x){}}});

/* ---------- علامات المصحف ---------- */
function bmList(){if(!Array.isArray(S.bm))S.bm=[];return S.bm}
function bmCard(){
  var L=bmList().slice().sort(function(a,b){return a-b});
  return '<section class="card"><h3>علامات المصحف</h3>'+(L.length?L.map(function(p){return '<div class="nt-i"><button class="bm-go" data-a="qopen" data-v="'+p+'"><b>صفحة '+ar(p)+'</b><small>سورة '+esc(pageSura(p))+'</small></button><button class="nt-x" data-a="bmdel" data-v="'+p+'" aria-label="حذف">✕</button></div>'}).join(''):'<p class="note">اضغط ☆ أثناء القراءة في المصحف لوضع علامة.</p>')+'</section>';
}
/* ---------- تذكيرات المناسبات والنسخ الاحتياطي ---------- */
var _oc={k:'',v:[]};
function occCache(){var k=dk();if(_oc.k!==k){_oc={k:k,v:occList()}}return _oc.v}
setTimeout(function(){try{
  if(!S.onboarded||S.bkSeen===dk())return;
  var used=f7diff_(S.startDate,dk());if(used<7)return;
  if(!S.bkAt||Date.now()-S.bkAt>7*864e5){S.bkSeen=dk();save();toast('مرّ أسبوع على آخر نسخة احتياطية — المزيد ← النسخ الاحتياطي')}}catch(e){}},9000);
function f7diff_(a,b){return Math.round((parse(b)-parse(a))/864e5)}
