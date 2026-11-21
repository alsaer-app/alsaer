function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ---------- derived data ---------- */
function allHabits(){return HABITS.concat((S.myHabits||[]).map(function(h){return [h.id,h.t,true]})).concat((S.extraHabits||[]).filter(function(h){return h.type==='good'}).map(function(h){return [h.id,h.t,true]}))}
function qPages(k){return (S.quran.log[k]||0)}
function dayDone(k){
  var p=S.prayers[k]||{},h=(S.habits||{})[k]||{},n=0;
  PR.forEach(function(x){if(p[x[0]])n++});
  allHabits().forEach(function(x){if(h[x[0]])n++});
  if(qPages(k)>=S.quran.goal)n++;
  return n;
}
function dayTotal(){return PR.length+allHabits().length+1}
function periodStats(N){
  var ok=0,rel=0,tot=0,done=0,active=0,T=dayTotal();
  for(var i=0;i<N;i++){var d=new Date();d.setDate(d.getDate()-i);var k=dk(d),r=S.days[k],dn=dayDone(k);
    if(r){tot++;if(r.status==='success')ok++;else if(r.status==='relapse')rel++}
    if(r||dn>0){active++;done+=dn}}
  return{ok:ok,rel:rel,tot:tot,rate:active?Math.min(100,Math.round(done/(active*T)*100)):0,active:active};
}
function stats(){
  var today=dk(),v=Object.keys(S.days||{}).map(function(k){return S.days[k]});
  var ok=v.filter(function(x){return x&&x.status==='success'}).length;
  var rel=v.filter(function(x){return x&&x.status==='relapse'}).length;
  var cur=0,best=0,start=parse(S.startDate),end=parse(today);
  for(var d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    var rec=S.days[dk(d)];
    if(rec&&rec.status==='success')cur++;
    else if(!(typeof frozen==='function'&&frozen(dk(d))))cur=0;
    if(cur>best)best=cur;
  }
  cur=0;
  var cursor=new Date(end),todayRec=S.days[today];
  if(!todayRec)cursor.setDate(cursor.getDate()-1);
  for(;cursor>=start;cursor.setDate(cursor.getDate()-1)){
    var dayRec=S.days[dk(cursor)];
    if(dayRec&&dayRec.status==='success')cur++;
    else if(typeof frozen==='function'&&frozen(dk(cursor)))continue;
    else break;
  }
  var total=ok+rel;
  return{cur:cur,best:best,ok:ok,rel:rel,rate:total?Math.round(ok/total*100):0};
}
function groupDone(){
  var c=S.counters||{};
  return Object.keys(c).some(function(day){return ADHKAR.some(function(g){return g.items.every(function(it){return (c[day][it.id]||0)>=it.n})})});
}
function achievements(){
  var s=stats(),list=[];
  MILES.forEach(function(n){list.push({id:'s'+n,kind:'streak',n:n,title:n===1?'اليوم الأول':n+' يوماً',desc:'سلسلة '+n+(n<11?' أيام':' يوماً')+' متتالية',done:s.best>=n,p:Math.min(1,s.cur/n)})});
  var notes=Object.keys(S.days).filter(function(k){return S.days[k].note}).length;
  list.push({id:'first',icon:'flag',title:'أول خطوة',desc:'سجّل أول يوم لك',done:Object.keys(S.days).length>=1,p:Math.min(1,Object.keys(S.days).length)});
  list.push({id:'ok10',icon:'star',title:'١٠ أيام نجاح',desc:'عشرة أيام نجاح مسجّلة',done:s.ok>=10,p:Math.min(1,s.ok/10)});
  list.push({id:'ok50',icon:'trophy',title:'٥٠ يوم نجاح',desc:'خمسون يوماً مسجّلاً بنجاح',done:s.ok>=50,p:Math.min(1,s.ok/50)});
  list.push({id:'back',icon:'up',title:'عدتُ أقوى',desc:'أكمل ٣ أيام بعد انتكاسة',done:s.rel>0&&s.cur>=3,p:s.rel>0?Math.min(1,s.cur/3):0});
  list.push({id:'why',icon:'heart',title:'أعرف لماذا',desc:'اكتب ٣ أسباب للإقلاع',done:S.reasons.length>=3,p:Math.min(1,S.reasons.length/3)});
  list.push({id:'wird',icon:'beads',title:'ورد كامل',desc:'أتمّ كل أذكار مجموعة في يوم',done:groupDone(),p:groupDone()?1:0});
  list.push({id:'note',icon:'pen',title:'أتأمل نفسي',desc:'اكتب ٥ ملاحظات يومية',done:notes>=5,p:Math.min(1,notes/5)});
  var urges=(S.urges||[]).length;
  list.push({id:'urge5',icon:'shield',title:'حارس القلب',desc:'تجاوز ٥ رغبات',done:urges>=5,p:Math.min(1,urges/5)});
  var pd=Object.keys(S.habits||{}).filter(function(k){return HABITS.every(function(h){return S.habits[k][h[0]]})}).length;
  list.push({id:'plan3',icon:'check',title:'ملتزم بالخطة',desc:'أكمل خطة اليوم ٣ أيام',done:pd>=3,p:Math.min(1,pd/3)});
  var td=Object.keys(S.days).filter(function(k){return (S.days[k].trig||[]).length}).length;
  list.push({id:'know',icon:'star',title:'أعرف نفسي',desc:'سجّل المحفّزات في ٥ أيام',done:td>=5,p:Math.min(1,td/5)});
  var pf=Object.keys(S.prayers).filter(function(k){return PR.every(function(p){return S.prayers[k][p[0]]})}).length;
  list.push({id:'pr7',icon:'mosque',title:'محافظ على الصلاة',desc:'أتمّ الصلوات الخمس في ٧ أيام',done:pf>=7,p:Math.min(1,pf/7)});
  var tp=0;Object.keys(S.quran.log).forEach(function(d){tp+=S.quran.log[d]||0});
  list.push({id:'khatma',icon:'book',title:'ختمة المصحف',desc:'اقرأ ٦٠٤ صفحات',done:tp>=604,p:Math.min(1,tp/604)});
  var wp=totalWorshipPoints();
  [10,25,50,100,250,500].forEach(function(n){list.push({id:'worship'+n,icon:'star',title:n+' نقطة عبادات',desc:'اجمع '+n+' نقطة من عباداتك اليومية',done:wp>=n,p:Math.min(1,wp/n)})});
  return list;
}
function rankName(b){return b<3?'بداية الطريق':b<7?'خطوة ثابتة':b<30?'عزيمة':b<90?'إرادة صلبة':'ثبات'}

/* ---------- state ---------- */
