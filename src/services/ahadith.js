/* ===== الأحاديث النبوية: تسعة كتب من مشروع Hadith API المفتوح (fawazahmed0) — تُحمَّل عند الفتح من الإنترنت ===== */
var HDT_API='https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
var HDT_BOOKS=[
 {s:'bukhari',n:'صحيح البخاري',a:'الإمام البخاري',t:'متفق على صحته'},{s:'muslim',n:'صحيح مسلم',a:'الإمام مسلم',t:'متفق على صحته'},
 {s:'abudawud',n:'سنن أبي داود',a:'الإمام أبو داود',t:'درجات متفاوتة'},{s:'tirmidhi',n:'جامع الترمذي',a:'الإمام الترمذي',t:'درجات متفاوتة'},
 {s:'nasai',n:'سنن النسائي',a:'الإمام النسائي',t:'درجات متفاوتة'},{s:'ibnmajah',n:'سنن ابن ماجه',a:'الإمام ابن ماجه',t:'درجات متفاوتة'},
 {s:'malik',n:'موطأ مالك',a:'الإمام مالك',t:'من أقدم المصادر'},{s:'nawawi',n:'الأربعون النووية',a:'الإمام النووي',t:'٤٢ حديثًا جامعًا'},
 {s:'qudsi',n:'الأربعون القدسية',a:'أحاديث قدسية',t:'٤٠ حديثًا قدسيًا'}];
