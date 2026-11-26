function applyUI(){
  var r=document.documentElement,u=U(),sid=pick(Object.keys(STY),u.style,'calm'),sd=STY[sid],mode=uiMode();
  var sysDark=!!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  var th=sd.dark?'dark':(mode==='system'?(sysDark?'dark':'light'):mode);
  r.setAttribute('data-theme',th);
  if(sid==='calm')r.removeAttribute('data-style');else r.setAttribute('data-style',sid);
  var A=ACC.filter(function(x){return x.id===u.accent})[0]||ACC[0];
  if(sid!=='calm'&&!u.accent){var sa={midnight:'blue',paper:'terracotta',royal:'gold',ocean:'ocean',lamsa:'lamsa',rose:'pink',fajr:'orange'}[sid];A=ACC.filter(function(x){return x.id===sa})[0]||A}
  r.style.setProperty('--ac-l',A.l);r.style.setProperty('--ac2-l',A.l2);r.style.setProperty('--ac-d',A.d);r.style.setProperty('--ac2-d',A.d2);
  r.style.setProperty('--ac-g',A.g||mix(A.d,'#ffffff',.5));
  var pr=function(k,v,def){if(v===def)r.removeAttribute(k);else r.setAttribute(k,v)};
  pr('data-look',pick(LOOKS,u.look,'classic'),'classic');pr('data-font',pick(FONTS,u.font,'plex'),'plex');
  pr('data-press',pick(PRESSES,u.press,'bounce'),'bounce');pr('data-trans',pick(TRANSES,u.trans,'rise'),'rise');
  if(u.fontW==='bold')r.setAttribute('data-fw','bold');else r.removeAttribute('data-fw');
  var L=lang();r.setAttribute('lang',L);r.setAttribute('dir',langDir());try{document.title=(lang()==='ar')?'السائر':(trS('السائر')||'Al-Sa\'ir ila Allah')}catch(e){}
}

applyUI();
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(uiMode()==='system')applyUI()})}catch(e){}
function setUI(k,v){U()[k]=v;if(k==='style'&&v!=='calm'&&STY[v]){delete U().accent}save();applyUI()}
function oBtn(act,val,cur,html,cls){return '<button class="'+(cls||'uo')+'" data-a="'+act+'" data-v="'+val+'" aria-pressed="'+(cur===val)+'">'+html+'</button>'}

/* اهتزاز خفيف جدًا عند لمس الأزرار والبطاقات (يمكن إيقافه: S.nohaptic=true) */
(function(){
  var last=0;
  document.addEventListener('click',function(e){
    try{
      if(typeof S!=='undefined'&&S&&S.nohaptic)return;
      var t=e.target&&e.target.closest&&e.target.closest('.btn,.tab,.tile,.chip,.ib,.lrow,[data-a]');
      if(!t)return;var n=Date.now();if(n-last<90)return;last=n;
      if(navigator.vibrate)navigator.vibrate(7);
    }catch(x){}
  },true);
})();
