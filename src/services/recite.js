/* ===== التلاوة: تتبّع تلاوة سورة كلمةً كلمة (المرحلة ١) =====
   المحرّك (rcNorm / rcFeed) مستقل عن مصدر الصوت. يستقبل نصًا مُتعرَّفًا عليه ويطابقه مع نص السورة.
   مصدر الصوت يُركَّب لاحقًا عبر window.ReciteASR = { start(onText, onErr), stop() } — انظر docs/RECITE_PLAN.md
   (وضع الكتابة اليدوي أُزيل.) */
var rc={sura:0,ay:0,w:[],st:[],hd:[],pos:0,on:false,msg:'',busy:false,ok:0,miss:0,hear:'',res:null,wk:-1,u:null,pick:false,adv:false,stat:false,hlog:[]};
/* الحروف المقطعة: المصحف يكتبها «الٓمٓ» لكن التلاوة تنطقها بأسماء الحروف («ألف لام ميم»)، والمعرِّف قد يكتبها بأي من الصيغتين.
   نوحّد النطق إلى الرسم المصحفي قبل المطابقة، ولا نفعل ذلك إلا في سورة فيها حروف مقطعة (rc.muq) كي لا يمسّ باقي الكلام. */
var RC_LN={'الف':'ا','لام':'ل','ميم':'م','صاد':'ص','را':'ر','كاف':'ك','ها':'ه','يا':'ي','عين':'ع','طا':'ط','سين':'س','حا':'ح','قاف':'ق','نون':'ن'};
var RC_LN2={'ا':1,'ل':1,'م':1,'ص':1,'ر':1,'ك':1,'ه':1,'ي':1,'ع':1,'ط':1,'س':1,'ح':1,'ق':1,'ن':1};
var RC_MUQ={'الم':1,'المص':1,'الر':1,'المر':1,'كهيعص':1,'طه':1,'طسم':1,'طس':1,'يس':1,'ص':1,'حم':1,'عسق':1,'ق':1,'ن':1};
/* Google قد يكتب فاتحة السورة كاسم كلمة واحدة («ياسين») */
var RC_ALIAS={'ياسين':'يس','حاميم':'حم','طاها':'طه','طاسين':'طس','طاسينميم':'طسم','صاد':'ص','قاف':'ق','نون':'ن'};
var RC_LNSINGLE={'صاد':1,'قاف':1,'نون':1};
function rcMuqFold(tk){
  var out=[],i=0,L,j,k,str,sp,done;
  while(i<tk.length){
    done=false;
    if(RC_ALIAS[tk[i]]&&RC_MUQ[RC_ALIAS[tk[i]]]){out.push(RC_ALIAS[tk[i]]);i++;continue}
    for(L=Math.min(5,tk.length-i);L>=1&&!done;L--){
      /* أسماء الحروف: ألف لام ميم */
      str='';for(j=0;j<L;j++){k=RC_LN[tk[i+j]];if(!k){str=null;break}str+=k}
      if(str&&RC_MUQ[str]&&(L>1||RC_LNSINGLE[tk[i]])){out.push(str);i+=L;done=true;break}
      /* حروف مفصولة: ا ل م */
      sp=tk.slice(i,i+L);
      if(L>1&&sp.every(function(x){return RC_LN2[x]})&&RC_MUQ[sp.join('')]){out.push(sp.join(''));i+=L;done=true}
    }
    if(!done){out.push(tk[i]);i++}
  }
  return out;
}
function rcNorm(s){
  var r=String(s||'').normalize('NFC').replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g,'')
    .replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ء/g,'')
    .replace(/[^ء-ي ]/g,' ').replace(/\s+/g,' ').trim();
  if(r&&typeof rc==='object'&&rc&&rc.muq)r=rcMuqFold(r.split(' ')).join(' ');
  return r;
}
function rcLev(a,b){
  var m=a.length,n=b.length,i,j,p=[],c;if(!m)return n;if(!n)return m;
  for(j=0;j<=n;j++)p[j]=j;
  for(i=1;i<=m;i++){var prev=p[0];p[0]=i;for(j=1;j<=n;j++){c=p[j];p[j]=Math.min(p[j]+1,p[j-1]+1,prev+(a.charCodeAt(i-1)===b.charCodeAt(j-1)?0:1));prev=c}}
  return p[n];
}
function rcSim(a,b){if(a===b)return 1;var L=Math.max(a.length,b.length);if(L<=2)return 0;return 1-rcLev(a,b)/L}
/* مطابقة متسامحة مع اختلاف الإملاء بين المصحف ونص التعرّف (الرحمٰن/الرحمان، ملك/مالك، الصلوة/الصلاة) */
function rcSkel(n){return n.replace(/ا/g,'').replace(/وه$/,'ه')}
/* حروف يخلط بينها المعرِّف الصوتي كثيرًا (ض/ظ، ص/س/ث، ذ/ز، ط/ت، ق/ك، ح/ه، ع/ء): تُوحَّد في مقارنة صوتية أخفّ عقوبة */
function rcPh(n){return rcSkel(n).replace(/[ظ]/g,'ض').replace(/[صث]/g,'س').replace(/[ذ]/g,'ز').replace(/[ط]/g,'ت').replace(/[ق]/g,'ك').replace(/[ح]/g,'ه').replace(/[ع]/g,'ء').replace(/ت$/,'ه').replace(/(.)\1+/g,'$1')}
function rcSim2(a,b){var x=rcSim(a,b);if(x>=1||a.length<3||b.length<3)return x;var y=rcSim(rcSkel(a),rcSkel(b));if(y>x)x=y;var z=rcSim(rcPh(a),rcPh(b))*.96;return z>x?z:x}
function rcPref(){var P=S.rcp;if(!P||typeof P!=='object')P=S.rcp={size:25,hifz:false,hist:[],rr:false};if(!P.hist)P.hist=[];P.lm='';return P}
function rcLoad(c,a){
  var Q=QD(),t=Q.s&&Q.s[c-1];rc.sura=c;rc.ay=a||0;rc.pgScope=0;rc.w=[];rc.st=[];rc.hd=[];rc.pos=0;rc.ok=0;rc.miss=0;rc.hear='';rc.res=null;rc.wk=-1;rc.u=null;rc.hlog=[];rc.fin=false;
  if(!t)return false;
  t.forEach(function(ay,ai){String(ay).split(/\s+/).forEach(function(w){var n=rcNorm(w);if(n)rc.w.push({t:w,n:n,a:ai+1})})});
  /* نص تنزيل يضع البسملة في أول آية لكل السور؛ هي آية في الفاتحة فقط، فنحذفها من غيرها */
  if(c!==1&&rc.w.slice(0,4).map(function(x){return x.n}).join(' ')==='بسم الله الرحمن الرحيم'&&rc.w.length>4)rc.w.splice(0,4);
  if(rc.ay>0)rc.w=rc.w.filter(function(x){return x.a===rc.ay});
  rc.muq=rc.w.some(function(x){return !!RC_MUQ[x.n]});
  return rc.w.length>0;
}
/* يطابق كلمات مسموعة مع الموضع الحالي: يبحث في نافذة أمامية قصيرة، ويعلّم ما تُخطّي بالأحمر */
function rcFeed(text,soft){
  var hw=rcNorm(text).split(' ').filter(Boolean),changed=false,n=rc.w.length,k;
  for(k=0;k<hw.length;k++){
    var h=hw[k];
    if(rc.pos>=n)break;
    var best=-1,bs=0,j,lim=Math.min(n-1,rc.pos+10),free=(rc.ok===0&&rc.pos===0);
    /* المعرِّف قد يفصل كلمة المصحف إلى كلمتين («ما كانوا» ← «ماكانوا») أو يدمج كلمتين في واحدة: نجرّب الدمج والفصل قبل المطابقة العادية */
    if(!free){
      var cur=rc.w[rc.pos],nx=rc.w[rc.pos+1];
      if(k+1<hw.length&&cur&&rcSim2(h+hw[k+1],cur.n)>=.86&&rcSim2(h,cur.n)<.86){rc.st[rc.pos]=1;rc.hd[rc.pos]=h+hw[k+1];rc.ok++;rc.pos++;changed=true;k++;continue}
      if(cur&&nx&&h.length>=5&&rcSim2(h,cur.n+nx.n)>=.86){rc.st[rc.pos]=1;rc.hd[rc.pos]=h;rc.st[rc.pos+1]=1;rc.hd[rc.pos+1]=h;rc.ok+=2;rc.pos+=2;changed=true;continue}
    }
    if(free){for(j=0;j<n;j++)if((rc.w[j].n===h||(h.length>=4&&rcSim2(h,rc.w[j].n)>=.8))&&(h.length>=3||j===0)){best=j;break}
      if(best>=0){rc.st[best]=1;rc.hd[best]=h;rc.ok++;rc.pos=best+1;changed=true}continue}
    for(j=rc.pos;j<=lim;j++){
      var s=rcSim2(h,rc.w[j].n),need=j===rc.pos?0.58:0.76;
      /* كلمة قصيرة جدًا لا تقفز بعيدًا (تفادي مطابقة عرضية) */
      if(j>rc.pos&&rc.w[j].n.length<=3&&s<1)continue;
      if(s>=need&&s>bs+0.0001){best=j;bs=s;if(s===1)break}
    }
    if(best<0)continue;
    for(j=rc.pos;j<best;j++){if(!soft){rc.st[j]=2;rc.miss++}}
    rc.st[best]=1;rc.hd[best]=h;rc.ok++;rc.pos=best+1;changed=true;
  }
  if(hw.length)rc.hear=text;
  return changed;
}
/* ---- تقييم الفرضيات: كل نتيجة (جزئية/نهائية) تُقيَّم من لقطة بداية الجملة، فتُصحَّح الكلمات التي غيّرها المعرِّف لاحقًا ولا تتراكم أخطاؤه ---- */
function rcSnap(){return {pos:rc.pos,ok:rc.ok,miss:rc.miss,st:rc.st.slice(),hd:rc.hd.slice(),hear:rc.hear}}
function rcRestore(o){rc.pos=o.pos;rc.ok=o.ok;rc.miss=o.miss;rc.st=o.st.slice();rc.hd=o.hd.slice();rc.hear=o.hear}
function rcHyp(alts,fin){
  alts=(alts||[]).filter(function(x){return x&&String(x).trim()});if(!alts.length){if(fin)rc.u=null;return false}
  if(!rc.u)rc.u=rcSnap();
  var best=null,bs=-1e9,bt='',i,sc;
  for(i=0;i<alts.length;i++){
    rcRestore(rc.u);rcFeed(alts[i],!fin);
    sc=(rc.ok-rc.u.ok)-(rc.miss-rc.u.miss)*.6-i*.02;
    if(sc>bs){bs=sc;best=rcSnap();bt=alts[i]}
  }
  rcRestore(best);rc.hear=bt;
  var moved=rc.pos>rc.u.pos;
  if(fin){rc.u=null;var tk=rcNorm(bt).split(' ').filter(Boolean);rc.hlog.push.apply(rc.hlog,tk);if(rc.hlog.length>6000)rc.hlog.splice(0,2000)}
  return true;
}
/* كلمات متوقَّعة تُمرَّر لخدمة التعرّف كتلميح (تحسّن الدقة على أندرويد 13+) */
function rcStrip(t){return String(t||'').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/\u0671/g,'\u0627')}
function rcBias(){
  var out=[],i,w=rc.w,from=Math.max(0,rc.pos-1),to=Math.min(w.length,from+36);
  for(i=from;i<to;i+=3){out.push(w.slice(i,Math.min(to,i+3)).map(function(x){return rcStrip(x.t)}).join(' '))}
  return out;
}
window.__rcBias=rcBias;
function rcPaint(){
  if(rc.miss>(rcPaint.pm||0)){try{if(!(S&&S.nohaptic)&&navigator.vibrate)navigator.vibrate([25,40,25])}catch(e){}}rcPaint.pm=rc.miss;
  var box=document.getElementById('rc-text');if(!box)return;
  var sp=box.querySelectorAll('.rcw'),i,n=rc.w.length,pct=n?rc.pos/n:0;
  for(i=0;i<n;i++){var st=rc.st[i],cls=(sp[i]&&sp[i].className.indexOf('mw')>=0?'mw ':'')+'rcw'+(st===1?' ok':st===2?' miss':'')+(i===rc.pos?' cur':'');if(sp[i]&&sp[i].className!==cls)sp[i].className=cls}
  var q;
  if((q=document.getElementById('rc-ok')))q.textContent=ar(rc.ok);
  if((q=document.getElementById('rc-miss')))q.textContent=ar(rc.miss);
  if((q=document.getElementById('rc-pct')))q.textContent=ar(Math.round(pct*100))+'٪';
  if((q=document.getElementById('rc-ring')))q.style.strokeDashoffset=String(213.6*(1-pct));
  if((q=document.getElementById('rc-bar')))q.style.width=Math.round(pct*100)+'%';
  if((q=document.getElementById('rc-hear')))q.textContent=rc.hear||'سيظهر هنا ما نسمعه';
  var cur=sp[Math.min(rc.pos,n-1)];if(cur&&cur.scrollIntoView&&rc.pos>0){try{cur.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}}
  if(rc.pos>=n&&n&&rc.on)rcFinish();
}
/* محاذاة عامة (LCS) بين كل ما سُمع فعلًا ونص المصحف: مرور ثانٍ يسترد الكلمات التي حكم عليها التتبّع اللحظي خطأً بالتخطّي،
   ولا يخفّض أي كلمة نجحت لحظيًا — ترقية فقط. */
