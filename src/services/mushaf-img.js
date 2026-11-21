/* ===== مصحف الصور (طبعة المدينة النبوية) — تُحمَّل الصفحات عند الحاجة وتُحفظ على الهاتف للقراءة بلا إنترنت =====
   الصور: QuranHub/quran-pages-images (Unlicense) · الحفص ٨٠٧×١٢٠٥ · ورش ٩١٢×١٣٤٥ */
var MPI_B=['https://cdn.jsdelivr.net/gh/QuranHub/quran-pages-images@main/','https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/'];
var mpiImgs={},mpiMem={},mpiOrd=[],mpiBad={},mpiCum=null,mpiPI=null,mpiDl={on:false,n:0,stop:false},mpiCached=-1;
function mpiSet(){return (typeof isW==='function'&&isW())?'warsh-a':'hafs-wasat'}
function mpiDim(p){return (mpiSet()==='hafs-wasat'&&p>=1&&p<=2)?[843,1140]:[807,1205]}
function mpiAsp(p){if(mpiSet()==='warsh-a')return 620/1005;var d=mpiDim(p);return d[0]/d[1]}
function mpiKey(p){return mpiSet()+'/'+p+(mpiSet()==='warsh-a'?'.png':'.jpg')}
function mpiPath(k){var q=k.split('/');return (q[0]==='warsh-a'?'ayat/warsh/':'kfgqpc/hafs-wasat/')+q[1]}
function mpiUrl(k,i){return MPI_B[i||0]+mpiPath(k)}
var MPI_CF={'hafs-wasat':{hx:22,hy:22,P:71,L:62,R:748,TOP:117,BOT:1135,NS:258,TW:187},'warsh-a':{hx:19.5,hy:18,P:74,L:46,R:760,TOP:74,BOT:1127,NS:169,TW:96}};
/* صفحتا الفاتحة والبقرة بإطار أضيق وسطور أقل: قياسات خاصة (بإحداثيات الصورة نفسها) */
var MPI_PG={'hafs-wasat':{1:{L:195,R:655,P:53,TOP:416,BOT:735,NS:416},2:{L:195,R:655,P:53,TOP:470,BOT:735,NS:470}},
 'warsh-a':{1:{L:208,R:609,P:46,TOP:469,BOT:746,NS:469},2:{L:195,R:614,P:43,TOP:516,BOT:729,NS:516}}};
