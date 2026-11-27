/* ===== سجل النشاط اليومي — بطاقات الأيام: الصلوات والقرآن والصيام والعادات (أوقات التسجيل منذ 2.0.0) ===== */
var JN_F='all',JN_MAX=400;
var JN_DAYS=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
function jnDate(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function jnDayHead(k){var d=jnDate(k),L=typeof lang==='function'?lang():'ar',t=dk(),td=jnDate(t),diff=Math.round((td-d)/864e5);
  var wd=L==='ar'?JN_DAYS[d.getDay()]:(function(){try{return d.toLocaleDateString(L==='fr'?'fr-FR':'en-GB',{weekday:'long'})}catch(e){return ''}})();
  var dm;try{dm=d.toLocaleDateString(L==='ar'?'ar-EG':(L==='fr'?'fr-FR':'en-GB'),{day:'numeric',month:'long'})}catch(e){dm=k}
  var b=diff===0?'اليوم · '+wd:(diff===1?'أمس · '+wd:wd);
  return '<div class="day-h"><b>'+esc(b)+'</b><small class="muted">'+esc(dm)+'</small></div>'}
function jnTm(k,id){var t=(S.mtimes||{})[k];if(!t||!t[id])return '';var d=new Date(t[id]);if(isNaN(d))return '';
  return '<small class="jn-t">'+esc(hmFmt(d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes()))+'</small>'}
function jnKeys(){var s={};Object.keys(S.prayers||{}).forEach(function(k){s[k]=1});Object.keys((S.quran&&S.quran.log)||{}).forEach(function(k){if((S.quran.log[k]||0)>0)s[k]=1});Object.keys((S.fasting&&S.fasting.records)||{}).forEach(function(k){s[k]=1});Object.keys(S.habits||{}).forEach(function(k){if(Object.keys(S.habits[k]||{}).length)s[k]=1});
  return Object.keys(s).sort().reverse().slice(0,JN_MAX)}
function jnDay(k){
  var rows='';
  if(JN_F==='all'||JN_F==='prayers'){var pr=(S.prayers||{})[k]||{};var pd=PR.filter(function(q){return pr[q[0]]}).length;
    if(pd)rows+='<div class="jrow"><div class="ji">'+ic('sun')+'</div><div class="jt"><b>الصلاة · '+ar(pd)+' من ٥'+(pd===5?' ✓':'')+'</b><div class="pchips">'+PR.map(function(q){return '<span class="chip'+(pr[q[0]]?' ok':'')+'">'+q[1]+(pr[q[0]]?' ✓'+jnTm(k,'p:'+q[0]):'')+'</span>'}).join('')+'</div></div></div>'}
  if(JN_F==='all'||JN_F==='quran'){var qp=qPages(k);if(qp>0){var goal=S.quran.goal||2,pct=Math.min(100,Math.round(qp/goal*100));
    rows+='<div class="jrow"><div class="ji">'+ic('book')+'</div><div class="jt"><b>القرآن · '+(qp>=goal?'وردك اكتمل ✓':ar(qp)+' من '+ar(goal))+'</b><small class="muted">'+ar(qp)+' '+(qp===1?'صفحة':'صفحات')+' من '+ar(goal)+jnTm(k,'q')+'</small><div class="prog"><i style="width:'+pct+'%"></i></div></div></div>'}}
  if(JN_F==='all'||JN_F==='fasting'){var fr=S.fasting&&S.fasting.records&&S.fasting.records[k];
    if(fr==='done')rows+='<div class="jrow"><div class="ji">'+ic('moon')+'</div><div class="jt"><b>الصيام</b><small class="muted">صمت هذا اليوم ✓'+jnTm(k,'fast')+'</small></div></div>';
    else if(fr==='missed')rows+='<div class="jrow"><div class="ji">'+ic('moon')+'</div><div class="jt"><b>الصيام</b><small class="muted">لم يُسجَّل صيام</small></div></div>'}
  if(JN_F==='all'||JN_F==='habits'){var hb=(S.habits||{})[k]||{};var ah=allHabits(),done=ah.filter(function(x){return hb[x[0]]});
    if(done.length)rows+='<div class="jrow"><div class="ji">'+ic('check')+'</div><div class="jt"><b>العادات · '+ar(done.length)+' من '+ar(ah.length)+(done.length===ah.length?' ✓':'')+'</b><small class="muted">'+done.map(function(x){return esc(x[1])+' ✓'+jnTm(k,'h:'+x[0])}).join(' · ')+'</small><div class="prog"><i style="width:'+Math.round(done.length/Math.max(1,ah.length)*100)+'%"></i></div></div></div>'}
  if(!rows)return '';
  return '<section class="card jn-day">'+jnDayHead(k)+rows+'</section>';
}
function vJournal(){
  var days=jnKeys().map(jnDay).join('');
  var chips=[['all','الكل'],['prayers','الصلاة'],['quran','القرآن'],['fasting','الصيام'],['habits','العادات']].map(function(c){return '<button class="chip'+(JN_F===c[0]?' on':'')+'" data-a="jnfilter" data-v="'+c[0]+'">'+c[1]+'</button>'}).join('');
  return '<div class="jn-fchips chips">'+chips+'</div>'
    +(days||'<section class="card"><p class="note" style="text-align:center;margin:6px 0">لا يوجد نشاط مسجّل بعد.<br>سجّل صلواتك وقراءتك وصيامك وعاداتك لتظهر هنا باليوم والساعة.</p></section>')
    +'<p class="muted jn-note">يسجَّل تلقائيًا مما تعلّمه في التطبيق · الأوقات تُعرض منذ إصدار ٢٫٠٫٠ · بياناتك على جهازك فقط</p>';
}