var hdtS={tab:'home',book:null,sec:null,q:'',n:15,ld:false,err:false,cache:{},reqs:{}};
function hdtP(){var P=S.hdt;if(!P||typeof P!=='object')P=S.hdt={fs:24,favs:[]};if(!P.favs)P.favs=[];return P}
function hdtBook(s){for(var i=0;i<HDT_BOOKS.length;i++)if(HDT_BOOKS[i].s===s)return HDT_BOOKS[i];return null}
function hdtEsc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}).replace(/\n/g,'<br>')}
function hdtLoad(slug){
  if(hdtS.cache[slug])return Promise.resolve(hdtS.cache[slug]);
  if(hdtS.reqs[slug])return hdtS.reqs[slug];
  function get(u){var ctl=typeof AbortController!=='undefined'?new AbortController():null,tm=ctl?setTimeout(function(){ctl.abort()},45000):0;
    return fetch(u,ctl?{signal:ctl.signal}:{}).then(function(r){clearTimeout(tm);if(!r.ok)throw new Error('net');return r.json()},function(e){clearTimeout(tm);throw e})}
  var p=get(HDT_API+'/ara-'+slug+'.min.json').catch(function(){return get(HDT_API+'/ara-'+slug+'.json')}).then(function(d){delete hdtS.reqs[slug];if(!d||!d.hadiths)throw new Error('bad');hdtS.cache[slug]=d;return d},function(e){delete hdtS.reqs[slug];throw e});
  hdtS.reqs[slug]=p;return p;
}
/* درجة الحديث كما في مصدر البيانات؛ ما لا يُعرف يُعرض بنصه الأصلي بدل افتراض «ضعيف» */
function hdtGrade(h){
  if(!h.grades||!h.grades.length)return null;var g=String(h.grades[0].grade||'').toLowerCase();
  if(!g)return null;
  if(g.indexOf('sahih')>-1)return {c:'sahih',l:'صحيح'};
  if(g.indexOf('hasan')>-1)return {c:'hasan',l:'حسن'};
  if(g.indexOf('daif')>-1||g.indexOf('da\'if')>-1||g.indexOf('weak')>-1||g.indexOf('munkar')>-1||g.indexOf('mawdu')>-1)return {c:'daif',l:'ضعيف'};
  return {c:'hasan',l:String(h.grades[0].grade)};
}
function hdtFav(b,n){return hdtP().favs.some(function(f){return f.b===b&&f.n===n})}
function hdtCard(h,slug){
  var g=hdtGrade(h),bk=hdtBook(slug),f=hdtFav(slug,h.hadithnumber);
  return '<div class="card hdt-c"><div class="hdt-top"><span class="hdt-n">'+ar(h.hadithnumber)+'</span>'+(g?'<span class="hdt-g '+g.c+'">'+hdtEsc(g.l)+'</span>':'<span class="hdt-g">'+hdtEsc(bk?bk.t:'')+'</span>')+'</div>'
   +'<div class="hdt-t" style="font-size:'+hdtP().fs+'px">'+hdtEsc(h.text)+'</div>'
   +'<div class="hdt-tools"><button data-a="hdtfav" data-v="'+slug+':'+h.hadithnumber+'" class="'+(f?'on':'')+'">⭐ '+(f?'إزالة':'حفظ')+'</button><button data-a="hdtcopy" data-v="'+slug+':'+h.hadithnumber+'">📋 نسخ</button></div></div>';
}
function hdtFiltered(d){
  var l=d.hadiths.filter(function(h){return h.text});
  if(hdtS.sec)l=l.filter(function(h){return String(h.reference&&h.reference.book)===String(hdtS.sec)});
  if(hdtS.q)l=l.filter(function(h){return h.text.indexOf(hdtS.q)>-1});
  return l;
}
function hdtListHtml(d,from){
  var l=hdtFiltered(d);if(!l.length)return {h:'<p class="asm-empty">لا توجد نتائج مطابقة.</p>',more:false};
  var to=Math.min(l.length,from+15);
  return {h:l.slice(from,to).map(function(h){return hdtCard(h,hdtS.book)}).join(''),more:to<l.length,to:to};
}
function hdtDay(){
  var P=hdtP(),t=dk();
  if(P.day&&P.day.d===t)return Promise.resolve(P.day);
  return hdtLoad('nawawi').then(function(d){var l=d.hadiths.filter(function(h){return h.text}),seed=t.split('-').reduce(function(a,c){return a+parseInt(c,10)},0),h=l[seed%l.length];
    P.day={d:t,n:h.hadithnumber,t:h.text};save();return P.day});
}
function vAhadith(){
  var P=hdtP(),h='<div class="hdt">';
  if(hdtS.book){
    var bk=hdtBook(hdtS.book),d=hdtS.cache[hdtS.book];
    h+='<div class="hsn-top"><button class="btn ghost" data-a="hdtback">← الكتب</button><b class="hsn-cn">'+bk.n+'</b><span class="hsn-fs"><button class="btn ghost" data-a="hdtfs" data-v="-2">أ-</button><button class="btn ghost" data-a="hdtfs" data-v="2">أ+</button></span></div>';
    if(!d){
      if(hdtS.err)return h+'<p class="asm-empty">تعذّر تحميل الكتاب. تحقّق من اتصالك بالإنترنت.</p><div class="acts"><button class="btn" data-a="hdtretry">إعادة المحاولة</button></div></div>';
      return h+'<p class="asm-empty">جارٍ تحميل '+bk.n+'… (أول مرة قد يستغرق دقيقة)</p></div>';
    }
    var secs=d.metadata&&d.metadata.sections||{};
    h+='<input type="search" id="hdt-q" class="rm-sel" placeholder="ابحث في هذا الكتاب" value="'+hdtEsc(hdtS.q)+'" autocomplete="off">'
     +'<div class="hdt-chips">'+Object.keys(secs).filter(function(k){return k!=='0'&&secs[k]}).map(function(k){return '<button class="chip'+(String(hdtS.sec)===k?' on':'')+'" data-a="hdtsec" data-v="'+k+'">'+hdtEsc(secs[k])+'</button>'}).join('')+'</div>';
    var r=hdtListHtml(d,0);
    return h+'<div id="hdt-l">'+r.h+'</div><button class="btn ghost" id="hdt-more" data-a="hdtmore"'+(r.more?'':' style="display:none"')+'>تحميل المزيد</button></div>';
  }
  h+='<div class="asm-tabs">'+[['home','الرئيسية'],['favs','المفضلة']].map(function(t){return '<button class="'+(hdtS.tab===t[0]?'on':'')+'" data-a="hdttab" data-v="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>';
  if(hdtS.tab==='favs'){
    h+=P.favs.length?P.favs.map(function(f){var bk=hdtBook(f.b);return '<div class="card hdt-c"><div class="hdt-top"><span class="hdt-n">'+ar(f.n)+'</span><span class="hdt-g">'+hdtEsc(bk?bk.n:f.b)+'</span></div><div class="hdt-t" style="font-size:'+P.fs+'px">'+hdtEsc(f.t)+'</div><div class="hdt-tools"><button data-a="hdtunfav" data-v="'+f.b+':'+f.n+'" class="on">⭐ إزالة</button><button data-a="hdtcopyf" data-v="'+f.b+':'+f.n+'">📋 نسخ</button></div></div>'}).join(''):'<p class="asm-empty">لم تحفظ أي حديث بعد. اضغط ⭐ أسفل أي حديث لحفظه هنا.</p>';
    return h+'</div>';
  }
  var dy=P.day&&P.day.d===dk()?P.day:null;
  if(!dy&&!hdtS.dayReq){hdtS.dayReq=1;hdtDay().then(function(){hdtS.dayReq=0;if(tab==='ahadith')render()},function(){hdtS.dayReq=0;hdtS.dayErr=1;if(tab==='ahadith')render()})}
  h+='<section class="card hdt-day"><small>حديث اليوم</small><div class="hdt-t" style="font-size:20px">'+(dy?hdtEsc(dy.t):(hdtS.dayErr?'تعذّر تحميل حديث اليوم؛ تحقّق من الإنترنت.':'جارٍ التحميل…'))+'</div>'+(dy?'<small>الأربعون النووية · حديث رقم '+ar(dy.n)+'</small>':'')+'</section>'
   +'<h3 class="hdt-h">الكتب التسعة</h3><div class="asm-grid">'+HDT_BOOKS.map(function(b){return '<button class="asm-card" data-a="hdtbook" data-v="'+b.s+'"><b style="font-size:17px">'+b.n+'</b><span>'+b.a+'</span><em class="hdt-bd">'+b.t+'</em></button>'}).join('')+'</div>'
   +'<p class="note">المصدر: مشروع Hadith API المفتوح (fawazahmed0). التصنيف (صحيح/حسن/ضعيف) يظهر عند توفره في مصدر البيانات؛ يُنصح بمراجعة أهل الاختصاص عند الاستدلال. تحتاج الصفحة إلى الإنترنت لتحميل الكتب.</p></div>';
  return h;
}
function hdtOpen(slug){
  hdtS.book=slug;hdtS.sec=null;hdtS.q='';hdtS.err=false;
  if(!hdtS.cache[slug]){hdtLoad(slug).then(function(d){var ks=Object.keys(d.metadata&&d.metadata.sections||{}).filter(function(k){return k!=='0'&&d.metadata.sections[k]});if(hdtS.book===slug&&hdtS.sec==null&&ks.length)hdtS.sec=ks[0];if(tab==='ahadith'&&hdtS.book===slug)render()},function(){hdtS.err=true;if(tab==='ahadith')render()})}
  else{var d=hdtS.cache[slug],ks=Object.keys(d.metadata&&d.metadata.sections||{}).filter(function(k){return k!=='0'&&d.metadata.sections[k]});if(ks.length)hdtS.sec=ks[0]}
}
function hdtFind(v){var p=v.split(':'),d=hdtS.cache[p[0]];if(!d)return null;for(var i=0;i<d.hadiths.length;i++)if(String(d.hadiths[i].hadithnumber)===p[1])return d.hadiths[i];return null}
function hdtCopy(t){try{navigator.clipboard.writeText(t).then(function(){toast('تم نسخ الحديث')},function(){toast('تعذّر النسخ')})}catch(e){toast('تعذّر النسخ')}}
function hdtAct(a,v){
  var P=hdtP();
  if(a==='hdttab'){hdtS.tab=v;return true}
  if(a==='hdtbook'){hdtOpen(v);try{window.scrollTo(0,0)}catch(e){}return true}
  if(a==='hdtback'){hdtS.book=null;return true}
  if(a==='hdtretry'){hdtOpen(hdtS.book);return true}
  if(a==='hdtfs'){P.fs=Math.max(18,Math.min(36,P.fs+(+v)));save();return true}
  if(a==='hdtsec'){hdtS.sec=String(hdtS.sec)===v?null:v;hdtS.q='';return true}
  if(a==='hdtmore'){var d=hdtS.cache[hdtS.book],l=document.getElementById('hdt-l');if(!d||!l)return false;var from=l.querySelectorAll('.hdt-c').length,r=hdtListHtml(d,from),w=document.createElement('div');w.innerHTML=r.h;while(w.firstChild)l.appendChild(w.firstChild);var b=document.getElementById('hdt-more');if(b)b.style.display=r.more?'':'none';return false}
  if(a==='hdtfav'){var p=v.split(':'),n=p[1],h=hdtFind(v);if(!h)return false;var i=-1;P.favs.forEach(function(f,k){if(f.b===p[0]&&String(f.n)===n)i=k});
    if(i>-1){P.favs.splice(i,1);toast('أُزيل من المفضلة')}else{P.favs.push({b:p[0],n:h.hadithnumber,t:String(h.text).slice(0,600)});toast('أُضيف إلى المفضلة')}save();
    var bt=document.querySelector('[data-a=hdtfav][data-v="'+v+'"]');if(bt){var on=i<=-1;bt.classList.toggle('on',on);bt.textContent='⭐ '+(on?'إزالة':'حفظ')}return false}
  if(a==='hdtunfav'){var q=v.split(':');P.favs=P.favs.filter(function(f){return !(f.b===q[0]&&String(f.n)===q[1])});save();toast('أُزيل من المفضلة');return true}
  if(a==='hdtcopy'){var h2=hdtFind(v);if(h2)hdtCopy(h2.text);return false}
  if(a==='hdtcopyf'){var q2=v.split(':'),f2=P.favs.filter(function(f){return f.b===q2[0]&&String(f.n)===q2[1]})[0];if(f2)hdtCopy(f2.t);return false}
  return false;
}
(function(){var tm;document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='hdt-q'){var val=e.target.value.trim();clearTimeout(tm);tm=setTimeout(function(){hdtS.q=val;var d=hdtS.cache[hdtS.book],l=document.getElementById('hdt-l');if(!d||!l)return;var r=hdtListHtml(d,0);l.innerHTML=r.h;var b=document.getElementById('hdt-more');if(b)b.style.display=r.more?'':'none'},300)}})})();
