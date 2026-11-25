var fitTok=0;
/* Warsh page layout core: measure units, find max font size for T lines, balance with DP. */
function wrapCount(ws,W,s,gap){var n=ws.length,cnt=1,cur=0,first=true;for(var i=0;i<n;i++){var w=ws[i]*s/100;if(first){cur=w;first=false}else if(cur+gap*s+w<=W+0.01){cur+=gap*s+w}else{cnt++;cur=w}}return cnt}

/* split n items into exactly L lines minimising squared slack; lastFree: last line cost 0 */
function balanceLines(ws,W,s,gap,L,lastFree){
  var n=ws.length;if(L>n)L=n;if(L<1)L=1;
  var pre=[0];for(var i=0;i<n;i++)pre.push(pre[i]+ws[i]*s/100);
  var g=gap*s;
  function lw(a,b){return pre[b]-pre[a]+(b-a-1)*g} // items a..b-1
  var INF=1e18,dp=[],bk=[];
  for(var k=0;k<=L;k++){dp.push(new Array(n+1).fill(INF));bk.push(new Array(n+1).fill(-1))}
  dp[0][0]=0;
  for(var k=1;k<=L;k++){
    for(var b=k;b<=n;b++){
      for(var a=k-1;a<b;a++){
        if(dp[k-1][a]>=INF)continue;
        var w=lw(a,b);if(w>W+0.01)continue;
        var sl=W-w,c=(lastFree&&k===L&&b===n)?0:sl*sl;
        var v=dp[k-1][a]+c;if(v<dp[k][b]){dp[k][b]=v;bk[k][b]=a}
      }
    }
  }
  if(dp[L][n]>=INF)return null;
  var cuts=[],b=n;for(var k=L;k>=1;k--){var a=bk[k][b];cuts.unshift([a,b]);b=a}
  return cuts;
}

