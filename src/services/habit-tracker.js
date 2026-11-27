/* ===== متتبّع العادة المستهدفة: تسجيل متعدد المرات في اليوم + تقرير ===== */
var manageTargets=false,repRange='week',showRep=false;
function mainName(){return String(S.mainName||'').trim()||'العادة الرئيسية'}
function trackables(){
  var l=[['main',mainName(),'bad']];
  BAD_HABITS.forEach(function(h){l.push([h[0],h[1],'bad'])});
  (S.extraHabits||[]).forEach(function(h){if(h.type==='bad')l.push([h.id,h.t,'bad'])});
  allHabits().forEach(function(h){l.push([h[0],h[1],'good'])});
  return l;
}
function curTarget(){var l=trackables(),id=S.target||'main';return l.filter(function(x){return x[0]===id})[0]||l[0]}
function EVS(){if(!S.evlog||typeof S.evlog!=='object'||Array.isArray(S.evlog))S.evlog={};return S.evlog}
function evArr(k,id){var L=EVS()[k];return (L&&Array.isArray(L[id]))?L[id]:[]}
function evTally(a){var d=0,s=0;a.forEach(function(e){if(e[1])d++;else s++});return{d:d,s:s}}
/* العدّ مع مراعاة بيانات الإصدارات السابقة التي لم تحفظ أحداثًا مفردة */
function evCounts(k,id,type){
  var a=evArr(k,id);if(a.length)return evTally(a);
  if(id==='main'){var r=S.days[k];return{d:r&&r.status==='relapse'?1:0,s:r&&r.status==='success'?1:0}}
  if(type==='bad')return{d:((S.habitCounts||{})[k]||{})[id]||0,s:0};
  return{d:((S.habits||{})[k]||{})[id]?1:0,s:0};
}
function evType(id){var t=trackables().filter(function(x){return x[0]===id})[0];return t?t[2]:'bad'}
function evSeed(id,k){ /* تحويل تسجيل قديم (بلا أحداث) إلى أحداث بلا وقت قبل الإضافة عليه */
  var E=EVS(),L=E[k]=E[k]||{};if(L[id]&&L[id].length)return L[id];
  var a=L[id]=[],c=evCounts(k,id,evType(id)),i;
  for(i=0;i<c.d&&i<300;i++)a.push([0,1]);for(i=0;i<c.s&&i<300;i++)a.push([0,0]);
  return a;
}
function evSync(id,k){
  var a=evArr(k,id),t=evTally(a),type=evType(id);
  if(id==='main'){
    var r=S.days[k],st=t.d>0?'relapse':(t.s>0?'success':null);
    var note=draft!==null?draft:((r&&r.note)||''),trig=draftTrig!==null?draftTrig:((r&&r.trig)||[]);
    if(st)S.days[k]={status:st,note:note,trig:trig};
    else if(r){if(note||(trig||[]).length)S.days[k]={note:note,trig:trig};else delete S.days[k]}
    draft=null;draftTrig=null;
  }else if(type==='bad'){
    S.habitCounts=S.habitCounts||{};var hc=S.habitCounts[k]=S.habitCounts[k]||{};
    if(t.d>0)hc[id]=Math.min(999,t.d);else delete hc[id];
  }else{
    S.habits=S.habits||{};var hb=S.habits[k]=S.habits[k]||{};
    if(t.d>0)hb[id]=true;else delete hb[id];
  }
  if(!a.length&&S.evlog[k]){delete S.evlog[k][id];if(!Object.keys(S.evlog[k]).length)delete S.evlog[k]}
  save();checkNew();
}
function evLog(id,v){
  var k=dk(),a=evSeed(id,k);
  if(a.length>=300){toast('تم الوصول إلى الحد الأعلى للتسجيل اليوم');return}
  a.push([Date.now(),v?1:0]);evSync(id,k);
}
function evUndo(id,only){ /* only: 1 أو 0 لحذف آخر حدث من نوع معيّن، وإلا آخر حدث */
  var k=dk(),a=evSeed(id,k),i;
  for(i=a.length-1;i>=0;i--){if(only===undefined||a[i][1]===only){
    if(i===0&&a[0][0]>0){var lf=a[0][0]+864e5-Date.now();if(lf>0&&Date.now()-a[0][0]>UNDO_MS){lockBlock(lf);return false}}a.splice(i,1);evSync(id,k);return true}}
  if(!a.length&&S.evlog[k])delete S.evlog[k][id];
  return false;
}
function evTime(ts){if(!ts)return '—';try{var d=new Date(ts);return hmFmt(d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes())}catch(e){return ''}}
function targetChips(withManage){
  var id=curTarget()[0],all=trackables();
  return '<div class="trk-pick"><div class="trk-row" id="trk-row">'+all.map(function(x){return '<button class="chip'+(x[0]===id?' on':'')+'" data-a="settarget" data-v="'+esc(x[0])+'">'+esc(x[1])+'</button>'}).join('')+'</div>'+(withManage?'<button class="trk-gear'+(manageTargets?' on':'')+'" data-a="mgtarget" aria-label="إدارة العادات" title="عاداتي المخصصة">⚙</button>':'')+'</div>';
}
var trkMore=false;
function trkFix(){var r=document.getElementById('trk-row');if(!r)return;var o=r.querySelector('.chip.on');if(!o)return;var a=o.getBoundingClientRect(),b=r.getBoundingClientRect();r.scrollLeft+=(a.left+a.width/2)-(b.left+b.width/2)}
document.addEventListener('toggle',function(e){if(e.target&&e.target.id==='trk-more')trkMore=e.target.open},true);
function manageBox(){
  var id=curTarget()[0],extra={};(S.extraHabits||[]).forEach(function(h){extra[h.id]=1});
  return '<div class="mgbox"><h4>عاداتي المخصصة</h4>'+trackables().map(function(x){
    return '<div class="mgrow"><span><b>'+esc(x[1])+'</b><small>'+(x[2]==='bad'?'عادة تريد تقليلها أو تركها':'عادة حسنة')+'</small></span><button class="mini'+(x[0]===id?' on':'')+'" data-a="settarget" data-v="'+esc(x[0])+'">'+(x[0]===id?'المستهدفة ✓':'اجعلها مستهدفة')+'</button>'+(extra[x[0]]?'<button class="mini del" data-a="delxh" data-v="'+esc(x[0])+'" aria-label="حذف">حذف</button>':'')+'</div>';
  }).join('')
  +'<div class="mgrow"><span><b>هدف أسبوعي للعادة المستهدفة</b><small>'+(curTarget()[2]==='bad'?'حد أقصى لمرات «فعلتها»':'عدد مرات «فعلتها» المطلوبة')+' (فارغ = بدون)</small></span><input type="number" id="goal-n" min="1" max="999" value="'+esc((S.goals||{})[id]||'')+'" style="max-width:70px"><button class="mini" data-a="savegoal">حفظ</button></div>'
  +'<div class="mgrow"><input type="text" id="main-name" maxlength="40" value="'+esc(S.mainName||'')+'" placeholder="اسم العادة الرئيسية (اختياري)"><button class="mini" data-a="savemain">حفظ الاسم</button></div>'
  +'<h4 style="margin-top:12px">إضافة عادة</h4><div class="row"><button class="btn '+(addingHabitType==='good'?'':'ghost')+'" data-a="newhtype" data-v="good">عادة حسنة</button><button class="btn '+(addingHabitType==='bad'?'':'ghost')+'" data-a="newhtype" data-v="bad">عادة سيئة</button></div>'
  +'<input type="text" id="new-habit-name" maxlength="60" placeholder="اسم العادة"><button class="btn block" data-a="saveextra">إضافة وجعلها مستهدفة</button></div>';
}
function trackerCard(){
  var T=curTarget(),id=T[0],bad=T[2]==='bad',k=dk(),a=evArr(k,id),c=evCounts(k,id,T[2]);
  var dCls=bad?'no':'ok',sCls=bad?'ok':'no',dBtn=bad?'bad':'good',sBtn=bad?'good':'bad';
  var h='<section class="card tracker"><div class="trk-h"><h3>تسجيل اليوم</h3><span class="trk-sub">'+esc(T[1])+'</span></div>'+targetChips(true)+(manageTargets?manageBox():'');
  h+='<div class="trk-stat"><div class="'+dCls+'"><b>'+ar(c.d)+'</b><small>فعلتها</small></div><i></i><div class="'+sCls+'"><b>'+ar(c.s)+'</b><small>لم أفعلها</small></div></div>';
  h+=weekGoalLine(id,T[2]);
  h+='<div class="row trk-act"><button class="btn '+sBtn+'" data-a="evlog" data-v="0">'+ic(bad?'check':'x')+'لم أفعلها</button><button class="btn '+dBtn+'" data-a="evlog" data-v="1">'+ic(bad?'x':'check')+'فعلتها</button></div>';
  if(a.length){
    h+='<div class="ev-list">'+a.slice(-6).reverse().map(function(e){var done=!!e[1];return '<span class="ev-chip '+((done===bad)?'no':'ok')+'">'+(done?'فعلتها':'لم أفعلها')+' · '+evTime(e[0])+'</span>'}).join('')+'</div>';
  }
  if(id==='main'){
    var t=S.days[k],trigs=draftTrig!==null?draftTrig:((t&&t.trig)||[]),note=draft!==null?draft:((t&&t.note)||'');
    h+='<details class="trk-more" id="trk-more"'+(trkMore?' open':'')+'><summary>ما الذي أثار الرغبة اليوم؟ <small>(اختياري)</small></summary><div class="tg">'+TRIG.map(function(g){return '<button class="'+(trigs.indexOf(g[0])>=0?'on':'')+'" data-a="trg" data-v="'+g[0]+'">'+g[1]+'</button>'}).join('')+'</div><textarea id="note" rows="2" placeholder="ملاحظة اختيارية: ما الذي ساعدك؟">'+esc(note)+'</textarea></details>';
  }
  h+='<button class="trk-rep" data-a="showrep">'+(showRep?'إخفاء التقرير':'📊 التقرير والإحصاء')+'</button>';
  if(showRep)h+=habitReportBody(id,T[2],T[1]);
  return h+'</section>';
}
function weekGoalLine(id,type){
  var g=(S.goals||{})[id];if(!g)return '';
  var d=evSeries(id,type,7,0).reduce(function(n,x){return n+x.d},0),bad=type==='bad';
  if(bad)return '<div class="goal '+(d<=g?'ok':'no')+'">الحد الأسبوعي: '+ar(d)+' من '+ar(g)+' مرة (آخر ٧ أيام) · '+(d<=g?'متبقٍ '+ar(g-d):'تجاوزته بـ'+ar(d-g))+'</div>';
  return '<div class="goal '+(d>=g?'ok':'no')+'">الهدف الأسبوعي: '+ar(d)+' من '+ar(g)+' مرة (آخر ٧ أيام)'+(d>=g?' · أحسنت، حققت هدفك':'')+'</div>';
}
function evSeries(id,type,n,off){
  var out=[],i,dt,k,c;
  for(i=n-1+off;i>=off;i--){dt=new Date();dt.setDate(dt.getDate()-i);k=dk(dt);c=evCounts(k,id,type);out.push({k:k,dt:dt,d:c.d,s:c.s})}
  return out;
}
function habitReportBody(id,type,name){
  var bad=type==='bad',N=repRange==='month'?30:7,cur=evSeries(id,type,N,0),prev=evSeries(id,type,N,N);
  var sum=function(a,f){return a.reduce(function(n,x){return n+x[f]},0)};
  var D=sum(cur,'d'),Sk=sum(cur,'s'),PD=sum(prev,'d'),PS=sum(prev,'s'),act=cur.filter(function(x){return x.d+x.s>0}).length;
  var clean=cur.filter(function(x){return x.d===0&&x.s>0}).length,rate=(D+Sk)?Math.round(Sk/(D+Sk)*100):0;
  var mx=Math.max(1,Math.max.apply(null,cur.map(function(x){return Math.max(x.d,x.s)})));
  var cD=bad?'var(--t2)':'var(--t0)',cS=bad?'var(--t0)':'var(--t2)';
  var bars='<div class="rbars">'+cur.map(function(x,i){
    var lab=N===7?WEEK[x.dt.getDay()]:((i%5===0||i===N-1)?ar(x.dt.getDate()):'');
    return '<div class="rb"><div class="rbc"><i style="height:'+Math.round(x.d/mx*100)+'%;background:'+cD+'"></i><i style="height:'+Math.round(x.s/mx*100)+'%;background:'+cS+'"></i></div><span>'+lab+'</span></div>'}).join('')+'</div>'
    +'<div class="rleg"><span><i style="background:'+cD+'"></i>فعلتها</span><span><i style="background:'+cS+'"></i>لم أفعلها</span></div>';
  var parts=[['الفجر والصباح (٤–١٢)',0],['الظهر والعصر (١٢–٥)',0],['المساء (٥–٩)',0],['الليل (٩–٤)',0]];
  cur.forEach(function(x){evArr(x.k,id).forEach(function(e){if(!e[0]||!e[1])return;var hr=new Date(e[0]).getHours();parts[(hr>=4&&hr<12)?0:(hr>=12&&hr<17)?1:(hr>=17&&hr<21)?2:3][1]++})});
  var pm=Math.max(1,Math.max.apply(null,parts.map(function(p){return p[1]})));
  var timeBox=parts.some(function(p){return p[1]>0})?'<h4>متى تتكرر «فعلتها»؟</h4>'+parts.map(function(p){return '<div class="ins"><span>'+p[0]+'</span><div class="bar"><div style="width:'+Math.round(p[1]/pm*100)+'%"></div></div><b>'+ar(p[1])+'</b></div>'}).join(''):'';
  var per=N===7?'هذا الأسبوع':'هذا الشهر',pper=N===7?'الأسبوع الماضي':'الشهر الماضي',msg;
  if(!act)msg='لا توجد تسجيلات لهذه العادة '+per+' بعد. ابدأ بالتسجيل لتظهر لك الإحصاءات.';
  else{
    var diff=D-PD,pct=PD?Math.round(Math.abs(diff)/PD*100):0;
    msg=per+' سجّلت «فعلتها» '+ar(D)+' مرة و«لم أفعلها» '+ar(Sk)+' مرة';
    if(PD||PS){msg+='، مقابل '+ar(PD)+' و'+ar(PS)+' في '+pper+'. ';
      if(diff===0)msg+='العدد ثابت.';
      else if(bad)msg+=diff<0?('انخفضت مرات «فعلتها» بنسبة '+ar(pct)+'٪، أحسنت واستمر.'):('زادت مرات «فعلتها» '+(PD?'بنسبة '+ar(pct)+'٪':'')+'، لا بأس، راجع المحفّزات وابدأ من جديد.');
      else msg+=diff>0?('زادت مواظبتك '+(PD?'بنسبة '+ar(pct)+'٪':'')+'، بارك الله فيك.'):('قلّت مواظبتك بنسبة '+ar(pct)+'٪، حاول أن تعود تدريجيًا.')}
    else msg+='.';
  }
  var tbl=trackables().map(function(x){var s=evSeries(x[0],x[2],N,0),d=sum(s,'d'),q=sum(s,'s');return d+q?'<div class="kv"><span>'+esc(x[1])+'</span><b>'+ar(d)+' / '+ar(q)+'</b></div>':''}).join('');
  return '<div class="rep"><div class="seg"><button class="'+(N===7?'on':'')+'" data-a="repr" data-v="week">أسبوعي</button><button class="'+(N===30?'on':'')+'" data-a="repr" data-v="month">شهري</button></div>'
   +'<h4>'+esc(name)+'</h4><p class="note rsum">'+msg+'</p>'
   +'<div class="grid3"><div class="stat '+(bad?'r':'g')+'"><b>'+ar(D)+'</b><small>فعلتها</small></div><div class="stat '+(bad?'g':'r')+'"><b>'+ar(Sk)+'</b><small>لم أفعلها</small></div><div class="stat o"><b>'+ar(rate)+'٪</b><small>نسبة «لم أفعلها»</small></div></div>'
   +'<div class="kv"><span>متوسط «فعلتها» لكل يوم</span><b>'+ar((D/N).toFixed(1))+'</b></div><div class="kv"><span>أيام سُجّل فيها</span><b>'+ar(act)+' من '+ar(N)+'</b></div>'+(bad?'<div class="kv"><span>أيام بلا «فعلتها» (مع تسجيل)</span><b>'+ar(clean)+'</b></div>':'')
   +bars+timeBox+(tbl?'<h4>كل العادات في هذه الفترة <small>(فعلتها / لم أفعلها)</small></h4>'+tbl:'')+'</div>';
}
function habitReportCard(){
  var T=curTarget();
  return '<section class="card"><h3>تقرير العادات</h3>'+targetChips(false)+habitReportBody(T[0],T[2],T[1])+'</section>';
}

/* بطاقات الكهف والملك وأذكار الصباح والمساء */
