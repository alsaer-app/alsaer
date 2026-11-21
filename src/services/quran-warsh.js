var SPG={};
function isW(){return S.quran&&S.quran.riwaya==='warsh'&&!!window.WDATA}
function WD(){return window.WDATA||{s:[],p:[],b:''}}
function curP(){return isW()?WD().p:QD().p}
function suraPage(c){
  var rk=isW()?'w':'h',SG=SPG[rk];
  if(!SG){SG=SPG[rk]=[];var P=curP();for(var i=0;i<P.length;i++){var r=P[i];for(var c2=r[0];c2<=r[2];c2++){if(!SG[c2]&&((c2===r[0]&&r[1]===1)||c2>r[0]))SG[c2]=i+1}}}
  return SG[c]||1;
}
/* تلوين أحكام التجويد لورش: المحرك في tajweed_warsh.js ويُحلَّل نص كل آية مع أول الآية التالية */
var WTK={};
function wtj(c,v){
  var key=c+':'+v,r=WTK[key];if(r)return r;
  var D=WD(),txt=D.s[c-1][v-1],cls=null,off=0;
  try{if(window.WTJ)cls=WTJ.analyze(txt,D.s[c-1][v]||'')}catch(e){cls=null}
  r=txt.split(' ').map(function(t){var o={t:t,k:cls?Array.prototype.slice.call(cls,off,off+t.length):null};off+=t.length+1;return o});
  return(WTK[key]=r);
}
function wtjHtml(t,k){
  if(!k)return esc(t);
  var out='',cur=-1,i,c;
  for(i=0;i<t.length;i++){
    c=k[i];if(c===undefined)c=-1;
    if(c!==cur){if(cur>=0)out+='</i>';if(c>=0)out+='<i class="t'+c+'">';cur=c}
    out+=esc(t.charAt(i));
  }
  return out+(cur>=0?'</i>':'');
}
function wtjBsm(){
  var b=WD().b,k=null;
  try{if(window.WTJ)k=Array.prototype.slice.call(WTJ.analyze(b,''))}catch(e){k=null}
  var f=warshFixK(b,k);return wtjHtml(f.t,f.k);
}
function riwSwitch(){
  if(!window.WDATA)return '';
  var w=isW();
  return '<div class="riw" role="group" aria-label="الرواية"><button class="'+(w?'':'on')+'" data-a="qriw" data-v="hafs" aria-pressed="'+!w+'">رواية حفص</button><button class="'+(w?'on':'')+'" data-a="qriw" data-v="warsh" aria-pressed="'+w+'">رواية ورش</button></div>';
}

function vWarshReader(){
  var p=rd.page,W=WD(),r=W.p[p-1],n=p-rd.from+1,tj=S.quran.tj!==false,mu=[r[4],0,r[0]];S.quran.last=p;
  var lg=tj?'<div class="tjl">'+TJL.map(function(x){return '<span><i class="t'+x[1]+'"></i>'+x[0]+'</span>'}).join('')+'</div>':'';
  var useImg=mpiOnFor(p);
  var mainH=useImg?mpiMain(p,mu):'<div class="mp wr'+(tj?'':' notj')+'" id="mp"><div class="mp-in">'
  +'<div class="mp-h"><span>الجزء '+ar(r[4])+'</span><span class="sb">'+esc(QD().n[r[0]-1])+'</span></div>'
  +'<div class="mp-l wl" lang="ar" dir="rtl" style="visibility:hidden"></div>'
  +'<div class="mp-f"><span class="pn">'+ar(p)+'</span></div></div></div>';
  var ctlH='<div class="rbar"><button class="ib bm" data-a="bmtog" aria-label="علامة" aria-pressed="'+bmHas(rd&&rd.page)+'">'+(bmHas(rd&&rd.page)?'★':'☆')+'</button><button class="ib" data-a="qpage" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'</button>'
  +'<div class="rmid"><b>'+ar(n)+' / '+ar(rd.to-rd.from+1)+'</b><small>من وردك</small></div>'
  +'<button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button>'
  +'<button class="ib" data-a="qpage" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+ic('chev')+'</button></div>'
  +(useImg?'':lg)
  +'<div class="fsz"><button class="ib" data-a="mpset">'+ic('gear')+'إعدادات المصحف</button><button class="ib" data-a="qtj" aria-pressed="'+tj+'">ألوان التجويد: '+(tj?'تشغيل':'إيقاف')+'</button></div>';
  return mpWrap(mainH,ctlH,p,mu);
}
function QD(){return window.QDATA||{n:[],s:[],p:[]}}
function ar(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})}
function pageSura(p){var r=curP()[p-1];return r?QD().n[r[0]-1]:''}
function khatmaEta(total){
  var goal=Math.max(1,S.quran.goal),left=QURAN_PAGES-(total%QURAN_PAGES),days=Math.ceil(left/goal),d=new Date();d.setDate(d.getDate()+days);
  var ds=d.toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'});
  return '<section class="card flat khe"><div class="rm-ic">'+ic('flag')+'</div><div class="rm-tx"><b>تنتهي ختمتك بإذن الله في '+esc(ds)+'</b><small>متبقٍ '+ar(left)+' صفحة · نحو '+ar(days)+' يومًا بوردك الحالي ('+ar(goal)+' '+(goal<11?'صفحات':'صفحة')+' يوميًا)</small></div></section>';
}
