var SPG={};
function isW(){return false}
function AD(){return QD()}
function curP(){return QD().p}
function suraPage(c){
  var rk='h',SG=SPG[rk];
  if(!SG){SG=SPG[rk]=[];var P=curP();for(var i=0;i<P.length;i++){var r=P[i];for(var c2=r[0];c2<=r[2];c2++){if(!SG[c2]&&((c2===r[0]&&r[1]===1)||c2>r[0]))SG[c2]=i+1}}}
  return SG[c]||1;
}
function QD(){return window.QDATA||{n:[],s:[],p:[]}}
function ar(n){if(typeof lang==='function'&&lang()!=='ar')return String(n);return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})}
function pageSura(p){var r=curP()[p-1];return r?QD().n[r[0]-1]:''}
function khatmaEta(total){
  var goal=Math.max(1,S.quran.goal),left=QURAN_PAGES-(total%QURAN_PAGES),days=Math.ceil(left/goal),d=new Date();d.setDate(d.getDate()+days);
  var ds=d.toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'});
  return '<section class="card flat khe" style="font-variant-numeric:tabular-nums"><div class="rm-ic">'+ic('flag')+'</div><div class="rm-tx"><b>تنتهي ختمتك بإذن الله في '+esc(ds)+'</b><small style="letter-spacing:.4px">متبقٍ '+ar(left)+' صفحة · نحو '+ar(days)+' يومًا بوردك الحالي ('+ar(goal)+' '+(goal<11?'صفحات':'صفحة')+' يوميًا)</small></div></section>';
}
