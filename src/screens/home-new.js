/* ===== المظهر الجديد ===== */
var WK_TIPS=['ابدأ يومك بأذكار الصباح، فهي حصنك حتى المساء.','صلاة الفجر في وقتها أول مفاتيح بركة اليوم.','ورد قليل دائم خير من كثير منقطع.','اجعل لك خبيئة من عمل صالح لا يعلمها إلا الله.','لا تؤخّر صلاتك عن أول وقتها ما استطعت.','سورة الكهف في يوم الجمعة نور بين الجمعتين.'];
function wkNext(){
  var now=new Date(),cur=now.getHours()*3600+now.getMinutes()*60+now.getSeconds(),ids=PR.map(function(x){return x[0]}),best=null,prev=null;
  for(var i=0;i<ids.length;i++){var t=pMin(ids[i])*60;if(t>cur){best={id:ids[i],at:t};prev=i>0?pMin(ids[i-1])*60:pMin('isha')*60-86400;break}}
  if(!best){best={id:'fajr',at:pMin('fajr')*60+86400};prev=pMin('isha')*60}
  var nm=PR.filter(function(x){return x[0]===best.id})[0][1],left=best.at-cur,span=Math.max(1,best.at-prev);
  return {name:nm,left:left,frac:Math.max(0,Math.min(1,1-left/span))};
}
function wkFmt(sec){var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=sec%60,p=function(n){return (n<10?'0':'')+n};return digitsConv((h?h+':':'')+p(m)+':'+p(x),U().digits==='west') /* بنمط أرقام المستخدم من المصدر — وإلا تصارع المحوّل التلقائي كل ثانية (وميض) */}
function wkCdUpdate(){var e=document.getElementById('wk-cd');if(!e)return;var n=wkNext();e.textContent=wkFmt(n.left);var f=document.getElementById('wk-fill');if(f)f.style.width=Math.round(n.frac*100)+'%';var l=document.getElementById('wk-cdl');if(l)l.textContent='باقي على صلاة '+n.name}
setInterval(function(){try{if(!document.hidden)wkCdUpdate()}catch(e){}},1000);