function mpiC(p){var b=MPI_CF[mpiSet()],o=p&&MPI_PG[mpiSet()][p];if(!o)return b;var r={},k;for(k in b)r[k]=b[k];for(k in o)r[k]=o[k];return r}
function mpiA(){return mpiSet()==='warsh-a'?AYAW:AYAPOS}
/* وضع الصور مُعطَّل: المصحف التفاعلي (النص) هو الأساس */
function mpiOnFor(p){return false}
function mpiVerses(){return typeof AYAPOS!=='undefined'&&typeof AYAW!=='undefined'}
function mpiCacheName(){return 'alsaer-pages-1'}
function mpiFetchNet(k){
  var tries=MPI_B.map(function(b,i){return mpiUrl(k,i)});
  function go(i){
    if(i>=tries.length)return Promise.reject(new Error('net'));
    var ctl=window.AbortController?new AbortController():null,t=setTimeout(function(){try{ctl&&ctl.abort()}catch(e){}},20000);
    return fetch(tries[i],ctl?{signal:ctl.signal}:{}).then(function(r){clearTimeout(t);if(!r.ok)throw new Error('http');return r}).catch(function(){clearTimeout(t);return go(i+1)});
  }
  return go(0);
}
function mpiRemember(k,url){
  mpiMem[k]=url;mpiOrd=mpiOrd.filter(function(x){return x!==k});mpiOrd.push(k);
  while(mpiOrd.length>10){var o=mpiOrd.shift();try{URL.revokeObjectURL(mpiMem[o])}catch(e){}delete mpiMem[o]}
}
/* يعيد رابطًا قابلًا للعرض للصفحة: الذاكرة ← التخزين على الهاتف ← الشبكة (ثم يُحفظ) */
function mpiResolve(k,netOk){
  if(mpiMem[k])return Promise.resolve(mpiMem[k]);
  var ck='https://alsaer.local/pages/'+k;
  if(!window.caches||!window.fetch)return Promise.resolve(mpiUrl(k,0));
  return Promise.resolve().then(function(){return caches.open(mpiCacheName())}).catch(function(){return null}).then(function(c){
    if(!c){return {blob:function(){return fetch(mpiUrl(k,0)).then(function(r){if(!r.ok)throw new Error('http');return r.blob()})}}}
    return c.match(ck).then(function(r){
      if(r)return r;
      if(netOk===false)throw new Error('off');
      return mpiFetchNet(k).then(function(nr){return c.put(ck,nr.clone()).catch(function(){}).then(function(){mpiCached=-1;return nr})},function(){return {blob:function(){return Promise.resolve(null)},direct:1}});
    });
  }).then(function(r){return r.blob()}).then(function(b){if(!b)return mpiUrl(k,0);var u=URL.createObjectURL(b);mpiRemember(k,u);return u});
}
function mpiPrefetch(p){
  [1,-1,2,-2,3].forEach(function(d,i){
    var q=p+d;if(q<1||q>604)return;var k=mpiSet()+'/'+q+(mpiSet()==='warsh-a'?'.png':'.jpg');
    setTimeout(function(){mpiResolve(k).then(function(u){var im=new Image();im.src=u}).catch(function(){})},250+i*350);
  });
}
function mpiMain(p,m){
  var k=mpiKey(p),src=mpiMem[k]||'';
  var hd='<div class="mp-h"><span>الجزء '+ar(m[0])+(m[1]?' · حزب '+ar(m[1]):'')+'</span><span class="sb">'+esc(QD().n[m[2]-1])+'</span></div>';
  return '<div class="mp mpi" id="mp"><div class="mp-in">'+hd
   +'<div class="pgi'+(src?' ok':'')+'" data-p="'+p+'" data-k="'+k+'"><img class="pgi-i" alt="صفحة '+ar(p)+'" draggable="false"'+(src?' src="'+src+'"':'')+'><div class="pgi-ov"></div><div class="pgi-ld"><i></i><small>جارٍ تحميل الصفحة…</small></div></div>'
   +'<div class="mp-f"><span class="pn">'+ar(p)+'</span></div></div></div>';
}
/* بعد رسم الصفحة: ضبط الحجم ثم تحميل الصورة */
function sizeMpi(mp){
  sizeMp(mp);
  var W=parseFloat(mp.style.width)||mp.clientWidth,H=parseFloat(mp.style.height)||mp.clientHeight,g=mp.querySelector('.pgi');if(!g)return;var asp=mpiAsp(+g.getAttribute('data-p'));
  var hh=mp.querySelector('.mp-h'),ff=mp.querySelector('.mp-f'),res=(hh?hh.offsetHeight:0)+(ff?ff.offsetHeight:0)+6;
  var pw=Math.min(W,(H-res)*asp);pw=Math.max(200,pw);
  g.style.width=pw+'px';g.style.height=(pw/asp)+'px';
}
function mpiAfter(mp){
  var g=mp.querySelector('.pgi'),im=g&&g.querySelector('.pgi-i');if(!g||!im)return;
  var k=g.getAttribute('data-k'),p=+g.getAttribute('data-p');
  var show=function(u){if(!document.body.contains(g))return;if(im.getAttribute('src')!==u)im.src=u;if(im.complete&&im.naturalWidth)g.classList.add('ok')};
  if(mpiMem[k])show(mpiMem[k]);
  else if(!g.getAttribute('data-r')){g.setAttribute('data-r','1');
    mpiResolve(k).then(show).catch(function(){if(!document.body.contains(g))return;mpiBad[k]=1;toast('تعذّر تحميل صورة الصفحة — عُرض النص. تحتاج إنترنتًا أول مرة أو نزّل المصحف من الخيارات');render()});
  }
  try{mpiPaint(typeof mpHlLast==='string'?mpHlLast:'')}catch(e){}
  if(!g.getAttribute('data-pf')){g.setAttribute('data-pf','1');mpiPrefetch(p)}
}
document.addEventListener('error',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('pgi-i')&&t.getAttribute('src')){var g=t.closest('.pgi'),k=g&&g.getAttribute('data-k');if(k){mpiBad[k]=1;delete mpiMem[k];toast('تعذّر عرض صورة الصفحة — عُرض النص');render()}}},true);
document.addEventListener('load',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('pgi-i')){var g=t.closest('.pgi');if(g)g.classList.add('ok')}},true);
/* ---- مواضع الآيات ---- */
var mpiPIs={};
function mpiInitIdx(){
  var st=mpiSet();if(!mpiPIs[st]){var PI=[],P0=mpiA().p;for(var i0=0;i0<P0.length;i0++){if(!PI[P0[i0]])PI[P0[i0]]=[i0,i0];else PI[P0[i0]][1]=i0}mpiPIs[st]=PI}mpiPI=mpiPIs[st];
  if(mpiCum)return;var P=[];mpiCum=[0];var D=QD();for(var c=0;c<D.s.length;c++)mpiCum.push(mpiCum[c]+D.s[c].length);
}
function mpiG2K(g){mpiInitIdx();var c=1;while(c<114&&g>mpiCum[c])c++;return c+':'+(g-mpiCum[c-1])}

