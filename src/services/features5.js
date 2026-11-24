/* ===== خمس ميزات: وضع رمضان · ختمة القرآن · إحصاءات أسبوعية · ملاحظات ومفضلة · حاسبة الزكاة ===== */
function f5n(v,max){var n=parseFloat(String(v).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(',','.'));return isFinite(n)&&n>=0?Math.min(n,max||1e12):0}
function f5ar(n){return ar(Math.round(n*100)/100)}

function f5add(k,n){var d=parse(k);d.setDate(d.getDate()+n);return dk(d)}
function f5diff(a,b){return Math.round((parse(b)-parse(a))/864e5)}

/* ---------- ١) وضع رمضان ---------- */
function ramInfo(){
  var now=new Date(),h=hijriNumeric(now);if(!h)return null;
  if(h.month===9)return {state:'in',day:h.day,year:h.year,left:Math.max(0,30-h.day)};
  for(var i=1;i<=400;i++){var d=new Date(now.getTime()+i*864e5),x=hijriNumeric(d);if(x&&x.month===9&&x.day===1)return {state:h.month>9?'after':'before',days:i,year:x.year,date:d}}
  return {state:'before',days:null,year:h.year};
}
function ramGet(y,d){S.ram=S.ram&&typeof S.ram==='object'?S.ram:{};var Y=S.ram[y]=S.ram[y]||{};return Y[d]=Y[d]||{}}
var RAM_TASKS=[['sawm','صمتُ اليوم'],['tar','التراويح'],['qiyam','قيام الليل'],['quran','وردي من القرآن'],['sadaqa','صدقة'],['dua','دعاء عند الإفطار']];
function vRamadan(){
  var I=ramInfo(),t=null,h='';
  if(!I)return '<section class="card"><p class="note">تعذّر حساب التاريخ الهجري على هذا الجهاز.</p></section>';
  try{if(locOk())t=ptToday()}catch(e){}
  if(I.state==='in'){
    var rec=ramGet(I.year,I.day),dn=RAM_TASKS.filter(function(x){return rec[x[0]]}).length,tot=0,days=Object.keys(S.ram[I.year]||{});
    days.forEach(function(k){RAM_TASKS.forEach(function(x){if(S.ram[I.year][k][x[0]])tot++})});
    h='<section class="rm5-hero"><small>رمضان '+ar(I.year)+'</small><b>اليوم '+ar(I.day)+'</b><span>بقي '+ar(I.left)+' يومًا تقريبًا</span><div class="bar"><div id="rm5-bar" style="width:'+Math.round(I.day/30*100)+'%"></div></div></section>'
     +(t?'<section class="card rm5-times"><div><small>السحور ينتهي (الفجر)</small><b>'+ptFmt(t.fajr)+'</b></div><div><small>الإفطار (المغرب)</small><b>'+ptFmt(t.maghrib)+'</b></div></section>':'<section class="card"><p class="note">حدّد موقعك من صفحة الصلوات لتظهر لك أوقات السحور والإفطار.</p></section>')
     +'<section class="card"><h3>عبادات اليوم <span class="rm5-c" id="rm5-c">'+ar(dn)+'/'+ar(RAM_TASKS.length)+'</span></h3>'
     +RAM_TASKS.map(function(x){var on=!!rec[x[0]];return '<button class="rm5-t'+(on?' on':'')+'" data-a="ramtog" data-v="'+x[0]+'" aria-pressed="'+on+'"><i>'+(on?'✓':'')+'</i><span>'+x[1]+'</span></button>'}).join('')
     +'</section><section class="card"><p class="note" style="margin:0">مجموع ما أنجزته في هذا الشهر: <b>'+ar(tot)+'</b> عبادة</p></section>';
  }else if(I.state==='before'&&I.days){
    h='<section class="rm5-hero"><small>يبدأ رمضان '+ar(I.year)+' بعد</small><b>'+ar(I.days)+' يومًا</b><span>'+(I.date?new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'long'}).format(I.date):'')+' تقريبًا</span></section>'
     +'<section class="card"><h3>استعدّ لرمضان</h3><ul class="tips"><li>ابدأ بزيادة وردك من القرآن تدريجيًا من الآن.</li><li>اقضِ ما فاتك من صيام السنة الماضية (من «قضاء ما فاتك»).</li><li>أكثر من صيام الاثنين والخميس.</li><li>جهّز نيّتك وخطتك للختمة (من «ختمة القرآن»).</li><li>نظّف قلبك وصالح من خاصمت.</li></ul></section>'
     +'<section class="card"><p class="note" style="margin:0">سيتحوّل هذا الباب تلقائيًا إلى جدول يومي للعبادات عند دخول الشهر.</p></section>';
  }else h='<section class="card"><p class="note">لم يبدأ رمضان بعد. سيظهر لك هنا العدّ التنازلي عند اقترابه.</p></section>';
  return '<div class="rm5">'+h+'</div>';
}

