/* ===== زر «+» (على الحافة اليسرى، باهت) → مهام سريعة، ويمكن للمستخدم إضافة مهامه ===== */
var QA=[['tab','msb','beads','تسبيح'],['adkopen','AUTO','sparkles','أذكار الوقت'],['tab','quran','book','ورد القرآن'],['tab','prayers','mosque','صلواتي'],['qworship','','plus','عبادة جديدة'],['tab','muh','check','محاسبة النفس'],['tab','boost','sos','أشعر برغبة']];
var qEdit=false,qPick=false;
/* شاشات يمكن إضافتها كمهمة سريعة: [المعرّف، الأيقونة] — الاسم من TITLES */
var QX=[['hisn','beads'],['asma','star'],['worship','sparkles'],['tasbih','beads'],['reader','book'],['khatma','book'],['hifz','book'],['fasting','moon'],['habits','target'],['chal','target'],['month','chart'],['weekly','chart'],['notes','pen'],['qada','check'],['zakat','chart'],['ramadan','moon'],['occasions','cal'],['reminders','bell'],['ach','trophy'],['backup','cloud'],['settings','gear']];
function qxList(){var a=S.qx;return Array.isArray(a)?a.filter(function(id){return TITLES[id]}):[]}
function qfabSync(){
  var f=document.getElementById('qfab');
  if(!f){f=document.createElement('button');f.id='qfab';f.className='qfab';f.type='button';f.setAttribute('aria-label','مهام سريعة');f.innerHTML=ic('plus');f.addEventListener('click',qsheetToggle);document.body.appendChild(f)}
  var show=!tabs.hidden&&!splash&&unlocked&&S.onboarded&&!homeEdit&&!covered;
  f.hidden=!show;if(!show)qsheetClose();
}
function qsheetClose(){var o=document.getElementById('qsheet');if(o)o.remove();qEdit=false;qPick=false;var f=document.getElementById('qfab');if(f)f.classList.remove('open')}
function qtile(x,i,custom){
  return '<button class="qs-t" style="--i:'+i+'" data-q="go" data-a0="'+x[0]+'" data-v0="'+x[1]+'"><span>'+ic(x[2])+'</span><b>'+esc(x[3])+'</b>'+(custom&&qEdit?'<i class="qs-x" data-q="del" data-id="'+x[1]+'">✕</i>':'')+'</button>';
}
function qsheetHtml(){
  var c='<div class="qs-back" data-q="close"></div><section class="qs-card" role="dialog" aria-label="مهام سريعة">';
  if(qPick){
    var have=qxList(),L=QX.filter(function(x){return have.indexOf(x[0])<0&&TITLES[x[0]]});
    return c+'<h3>اختر شاشة تضيفها لمهامك<button class="qs-ed" data-q="pickx">رجوع</button></h3><div class="qs-pick">'+(L.length?L.map(function(x){return '<button class="qs-pk" data-q="addx" data-id="'+x[0]+'">'+ic(x[1])+'<span>'+esc(TITLES[x[0]])+'</span></button>'}).join(''):'<p class="note">أضفت كل الشاشات المتاحة.</p>')+'</div></section>';
  }
  var cu=qxList().map(function(id){var q=QX.filter(function(x){return x[0]===id})[0];return ['tab',id,q?q[1]:'star',TITLES[id]]});
  var i=0,g=QA.map(function(x){return qtile(x,i++,false)}).join('')+cu.map(function(x){return qtile(x,i++,true)}).join('');
  g+='<button class="qs-t add" style="--i:'+i+'" data-q="pickx"><span>'+ic('plus')+'</span><b>إضافة مهمة</b></button>';
  return c+'<h3>مهام سريعة'+(cu.length?'<button class="qs-ed" data-q="edit">'+(qEdit?'تم':'تعديل')+'</button>':'')+'</h3><div class="qs-grid">'+g+'</div></section>';
}
function qsheetPaint(){var d=document.getElementById('qsheet');if(d)d.innerHTML=qsheetHtml()}
function qsheetToggle(){
  if(document.getElementById('qsheet')){qsheetClose();return}
  var d=document.createElement('div');d.id='qsheet';d.className='qsheet';d.innerHTML=qsheetHtml();
  document.body.appendChild(d);document.getElementById('qfab').classList.add('open');
}
function qdo(a,v){
  var b=document.createElement('button');b.setAttribute('data-a',a);b.setAttribute('data-v',v);b.style.display='none';document.body.appendChild(b);b.click();b.remove();
}
document.addEventListener('click',function(e){
  var t=e.target.closest&&e.target.closest('[data-q]');if(!t)return;
  var k=t.getAttribute('data-q');
  if(k==='close'){qsheetClose();return}
  if(k==='edit'){qEdit=!qEdit;qsheetPaint();return}
  if(k==='pickx'){qPick=!qPick;qEdit=false;qsheetPaint();return}
  if(k==='addx'){var id=t.getAttribute('data-id');if(!Array.isArray(S.qx))S.qx=[];if(S.qx.indexOf(id)<0&&S.qx.length<12){S.qx.push(id);save()}qPick=false;qsheetPaint();return}
  if(k==='del'){e.stopPropagation();var d=t.getAttribute('data-id');S.qx=qxList().filter(function(x){return x!==d});save();if(!S.qx.length)qEdit=false;qsheetPaint();return}
  if(k==='go'){
    if(qEdit)return;
    var a=t.getAttribute('data-a0'),v=t.getAttribute('data-v0');qsheetClose();
    /* «عبادة جديدة»: ندخل مباشرة إلى «عباداتي اليوم» دون نوافذ وسيطة */
    if(a==='qworship'){qdo('tab','worship');window.scrollTo(0,0);return}
    if(v==='AUTO'){var h=new Date().getHours();v=(h>=4&&h<14)?'morning':(h>=14&&h<21)?'evening':'sleep'}
    qdo(a,v);
  }
});
