/* ===== منتقي تاريخ عصري: يبدّل input[type=date] بزر + ورقة سفلية (شبكة شهر) ===== */
var DPK_M=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
var DPK_D=['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
function dpkIso(y,m,d){return y+'-'+(m<9?'0':'')+(m+1)+'-'+(d<10?'0':'')+d}
function dpkLabel(v){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');if(!m)return 'اختر التاريخ';return ar(+m[3])+' '+DPK_M[+m[2]-1]+' '+ar(m[1])}
function dpkOpen(hid,btn){
  var old=document.getElementById('dpk');if(old)old.remove();
  var cur=/^(\d{4})-(\d{2})-(\d{2})$/.exec(hid.value||''),now=new Date();
  var y=cur?+cur[1]:now.getFullYear(),m=cur?+cur[2]-1:now.getMonth(),sel=hid.value||'';
  var wrap=document.createElement('div');wrap.id='dpk';wrap.className='dpk-bd';
  function draw(){
    var first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),today=dpkIso(now.getFullYear(),now.getMonth(),now.getDate()),cells='',i;
    for(i=0;i<first;i++)cells+='<i></i>';
    for(i=1;i<=days;i++){var iso=dpkIso(y,m,i);cells+='<button type="button" data-d="'+iso+'" class="'+(iso===sel?'on ':'')+(iso===today?'td':'')+'">'+ar(i)+'</button>'}
    wrap.innerHTML='<div class="dpk-sh" role="dialog" aria-label="اختيار التاريخ"><div class="dpk-grab"></div><div class="dpk-head"><button type="button" data-n="1" aria-label="الشهر السابق">›</button><b>'+DPK_M[m]+' '+ar(y)+'</b><button type="button" data-n="-1" aria-label="الشهر التالي">‹</button></div>'
      +'<div class="dpk-wd">'+DPK_D.map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="dpk-g">'+cells+'</div>'
      +'<div class="dpk-ft"><button type="button" class="btn ghost" data-t="1">اليوم</button><button type="button" class="btn ghost" data-x="1">إلغاء</button></div></div>';
  }
  function close(){wrap.classList.remove('in');setTimeout(function(){wrap.remove()},180)}
  function pick(v){sel=v;hid.value=v;hid.setAttribute('value',v);btn.querySelector('span').textContent=dpkLabel(v);hid.dispatchEvent(new Event('change',{bubbles:true}));close()}
  wrap.addEventListener('click',function(e){
    var t=e.target;if(t===wrap){close();return}
    var b=t.closest&&t.closest('button');if(!b)return;
    if(b.dataset.d){pick(b.dataset.d)}
    else if(b.dataset.n){m-=+b.dataset.n;if(m<0){m=11;y--}if(m>11){m=0;y++}draw()}
    else if(b.dataset.t){pick(dpkIso(now.getFullYear(),now.getMonth(),now.getDate()))}
    else if(b.dataset.x){close()}
  });
  draw();document.body.appendChild(wrap);requestAnimationFrame(function(){wrap.classList.add('in')});
}
function dpkBuild(){
  document.querySelectorAll('input[type=date]').forEach(function(inp){
    var hid=document.createElement('input');hid.type='hidden';
    [].forEach.call(inp.attributes,function(a){if(a.name!=='type'&&a.name!=='class'&&a.name!=='style')hid.setAttribute(a.name,a.value)});
    hid.value=inp.value;
    var btn=document.createElement('button');btn.type='button';btn.className='dpk-btn';
    btn.innerHTML=ic('cal')+'<span>'+dpkLabel(inp.value)+'</span>';
    btn.addEventListener('click',function(){dpkOpen(hid,btn)});
    inp.parentNode.insertBefore(hid,inp);inp.parentNode.insertBefore(btn,inp);inp.remove();
  });
}
(function(){var t=null,mo=new MutationObserver(function(){if(t)return;t=setTimeout(function(){t=null;try{if(document.querySelector('input[type=date]'))dpkBuild()}catch(e){}},0)});
  mo.observe(document.documentElement,{childList:true,subtree:true});try{dpkBuild()}catch(e){}})();
