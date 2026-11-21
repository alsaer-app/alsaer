/* ===== التلاوة: تتبّع تلاوة سورة كلمةً كلمة (المرحلة ١) =====
   المحرّك (rcNorm / rcFeed) مستقل عن مصدر الصوت. يستقبل نصًا مُتعرَّفًا عليه ويطابقه مع نص السورة.
   مصدر الصوت يُركَّب لاحقًا عبر window.ReciteASR = { start(onText, onErr), stop() } — انظر docs/RECITE_PLAN.md
   حتى ذلك الحين يعمل «وضع الكتابة» لتجربة التتبّع. */
var rc={sura:0,w:[],st:[],pos:0,on:false,msg:'',busy:false,ok:0,miss:0,hear:''};
function rcNorm(s){
  return String(s||'').replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g,'')
    .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
    .replace(/[^ء-ي ]/g,' ').replace(/\s+/g,' ').trim();
}
function rcLev(a,b){
  var m=a.length,n=b.length,i,j,p=[],c;if(!m)return n;if(!n)return m;
  for(j=0;j<=n;j++)p[j]=j;
  for(i=1;i<=m;i++){var prev=p[0];p[0]=i;for(j=1;j<=n;j++){c=p[j];p[j]=Math.min(p[j]+1,p[j-1]+1,prev+(a.charCodeAt(i-1)===b.charCodeAt(j-1)?0:1));prev=c}}
  return p[n];
}
function rcSim(a,b){if(a===b)return 1;var L=Math.max(a.length,b.length);if(L<=2)return 0;return 1-rcLev(a,b)/L}
function rcPref(){var P=S.rcp;if(!P||typeof P!=='object')P=S.rcp={size:25,hifz:false,hist:[]};if(!P.hist)P.hist=[];return P}
function rcLoad(c){
  var Q=QD(),t=Q.s&&Q.s[c-1];rc.sura=c;rc.w=[];rc.st=[];rc.pos=0;rc.ok=0;rc.miss=0;rc.hear='';
  if(!t)return false;
  t.forEach(function(ay,ai){String(ay).split(/\s+/).forEach(function(w){var n=rcNorm(w);if(n)rc.w.push({t:w,n:n,a:ai+1})})});
  /* نص تنزيل يضع البسملة في أول آية لكل السور؛ هي آية في الفاتحة فقط، فنحذفها من غيرها */
  if(c!==1&&rc.w.slice(0,4).map(function(x){return x.n}).join(' ')==='بسم الله الرحمن الرحيم'&&rc.w.length>4)rc.w.splice(0,4);
  return rc.w.length>0;
}
/* يطابق كلمات مسموعة مع الموضع الحالي: يبحث في نافذة أمامية قصيرة، ويعلّم ما تُخطّي بالأحمر */
function rcFeed(text){
  var hw=rcNorm(text).split(' ').filter(Boolean),changed=false,n=rc.w.length;
  hw.forEach(function(h){
    if(rc.pos>=n)return;
    var best=-1,bs=0,j,lim=Math.min(n-1,rc.pos+7),free=(rc.ok===0&&rc.pos===0);
    if(free){for(j=0;j<n;j++)if(rc.w[j].n===h&&(h.length>=3||j===0)){best=j;break}
      if(best>=0){rc.st[best]=1;rc.ok++;rc.pos=best+1;changed=true}return}
    for(j=rc.pos;j<=lim;j++){
      var s=rcSim(h,rc.w[j].n),need=j===rc.pos?0.7:0.85;
      if(s>=need&&s>bs+0.0001){best=j;bs=s;if(s===1)break}
    }
    if(best<0)return;
    for(j=rc.pos;j<best;j++){rc.st[j]=2;rc.miss++}
    rc.st[best]=1;rc.ok++;rc.pos=best+1;changed=true;
  });
  if(hw.length)rc.hear=text;
  return changed;
}
function rcPaint(){
  var box=document.getElementById('rc-text');if(!box)return;
  var sp=box.querySelectorAll('.rcw'),i,n=rc.w.length,pct=n?rc.pos/n:0;
  for(i=0;i<n;i++){var st=rc.st[i],cls='rcw'+(st===1?' ok':st===2?' miss':'')+(i===rc.pos?' cur':'');if(sp[i]&&sp[i].className!==cls)sp[i].className=cls}
  var q;
  if((q=document.getElementById('rc-ok')))q.textContent=ar(rc.ok);
  if((q=document.getElementById('rc-miss')))q.textContent=ar(rc.miss);
  if((q=document.getElementById('rc-pct')))q.textContent=ar(Math.round(pct*100))+'٪';
  if((q=document.getElementById('rc-ring')))q.style.strokeDashoffset=String(213.6*(1-pct));
  if((q=document.getElementById('rc-hear')))q.textContent=rc.hear||'سيظهر هنا ما نسمعه';
  var cur=sp[Math.min(rc.pos,n-1)];if(cur&&cur.scrollIntoView&&rc.pos>0){try{cur.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}}
  if(rc.pos>=n&&n&&rc.on){
    rcStop();var tot=rc.ok+rc.miss,acc=tot?Math.round(rc.ok/tot*100):100,P=rcPref();
    P.hist.push({s:rc.sura,d:Date.now(),a:acc,m:rc.miss});if(P.hist.length>60)P.hist.shift();save();
    rc.msg='أتممت السورة — دقتك '+ar(acc)+'٪ — تقبّل الله ✓';try{render()}catch(e){}}
}
function rcSay(t,busy){rc.msg=t||'';rc.busy=!!busy;var q=document.getElementById('rc-status');if(q){q.textContent=rc.msg;q.className='rc-status'+(rc.busy?' busy':'')+(rc.msg?'':' empty')}}
function rcStop(){rc.on=false;try{if(window.ReciteASR)window.ReciteASR.stop()}catch(e){}}
function rcStart(){
  if(!rc.w.length&&!rcLoad(rc.sura||1)){rc.msg='تعذّر تحميل نص السورة.';return}
  var A=window.ReciteASR;
  if(!A){rc.msg='التعرّف على الصوت غير متاح في هذه النسخة. جرّب «وضع الكتابة».';return}
  rc.on=true;rc.msg='';rc.busy=false;
  try{A.start(function(t){if(!rc.on)return;if(rcFeed(t))rcPaint();else{rc.hear=t;rcPaint()}},function(e){rc.on=false;rc.busy=false;rc.msg=String(e||'تعذّر تشغيل التعرّف على الصوت.');try{render()}catch(x){}},rcSay)}
  catch(e){rc.on=false;rc.msg='تعذّر تشغيل التعرّف على الصوت.'}
}
function rcAct(a,v){
  if(a==='rcsura'){rcStop();rcLoad(parseInt(v,10)||1);rc.msg=''}
  else if(a==='rcstart'){if(rc.on)rcStop();else rcStart()}
  else if(a==='rcfs'){var P=rcPref();P.size=Math.max(18,Math.min(40,(P.size||25)+(parseInt(v,10)||0)*2));save()}
  else if(a==='rchifz'){var P2=rcPref();P2.hifz=!P2.hifz;save()}
  else if(a==='rcreset'){rcStop();rcLoad(rc.sura||1);rc.msg=''}
  else if(a==='rcsend'){var i=document.getElementById('rc-sim');if(i&&i.value.trim()){if(rcFeed(i.value))rcPaint();else{rc.hear=i.value;rcPaint()}i.value=''}return true}
  return false;
}
document.addEventListener('click',function(e){var w=e.target&&e.target.closest&&e.target.closest('.rc-hifz .rcw');if(w)w.classList.toggle('peek')});
document.addEventListener('change',function(e){var t=e.target;if(t&&t.getAttribute&&t.getAttribute('data-rc')==='sura'){rcStop();rcLoad(parseInt(t.value,10)||1);rc.msg='';try{render()}catch(x){}}});
function vRecite(){
  var Q=QD();
  if(!Q.n||!Q.n.length)return '<section class="card"><p class="note">تعذّر تحميل نص المصحف.</p></section>';
  if(!rc.sura)rcLoad(1);
  var opts=Q.n.map(function(nm,i){return '<option value="'+(i+1)+'"'+(rc.sura===i+1?' selected':'')+'>'+ar(i+1)+' · '+esc(nm)+'</option>'}).join('');
  var n=rc.w.length,pct=n?rc.pos/n:0,A=!!window.ReciteASR,words='',P=rcPref(),last=P.hist[P.hist.length-1];
  rc.w.forEach(function(w,i){
    words+='<span class="rcw'+(rc.st[i]===1?' ok':rc.st[i]===2?' miss':'')+(i===rc.pos?' cur':'')+'">'+esc(w.t)+'</span> ';
    var nx=rc.w[i+1];if(!nx||nx.a!==w.a)words+='<span class="rcn">﴿'+ar(w.a)+'﴾</span> ';
  });
  return '<div class="rc">'
   +'<section class="rc-hero"><div class="rc-ring"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" class="bg"/><circle id="rc-ring" cx="40" cy="40" r="34" class="fg" style="stroke-dasharray:213.6;stroke-dashoffset:'+(213.6*(1-pct))+'"/></svg><b id="rc-pct">'+ar(Math.round(pct*100))+'٪</b></div>'
   +'<div class="rc-hd"><small>سورة</small><h2>'+esc(Q.n[rc.sura-1]||'')+'</h2><div class="rc-chips"><span class="g">صحيح <b id="rc-ok">'+ar(rc.ok)+'</b></span><span class="r">متخطّى <b id="rc-miss">'+ar(rc.miss)+'</b></span><span>'+ar(n)+' كلمة</span></div></div></section>'
   +'<section class="card rc-card"><select class="rm-sel rc-sel" data-rc="sura" aria-label="السورة">'+opts+'</select>'
   +'<div class="rc-tools"><button class="rc-tb" data-a="rcfs" data-v="-1" aria-label="تصغير الخط">أ−</button><button class="rc-tb" data-a="rcfs" data-v="1" aria-label="تكبير الخط">أ+</button><button class="rc-tb'+(P.hifz?' on':'')+'" data-a="rchifz" aria-pressed="'+!!P.hifz+'">'+ic('target')+' وضع الحفظ</button></div>'
   +'<div id="rc-text" class="rc-text'+(P.hifz?' rc-hifz':'')+'" dir="rtl" style="font-size:'+(P.size||25)+'px">'+words+'</div></section>'
   +'<section class="rc-ctl"><button class="rc-mic'+(rc.on?' on':'')+(rc.busy?' busy':'')+'" data-a="rcstart" aria-label="'+(rc.on?'إيقاف':'ابدأ التلاوة')+'">'+ic('mic')+'</button>'
   +'<div class="rc-lbl">'+(rc.on?'جارٍ الاستماع… تلُ بصوتك واضح':'اضغط وابدأ التلاوة')+'</div>'
   +'<div id="rc-status" class="rc-status'+(rc.busy?' busy':'')+(rc.msg?'':' empty')+'">'+esc(rc.msg)+'</div>'
   +'<button class="rc-again" data-a="rcreset">'+ic('refresh')+' من البداية</button>'
   +(last?'<p class="note">جلسات التلاوة: <b>'+ar(P.hist.length)+'</b> · آخرها: '+esc(Q.n[last.s-1]||'')+' بدقة '+ar(last.a)+'٪</p>':'')
   +'<p class="note rc-hear" id="rc-hear">'+(rc.hear?esc(rc.hear):'سيظهر هنا ما نسمعه')+'</p>'
   +(A?'':'<p class="note rc-warn">التعرّف على الصوت غير متاح في هذه النسخة.</p>')
   +'<p class="note rc-warn">أول استخدام يُنزّل نموذج التعرّف (نحو ٨٠ ميجا) من الإنترنت مرة واحدة، ثم يعمل بلا إنترنت. يستغرق التعرّف ثواني بعد كل مقطع.</p></section>'
   +'<section class="card rc-sim-c"><h3>وضع الكتابة</h3><div class="rc-sim"><input id="rc-sim" class="rm-sel" dir="rtl" placeholder="اكتب كلمات من السورة بلا تشكيل…" autocomplete="off"><button class="btn" data-a="rcsend">إرسال</button></div></section></div>';
}
