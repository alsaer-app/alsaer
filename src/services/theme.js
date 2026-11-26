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
  try{if(window.mcThemeSend)setTimeout(mcThemeSend,0)}catch(e){}
  var L=lang();r.setAttribute('lang',L);r.setAttribute('dir',langDir());try{document.title=(lang()==='ar')?'السائر':(trS('السائر')||'Al-Sa\'ir ila Allah')}catch(e){}
}

/* ألوان بطاقة الإشعار/شاشة القفل تتبع الثيم الفعلي (يقرؤها MediaPlaybackService) */
function mcThemeSend(){
  try{
    var N=window.AlsaerNative;if(!N||!N.mediaTheme)return;
    var r=document.documentElement,cs=getComputedStyle(r),g=function(n){return cs.getPropertyValue(n).trim()},dk=r.getAttribute('data-theme')!=='light';
    var hx=function(v){return /^#[0-9a-f]{6}$/i.test(v)?v:''};
    var bg=hx(dk?g('--surface-2'):g('--brand-2'))||(dk?'#143238':'#00535F');
    var ac=hx(dk?g('--gold'):mix(hx(g('--brand'))||'#017D84','#ffffff',.75))||'#5FCFC1';
    var lum=function(h){var c=[1,3,5].map(function(i){return parseInt(h.substr(i,2),16)/255});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
    var fg=dk?(hx(g('--fg'))||'#F2F2F5'):'#FFFFFF',on=lum(ac)>.5?'#10141A':'#FFFFFF';
    var k=[bg,fg,ac,on].join();if(k===window.__mct)return;window.__mct=k;
    N.mediaTheme(bg,fg,ac,on)}catch(e){}}
window.mcThemeSend=mcThemeSend;
applyUI();
try{mcThemeSend();setTimeout(mcThemeSend,1500)}catch(e){}
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
