var currentHadithIndex=0,currentHadith=null,hadithRequest=0;

var DAILY_SPIRITUAL_CONTENT=[
{kind:'نصيحة اليوم',icon:'✦',t:'ابدأ يومك بنية صالحة، واجعل لك عملًا خفيًا بينك وبين الله، ولو كان قليلًا.',s:'تذكير إيماني'},
{kind:'نصيحة اليوم',icon:'✦',t:'إن قصّرت، تُب إلى الله وابدأ من جديد.',s:'تذكير إيماني'},
{kind:'الاستغفار',icon:'أستغفر الله',t:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',s:'ذكر واستغفار'},
{kind:'الاستغفار',icon:'أستغفر الله',t:'أستغفر الله وأتوب إليه.',s:'صحيح البخاري'},
{kind:'الصلاة على النبي ﷺ',icon:'ﷺ',t:'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.',s:'أكثر من الصلاة والسلام على رسول الله ﷺ اليوم'},
{kind:'الصلاة على النبي ﷺ',icon:'ﷺ',t:'قال رسول الله ﷺ: «مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا».',s:'صحيح مسلم'},
{kind:'تذكير القرآن',icon:'۞',t:'اقرأ اليوم ولو آيات قليلة من القرآن.',s:'تذكير للورد اليومي'},
{kind:'قراءة سورة الملك',icon:'الملك',t:'لا تنسَ قراءة سورة الملك الليلة؛ اجعلها وردًا ثابتًا قبل النوم.',s:'تذكير بقراءة سورة الملك'},
{kind:'الصلاة',icon:'الصلاة',t:'حافظ على صلاتك في وقتها.',s:'تذكير بالمحافظة على الصلاة'},
{kind:'الصيام',icon:'🌙',t:'هل نويت صيام الاثنين أو الخميس؟',s:'تذكير بصيام التطوع'},
{kind:'الصدقة',icon:'♡',t:'تصدّق ولو بكلمة طيبة أو ابتسامة.',s:'تذكير بالصدقة والإحسان'},
{kind:'أذكار اليوم',icon:'تسبيح',t:'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر.',s:'ذكر مطلق'},
{kind:'الدعاء',icon:'🤲',t:'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.',s:'أبو داود والنسائي'},
{kind:'قيام الليل',icon:'☾',t:'إن استطعت فلا تحرم نفسك ركعتين في جوف الليل؛ ولو خفيفتين.',s:'تذكير بقيام الليل'},
{kind:'صلة الرحم',icon:'♡',t:'صِل رحمك، واسأل عن أهلك اليوم.',s:'تذكير بصلة الرحم'}
];
var dailyCardContent=null,dailyShift=0;
var DAILY_API_QUERIES=['الاستغفار','الصلاة على النبي','الصيام','الصلاة','القرآن','الصبر','الصدقة','الدعاء','قيام الليل','بر الوالدين','الرحمة','الأذكار','الذكر','التوبة','الشكر'];
var DAILY_VERSES=[[33,56],[2,152],[13,28],[94,5],[94,6],[65,3],[39,53],[2,186],[3,139],[20,14],[29,45],[2,45],[57,4],[2,255],[64,16],[3,159],[93,3],[2,153],[40,60],[73,20],[33,41]];
var DAILY_HADITH=[
{t:'الدِّينُ النَّصِيحَةُ.',s:'صحيح مسلم · رقم 55',grade:'صحيح',link:'https://sunnah.com/muslim:55'},
{t:'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',s:'صحيح مسلم · رقم 2699',grade:'صحيح',link:'https://sunnah.com/muslim:2699'},
{t:'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.',s:'صحيح البخاري · رقم 6406',grade:'صحيح',link:'https://sunnah.com/bukhari:6406'},
{t:'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ.',s:'صحيح البخاري · رقم 6464',grade:'صحيح',link:'https://sunnah.com/bukhari:6464'},
{t:'الطُّهُورُ شَطْرُ الْإِيمَانِ.',s:'صحيح مسلم · رقم 223',grade:'صحيح',link:'https://sunnah.com/muslim:223'},
{t:'مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.',s:'صحيح البخاري · رقم 6405',grade:'صحيح',link:'https://sunnah.com/bukhari:6405'},
{t:'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ.',s:'صحيح البخاري · رقم 71',grade:'صحيح',link:'https://sunnah.com/bukhari:71'},
{t:'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ.',s:'سنن الترمذي · رقم 1956',grade:'صحيح',link:'https://sunnah.com/tirmidhi:1956'},
{kind:'الصلاة على النبي ﷺ',t:'مَنْ صَلَّى عَلَيَّ صَلَاةً وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا.',s:'صحيح مسلم · رقم 408',grade:'صحيح',link:'https://sunnah.com/muslim:408'},
{kind:'الصلاة على النبي ﷺ',t:'أَوْلَى النَّاسِ بِي يَوْمَ الْقِيَامَةِ أَكْثَرُهُمْ عَلَيَّ صَلَاةً.',s:'سنن الترمذي · رقم 484',grade:'حسن',link:'https://sunnah.com/tirmidhi:484'},
{kind:'الصلاة على النبي ﷺ',t:'إِذَا سَمِعْتُمُ الْمُؤَذِّنَ فَقُولُوا مِثْلَ مَا يَقُولُ، ثُمَّ صَلُّوا عَلَيَّ.',s:'صحيح مسلم · رقم 384',grade:'صحيح',link:'https://sunnah.com/muslim:384'},
{kind:'الصلاة على النبي ﷺ',t:'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ.\nلا تجعل يومك يمضي بلا صلاة عليه.',s:'ذكر مأثور في الصلاة على النبي ﷺ'},
{kind:'الصلاة على النبي ﷺ',t:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ.',s:'الصلاة الإبراهيمية · صحيح البخاري رقم 3370',grade:'صحيح',link:'https://sunnah.com/bukhari:3370'}
];
var DAILY_PACK_KEY='alsaer_daily_pack_v1';
function dailyPack(){try{var p=JSON.parse(localStorage.getItem(DAILY_PACK_KEY)||'null');return(p&&Array.isArray(p.items))?p:{at:0,items:[]}}catch(e){return{at:0,items:[]}}}
function dailySrcLink(s){
  var m=String(s||'').match(/(البخاري|مسلم|الترمذي)[^\d]*(\d+)/);
  if(!m)return '';return 'https://sunnah.com/'+({'البخاري':'bukhari','مسلم':'muslim','الترمذي':'tirmidhi'})[m[1]]+':'+m[2];
}
function dailyGeneralPool(){
  var pool=DAILY_SPIRITUAL_CONTENT.slice();
  DUAS.forEach(function(x){pool.push({kind:'دعاء اليوم',icon:'🤲',t:x.t,s:x.s})});
  MOTIV.forEach(function(x){pool.push({kind:'حديث نبوي',icon:'۞',t:x.t,s:x.s,grade:x.grade||'صحيح',link:dailySrcLink(x.s)})});
  DAILY_HADITH.forEach(function(x){pool.push({kind:x.kind||'حديث نبوي',icon:'۞',t:x.t,s:x.s,grade:x.grade,link:x.link})});
  try{var Q=QD();DAILY_VERSES.forEach(function(r){var tx=Q.s[r[0]-1]&&Q.s[r[0]-1][r[1]-1];if(tx)pool.push({kind:'آية',icon:'۞',t:'﴿'+tx+'﴾',s:'سورة '+Q.n[r[0]-1]+' · آية '+ar(r[1]),link:'https://quran.com/ar/'+r[0]+'/'+r[1]})})}catch(e){}
  dailyPack().items.forEach(function(x){if(x&&x.t)pool.push(x)});
  return pool;
}
/* تذكيرات مرتبطة بوقت اليوم والجمعة والصيام وورد القرآن؛ تظهر أولًا بحسب الأولوية */
function dailySpecial(now){
  var out=[],wd=now.getDay(),hr=now.getHours();
  if(hr>=20||hr<3)out.push({kind:'قراءة سورة الملك',icon:'الملك',t:'اقرأ سورة الملك قبل النوم.\nكَانَ النَّبِيُّ ﷺ لَا يَنَامُ حَتَّى يَقْرَأَ «الم تَنزِيلُ» وَ«تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ».',s:'رواه الترمذي',grade:'صححه الألباني',link:'https://quran.com/67'});
  if(wd===5||(wd===4&&hr>=17))out.push({kind:'سورة الكهف · يوم الجمعة',icon:'الكهف',t:'لا تنسَ قراءة سورة الكهف يوم الجمعة.\n«مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ».',s:'رواه الحاكم والبيهقي',grade:'صححه الألباني',link:'https://quran.com/18'});
  if(wd===5)out.push({kind:'الصلاة على النبي ﷺ',icon:'ﷺ',t:'أكثر من الصلاة على النبي ﷺ يوم الجمعة.\n«مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا».',s:'صحيح مسلم · رقم 408',link:'https://sunnah.com/muslim:408'});
  try{
    var rs=fastingReasons(now),tm=new Date(now);tm.setDate(tm.getDate()+1);var rt=fastingReasons(tm);
    if(rs.length&&hr<17){var r0=rs[0],x={kind:'تذكير الصيام',icon:'🌙',t:'اليوم: '+r0+'. هل نويت الصيام؟',s:'تذكير بصيام التطوع'};
      if(/الاثنين|الخميس/.test(r0)){x.t+='\n«تُعْرَضُ الْأَعْمَالُ يَوْمَ الِاثْنَيْنِ وَالْخَمِيسِ، فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ».';x.s='رواه الترمذي';x.grade='صححه الألباني'}
      else if(/البيض/.test(r0)){x.t+='\nمن وصية النبي ﷺ لأبي ذر بصيام ثلاثة أيام من كل شهر: الثالث عشر والرابع عشر والخامس عشر.';x.s='رواه الترمذي والنسائي';x.grade='حسّنه الألباني'}
      out.push(x)}
    else if(rt.length&&hr>=17)out.push({kind:'تذكير الصيام',icon:'🌙',t:'غدًا: '+rt[0]+'. جدّد النية من الليل لصيام الغد.',s:'تذكير بصيام التطوع'});
  }catch(e){}
  try{var k=dk(),got=qPages(k),goal=S.quran.goal;if(got<goal&&hr>=10)out.push({kind:'ورد القرآن',icon:'۞',t:'ورد اليوم: '+ar(got)+' من '+ar(goal)+' صفحة. اقرأ ما تيسّر ولو قليلًا.',s:'تذكير بالورد اليومي'})}catch(e){}
  if(hr>=4&&hr<10)out.push({kind:'أذكار الصباح',icon:'☀',t:'لا تنسَ أذكار الصباح.',s:'من تبويب الأذكار'});
  if(hr>=15&&hr<19)out.push({kind:'أذكار المساء',icon:'☾',t:'لا تنسَ أذكار المساء.',s:'من تبويب الأذكار'});
  return out;
}
/* يتغير محتوى البطاقة في كل مرة يُفتح فيها التطبيق (وعند العودة إليه من الخلفية)، ويثبت أثناء الجلسة؛ مع تجنّب تكرار آخر ١٥ محتوى */
function dailyPick(){
  var now=new Date(),sp=[],pool=dailyGeneralPool(),recent=[];
  try{sp=dailySpecial(now)}catch(e){}
  try{recent=JSON.parse(localStorage.getItem('alsaer_daily_recent_v2')||'[]');if(!Array.isArray(recent))recent=[]}catch(e){recent=[]}
  var list=[];
  sp.forEach(function(x){list.push(x,x,x)}); /* التذكيرات المرتبطة بالوقت أكثر حظًا في الظهور دون أن تحتكر البطاقة */
  pool.forEach(function(x){list.push(x)});
  var fresh=list.filter(function(x){return recent.indexOf(x.t)<0});
  if(!fresh.length)fresh=list;
  dailyCardContent=fresh[Math.floor(Math.random()*fresh.length)]||DAILY_SPIRITUAL_CONTENT[0];
  try{recent.unshift(dailyCardContent.t);localStorage.setItem('alsaer_daily_recent_v2',JSON.stringify(recent.slice(0,15)))}catch(e){}
  return dailyCardContent;
}
function chooseDailyCardContent(){return dailyCardContent||dailyPick()}
/* تحميل حزمة محتوى في الخلفية (مرة كل يوم تقريبًا) دون أي تأثير على العرض */
var dailyPackBusy=false;
function dailyApiItems(json){
  var out=[];if(!json||typeof json!=='object')return out;
  function add(list,kind,source){
    if(!Array.isArray(list))return;
    list.forEach(function(x){
      var t=(typeof x==='string')?x:cleanHadithText(x&&(x.text||x.arabic||x.ar||x.content||x.hadith||x.verse||x.text_ar||x.matn||x.excerpt||x.snippet||''));
      t=cleanHadithText(t);if(!t||t.length<12)return;
      if(t.length>(kind==='حديث نبوي'?135:110))return;
      var s=x.source||x.bookTitle||x.book||x.collection||x.reference||source||'البيان',lk=x.link||x.url||x.href||'';
      out.push({kind:kind,icon:'۞',t:t,s:String(s),grade:x.grade||x.gradeText||'',link:/^https:\/\//i.test(lk)?lk:''});
    });
  }
  [json,json.data].forEach(function(j){if(j&&typeof j==='object'){add(j.hadith,'حديث نبوي','البيان');add(j.verses,'آية وتفسيرها','القرآن الكريم · البيان')}});
  return out;
}
function dailyFetch(q){
  var ctl=(typeof AbortController==='function')?new AbortController():null,to=ctl?setTimeout(function(){ctl.abort()},9000):null;
  return fetch('https://bayan.alwa7i.com/api/search?q='+encodeURIComponent(q),{headers:{'Accept':'application/json'},signal:ctl?ctl.signal:undefined})
    .then(function(r){if(to)clearTimeout(to);if(!r.ok)throw new Error('API');return r.json()})
    .catch(function(){if(to)clearTimeout(to);return null});
}
function refreshDailyCardFromApi(){
  var pk=dailyPack();
  if(dailyPackBusy||typeof fetch!=='function'||(Date.now()-pk.at<20*3600*1000&&pk.items.length>=30))return Promise.resolve(false);
  if(typeof navigator!=='undefined'&&navigator.onLine===false)return Promise.resolve(false);
  dailyPackBusy=true;
  var qs=DAILY_API_QUERIES.slice().sort(function(){return Math.random()-.5}).slice(0,5),items=pk.items.slice(),seen={};
  items.forEach(function(x){seen[x.t]=1});
  return qs.reduce(function(p,q){return p.then(function(){return dailyFetch(q).then(function(j){dailyApiItems(j).forEach(function(x){if(!seen[x.t]){seen[x.t]=1;items.push(x)}})})})},Promise.resolve())
    .then(function(){
      if(items.length>pk.items.length||!pk.at){try{localStorage.setItem(DAILY_PACK_KEY,JSON.stringify({at:Date.now(),items:items.slice(-200)}))}catch(e){}}
      dailyPackBusy=false;return true;
    }).catch(function(){dailyPackBusy=false;return false});
}
function dailyPlain(t){return String(t||'').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[«»﴿﴾]/g,'').replace(/\s+/g,' ').trim()}
/* رابط عربي للمصدر: القرآن بالواجهة العربية، والأحاديث والأدعية عبر الدرر السنية (موسوعة عربية) */
function dailyArLink(q){
  var l=q.link||'';
  if(/^https:\/\/quran\.com\/(\d)/.test(l))return l.replace('https://quran.com/','https://quran.com/ar/');
  if(/^https:\/\/quran\.com\/ar\//.test(l)||/^https:\/\/[^/]*alwa7i/.test(l)||/^https:\/\/dorar\.net\//.test(l))return l;
  if(/(حديث|دعاء|الصلاة على النبي)/.test(q.kind||'')||/صحيح|رواه|حسن/.test(q.s||'')){
    var w=dailyPlain(q.t).split(' ').slice(0,9).join(' ');
    if(w)return 'https://dorar.net/hadith/search?q='+encodeURIComponent(w);
  }
  return '';
}
function dailyCardMarkup(){
  var q=dailyCardContent||dailyPick();
  var source=q.s?'<small class="new-day-source">'+esc(q.s)+(q.grade?' · '+esc(q.grade):'')+'</small>':'';
  var ul=dailyArLink(q),link=ul?'<a class="new-day-source new-day-link" href="'+esc(ul)+'" target="_blank" rel="noopener noreferrer">عرض المصدر</a>':'';
  return '<section class="banner new-day-card">'+forestDeco()+'<div class="new-day-kicker">✦ '+esc(q.kind||'بداية اليوم')+' ✦</div><h3>كل يوم بداية جديدة</h3><p class="new-day-hadith">'+esc((q.grade||!isFem())?q.t:femStr(q.t)).replace(/\n/g,'<br>')+'</p>'+source+link+'</section>';
}

function hadithOfflinePool(){
  var pool=MOTIV.slice();
  try{var saved=JSON.parse(localStorage.getItem('alsaer_hadith_cache')||'[]');if(Array.isArray(saved))pool=pool.concat(saved.filter(function(x){return x&&x.t&&x.s}))}catch(e){}
  var seen={},unique=[];
  pool.forEach(function(x){var k=String(x.t||'').trim();if(k&&!seen[k]){seen[k]=1;unique.push(x)}});
  return unique;
}

setTimeout(function(){try{refreshDailyCardFromApi()}catch(e){}},4000);