var SURAS=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
var WK_DEF={quran:['quran','kahf','mulk'],adhkar:['adhkar','morning','evening','tasbih','afterprayer'],ibadat:['prayers','fasting','habits','reminders']};
var WK_SECN={quran:['القرآن الكريم','book'],adhkar:['الأذكار والتسبيح','sparkles'],ibadat:['عباداتي وتذكيراتي','mosque']};
var WK_BN=[['time','ذكر هذا الوقت'],['daily','كل يوم بداية جديدة'],['worship','عباداتي اليوم']];
var WK_PER=[{n:'صباح',f:'03:00',t:'10:00',g:['morning']},{n:'الضحى والظهر',f:'10:00',t:'16:00',g:['quran','kahf']},{n:'العصر والمغرب',f:'16:00',t:'19:00',g:['evening']},{n:'بعد المغرب',f:'19:00',t:'22:00',g:['afterprayer','mulk']},{n:'قبل النوم',f:'22:00',t:'03:00',g:['sleep','tasbih']}];
function wkS(){var w=S.wk=S.wk||{};w.ord=w.ord||{};w.hid=w.hid||{};w.pin=w.pin||{};w.cus=w.cus||{quran:[],adhkar:[]};w.bn=w.bn||['time','daily','worship'];w.bnh=w.bnh||{};w.per=w.per||JSON.parse(JSON.stringify(WK_PER));return w}
function wkItem(id){
  var k=dk(),g=glowState(),G=ADHKAR.filter(function(x){return x.id===id})[0],m;
  if(id==='quran')return {l:'القرآن الكريم',i:'book-open',a:'tab',v:'quran',sub:Math.min(qPages(k),99)+' / '+S.quran.goal+' صفحة'};
  if(id==='kahf')return {l:'سورة الكهف',i:'book',a:'qsura',v:'18',sub:g.kahf.done?'✓ تمت':(g.kahf.on?'الآن':'الجمعة'),st:g.kahf};
  if(id==='mulk')return {l:'سورة الملك',i:'moon',a:'qsura',v:'67',sub:g.mulk.done?'✓ تمت':(g.mulk.on?'الآن':'كل ليلة'),st:g.mulk};
  if(m=/^sura_(\d+)$/.exec(id))return {l:'سورة '+SURAS[m[1]-1],i:'book',a:'qsura',v:m[1],sub:'قراءة حرّة'};
  if(id==='adhkar')return {l:'الأذكار والتسبيح',i:'beads',a:'tab',v:'adhkar',sub:'الأذكار كلها'};
  if(id==='tasbih')return {l:'المسبحة',i:'beads',a:'tab',v:'tasbih',sub:'عدّاد حر'};
  if(id==='morning')return {l:'أذكار الصباح',i:'sun',a:'adkopen',v:'morning',sub:g.morning.done?'✓ تمت':(g.morning.on?'حان وقتها':pLab('fajr')),st:g.morning};
  if(id==='evening')return {l:'أذكار المساء',i:'moon',a:'adkopen',v:'evening',sub:g.evening.done?'✓ تمت':(g.evening.on?'حان وقتها':pLab('asr')),st:g.evening};
  if(G)return {l:'أذكار '+G.title.replace(/^أذكار\s*/,''),i:id==='sleep'?'moon':'beads',a:'adkopen',v:id,sub:'اضغط للبدء'};
  var pr=PR.filter(function(x){return x[0]===0});
  if(id==='prayers')return {l:'الصلوات',i:'mosque',a:'tab',v:'prayers',sub:PR.filter(function(p){return S.prayers[k]&&S.prayers[k][p[0]]}).length+' من 5'};
  if(id==='fasting')return {l:'الصيام',i:'moon',a:'tab',v:'fasting',sub:'الجدول'};
  if(id==='habits')return {l:'العادات',i:'target',a:'tab',v:'habits',sub:allHabits().filter(function(h){return ((S.habits||{})[k]||{})[h[0]]}).length+' من '+allHabits().length};
  if(id==='reminders')return {l:'التذكيرات',i:'bell',a:'tab',v:'reminders',sub:'التنبيهات'};
  return null;
}
function wkIds(sec){
  var w=wkS(),base=(w.ord[sec]||WK_DEF[sec]).slice();
  (w.cus[sec]||[]).forEach(function(x){if(base.indexOf(x)<0)base.push(x)});
  var pin=base.filter(function(x){return w.pin[x]}),rest=base.filter(function(x){return !w.pin[x]});
  return pin.concat(rest).filter(function(x){return wkItem(x)});
}


/* بانر «ذكر هذا الوقت» */
function wkPeriod(){
  var now=new Date(),m=now.getHours()*60+now.getMinutes(),P=wkS().per,hm=function(x){var a=(x||'0:0').split(':');return (+a[0])*60+(+a[1])};
  for(var i=0;i<P.length;i++){var f=hm(P[i].f),t=hm(P[i].t);if(f<=t?(m>=f&&m<t):(m>=f||m<t))return P[i]}
  return P[0];
}
function wkBanner(id){
  if(id==='daily')return hidH('daily')?'':dailyCardMarkup();
  if(id==='worship')return hidH('worship')?'':worshipHomeCard();
  var P=wkPeriod(),chips=(P.g||[]).map(function(x){var it=wkItem(x);return it?'<button class="wk-chip" data-a="'+it.a+'" data-v="'+it.v+'">'+ic(it.i)+it.l+'</button>':''}).join('');
  return '<section class="wk-bn"><div class="wk-bn-h"><span class="wk-bn-ic">'+ic('clock')+'</span><div><small>ذكر هذا الوقت · '+ptFmt(P.f)+' — '+ptFmt(P.t)+'</small><h3>'+esc(P.n)+'</h3></div></div>'+nxRow()+'<div class="wk-chips">'+chips+'</div><div class="wk-bn-cd"><span id="wk-cdl">باقي على صلاة '+wkNext().name+'</span><b id="wk-cd">'+wkFmt(wkNext().left)+'</b></div></section>';
}
function homeTimeBanner(){return '<div class="wk-tb">'+wkBanner('time')+'</div>'}