function rcAlignPass(att){
  var hw=rc.hlog||[];if(!hw.length||!att)return;
  var n=Math.min(att,rc.w.length),m=hw.length,i,j;
  if(!n||!m||n*m>3000000)return; /* نصوص طويلة جدًا: نكتفي بالتتبّع اللحظي تفاديًا للحوسبة الثقيلة */
  var dp=new Array(m+1);for(i=0;i<=m;i++){dp[i]=new Array(n+1);for(j=0;j<=n;j++)dp[i][j]=0}
  for(i=1;i<=m;i++){var h=hw[i-1];for(j=1;j<=n;j++){
    var bj=dp[i][j-1],up=dp[i-1][j],dg=dp[i-1][j-1]+((h===rc.w[j-1].n||rcSim2(h,rc.w[j-1].n)>=.86)?1:0);
    dp[i][j]=dg>=bj&&dg>=up?dg:(bj>=up?bj:up);
  }}
  i=m;j=n;while(i>0&&j>0){
    var h2=hw[i-1],okM=h2===rc.w[j-1].n||rcSim2(h2,rc.w[j-1].n)>=.86;
    if(okM&&dp[i][j]===dp[i-1][j-1]+1){if(rc.st[j-1]!==1){rc.st[j-1]=1;rc.hd[j-1]=h2}i--;j--}
    else if(dp[i-1][j]>=dp[i][j-1])i--;else j--;
  }
  var o=0,ms=0;for(i=0;i<n;i++){if(rc.st[i]===1)o++;else if(rc.st[i]===2)ms++}
  rc.ok=o;rc.miss=ms;
}
/* ---- نتيجة التلاوة: دقة الكلمات والحروف والإكمال — محسوبة من التعرّف الفعلي (لا درجات عشوائية). التجويد لا يُقيَّم. ---- */
function rcResult(){
  var n=rc.w.length,att=Math.min(rc.pos,n),i;if(!n||!att)return null;
  rcAlignPass(att);
  var okc=0,ls=0,weak=[];
  for(i=0;i<att;i++){
    if(rc.st[i]===1){okc++;var sim=rc.hd[i]?rcSim2(rc.hd[i],rc.w[i].n):1;ls+=sim;if(sim<.85)weak.push({i:i,sim:sim})}
    else weak.push({i:i,sim:0});
  }
  var W=okc/att*100,L=ls/att*100,C=att/n*100,T=Math.round(W*.45+L*.35+C*.20);
  return {t:Math.min(100,T),w:Math.round(W),l:Math.round(L),c:Math.round(C),weak:weak,att:att,n:n};
}
function rcFinish(){
  rc.on=false;clearInterval(rc.idle);
  try{
    if(rcAsr.loc&&window.AlsaerNative&&AlsaerNative.asrStop){
      AlsaerNative.asrStop(); /* إيقاف الالتقاط مع إبقاء مستمع الجلسة: المقاطع المنتظرة تُفكّ وتصل لاحقًا فتُدمج في النتيجة */
      clearTimeout(rc.finWd);rc.finWd=setTimeout(function(){try{rcAsrStop()}catch(e){}},16000); /* احتياط إن لم تصل خاتمة التصريف */
    }else if(window.ReciteASR)window.ReciteASR.stop();
  }catch(e){}
  rc.fin=true; /* يسمح بدمج النص المتأخر في النتيجة */
  if(rcPref().rr){
    rc.pos=rc.w.length; /* وضع التسجيل: الحصة تغطي النص كله، والمحاذاة العامة هي الحكم */
    if(!rc.hlog.length){rc.msg='لم نسمع تلاوة بعد — اضغط الميكروفون وتلُ أولًا.';try{render()}catch(e){}return}
  }
  var r=rcResult();if(!r){try{render()}catch(e){}return}
  rc.res=r;rc.wk=-1;var P=rcPref();
  P.hist.push({s:rc.sura,ay:rc.ay,pg:rc.pgScope||0,d:Date.now(),a:r.t,m:rc.miss,w:r.att,k:Math.round(r.w/100*r.att)});if(P.hist.length>120)P.hist.shift();var T=P.tot||(P.tot={n:0,w:0,k:0,best:0});T.n++;T.w+=r.att;T.k+=Math.round(r.w/100*r.att);if(r.t>T.best)T.best=r.t;save();
  rc.msg=r.c>=100?'أتممت '+(rc.pgScope?'الصفحة':(rc.ay?'الآية':'السورة'))+' — تقبّل الله ✓':'';
  try{render()}catch(e){}
}
function rcResHtml(){
  var r=rc.res;if(!r)return '';
  var lab=r.t>=90?'ممتاز':r.t>=80?'جيد جدًا':r.t>=65?'جيد':'يحتاج إلى مراجعة',col=r.t>=80?'#43d9a0':r.t>=65?'#e8c873':'#ff8a7a';
  function bar(t,v){return '<div class="rc-bar'+(v>=80?'':' mid')+'"><span>'+t+'</span><i><b style="width:'+v+'%"></b></i><em>'+ar(v)+'</em></div>'}
  var wk=r.weak.slice(0,24).map(function(x){return '<button class="rc-wk'+(x.sim===0?' miss':'')+(rc.wk===x.i?' on':'')+'" data-a="rcwk" data-v="'+x.i+'">'+mTok(rc.w[x.i].t)+'</button>'}).join('');
  var d='';if(rc.wk>=0&&rc.w[rc.wk]){var w=rc.w[rc.wk];d='<div class="rc-wd"><b>'+mTok(w.t)+'</b><small>'+(rc.st[rc.wk]===1?'سمعناها: «'+esc(rc.hd[rc.wk]||'')+'» — تشابه '+ar(Math.round(rcSim(rc.hd[rc.wk]||'',w.n)*100))+'٪ مع المطلوب':'لم نسمع هذه الكلمة أو تخطّيتها')+'</small></div>'}
  return '<section class="card rc-res"><div class="rc-sc"><div class="rc-sr"><svg viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="rcgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8c066"/><stop offset="1" stop-color="#c9982e"/></linearGradient></defs><circle cx="40" cy="40" r="34" class="bg"/><circle cx="40" cy="40" r="34" class="fg" style="stroke:'+col+';stroke-dasharray:213.6;stroke-dashoffset:'+(213.6*(1-r.t/100))+'"/></svg><b>'+ar(r.t)+'</b></div>'
   +'<div><h3 class="rc-grade" style="margin:0;color:'+col+'">'+lab+'</h3><small class="muted">'+(rc.pgScope?'صفحة '+ar(rc.pgScope):(rc.ay?'الآية '+ar(rc.ay):'سورة '+esc(QD().n[rc.sura-1]||'')))+' · '+ar(r.att)+' من '+ar(r.n)+' كلمة</small></div></div>'
   +'<h4 class="rc-h">التفاصيل</h4>'+bar('دقة الكلمات',r.w)+bar('دقة الحروف',r.l)+bar('الإكمال',r.c)+'<h4 class="rc-h">تحليل الكلمات</h4><div class="rc-tokrow" dir="rtl">'+rc.w.slice(0,r.att).map(function(w,i){return '<span class="rct '+(rc.st[i]===1?(rc.hd[i]&&rcSim(rc.hd[i],w.n)<.85?'mid':'ok'):'bad')+'">'+mTok(w.t)+'</span>'}).join('')+'</div>'
   +(r.weak.length?'<h4 class="rc-h">ملاحظات</h4>'+r.weak.slice(0,3).map(function(x){var w=rc.w[x.i];return '<div class="rc-note"><b>'+mTok(w.t)+'</b><div><em>'+(x.sim===0?'لم تُسمع':'تحتاج تحسينًا')+'</em><small>'+(x.sim===0?'تخطّيت هذه الكلمة أو لم يلتقطها الميكروفون':'سمعنا «'+esc(rc.hd[x.i]||'')+'» — تشابه '+ar(Math.round(x.sim*100))+'٪')+'</small></div></div>'}).join(''):'')
   +(wk?'<h4 style="margin:12px 0 6px">كلمات تحتاج مراجعة <small class="muted">(المس كلمة للتفاصيل)</small></h4><div class="rc-wks">'+wk+'</div>'+d:'<p class="note">لا كلمات تحتاج مراجعة ✓</p>')
   +'<p class="note">الدرجة تقارن ما سمعه التطبيق بنص المصحف (كلمات وحروف). أحكام التجويد لا تُقيَّم بعد، ودقة التعرّف تتأثر بالضوضاء ووضوح الصوت.</p>'
   +'<div class="acts"><button class="btn" data-a="rcagain">إعادة المحاولة</button>'+(rc.pgScope?(rc.pgScope<604?'<button class="btn ghost" data-a="rcayn">الصفحة التالية</button>':''):(rc.ay&&rc.ay<(QD().s[rc.sura-1]||[]).length?'<button class="btn ghost" data-a="rcayn">الآية التالية</button>':''))+'</div></section>';
}
function rcSay(t,busy){rc.msg=t||'';rc.busy=!!busy;var q=document.getElementById('rc-status');if(q){q.textContent=rc.msg;q.className='rc-status'+(rc.busy?' busy':'')+(rc.msg?'':' empty')}}
function rcStop(){rc.on=false;clearInterval(rc.idle);try{if(window.ReciteASR)window.ReciteASR.stop()}catch(e){}}
/* جلسة قائمة: تتبّع لحظي (ok/miss) أو تسجيل-ثم-مراجعة جمع نصًا (hlog) */
function rcHasSession(){return rc.ok+rc.miss>0||!!(rcPref().rr&&rc.hlog.length)}

