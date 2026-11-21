function vPrayers(){
  var k=dk(),p=S.prayers[k]||{};
  var wkRate=0,cnt=0;for(var i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-i);var pp=S.prayers[dk(d)]||{};PR.forEach(function(x){if(pp[x[0]])cnt++})}
  wkRate=Math.round(cnt/35*100);
  autoPtimes();
  return '<div class="scene">'+sceneSunset()+'<div class="pillday">'+esc(dateLabel())+' · اليوم</div></div>'
  +ptSummary()
  +'<div class="cl">'+PR.map(function(x){var on=!!p[x[0]],tv=S.ptimes[x[0]]||'';
    return '<div class="cli'+(on?' on':'')+'"><span class="nm">'+x[1]+'</span><label class="tmw">'+ic('clock')+'<span>'+(tv?ptFmt(tv):'ضبط الوقت')+'</span><input type="time" data-pt="'+x[0]+'" value="'+esc(tv)+'" aria-label="موعد '+x[1]+'"></label><button class="ck" data-a="pray" data-v="'+x[0]+'" aria-label="'+x[1]+'" aria-pressed="'+on+'">'+ic('check')+'</button></div>'}).join('')+'</div>'
  +'<p class="note" style="margin-top:10px">يمكنك ضبط موعد كل صلاة بالضغط على الوقت بحسب مدينتك، وتُحفظ المواعيد على جهازك.</p>'
  +'<section class="card"><div class="rateline"><div><h3 style="margin:0">معدل الالتزام الأسبوعي</h3><small>آخر ٧ أيام</small></div><b>'+wkRate+'%</b></div><div class="bar"><div style="width:'+wkRate+'%"></div></div></section>';
}

/* ملخّص صغير في شاشة الصلوات + زر إلى شاشة الموقع والمواقيت المنفصلة */
function ptSummary(){
  var L=S.loc||{},ok=false;try{ok=locOk()}catch(e){}
  var t=null;try{t=ok?ptToday():null}catch(e){}
  var nx='';if(t){nx='<div class="pt-grid">'+[['fajr','الفجر'],['sunrise','الشروق'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']].map(function(x){return '<div><small>'+x[1]+'</small><b>'+(t[x[0]]?ptFmt(t[x[0]]):'—')+'</b></div>'}).join('')+'</div>'}
  return '<section class="card pt-sum"><div class="pt-sum-h"><div><b>'+(ok?esc(L.city||'موقعي'):'لم يُحدَّد الموقع')+'</b><small>'+(ok?'مواقيت اليوم':'حدّد موقعك لتظهر المواقيت التلقائية')+'</small></div><button class="btn ghost" data-a="tab" data-v="ptloc">'+ic('gear')+' الموقع والمواقيت</button></div>'+nx+'</section>';
}
function vPtLoc(){return locCard()}
