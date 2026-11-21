function vQuran(){
  var D=QD(),k=dk(),pg=qPages(k),goal=S.quran.goal,pos=S.quran.pos,to=Math.min(604,pos+goal-1),total=0;
  if(!curP().length)return '<section class="card"><p class="no">تعذر تحميل نص المصحف.</p></section>';
  Object.keys(S.quran.log).forEach(function(d){total+=S.quran.log[d]||0});
  var khatmas=Math.floor(total/QURAN_PAGES),prog=Math.round((total%QURAN_PAGES)/QURAN_PAGES*100),done=pg>=goal;
  var idx=showIdx?'<section class="card"><h3>فهرس السور</h3><div class="sidx">'+D.n.map(function(nm,i){return '<button class="srow" data-a="qopen" data-v="'+suraPage(i+1)+'"><span class="no">'+ar(i+1)+'</span><span class="nm">سورة '+esc(nm)+'</span><small>ص '+ar(suraPage(i+1))+'</small></button>'}).join('')+'</div></section>':'';
  return '<div class="qhero">'+sceneBook()+'</div>'
  +riwSwitch()
  +(S.quran.last?'<button class="lrow" data-a="qopen" data-v="'+S.quran.last+'">'+ic('book')+'<span class="t">تابع من حيث توقفت<small class="muted">صفحة '+ar(S.quran.last)+' · سورة '+esc(pageSura(S.quran.last))+'</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>':'')
    +'<section class="card"><h3>وردك اليومي</h3>'
  +'<p class="note" style="text-align:center;margin-bottom:4px">'+(pos===to?'صفحة '+ar(pos):'من صفحة '+ar(pos)+' إلى '+ar(to))+' · سورة '+esc(pageSura(pos))+'</p>'
  +'<div class="bar"><div style="width:'+Math.min(100,Math.round(pg/goal*100))+'%"></div></div>'
  +'<p class="note" style="text-align:center;margin:8px 0 12px">'+(done?'أتممت وردك اليوم، بارك الله فيك ('+ar(pg)+' صفحة).':'قرأت اليوم '+ar(pg)+' من '+ar(goal)+' '+(goal<11?'صفحات':'صفحة')+'.')+'</p>'
  +'<button class="btn block" data-a="qstart">'+ic('book')+(done?'اقرأ المزيد':'ابدأ القراءة')+'</button>'
  +'<div class="row" style="justify-content:center;margin-top:10px"><button class="btn ghost" data-a="qgoal" data-v="-1">'+ic('minus')+'الورد</button><button class="btn ghost" data-a="qgoal" data-v="1">'+ic('plus')+'الورد</button></div></section>'
  +'<button class="lrow" data-a="showidx" style="margin:12px 0">'+ic('doc')+'<span class="t">فهرس السور<small class="muted">اختر سورة وابدأ القراءة منها</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'+idx
  +khatmaEta(total)+'<section class="card"><div class="rateline"><div><h3 style="margin:0">تقدّم الختمة</h3><small>'+ar(total)+' صفحة مقروءة'+(khatmas?' · '+ar(khatmas)+' ختمة مكتملة':'')+'</small></div><b>'+ar(prog)+'%</b></div><div class="bar"><div style="width:'+prog+'%"></div></div></section>'
  +'<section class="card flat"><h3>قرأت من مصحف ورقي؟</h3><div class="step" style="margin:0"><button class="ib" data-a="qsub" aria-label="إنقاص">'+ic('minus')+'</button><b style="font-size:26px">'+ar(pg)+'</b><button class="ib" data-a="qadd" aria-label="إضافة صفحة">'+ic('plus')+'</button></div><p class="note" style="text-align:center;margin:0">سجّل عدد الصفحات يدوياً.</p></section>'
  ;
}