function rcStart(){
  if(!rc.w.length&&!rcLoad(rc.sura||1)){rc.msg='تعذّر تحميل نص السورة.';return}
  var A=window.ReciteASR;
  if(!A){rc.msg='التعرّف على الصوت غير متاح في هذه النسخة. ';return}
  if(!rcPref().consent&&!window.__rcNoConsent){rc.consentAsk=true;return}
  rcStart2();
}
function rcStart2(){
  var A=window.ReciteASR;if(!A)return;
  if(rcPref().rr){ /* وضع التسجيل: كل استماع محاولة مستقلة — بقايا جلسة سابقة كانت تلوث محاذاة النتيجة */
    rc.st=[];rc.hd=[];rc.pos=0;rc.ok=0;rc.miss=0;rc.hear='';rc.res=null;rc.wk=-1;rc.u=null;rc.hlog=[]}
  rc.fin=false;rc.on=true;rc.msg='';rc.busy=false;rc.last=Date.now();
  clearInterval(rc.idle);rc.idle=setInterval(function(){if(!rc.on){clearInterval(rc.idle);return}if(Date.now()-rc.last>120000){rcStop();rc.msg='أُوقف الميكروفون تلقائيًا لأنك لم تتلُ لدقيقتين. اضغط الميكروفون للمتابعة.';try{render()}catch(x){}}},10000);
  try{A.start(function(t,fin){
    if(!rc.on){ /* نص وصل متأخرًا بعد الإنهاء (تصريف المقاطع المنتظرة): أدمجه في النتيجة المعروضة وأعد الحساب */
      if(!rc.fin||fin===false)return;
      var altsL=Array.isArray(t)?t:[t];if(!altsL[0])return;
      if(rcPref().rr){var tkL=rcNorm(altsL[0]).split(' ').filter(Boolean);if(!tkL.length)return;rc.hlog.push.apply(rc.hlog,tkL);if(rc.hlog.length>6000)rc.hlog.splice(0,2000)}
      else rcHyp(altsL,true);
      var hadRes=!!rc.res,rL=rcResult();if(rL){rc.res=rL;rc.msg='حُدّثت النتيجة بعد معالجة باقي الصوت';
        if(hadRes)try{var PL=rcPref(),hL=PL.hist&&PL.hist[PL.hist.length-1];if(hL&&hL.s===rc.sura&&hL.ay===rc.ay){hL.a=rL.t;hL.m=rc.miss;hL.w=rL.att;hL.k=Math.round(rL.w/100*rL.att);save()}}catch(e){}
        try{render()}catch(e){}}
      return}
    rc.last=Date.now();
    if(rcPref().rr){ /* وضع التسجيل ثم المراجعة: بلا مطابقة لحظية — نجمع النص ونحلّله عند التوقف */
      if(fin!==false){var alts=Array.isArray(t)?t:[t];if(alts[0]){var tk=rcNorm(alts[0]).split(' ').filter(Boolean);rc.hlog.push.apply(rc.hlog,tk);if(rc.hlog.length>6000)rc.hlog.splice(0,2000);rc.hear=alts[0]}}
      rcPaint();return}
    rcHyp(Array.isArray(t)?t:[t],fin!==false);rcPaint()},function(e){rc.on=false;rc.busy=false;rc.msg=String(e||'تعذّر تشغيل التعرّف على الصوت.');try{render()}catch(x){}},rcSay)}
  catch(e){rc.on=false;rc.msg='تعذّر تشغيل التعرّف على الصوت.'}
}
function rcAct(a,v){
  if(a==='rcsura'){rcStop();rcLoad(parseInt(v,10)||1,0);rc.msg=''}
  else if(a==='rcstart'){if(rc.on){if(rcHasSession()){rcFinish();return true}rcStop()}else rcStart()}
  else if(a==='rcayp'||a==='rcayn'){if(rc.pgScope){rpGo(rp.page+(a==='rcayn'?1:-1));return false}rcStop();var cnt=(QD().s[rc.sura-1]||[]).length,na=Math.max(1,Math.min(cnt,(rc.ay||1)+(a==='rcayn'?1:-1)));rcLoad(rc.sura,na);rc.msg=''}
  else if(a==='rcdone'){rcFinish();return true}
  else if(a==='rcverse'){
    var nn=rc.w.length;if(nn){var cv=rc.w[Math.min(rc.pos,nn-1)].a,i0=0;while(i0<nn&&rc.w[i0].a!==cv)i0++;
      if(rc.pos>0&&rc.w[rc.pos-1]&&rc.w[rc.pos-1].a===cv||rc.pos>=nn||true){
        for(var q=i0;q<nn;q++){if(rc.w[q].a!==cv)break;rc.st[q]=0;rc.hd[q]=undefined}
        var o2=0,m2=0;for(var z=0;z<nn;z++){if(rc.st[z]===1)o2++;else if(rc.st[z]===2)m2++}
        rc.ok=o2;rc.miss=m2;rc.pos=i0;rc.u=null;rc.hear='';rc.msg='أعد قراءة الآية '+ar(cv);rcPaint.pm=rc.miss;try{if(navigator.vibrate)navigator.vibrate(12)}catch(e){}}}}
  else if(a==='rcconsent'){rcPref().consent=true;save();rc.consentAsk=false;rcStart()}
  else if(a==='rcconsentno'){rc.consentAsk=false}
  else if(a==='rchistclr'){rcPref().hist=[];save()}
  else if(a==='rcagain'){rcStop();if(rc.pgScope)rpLoad(rp.page);else rcLoad(rc.sura,rc.ay);rc.msg=''}
  else if(a==='rcwk'){rc.wk=(rc.wk===parseInt(v,10))?-1:parseInt(v,10)}
  else if(a==='rcmodel'){var P3=rcPref();var rr=document.getElementById('rc-rr');if(rr)P3.rr=rr.checked;save();rcStop();rcAsrStop();rc.adv=false;toast('✅ تم حفظ الإعدادات');rc.msg='';return false}
  else if(a==='rcfs'){var P=rcPref();P.size=Math.max(18,Math.min(40,(P.size||25)+(parseInt(v,10)||0)*2));save()}
  else if(a==='rcpick'){rc.pick=!rc.pick}
  else if(a==='rcdiag'){try{if(window.AlsaerNative&&AlsaerNative.asrDiag){AlsaerNative.shareText('تشخيص التلاوة — السائر',AlsaerNative.asrDiag()||'لا يوجد سجل بعد')}else toast('التشخيص غير متاح في هذه النسخة')}catch(e){}return false}
  else if(a==='rcadv'){rc.adv=!rc.adv;if(rc.adv)rc.stat=false}
  else if(a==='rchifz'){var P2=rcPref();P2.hifz=!P2.hifz;save()}
  else if(a==='rcreset'){rcStop();if(rc.pgScope)rpLoad(rp.page);else rcLoad(rc.sura||1,rc.ay);rc.msg=''}
  else if(a==='rcstat'){rc.stat=!rc.stat;if(rc.stat)rc.adv=false}
  return false;
}
document.addEventListener('click',function(e){var w=e.target&&e.target.closest&&e.target.closest('.rc-hifz .rcw');if(w)w.classList.toggle('peek')});
document.addEventListener('change',function(e){var t=e.target,k=t&&t.getAttribute&&t.getAttribute('data-rc');if(k==='sura'){rcStop();rcLoad(parseInt(t.value,10)||1,0);rc.msg='';try{render()}catch(x){}}else if(k==='ay'){rcStop();rcLoad(rc.sura||1,parseInt(t.value,10)||0);rc.msg='';try{render()}catch(x){}}});
function rcHistHtml(P){
  var H=(P.hist||[]).slice(-7).reverse();if(!H.length)return '';
  var avg=Math.round(H.reduce(function(t,x){return t+(x.a||0)},0)/H.length);
  return '<h4>تقدّمك (آخر '+ar(H.length)+' جلسات · المتوسط '+ar(avg)+'٪)</h4><div class="rc-hist">'+H.map(function(x){var d=new Date(x.d||0),nm=x.pg?'صفحة '+ar(x.pg):((QD().n||[])[x.sura-1]||(QD().n||[])[(x.s||1)-1]||'');
    return '<div class="rc-hr"><span>'+esc(nm)+(!x.pg&&x.ay?' — آية '+ar(x.ay):'')+'</span><i style="--w:'+Math.max(4,x.a||0)+'%"></i><b>'+ar(x.a||0)+'٪</b><small>'+ar(d.getDate())+'/'+ar(d.getMonth()+1)+'</small></div>'}).join('')+'</div><div class="acts"><button class="btn ghost" data-a="rchistclr">مسح السجل</button></div>';
}

