function secLevel(){var bio=!!(S.biometric&&S.biometric.enabled),has=!!S.pin;return has?(bio?3:(((S.security||{}).method==='password')?3:2)):0}
function secLevelLabel(){var l=secLevel();return ['غير محمي','','محمي','محمي بقوة'][l]||'غير محمي'}
function pwScore(v){var n=0;if(!v)return 0;if(v.length>=8)n++;if(v.length>=12)n++;if(/[a-z]/.test(v)&&/[A-Z]/.test(v))n++;if(/\d/.test(v)&&/[^\d]/.test(v))n++;if(/[^\w\s]/.test(v))n++;return Math.min(4,n)}
function secPanel(M){
  var l=secLevel(),bio=!!(S.biometric&&S.biometric.enabled),meth=(S.security&&S.security.method)||'pin',has=!!S.pin;
  var pct=[8,0,66,100][l]||8,txt=has?(l===3?'حماية قوية':'حماية جيدة'):'التطبيق غير محمي',sub=has?('الطريقة: '+(meth==='password'?'كلمة مرور':'رمز PIN')+(bio?' + بصمة':'')+' · القفل '+lockDelayLabel()):'فعّل رمزًا أو كلمة مرور لحماية عباداتك وملاحظاتك.';
  var h='<section class="card sec2">'
   +'<div class="sec2-hero l'+l+'"><div class="sec2-ring" style="--p:'+pct+'"><span>'+ic('shield')+'</span></div><div><h3>'+txt+'</h3><p>'+sub+'</p></div></div>'
   +(secOk?'<p class="sec-msg ok">'+esc(secOk)+'</p>':'')
   +'<div class="rm-sect"><span>طريقة الحماية</span></div><div class="sec2-grid">'
   +'<button class="sec2-m'+(has&&meth==='pin'?' on':'')+'" data-a="secchoose" data-v="pin"><i>▦</i><b>رمز PIN</b><small>أربعة أرقام</small><em>'+(has&&meth==='pin'?'مفعّل':'اختيار')+'</em></button>'
   +'<button class="sec2-m'+(has&&meth==='password'?' on':'')+'" data-a="secchoose" data-v="password"><i>⌑</i><b>كلمة مرور</b><small>8 خانات أو أكثر</small><em>'+(has&&meth==='password'?'مفعّل':'اختيار')+'</em></button>'
   +(bPlug()?'<button class="sec2-m'+(bio?' on':'')+'" data-a="secchoose" data-v="bio"><i>'+ic('fingerprint')+'</i><b>البصمة</b><small>'+(bioUsable()?'فتح سريع':'غير جاهزة')+'</small><em>'+(bio?'مفعّلة':'تفعيل')+'</em></button>':'')
   +'</div>';
  if(secStage==='setup')h+='<div class="sec-sheet"><h3>'+(secMethod==='pin'?'إعداد رمز PIN':'إعداد كلمة المرور')+'</h3>'+(S.pin?'<label>أدخل وسيلة الحماية الحالية أولاً</label><input type="password" id="secold" placeholder="الرمز أو كلمة المرور الحالية">':'<p class="note">أنشئ وسيلة الحماية الجديدة.</p>')+'<input type="password" id="secnew" '+(secMethod==='pin'?'inputmode="numeric" maxlength="4"':'')+' placeholder="'+(secMethod==='pin'?'أدخل 4 أرقام':'حروف وأرقام (8 خانات على الأقل)')+'">'+(secMethod==='password'?'<div class="pw-meter" id="pwmeter"><i></i><i></i><i></i><i></i><span id="pwtxt">قوة كلمة المرور</span></div>':'')+'<input type="password" id="secconfirm" '+(secMethod==='pin'?'inputmode="numeric" maxlength="4" placeholder="أعد إدخال PIN"':'placeholder="أعد إدخال كلمة السر"')+' autocomplete="new-password"><p class="sec-msg" id="secmsg" role="alert" aria-live="polite"></p><button class="btn block" data-a="secSave">حفظ إعدادات الحماية</button><button class="btn ghost block" data-a="secCancel">إلغاء</button></div>';
  h+='<div class="rm-sect"><span>متى يُقفل بعد مغادرته؟</span></div><div class="chips">'+[[0,'فورًا'],[30,'٣٠ ثانية'],[60,'دقيقة'],[300,'٥ دقائق']].map(function(x){return '<button class="chip'+(lockDelayVal()===x[0]?' on':'')+'" data-a="lockdelay" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'
   +'<div class="rm-sect"><span>الخصوصية</span></div>'
   +'<div class="rm-row'+(S.privName?' on':'')+'" style="margin:6px 0"><div class="rm-tx"><b>إخفاء الاسم والصورة</b><small>تظهر الرئيسية بلا اسمك وصورتك عند فتحها أمام الآخرين</small></div><label class="rm-sw"><input type="checkbox" data-sec="privName" '+(S.privName?'checked':'')+'><i></i></label></div>';
  if(has)h+='<button class="sec2-off" data-a="secDisable">'+ic('lock')+'<span>إلغاء قفل التطبيق</span></button>';
  if(secStage==='disable')h+='<div class="sec-sheet"><h3>تأكيد إلغاء الحماية</h3><p class="note">أدخل وسيلة الحماية الحالية لإيقاف القفل. لن تُحذف بياناتك.</p><input type="password" id="secdisableold" autocomplete="current-password" placeholder="PIN أو كلمة المرور الحالية"><p class="sec-msg" id="secdisablemsg" role="alert" aria-live="polite"></p><button class="btn block" data-a="secConfirmDisable">تحقق وإلغاء القفل</button><button class="btn ghost block" data-a="secCancel">تراجع</button></div>';
  return h+'<p class="note" style="margin-top:12px">تغيير وسيلة الحماية أو إلغاؤها يتطلب التحقق من الوسيلة الحالية. بياناتك لا تُحذف.</p>'+M+'</section>';
}
