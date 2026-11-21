var hadithLoading=false,hadithNonce=0,hadithLoadedSession=false;

function cleanHadithText(v){
  if(typeof v==='string')return v.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
  if(v&&typeof v==='object')return cleanHadithText(v.arabic||v.ar||v.text||v.content||'');
  return '';
}
function validHadithText(v){var t=cleanHadithText(v);return t.length>=24&&/[ء-ي]/.test(t)&&!/^([.،؛:…\-\s])+$/u.test(t)}
function localHadithForToday(){
  var pool=[
    {text:'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.',bookTitle:'صحيح البخاري',number:'1',grade:'صحيح'},
    {text:'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.',bookTitle:'صحيح البخاري',number:'6018',grade:'صحيح'},
    {text:'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',bookTitle:'صحيح البخاري',number:'13',grade:'صحيح'},
    {text:'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ.',bookTitle:'صحيح البخاري',number:'2989',grade:'صحيح'},
    {text:'مَنْ لَا يَرْحَمُ لَا يُرْحَمُ.',bookTitle:'صحيح البخاري',number:'5997',grade:'صحيح'}
  ];
  var d=new Date(),n=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(d.getFullYear(),0,0))/86400000);
  var h=pool[n%pool.length];return {date:dk(),text:h.text,bookTitle:h.bookTitle,number:h.number,grade:h.grade,link:h.link,source:'مصدر موثق'};
}

function ensureDailyHadith(force){
  return Promise.resolve(false);
  var key='alsaer_hadith_daily_v1',cached=null;
  try{cached=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
  if(!force&&cached&&cached.date===dk()&&validHadithText(cached.text)){paintHadith(cached);return}
  var data=localHadithForToday();
  try{localStorage.setItem(key,JSON.stringify(data))}catch(e){}
  paintHadith(data);
}
function renderFirstUpdateNotice(){
  var key='alsaer_seen_update_1016',old=document.getElementById('update109-notice');
  var seen=false;try{seen=localStorage.getItem(key)==='1'}catch(e){seen=false}
  if(!unlocked||!S.onboarded||seen){if(old)old.remove();return}
  if(old)return;
  var wrap=document.createElement('div');wrap.id='update109-notice';wrap.className='update109-backdrop';
  wrap.innerHTML='<section class="update109-card" role="dialog" aria-modal="true" aria-labelledby="update109-title"><h2 id="update109-title">ما الجديد في السائر إلى الله؟</h2><div class="ver">الإصدار '+APP_VERSION+' · جديد</div><ul><li>جولة تفاعلية تعرّفك بالتطبيق (وتُعاد من الإعدادات ← المساعدة).</li><li>«المسبحة» صفحة مستقلة: ذكر مخصّص وصوت نقر.</li><li>الأذكار تفتح من «حصن المسلم»، وزر «تخصيص الرئيسية» في أعلى الصفحة.</li><li>إعدادات أبسط: خمسة أقسام وخيارات متقدمة مطويّة.</li><li>شاشة التسميع تظهر كاملة مع الإحصائيات.</li></ul><p class="free-note">تطبيق السائر إلى الله مجاني بالكامل</p><button class="btn" data-a="update109Done">متابعة إلى التطبيق</button></section>';
  document.body.appendChild(wrap);
}
