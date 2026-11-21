function remItems(){
  var k=dk(),p=S.prayers[k]||{},out=[];
  var np=PR.filter(function(x){return !p[x[0]]})[0];
  if(np)out.push({t:'prayer',id:np[0],name:np[1]});
  if(qPages(k)<S.quran.goal)out.push({t:'quran'});
  return out;
}
function vReminders(){
  var it=remItems(),h='',k=dk(),fr=S.fasting.reminders,up=nextFastingDays(3),todayFast=fastingReasons(new Date()),now=new Date(),nowMin=now.getHours()*60+now.getMinutes();
  function within(time,windowM){if(!time||!/^\\d{2}:\\d{2}$/.test(time))return false;var p=time.split(':').map(Number),m=p[0]*60+p[1];return nowMin>=m&&nowMin<=m+windowM}
  if(fr.enabled&&todayFast.length&&fr.suhoor&&within(fr.suhoorTime,120))h+='<section class="card rem fast-alert"><span class="ri">'+ic('moon')+'</span><div style="flex:1"><h4>تذكير السحور</h4><p class="note">هذا أحد أيام الصيام التي اخترتها. جهّز سحورك واضبط نيتك.</p><button class="btn good" data-a="tab" data-v="fasting">فتح جدول الصيام</button></div></section>';
  if(fr.enabled&&todayFast.length&&fr.iftar&&within(fr.iftarTime,120))h+='<section class="card rem fast-alert"><span class="ri">'+ic('sun')+'</span><div style="flex:1"><h4>تذكير الإفطار</h4><p class="note">حان وقت الإفطار بحسب الموعد الذي حددته. لا تنسَ الدعاء.</p><button class="btn good" data-a="tab" data-v="fasting">تسجيل إتمام الصيام</button></div></section>';
  if(fr.enabled&&fr.beforeDay&&up.length){
    var tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
    var tom=up.filter(function(x){return x.date===dk(tomorrow)});
    if(tom.length)h+='<section class="card rem fast-alert"><span class="ri">'+ic('moon')+'</span><div style="flex:1"><h4>تذكير بصيام الغد</h4><p class="note">'+esc(tom[0].reasons.join(' · '))+'</p><div class="acts"><button class="btn good" data-a="tab" data-v="fasting">عرض جدول الصيام</button><button class="btn ghost" data-a="fastdismiss">إخفاء</button></div></div></section>';
    else if(up[0])h+='<section class="card rem fast-alert"><span class="ri">'+ic('cal')+'</span><div style="flex:1"><h4>موعد الصيام القادم</h4><p class="note">'+esc(up[0].day+' · '+up[0].date+' · '+up[0].reasons.join('، '))+'</p><button class="btn ghost" data-a="tab" data-v="fasting">إدارة الصيام</button></div></section>';
  }
  it.forEach(function(x){
    if(x.t==='prayer')h+='<section class="card rem"><span class="ri">'+ic('mosque')+'</span><div style="flex:1"><h4>تذكير بالصلاة</h4><p class="note" style="margin:0">لم تسجّل صلاة '+x.name+' بعد. إن صلّيتها فسجّلها الآن.</p><div class="acts"><button class="btn good" data-a="pray" data-v="'+x.id+'">'+ic('check')+'تمت</button><button class="btn ghost" data-a="tab" data-v="prayers">الصلوات</button></div></div></section>';
    else h+='<section class="card rem"><span class="ri">'+ic('book')+'</span><div style="flex:1"><h4>متابعة ورد القرآن</h4><p class="note" style="margin:0">وردك اليوم '+ar(S.quran.goal)+' '+(S.quran.goal<11?'صفحات':'صفحة')+'، وقرأت '+ar(qPages(k))+'. هل تقرأ الآن؟</p><div class="acts"><button class="btn good" data-a="qstart">'+ic('book')+'ابدأ القراءة</button><button class="btn ghost" data-a="tab" data-v="quran">القرآن</button></div></div></section>'
  });
  var gh=allHabits(),hb=(S.habits||{})[k]||{},left=gh.filter(function(x){return !hb[x[0]]});
  if(left.length)h+='<section class="card rem"><span class="ri">'+ic('leaf')+'</span><div style="flex:1"><h4>متابعة عاداتك الحسنة</h4><p class="note">باقي '+left.length+' عادات لم تسجلها اليوم.</p><button class="btn good" data-a="tab" data-v="habits">متابعة العادات</button></div></section>';
  if(!h)h='<section class="card rem"><span class="ri">'+ic('leaf')+'</span><div style="flex:1"><h4>أحسنت</h4><p class="note">لا توجد تذكيرات معلّقة الآن. تقبّل الله منك.</p></div></section>';
  h+='<section class="card"><h3>مركز التنبيهات التفاعلي</h3><p class="note">تظهر هنا تذكيرات الصيام والصلوات والقرآن والعادات، ويمكنك الانتقال مباشرة إلى الإجراء المناسب.</p><button class="btn block" data-a="tab" data-v="fasting">إعداد تذكيرات الصيام</button><button class="btn ghost block" data-a="tab" data-v="habits">متابعة العادات</button></section>';
  return h;
}
