var BAD_HABITS=[['smoke','التدخين'],['lie','الكذب'],['deceive','الخداع'],['backbite','الغيبة']];
var WORSHIP=[['prayer','الصلاة','mosque'],['fast','الصوم','sun'],['adhkar','الأذكار','beads'],['quran','قراءة القرآن','book'],['wird','الورد اليومي','doc'],['istighfar','الاستغفار','refresh'],['salawat','الصلاة على النبي ﷺ','heart'],['charity','الصدقة','coins'],['lesson','حضور درس علم','star'],['night','قيام الليل','moon'],['help','مساعدة محتاج','leaf'],['visit','زيارة مريض','user']];
function worshipItems(){return WORSHIP.concat((S.customWorship||[]).map(function(x){return [x.id,x.t,'sparkles',true]}))}
function worshipDay(k){return (S.worship||{})[k]||{}}
function worshipPoints(k){var w=worshipDay(k);return worshipItems().reduce(function(n,x){return n+(w[x[0]]===true?1:0)},0)}
function totalWorshipPoints(){return Object.keys(S.worship||{}).reduce(function(n,k){return n+worshipPoints(k)},0)}
var UNDO_MS=15000;
function lockLeft(key){var t=(S.locks||{})[key];if(!t)return 0;if(Date.now()-t<UNDO_MS)return 0;var r=t+864e5-Date.now();return r>0?r:0}
function inGrace(key){var t=(S.locks||{})[key];return !!t&&Date.now()-t<UNDO_MS}
function lockSet(key){S.locks=S.locks||{};S.locks[key]=Date.now()}
function lockBlock(ms){var h=Math.ceil(ms/36e5);toast('سُجّل هذا الإدخال، ويُتاح تعديله بعد '+ar(h)+' ساعة');return true}
function worshipToggle(id,val){var k=dk(),cur=((S.worship||{})[k]||{})[id],lk='w:'+k+':'+id;
  if(cur===val)return;
  if(cur!==undefined&&lockLeft(lk)>0){lockBlock(lockLeft(lk));return}
  if(cur===undefined||inGrace(lk))lockSet(lk);else if(S.locks)delete S.locks[lk];
S.worship=S.worship||{};S.worship[k]=S.worship[k]||{};S.worship[k][id]=val;save();checkNew()}

function hijriNumeric(d){
  try{
    var f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});
    var p=f.formatToParts(d),o={};p.forEach(function(x){if(x.type==='day'||x.type==='month'||x.type==='year')o[x.type]=parseInt(x.value,10)});
    if(o.day&&o.month&&o.year)return o;
  }catch(e){}
  try{
    var f2=new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});
    var p2=f2.formatToParts(d),o2={};p2.forEach(function(x){if(x.type==='day'||x.type==='month'||x.type==='year')o2[x.type]=parseInt(x.value,10)});
    return o2;
  }catch(e){return null}
}
function fastingReasons(d){
  d=d||new Date();var p=(S.fasting&&S.fasting.prefs)||{},out=[],h=hijriNumeric(d),wd=d.getDay();
  if(p.monThu&&(wd===1||wd===4))out.push(wd===1?'صيام الاثنين':'صيام الخميس');
  if(h){
    if(p.whiteDays&&h.day>=13&&h.day<=15)out.push('الأيام البيض ('+h.day+')');
    if(p.ashura&&h.month===1&&(h.day===9||h.day===10))out.push(h.day===9?'تاسوعاء':'عاشوراء');
    if(p.arafa&&h.month===12&&h.day===9)out.push('يوم عرفة');
    if(p.shawwal&&h.month===10&&h.day>=2&&h.day<=7)out.push('ست من شوال');
  }
  if(p.dawud&&S.fasting.dawudAnchor){
    var diff=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-parse(S.fasting.dawudAnchor))/86400000);
    if(diff>=0&&diff%2===0)out.push('صيام يوم وإفطار يوم');
  }
  if((S.fasting.customDates||[]).indexOf(dk(d))>=0)out.push('يوم صيام مخصص');
  return out;
}
function nextFastingDays(limit){
  var out=[],today=new Date();today.setHours(0,0,0,0);
  for(var i=0;i<70&&out.length<limit;i++){var d=new Date(today);d.setDate(d.getDate()+i);var r=fastingReasons(d);if(r.length)out.push({date:dk(d),day:d.toLocaleDateString('ar-EG',{weekday:'long'}),reasons:r})}
  return out;
}
function fastingStatus(k){return (S.fasting.records||{})[k]||''}
