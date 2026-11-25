/* ===== فهرس السور داخل المصحف: بحث بالاسم (مع توحيد الحروف) أو بالرقم ===== */
function mpIxNorm(s){
  return String(s==null?'':s)
    .replace(/[\u0660-\u0669]/g,function(c){return String(c.charCodeAt(0)-1632)})
    .replace(/[\u06F0-\u06F9]/g,function(c){return String(c.charCodeAt(0)-1776)})
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'')
    .replace(/[\u0622\u0623\u0625\u0671]/g,'\u0627').replace(/\u0649/g,'\u064A').replace(/\u0629/g,'\u0647')
    .replace(/\u0624/g,'\u0648').replace(/\u0626/g,'\u064A')
    .replace(/\s+/g,' ').trim().toLowerCase();
}
function mpIndexPanel(){
  if(!rd||!rd.idx)return '';
  var D=QD();
  if(rd.flow){
    var bm=S.quran.bm2;
    var cont=bm&&bm.c>=1&&bm.c<=114?'<button class="mq-ixc" data-a="qixgo" data-v="'+bm.c+':'+bm.v+'"><span class="mq-ixci">'+ic('book')+'</span><span class="t">متابعة القراءة<small>سورة '+esc(D.n[bm.c-1])+' · آية '+ar(bm.v)+'</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>':'';
    return '<div class="mq-ov mq-ix"><div class="mq-hd"><button class="mq-bk" data-a="qidx" aria-label="إغلاق">'+ic('chev')+'</button><b class="mq-tt">الفهرس</b></div>'
     +'<div class="mq-ixs"><div class="mq-ixsb">'+ic('search')+'<input id="mpix-q" type="search" enterkeyhint="search" autocomplete="off" placeholder="ابحث عن سورة بالاسم أو الرقم" aria-label="بحث في فهرس السور"></div>'+cont
     +'<div class="mq-ixg">'+D.n.map(function(nm,i){return '<button class="mq-ixr" data-s="'+esc(mpIxNorm(nm)+'|'+(i+1))+'" data-a="qixgo" data-v="'+(i+1)+'"><span class="mq-ixn">'+ar(i+1)+'</span><span class="mq-ixt"><b>'+esc(nm)+'</b><small>'+suraMeta(i+1)+'</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'}).join('')+'</div>'
     +'<p class="note" id="mpix-none" hidden>لا توجد سورة بهذا الاسم أو الرقم</p></div></div>';
  }
  return '<div class="rd-sp rd-ix"><div class="rd-sh"><button class="ib" data-a="qidx" aria-label="إغلاق">\u2715</button><input id="mpix-q" class="qd-i" type="search" enterkeyhint="search" autocomplete="off" placeholder="اسم السورة أو رقمها" aria-label="بحث في فهرس السور"></div><div class="rd-sr">'
   +D.n.map(function(nm,i){var pg=suraPage(i+1);return '<button class="rd-ri" data-s="'+esc(mpIxNorm(nm)+'|'+(i+1))+'" data-a="qixgo" data-v="'+pg+'"><b>'+ar(i+1)+'. سورة '+esc(nm)+'</b><small>ص '+ar(pg)+'</small></button>'}).join('')
   +'<p class="note" id="mpix-none" hidden>لا توجد سورة بهذا الاسم أو الرقم</p></div></div>';
}
function mpIdxAct(a,v){
  if(!rd)return true;
  if(a==='qbmsgo'){
    if(!rd.flow)return true;
    var q2=String(v).split(':'),c2=+q2[0],v2=+q2[1]||1;
    if(!(c2>=1&&c2<=114))return true;
    mpSel='';rd.sura=c2;rd.cv=c2+':'+v2;rd._scrollCv=rd.cv;rd.jump=false;return false;
  }
  if(a==='qidx'){rd.idx=!rd.idx;rd.srch=false;rd.jump=false;return false}
  if(a==='qixgo'){
    if(rd.flow){
      var p=String(v).split(':'),c=parseInt(p[0],10),vv=p[1]?parseInt(p[1],10):1;
      if(!(c>=1&&c<=114))return true;
      mpSel='';rd.sura=c;rd.cv=c+':'+(vv>=1?vv:1);if(p[1])rd._scrollCv=rd.cv;rd.idx=false;return false;
    }
    var t=parseInt(v,10);if(!(t>=1&&t<=604))return true;
    mpSel='';rd.dir=t>rd.page?1:-1;rd.page=t;rd.idx=false;window.scrollTo(0,0);return false;
  }
  return false;
}
function mpIxFilter(q){
  var t=mpIxNorm(q).replace(/^سوره\s+/,''),bareT=t.replace(/^ال/,''),shown=0;
  [].forEach.call(document.querySelectorAll('.rd-ix .rd-ri,.mq-ix .mq-ixr'),function(r){
    var p=(r.getAttribute('data-s')||'').split('|'),nm=p[0],no=p[1],bare=nm.replace(/^ال/,'');
    var ok=!t||(/^\d+$/.test(t)?no===t:(nm.indexOf(t)>-1||bare.indexOf(bareT)>-1));
    r.hidden=!ok;if(ok)shown++;
  });
  var n=document.getElementById('mpix-none');if(n)n.hidden=shown>0;
}
document.addEventListener('input',function(e){var t=e.target;if(t&&t.id==='mpix-q')mpIxFilter(t.value)});
