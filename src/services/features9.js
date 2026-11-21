/* ---------- تحدّي ٣٠ يومًا + محاسبة النفس اليومية ---------- */
var CH_PRE=[['صلاة الفجر في وقتها','🌅'],['وردي من القرآن يوميًا','📖'],['أذكار الصباح والمساء','🤲'],['الاستغفار ١٠٠ مرة','🌙'],['قيام الليل ولو ركعتين','⭐'],['صدقة كل يوم ولو يسيرة','💚'],['حفظ اللسان من الغيبة','🤐'],['الصلاة على النبي ﷺ','🕌'],['الورد قبل النوم','😴'],['صيام الاثنين والخميس','🍃']];
var CH_ASK=false,CH_DEL='';
function chList(){if(!Array.isArray(S.chal))S.chal=[];return S.chal}
function chDay(c,i){var d=new Date(c.start+'T00:00:00');d.setDate(d.getDate()+i);return dk(d)}
function chIdx(c){var s=new Date(c.start+'T00:00:00'),n=new Date();n.setHours(0,0,0,0);return Math.round((n-s)/864e5)}
function chStats(c){
  var len=c.len||30,idx=chIdx(c),done=0,i;
  for(i=0;i<len;i++)if(c.done&&c.done[chDay(c,i)])done++;
  var str=0,k=Math.min(idx,len-1);if(k>=0&&!(c.done&&c.done[chDay(c,k)]))k--;
  for(;k>=0&&c.done&&c.done[chDay(c,k)];k--)str++;
  return {len:len,idx:idx,done:done,str:str,today:!!(c.done&&c.done[dk()]),over:idx>=len,wait:idx<0};
}
function chCard(c){
  var st=chStats(c),h='<section class="card ch-c"><div class="ch-h"><span class="ch-i">'+esc(c.i||'🎯')+'</span><div class="ch-t"><b>'+esc(c.n)+'</b><small>'
    +(st.done>=st.len?'🏆 أتممت التحدّي — بارك الله فيك':st.over?'انتهت المدة · أتممت '+ar(st.done)+' من '+ar(st.len):'اليوم '+ar(Math.min(st.idx+1,st.len))+' من '+ar(st.len)+' · سلسلة '+ar(st.str)+' يوم')+'</small></div></div>'
    +'<div class="ch-bar"><i style="width:'+Math.round(st.done/st.len*100)+'%"></i></div><div class="ch-g">';
  for(var i=0;i<st.len;i++){var k=chDay(c,i),on=c.done&&c.done[k],cur=i===st.idx;h+='<span class="ch-d'+(on?' on':'')+(cur?' cur':'')+(i>st.idx?' fut':'')+'">'+(on?'✓':ar(i+1))+'</span>'}
  h+='</div><div class="acts">';
  if(!st.over&&!st.wait)h+='<button class="btn'+(st.today?' ghost':'')+'" data-a="chday" data-v="'+c.id+'">'+(st.today?'↩ تراجع عن اليوم':'✓ أتممت اليوم')+'</button>';
  h+='<button class="btn ghost bad" data-a="chdel" data-v="'+c.id+'">'+(CH_DEL===c.id?'تأكيد الحذف؟':'حذف')+'</button></div></section>';
  return h;
}
function vChal(){
  var L=chList(),h='<div class="ns"><section class="card"><p class="note">اختر عادة طيبة والتزم بها ٣٠ يومًا. أتمم كل يوم بضغطة، وتابع سلسلتك المتواصلة.</p>'
    +'<div class="chips">'+CH_PRE.map(function(p,i){return '<button type="button" class="chip" data-a="chnew" data-v="'+i+'">'+p[1]+' '+p[0]+'</button>'}).join('')+'</div>'
    +'<div class="ff-add" style="margin-top:12px"><input id="ch-name" class="qd-i" type="text" type="text" maxlength="60" placeholder="أو اكتب تحدّيك الخاص"><button class="btn ghost" data-a="chadd">＋ ابدأ</button></div></section>';
  h+=L.length?L.map(chCard).join(''):'<section class="card"><p class="note">لا تحدّيات بعد. ابدأ بأول واحد ممّا فوق.</p></section>';
  return h+'</div>';
}
function chAct(a,v){
  var L=chList(),nm='',ic='🎯';
  if(a==='chnew'){var p=CH_PRE[+v];if(!p)return true;nm=p[0];ic=p[1]}
  if(a==='chadd'){nm=((document.getElementById('ch-name')||{}).value||'').trim().slice(0,60);if(!nm){toast('اكتب اسم التحدّي أولًا');return true}}
  if(a==='chnew'||a==='chadd'){L.push({id:'c'+Date.now().toString(36),n:nm,i:ic,start:dk(),len:30,done:{}});save();toast('بدأ تحدّيك، وفّقك الله');return false}
  var c=L.filter(function(x){return x.id===v})[0];if(!c)return true;
  if(a==='chday'){c.done=c.done||{};var k=dk();if(c.done[k])delete c.done[k];else{c.done[k]=1;var s=chStats(c);toast(s.done>=s.len?'أتممت التحدّي كاملًا 🏆':'أحسنت — سلسلتك '+ar(s.str)+' يوم')}save();return false}
  if(a==='chdel'){if(CH_DEL===c.id){S.chal=L.filter(function(x){return x.id!==v});CH_DEL='';save();return false}CH_DEL=c.id;setTimeout(function(){if(CH_DEL===v){CH_DEL='';if(tab==='chal')render()}},4000);return false}
  return false;
}
/* ---- محاسبة النفس ---- */
var MH_Q=['حافظت على صلواتي في وقتها','قرأت وردي من القرآن','ذكرت الله وقت الصباح والمساء','حفظت لساني وبصري','أحسنت إلى أحد أو تصدّقت','نمت على طهارة وبنيّة صالحة'];
function mhGet(k){if(!S.mh||typeof S.mh!=='object')S.mh={};var o=S.mh[k];if(!o||typeof o!=='object')o=S.mh[k]={q:[],n:'',g:''};if(!Array.isArray(o.q))o.q=[];return o}
function mhScore(o){var n=0;MH_Q.forEach(function(_,i){if(o.q[i])n++});return n}
function mhStreak(){var s=0,d=new Date();while(true){var o=S.mh&&S.mh[dk(d)];if(!o||!mhScore(o)){if(s===0&&dk(d)===dk()){d.setDate(d.getDate()-1);continue}break}s++;d.setDate(d.getDate()-1);if(s>999)break}return s}
function vMuh(){
  var k=dk(),o=mhGet(k),sc=mhScore(o),h='<div class="ns"><section class="card"><h3>محاسبة اليوم</h3><p class="note">«حاسبوا أنفسكم قبل أن تُحاسبوا». ضع علامة على ما فعلته اليوم.</p><div class="mh-q">';
  MH_Q.forEach(function(q,i){h+='<button type="button" class="mh-r'+(o.q[i]?' on':'')+'" data-a="mhq" data-v="'+i+'"><span>'+(o.q[i]?'✓':'')+'</span>'+q+'</button>'});
  h+='</div><div class="mh-sc"><b>'+ar(sc)+'</b> / '+ar(MH_Q.length)+' · سلسلة المحاسبة '+ar(mhStreak())+' يوم</div>'
   +'<label class="bo-f">ما أشكر الله عليه اليوم<textarea id="mh-g" class="qd-i" rows="2" maxlength="240">'+esc(o.g||'')+'</textarea></label>'
   +'<label class="bo-f">ما أُقصّر فيه وأتوب منه (يبقى على جهازك فقط)<textarea id="mh-n" class="qd-i" rows="2" maxlength="240">'+esc(o.n||'')+'</textarea></label>'
   +'<div class="acts"><button class="btn" data-a="mhsave">حفظ</button></div></section>';
  var rows='';for(var i=1;i<=7;i++){var d=new Date();d.setDate(d.getDate()-i);var e=S.mh&&S.mh[dk(d)],s=e?mhScore(e):0;rows+='<div class="mh-h"><span>'+d.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'short'})+'</span><i><u style="width:'+Math.round(s/MH_Q.length*100)+'%"></u></i><b>'+(e?ar(s):'—')+'</b></div>'}
  return h+'<section class="card"><h3>آخر ٧ أيام</h3>'+rows+'</section></div>';
}
function mhAct(a,v){
  var o=mhGet(dk());
  if(a==='mhq'){o.q[+v]=!o.q[+v];for(var i=0;i<MH_Q.length;i++)o.q[i]=!!o.q[i];save();return false}
  if(a==='mhsave'){o.g=((document.getElementById('mh-g')||{}).value||'').slice(0,240);o.n=((document.getElementById('mh-n')||{}).value||'').slice(0,240);save();toast('حُفظت محاسبتك، تقبّل الله');return false}
  return false;
}
/* ---- الأوقات المستحبة والمنهي عنها ---- */
function vSacred(){
  var ok=true,P={};
  try{var td=(typeof locOk==='function'&&locOk())?ptToday():null;['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach(function(k){var t=(S.ptimes&&S.ptimes[k])||(td&&td[k])||'',m=/^(\d{1,2}):(\d{2})$/.exec(t);if(!m){ok=false;return}P[k]=+m[1]*60+ +m[2]})}catch(e){ok=false}
  if(!ok)return '<div class="ns"><section class="card"><p class="note">حدّد مدينتك أولًا من الإعدادات ← الموقع والمواقيت لتظهر الأوقات.</p><div class="acts"><button class="btn" data-a="tab" data-v="prayers">فتح الصلوات</button></div></section></div>';
  var fa=P.fajr,mg=P.maghrib,nextFajr=fa+1440,night=nextFajr-mg,mid=mg+Math.round(night/2),third=mg+Math.round(night*2/3);
  var nowD=new Date(),now=nowD.getHours()*60+nowD.getMinutes();
  var W=[
   ['good','🌙','الثلث الأخير من الليل','وقت النزول الإلهي وأرجى أوقات الدعاء والاستغفار والقيام',third,nextFajr],
   ['good','🌅','بعد الفجر حتى الإشراق','وقت الذكر والجلوس في المصلى',fa,P.sunrise+15],
   ['good','☀️','صلاة الضحى','تُسنّ من ارتفاع الشمس قدر رمح، وأفضلها إذا اشتد الحرّ',P.sunrise+15,P.dhuhr-10],
   ['bad','⛔','النهي بعد الفجر','لا يُتنفّل بغير ذات السبب من الفجر حتى ترتفع الشمس',fa,P.sunrise+15],
   ['bad','⛔','النهي وقت الزوال','قبل الظهر بنحو عشر دقائق',P.dhuhr-10,P.dhuhr],
   ['bad','⛔','النهي بعد العصر','من صلاة العصر حتى غروب الشمس',P.asr,mg],
   ['good','🕌','ما بين المغرب والعشاء','وقت الأوّابين وأذكار المساء',mg,P.isha]
  ];
  function f(m){m=((m%1440)+1440)%1440;var h=Math.floor(m/60),mm=m%60;return hmFmtSafe((h<10?'0':'')+h+':'+(mm<10?'0':'')+mm)}
  function inW(a,b){return (now>=a&&now<b)||(now+1440>=a&&now+1440<b)}
  var cur=W.filter(function(w){return inW(w[4],w[5])}),h='<div class="ns">';
  h+='<section class="card"><h3>الآن</h3>'+(cur.length?cur.map(function(w){return '<div class="sa-now '+w[0]+'">'+w[1]+' '+w[2]+'</div>'}).join(''):'<p class="note">لا وقت مخصوص الآن.</p>')+'<p class="note">منتصف الليل: <b>'+f(mid)+'</b> · بداية الثلث الأخير: <b>'+f(third)+'</b></p></section>';
  h+='<section class="card"><h3>أوقات اليوم</h3>'+W.map(function(w){return '<div class="sa-r '+w[0]+(inW(w[4],w[5])?' now':'')+'"><span class="sa-i">'+w[1]+'</span><div class="sa-t"><b>'+w[2]+'</b><small>'+w[3]+'</small></div><span class="sa-h">'+f(w[4])+' – '+f(w[5])+'</span></div>'}).join('')+'<p class="note">الحسابات تقريبية بحسب موقعك وطريقة الحساب، فاحتط بدقائق.</p></section></div>';
  return h;
}
/* ---------- ملخص الشهر ---------- */
var MS_OFF=0;
function msRange(){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()+MS_OFF);var y=d.getFullYear(),m=d.getMonth(),n=new Date(y,m+1,0).getDate(),isNow=(MS_OFF===0),upto=isNow?new Date().getDate():n;return {y:y,m:m,n:n,upto:upto,name:d.toLocaleDateString('ar-EG',{month:'long',year:'numeric'})}}
function msKey(r,d){return r.y+'-'+String(r.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0')}
function vMonth(){
  var r=msRange(),pr=0,full=0,q=0,qd=0,bp=0,mh=0,mhd=0,best=0,run=0,d,k;
  for(d=1;d<=r.upto;d++){
    k=msKey(r,d);var c=PR.filter(function(p){return S.prayers[k]&&S.prayers[k][p[0]]}).length;pr+=c;if(c===5)full++;
    var qq=(S.quran.log&&S.quran.log[k])||0;q+=qq;if(qq>0)qd++;
    (S.books||[]).forEach(function(b){bp+=(b.log&&b.log[k])||0});
    var o=S.mh&&S.mh[k];if(o&&mhScore(o)){mh+=mhScore(o);mhd++}
    if(c>=5){run++;best=Math.max(best,run)}else run=0;
  }
  var chd=0;(S.chal||[]).forEach(function(c){for(var i=1;i<=r.upto;i++)if(c.done&&c.done[msKey(r,i)])chd++});
  var tiles=[['🕌','الصلوات',ar(pr)+' / '+ar(r.upto*5),Math.round(pr/(r.upto*5)*100)],['✅','أيام كاملة الصلوات',ar(full)+' يوم · أطول سلسلة '+ar(best),Math.round(full/r.upto*100)],['📖','صفحات القرآن',ar(q)+' صفحة · '+ar(qd)+' يوم',Math.min(100,Math.round(qd/r.upto*100))],['📚','صفحات الكتب',ar(bp)+' صفحة',0],['🎯','أيام التحدّيات',ar(chd)+' يوم',0],['🌙','أيام المحاسبة',ar(mhd)+' يوم',Math.round(mhd/r.upto*100)]];
  var h='<div class="ns"><section class="card ms-nav"><button class="btn ghost" data-a="msoff" data-v="-1">‹ السابق</button><b>'+r.name+'</b><button class="btn ghost" data-a="msoff" data-v="1"'+(MS_OFF>=0?' disabled':'')+'>التالي ›</button></section><div class="ms-g">';
  tiles.forEach(function(t){h+='<div class="ms-t"><span class="ms-i">'+t[0]+'</span><b>'+t[1]+'</b><small>'+t[2]+'</small>'+(t[3]?'<i class="ms-b"><u style="width:'+t[3]+'%"></u></i>':'')+'</div>'});
  return h+'</div><section class="card"><p class="note">'+(pr?'بارك الله في جهدك. المهم الاستمرار ولو قلّ.':'لا بيانات لهذا الشهر بعد.')+'</p><div class="acts"><button class="btn" data-a="msshare">نسخ الملخص للمشاركة</button></div></section></div>';
}
function msAct(a,v){
  if(a==='msoff'){MS_OFF=Math.min(0,MS_OFF+(+v));return false}
  if(a==='msshare'){
    var r=msRange(),t='ملخصي في '+r.name+' — السائر إلى الله\n',tmp=document.createElement('div');tmp.innerHTML=document.querySelector('.ms-g').innerHTML.replace(/<\/?(small|b)>/g,' ');
    document.querySelectorAll('.ms-t').forEach(function(e){t+='• '+e.querySelector('b').textContent+': '+e.querySelector('small').textContent+'\n'});
    try{navigator.clipboard.writeText(t);toast('نُسخ الملخص')}catch(e){toast('تعذّر النسخ')}
    return true;
  }
  return false;
}

