var SUR_EN=['Al-Fatihah','Al-Baqarah','Al Imran','An-Nisa','Al-Ma\'idah','Al-An\'am','Al-A\'raf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Ra\'d','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha','Al-Anbiya','Al-Hajj','Al-Mu\'minun','An-Nur','Al-Furqan','Ash-Shu\'ara','An-Naml','Al-Qasas','Al-\'Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqi\'ah','Al-Hadid','Al-Mujadilah','Al-Hashr','Al-Mumtahanah','As-Saff','Al-Jumu\'ah','Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Ma\'arij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Nazi\'at','\'Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-A\'la','Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-\'Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-\'Adiyat','Al-Qari\'ah','At-Takathur','Al-\'Asr','Al-Humazah','Al-Fil','Quraysh','Al-Ma\'un','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'];
var ENP=[
[/^(\d+) من (\d+)$/,'$1 of $2'],[/^(\d+) \/ (\d+) صفحة$/,'$1 / $2 pages'],[/^(\d+) ملتزم · (\d+) تعثر$/,'$1 on track · $2 slipped'],
[/^الهدف القادم: (\d+) (?:أيام|يوماً) · (.+)$/,function(m,n,r){return 'Next goal: '+n+' days · '+(EN[r]||r)}],
[/^إنجاز جديد: (.+?)(?: \(\+(\d+)\))?$/,function(m,t,n){return 'New achievement: '+(EN[t]||t)+(n?' (+'+n+')':'')}],
[/^سورة (.+)$/,function(m,n){var i=QD().n.indexOf(n);return i>=0?'Surah '+SUR_EN[i]:null}],
[/^ص (\d+)$/,'p. $1'],[/^الجزء (\d+) · حزب (\d+)$/,'Juz $1 · Hizb $2'],
[/^من صفحة (\d+) إلى (\d+) · (?:سورة )?(.+)$/,function(m,a,b,n){var i=QD().n.indexOf(n);return 'From page '+a+' to '+b+' · '+(i>=0?'Surah '+SUR_EN[i]:n)}],
[/^(\d+) \/ (\d+) صفحة$/,'$1 / $2 pages'],[/^قرأت اليوم (\d+) من (\d+) صفحات?\.$/,'You read $1 of $2 pages today.'],
[/^وردك اليوم (\d+) (?:صفحات|صفحة)، وقرأت (\d+)\. هل تقرأ الآن؟$/,'Your portion today is $1 pages, and you read $2. Read now?'],
[/^لم تسجّل صلاة (.+) بعد\. إن صلّيتها فسجّلها الآن\.$/,function(m,p){return 'You have not logged '+(EN[p]||p)+' yet. If you prayed it, log it now.'}],
[/^(\d+) صفحة مقروءة(?: · (\d+) ختمة مكتملة)?$/,function(m,a,b){return a+(a==='1'?' page':' pages')+' read'+(b?' · '+b+' khatm completed':'')}],
[/^(\d+) صفحة$/,'$1 pages'],[/^سلسلة (\d+) (?:أيام|يوماً)$/,'$1-day streak'],[/^(\d+) (?:أيام|يوماً)$/,'$1 days'],[/^(\d+) متتالية$/,'$1 in a row'],
[/^منها (\d+) في أيام انتكاسة$/,'$1 on relapse days'],[/^أتممت وردك اليوم، بارك الله فيك \((\d+) صفحة\)\.$/,'You completed your portion today, may Allah bless you ($1 pages).'],
[/^تم تسجيل (\d+) صفحة$/,'$1 pages recorded'],[/^محاولات كثيرة؛ حاول بعد (\d+) ثانية$/,'Too many attempts; try again in $1 seconds'],
[/^(.+) (\d{4})$/,function(m,mo,y){return EN[mo]?EN[mo]+' '+y:null}],
[/^(.+) · اليوم$/,function(m,d){return EN[d]?EN[d]+' · Today':null}],
[/^قرأت اليوم (\d+) صفحة\.?$/,'You read $1 pages today.'],[/^(\d+)٪$/,'$1%']
];

