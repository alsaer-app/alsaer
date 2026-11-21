/* ===== إعدادات المصحف (ورقة سفلية) ===== */
var MP_BG=[['ornate','مزخرف'],['auto','تلقائي'],['cream','ورقي'],['white','أبيض'],['sepia','سيبيا'],['green','أخضر'],['blue','أزرق'],['black','أسود']];
var MP_FW=[['0','رفيع','ٱللَّهُ لَآ إِلَٰهَ'],['1','عريض','ٱللَّهُ لَآ إِلَٰهَ'],['2','غامق جدًا','ٱللَّهُ لَآ إِلَٰهَ']];
function applyMp(){
  var m=document.getElementById('mp');if(!m)return;var q=S.quran||{};
  MP_BG.forEach(function(x){m.classList.remove('pgc-'+x[0])});['0','1','2'].forEach(function(x){m.classList.remove('fw'+x)});
  var pgv=q.pg===undefined?'ornate':q.pg;if(pgv&&pgv!=='auto')m.classList.add('pgc-'+pgv);
  m.classList.add('fw'+(q.fw||'0'));
  try{mpApplySel()}catch(e){}
  m.classList.toggle('nohd',q.hd===false);m.classList.toggle('nofr',q.fr===false);m.setAttribute('data-an',q.an==='fade'?'fade':'none');m.style.filter=(q.br&&q.br<100)?'brightness('+q.br/100+')':'';
}
function mpSeg(key,items,cur){return '<div class="sg-seg mps-sg">'+items.map(function(x){return '<button type="button" class="'+(String(cur)===String(x[0])?'on':'')+'" data-mp="'+key+'" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'}
function mpTog(key,title,sub,on){return '<div class="rm-row'+(on?' on':'')+'" style="margin:6px 0"><div class="rm-tx"><b>'+title+'</b><small>'+sub+'</small></div><label class="rm-sw"><input type="checkbox" data-mp="'+key+'" '+(on?'checked':'')+'><i></i></label></div>'}
function mpSheetHtml(){
  var q=S.quran||{},pg=q.pg===undefined?'ornate':(q.pg||'auto'),fw=q.fw||'0',tj=q.tj!==false,hd=q.hd!==false,im=q.imm!==false,sw=q.sw===true,an=q.an||'slide',fr=q.fr!==false,br=q.br||100;
  return '<div class="mps-back" data-mp="close"></div><section class="mps" role="dialog" aria-modal="true" aria-label="خيارات المصحف"><div class="mps-grab"></div>'
   +'<div class="mps-h"><button class="mps-x" data-mp="close" aria-label="إغلاق">'+ic('x')+'</button><h3>'+ic('gear')+'خيارات المصحف</h3></div>'
   +'<h4>وضع القراءة</h4>'+mpSeg('im',[[1,'ملء الشاشة'],[0,'أدوات ظاهرة']],im?1:0)
   +'<h4>تقليب الصفحات</h4>'+mpSeg('sw',[[0,'أسهم ثابتة فقط'],[1,'أسهم + سحب']],sw?1:0)+'<div style="height:8px"></div>'+mpSeg('dr',[['rtl','يمينًا = التالية'],['ltr','يسارًا = التالية']],q.dr||'rtl')+'<div style="height:8px"></div>'+mpSeg('an',[['none','بلا حركة'],['fade','تلاشٍ']],an==='fade'?'fade':'none')
   +'<h4>لون الصفحة</h4><div class="mps-bg">'+MP_BG.map(function(x){return '<button class="mps-o mps-c'+(pg===x[0]?' on':'')+'" data-mp="pg" data-v="'+x[0]+'"><i class="bgp pgc-'+x[0]+'"><u></u><u></u><u></u></i><b>'+x[1]+'</b></button>'}).join('')+'</div>'
   +'<h4>سماكة الخط</h4><div class="mps-fw">'+MP_FW.map(function(x){return '<button class="mps-o'+(fw===x[0]?' on':'')+'" data-mp="fw" data-v="'+x[0]+'"><span class="ar fwp fw'+x[0]+'">'+x[2]+'</span><b>'+x[1]+'</b></button>'}).join('')+'</div>'
   +'<h4>سطوع الصفحة</h4><div class="rd-sl"><small>أخفّ</small><input type="range" id="mps-br" data-mp="br" min="45" max="100" step="5" value="'+br+'"><small>أسطع</small></div>'
   +'<h4>عناصر الصفحة</h4>'+mpTog('tj','التجويد الملوّن','تلوين أحكام التجويد',tj)+mpTog('hd','رأس الصفحة','الجزء واسم السورة أعلى الصفحة',hd)+mpTog('fr','الإطار الذهبي','حدّ الصفحة وزخرفتها',fr)
   +'<button class="btn block" data-mp="close" style="margin-top:12px">تم</button></section>';
}
function mpRe(){var w=document.getElementById('mps-wrap');if(!w)return;var o=w.querySelector('.mps'),t=o?o.scrollTop:0;w.innerHTML=mpSheetHtml();var n=w.querySelector('.mps');if(n)n.scrollTop=t}
function mpOpen(){var o=document.getElementById('mps-wrap');if(o)o.remove();var w=document.createElement('div');w.id='mps-wrap';w.className='mps-wrap';w.innerHTML=mpSheetHtml();document.body.appendChild(w)}
function mpClose(){var o=document.getElementById('mps-wrap');if(o)o.remove()}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-mp]');if(!b||b.tagName==='INPUT')return;var k=b.getAttribute('data-mp'),v=b.getAttribute('data-v');
  if(k==='close'){mpClose();return}
  S.quran=S.quran||{};
  if(k==='imgyes'||k==='imgno'){S.quran.img=(k==='imgyes');mpiBad={};var ak=document.getElementById('mpi-ask');if(ak)ak.remove();save();render();return}
  if(k==='fw')S.quran.fw=v;else if(k==='pg')S.quran.pg=v;else if(k==='sw')S.quran.sw=v==='1';else if(k==='an')S.quran.an=v;else if(k==='dr')S.quran.dr=v;
  else if(k==='img'){S.quran.img=(v==='1');mpiBad={};if(rd)rd.ui=false;save();var w1=document.getElementById('mps-wrap'),o1=w1&&w1.querySelector('.mps'),t1=o1?o1.scrollTop:0;render();mpOpen();var n1=document.querySelector('#mps-wrap .mps');if(n1)n1.scrollTop=t1;return}
  else if(k==='im'){S.quran.imm=v==='1';if(rd)rd.ui=false;save();var w0=document.getElementById('mps-wrap'),o0=w0&&w0.querySelector('.mps'),t0=o0?o0.scrollTop:0;render();mpOpen();var n0=document.querySelector('#mps-wrap .mps');if(n0)n0.scrollTop=t0;return}
  else return;
  save();applyMp();mpRe();
});
document.addEventListener('change',function(e){
  var k=e.target&&e.target.getAttribute&&e.target.getAttribute('data-mp');if(!k)return;S.quran=S.quran||{};
  if(k==='tj'){S.quran.tj=e.target.checked;save();render()}
  else if(k==='hd'){S.quran.hd=e.target.checked;save();applyMp()}
  else if(k==='fr'){S.quran.fr=e.target.checked;save();applyMp()}
  else if(k==='br'){S.quran.br=parseInt(e.target.value,10)||100;save();applyMp();return}
  mpRe();
});

document.addEventListener('input',function(e){if(e.target&&e.target.id==='mps-br'){S.quran=S.quran||{};S.quran.br=parseInt(e.target.value,10)||100;applyMp()}});