/* ===== Reader layout (Hafs + Warsh): use the page area, fixed justified lines ===== */
var wMeasureCtx=null,wWidthCache={};
function fontReady(){return !document.fonts||!document.fonts.check||document.fonts.check('40px KFGQPC','بسم')}
function wMeasure(txt){
  if(!wMeasureCtx)wMeasureCtx=document.createElement('canvas').getContext('2d');
  wMeasureCtx.font='100px KFGQPC';
  var ok=fontReady();
  if(ok&&wWidthCache[txt]!==undefined)return wWidthCache[txt];
  var w=wMeasureCtx.measureText(txt).width;if(ok)wWidthCache[txt]=w;return w;
}
function sizeMp(mp){
  var rb=document.querySelector('.rbar'),vh=window.innerHeight||document.documentElement.clientHeight,r=mp.getBoundingClientRect();
  var topDoc=r.top+(window.pageYOffset||0),rbH=0;
  if(rb){var cs=getComputedStyle(rb);rbH=rb.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0)}
  var pad=(parseFloat(getComputedStyle(document.body).paddingBottom)||0)+(parseFloat(getComputedStyle(mp).marginBottom)||0);
  var imm=document.body.classList.contains('rdi')||document.body.classList.contains('rpi');if(imm)rbH=0;
  var avail=Math.floor(vh-topDoc-rbH-pad-2);
  var maxW=Math.min(app.clientWidth||window.innerWidth,640);
  var w=imm?Math.max(240,maxW):Math.max(240,Math.min(maxW,Math.floor(avail*.80))); /* وضع القراءة بكامل العرض: عمود النص = الشاشة إلا ٣٢+٤ بكسل من كل جانب تمامًا */
  var h=Math.max(300,Math.min(avail,Math.floor(w*(imm?2.1:1.75))));
  mp.style.width=w+'px';mp.style.height=h+'px';
}
/* نص متدفق بحجم خط يختاره المستخدم: تُقاس الكلمات وتُلفّ على عرض الصفحة لفًّا طبيعيًّا */
function mpTokPlain(t){var o='';for(var i=0;i<t.length;i++){var c=t.charCodeAt(i);if(c>=0xE000&&c<=0xE005)continue;if(c===0xE0FF||c===0xE0F0)continue;o+=t.charAt(i)}return o}
/* الرسم الشرقي/* الرسم الشرقي: خط الحفص المشرقي لا يملك شكل الياء المغربية (U+06D2)، فتُكتب ياءً عادية */
function warshFix(t){
  return String(t).replace(/\u06D2/g,'\u064A')
    /* ألف الوصل بعلامات ورش (ا۬ / ا۪) تُرسم ٱ في الرسم المشرقي */
    .replace(/(^|[\s\u00A0\u06D6-\u06DF\u064B-\u0652]|[وف][\u064B-\u0652])ا[\u064B-\u0652]?\u06EC/g,'$1\u0671')
    .replace(/(^|[\s\u00A0])ا[\u064B-\u0652]?\u06EA/g,'$1\u0671')
}
/* نفس warshFix مع إبقاء مصفوفة ألوان التجويد موازية للنص بعد الاستبدال */
function warshFixK(t,k){
  var a=String(t).replace(/\u06D2/g,'\u064A'),kk=k?k.slice():null;
  [/(^|[\s\u00A0\u06D6-\u06DF\u064B-\u0652]|[وف][\u064B-\u0652])ا[\u064B-\u0652]?\u06EC/g,/(^|[\s\u00A0])ا[\u064B-\u0652]?\u06EA/g].forEach(function(re){
    var out='',ko=[],last=0,m,x,y;re.lastIndex=0;
    while((m=re.exec(a))){
      var pl=m[1].length;
      out+=a.slice(last,m.index+pl)+'\u0671';
      if(kk){for(x=last;x<m.index+pl;x++)ko.push(kk[x]);ko.push(kk[m.index+pl])}
      last=m.index+m[0].length;
    }
    out+=a.slice(last);if(kk)for(y=last;y<a.length;y++)ko.push(kk[y]);
    a=out;if(kk)kk=ko;
  });
  return {t:a,k:kk};
}
function warshUnits(tokens,tj){
  var units=[];
  tokens.forEach(function(o){
    if(!o||!o.t)return;var f=warshFixK(o.t,tj?o.k:null),t=f.t;
    var m=/^(.*)\xa0([٠-٩]+)$/.exec(t);
    if(m&&units.length){
      var w={txt:m[1],html:tj?wtjHtml(m[1],f.k?f.k.slice(0,m[1].length):null):esc(m[1]),cv:o.cv};
      units.push(w);w.txt+=' '+m[2];w.html+=' <i class="aym">'+esc(m[2])+'</i>';return;
    }
    units.push({txt:t,html:tj?wtjHtml(t,f.k):esc(t),cv:o.cv});
  });
  return units;
}
function fitWarsh(mp){
  var L=mp.querySelector('.mp-l');if(!L||!rd)return;
  var W=L.clientWidth-72,H=L.clientHeight-20;if(!W||!H)return; /* نفس حاشية عمود النص ٣٢+٤ بكسل */
  var p=rd.page,D=WD(),r=D.p[p-1];if(!r)return;
  var tj=S.quran.tj!==false,MU=window.MUSHAF,tot=(MU&&MU.p[p-1])?MU.p[p-1].length:15;
  var GAP=.14,seq=[],reserved=0,paras=[];
  for(var c=r[0];c<=r[2];c++){
    var v1=(c===r[0]?r[1]:1),v2=(c===r[2]?r[3]:D.s[c-1].length),toks=[];
    if(v1===1){seq.push({k:'h',c:c});reserved++;if(c!==9){seq.push({k:'b'});reserved++}}
    for(var v=v1;v<=v2;v++)toks=toks.concat(wtj(c,v).map(function(o){return o&&o.t?{t:o.t,k:o.k,cv:c+':'+v}:o}));
    var pa={k:'p',units:warshUnits(toks,tj),endsSura:(v2===D.s[c-1].length),last:(c===r[2])};
    pa.ws=pa.units.map(function(u){return wMeasure(u.txt)});
    seq.push(pa);paras.push(pa);
  }
  var Wm=W*.985; /* هامش أمان: عرض الرسم الفعلي قد يزيد قليلًا عن قياس canvas */
  var T=Math.max(1,tot-reserved),rowH=H/tot,sMax=Math.min(rowH/1.2,60),sMin=10;
  function count(s){var n=0;paras.forEach(function(pa){n+=wrapCount(pa.ws,Wm,s,GAP)});return n}
  var s;
  if(count(sMax)<=T)s=sMax;
  else{var lo=sMin,hi=sMax;if(count(lo)>T){lo=2;hi=sMin}for(var i=0;i<40;i++){var m=(lo+hi)/2;if(count(m)<=T)lo=m;else hi=m}s=lo}
  s=Math.floor(s*10)/10;
  // lines per paragraph
  var used=0;paras.forEach(function(pa){pa.L=wrapCount(pa.ws,Wm,s,GAP);used+=pa.L});
  var lastPa=paras[paras.length-1];
  if(lastPa&&!lastPa.endsSura&&used<T){var extra=T-used;lastPa.L=Math.min(lastPa.ws.length,lastPa.L+extra)}
  var html='',rowsMeta=[];
  seq.forEach(function(it){
    if(it.k==='h')html+='<div class="ml hd"><span>سورة '+esc(QD().n[it.c-1])+'</span></div>';
    else if(it.k==='b')html+='<div class="ml bs"><span>'+(tj?wtjBsm():esc(warshFix(D.b)))+'</span></div>';
    else{
      var cuts=balanceLines(it.ws,Wm,s,GAP,it.L,it.endsSura)||balanceLines(it.ws,Wm,s,GAP,wrapCount(it.ws,Wm,s,GAP),it.endsSura)||[[0,it.ws.length]];
      cuts.forEach(function(ct,idx){
        var free=it.endsSura&&idx===cuts.length-1;
        html+='<div class="ml wln'+(free?' wfree':'')+'"><div class="mi">'+it.units.slice(ct[0],ct[1]).map(function(u){return '<span class="mw"'+(u.cv?' data-v="'+u.cv+'"':'')+'>'+u.html+'</span>'}).join('')+'</div></div>';
      });
    }
  });
  L.innerHTML=html;
  L.style.display='flex';L.style.flexDirection='column';L.style.justifyContent='flex-start';L.style.fontSize=s+'px';
  [].slice.call(L.children).forEach(function(k){k.style.flex='0 0 '+rowH+'px';k.style.height=rowH+'px';k.style.minHeight='0';k.style.lineHeight='1.1'});
  [].slice.call(L.querySelectorAll('.wln')).forEach(function(r){
    var mi=r.firstChild;mi.style.cssText='display:flex;flex:none;max-width:none;gap:'+GAP+'em;transform:none';
    var free=r.classList.contains('wfree');
    if(free||mi.children.length<2){mi.style.width='max-content';mi.style.justifyContent='center'}
    else{mi.style.width='100%';mi.style.justifyContent='space-between'}
    var nat=mi.scrollWidth;
    if(nat>W+1){
      /* السطر أعرض من الصفحة: نجعله بعرض محتواه ونوسّطه ثم نضغطه حول مركزه، فلا يميل لليسار (فيض RTL يذهب لليسار) */
      mi.style.width='max-content';mi.style.justifyContent='center';mi.style.transformOrigin='50% 50%';
      nat=mi.scrollWidth;
      mi.style.transform='scaleX('+Math.min(1,(W/nat)).toFixed(4)+')';
    }
  });
}
/* Shell space only. Keep all Mushaf rows, pagination and fitting algorithms intact. */
function readerShellInsets(){
  if(!document.body.classList.contains('rdi'))return;
  var ov=document.getElementById('rd-ov'),head=document.querySelector('#rd-ov .rd-t'),foot=document.querySelector('#rd-ov .rd-b');
  if(!head||!foot)return;
  var hidden=ov&&ov.classList.contains('hd-hide');
  app.style.setProperty('padding-top',(hidden?4:Math.ceil(head.getBoundingClientRect().height))+'px','important');
  document.body.style.setProperty('padding-bottom',(Math.ceil(foot.getBoundingClientRect().height)+6)+'px','important');
}
function fitReader(force){
  var mp=document.getElementById('mp');if(!mp)return;
  readerShellInsets();
  if(mp.classList.contains('mpi')){try{sizeMpi(mp);mpiAfter(mp)}catch(e){}return}
  try{sizeMp(mp);if(isW())fitWarsh(mp)}
  finally{var L=mp.querySelector('.mp-l');if(L&&(force||fontReady()))L.style.visibility='visible';try{mpApplySel()}catch(e){}}
}
function fitSoon(){
  fitReader(false);
  if(document.fonts&&document.fonts.load){var t=++fitTok;document.fonts.load('40px KFGQPC','بسم').then(function(){if(t===fitTok)fitReader(false)},function(){})}
  setTimeout(function(){fitReader(false)},400);setTimeout(function(){fitReader(true)},1200);
}
