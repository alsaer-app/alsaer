/* ترقيم صناديق الحزمة بنمط حفص (البقرة ٢٨٦)، يُحوَّل لترقيم ورش بخريطة التفسير نفسها (مطابقة الصفحات مختبرة في tests/warsh_img_e2e.py). */
/* مصحف ورش المصوّر (اختياري): صور الصفحات وملف المستطيلات يُنزَّلان عند الطلب من عنوان أساس يضبطه المالك (localStorage alsaer_warsh_img_base).
   لا صور ولا بيانات من الحزمة داخل المستودع؛ بلا عنوان أساس يبقى الخيار مخفيًا ويُستعمل عرض النص كما كان. نص القرآن لا يُعدَّل. */
var WI={L:null,lp:null,urls:{},err:0};
function wiBase(){try{var b=localStorage.getItem('alsaer_warsh_img_base')||'';return b?b.replace(/\/*$/,'/'):''}catch(e){return ''}}
function wiOn(){try{return isW()&&!!wiBase()&&S.quran.wimg!==false}catch(e){return false}}
function wiFetch(u,cb){
  var net=function(){fetch(u).then(function(r){cb(r&&r.ok?r:null)}).catch(function(){cb(null)})};
  try{
    if(window.caches){caches.open('alsaer-wimg-v1').then(function(c){
      c.match(u).then(function(m){if(m)return cb(m);
        fetch(u).then(function(r){if(r&&r.ok){try{c.put(u,r.clone())}catch(e){}}cb(r&&r.ok?r:null)}).catch(function(){cb(null)})
      }).catch(net)}).catch(net);return}
  }catch(e){}
  net();
}
function wiLayout(cb){
  if(WI.L)return cb(WI.L);
  if(WI.lp){WI.lp.push(cb);return}
  WI.lp=[cb];
  wiFetch(wiBase()+'layout.json',function(r){
    var fin=function(L){var q=WI.lp;WI.lp=null;if(L)WI.L=L;q.forEach(function(f){try{f(L)}catch(e){}})};
    if(!r)return fin(null);
    r.json().then(function(j){fin(j&&j.pages?j:null)}).catch(function(){fin(null)});
  });
}
function wiPageUrl(pg,cb){
  if(WI.urls[pg])return cb(WI.urls[pg]);
  wiFetch(wiBase()+'pages/'+pg+'.webp',function(r){
    if(!r)return cb(null);
    r.blob().then(function(b){
      var k=Object.keys(WI.urls);if(k.length>6){try{URL.revokeObjectURL(WI.urls[k[0]])}catch(e){}delete WI.urls[k[0]]}
      WI.urls[pg]=URL.createObjectURL(b);cb(WI.urls[pg]);
    }).catch(function(){cb(null)});
  });
}
function wiBody(pg){
  return '<div class="wi-pg" id="wi-pg" data-pg="'+pg+'"><div class="wi-msg">جارٍ التحميل…</div></div>';
}
function wiPaint(){
  var el=document.getElementById('wi-pg');if(!el||el.getAttribute('data-st'))return;
  el.setAttribute('data-st','1');var pg=+el.getAttribute('data-pg');
  var fail=function(){if(document.getElementById('wi-pg')===el)el.innerHTML='<div class="wi-msg">'+netMsg('تعذّر تحميل الصفحة. تحتاج الميزة إلى اتصال بالإنترنت')+'<button class="btn" data-a="wiretry">إعادة المحاولة</button></div>'};
  wiLayout(function(L){
    if(!L)return fail();
    wiPageUrl(pg,function(u){
      if(!u)return fail();
      if(document.getElementById('wi-pg')!==el)return;
      var h='<img class="wi-img" alt="" draggable="false" src="'+u+'"><div class="wi-bx">';
      (L.pages[pg]||[]).forEach(function(r){
        var vv=null;try{vv=mqMapVerse(r[0],r[1],true)}catch(e){}
        if(!vv)return;
        h+='<i class="mq-v wi-b'+(rd&&rd.cv===vv?' cur':'')+'" data-v="'+vv+'" style="left:'+(r[2]*100)+'%;top:'+(r[3]*100)+'%;width:'+(r[4]*100)+'%;height:'+(r[5]*100)+'%"></i>';
      });
      el.innerHTML=h+'</div>';
    });
  });
}
(function(){
  try{new MutationObserver(function(){if(document.getElementById('wi-pg'))wiPaint()}).observe(document.getElementById('app'),{childList:true,subtree:true})}catch(e){}
})();
function wiShare(vv){
  var im=document.querySelector('#wi-pg .wi-img'),bx=[].slice.call(document.querySelectorAll('#wi-pg .wi-b[data-v="'+vv+'"]'));
  if(!im||!bx.length||!im.naturalWidth){toast('تعذّر تجهيز صورة الآية');return}
  var W=im.naturalWidth,H=im.naturalHeight,x0=1,y0=1,x1=0,y1=0;
  bx.forEach(function(b){var l=parseFloat(b.style.left)/100,t=parseFloat(b.style.top)/100,w=parseFloat(b.style.width)/100,h=parseFloat(b.style.height)/100;x0=Math.min(x0,l);y0=Math.min(y0,t);x1=Math.max(x1,l+w);y1=Math.max(y1,t+h)});
  var px=Math.round(.02*W),py=Math.round(.008*H),sx=Math.max(0,Math.round(x0*W)-px),sy=Math.max(0,Math.round(y0*H)-py),sw=Math.min(W-sx,Math.round((x1-x0)*W)+2*px),sh=Math.min(H-sy,Math.round((y1-y0)*H)+2*py);
  var c=document.createElement('canvas');c.width=sw;c.height=sh;var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,sw,sh);g.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);
  c.toBlob(function(b){
    if(!b){toast('تعذّر تجهيز صورة الآية');return}
    try{var f=new File([b],'alsaer-ayah.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){});return}}catch(e){}
    try{var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='alsaer-ayah.png';document.body.appendChild(a);a.click();a.remove();toast('إن لم يبدأ التنزيل، اضغط مطوّلًا على الصورة لحفظها')}catch(e2){toast('تعذّر تجهيز صورة الآية')}
  },'image/png');
}
var WI_NOTXT='البحث والنسخ النصي غير متاحين في مصحف ورش المصوّر. شارك الآية كصورة';
try{if(/alsaertest/.test(location.search))window.__WI={layout:wiLayout,map:function(c,v){return mqMapVerse(c,v,true)},P:function(){return WD().p},L:function(){return WI.L}}}catch(e){}