/* ---------- ٢) ختمة القرآن ---------- */
function khGet(){var K=S.khatma;return K&&typeof K==='object'&&K.start&&K.days?K:null}
function khStats(K){
  var read=0;Object.keys(S.quran.log||{}).forEach(function(d){if(d>=K.start)read+=S.quran.log[d]||0});
  var per=Math.ceil(604/K.days),el=Math.max(0,f5diff(K.start,dk())),exp=Math.min(604,el*per),today=(S.quran.log||{})[dk()]||0;
  return {read:Math.min(604,read),per:per,el:el,exp:exp,today:today,left:Math.max(0,604-read),dleft:Math.max(0,K.days-el)};
}
function vKhatma(){
  var K=khGet(),chips=[15,20,30,45,60,90].map(function(n){return '<button class="chip'+(K&&K.days===n?' on':'')+'" data-a="khset" data-v="'+n+'">'+ar(n)+' يومًا</button>'}).join('');
  if(!K)return '<section class="card"><h3>ختمة القرآن</h3><p class="note">اختر المدة التي تريد أن تختم فيها القرآن، وسيحسب التطبيق وردك اليومي ويخبرك إن كنت متقدّمًا أو متأخرًا.</p><div class="chips">'+chips+'</div></section>';
  var s=khStats(K),diff=s.read-s.exp,pct=Math.round(s.read/604*100),st=s.read>=604?'أتممتَ الختمة — تقبّل الله منك 🌙':(diff>=0?'أنت متقدّم بـ '+ar(diff)+' صفحة — بارك الله فيك':'أنت متأخر بـ '+ar(-diff)+' صفحة — تعوّضها بإذن الله');
  return '<div class="kh"><section class="rm5-hero"><small>ختمتك خلال '+ar(K.days)+' يومًا</small><b>'+ar(pct)+'٪</b><span>'+ar(s.read)+' من ٦٠٤ صفحة</span><div class="bar"><div style="width:'+pct+'%"></div></div></section>'
   +'<section class="card"><div class="kh-g"><div><small>ورد اليوم</small><b>'+ar(s.per)+'</b><em>صفحة</em></div><div><small>قرأتَ اليوم</small><b>'+ar(s.today)+'</b><em>'+(s.today>=s.per?'✓ تمّ الورد':'متبقٍّ '+ar(s.per-s.today))+'</em></div><div><small>الأيام الباقية</small><b>'+ar(s.dleft)+'</b><em>يومًا</em></div></div>'
   +'<p class="note kh-st">'+st+'</p>'
   +(S.quran.goal!==Math.min(30,s.per)?'<button class="btn" data-a="khgoal">اجعل وردي اليومي '+ar(Math.min(30,s.per))+' صفحة</button>':'')+'</section>'
   +'<section class="card"><h3>تغيير المدة</h3><div class="chips">'+chips+'</div><div class="acts"><button class="btn ghost bad" data-a="khreset">إلغاء الختمة</button></div></section></div>';
}