var HJ_EN={'محرم':'Muharram','صفر':'Safar','ربيع الأول':'Rabi al-Awwal','ربيع الآخر':'Rabi al-Thani','جمادى الأولى':'Jumada al-Ula','جمادى الآخرة':'Jumada al-Thani','رجب':'Rajab','شعبان':'Shaban','رمضان':'Ramadan','شوال':'Shawwal','ذو القعدة':'Dhul Qadah','ذو الحجة':'Dhul Hijjah'};
function _tm(s){return s.replace(/(\d+):(\d+)\s*ص/g,'$1:$2 AM').replace(/(\d+):(\d+)\s*م/g,'$1:$2 PM')}
function _en(s){return EN[s]!==undefined?EN[s]:s}
var ENP2=[
[/^(\d+:\d+) ([صم])$/,function(m,t,a){return t+(a==='ص'?' AM':' PM')}],
[/^(\d+) (\S+(?: \S+)?) (\d{4}) هـ$/,function(m,d,mo,y){return HJ_EN[mo]?d+' '+HJ_EN[mo]+' '+y+' AH':null}],
[/^(\d+) (يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر) (\d{4})$/,function(m,d,mo,y){return _en(mo)+' '+d+', '+y}],
[/^صباح الخير يا (.+)$/,'Good morning, $1'],[/^العمر · (\d+) سنة$/,'Age · $1 years'],
[/^✦ الصلاة على النبي ﷺ ✦$/,'✦ Salawat upon the Prophet ﷺ ✦'],
[/^(سنن الترمذي|صحيح البخاري|صحيح مسلم|سنن أبي داود|سنن ابن ماجه|سنن النسائي|مسند أحمد|رياض الصالحين) · رقم (\d+)(?: · (.+))?$/,function(m,b,n,g){var B={'سنن الترمذي':'Sunan al-Tirmidhi','صحيح البخاري':'Sahih al-Bukhari','صحيح مسلم':'Sahih Muslim','سنن أبي داود':'Sunan Abi Dawud','سنن ابن ماجه':'Sunan Ibn Majah','سنن النسائي':'Sunan al-Nasa\'i','مسند أحمد':'Musnad Ahmad','رياض الصالحين':'Riyad as-Salihin'},G={'حسن':'Hasan','صحيح':'Sahih','ضعيف':'Daif'};return B[b]+' · No. '+n+(g?' · '+(G[g]||g):'')}],
[/^ذكر هذا الوقت · (.+)$/,function(m,r){return 'Dhikr for this time · '+_tm(r).replace(/—/,'–')}],
[/^(\d+) نقطة عبادات$/,'$1 worship points'],[/^اجمع (\d+) نقطة من عباداتك اليومية$/,'Earn $1 points from your daily worship'],
[/^سلسلة (\d+) (?:أيام|يوماً|يوما) متتالية$/,'$1-day streak'],
[/^من (\d+) نقطة$/,'out of $1 points'],[/^(\d+) من (\d+) عبادة تم تسجيلها اليوم$/,'$1 of $2 acts of worship logged today'],
[/^صيام الاثنين · الأيام البيض \((\d+)\)$/,'Monday fast · White day ($1)'],[/^الأيام البيض \((\d+)\)$/,'White day ($1)'],
[/^تُضاء (.+?) بعد المغرب$/,function(m,d){return 'Lit '+_en(d)+' after Maghrib'}],
[/^تُضاء من العشاء (.+)$/,function(m,t){return 'Lit from Isha '+_tm(t)}],
[/^من الفجر (.+)$/,function(m,t){return 'From Fajr '+_tm(t)}],[/^من العصر (.+)$/,function(m,t){return 'From Asr '+_tm(t)}],
[/^باقي على (?:أذان|صلاة) (.+)$/,function(m,p){var P={'الفجر':'Fajr','الظهر':'Dhuhr','العصر':'Asr','المغرب':'Maghrib','العشاء':'Isha'};return 'Until '+(P[p]||p)+' prayer'}],
[/^محدَّث (.+?) · يتجدد تلقائيًا إذا انتقلت$/,'Updated $1 · refreshes automatically if you move'],
[/^(.+) · تُحدَّث كل يوم وتُستخدم في تذكيرات الصلاة$/,'$1 · updated daily and used for prayer reminders'],
[/^اتجاه القبلة: (\d+)°$/,'Qibla direction: $1°'],
[/^تنتهي ختمتك بإذن الله في (.+)$/,function(m,d){var r=trS(d);return 'Your khatmah ends, God willing, on '+(r||d)}],
[/^متبقٍ (\d+) صفحة · نحو (\d+) يومًا بوردك الحالي \((\d+) (?:صفحات|صفحة) يوميًا\)$/,'$1 pages left · about $2 days at your current portion ($3 pages daily)'],
[/^مطوّر تطبيق السائر إلى الله · Developer of Al-Sa'ir ila Allah$/,"Developer of Al-Sa'ir ila Allah"]
];
ENP=ENP.concat(ENP2);
ENP=ENP.concat([
[/^(اليوم|غدًا|غدا) (\d+:\d+(?: [صم]| [AP]M)?)$/,function(m,d,t){return (d==='اليوم'?'Today ':'Tomorrow ')+_tm(t)}],
[/^حان وقتها · حتى (.+?) (\d+:\d+(?: [AP]M| [صم])?)$/,function(m,p,t){return 'Its time has come · until '+(EN[p]||p)+' '+_tm(t)}],
[/^حان وقت صلاة (.+)$/,function(m,p){var P={'الفجر':'Fajr','الظهر':'Dhuhr','العصر':'Asr','المغرب':'Maghrib','العشاء':'Isha'};return 'Time for '+(P[p]||p)+' prayer'}],
[/^≈ (\d+) إشعارًا في اليوم$/,'≈ $1 notifications per day'],[/^من (\d+)$/,'of $1'],
[/^الإصدار (?:الحالي )?([\d.]+) · (?:بناء )?(\d+)$/,'Version $1 · build $2'],
[/^✦ الصيام ✦$/,'✦ Fasting ✦'],[/^تذكير بصيام التطوع$/,'Voluntary fasting reminder'],[/^الضحى والظهر$/,'Duha and Dhuhr'],
[/^الصلاة · (\d+) من ٥( ✓)?$/,'Prayer · $1 of 5$2'],[/^العادات · (\d+) من (\d+)( ✓)?$/,'Habits · $1 of $2$3'],
[/^القرآن · (.+)$/,function(m,x){return 'Quran · '+(EN[x]||x)}],
[/^(\d+) صفحات? من (\d+)$/,'$1 of $2 pages'],
[/^(اليوم|أمس) · (.+)$/,function(m,d,w){return (EN[d]||d)+' · '+(EN[w]||w)}],
[/^(\d+) (?:تذكير مؤجّل|تذكيرات مؤجّلة)$/,function(m,n){return n+(n==='1'?' snoozed reminder':' snoozed reminders')}]
]);


function activeDict(){return I18N_PACKS[lang()]||EN}
function patLang(r){return r}
/* قوالب الجمل الديناميكية: (نمط عربي) -> قالب إنجليزي؛ يُترجم القالب لكل لغة عبر المفتاح '§'+القالب، وتُترجم المجموعات العربية منفردةً */
var TPL=[
[/^(\d+) من (\d+)$/,'$1 of $2'],[/^(\d+) \/ (\d+) صفحة$/,'$1 / $2 pages'],[/^(\d+) ملتزم · (\d+) تعثر$/,'$1 on track · $2 slipped'],
[/^الهدف القادم: (\d+) (?:أيام|يوماً) · (.+)$/,'Next goal: $1 days · $2'],
[/^إنجاز جديد: (.+?) \(\+(\d+)\)$/,'New achievement: $1 (+$2)'],[/^إنجاز جديد: (.+)$/,'New achievement: $1'],
[/^سورة (.+) · آية (\d+)$/,'Surah $1 · verse $2'],[/^سورة (.+)$/,'Surah $1'],[/^ص (\d+)$/,'p. $1'],[/^الجزء (\d+) · حزب (\d+)$/,'Juz $1 · Hizb $2'],
[/^من صفحة (\d+) إلى (\d+) · (?:سورة )?(.+)$/,'From page $1 to $2 · Surah $3'],
[/^قرأت اليوم (\d+) من (\d+) صفحات?\.$/,'You read $1 of $2 pages today.'],[/^قرأت اليوم (\d+) صفحة\.?$/,'You read $1 pages today.'],
[/^وردك اليوم (\d+) (?:صفحات|صفحة)، وقرأت (\d+)\. هل تقرأ الآن؟$/,'Your portion today is $1 pages, and you read $2. Read now?'],
[/^لم تسجّل صلاة (.+) بعد\. إن صلّيتها فسجّلها الآن\.$/,'You have not logged $1 yet. If you prayed it, log it now.'],
[/^(\d+) صفحة مقروءة · (\d+) ختمة مكتملة$/,'$1 pages read · $2 khatm completed'],[/^(\d+) صفحة مقروءة$/,'$1 pages read'],
[/^(\d+) صفحة$/,'$1 pages'],[/^سلسلة (\d+) (?:أيام|يوماً|يوما)(?: متتالية)?$/,'$1-day streak'],[/^(\d+) (?:أيام|يوماً)$/,'$1 days'],[/^(\d+) متتالية$/,'$1 in a row'],
[/^منها (\d+) في أيام انتكاسة$/,'$1 on relapse days'],
[/^أتممت وردك اليوم، بارك الله فيك \((\d+) صفحة\)\.$/,'You completed your portion today, may Allah bless you ($1 pages).'],
[/^تم تسجيل (\d+) صفحة$/,'$1 pages recorded'],[/^محاولات كثيرة؛ حاول بعد (\d+) ثانية$/,'Too many attempts; try again in $1 seconds'],
[/^(\d+) (يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر) (\d{4})$/,'$2 $1, $3'],
[/^(\d+) (\S+(?: \S+)?) (\d{4}) هـ$/,'$1 $2 $3 AH'],
[/^(.+) (\d{4})$/,'$1 $2'],[/^(.+) · اليوم$/,'$1 · Today'],
[/^صباح الخير يا (.+)$/,'Good morning, $1'],[/^مساء الخير يا (.+)$/,'Good evening, $1'],[/^العمر · (\d+) سنة$/,'Age · $1 years'],
[/^(\d+) نقطة عبادات$/,'$1 worship points'],[/^اجمع (\d+) نقطة من عباداتك اليومية$/,'Earn $1 points from your daily worship'],
[/^من (\d+) نقطة$/,'out of $1 points'],[/^(\d+) من (\d+) عبادة تم تسجيلها اليوم$/,'$1 of $2 acts of worship logged today'],
[/^صيام الاثنين · الأيام البيض \((\d+)\)$/,'Monday fast · White day ($1)'],[/^الأيام البيض \((\d+)\)$/,'White day ($1)'],
[/^تُضاء (.+?) بعد المغرب$/,'Lit $1 after Maghrib'],[/^تُضاء من العشاء (.+)$/,'Lit from Isha $1'],
[/^من الفجر (.+)$/,'From Fajr $1'],[/^من العصر (.+)$/,'From Asr $1'],
[/^باقي على (?:أذان|صلاة) (.+)$/,'Until $1 prayer'],[/^حان وقت صلاة (.+)$/,'Time for $1 prayer'],
[/^حان وقتها · حتى (.+?) (\d+:\d+(?: [AP]M)?)$/,'Its time has come · until $1 $2'],
[/^ذكر هذا الوقت · (.+)$/,'Dhikr for this time · $1'],
[/^محدَّث (.+?) · يتجدد تلقائيًا إذا انتقلت$/,'Updated $1 · refreshes automatically if you move'],
[/^(.+) · تُحدَّث كل يوم وتُستخدم في تذكيرات الصلاة$/,'$1 · updated daily and used for prayer reminders'],
[/^اتجاه القبلة: (\d+)°$/,'Qibla direction: $1°'],[/^تنتهي ختمتك بإذن الله في (.+)$/,'Your khatmah ends, God willing, on $1'],
[/^متبقٍ (\d+) صفحة · نحو (\d+) يومًا بوردك الحالي \((\d+) (?:صفحات|صفحة) يوميًا\)$/,'$1 pages left · about $2 days at your current portion ($3 pages daily)'],
[/^اليوم (\d+:\d+(?: [AP]M)?)$/,'Today $1'],[/^غد[اً]ً? (\d+:\d+(?: [AP]M)?)$/,'Tomorrow $1'],
[/^(الأحد|الاثنين|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت) (\d+:\d+(?: [AP]M)?)$/,'$1 $2'],
[/^≈ (\d+) إشعارًا في اليوم$/,'≈ $1 notifications per day'],[/^الإصدار (?:الحالي )?([\d.]+) · (?:بناء )?(\d+)$/,'Version $1 · build $2'],
[/^ذكّرك: (.+)$/,'Reminded you: $1'],[/^بقي (\d+) دقيقة على صلاة (.+)$/,'$1 minutes left before prayer of $2'],
[/^بقي عليك (\d+) صفحات لإتمام وردك اليوم\.$/,'You have $1 pages left to complete today\'s portion.'],
[/^هذا الأسبوع: (\d+) صلاة من [٣3][٥5]، و(\d+) صفحة قرآن، و(\d+) عادة حسنة\. اضغط للمقارنة بالأسبوع الماضي\.$/,'This week: $1 prayers of 35, and $2 Quran pages, and $3 good habits. Tap to compare with last week.'],
[/^· (\d+) مرات? كل (\d+) دقيقة$/,'· $1 times every $2 minutes'],[/^\+(\d+) نقطة$/,'+$1 points']
];
function tplApply(d){
  var l=lang(),D=(l==='en'||l==='ar')?null:I18N_PACKS[l];
  for(var i=0;i<TPL.length;i++){
    var m=d.match(TPL[i][0]);if(!m)continue;
    var T=TPL[i][1],ok=true;
    if(D&&D['§'+T]!==undefined)T=D['§'+T];
    var r=T.replace(/\$(\d)/g,function(g,n){var v=m[+n];if(v===undefined)return '';if(_AR.test(v)){var tv=trS(v);if(tv===null){ok=false;return v}return tv}return v});
    if(ok)return r;
  }
  return null;
}
function trS(s){
  var greet=/^(صباح الخير|مساء الخير) يا (.+)$/.exec(s.trim());
  if(greet){var gd=activeDict(),gk=greet[1]==='صباح الخير'?'Good morning, $1':'Good evening, $1';return (gd['§'+gk]||gk).replace('$1',greet[2])}
  var t=s.replace(/\s+/g,' ').trim();if(!t)return null;
  var D=activeDict();if(D[t]!==undefined)return D[t];if(EN[t]!==undefined)return EN[t];
  var d=t.replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632});
  if(d!==t&&EN[d]!==undefined)return EN[d];
  var si=QD().n.indexOf(t);if(si>=0){var l0=lang();return (l0==='fa'||l0==='ur')?null:SUR_EN[si]}
  var rt=tplApply(d);if(rt!==null)return rt;
  for(var i=0;i<ENP.length;i++){var m=d.match(ENP[i][0]);if(m){var r=typeof ENP[i][1]==='function'?ENP[i][1].apply(null,m):d.replace(ENP[i][0],ENP[i][1]);if(r)return patLang(r)}}
  return trFrag(d);
}