function rcDayKey(t){var d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function rcStats(P){
  var H=P.hist||[],T=P.tot||{n:H.length,w:0,k:0,best:0},avg=H.length?Math.round(H.reduce(function(t,x){return t+(x.a||0)},0)/H.length):0;
  var best=Math.max(T.best||0,H.reduce(function(m,x){return Math.max(m,x.a||0)},0)),days={};H.forEach(function(x){days[rcDayKey(x.d||0)]=(days[rcDayKey(x.d||0)]||0)+1});
  var st=0,dt=new Date();if(!days[rcDayKey(dt)])dt.setDate(dt.getDate()-1);while(days[rcDayKey(dt)]){st++;dt.setDate(dt.getDate()-1)}
  var wk=[],i,d0=new Date(),nm=['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  for(i=6;i>=0;i--){var dd=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()-i);wk.push({l:nm[dd.getDay()],c:days[rcDayKey(dd)]||0})}
  var ws=0;H.forEach(function(x){ws+=x.w||0});
  return {n:Math.max(T.n||0,H.length),avg:avg,best:best,words:Math.max(T.w||0,ws),streak:st,wk:wk,last:H.slice(-10)};
}
function rcStatSheet(P){
  var S0=rcStats(P);
  function tile(ic0,v,t){return '<div class="rc-tile"><span>'+ic0+'</span><b>'+v+'</b><small>'+t+'</small></div>'}
  var body;
  if(!S0.n)body='<p class="note rc-empty">لا توجد جلسات بعد. أكمل تلاوة سورة أو آية وسترى إحصائياتك هنا.</p>';
  else body='<div class="rc-tiles">'+tile('🎯',ar(S0.avg)+'٪','متوسط الدقة')+tile('🏆',ar(S0.best)+'٪','أفضل نتيجة')+tile('📖',ar(S0.n),'عدد الجلسات')+tile('🔥',ar(S0.streak),'أيام متتالية')+'</div>'
   +(S0.words?'<p class="rc-wtot">إجمالي الكلمات المتلوّة: <b>'+ar(S0.words)+'</b></p>':'')
   +'<h4>آخر الأيام</h4><div class="rc-days">'+S0.wk.map(function(x){return '<div class="rc-day'+(x.c?' on':'')+'"><i>'+(x.c?ar(x.c):'')+'</i><small>'+x.l+'</small></div>'}).join('')+'</div>'
   +'<h4>دقة آخر الجلسات</h4><div class="rc-chart">'+S0.last.map(function(x){return '<div class="rc-col" title="'+ar(x.a||0)+'٪"><i style="height:'+Math.max(6,x.a||0)+'%"></i><small>'+ar(x.a||0)+'</small></div>'}).join('')+'</div>'
   +rcHistHtml(P);
  return '<section class="rc-sheet card"><div class="rc-sh-h"><b>📊 إحصائيات التلاوة</b><button class="rc-tb" data-a="rcstat" aria-label="إغلاق">✕</button></div>'+body+'</section>';
}
/* بطاقة النموذج القرآني المحلي في إعدادات التلاوة: اختيار المحرّك + تنزيل/حذف النماذج */
function rcLocalHtml(P){
  return '<div class="rc-grp"><h4>🎙 محرك التسميع: تعرّف Google (تجريبي)</h4>'
   +'<p class="note">الصوت يغادر هاتفك: على أندرويد 13+ نجرّب التعرّف على الجهاز أولًا إن توفّرت الحزمة العربية، وإلا يُرسَل لخدمة Google عبر الإنترنت. المطابقة نصية مع طيّ الحروف المقطعة. لا يلتقط أخطاء التجويد، وقد «يصحّح» Google الخطأ إلى كلمة شائعة فيُخفيه. نسخة اختبار شخصية.</p></div>';
}
function rcSheet(P,last){
  return '<section class="rc-sheet card"><div class="rc-sh-h"><b>⚙ إعدادات التلاوة</b>'+(last?'<small>آخر جلسة '+ar(last.a)+'٪</small>':'')+'<button class="rc-tb" data-a="rcadv" aria-label="إغلاق">✕</button></div>'
   +rcLocalHtml(P)
   +'<div class="rc-grp"><h4>🎙 خيارات التسميع</h4>'
     +'<label class="rc-mt"><input type="checkbox" id="rc-rr"'+(P.rr?' checked':'')+'><span><b>تسجيل ثم مراجعة 🐢</b><small>للأجهزة الضعيفة: يجمع تلاوتك كاملة ثم يحلّلها عند التوقف بدل المطابقة اللحظية — أخف على المعالج ويثبّت النتيجة.</small></span></label></div>'
   +'<div class="rc-grp"><h4>🛠 تشخيص التعرّف</h4><p class="note">سجل فني (أحداث تشغيل فقط، بلا صوت ولا نصوص تلاوة) يفيدنا عند الإبلاغ عن مشكلة في التسميع. </p><div class="acts"><button class="btn ghost" data-a="rcdiag">مشاركة سجل التشخيص</button></div></div>'
   +'<div class="acts"><button class="btn" data-a="rcmodel">حفظ</button></div></section>';
}
function vReciteOld(){
  var Q=QD();
  if(!Q.n||!Q.n.length)return '<section class="card"><p class="note">تعذّر تحميل نص المصحف.</p></section>';
  if(!rc.sura)rcLoad(1);
  var opts=Q.n.map(function(nm,i){return '<option value="'+(i+1)+'"'+(rc.sura===i+1?' selected':'')+'>'+ar(i+1)+' · '+esc(nm)+'</option>'}).join('');
  var n=rc.w.length,pct=n?rc.pos/n:0,A=!!window.ReciteASR,words='',P=rcPref(),last=P.hist[P.hist.length-1];
  rc.w.forEach(function(w,i){
    words+='<span class="rcw'+(rc.st[i]===1?' ok':rc.st[i]===2?' miss':'')+(i===rc.pos?' cur':'')+'">'+esc(w.t)+'</span> ';
    var nx=rc.w[i+1];if(!nx||nx.a!==w.a)words+='<span class="rcn">﴿'+ar(w.a)+'﴾</span> ';
  });
  var cnt=(Q.s[rc.sura-1]||[]).length,ayo='<option value="0"'+(rc.ay?'':' selected')+'>السورة كاملة</option>';for(var ai=1;ai<=cnt;ai++)ayo+='<option value="'+ai+'"'+(rc.ay===ai?' selected':'')+'>الآية '+ar(ai)+'</option>';
  var wave=rc.on?'<div class="rc-wave" aria-hidden="true">'+[0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i){return '<i style="animation-delay:'+(i*.11).toFixed(2)+'s"></i>'}).join('')+'</div>':'';
  return '<div class="rc rc-t">'
   +'<div class="rc-top"><button class="rc-pk'+(rc.pick?' on':'')+'" data-a="rcpick" aria-expanded="'+!!rc.pick+'"><b>'+esc(Q.n[rc.sura-1]||'')+'</b><span>'+(rc.ay?'الآية '+ar(rc.ay):'السورة كاملة')+' · '+ar(n)+' كلمة</span><i>▾</i></button></div>'
   +'<div class="rc-tools"><button class="rc-tb" data-a="rcfs" data-v="-1" aria-label="تصغير الخط"><b>أ−</b><small>الخط</small></button><button class="rc-tb" data-a="rcfs" data-v="1" aria-label="تكبير الخط"><b>أ+</b><small>الخط</small></button><button class="rc-tb'+(P.hifz?' on':'')+'" data-a="rchifz" aria-pressed="'+!!P.hifz+'">'+ic('target')+'<small>تسميع</small></button><button class="rc-tb'+(rc.stat?' on':'')+'" data-a="rcstat" aria-expanded="'+!!rc.stat+'" aria-label="الإحصائيات"><b>📊</b><small>إحصائيات</small></button><button class="rc-tb rc-gear'+(rc.adv?' on':'')+'" data-a="rcadv" aria-expanded="'+!!rc.adv+'" aria-label="إعدادات التلاوة"><b>&#9881;</b><small>إعدادات</small></button></div>'
   +(rc.adv?rcSheet(P,last):'')+(rc.stat?rcStatSheet(P):'')
   +(rc.pick?'<section class="rc-pick"><select class="rm-sel rc-sel" data-rc="sura" aria-label="السورة">'+opts+'</select>'
     +'<div class="rc-ayr"><button class="rc-tb" data-a="rcayp" aria-label="الآية السابقة"'+(rc.ay>1?'':' disabled')+'>›</button><select class="rm-sel rc-sel" data-rc="ay" aria-label="الآية">'+ayo+'</select><button class="rc-tb" data-a="rcayn" aria-label="الآية التالية"'+(rc.ay&&rc.ay<cnt?'':' disabled')+'>‹</button></div></section>':'')
   +'<div class="rc-pb"><i id="rc-bar" style="width:'+Math.round(pct*100)+'%"></i></div>'
   +rcResHtml()
   +'<section class="rc-read"><div id="rc-text" class="rc-text'+(P.hifz?' rc-hifz':'')+'" dir="rtl" style="font-size:'+(P.size||28)+'px">'+words+'</div></section>'
   +(rc.consentAsk?'<section class="card rc-consent"><h4>🔒 قبل أن نبدأ</h4><p class="note">'+'التسميع في هذه النسخة التجريبية يستخدم تعرّف الكلام في أندرويد (Google): قد يُرسَل صوتك إلى خدمة Google عبر الإنترنت ليتحوّل إلى نص،'+' ولا يحفظ تطبيق «السائر» أي تسجيل. الميكروفون يعمل فقط أثناء شاشة التلاوة ويتوقف عند الخروج أو بعد دقيقتين صمت.</p><div class="acts"><button class="btn" data-a="rcconsent">أوافق وأبدأ</button><button class="btn ghost" data-a="rcconsentno">ليس الآن</button></div></section>':'')
   +'<div class="rc-live"><p class="rc-hear" id="rc-hear">'+(rc.hear?esc(rc.hear):(rc.on?'تلُ الآن… أسمعك':'اضغط الميكروفون وابدأ التلاوة'))+'</p>'
   +'<div id="rc-status" class="rc-status'+(rc.busy?' busy':'')+(rc.msg?'':' empty')+'">'+esc(rc.msg)+'</div>'
   +((rc.ok+rc.miss>0&&!rc.res)?'<button class="rc-redo" data-a="rcverse">↺ أعد هذه الآية</button>':'')+'</div>'
   +(A?'':'<p class="note rc-warn">التعرّف على الصوت غير متاح في هذه النسخة.</p>')
   +'<div class="rc-dock">'+wave
   +'<div class="rc-dock-row"><button class="rc-side" data-a="rcreset" aria-label="من البداية">'+ic('refresh')+'<small>من البداية</small></button>'
   +'<button class="rc-mic'+(rc.on?' on':'')+(rc.busy?' busy':'')+'" data-a="rcstart" aria-label="'+(rc.on?'إيقاف':'ابدأ التلاوة')+'">'+ic('mic')+'</button>'
   +'<button class="rc-side" data-a="'+((rcHasSession()&&!rc.res)?'rcdone':(rc.ay&&rc.ay<cnt?'rcayn':'rcdone'))+'" aria-label="التالي">'+((rcHasSession()&&!rc.res)?ic('check')+'<small>النتيجة</small>':(rc.ay&&rc.ay<cnt?ic('chev')+'<small>التالية</small>':ic('check')+'<small>النتيجة</small>'))+'</button></div>'
   +'<div class="rc-cnt"><span>صحيح <b id="rc-ok">'+ar(rc.ok)+'</b></span><span>متخطّى <b id="rc-miss">'+ar(rc.miss)+'</b></span></div></div></div>';
}
try{if(/alsaertest/.test(location.search)&&window.__T){window.__T.rc=function(){return {rc:rc,rcLoad:rcLoad,rcHyp:rcHyp,rcPref:rcPref,rcStop:rcStop}}}}catch(e){}