function mpiBands(g,p){
  var A=mpiA(),C=mpiC(p),MPI_PITCH=C.P,MPI_L=C.L,MPI_R=C.R,MPI_TOP=C.TOP,MPI_BOT=C.BOT,i=g-1,onP=(A.p[i]===p),kk=mpiG2K(g).split(':'),c=+kk[0],v=+kk[1],sx,sy,ex,ey,out=[];
  mpiInitIdx();
  var prevOn=i>0&&A.p[i-1]===p,newSura=(v===1&&c!==1);
  if(onP){
    ex=A.x[i]-2;ey=A.y[i]+C.hy;
    if(prevOn){if(c===1&&v===2){sx=MPI_R;sy=A.y[i-1]+C.hy+MPI_PITCH}else if(newSura){sx=MPI_R;sy=A.y[i-1]+C.hy+(c===9?2:3)*MPI_PITCH}else{sx=A.x[i-1]-2;sy=A.y[i-1]+C.hy}}
    else{sx=MPI_R;sy=c===1?ey:newSura?(c===9?C.TW:C.NS):MPI_TOP}
  }else{
    var li=mpiPI[p][1];sx=A.x[li]-2;sy=A.y[li]+C.hy;ex=MPI_L;ey=MPI_BOT;
    if(MPI_BOT-sy<MPI_PITCH*.5)return out;
  }
  if(sy>ey)sy=ey;
  var n=Math.max(0,Math.round((ey-sy)/MPI_PITCH));
  for(var k=0;k<=n;k++){
    var y=n?sy+(ey-sy)*k/n:sy,x0=(k===n?ex:MPI_L),x1=(k===0?sx:MPI_R);if(x1-x0<8)continue;
    out.push([x0,y-MPI_PITCH*.47,x1-x0,MPI_PITCH*.94]);
  }
  return out;
}
function mpiPageVerses(p){
  mpiInitIdx();var r=mpiPI[p];if(!r)return [];var gs=[];
  for(var i=r[0];i<=r[1];i++)gs.push(i+1);
  if(r[1]+2<=6236)gs.push(r[1]+2);
  return gs;
}
function mpiHit(cx,cy){
  var g=document.querySelector('#mp .pgi');if(!g||!mpiVerses())return '';
  var b=g.getBoundingClientRect(),p=+g.getAttribute('data-p'),D0=mpiDim(p),W0=D0[0],H0=D0[1],x=(cx-b.left)/b.width*W0,y=(cy-b.top)/b.height*H0;
  var C=mpiC(p);if(x<C.L-6||x>C.R+8||y<C.TOP-45||y>C.BOT+45)return '';
  var best=0,bd=1e9;
  mpiPageVerses(p).forEach(function(gv){mpiBands(gv,p).forEach(function(r){
    var dx=x<r[0]?r[0]-x:x>r[0]+r[2]?x-(r[0]+r[2]):0,dy=y<r[1]?r[1]-y:y>r[1]+r[3]?y-(r[1]+r[3]):0,d=Math.sqrt(dx*dx+dy*dy);
    if(d<bd){bd=d;best=gv}})});
  return (best&&bd<14)?mpiG2K(best):'';
}
function mpiPaint(hl){
  var ov=document.querySelector('#mp .pgi-ov'),g=ov&&ov.parentNode;if(!ov||!mpiVerses())return;
  var p=+g.getAttribute('data-p'),D0=mpiDim(p),W0=D0[0],H0=D0[1],h='';
  function box(r,cls){return '<i class="pgb '+cls+'" style="left:'+(r[0]/W0*100).toFixed(2)+'%;top:'+(r[1]/H0*100).toFixed(2)+'%;width:'+(r[2]/W0*100).toFixed(2)+'%;height:'+(r[3]/H0*100).toFixed(2)+'%"></i>'}
  var vm=typeof mpVm==='function'?mpVm():{};
  mpiPageVerses(p).forEach(function(gv){var key=mpiG2K(gv);
    if(vm[key])mpiBands(gv,p).forEach(function(r){h+=box(r,'mk')});
    if(hl&&key===hl)mpiBands(gv,p).forEach(function(r){h+=box(r,'hl')});
  });
  ov.innerHTML=h;
}
/* ---- تنزيل المصحف كاملًا ---- */

