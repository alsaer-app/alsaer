var SPG={};
function isW(){return S.quran&&S.quran.riwaya==='warsh'&&!!window.WDATA}
function WD(){return window.WDATA||{s:[],p:[],b:''}}
/* بيانات الرواية الحالية: حفص QDATA أو ورش WDATA مع أسماء السور من QDATA (WDATA بلا أسماء) */
var ADc={w:null,o:null};
function AD(){var Q=QD();try{var rv=isW()?'w':'h';if(document.documentElement.getAttribute('data-riw')!==rv)document.documentElement.setAttribute('data-riw',rv)}catch(e){}if(!isW())return Q;var W=WD();if(ADc.w!==W||ADc.q!==Q){ADc={w:W,q:Q,o:{n:Q.n,s:W.s,p:W.p,b:W.b}}}return ADc.o}
/* عرض فقط: الخط المشرقي لا يملك الياء المغربية (U+06D2) وألف الوصل بعلامات ورش، فتُرسم بما يقابلها؛ النص المخزَّن لا يتغيّر */
function warshFix(t){
  return String(t).replace(/\u06D2/g,'\u064A')
    .replace(/(^|[\s\u00A0\u06D6-\u06DF\u064B-\u0652]|[وف][\u064B-\u0652])ا[\u064B-\u0652]?\u06EC/g,'$1\u0671')
    .replace(/(^|[\s\u00A0])ا[\u064B-\u0652]?\u06EA/g,'$1\u0671')
}
function curP(){return isW()?WD().p:QD().p}
function suraPage(c){
  var rk=isW()?'w':'h',SG=SPG[rk];
  if(!SG){SG=SPG[rk]=[];var P=curP();for(var i=0;i<P.length;i++){var r=P[i];for(var c2=r[0];c2<=r[2];c2++){if(!SG[c2]&&((c2===r[0]&&r[1]===1)||c2>r[0]))SG[c2]=i+1}}}
  return SG[c]||1;
}
function riwSwitch(){
  if(!window.WDATA)return '';
  var w=isW();
  return '<div class="riw" role="group" aria-label="الرواية"><button class="'+(w?'':'on')+'" data-a="qriw" data-v="hafs" aria-pressed="'+!w+'">رواية حفص</button><button class="'+(w?'on':'')+'" data-a="qriw" data-v="warsh" aria-pressed="'+w+'">رواية ورش</button></div>';
}

function QD(){return window.QDATA||{n:[],s:[],p:[]}}
function ar(n){if(typeof lang==='function'&&lang()!=='ar')return String(n);return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})}
function pageSura(p){var r=curP()[p-1];return r?QD().n[r[0]-1]:''}
function khatmaEta(total){
  var goal=Math.max(1,S.quran.goal),left=QURAN_PAGES-(total%QURAN_PAGES),days=Math.ceil(left/goal),d=new Date();d.setDate(d.getDate()+days);
  var ds=d.toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'});
  return '<section class="card flat khe" style="font-variant-numeric:tabular-nums"><div class="rm-ic">'+ic('flag')+'</div><div class="rm-tx"><b>تنتهي ختمتك بإذن الله في '+esc(ds)+'</b><small style="letter-spacing:.4px">متبقٍ '+ar(left)+' صفحة · نحو '+ar(days)+' يومًا بوردك الحالي ('+ar(goal)+' '+(goal<11?'صفحات':'صفحة')+' يوميًا)</small></div></section>';
}
