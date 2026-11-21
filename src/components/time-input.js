/* ===== إدخال الوقت الرقمي: يبدّل كل حقول الوقت الأصلية (الساعة الدائرية) بضبط رقمي ===== */
function tinIs12(){return clk12()}
function tinPad(n){return (n<10?'0':'')+n}
function tinBuild(hid){
  var v=/^(\d{1,2}):(\d{2})$/.exec(hid.value||''),h24=v?+v[1]:0,mi=v?+v[2]:0,p12=tinIs12(),pm=h24>=12,h=p12?((h24%12)||12):h24;
  var w=document.createElement('span');w.className='tin';w.dir='ltr';
  w.innerHTML='<input class="tin-h" type="text" inputmode="numeric" value="'+(v?tinPad(h):'')+'" placeholder="--" aria-label="'+(typeof lang==='function'&&lang()!=='ar'?'Hour':'الساعة')+'"><b>:</b><input class="tin-m" type="text" inputmode="numeric" value="'+(v?tinPad(mi):'')+'" placeholder="--" aria-label="الدقيقة">'
    +(p12?'<span class="tin-ap"><button type="button" class="'+(pm?'':'on')+'" data-ap="am">'+(typeof lang==='function'&&lang()!=='ar'?'AM':'ص')+'</button><button type="button" class="'+(pm?'on':'')+'" data-ap="pm">'+(typeof lang==='function'&&lang()!=='ar'?'PM':'م')+'</button></span>':'');
  function commit(){
    var H=w.querySelector('.tin-h'),M=w.querySelector('.tin-m'),hh=parseInt(H.value,10),mm=parseInt(M.value,10);if(isNaN(hh)&&isNaN(mm)&&!hid.value)return;
    if(isNaN(hh))hh=p12?12:0;if(isNaN(mm))mm=0;mm=Math.max(0,Math.min(59,mm));
    var am=w.querySelector('[data-ap=am]'),isPm=am?!am.classList.contains('on'):false;
    if(p12){hh=Math.max(1,Math.min(12,hh));var h2=hh%12+(isPm?12:0)}else{hh=Math.max(0,Math.min(23,hh));h2=hh}
    H.value=tinPad(hh);M.value=tinPad(mm);
    var nv=tinPad(h2)+':'+tinPad(mm);
    if(hid.value!==nv){hid.value=nv;hid.setAttribute('value',nv);hid.dispatchEvent(new Event('change',{bubbles:true}))}
  }
  w.addEventListener('focusin',function(e){if(e.target.tagName==='INPUT')e.target.dataset.fresh='1'});w.addEventListener('contextmenu',function(e){e.preventDefault()});
  w.addEventListener('input',function(e){var t=e.target;if(t.tagName!=='INPUT')return;if(t.dataset.fresh){delete t.dataset.fresh;if(t.value.length>1)t.value=t.value.slice(-1)}t.value=t.value.replace(/[^\d٠-٩]/g,'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).slice(-2);if(t.value.length>=2){var isH=t.classList.contains('tin-h'),ix=[].indexOf.call(document.querySelectorAll('.tin'),w);commit();if(isH)setTimeout(function(){try{var ws=document.querySelectorAll('.tin'),m2=(ws[ix]||w).querySelector('.tin-m');if(m2)m2.focus()}catch(x){}},40)}});
  w.addEventListener('change',function(e){e.stopPropagation();if(e.target.tagName==='INPUT')commit()});
  w.addEventListener('focusout',function(e){if(e.target.tagName==='INPUT')commit()});
  w.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ap]');if(!b)return;e.stopPropagation();w.querySelectorAll('[data-ap]').forEach(function(x){x.classList.toggle('on',x===b)});commit()});
  return w;
}
function digitalTimes(){
  var list=document.querySelectorAll('input[type=time]');
  list.forEach(function(inp){
    var hid=document.createElement('input');hid.type='hidden';
    [].forEach.call(inp.attributes,function(a){if(a.name!=='type'&&a.name!=='class'&&a.name!=='style')hid.setAttribute(a.name,a.value)});
    hid.value=inp.value;
    var lab=inp.closest&&inp.closest('label.tmw');
    var w=tinBuild(hid);
    if(lab){lab.innerHTML='';lab.classList.add('tmw-d');lab.appendChild(hid);lab.appendChild(w)}
    else{inp.parentNode.insertBefore(hid,inp);inp.parentNode.insertBefore(w,inp);inp.remove()}
  });
}
(function(){var t=null,mo=new MutationObserver(function(){if(t)return;t=setTimeout(function(){t=null;try{if(document.querySelector('input[type=time]'))digitalTimes()}catch(e){}},0)});
  mo.observe(document.documentElement,{childList:true,subtree:true});try{digitalTimes()}catch(e){}})();