/* ترجمة الأجزاء: إذا لم يُطابَق النص كاملًا تُستبدل العبارات المعروفة داخله (الأطول أولًا) */
var _frIdx={},_frC={};
var _AR=/[\u0600-\u06FF]/;
function _frBuild(l){
  var D=I18N_PACKS[l]||EN,idx={};
  var all={};Object.keys(EN).forEach(function(k){all[k]=EN[k]});Object.keys(D).forEach(function(k){all[k]=D[k]});
  Object.keys(all).forEach(function(k){if(k.length<2||!_AR.test(k)||/[\u064B-\u0652]/.test(k)&&k.length>12)return;var v=all[k];if(typeof v!=='string')return;var c=k.charAt(0);(idx[c]=idx[c]||[]).push([k,v])});
  Object.keys(idx).forEach(function(c){idx[c].sort(function(a,b){return b[0].length-a[0].length})});
  return idx;
}
function trFrag(t){
  var l=lang();if(l==='ar'||!_AR.test(t))return null;
  var ck=l+'|'+t;if(_frC[ck]!==undefined)return _frC[ck];
  var idx=_frIdx[l]||(_frIdx[l]=_frBuild(l)),out='',i=0,n=0,L=t.length;
  while(i<L){
    var c=t.charAt(i),L2=idx[c],hit=null;
    if(L2&&(i===0||!_AR.test(t.charAt(i-1)))){
      for(var j=0;j<L2.length;j++){var k=L2[j][0];if(t.substr(i,k.length)===k){var nx=t.charAt(i+k.length);if(!_AR.test(k.charAt(k.length-1))||!nx||!_AR.test(nx)){hit=L2[j];break}}}
    }
    if(hit){out+=hit[1];i+=hit[0].length;n++}else{out+=c;i++}
  }
  var r=(n&&!_AR.test(out.replace(/[\u0660-\u0669\u061B\u060C\u061F]/g,'')))?out:null;if(Object.keys(_frC).length>4000)_frC={};_frC[ck]=r;return r;
}
function trWalk(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode())){var p=n.parentNode;if(p&&p.closest&&p.closest('.mp,.keepar,.qv,.mushaf,.ml,.ar,.dhikr,.hadith-text,.new-day-hadith,.tsb-ar,textarea,input,script,style'))continue;list.push(n)}
  list.forEach(function(n){
    var v=n.nodeValue,lead=v.match(/^\s*/)[0],trail=v.match(/\s*$/)[0],r=trS(v);
    if(r!==null)n.nodeValue=lead+r+trail;
    else if(/^[\s٠-٩\d%·\/:.-]+$/.test(v))n.nodeValue=v.replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632});
  });
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(function(e){['placeholder','aria-label','title'].forEach(function(a){var v=e.getAttribute(a);if(v){var r=trS(v);if(r!==null)e.setAttribute(a,r)}})});
}