/* ---------- ٣) إحصاءات أسبوعية ---------- */
function vWeekly(){
  var days=[],i,names=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],T=dayTotal(),tp=0,tq=0,ap=0;
  for(i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var k=dk(d),dn=dayDone(k),pr=PR.filter(function(x){return (S.prayers[k]||{})[x[0]]}).length,q=(S.quran.log||{})[k]||0;
    days.push({n:names[d.getDay()],p:Math.round(dn/T*100),pr:pr,q:q});tp+=pr;tq+=q;ap+=Math.round(dn/T*100)}
  var s7=periodStats(7),s30=periodStats(30),best=0,cur=0;try{var st=stats();best=st.best||0;cur=st.cur||0}catch(e){}
  var bars=days.map(function(x){return '<div class="wk5-d"><div class="wk5-b"><i style="height:'+Math.max(3,x.p)+'%"></i></div><small>'+x.n+'</small><em>'+ar(x.p)+'٪</em></div>'}).join('');
  return '<div class="wk5"><section class="card"><h3>إنجازك في آخر ٧ أيام</h3><div class="wk5-bars">'+bars+'</div><p class="note" style="margin:8px 0 0">المتوسط: <b>'+ar(Math.round(ap/7))+'٪</b></p></section>'
   +'<section class="card wk5-g"><div><small>صلوات هذا الأسبوع</small><b>'+ar(tp)+'</b><em>من '+ar(35)+'</em></div><div><small>صفحات القرآن</small><b>'+ar(tq)+'</b></div><div><small>معدّل ٧ أيام</small><b>'+ar(s7.rate)+'٪</b></div><div><small>معدّل ٣٠ يومًا</small><b>'+ar(s30.rate)+'٪</b></div><div><small>سلسلتك الحالية</small><b>'+ar(cur)+'</b><em>يوم</em></div><div><small>أطول سلسلة</small><b>'+ar(best)+'</b><em>يوم</em></div></section>'
   +wgCard(tq,tp)+frCard()+'<p class="note" style="text-align:center">الهدف الاستمرار لا الكمال — قليل دائم خير من كثير منقطع.</p></div>';
}