function mpiDownloadAll(){
  if(mpiDl.on)return;mpiDl={on:true,n:0,stop:false,fail:0};var set=mpiSet(),next=1,run=0;
  function ui(){var e=document.getElementById('mpi-dl');if(e)e.innerHTML=mpiDlHtml()}
  function step(){
    if(mpiDl.stop||next>604){if(run===0){mpiDl.on=false;mpiCached=-1;ui();toast(mpiDl.fail?'اكتمل التنزيل مع '+ar(mpiDl.fail)+' صفحة ناقصة':'اكتمل تنزيل المصحف')}return}
    var p=next++,k=set+'/'+p+(set==='warsh-a'?'.png':'.jpg');run++;
    var ck='https://alsaer.local/pages/'+k;
    caches.open(mpiCacheName()).then(function(c){return c.match(ck).then(function(r){return r||mpiFetchNet(k).then(function(nr){return c.put(ck,nr.clone())})})})
      .then(function(){mpiDl.n++},function(){mpiDl.fail++}).then(function(){run--;if(p%8===0)ui();step()});
  }
  ui();for(var i=0;i<3;i++)step();
}
function mpiDlHtml(){
  var n=mpiCached>=0?mpiCached:0;
  if(mpiDl.on)return '<div class="mpi-bar"><i style="width:'+Math.min(100,(mpiDl.n/6.04))+'%"></i></div><small>جارٍ التنزيل… '+ar(mpiDl.n)+' / ٦٠٤ <button class="chip" data-mp="dlstop">إيقاف</button></small>';
  return '<small>المحفوظ على هاتفك من '+(mpiSet()==='warsh-a'?'ورش':'حفص')+': '+ar(n)+' / ٦٠٤ صفحة</small><div class="acts" style="margin-top:8px"><button class="btn ghost" data-mp="dlall">تنزيل المصحف للقراءة بلا إنترنت (نحو ١٨٠ ميغابايت)</button>'+(n?'<button class="btn ghost" data-mp="dlclear">حذف المحفوظ</button>':'')+'</div>';
}

document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-mp]');if(!b)return;var k=b.getAttribute('data-mp');
  if(k==='dlall'){if(!window.caches){toast('الحفظ على الهاتف غير متاح هنا');return}mpiDownloadAll()}
  else if(k==='dlstop'){mpiDl.stop=true}
  else if(k==='dlclear'){if(window.caches)caches.delete(mpiCacheName()).then(function(){mpiCached=-1;mpiMem={};mpiOrd=[];var el=document.getElementById('mpi-dl');if(el)el.innerHTML=mpiDlHtml();toast('حُذفت الصفحات المحفوظة')})}
});
if(/alsaertest/.test(location.search))window.__MPI={open:function(){mpOpen()},hit:mpiHit,bands:mpiBands,verses:mpiPageVerses,k:mpiG2K};

/* ---- طلب إذن التنزيل (مرة واحدة) ---- */
var mpiAsked=false;
function mpiAskMaybe(){return;
  if(mpiAsked||!S.quran||S.quran.img!==undefined||tab!=='reader'||document.getElementById('mpi-ask'))return;mpiAsked=true;
  var d=document.createElement('div');d.id='mpi-ask';d.className='mps-wrap';
  d.innerHTML='<div class="mps-back" data-mp="imgno"></div><section class="mps" role="dialog" aria-modal="true"><div class="mps-grab"></div><div class="mps-h"><h3>صور المصحف المدني</h3></div>'
   +'<p class="note" style="margin:8px 2px;line-height:1.9">هل تريد عرض المصحف بصور طبعة المدينة النبوية (حفص وورش)؟ تُحمَّل كل صفحة من الإنترنت عند فتحها (نحو ٣٠٠ كيلوبايت للصفحة) ثم تبقى على هاتفك، ولن يُنزَّل شيء قبل موافقتك. يمكنك تغيير ذلك لاحقًا من خيارات المصحف.</p>'
   +'<div class="acts"><button class="btn" data-mp="imgyes">نعم، حمّل الصفحات عند الحاجة</button><button class="btn ghost" data-mp="imgno">لا، استخدم النص المزخرف</button></div></section>';
  document.body.appendChild(d);
}

/* مرشّحات SVG لتغليظ خط الصورة (تعمل على الأسود فقط): تُستعمل من خيار «سماكة الخط» */
try{var sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('width','0');sv.setAttribute('height','0');sv.style.cssText='position:absolute;width:0;height:0';
sv.innerHTML='<filter id="mpt1" x="0" y="0" width="100%" height="100%"><feComponentTransfer><feFuncR type="gamma" amplitude="1" exponent="1.7" offset="0"/><feFuncG type="gamma" amplitude="1" exponent="1.7" offset="0"/><feFuncB type="gamma" amplitude="1" exponent="1.7" offset="0"/></feComponentTransfer></filter><filter id="mpt2" x="0" y="0" width="100%" height="100%"><feMorphology operator="erode" radius="0.35"/><feComponentTransfer><feFuncR type="gamma" amplitude="1" exponent="2.1" offset="0"/><feFuncG type="gamma" amplitude="1" exponent="2.1" offset="0"/><feFuncB type="gamma" amplitude="1" exponent="2.1" offset="0"/></feComponentTransfer></filter>';
(document.body||document.documentElement).appendChild(sv)}catch(e){}
