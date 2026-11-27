function tile(t,icon,label,sub){return '<button class="tile" data-a="tab" data-v="'+t+'">'+ic(icon)+'<span>'+label+'</span><small>'+sub+'</small></button>'}
function profileAvatar(size){
  var p=S.profile||{},sz=size||48;
  return (p.photo&&!S.privName)?'<img class="profile-photo" style="width:'+sz+'px;height:'+sz+'px" src="'+p.photo+'" alt="الصورة الشخصية">':(S.gender==='female'?avFemale():avMale());
}
function calendarToday(){
  var now=new Date(),greg=new Intl.DateTimeFormat('ar-EG-u-ca-gregory',{day:'numeric',month:'long',year:'numeric'}).format(now);
  var hijri='';
  try{hijri=new Intl.DateTimeFormat('ar-EG-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(now)}
  catch(e){try{hijri=new Intl.DateTimeFormat('ar-SA-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'}).format(now)}catch(_){hijri=''}}
  return {greg:greg,hijri:hijri};
}
function greetingNow(){
  var h=new Date().getHours(),morning=h>=0&&h<13,name=(S.profile&&S.profile.name||'').trim();
  return {text:(morning?'صباح الخير':'مساء الخير')+(name?' يا '+name:''),icon:morning?'sun':'moon',morning:morning};
}
function worshipHomeCard(full){
  var k=dk(),w=worshipDay(k),items=worshipItems(),points=worshipPoints(k),done=items.filter(function(x){return w[x[0]]===true}).length,total=items.length;
  var rows=items.map(function(x){var val=w[x[0]],yes=val===true,no=val===false;return '<div class="worship-row"><span class="worship-name'+(x[3]?' keepar':'')+'">'+ic(x[2])+esc(x[1])+'</span><div class="worship-actions"><button class="worship-choice yes '+(yes?'selected':'')+'" data-a="worship" data-v="'+x[0]+'" data-state="yes" aria-pressed="'+yes+'">'+(yes?ic('check'):'')+'فعلت</button><button class="worship-choice no '+(no?'selected':'')+'" data-a="worship" data-v="'+x[0]+'" data-state="no" aria-pressed="'+no+'">'+(no?ic('x'):'')+'لم أفعل</button></div>'+(x[3]?'<button class="worship-remove" data-a="delworship" data-v="'+x[0]+'" aria-label="حذف العبادة">×</button>':'')+'</div>'}).join('');
  var heading='<div class="worship-head"><div><span class="eyebrow">متابعة اليوم</span><h2>عباداتي اليوم</h2><p class="note">كل عبادة تُنجزها = نقطة واحدة</p></div><div class="worship-score"><b>'+points+'</b><small>من '+ar(total)+' نقطة</small></div></div><div class="bar"><div style="width:'+Math.round(points/Math.max(1,total)*100)+'%"></div></div>';
  if(!full)return '<section class="card worship-card worship-summary">'+heading+'<div class="worship-progress">'+done+' من '+ar(total)+' عبادة تم تسجيلها اليوم</div><button class="btn block worship-open" data-a="tab" data-v="worship">'+ic('sparkles')+'افتح عباداتي اليوم '+ic('chev')+'</button></section>';
  return '<section class="card worship-card">'+heading+'<div class="worship-progress">'+done+' من '+ar(total)+' عبادة تم تسجيلها اليوم</div><div class="worship-list">'+rows+'</div><div class="worship-add-area">'+(addingWorship?'<input id="new-worship-name" class="field" maxlength="60" placeholder="اكتب العبادة التي تريد إضافتها"><div class="row"><button class="btn good" data-a="saveworship">إضافة العبادة</button><button class="btn ghost" data-a="cancelworship">إلغاء</button></div>':'<button class="btn block" data-a="addworship">'+ic('plus')+' إضافة عبادة خاصة بي</button>')+'</div><p class="note worship-privacy">اختياراتك خاصة ومحفوظة على جهازك، ويمكنك تعديلها خلال اليوم.</p></section>';
}