/* ---------- ٤) ملاحظات ومفضلة ---------- */
var NT_KINDS=[['dua','دعاء'],['fa2','فائدة'],['other','ملاحظة']],ntKind='dua',ntDraft='';
function ntList(){if(!Array.isArray(S.notes))S.notes=[];return S.notes}
function ntFavs(){if(!Array.isArray(S.adkFav))S.adkFav=[];return S.adkFav}
function adkFind(id){var r=null;ADHKAR.forEach(function(g){g.items.forEach(function(it){if(it.id===id)r=it})});return r}
function vNotes(){
  var L=ntList(),F=ntFavs().map(adkFind).filter(Boolean);
  var favs=F.length?F.map(function(it){return '<div class="nt-i fav"><p class="ar">'+esc(it.t)+'</p><button class="nt-x" data-a="adkfav" data-id="'+it.id+'" aria-label="إزالة من المفضلة">★</button></div>'}).join(''):'<p class="note">اضغط ★ بجانب أي ذكر في صفحة «الأذكار» ليظهر هنا.</p>';
  var notes=L.length?L.slice().reverse().map(function(n){var k=NT_KINDS.filter(function(x){return x[0]===n.k})[0];return '<div class="nt-i"><small>'+(k?k[1]:'ملاحظة')+' · '+esc(n.d||'')+'</small><p class="keepar">'+esc(n.t)+'</p><button class="nt-x" data-a="ntdel" data-v="'+n.id+'" aria-label="حذف">✕</button></div>'}).join(''):'<p class="note">لا ملاحظات بعد.</p>';
  return '<div class="nt"><section class="card"><h3>إضافة</h3><div class="chips">'+NT_KINDS.map(function(x){return '<button class="chip'+(ntKind===x[0]?' on':'')+'" data-a="ntkind" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'
   +'<textarea id="nt-in" class="bk-ta" rows="3" maxlength="600" dir="rtl" placeholder="اكتب دعاءً أو فائدة أو ملاحظة…">'+esc(ntDraft)+'</textarea><div class="acts"><button class="btn" data-a="ntadd">حفظ</button></div></section>'
   +'<section class="card"><h3>أذكاري المفضلة</h3>'+favs+'</section><section class="card"><h3>ملاحظاتي</h3>'+notes+'</section>'+bmCard()+'</div>';
}
document.addEventListener('input',function(e){var t=e.target;if(t&&t.id==='nt-in')ntDraft=t.value});

/* ---------- ٥) حاسبة الزكاة ---------- */
var ZK_F=[['cash','النقد والأرصدة (بالعملة)'],['goldg','الذهب (جرام)'],['silverg','الفضة (جرام)'],['trade','عروض التجارة (قيمتها)'],['debt','ديون مستحقّة عليك (تُخصم)']];
function zkGet(){var z=S.zk;if(!z||typeof z!=='object'||Array.isArray(z))z=S.zk={};return z}
function zkCalc(){
  var z=zkGet(),gp=f5n(z.goldp),sp=f5n(z.silverp),base=z.nisab==='silver'?'silver':'gold';
  var gold=f5n(z.goldg)*gp,silver=f5n(z.silverg)*sp,total=Math.max(0,f5n(z.cash)+gold+silver+f5n(z.trade)-f5n(z.debt));
  var nis=base==='gold'?85*gp:595*sp,ok=nis>0&&total>=nis;
  return {total:total,nis:nis,ok:ok,zakat:ok?total*0.025:0,base:base,need:nis<=0};
}
function zkResult(){
  var r=zkCalc();
  if(r.need)return '<p class="note">أدخل سعر جرام '+(r.base==='gold'?'الذهب':'الفضة')+' ليُحسب النصاب.</p>';
  return '<div class="zk-r '+(r.ok?'ok':'')+'"><div><small>إجمالي ما تملك</small><b>'+f5ar(r.total)+'</b></div><div><small>النصاب ('+(r.base==='gold'?'٨٥ جرام ذهب':'٥٩٥ جرام فضة')+')</small><b>'+f5ar(r.nis)+'</b></div></div>'
   +(r.ok?'<div class="zk-due"><small>الزكاة الواجبة (٢٫٥٪)</small><b>'+f5ar(r.zakat)+'</b></div>':'<p class="note">لم يبلغ مالك النصاب، فلا زكاة عليه الآن إن لم يتغيّر حاله.</p>');
}
function vZakat(){
  var z=zkGet(),base=z.nisab==='silver'?'silver':'gold',hv=z.hawl,due=hv?f5add(hv,354):'';
  var inp=function(k,l){return '<label class="zk-l"><span>'+l+'</span><input class="qd-i zk-i" type="text" inputmode="decimal" data-zk="'+k+'" value="'+(z[k]||'')+'" placeholder="٠"></label>'};
  return '<div class="zk"><section class="card"><h3>حاسبة الزكاة</h3><p class="note">تقدير مساعد وليس فتوى. أسعار الذهب والفضة تُدخلها بنفسك لتكون دقيقة، وللحالات الخاصة راجع أهل العلم.</p>'
   +'<div class="chips"><button class="chip'+(base==='gold'?' on':'')+'" data-a="zkbase" data-v="gold">النصاب بالذهب</button><button class="chip'+(base==='silver'?' on':'')+'" data-a="zkbase" data-v="silver">النصاب بالفضة</button></div>'
   +inp('goldp','سعر جرام الذهب (عيار ٢٤)')+inp('silverp','سعر جرام الفضة')+ZK_F.map(function(x){return inp(x[0],x[1])}).join('')+'</section>'
   +'<section class="card" id="zk-res">'+zkResult()+'</section>'
   +'<section class="card"><h3>حَوَلان الحول</h3>'+(hv?'<p class="note">بدأ حولك في <b>'+ar(esc(hv))+'</b> — تجب الزكاة تقريبًا في <b>'+ar(esc(due))+'</b> (بعد سنة هجرية).</p><div class="acts"><button class="btn ghost" data-a="zkhawl" data-v="clear">إلغاء</button></div>':'<p class="note">سجّل اليوم الذي بلغ فيه مالك النصاب لتعرف موعد الزكاة.</p><div class="acts"><button class="btn" data-a="zkhawl" data-v="set">بدأ الحول اليوم</button></div>')+'</section></div>';
}
document.addEventListener('input',function(e){var t=e.target;if(t&&t.getAttribute&&t.hasAttribute('data-zk')){zkGet()[t.getAttribute('data-zk')]=t.value;save();var res=document.getElementById('zk-res');if(res)res.innerHTML=zkResult()}});

/* ---------- الأوامر ---------- */
function featAct(a,v,d){
  if(a==='ramtog'){var I=ramInfo();if(I&&I.state==='in'){var r=ramGet(I.year,I.day);r[v]=!r[v];save();hapGo([40]);return false}return true}
  if(a==='khset'){var n=parseInt(v,10);if(n>=1&&n<=365){var K=khGet();S.khatma={start:K?K.start:dk(),days:n};save()}return false}
  if(a==='khgoal'){var K2=khGet();if(K2){S.quran.goal=Math.max(1,Math.min(30,Math.ceil(604/K2.days)));save();toast('ضُبط وردك اليومي')}return false}
  if(a==='khreset'){delete S.khatma;save();return false}
  if(a==='ntkind'){ntKind=v;return false}
  if(a==='ntadd'){var el=document.getElementById('nt-in'),t=(el?el.value:ntDraft).trim();if(!t){toast('اكتب نصًا أولًا');return true}
    var L=ntList();L.push({id:'n'+Date.now().toString(36),k:ntKind,t:t.slice(0,600),d:dk()});if(L.length>200)L.shift();ntDraft='';save();return false}
  if(a==='ntdel'){S.notes=ntList().filter(function(x){return x.id!==v});save();return false}
  if(a==='adkall'){var gg=(typeof ADHKAR!=='undefined'?ADHKAR:[]).filter(function(x){return x.id===v})[0];if(gg){var kk=dk();S.counters[kk]=S.counters[kk]||{};var mx=0;gg.items.forEach(function(it){var lf=lockLeft('c:'+kk+':'+it.id);if(lf>0){mx=Math.max(mx,lf)}else delete S.counters[kk][it.id]});save();hapGo([20]);if(mx>0){lockBlock(mx);return false}}return false}
  if(a==='adkcopy'||a==='adkshare'){var tx='';(typeof ADHKAR!=='undefined'?ADHKAR:[]).forEach(function(gx){gx.items.forEach(function(it){if(it.id===(d&&d.id))tx=it.t})});
    if(tx){tx+='\n\n— السائر إلى الله';
      if(a==='adkshare'&&navigator.share){navigator.share({text:tx}).catch(function(){})}
      else{var okc=false;try{navigator.clipboard.writeText(tx);okc=true}catch(e){}if(!okc){try{var ta=document.createElement('textarea');ta.value=tx;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();okc=true}catch(e){}}toast(okc?'نُسخ الذكر':'تعذّر النسخ')}}
    return true}
  if(a==='adkfav'){var id=d&&d.id,F=ntFavs(),i=F.indexOf(id);if(id){if(i>=0)F.splice(i,1);else F.push(id);save();hapGo([30])}return false}
  if(a==='zkbase'){zkGet().nisab=v==='silver'?'silver':'gold';save();return false}
  if(a==='zkhawl'){var z=zkGet();if(v==='set')z.hawl=dk();else delete z.hawl;save();return false}
  return true;
}
