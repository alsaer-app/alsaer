/* ===== جولة تفاعلية: تظلّل عناصر التطبيق الحقيقية وتنتقل بين شاشاته ===== */
var TOUR=[
 {e:'🌙',t:'أهلًا بك في السائر إلى الله',d:'رفيقك اليومي: مواقيت وأذكار وورد ومتابعة، مجانًا بالكامل. جولة قصيرة تعرّفك بكل شيء في أقل من دقيقة.'},
 {tab:'home',sel:'.profile-hero',t:'بطاقتك',d:'تحيّة اليوم وتاريخه. وللترتيب: اضغط مطوّلًا على أي بطاقة في الرئيسية فتهتز الأيقونات كما في الآيفون، اسحبها لتغيير مكانها أو اضغط (−) لإخفائها.'},
 {tab:'home',sel:'.dprog',t:'تقدّم يومك',d:'يتحرك الشريط كلما أنجزت عبادة اليوم.'},
 {tab:'home',sel:'.tabbar',t:'التنقل',d:'الرئيسية، التقويم، التقدّم، ثم «المزيد» وفيه كل الأقسام. وزر «+» فوق الشريط يفتح مهام سريعة.'},
 {tab:'more',sel:'#mr-q',t:'كل شيء في «المزيد»',d:'ابحث هنا عن أي قسم بالاسم: كتابي، التحدّي، المحاسبة وغيرها.'},
 {tab:'hisn',sel:'.asm-grid',t:'الأذكار · حصن المسلم',d:'اختر الصباح أو المساء أو بعد الصلاة أو النوم، واضغط على كل ذكر ليُنقص عدّاده.'},
 {tab:'msb',sel:'#hsn-ring',t:'المسبحة',d:'المس الدائرة للعدّ. يمكنك إضافة ذكر خاص بك وإيقاف صوت النقر.'},
 {tab:'settings',sel:'.sc-grid',t:'الإعدادات',d:'مقسّمة بوضوح: الشكل، التنبيهات، الموقع، الأمان، البيانات. ابدأ بالتنبيهات لتصلك مواقيت الصلاة.'},
 {e:'✨',t:'أنت جاهز',d:'بارك الله فيك. تستطيع إعادة هذه الجولة من الإعدادات ← المساعدة والمعلومات.'}
];
var tourOn=false,tourAutoDone=false;
function tourClose(){var o=document.getElementById('tour');if(o)o.remove();tourOn=false}
function tourFinish(){tourClose();S.tour=1;save();tab='home';render();try{window.scrollTo(0,0)}catch(e){}}
function tourShow(i){
  tourClose();tourOn=true;
  if(i>=TOUR.length){tourFinish();return}
  var st=TOUR[i];
  if(st.tab&&tab!==st.tab){tab=st.tab;if(tab==='settings')setCat='';setOpen=null;if(tab==='hisn')hsnS.cat=null;render();try{window.scrollTo(0,0)}catch(e){}}
  setTimeout(function(){
    if(!tourOn)return;
    var el=st.sel?document.querySelector(st.sel):null;
    if(el){try{el.scrollIntoView({block:'center'})}catch(e){}}
    setTimeout(function(){
      if(!tourOn)return;
      var d=document.createElement('div');d.id='tour';d.className='tour2';
      var card='<div class="tour2-c" id="tour-c">'+(st.e?'<div class="tour2-e">'+st.e+'</div>':'')+'<h3>'+st.t+'</h3><p>'+st.d+'</p><div class="tour2-n">'+ar(i+1)+' / '+ar(TOUR.length)+'</div><div class="acts">'
        +(i>0?'<button class="btn ghost" data-a="tournext" data-v="'+(i-1)+'">السابق</button>':'')
        +'<button class="btn" data-a="tournext" data-v="'+(i+1)+'">'+(i===TOUR.length-1?'ابدأ':'التالي')+'</button>'
        +(i<TOUR.length-1?'<button class="btn ghost" data-a="tourskip">تخطّي</button>':'')+'</div></div>';
      d.innerHTML=(el?'<div class="tour2-hole" id="tour-h"></div>':'')+card;
      document.body.appendChild(d);
      if(el){
        var r=el.getBoundingClientRect(),pad=6,h=document.getElementById('tour-h'),c=document.getElementById('tour-c'),vh=window.innerHeight;
        h.style.cssText='top:'+(r.top-pad)+'px;left:'+(r.left-pad)+'px;width:'+(r.width+pad*2)+'px;height:'+(r.height+pad*2)+'px';
        var ch=c.offsetHeight,below=r.bottom+pad+12,top=(r.top+r.height/2<vh/2)?below:r.top-pad-12-ch;
        if(top+ch>vh-8)top=Math.max(8,r.top-pad-12-ch);
        if(top<8)top=Math.min(vh-ch-8,below);
        c.style.top=Math.max(8,top)+'px';
      }else d.classList.add('mid');
    },el?180:0);
  },60);
}
function tourAct(a,v){
  if(a==='tournext'){tourShow(+v);return true}
  if(a==='tourskip'){tourFinish();return true}
  if(a==='tourreplay'){tab='home';setOpen=null;render();tourShow(0);return true}
  return true;
}
/* تبدأ تلقائيًا مرة واحدة بعد ملف التعريف وإغلاق نافذة «ما الجديد» */
function tourAuto(){
  if(tourOn||S.tour||tourAutoDone||!S.onboarded||!unlocked||tab!=='home')return;
  if(/alsaertest/.test(location.search)&&!/tour/.test(location.search))return;
  if(document.getElementById('update109-notice'))return;
  tourAutoDone=true;setTimeout(function(){if(!S.tour&&tab==='home')tourShow(0)},700);
}
