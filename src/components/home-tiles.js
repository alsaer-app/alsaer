var ART_KAHF='<svg viewBox="0 0 160 92" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="gk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d98a"/><stop offset=".55" stop-color="#e9a65a"/><stop offset="1" stop-color="#8a4f3a"/></linearGradient></defs><rect width="160" height="92" fill="url(#gk)"/><circle cx="118" cy="26" r="13" fill="#fff6cf" opacity=".9"/><path d="M0 92V60l22-18 16 12 24-30 28 34 20-14 26 22 24-12v38z" fill="#5a3a30"/><path d="M0 92V74l30-14 22 10 30-16 26 16 28-8 24 12v18z" fill="#3b2621"/><path d="M62 92V70q0-18 18-18t18 18v22z" fill="#1c110f"/><path d="M71 92V74q0-10 9-10t9 10v18z" fill="#f2c25c" opacity=".55"/></svg>';
var ART_MULK='<svg viewBox="0 0 160 92" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1a3d"/><stop offset="1" stop-color="#2d3f86"/></linearGradient></defs><rect width="160" height="92" fill="url(#gm)"/><g fill="#fff"><circle cx="20" cy="14" r="1.2"/><circle cx="52" cy="28" r="1"/><circle cx="96" cy="12" r="1.3"/><circle cx="130" cy="40" r="1"/><circle cx="144" cy="12" r="1.2"/><circle cx="74" cy="44" r=".9"/></g><path d="M118 14a14 14 0 1 0 12 22a11 11 0 1 1-12-22z" fill="#ffe9a8"/><path d="M0 92V74h22V62q0-8 8-8t8 8v12h18V68l10-10 10 10v6h14V50q0-14 10-22 10 8 10 22v24h22V66l8-8 8 8v26z" fill="#0a1230"/><circle cx="90" cy="26" r="2" fill="#ffe9a8"/><path d="M89.5 30h1v10h-1z" fill="#ffe9a8"/></svg>';
var TILE_DEF={fajr:'04:30',dhuhr:'12:00',asr:'15:30',maghrib:'18:00',isha:'19:30'};
function pHM(id){var v=(S.ptimes&&S.ptimes[id])||TILE_DEF[id];return /^\d{1,2}:\d{2}$/.test(v)?v:TILE_DEF[id]}
function pMin(id){var m=pHM(id).split(':');return (+m[0])*60+(+m[1])}
function pLab(id){return ptFmt(pHM(id))}
function groupDone(g,k){var grp=ADHKAR.filter(function(x){return x.id===g})[0],c=(S.counters&&S.counters[k])||{};return !!grp&&grp.items.every(function(it){return (c[it.id]||0)>=it.n})}
function glowState(now){
  now=now||new Date();
  var wd=now.getDay(),mins=now.getHours()*60+now.getMinutes(),k=dk(now),fa=pMin('fajr'),dh=pMin('dhuhr'),as=pMin('asr'),mg=pMin('maghrib'),is=pMin('isha'),SD=S.suraDone||{};
  var fk=(wd===5&&mins<mg)?k:((wd===4&&mins>=mg)?dk(new Date(now.getTime()+864e5)):null);
  var night=mins>=is||mins<fa,nk=mins<fa?dk(new Date(now.getTime()-864e5)):k;
  return {
    kahf:{on:!!fk,done:!!fk&&SD.kahf===fk},
    mulk:{on:night,done:night&&SD.mulk===nk},
    morning:{on:mins>=fa&&mins<dh,done:groupDone('morning',k)},
    evening:{on:mins>=as,done:groupDone('evening',k)}
  };
}
function glowSig(){var g=glowState();return ['kahf','mulk','morning','evening'].map(function(x){return (g[x].on?1:0)+''+(g[x].done?1:0)}).join('')}
function markSuraDone(c){
  var n=new Date(),wd=n.getDay(),mins=n.getHours()*60+n.getMinutes();S.suraDone=S.suraDone||{};
  if(c===18)S.suraDone.kahf=(wd===4&&mins>=pMin('maghrib'))?dk(new Date(n.getTime()+864e5)):dk(n);
  if(c===67)S.suraDone.mulk=(mins<pMin('fajr'))?dk(new Date(n.getTime()-864e5)):dk(n);
  save();
}
function suraTile(c,cls,name,cap,st,info){var blink=st.on&&!st.done;return '<button class="sura-tile '+cls+(blink?' blink':'')+(st.done?' done':'')+'" data-a="qsura" data-v="'+c+'" aria-label="'+name+' — '+cap+'"><span class="art">'+(cls==='kahf'?ART_KAHF:ART_MULK)+(st.done?'<span class="dn-badge">'+ic('check')+'</span>':'')+'</span><b>'+name+'</b><small>'+cap+'</small><em>'+info+'</em></button>'}
function adkTile(g,icon,label,st,info){var blink=st.on&&!st.done;return '<button class="tile adk-tile '+g+(blink?' blink':'')+(st.done?' done':'')+'" data-a="adkopen" data-v="'+g+'">'+ic(icon)+'<span>'+label+'</span><small>'+info+'</small></button>'}
var glowLast='';
function homeSpecialTiles(){
  var g=glowState();glowLast=glowSig();
  var ik=g.kahf.done?'✓ قرأتها هذه الجمعة':(g.kahf.on?'تُضاء الآن · حتى المغرب '+pLab('maghrib'):'تُضاء الخميس بعد المغرب');
  var im=g.mulk.done?'✓ قرأتها الليلة':(g.mulk.on?'تُضاء الآن · حتى الفجر '+pLab('fajr'):'تُضاء من العشاء '+pLab('isha'));
  var ia=g.morning.done?'✓ تمت اليوم':(g.morning.on?'حان وقتها · حتى الظهر '+pLab('dhuhr'):'من الفجر '+pLab('fajr'));
  var ie=g.evening.done?'✓ تمت اليوم':(g.evening.on?'حان وقتها · حتى الليل':'من العصر '+pLab('asr'));
  return '<div class="sura-tiles">'+suraTile('18','kahf','سورة الكهف','كل جمعة',g.kahf,ik)+suraTile('67','mulk','سورة الملك','كل ليلة',g.mulk,im)+'</div>'
   +'<div class="tiles adk-tiles">'+adkTile('morning','sun','أذكار الصباح',g.morning,ia)+adkTile('evening','moon','أذكار المساء',g.evening,ie)+'</div>';
}
setInterval(function(){
  try{if(document.hidden||tab!=='home'||!unlocked||splash)return;var ae=document.activeElement;if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))return;if(glowSig()!==glowLast)render()}catch(e){}
},30000);
/* تحميل ملفات المصحف الكبيرة عند الحاجة فقط (توفير بدء التشغيل والبطارية) */
