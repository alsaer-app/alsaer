/* ---------- كتابي: متابعة قراءة الكتب (اسم · صفحات · وقت يومي · تذكير · تسجيل · متبقٍّ) ---------- */
var BO_ICONS=['📖','📗','📘','📙','📕','📜','🕌','🌙','⭐','🤲','🧠','💡'];
var BO_PRESETS=[
 {n:'رياض الصالحين',p:650,i:'📗'},{n:'الأربعون النووية وشرحها',p:80,i:'📜'},{n:'الأذكار للنووي',p:350,i:'🤲'},
 {n:'حصن المسلم',p:120,i:'🤲'},{n:'الرحيق المختوم',p:600,i:'🕌'},{n:'كتاب التوحيد',p:100,i:'⭐'},
 {n:'الوابل الصيب من الكلم الطيب',p:150,i:'📘'},{n:'الداء والدواء',p:300,i:'💡'},{n:'تفسير السعدي',p:1000,i:'📖'},
 {n:'مدارج السالكين',p:1500,i:'🧠'},{n:'زاد المعاد',p:1800,i:'🌙'},{n:'كتاب عام (٢٠٠ صفحة)',p:200,i:'📕'}
];
var BO_COLS={gold:'#C9A24B',green:'#2E8B6E',blue:'#3B82C4',rose:'#C2456B',purple:'#7C5CC4',orange:'#D9822B'};
var BO_DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
var boDraft=null,boEditId='',boDelAsk='';
function boNew(){return {n:'',p:'',per:'',t:'20:00',rem:true,i:'📖',img:'',au:'',col:'gold',days:[],goal:'per',due:'',cur:'',note:''}}
function boOpt(){var o=Object.assign({sort:'recent',view:'full',fin:true,wb:'',goal:0},(S.boset&&typeof S.boset==='object')?S.boset:{});return o}
function boList(){if(!Array.isArray(S.books))S.books=[];return S.books}
function boGet(id){return boList().filter(function(x){return x.id===id})[0]}
function boToday(b){return (b.log&&b.log[dk()])||0}
function boDate(k){return new Date(k+'T00:00:00')}
function boDayTotal(k){return boList().reduce(function(s,b){return s+((b.log&&b.log[k])||0)},0)}
function boStreak(b){
  var n=0,d=new Date(),L=b.log||{};
  if(!L[dk(d)])d.setDate(d.getDate()-1);
  while(L[dk(d)]>0){n++;d.setDate(d.getDate()-1)}
  return n;
}
/* الصفحات المطلوبة يوميًا: ثابتة، أو محسوبة من تاريخ الانتهاء الذي تحدده */
function boPer(b){
  var left=Math.max(0,b.pages-b.read);
  if(b.goal==='date'&&b.due&&/^\d{4}-\d\d-\d\d$/.test(b.due)){
    var dl=Math.max(1,Math.round((boDate(b.due)-boDate(dk()))/864e5)+1);return Math.max(1,Math.ceil(left/dl));
  }
  return b.per||10;
}
function boFinish(b){
  var left=Math.max(0,b.pages-b.read),per=boPer(b);if(!left||!per)return '';
  var d=new Date();d.setDate(d.getDate()+Math.ceil(left/per)-1);
  return d.toLocaleDateString('ar-EG-u-nu-arab',{day:'numeric',month:'long'});
}
function boCur(){
  var o=boOpt(),L=boList().filter(function(b){return b.read<b.pages&&b.st!=='pause'});
  if(o.wb){var w=L.filter(function(b){return b.id===o.wb})[0];if(w)return w}
  return L[0]||null;
}
/* سطر الودجت: كتابك الحالي ونسبة تقدّمه */
function boWidget(){var b=boCur();if(!b)return '';return 'كتابي: '+b.n+' · '+ar(Math.round(b.read/b.pages*100))+'٪'}
function boCap(){
  var g=function(i){var e=document.getElementById(i);return e?e.value:null};
  if(!boDraft)boDraft=boNew();
  var m={n:'bo-name',p:'bo-pg',per:'bo-per',au:'bo-au',due:'bo-due',cur:'bo-cur',note:'bo-note'};
  Object.keys(m).forEach(function(k){var v=g(m[k]);if(v!==null)boDraft[k]=v});
  var t=g('bo-time'),r=document.getElementById('bo-rem');
  if(t!==null&&t)boDraft.t=t;if(r)boDraft.rem=!!r.checked;
  return boDraft;
}
function boLogo(b,sz){
  var s=sz||44;
  if(b.img)return '<span class="bo-logo" style="width:'+s+'px;height:'+s+'px"><img src="'+esc(b.img)+'" alt=""></span>';
  return '<span class="bo-logo" style="width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s*.55)+'px">'+esc(b.i||'📖')+'</span>';
}
function boSpark(b){
  var h='',mx=1,v=[],i;
  for(i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var n=(b.log&&b.log[dk(d)])||0;v.push(n);if(n>mx)mx=n}
  v.forEach(function(n){h+='<i style="height:'+Math.max(3,Math.round(n/mx*22))+'px" class="'+(n?'on':'')+'"></i>'});
  return '<span class="bo-sp" aria-hidden="true">'+h+'</span>';
}
function boCard(b){
  var o=boOpt(),pct=Math.min(100,Math.round(b.read/b.pages*100)),left=Math.max(0,b.pages-b.read),td=boToday(b),fin=b.read>=b.pages,pz=b.st==='pause',st=boStreak(b),ed=boFinish(b),per=boPer(b),col=BO_COLS[b.col]||BO_COLS.gold;
  var head='<div class="bo-h">'+boLogo(b)+'<div class="bo-t"><b>'+esc(b.n)+'</b><small>'+(b.au?esc(b.au)+' · ':'')+(fin?'✓ أتممت الكتاب':pz?'متوقف مؤقتًا · قرأت '+ar(b.read)+' من '+ar(b.pages):'قرأت '+ar(b.read)+' من '+ar(b.pages)+' · بقي '+ar(left)+' صفحة')+'</small></div><span class="bo-p" style="color:'+col+'">'+ar(pct)+'٪</span></div>'
   +'<div class="bo-bar"><i style="width:'+pct+'%;background:'+col+'"></i></div>';
  if(o.view==='compact'&&!fin)return '<section class="card bo-c bo-k" style="border-inline-start:4px solid '+col+'">'+head+'<div class="bo-l">'+(pz?'<button class="btn ghost" data-a="bopause" data-v="'+b.id+'">استئناف</button>':'<input id="bo-n-'+b.id+'" class="qd-i" type="number" inputmode="numeric" min="1" value="'+per+'" aria-label="عدد الصفحات"><button class="btn" data-a="bolog" data-v="'+b.id+'">قرأت ✓</button>')+'<button class="btn ghost" data-a="boedit" data-v="'+b.id+'">تعديل</button></div></section>';
  return '<section class="card bo-c" style="border-inline-start:4px solid '+col+'">'+head
   +'<div class="bo-m">'+(fin||pz?'':'<span>'+ar(per)+' صفحة يوميًا'+(b.goal==='date'&&b.due?' (حتى '+esc(boDate(b.due).toLocaleDateString('ar-EG-u-nu-arab',{day:'numeric',month:'long'}))+')':'')+(ed?' · ينتهي نحو '+esc(ed):'')+'</span>')
   +(b.rem&&!fin&&!pz?'<span>🔔 '+esc(hmFmtSafe(b.t))+(b.days&&b.days.length?' · '+b.days.map(function(d){return BO_DAYS[d]}).join('، '):'')+'</span>':'')+(st?'<span>🔥 '+ar(st)+' يوم</span>':'')+(td?'<span>✓ قرأت اليوم '+ar(td)+'</span>':'')+boSpark(b)+'</div>'
   +(b.note?'<p class="bo-nt">'+esc(b.note)+'</p>':'')
   +(fin?'<div class="bo-rt"><span>تقييمك:</span>'+[1,2,3,4,5].map(function(n){return '<button type="button" class="bo-st'+(n<=(b.rate||0)?' on':'')+'" data-a="borate" data-v="'+b.id+':'+n+'" aria-label="'+n+'">★</button>'}).join('')+'</div>'
     :pz?'':'<div class="bo-l"><input id="bo-n-'+b.id+'" class="qd-i" type="number" inputmode="numeric" min="1" value="'+per+'" aria-label="عدد الصفحات"><button class="btn" data-a="bolog" data-v="'+b.id+'">قرأت اليوم ✓</button></div>')
   +(fin?'':'<div class="bo-l bo-pos"><label>أنا الآن في صفحة<input id="bo-p-'+b.id+'" class="qd-i" type="number" inputmode="numeric" min="0" max="'+b.pages+'" value="'+b.read+'"></label><button class="btn ghost" data-a="bopos" data-v="'+b.id+'">حفظ</button></div>')
   +'<div class="bo-x">'+(td?'<button class="btn ghost" data-a="boundo" data-v="'+b.id+'">تراجع عن تسجيل اليوم</button>':'')+(fin?'':'<button class="btn ghost" data-a="bopause" data-v="'+b.id+'">'+(pz?'استئناف':'إيقاف مؤقت')+'</button>')+'<button class="btn ghost" data-a="boedit" data-v="'+b.id+'">تعديل</button><button class="btn ghost" data-a="bodel" data-v="'+b.id+'">'+(boDelAsk===b.id?'تأكيد الحذف':'حذف')+'</button></div></section>';
}
function hmFmtSafe(t){try{return typeof ptFmt==='function'?ptFmt(t):t}catch(e){return t}}
function boChips(act,items,isOn){return '<div class="chips">'+items.map(function(x){return '<button type="button" class="chip'+(isOn(x[0])?' on':'')+'" data-a="'+act+'" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'}
function boForm(){
  var d=boDraft||(boDraft=boNew());
  var ic2=BO_ICONS.map(function(x){return '<button type="button" class="bo-ico'+(!d.img&&d.i===x?' on':'')+'" data-a="boico" data-v="'+x+'">'+x+'</button>'}).join('');
  var pre=BO_PRESETS.map(function(x,i){return '<button type="button" class="chip" data-a="bopre" data-v="'+i+'">'+esc(x.i+' '+x.n)+'</button>'}).join('');
  var cols='<div class="bo-cols">'+Object.keys(BO_COLS).map(function(k){return '<button type="button" class="bo-col'+(d.col===k?' on':'')+'" style="background:'+BO_COLS[k]+'" data-a="bocol" data-v="'+k+'" aria-label="لون"></button>'}).join('')+'</div>';
  return '<section class="card" id="bo-form"><h3>'+(boEditId?'تعديل الكتاب':'أضف كتابًا')+'</h3>'
   +(boEditId?'':'<p class="note">اختر كتابًا جاهزًا لملء البيانات، أو اكتب كتابك. الأعداد تقريبية وتختلف بين الطبعات، فعدّلها بحسب نسختك.</p><div class="chips bo-pre">'+pre+'</div>')
   +'<label class="bo-f">اسم الكتاب<input id="bo-name" class="qd-i" type="text" maxlength="80" value="'+esc(d.n)+'" placeholder="مثال: رياض الصالحين"></label>'
   +'<label class="bo-f">المؤلف (اختياري)<input id="bo-au" class="qd-i" type="text" maxlength="60" value="'+esc(d.au)+'"></label>'
   +'<div class="hf-r"><label>عدد الصفحات<input id="bo-pg" class="qd-i" type="number" inputmode="numeric" min="1" value="'+esc(d.p)+'"></label>'+(boEditId?'':'<label>بدأت من صفحة<input id="bo-cur" class="qd-i" type="number" inputmode="numeric" min="0" value="'+esc(d.cur)+'" placeholder="٠"></label>')+'</div>'
   +'<div class="bo-g"><b>هدف القراءة</b>'+boChips('boset',[['goal:per','عدد صفحات ثابت يوميًا'],['goal:date','أنهيه قبل تاريخ']],function(v){return v==='goal:'+d.goal})+'</div>'
   +(d.goal==='date'?'<label class="bo-f">تاريخ الانتهاء<input id="bo-due" class="qd-i" type="date" value="'+esc(d.due)+'"></label><p class="note">يحسب التطبيق صفحات اليوم تلقائيًا ويعدّلها كلما قرأت.</p>':'<label class="bo-f">صفحات يوميًا<input id="bo-per" class="qd-i" type="number" inputmode="numeric" min="1" value="'+esc(d.per)+'" placeholder="١٠"></label>')
   +'<div class="hf-r"><label>وقت القراءة اليومي<input id="bo-time" class="qd-i" type="time" value="'+esc(d.t)+'"></label><label class="bo-ck"><input id="bo-rem" type="checkbox"'+(d.rem?' checked':'')+'> ذكّرني بموعد القراءة</label></div>'
   +'<div class="bo-g"><b>أيام التذكير (بدون اختيار = كل يوم)</b>'+boChips('bodayf',BO_DAYS.map(function(x,i){return [i,x]}),function(v){return d.days.indexOf(+v)>=0})+'</div>'
   +'<div class="bo-g"><b>لون الكتاب</b>'+cols+'</div>'
   +'<label class="bo-f">ملاحظة (اختياري)<textarea id="bo-note" class="qd-i" rows="2" maxlength="200" placeholder="لماذا تقرؤه؟ أو ما تريد استخراجه منه">'+esc(d.note)+'</textarea></label>'
   +'<div class="bo-lg"><b>شعار الكتاب</b><div class="bo-lgr">'+(d.img?boLogo(d,52)+'<button type="button" class="btn ghost" data-a="boclr">إزالة الصورة</button>':'')
   +'<label class="btn ghost bo-up">اختر صورة<input id="bo-f" type="file" accept="image/*" hidden></label></div><div class="bo-icos">'+ic2+'</div></div>'
   +'<div class="acts"><button class="btn" data-a="boadd">'+(boEditId?'حفظ التعديل':'إضافة الكتاب')+'</button>'+(boEditId?'<button class="btn ghost" data-a="bocancel">إلغاء</button>':'')+'</div></section>';
}
function boOptions(){
  var o=boOpt(),act=boList().filter(function(b){return b.read<b.pages});
  return '<section class="card"><h3>تحكّم في العرض</h3>'
   +'<div class="bo-g"><b>ترتيب الكتب</b>'+boChips('boopt',[['sort:recent','حسب الإضافة'],['sort:progress','حسب التقدّم'],['sort:name','حسب الاسم']],function(v){return v==='sort:'+o.sort})+'</div>'
   +'<div class="bo-g"><b>شكل البطاقات</b>'+boChips('boopt',[['view:full','كاملة'],['view:compact','مختصرة']],function(v){return v==='view:'+o.view})+'</div>'
   +'<div class="bo-g"><b>الكتب المكتملة</b>'+boChips('boopt',[['fin:true','تظهر'],['fin:false','تخفى']],function(v){return v==='fin:'+o.fin})+'</div>'
   +'<div class="bo-g"><b>هدفي اليومي (كل الكتب)</b>'+boChips('boopt',[['goal:0','بلا هدف'],['goal:10','١٠ صفحات'],['goal:20','٢٠ صفحة'],['goal:30','٣٠ صفحة'],['goal:50','٥٠ صفحة']],function(v){return v==='goal:'+o.goal})+'</div>'
   +(act.length>1?'<div class="bo-g"><b>الكتاب الذي يظهر في الودجت</b>'+boChips('boopt',[['wb:','تلقائي']].concat(act.map(function(b){return ['wb:'+b.id,esc(b.n)]})),function(v){return v==='wb:'+o.wb})+'</div>':'')
   +'</section>';
}
function vBooks(){
  var L=boList(),o=boOpt(),wk=0,i,days=[];
  for(i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var n=boDayTotal(dk(d));wk+=n;days.push(n)}
  var mx=Math.max.apply(null,days.concat([1])),tot=L.reduce(function(s,b){return s+b.read},0),dn=L.filter(function(b){return b.read>=b.pages}).length,td=boDayTotal(dk()),gl=+o.goal||0;
  var bars='<div class="bo-wk">'+days.map(function(n,k){return '<i title="'+ar(n)+'" style="height:'+Math.max(4,Math.round(n/mx*34))+'px" class="'+(n?'on':'')+(k===6?' td':'')+'"></i>'}).join('')+'</div>';
  var shown=L.slice();
  if(!o.fin)shown=shown.filter(function(b){return b.read<b.pages});
  if(o.sort==='progress')shown.sort(function(a,b){return b.read/b.pages-a.read/a.pages});
  else if(o.sort==='name')shown.sort(function(a,b){return a.n.localeCompare(b.n,'ar')});
  return '<div class="bo"><section class="rm5-hero"><small>كتابي</small><b>'+ar(tot)+' صفحة</b><span>هذا الأسبوع: '+ar(wk)+' · كتب أتممتها: '+ar(dn)+'</span>'+bars
   +(gl?'<div class="bo-bar"><i style="width:'+Math.min(100,Math.round(td/gl*100))+'%"></i></div><span>اليوم: '+ar(td)+' من '+ar(gl)+' صفحة'+(td>=gl?' ✓':'')+'</span>':'')+'</section>'
   +'<div class="acts"><button class="btn" data-a="boman">＋ أضف كتابي الخاص</button></div>'
   +(shown.length?shown.map(boCard).join(''):'<section class="card"><p class="note">'+(L.length?'لا كتب لعرضها بهذا الإعداد.':'لم تُضف كتابًا بعد. أضف أول كتاب من الأسفل، وحدّد وقتك اليومي ليذكّرك التطبيق.')+'</p></section>')
   +(L.length?boOptions():'')+boForm()+'</div>';
}
function boImg(file){
  if(!file||!/^image\//.test(file.type))return;
  var fr=new FileReader();
  fr.onload=function(){
    var im=new Image();
    im.onload=function(){
      try{
        var s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=128;
        c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,128,128);
        boCap();boDraft.img=c.toDataURL('image/jpeg',0.72);render();
      }catch(e){toast('تعذّر قراءة الصورة')}
    };
    im.onerror=function(){toast('تعذّر قراءة الصورة')};
    im.src=fr.result;
  };
  fr.readAsDataURL(file);
}
document.addEventListener('change',function(e){var t=e.target;if(t&&t.id==='bo-f'&&t.files&&t.files[0])boImg(t.files[0])},true);
function boAct(a,v){
  if(a==='boman'){boDraft=boNew();boEditId='';setTimeout(function(){var e=document.getElementById('bo-name');if(e){e.scrollIntoView({block:'center'});e.focus()}},60);return false}
  if(a!=='bodel')boDelAsk='';
  if(a==='boico'){boCap();boDraft.i=String(v);boDraft.img='';return false}
  if(a==='boclr'){boCap();boDraft.img='';return false}
  if(a==='bocol'){boCap();boDraft.col=String(v);return false}
  if(a==='boset'){boCap();var q=String(v).split(':');boDraft[q[0]]=q[1];return false}
  if(a==='bodayf'){boCap();var i=boDraft.days.indexOf(+v);if(i>=0)boDraft.days.splice(i,1);else boDraft.days.push(+v);boDraft.days.sort();return false}
  if(a==='boopt'){var k=String(v).indexOf(':'),key=String(v).slice(0,k),val=String(v).slice(k+1);if(!S.boset||typeof S.boset!=='object')S.boset={};S.boset[key]=val==='true'?true:val==='false'?false:(/^\d+$/.test(val)?parseInt(val,10):val);save();return false}
  if(a==='bopre'){var p=BO_PRESETS[parseInt(v,10)];if(p){boCap();boDraft.n=p.n;boDraft.p=String(p.p);boDraft.i=p.i;boDraft.img='';if(!boDraft.per)boDraft.per='10'}return false}
  if(a==='bocancel'){boDraft=null;boEditId='';return false}
  if(a==='boedit'){var b=boGet(v);if(b){boEditId=b.id;boDraft={n:b.n,p:String(b.pages),per:String(b.per),t:b.t||'20:00',rem:!!b.rem,i:b.i||'📖',img:b.img||'',au:b.au||'',col:b.col||'gold',days:(b.days||[]).slice(),goal:b.goal||'per',due:b.due||'',cur:'',note:b.note||''};setTimeout(function(){var f=document.getElementById('bo-form');if(f)f.scrollIntoView({block:'start'})},60)}return false}
  if(a==='bodel'){var x=boGet(v);if(!x)return false;if(boDelAsk!==v){boDelAsk=v;toast('اضغط «تأكيد الحذف» لحذف «'+x.n+'» وسجلّه');return false}boDelAsk='';S.books=boList().filter(function(y){return y.id!==v});save();toast('حُذف الكتاب');return false}
  if(a==='boadd'){
    var d=boCap(),name=String(d.n||'').trim(),pg=parseInt(d.p,10),per=parseInt(d.per,10)||10;
    if(!name){toast('اكتب اسم الكتاب');return true}
    if(!(pg>0)){toast('اكتب عدد الصفحات');return true}
    if(d.goal==='date'&&!/^\d{4}-\d\d-\d\d$/.test(d.due||'')){toast('اختر تاريخ الانتهاء');return true}
    pg=Math.min(pg,20000);per=Math.max(1,Math.min(per,pg));
    var e=boEditId?boGet(boEditId):null,fields={n:name.slice(0,80),pages:pg,per:per,t:d.t||'20:00',rem:!!d.rem,i:d.i||'📖',img:d.img||'',au:String(d.au||'').slice(0,60),col:d.col||'gold',days:(d.days||[]).slice(),goal:d.goal==='date'?'date':'per',due:d.goal==='date'?d.due:'',note:String(d.note||'').slice(0,200)};
    if(e){Object.assign(e,fields);if(e.read>pg)e.read=pg;toast('حُفظ التعديل')}
    else{if(boList().length>=40){toast('الحد الأقصى ٤٠ كتابًا');return true}
      var nb=Object.assign({id:'b'+Date.now().toString(36),start:dk(),read:Math.max(0,Math.min(pg,parseInt(d.cur,10)||0)),log:{}},fields);boList().push(nb);toast('أُضيف «'+name+'»')}
    boDraft=null;boEditId='';save();return false;
  }
  if(a==='bolog'){
    var b2=boGet(v);if(!b2)return false;
    var inp=document.getElementById('bo-n-'+v),n=Math.max(1,parseInt(inp&&inp.value,10)||boPer(b2));
    boRecord(b2,n);return false;
  }
  if(a==='bopos'){
    var b4=boGet(v),pi=document.getElementById('bo-p-'+v);if(!b4||!pi)return false;
    var np=Math.max(0,Math.min(b4.pages,parseInt(pi.value,10)||0)),df=np-b4.read;
    if(df>0)boRecord(b4,df);
    else if(df<0){var tdy=boToday(b4),cut=Math.min(tdy,-df);if(cut>0){b4.log[dk()]=tdy-cut;if(!b4.log[dk()])delete b4.log[dk()]}b4.read=np;save();toast('عُدّلت صفحتك الحالية')}
    return false;
  }
  if(a==='bopause'){var b5=boGet(v);if(b5){if(b5.st==='pause')delete b5.st;else b5.st='pause';save();toast(b5.st==='pause'?'أُوقف التذكير مؤقتًا':'استؤنف الكتاب')}return false}
  if(a==='borate'){var q2=String(v).split(':'),b6=boGet(q2[0]);if(b6){b6.rate=parseInt(q2[1],10)||0;save()}return false}
  if(a==='boundo'){var b3=boGet(v);if(b3){var t=boToday(b3);if(t){b3.read=Math.max(0,b3.read-t);delete b3.log[dk()];save();toast('أُلغي تسجيل اليوم')}}return false}
  return false;
}
function boRecord(b,n){
  var left=b.pages-b.read;n=Math.min(n,Math.max(0,left));if(n<=0)return;
  b.log=b.log||{};var k=dk();b.log[k]=(b.log[k]||0)+n;b.read+=n;save();
  try{hapGo([60,40,120])}catch(e){}
  toast(b.read>=b.pages?'ما شاء الله، أتممت «'+b.n+'» 🎉':'سُجّلت '+ar(n)+' صفحة — بقي '+ar(b.pages-b.read));
}
/* تسجيل القراءة من زر «قرأت» في الإشعار */
function boFromNotif(id,dayKey){
  var b=boGet(id);if(!b||b.read>=b.pages)return false;
  var k=dayKey||dk(),n=Math.min(boPer(b),b.pages-b.read);
  b.log=b.log||{};b.log[k]=(b.log[k]||0)+n;b.read+=n;return true;
}
