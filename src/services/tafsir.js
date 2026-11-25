/* ===== التفسير الميسر: فهرس بالبطاقات + بطاقات آيات قابلة للتوسيع (إعادة تنفيذ لنمط التقوى، الكود لنا).
   قاعدة ثابتة: نص القرآن يُعرض ويُنسخ كما هو مخزَّن حرفيًا، بلا حذف ولا استبدال ولا تطبيع. التفسير يُنسخ وحده مع مرجع الآية. ===== */
function mqTfFetch(vv,cb){
  var ck='alsaer_tf_'+vv,c0='';try{c0=localStorage.getItem(ck)||''}catch(e){}
  if(c0){tfTouch(ck);cb(c0);return}
  var q=String(vv).split(':');
  fetch('https://api.alquran.cloud/v1/ayah/'+q[0]+':'+q[1]+'/ar.muyassar').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
    var t=j&&j.data&&j.data.text;if(!t)throw 0;tfPut(ck,t);cb(t)
  }).catch(function(){cb(null)});
}
function tfCached(vv){try{return localStorage.getItem('alsaer_tf_'+vv)||''}catch(e){return ''}}
function tfSavedCount(){var n=0;try{n=tfIdx().filter(function(k){return k!==TF_IDX}).length}catch(e){}return n}
function tfAyah(c,v){return hafsVerse(c,v)} /* حفص كما في قارئ التدفق: البسملة المُلحقة في المخزَّن تُعرض في الترويسة لا في الآية */
function tfFill(vv,t){
  if(rd&&rd.tf&&t)rd.tf.tx[vv]=t;
  var el=document.querySelector('.mq-tx[data-tv="'+vv+'"]');if(!el)return;
  el.textContent=t||'تعذّر تحميل التفسير. يحتاج إنترنتًا أول مرة لكل آية.';
  if(t)el.removeAttribute('data-ld');else el.setAttribute('data-ld','err');
}
function tfLoad(vv){
  var t=(rd&&rd.tf&&rd.tf.tx[vv])||tfCached(vv);
  if(t){tfFill(vv,t);return}
  mqTfFetch(vv,function(x){tfFill(vv,x)});
}
function tfPost(){
  if(!rd||!rd.tf||rd.tf.mode!=='rd')return;
  [].forEach.call(document.querySelectorAll('.mq-tc.open .mq-tx[data-ld="1"]'),function(el){tfLoad(el.getAttribute('data-tv'))});
  var sv=rd.tf._sv;
  if(sv){rd.tf._sv=null;var c=document.querySelector('.mq-tc[data-tv="'+sv+'"]');if(c)c.scrollIntoView({block:'start'})}
}
function tfOpen(vv){
  var q=String(vv||rd.cv||'1:1').split(':'),c=+q[0]||1,v=+q[1]||1;
  var x={},o={mode:'rd',c:c,x:x,tx:{},fb:false};
  if(!isW()){x[c+':'+v]=true;o._sv=c+':'+v;S.quran.tfPos={c:c,v:v};save()}
  else toast('ترقيم التفسير حسب حفص، فُتحت السورة من أولها');
  rd.tf=o;render();setTimeout(tfPost,80);
}
function tfAct(a,v){
  if(!rd||!rd.tf)return true;
  var t=rd.tf;
  if(a==='qtfback'){if(t.mode==='rd'&&t.fb){t.mode='idx';t.fb=false}else rd.tf=null;return false}
  if(a==='qtfidx'){t.mode='idx';t.fb=false;return false}
  if(a==='qtfsura'){
    var p=String(v).split(':'),c=parseInt(p[0],10),vv=p[1]?parseInt(p[1],10):0;if(!(c>=1&&c<=114))return true;
    var o={mode:'rd',c:c,x:{},tx:t.tx||{},fb:true};
    if(vv){o.x[c+':'+vv]=true;o._sv=c+':'+vv}
    S.quran.tfPos={c:c,v:vv||1};save();rd.tf=o;setTimeout(tfPost,80);return false}
  if(a==='qtfx'){
    var card=document.querySelector('.mq-tc[data-tv="'+v+'"]');if(!card)return true;
    var open=!card.classList.contains('open');card.classList.toggle('open',open);
    var q=String(v).split(':');if(open){t.x[v]=true;S.quran.tfPos={c:+q[0],v:+q[1]};save();tfLoad(v)}else delete t.x[v];
    var hb=card.querySelector('.mq-tch');if(hb)hb.setAttribute('aria-expanded',open?'true':'false');
    return true}
  if(a==='qtfcp'){
    var tx=t.tx[v]||tfCached(v);if(!tx){toast('لم يُحمَّل التفسير بعد');return true}
    var q2=String(v).split(':'),ref='\u2014 سورة '+QD().n[+q2[0]-1]+' \u00B7 آية '+q2[1]+' (التفسير الميسر)';
    try{navigator.clipboard.writeText(tx+'\n'+ref);toast('تم نسخ التفسير')}catch(e){toast('تعذّر النسخ')}
    return true}
  if(a==='qtfgo'){
    var q3=String(v).split(':'),c3=+q3[0],v3=+q3[1]||1;
    rd.tf=null;mpSel='';rd.sura=c3;rd.idx=false;rd.jump=false;
    if(isW()){rd.cv=c3+':1';toast('ترقيم التفسير حسب حفص، فُتحت السورة من أولها')}else rd.cv=c3+':'+v3;
    rd._scrollCv=rd.cv;return false}
  return true;
}
function mqTafsirHtml(){
  if(!rd||!rd.tf)return '';
  var t=rd.tf,D=QD(),tfs=tfSz();
  var back='<button class="mq-bk" data-a="qtfback" aria-label="رجوع">'+ic('chev')+'</button>';
  if(t.mode==='idx'){
    var pos=S.quran.tfPos,n=0;for(var i=0;i<114;i++)n+=D.s[i].length;
    var cont=pos&&pos.c>=1&&pos.c<=114?'<button class="mq-ixc" data-a="qtfsura" data-v="'+pos.c+':'+pos.v+'"><span class="mq-ixci">'+ic('book')+'</span><span class="t">متابعة التفسير<small>سورة '+esc(D.n[pos.c-1])+' \u00B7 آية '+ar(pos.v)+'</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>':'';
    return '<div class="mq-ov mq-tf" id="mq-tf"><div class="mq-hd">'+back+'<b class="mq-tt">التفسير</b></div><div class="mq-ixs">'
      +'<div class="mq-tfh"><span class="mq-tfb">'+ic('book')+'</span><h2>التفسير الميسر</h2><p class="s">تفسير موجز لكل آية</p>'
      +'<p class="d">اضغط على أي آية لتفتح تفسيرها في مكانها. يُحمَّل التفسير من الإنترنت أول مرة لكل آية، ثم يبقى محفوظًا على جهازك للقراءة بلا إنترنت.</p>'
      +'<div class="mq-tfst"><div><b>'+ar(114)+'</b><small>سورة</small></div><div><b>'+ar(n)+'</b><small>آية</small></div><div><b>'+ar(tfSavedCount())+'</b><small>تفسير محفوظ</small></div></div></div>'
      +cont+'<div class="mq-ixsb">'+ic('search')+'<input id="mptf-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="ابحث عن سورة بالاسم أو الرقم" aria-label="بحث في فهرس التفسير"></div>'
      +'<div class="mq-ixg">'+D.n.map(function(nm,i){return '<button class="mq-ixr" data-s="'+esc(mpIxNorm(nm)+'|'+(i+1))+'" data-a="qtfsura" data-v="'+(i+1)+'"><span class="mq-ixt"><b>'+esc(nm)+'</b><small>'+suraMeta(i+1)+'</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'}).join('')+'</div>'
      +'<p class="note" id="mptf-none" hidden>لا توجد سورة بهذا الاسم أو الرقم</p></div></div>';
  }
  var c=t.c,vs=D.s[c-1],h='';
  for(var v=1;v<=vs.length;v++){
    var vv=c+':'+v,open=!!t.x[vv],tx=open?(t.tx[vv]||tfCached(vv)):'';
    h+='<div class="mq-tc'+(open?' open':'')+'" data-tv="'+vv+'"><button class="mq-tch" data-a="qtfx" data-v="'+vv+'" aria-expanded="'+(open?'true':'false')+'"><span class="mq-tcm">'+ar(v)+'</span>'
      +'<span class="mq-tca" lang="ar" dir="rtl" style="font-size:'+(tfs+6)+'px">'+esc(tfAyah(c,v))+'</span>'+ic('chev').replace('class="i"','class="i mq-tcv"')+'</button>'
      +'<div class="mq-tcb"><div class="mq-tci"><div class="mq-tx" lang="ar" dir="rtl" data-tv="'+vv+'"'+(tx?'':' data-ld="1"')+' style="font-size:'+tfs+'px">'+(tx?esc(tx):'جارٍ تحميل التفسير\u2026')+'</div>'
      +'<div class="mq-tcact"><button data-a="qtfcp" data-v="'+vv+'">'+ic('pen')+'<span>نسخ التفسير</span></button><button data-a="qtfgo" data-v="'+vv+'">'+ic('book')+'<span>افتح في المصحف</span></button></div></div></div></div>';
  }
  return '<div class="mq-ov mq-tf" id="mq-tf"><div class="mq-hd">'+back+'<b class="mq-tt">تفسير سورة '+esc(D.n[c-1])+'</b>'
    +'<span class="mq-stp" style="margin-inline-start:auto"><button class="mq-cb" data-a="qtfs" data-v="-2" aria-label="تصغير خط التفسير"'+(tfs<=16?' disabled':'')+'>'+ic('minus')+'</button><b class="mq-fsz">'+ar(tfs)+'</b><button class="mq-cb" data-a="qtfs" data-v="2" aria-label="تكبير خط التفسير"'+(tfs>=38?' disabled':'')+'>'+ic('plus')+'</button></span>'
    +'<button class="mq-cb" data-a="qtfidx" aria-label="فهرس التفسير">'+ic('menu')+'</button></div>'
    +'<div class="mq-ixs mq-tfl" id="mq-tfl">'+h+'</div></div>';
}
document.addEventListener('input',function(e){
  var t=e.target;if(!t||t.id!=='mptf-q')return;
  var q=mpIxNorm(t.value).replace(/^سوره\s+/,''),bq=q.replace(/^ال/,''),shown=0;
  [].forEach.call(document.querySelectorAll('.mq-tf .mq-ixr'),function(r){
    var p=(r.getAttribute('data-s')||'').split('|'),nm=p[0],no=p[1],bare=nm.replace(/^ال/,'');
    var ok=!q||(/^\d+$/.test(q)?no===q:(nm.indexOf(q)>-1||bare.indexOf(bq)>-1));r.hidden=!ok;if(ok)shown++;
  });
  var n=document.getElementById('mptf-none');if(n)n.hidden=shown>0;
});