/* ===== محرك اللغات الهجين: اكتشاف لغة الهاتف → حزمة محلية → الإنجليزية مؤقتًا (دون إنترنت) ===== */
var I18N_RTL=['ar','ur','fa','he','ps','sd','ug','ckb','dv','yi'];
var _dl=null,_lcKey=null,_lcVal='ar';
function devCodes(){
  var out=[];
  try{if(window.__devLang)out.push(String(window.__devLang))}catch(e){}
  try{var L=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||navigator.userLanguage];for(var i=0;i<L.length;i++)if(L[i])out.push(String(L[i]))}catch(e){}
  return out.map(function(x){var c=x.toLowerCase().replace('_','-').split('-')[0];return ({'iw':'he','in':'id','nb':'no','nn':'no','jw':'jv'})[c]||c}).filter(function(c,i,a){return c&&a.indexOf(c)===i});
}
function langAvail(c){return c==='ar'||!!I18N_PACKS[c]}
function langLogMissing(list){
  try{var k='alsaer_missing_langs',o=JSON.parse(localStorage.getItem(k)||'{}'),ch=false;
    list.forEach(function(c){if(!o[c]){o[c]={first:Date.now(),n:0};ch=true}o[c].n++;o[c].last=Date.now()});
    localStorage.setItem(k,JSON.stringify(o))}catch(e){}
}
/* المرحلة 1: العربية افتراضية دائمًا؛ English/Français فقط باختيار صريح من الإعدادات (لا اكتشاف تلقائي للغة الهاتف) */
var LANG_CHOICES=['ar','en','fr'];
function langResolve(){var p=(typeof U==='function'&&U().lang)||'ar';return (LANG_CHOICES.indexOf(p)>=0&&langAvail(p))?p:'ar'}
function lang(){return langResolve()}
function langDir(){return I18N_RTL.indexOf(lang())>=0?'rtl':'ltr'}
function langRefresh(){_lcKey=null;var old=_lcVal;if(lang()!==old&&(U().lang||'auto')==='auto'){try{applyUI();render()}catch(e){}}}
try{window.addEventListener('languagechange',langRefresh);document.addEventListener('visibilitychange',function(){if(!document.hidden)langRefresh()})}catch(e){}
try{var _cd=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Device;if(_cd&&_cd.getLanguageCode)_cd.getLanguageCode().then(function(r){if(r&&r.value){window.__devLang=r.value;langRefresh()}}).catch(function(){})}catch(e){}
/* ALSAER i18n+: مراقبة الشجرة — أي نص يُضاف لاحقًا (بانرات، أوراق، رسائل حالة) يُترجم فورًا غير العربية */
(function(){
  if(!window.MutationObserver)return;
  var t=null;
  var mo=new MutationObserver(function(){
    if(lang()==='ar')return;
    if(t)return;
    t=setTimeout(function(){t=null;try{
      trWalk(document.body);
    }catch(e){}},60);
  });
  mo.observe(document.body,{childList:true,subtree:true,characterData:true});
})();

