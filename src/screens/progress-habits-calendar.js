function vFasting(){
  var today=dk(),todayReasons=fastingReasons(new Date()),up=nextFastingDays(8),p=S.fasting.prefs,r=S.fasting.reminders;
  var items=[['monThu','الاثنين والخميس','صيام التطوع الأسبوعي'],['whiteDays','الأيام البيض','13 و14 و15 من كل شهر هجري'],['ashura','تاسوعاء وعاشوراء','9 و10 محرم'],['arafa','يوم عرفة','9 ذو الحجة'],['shawwal','ستة من شوال','من 2 إلى 7 شوال'],['dawud','صيام داود','يوم صيام ويوم إفطار']];
  var html='<section class="card fasting-hero"><div class="fasting-icon">'+ic('moon')+'</div><h2>باب الصيام</h2><p class="note">تابع صيام التطوع، وخطّط لأيامك القادمة، وسجّل ما أتممته.</p><div class="fasting-today"><b>اليوم</b><span>'+(todayReasons.length?todayReasons.join(' · '):'لا يوجد صيام تطوع محدد اليوم')+'</span></div><div class="row"><button class="btn good" data-a="fastrecord" data-v="done">صمت اليوم</button><button class="btn ghost" data-a="fastrecord" data-v="missed">لم أصم</button></div>'+(fastingStatus(today)?'<p class="note" style="margin:8px 0 0">حالة اليوم: '+(fastingStatus(today)==='done'?'تم تسجيل الصيام':'لم يتم الصيام')+'</p>':'')+'</section>';
  html+='<section class="card"><h3>أيام الصيام التي تتابعها</h3><p class="note">فعّل الأيام التي تريد إدراجها في جدولك.</p><div class="fast-options">'+items.map(function(x){return '<button class="fast-option '+(p[x[0]]?'on':'')+'" data-a="fastpref" data-v="'+x[0]+'"><span class="fast-check">'+(p[x[0]]?ic('check'):'')+'</span><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span></button>'}).join('')+'</div></section>';
  html+='<section class="card"><h3>الأيام القادمة</h3>'+(up.length?up.map(function(x){return '<div class="fast-next"><div><b>'+esc(x.day)+'</b><small>'+esc(x.date)+'</small></div><span>'+esc(x.reasons.join(' · '))+'</span></div>'}).join(''):'<p class="note">فعّل نوعًا من الصيام لعرض الأيام القادمة.</p>')+'<div class="addrow"><input type="date" id="fast-custom-date"><button class="btn" data-a="fastcustom">إضافة يوم</button></div>'+fastCustomList()+'</section>';
  html+='<section class="card"><h3>تذكيرات الصيام</h3><div class="fast-option"><span><b>تفعيل التذكيرات داخل التطبيق</b><small>عرض تنبيهات الصيام في مركز التذكيرات</small></span><button class="toggle '+(r.enabled?'on':'')+'" data-a="fastremind" data-v="enabled">'+(r.enabled?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>التذكير قبل يوم الصيام</b><small>عند فتح التطبيق في اليوم السابق</small></span><button class="toggle '+(r.beforeDay?'on':'')+'" data-a="fastremind" data-v="beforeDay">'+(r.beforeDay?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>تذكير السحور</b><small>الوقت المفضل لديك</small></span><button class="toggle '+(r.suhoor?'on':'')+'" data-a="fastremind" data-v="suhoor">'+(r.suhoor?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>موعد السحور</b></span><input type="time" id="suhoor-time" value="'+esc(r.suhoorTime||'03:30')+'"></div><div class="fast-option"><span><b>تذكير الإفطار</b><small>تذكير اختياري داخل التطبيق</small></span><button class="toggle '+(r.iftar?'on':'')+'" data-a="fastremind" data-v="iftar">'+(r.iftar?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>وقت الإفطار</b></span><input type="time" id="iftar-time" value="'+esc(r.iftarTime||'17:00')+'"></div><button class="btn block" data-a="fasttimes">حفظ أوقات التذكير</button></section>';
  return html+COPY;
}
function vHabits(){
  var k=dk(),hb=(S.habits||{})[k]||{},counts=(S.habitCounts||{})[k]||{};
  var good=allHabits(),bad=BAD_HABITS.concat((S.extraHabits||[]).filter(function(h){return h.type==='bad'}).map(function(h){return [h.id,h.t,true]}));
  var done=good.filter(function(h){return !!hb[h[0]]}).length;
  var badCount=bad.reduce(function(n,h){return n+(counts[h[0]]||0)},0);
  var h='<section class="card habits-summary"><div class="row between"><b>العادات الحسنة</b><strong>'+done+' / '+good.length+'</strong></div><div class="bar"><div style="width:'+(good.length?Math.round(done/good.length*100):0)+'%"></div></div><p class="note">كل خطوة حسنة تُسجّلها اليوم تقرّبك من هدفك.</p><div class="row between"><b>مرات تسجيل العادات السيئة اليوم</b><strong>'+badCount+'</strong></div><p class="note">العداد للتوعية والمتابعة، وليس للحكم عليك. ابدأ من جديد دون جلد للذات.</p></section>';
  h+='<div class="sect">'+ic('leaf')+'عادات حسنة</div><div class="cl">'+good.map(function(x){var on=!!hb[x[0]],custom=!!x[2];return '<div class="cli sq'+(on?' on':'')+'"><span class="nm">'+esc(x[1])+'</span>'+(custom?'<button class="x" data-a="delxh" data-v="'+esc(x[0])+'" aria-label="حذف العادة">'+ic('trash')+'</button>':'')+'<button class="ck" data-a="hab" data-v="'+esc(x[0])+'" aria-pressed="'+on+'">'+ic('check')+'</button></div>'}).join('')+'</div>';
  h+='<div class="sect bad-sect">'+ic('target')+'عادات تريد التقليل منها أو تركها</div><p class="note">سجّل كل مرة تحدث فيها العادة، وتابع انخفاض العدد مع الوقت.</p><div class="cl">'+bad.map(function(x){var n=counts[x[0]]||0,custom=!!x[2];return '<div class="cli bad-habit"><span class="nm">'+esc(x[1])+'</span><span class="habit-count">'+n+'</span><button class="count-btn" data-a="baddec" data-v="'+esc(x[0])+'" aria-label="تقليل العداد">−</button><button class="count-btn plus" data-a="badinc" data-v="'+esc(x[0])+'" aria-label="تسجيل مرة">+</button>'+(custom?'<button class="x" data-a="delxh" data-v="'+esc(x[0])+'" aria-label="حذف العادة">'+ic('trash')+'</button>':'')+'</div>'}).join('')+'</div>';
  h+='<section class="card"><h3>'+(addingHabit?'إضافة عادة جديدة':'إضافة عادة')+'</h3>'+(addingHabit?'<div class="row"><button class="btn '+(addingHabitType==='good'?'':'ghost')+'" data-a="newhtype" data-v="good">عادة حسنة</button><button class="btn '+(addingHabitType==='bad'?'':'ghost')+'" data-a="newhtype" data-v="bad">عادة سيئة</button></div><input type="text" id="new-habit-name" maxlength="60" placeholder="مثال: قراءة صفحة قرآن أو التدخين"><button class="btn block" data-a="saveextra">حفظ العادة</button><button class="btn ghost block" data-a="cancelextra">إلغاء</button>':'<button class="addbtn" data-a="addextra">'+ic('plus')+'إضافة عادة حسنة أو سيئة</button>')+'</section>';
  return h+COPY;
}
function vCal(){
  var y=calD.getFullYear(),m=calD.getMonth(),first=(new Date(y,m,1).getDay()+1)%7,n=new Date(y,m+1,0).getDate(),h='',ok=0,rel=0;
  for(var i=0;i<first;i++)h+='<div></div>';
  for(var d=1;d<=n;d++){var k=dk(new Date(y,m,d)),st=S.days[k]?S.days[k].status:'';if(st==='success')ok++;if(st==='relapse')rel++;
    h+='<button class="day '+st+(k===dk()?' today':'')+'" data-a="sel" data-k="'+k+'">'+d+'</button>'}
  var rate=(ok+rel)?Math.round(ok/(ok+rel)*100):0;
  var sel=calSel?'<section class="card"><h3>'+esc(calSel)+'</h3>'+(S.days[calSel]&&S.days[calSel].note?'<p>'+esc(S.days[calSel].note)+'</p>':'')
   +'<div class="row"><button class="btn good" data-a="setday" data-v="success">ملتزم</button><button class="btn bad" data-a="setday" data-v="relapse">تعثر</button><button class="btn ghost" data-a="setday" data-v="">مسح</button></div></section>':'';
  return '<section class="card"><div class="mhead"><button class="icon" data-a="next" aria-label="الشهر التالي">›</button><h2>'+MONTHS[m]+' '+y+'</h2><button class="icon" data-a="prev" aria-label="الشهر السابق">‹</button></div>'
  +'<div class="cal">'+WKD.map(function(w){return '<div class="wd">'+w+'</div>'}).join('')+h+'</div>'
  +'<p class="legend"><span><span class="dot" style="background:var(--good)"></span>ملتزم</span><span><span class="dot" style="background:var(--bad)"></span>تعثر</span><span><span class="dot" style="background:var(--line)"></span>بدون متابعة</span></p></section>'
  +sel
  +'<section class="card"><div class="rateline"><div><h3 style="margin:0">إحصائيات الشهر</h3><small>'+ok+' ملتزم · '+rel+' تعثر</small></div><b>'+rate+'%</b></div><div class="bar"><div style="width:'+rate+'%"></div></div></section>'
  +vInsights();
}
function vInsights(){
  var x=trigCounts();
  if(!x.tot)return '<section class="card"><h3>تحليل المحفّزات</h3><p class="muted" style="margin:0">سجّل ما أثار الرغبة كل يوم من الصفحة الرئيسية، وستظهر هنا أكثر المحفّزات تأثيراً عليك.</p></section>';
  var mx=Math.max.apply(null,TRIG.map(function(t){return x.c[t[0]]||0}));
  return '<section class="card"><h3>تحليل المحفّزات</h3>'+TRIG.map(function(t){var n=x.c[t[0]]||0,r=x.r[t[0]]||0;
    return '<div class="ins"><span>'+t[1]+'</span><div class="bar"><div style="width:'+Math.round(n/mx*100)+'%"></div></div><b>'+n+'</b></div>'+(r?'<div class="ins" style="margin-top:-4px"><span></span><small>منها '+r+' في أيام انتكاسة</small></div>':'')}).join('')+'</section>';
}
function weekAgg(off){
  var pr=0,qp=0,wp=0,hb=0,i;
  for(i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-off*7-i);var k=dk(d),pp=S.prayers[k]||{};PR.forEach(function(x){if(pp[x[0]])pr++});qp+=qPages(k);wp+=worshipPoints(k);var h=(S.habits||{})[k]||{};Object.keys(h).forEach(function(id){if(h[id])hb++})}
  return{pr:pr,qp:qp,wp:wp,hb:hb};
}
function weeklyReportCard(){
  var a=weekAgg(0),b=weekAgg(1);
  function row(l,x,y,u){var dl=x-y,cls=dl>0?'up':dl<0?'dn':'eq',tx=dl>0?'▲ '+ar(dl):dl<0?'▼ '+ar(-dl):'—';return '<div class="wr-row"><span>'+l+'</span><b>'+ar(x)+(u?' '+u:'')+'</b><em class="'+cls+'">'+tx+'</em></div>'}
  return '<section class="card wr"><div class="rateline"><div><h3 style="margin:0">تقرير الأسبوع</h3><small>آخر ٧ أيام مقارنةً بالأسبوع الذي قبله</small></div></div>'
   +row('الصلوات المسجّلة',a.pr,b.pr,'من ٣٥')+row('صفحات القرآن',a.qp,b.qp,'')+row('العبادات اليومية',a.wp,b.wp,'')+row('العادات الحسنة',a.hb,b.hb,'')+'</section>';
}
function vProgress(){
  var N=per==='week'?7:30,x=periodStats(N),C=2*Math.PI*84,off=C*(1-x.rate/100);
  var msgT=x.rate>=80?'أحسنت':x.rate>=50?'جيد، واصل':'ابدأ من جديد',msgS=x.rate>=80?'استمر، أنت تتقدم بخطوات ثابتة.':x.rate>=50?'أنت على الطريق، زِد قليلاً كل يوم.':'كل خطوة صغيرة تُحسب، ولا تحاسب نفسك على الماضي.';
  return '<div class="seg"><button class="'+(per==='week'?'on':'')+'" data-a="per" data-v="week">أسبوعي</button><button class="'+(per==='month'?'on':'')+'" data-a="per" data-v="month">شهري</button></div>'
  +'<div class="bigring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="84" fill="none" stroke="var(--surface-2)" stroke-width="14"/><circle cx="100" cy="100" r="84" fill="none" stroke="var(--good)" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div class="mid"><b>'+x.rate+'%</b><small>معدل الالتزام</small></div></div>'
  +'<div class="grid3"><div class="stat g"><b>'+x.ok+'</b><small>أيام ملتزمة</small></div><div class="stat r"><b>'+x.rel+'</b><small>أيام تعثر</small></div><div class="stat o"><b>'+x.tot+'</b><small>إجمالي الأيام</small></div></div>'
  +'<section class="card cheer">'+ic('leaf')+'<div><b>'+msgT+'</b><span class="muted">'+msgS+'</span></div></section>'
  +weeklyReportCard()
  +habitReportCard()
  +'<section class="card"><h3>مراجعة صادقة مع النفس</h3><p class="note">ما أكثر شيء ساعدك؟ وما خطوة واحدة تريد تحسينها؟</p><textarea id="review-note" maxlength="2000" placeholder="اكتب ملاحظاتك الخاصة..."></textarea><button class="btn block" data-a="savereview">حفظ المراجعة على هذا الجهاز</button></section>'
  +'<p class="note">هذه مؤشرات ذاتية مبنية على ما سجلته فقط، وليست حكماً على قيمتك أو التزامك.</p>';
}

function fastCustomList(){
  var L=(S.fasting.customDates||[]).slice().sort();if(!L.length)return '';
  return '<h4 style="margin:14px 0 6px">أيامي الخاصة</h4>'+L.map(function(d){var dt=new Date(d+'T12:00:00'),nm=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][dt.getDay()];
    return '<div class="fast-next"><div><b>'+nm+'</b><small>'+d+'</small></div><button class="btn ghost" data-a="fastcustomdel" data-v="'+d+'" aria-label="حذف">'+ic('trash')+'</button></div>'}).join('');
}
