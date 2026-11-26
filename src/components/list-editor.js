/* ===== نوافذ التعديل (سحب وإخفاء وتثبيت) ===== */
var wkEdSec=null,wkMode='';
function wkRow(id,label,icon,extra){var w=wkS(),H=wkMode==='bn'?w.bnh:w.hid;return '<div class="wk-r'+(H[id]?' off':'')+'" data-id="'+id+'"><span class="wk-grip" aria-label="اسحب لإعادة الترتيب">⋮⋮</span><span class="wk-ri">'+(icon?ic(icon):'')+'</span><b>'+label+'</b>'+(extra||'')+'<button class="wk-rb'+(w.pin[id]?' on':'')+'" data-wk="pin" data-id="'+id+'" aria-label="تثبيت">'+ic('flag')+'</button><button class="wk-rb" data-wk="eye" data-id="'+id+'" aria-label="إظهار أو إخفاء">'+(H[id]?ic('eyeoff'):ic('check'))+'</button></div>'}
function wkSheet(){
  var w=wkS(),h='<div class="mps-back" data-wk="close"></div><section class="mps" role="dialog" aria-modal="true"><div class="mps-grab"></div>';
  if(wkMode==='home'){
    h+='<div class="mps-h"><button class="mps-x" data-wk="close" aria-label="إغلاق">'+ic('x')+'</button><h3>'+ic('menu')+'تخصيص الرئيسية</h3></div><p class="note">أظهر أو أخفِ ما تشاء، وتتغير الصفحة خلفك فورًا.</p>'
     +HOME_SECS.map(function(x){var on=!hidH(x[0]);return '<div class="rm-row'+(on?' on':'')+'" style="margin:6px 0"><div class="rm-tx"><b>'+x[1]+'</b></div><label class="rm-sw"><input type="checkbox" data-hide="'+x[0]+'" '+(on?'checked':'')+'><i></i></label></div>'}).join('')
     +'<div class="hc-btns"><button class="btn ghost" data-a="wkedit" data-v="quran">اختصارات القرآن</button><button class="btn ghost" data-a="wkedit" data-v="adhkar">اختصارات الأذكار</button><button class="btn ghost" data-a="wkedit" data-v="ibadat">اختصارات العبادات</button></div>'
     +'<div class="wk-foot"><button class="btn" data-wk="close">تم</button></div></section>';
    return h;
  }
  if(wkMode==='sec'){
    var sec=wkEdSec,ids=wkIds(sec);
    h+='<div class="mps-h"><button class="mps-x" data-wk="close" aria-label="إغلاق">'+ic('x')+'</button><h3>'+ic('pencil')+'تعديل القائمة · '+WK_SECN[sec][0]+'</h3></div><p class="note">اسحب ⋮⋮ لتغيير الترتيب. العناصر المثبّتة تظهر أولًا.</p>';
    if(sec==='quran')h+='<div class="wk-add"><select id="wk-addsel" class="rm-sel"><option value="">إضافة سورة…</option>'+SURAS.map(function(n,i){return '<option value="sura_'+(i+1)+'">'+(i+1)+' · '+n+'</option>'}).join('')+'</select></div>';
    if(sec==='adhkar'){var have=ids;h+='<div class="wk-add"><select id="wk-addsel" class="rm-sel"><option value="">إضافة ذكر…</option>'+ADHKAR.filter(function(g){return have.indexOf(g.id)<0}).map(function(g){return '<option value="'+g.id+'">'+g.title+'</option>'}).join('')+'</select></div>'}
    h+='<div class="wk-list" id="wk-list">'+ids.map(function(id){var it=wkItem(id);return wkRow(id,it.l,it.i,(/^sura_|^(sleep|urge|afterprayer)$/.test(id)&&(w.cus[sec]||[]).indexOf(id)>=0)?'<button class="wk-rb" data-wk="del" data-id="'+id+'" aria-label="حذف">'+ic('trash')+'</button>':'')}).join('')+'</div>';
  }else if(wkMode==='bn'){
    h+='<div class="mps-h"><button class="mps-x" data-wk="close" aria-label="إغلاق">'+ic('x')+'</button><h3>'+ic('menu')+'إعداد البانرات</h3></div><p class="note">اسحب لتغيير الترتيب، وأخفِ ما لا تحتاجه.</p><div class="wk-list" id="wk-list">'+w.bn.map(function(id){return wkRow(id,WK_BN.filter(function(x){return x[0]===id})[0][1],id==='time'?'clock':(id==='daily'?'sun':'mosque')).replace('data-wk="pin"','data-wk="x"').replace(/<button class="wk-rb[^"]*" data-wk="x"[^>]*>.*?<\/button>/,'')}).join('')+'</div>'
     +'<div class="rm-row'+(w.auto?' on':'')+'" style="margin:12px 0 6px"><div class="rm-tx"><b>تقليب البانرات تلقائيًا</b><small>إن أُطفئ يبقى البانر ثابتًا</small></div><label class="rm-sw"><input type="checkbox" data-wk="auto" '+(w.auto?'checked':'')+'><i></i></label></div>'
     +'<button class="btn ghost block" data-wk="per" style="margin-top:6px">'+ic('clock')+' ضبط أوقات بانر «ذكر هذا الوقت»</button>';
  }else if(wkMode==='per'){
    var opts=['morning','evening','afterprayer','sleep','tasbih','quran','kahf','mulk'];
    h+='<div class="mps-h"><button class="mps-x" data-wk="close" aria-label="إغلاق">'+ic('x')+'</button><h3>'+ic('clock')+'أوقات البانر</h3></div><p class="note">لكل فترة وقت بداية ونهاية والأذكار التي تظهر فيها.</p>'
     +w.per.map(function(P,i){return '<div class="wk-per"><div class="wk-pt"><input class="rm-sel" data-wkp="'+i+'.n" value="'+esc(P.n)+'" aria-label="اسم الفترة"><input type="time" class="rm-sel" data-wkp="'+i+'.f" value="'+esc(P.f)+'"><span>→</span><input type="time" class="rm-sel" data-wkp="'+i+'.t" value="'+esc(P.t)+'"></div><div class="wk-chips">'+opts.map(function(o){var it=wkItem(o);return '<button class="wk-chip'+((P.g||[]).indexOf(o)>=0?' on':'')+'" data-wk="pg" data-i="'+i+'" data-o="'+o+'">'+it.l+'</button>'}).join('')+'</div></div>'}).join('')
     +'<button class="btn ghost block" data-wk="perreset">استعادة الأوقات الافتراضية</button>';
  }
  h+='<div class="wk-foot"><button class="btn ghost" data-wk="reset">استعادة الترتيب الافتراضي</button><button class="btn" data-wk="close">تم</button></div></section>';
  return h;
}
function wkOpen(m,sec){wkMode=m;wkEdSec=sec||null;var o=document.getElementById('mps-wrap');if(o)o.remove();var w=document.createElement('div');w.id='mps-wrap';w.className='mps-wrap';w.dataset.keep=tab;w.innerHTML=wkSheet();document.body.appendChild(w)}
function wkRefresh(){var w=document.getElementById('mps-wrap');if(w){var sc=w.querySelector('.mps');var t=sc?sc.scrollTop:0;w.innerHTML=wkSheet();var s2=w.querySelector('.mps');if(s2)s2.scrollTop=t}}
function wkSaveOrder(){
  var L=document.getElementById('wk-list');if(!L)return;var ids=[].map.call(L.querySelectorAll('.wk-r'),function(r){return r.getAttribute('data-id')}),w=wkS();
  if(wkMode==='bn')w.bn=ids;else if(wkMode==='sec')w.ord[wkEdSec]=ids;save();render();
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-wk]');if(!b||b.tagName==='INPUT')return;var k=b.getAttribute('data-wk'),id=b.getAttribute('data-id'),w=wkS();
  if(k==='close'){mpClose();return}
  if(k==='pin'){if(w.pin[id])delete w.pin[id];else w.pin[id]=1}
  else if(k==='eye'){var H=wkMode==='bn'?w.bnh:w.hid;if(H[id])delete H[id];else H[id]=1}
  else if(k==='del'){var c=w.cus[wkEdSec]||[];w.cus[wkEdSec]=c.filter(function(x){return x!==id});w.ord[wkEdSec]=(w.ord[wkEdSec]||WK_DEF[wkEdSec]).filter(function(x){return x!==id})}
  else if(k==='reset'){if(wkMode==='sec'){delete w.ord[wkEdSec];w.cus[wkEdSec]=[];WK_DEF[wkEdSec].forEach(function(x){delete w.hid[x];delete w.pin[x]})}else if(wkMode==='bn'){w.bn=['time','daily','worship'];w.bnh={};w.auto=false}else if(wkMode==='per')w.per=JSON.parse(JSON.stringify(WK_PER))}
  else if(k==='perreset'){w.per=JSON.parse(JSON.stringify(WK_PER))}
  else if(k==='per'){wkMode='per'}
  else if(k==='pg'){var P=w.per[+b.getAttribute('data-i')],o=b.getAttribute('data-o');P.g=P.g||[];var ix=P.g.indexOf(o);if(ix>=0)P.g.splice(ix,1);else P.g.push(o)}
  else return;
  save();wkRefresh();render();
});
document.addEventListener('change',function(e){
  var t=e.target;if(!t||!t.getAttribute)return;var w=wkS();
  if(t.id==='wk-addsel'&&t.value){var c=w.cus[wkEdSec]=w.cus[wkEdSec]||[];if(c.indexOf(t.value)<0)c.push(t.value);var o=w.ord[wkEdSec]||WK_DEF[wkEdSec].slice();if(o.indexOf(t.value)<0)o.push(t.value);w.ord[wkEdSec]=o;save();wkRefresh();render();return}
  if(t.getAttribute('data-wk')==='auto'){w.auto=t.checked;save();wkRefresh();return}
  var pp=t.getAttribute('data-wkp');if(pp){var a=pp.split('.'),P=w.per[+a[0]];if(P){P[a[1]]=t.value;save();render()}}
});
/* سحب لإعادة الترتيب: الالتقاط على الحاوية لا على الصف (نقل الصف في DOM كان يُلغي الالتقاط ويوقف السحب بعد أول خطوة)، مع تمرير تلقائي قرب الحافة */
(function(){var drag=null,box=null,pid=null,lastY=0,timer=0,moved=false;
function sheet(){return document.querySelector('.mps')}
function place(){
  if(!drag)return;var L=drag.parentNode,rows=[].slice.call(L.querySelectorAll('.wk-r')).filter(function(x){return x!==drag}),y=lastY,tgt=null;
  for(var i=0;i<rows.length;i++){var rc=rows[i].getBoundingClientRect();if(y<rc.top+rc.height/2){tgt=rows[i];break}}
  var cur=drag.nextElementSibling;
  if(tgt){if(tgt!==drag.nextElementSibling){L.insertBefore(drag,tgt);moved=true}}else if(cur){L.appendChild(drag);moved=true}
}
function tick(){
  var sc=sheet();if(!drag||!sc)return;var r=sc.getBoundingClientRect(),d=0;
  if(lastY<r.top+46)d=-9;else if(lastY>r.bottom-46)d=9;
  if(d){sc.scrollTop+=d;place()}
}
document.addEventListener('pointerdown',function(e){
  var g=e.target.closest&&e.target.closest('.wk-grip');if(!g)return;var r=g.closest('.wk-r');if(!r)return;
  drag=r;box=r.parentNode;pid=e.pointerId;lastY=e.clientY;moved=false;r.classList.add('drag');
  try{box.setPointerCapture(e.pointerId)}catch(x){}
  clearInterval(timer);timer=setInterval(tick,30);
  try{navigator.vibrate&&navigator.vibrate(10)}catch(x){}
  e.preventDefault();
});
document.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==pid)return;e.preventDefault();lastY=e.clientY;place()},{passive:false});
function end(e){
  if(!drag||(e&&e.pointerId!==pid))return;
  clearInterval(timer);try{box.releasePointerCapture(pid)}catch(x){}
  drag.classList.remove('drag');drag=null;box=null;
  if(moved)wkSaveOrder();
}
document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
})();