/* المرحلة 1: قوالب إضافية (تواريخ بالأيام، أرقام الأحاديث، قائمة السور بأسماء مختلفة الإملاء) */
var _DAYS='الأحد|الاثنين|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت',_MONS='يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر';
TPL.push(
 [new RegExp('^('+_DAYS+')، (\\d+) ('+_MONS+') · (\\d+)/(\\d+)/(\\d+)هـ$'),'$1, $3 $2 · $4/$5/$6 AH'],
 [new RegExp('^('+_DAYS+')، (\\d+) ('+_MONS+')$'),'$1, $3 $2'],
 [/^(\d+) د$/,'$1 min'],
 [/^(.+) · حديث رقم (\d+)$/,'$1 · Hadith no. $2'],
 [/^لك (\d+) يومين راحة في الشهر: لا تقطع السلسلة إذا فاتك يوم لعذر\. المتبقّي هذا الشهر:$/,'You have $1 rest days a month: your streak does not break if you miss a day with a valid excuse. Left this month:'],
 [/^المتاح الآن: (\d+) نصًّا بين مضمّن ومجلوب من الإنترنت، ويعمل بلا اتصال بعد الجلب\.$/,'Available now: $1 texts, some built in and some fetched from the internet, working offline after fetching.']
);
var _sNorm=function(x){return x.replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/\s+/g,'')};
var _sMap=null;
function sIdx(name){
  var n=QD().n;if(!n||!n.length)return -1;
  if(!_sMap||_sMap.len!==n.length){_sMap={len:n.length,m:{}};n.forEach(function(x,i){_sMap.m[_sNorm(x)]=i})}
  var v=_sMap.m[_sNorm(name)];return v===undefined?-1:v;
}
ENP.push([/^(\d+) · (.+)$/,function(m,n,name){var i=sIdx(name);return i>=0&&+n===i+1?n+' · '+SUR_EN[i]:null}]);
try{if(/alsaertest/.test(location.search))window.__I18N={trS:function(s,l){var o=U().lang;U().lang=l;_lcKey=null;try{return trS(s)}finally{U().lang=o}},packs:I18N_PACKS,tabs:function(){return Object.keys(TITLES)},go:function(t,c,sub,o){tab=t;if(t==='settings'){setCat=c||'';setSub=sub||'';setOpen=o||null}render()},setLang:function(l){U().lang=l;_lcKey=null;applyUI();render()}}}catch(e){}
