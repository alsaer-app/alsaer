function verseText(c,v){
  var t=QD().s[c-1][v-1];
  if(v===1&&c!==1&&c!==9){ // مصدر النص يُلحق البسملة بأول آية؛ تُعرض مرة واحدة في ترويسة السورة
    var w=t.split(' '),n=w.slice(0,4).join(' ').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/\u0671/g,'\u0627');
    if(n==='\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645'&&w.length>4)return w.slice(4).join(' ');
  }
  return t;
}

var TJL=[['غنّة · إخفاء · إقلاب',0],['حرف لا يُنطق · إدغام',1],['مد لازم ٦',2],['مد واجب · جائز',3],['مد طبيعي · عارض',4],['قلقلة',5]];
function mTok(t){
  var h='',o=false,i,c,n;
  for(i=0;i<t.length;i++){c=t.charCodeAt(i);
    if(c>=0xe000&&c<=0xe005){if(o)h+='</i>';h+='<i class="t'+(c-0xe000)+'">';o=true}
    else if(c===0xe0ff){if(o)h+='</i>';o=false}
    else if(c===0xe0f0){}
    else h+=esc(t.charAt(i));
  }
  return h+(o?'</i>':'');
}
function mLine(l){
  if(l[0]==='h'){mpSt.c=+l[1];mpSt.v=1}
  if(l[0]==='h')return '<div class="ml hd"><span>سورة '+esc(QD().n[l[1]-1])+'</span></div>';
  if(l[0]==='b')return '<div class="ml bs"><span>'+esc(QD().s[0][0])+'</span></div>';
  return '<div class="ml"><div class="mi">'+l[1].split(' ').map(function(t){var a=mpVAttr(t);return '<span class="mw"'+a+'>'+mTok(t)+'</span>'}).join('')+'</div></div>';
}
function vReader(){
  var MU=window.MUSHAF;
  if(rd&&isW())return vWarshReader();
  if(rd&&!MU){try{loadHeavy()}catch(e){}return '<section class="card"><p class="note">جارٍ تجهيز المصحف…</p></section>'}
  if(!rd||!MU)return '<section class="card"><p class="note">لا توجد جلسة قراءة.</p><button class="btn block" data-a="goback" data-v="home">رجوع</button></section>';
  var p=rd.page,pg=MU.p[p-1],m=MU.m[p-1],atEnd=p>=rd.to,n=p-rd.from+1,tj=S.quran.tj!==false;
  var dir=rd.dir;rd.dir=0;S.quran.last=p;
  var inR=(p>=rd.from&&p<=rd.to),lg=tj?'<div class="tjl">'+TJL.map(function(x){return '<span><i class="t'+x[1]+'"></i>'+x[0]+'</span>'}).join('')+'</div>':'';
  var useImg=mpiOnFor(p);
  var mainH=useImg?mpiMain(p,m):'<div class="mp'+(tj?'':' notj')+'" id="mp"><div class="mp-in'+(dir?' pt'+(dir>0?'n':'p'):'')+'">'
  +'<div class="mp-h"><span>الجزء '+ar(m[0])+' · حزب '+ar(m[1])+'</span><span class="sb">'+esc(QD().n[m[2]-1])+'</span></div>'
  +'<div class="mp-l" style="visibility:hidden">'+(useImg?'':(mpInit(p),pg.map(mLine).join('')))+'</div>'
  +'<div class="mp-f"><span class="pn">'+ar(p)+'</span></div></div></div>';
  var ctlH='<div class="rbar"><button class="ib bm" data-a="bmtog" aria-label="علامة" aria-pressed="'+bmHas(rd&&rd.page)+'">'+(bmHas(rd&&rd.page)?'★':'☆')+'</button><button class="ib" data-a="qpage" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'</button>'
  +'<div class="rmid"><b>'+(inR?ar(n)+' / '+ar(rd.to-rd.from+1):'ص '+ar(p))+'</b><small>'+(inR?'من وردك':'تصفّح حر')+'</small></div>'
  +'<button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button>'
  +'<button class="ib" data-a="qpage" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+ic('chev')+'</button></div>'
  +(useImg?'':lg)
  +'<div class="fsz"><button class="ib" data-a="mpset">'+ic('gear')+'المصحف</button><button class="ib" data-a="qjump" aria-pressed="'+!!rd.jump+'">'+ic('search')+'انتقال</button><button class="ib" data-a="qtj" aria-pressed="'+tj+'">التجويد</button><button class="ib" data-a="qwird">'+ic('flag')+'الورد والرواية</button>'+'</div>'+(rd.jump?mpJump(p):'');
  return mpWrap(mainH,ctlH,p,m);
}
