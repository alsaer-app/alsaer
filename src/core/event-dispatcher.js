function handlePhotoInput(input){
  var file=input.files&&input.files[0];if(!file){toast('لم يتم اختيار صورة');return}
  toast('جارٍ تجهيز الصورة…');
  if(file.type&&!/^image\//.test(file.type)){toast('يرجى اختيار صورة صالحة');input.value='';return}
  if(file.size>20*1024*1024){toast('الصورة كبيرة، يرجى اختيار صورة أصغر من ٢٠ ميجابايت');input.value='';return}
  var reader=new FileReader();
  reader.onerror=function(){toast('لم نتمكن من قراءة الصورة، حاول اختيارها مرة أخرى');input.value=''};
  reader.onload=function(){
    var img=new Image();
    img.onerror=function(){toast('لم نتمكن من فتح الصورة، جرّب صورة بصيغة JPG أو PNG');input.value=''};
    img.onload=function(){
      try{
        /* صورة الملف الشخصي تظهر بحجم صغير؛ نخزن نسخة خفيفة جداً لتفادي امتلاء localStorage */
        var maxSide=144, scale=Math.min(1,maxSide/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
        var w=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));
        var h=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
        var canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
        if(!ctx){toast('لم نتمكن من تجهيز الصورة على هذا الجهاز');input.value='';return}
        var data='';
        for(var attempt=0;attempt<5;attempt++){
          canvas.width=w;canvas.height=h;
          ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
          ctx.drawImage(img,0,0,w,h);
          data=canvas.toDataURL('image/jpeg',attempt<2?.52:.42);
          if(data.length<=70000)break;
          w=Math.max(48,Math.round(w*.78));h=Math.max(48,Math.round(h*.78));
        }
        if(!data||data.length>100000){toast('لم نتمكن من تصغير الصورة، جرّب صورة أخرى');input.value='';return}
        S.profile=S.profile||{name:'',age:'',photo:''};
        S.profile.photo=data;
        saveNow();
        var raw=localStorage.getItem(KEY),verify=null;
        try{verify=raw?JSON.parse(raw):null}catch(ignore){}
        if(!verify||!verify.profile||verify.profile.photo!==data){
          toast('لم تُحفظ الصورة لامتلاء مساحة التخزين. يمكنك حذف بعض البيانات أو تجربة صورة أخرى.');
          input.value='';return;
        }
        /* حدّث كل أماكن الصورة فوراً مع الاحتفاظ بموضع الصفحة */
        var y=window.scrollY||document.documentElement.scrollTop||0;
        render();
        requestAnimationFrame(function(){window.scrollTo(0,y)});
        toast('تم حفظ الصورة الشخصية وتطبيقها');
      }catch(err){toast('لم تُحفظ الصورة، يرجى المحاولة مرة أخرى')}
      input.value='';
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
}
document.addEventListener('change',function(e){var i=e.target;if(i&&(i.id==='profile-photo'||i.id==='ob-photo'))handlePhotoInput(i)});

document.addEventListener('input',function(e){
  if(!e.target)return;
  if(e.target.id==='profile-name'||e.target.id==='profile-age'){
    var nm=document.getElementById('profile-preview-name'),ag=document.getElementById('profile-preview-age');
    if(nm)nm.textContent=e.target.id==='profile-name'?(e.target.value.trim()||'ملفك الشخصي'):(document.getElementById('profile-name')?.value.trim()||'ملفك الشخصي');
    if(ag)ag.textContent=(document.getElementById('profile-age')?.value?('العمر · '+document.getElementById('profile-age').value+' سنة'):'بياناتك الخاصة تظهر هنا بشكل أنيق');
  }
});
function secShow(t,cls){var el=document.getElementById('secmsg');if(!el)return;el.textContent=t||'';el.className='sec-msg'+(cls?' '+cls:'')}
document.addEventListener('input',function(e){
  var id=e.target&&e.target.id;if(id!=='secnew'&&id!=='secconfirm'&&id!=='secold')return;
  var isPin=secMethod==='pin';
  if(isPin&&e.target.value!==e.target.value.replace(/\D/g,''))e.target.value=e.target.value.replace(/\D/g,'');
  var nv=(document.getElementById('secnew')||{}).value||'',cv=(document.getElementById('secconfirm')||{}).value||'';
  if(id==='secold'){secShow('');return}
  if(!nv){secShow('');return}
  if(isPin&&nv.length<4){secShow('أدخل 4 أرقام (الآن '+nv.length+' من 4)','');return}
  if(!isPin&&nv.length<8){secShow('كلمة المرور قصيرة: '+nv.length+' من 8 خانات على الأقل','');return}
  if(!cv){secShow(isPin?'الآن أعد إدخال PIN للتأكيد':'الآن أعد إدخال كلمة المرور للتأكيد','');return}
  if(cv===nv){secShow(isPin?'✓ الرقمان متطابقان':'✓ كلمتا المرور متطابقتان','ok')}
  else if(cv.length<nv.length&&nv.indexOf(cv)===0){secShow('أكمل إعادة الإدخال…','')}
  else{secShow(isPin?'✗ الرقمان غير متطابقين':'✗ كلمتا المرور غير متطابقتين','err')}
});
document.addEventListener('click',async function(e){
  var b=e.target.closest('[data-a]');if(!b)return;
  if(b.classList.contains('tab')||b.classList.contains('btn')||b.classList.contains('tile')||b.classList.contains('ib')||b.classList.contains('lrow')||b.classList.contains('cli')||b.classList.contains('uo'))pressXY=[e.clientX,e.clientY],pressKey='[data-a="'+b.dataset.a+'"]'+(b.dataset.v!==undefined?'[data-v="'+b.dataset.v+'"]':'')+(b.classList.contains('tab')?'.tab':'');
  var a=b.dataset.a,v=b.dataset.v,d=b.dataset;
  if(/^(pray|hab|worship|tap|qadd|badinc|fastrecord)$/.test(a)){hapGo([45])}
  if(a==='goback'){if(innerBack())return;if(navTrail.length>1){history.back();return}tab=v||'home';confirmRelapse=false;confirmReset=false;addingHabit=false;addingWorship=false;setOpen=null;msg='';window.scrollTo(0,0)}
  else if(a==='tab'){if(v==='quran'||v==='reader')loadHeavy();if(v==='settings'&&tab==='more')setCat='';tab=v;confirmRelapse=false;confirmReset=false;addingHabit=false;addingWorship=false;setOpen=null;msg='';window.scrollTo(0,0)}
  else if(a==='notifFix'){if(window.alsaerNotifFix)window.alsaerNotifFix();tab='reminders';window.scrollTo(0,0)}
  else if(/^he[a-z]+$/.test(a)){if(heAct(a,v)===false)return}
  else if(a==='mpset'){mpOpen()}
  else if(a==='wkedit'){wkOpen('sec',v)}
  else if(a==='wkper'){wkOpen('per')}
  else if(a==='umode'){setUI('mode',v)}
  else if(a==='clkset'){setClockMode(v)}
  else if(a==='udigits'){U().digits=v==='west'?'west':'east';save();try{digitsApply(true)}catch(x){}}
  else if(a==='ptauto'){S.loc=S.loc||{};S.loc.auto=(v==='1');if(S.loc.auto){if(locOk())autoPtimes();else msg='اختر مدينتك أو حدّد موقعك أولًا ليعمل الوضع التلقائي'}save()}
  else if(a==='ustyle'){setUI('style',v)}
  else if(a==='uacc'){setUI('accent',v)}
  else if(a==='ulook'){setUI('look',v)}
  else if(a==='ulang'){setUI('lang',v);lastTab=null}
  /* ALSAER: نظام الساعة ١٢/٢٤ عام — يُطبَّق على كل مقاطع الوقت في التطبيق */
  else if(a==='clkfmt'){setClockMode(v)}
  else if(a==='ufont'){setUI('font',v)}
  else if(a==='ufw'){setUI('fontW',v)}
  else if(a==='uhap'){setUI('hap',v);hapGo([40,50,30])}
  else if(a==='upress'){setUI('press',v);pressKey='[data-a="upress"][data-v="'+v+'"]'}
  else if(a==='utrans'){setUI('trans',v);lastTab=null}
  else if(a==='gender'){S.gender=v==='female'?'female':'male';save();toast('تم تحديث طريقة المخاطبة')}
  else if(a==='savereview'){var rv=document.getElementById('review-note');S.reviews=S.reviews||[];S.reviews.push({date:dk(),note:rv?rv.value.slice(0,2000):''});save();toast('تم حفظ مراجعتك على هذا الجهاز')}
  else if(a==='fine'){toast('ثبّتك الله، واصل')}
  else if(a==='lockdelay'){S.lockDelay=parseInt(v,10);save();toast('تم حفظ مهلة القفل')}
  else if(/^(bmtog|bmdel|frz|cdsrc|cdmake|cdshare|cddl|hfadd|hfrev|hfdel|ktdur|ktstart|ktstop)$/.test(a)){if(f7Act(a,v,d))return}
  else if(/^(ramtog|khset|khgoal|khreset|ntkind|ntadd|ntdel|adkfav|adkall|adkcopy|adkshare|zkbase|zkhawl)$/.test(a)){if(featAct(a,v,d))return}
  else if(/^(qdchg|bkexport|bkcopy|bkimport)$/.test(a)){if(extraAct(a,v))return}
  else if(/^(nsf|nsw|nsfreset|nswreset|nsfen|nsftest|nsfpause)$/.test(a)){if(nsAct(a,v))return}
  else if(/^(ffset|fftype|ffday|ffsave|ffadd|ffdel|ffct|ffctdel|ffrefresh)$/.test(a)){if(ffAct(a,v))return}
  else if(/^(boman|boadd|bodel|bolog|boundo|boedit|bopre|boico|boclr|bocancel|bocol|boset|bodayf|boopt|bopos|bopause|borate)$/.test(a)){if(boAct(a,v))return}
  else if(/^(msoff|msshare)$/.test(a)){if(msAct(a,v))return}
  else if(/^(tournext|tourskip|tourreplay)$/.test(a)){if(tourAct(a,v))return}
  else if(/^(chnew|chadd|chday|chdel)$/.test(a)){if(chAct(a,v))return}
  else if(/^(mhq|mhsave)$/.test(a)){if(mhAct(a,v))return}
  else if(a==='gps'){setTimeout(function(){gpsFix(false)},30)}
  else if(a==='qibla'){if(compassOn)compassStop();else{var DOE=window.DeviceOrientationEvent;if(DOE&&typeof DOE.requestPermission==='function'){try{DOE.requestPermission().then(function(r){if(r==='granted'){compassStart(parseFloat(v));render()}})}catch(x){}}else compassStart(parseFloat(v))}}
  else if(a==='tsbtap'){var it=tsbItem();if(it.n>=it.tg){toast('اكتمل هذا الذكر — اختر ذكرًا آخر أو صفّر العدّاد')}else{tsbBeep();var fin=tsbBump(it,1);if(fin)tsbDone(it);save();if(!fin&&tsbPaint())return}}
  else if(a==='tsbminus'){var it2=tsbItem();if(it2.n>0){it2.n--;var T2=tsbGet();T2.session=Math.max(0,(T2.session||0)-1);T2.total=Math.max(0,(T2.total||0)-1);save();if(tsbPaint())return}}
  else if(a==='tsbreset'){tsbItem().n=0;save();toast('تم تصفير هذا الذكر')}
  else if(a==='tsbsel'){tsbGet().sel=parseInt(v,10)||0;tsbPanel='';save()}
  else if(a==='tsbsound'){var T3=tsbGet();T3.sound=!T3.sound;save();if(T3.sound)tsbBeep()}
  else if(a==='tsbpanel'){tsbPanel=(tsbPanel===v?'':v)}
  else if(a==='tsbpreset'){var gi=document.getElementById('tsb-g');if(gi){gi.value=v;document.querySelectorAll('[data-a=tsbpreset]').forEach(function(x){x.classList.toggle('on',x.dataset.v===v)})}return}
  else if(a==='tsbsave'){var gt=document.getElementById('tsb-g'),tx=document.getElementById('tsb-t'),tg2=Math.max(1,Math.min(100000,parseInt(gt&&gt.value,10)||33)),T4=tsbGet();
    if(v==='new'){var nt=(tx&&tx.value||'').trim();if(!nt){toast('اكتب نص الذكر');return}T4.list.push({id:'c'+Date.now(),t:nt,tg:tg2,n:0});T4.sel=T4.list.length-1}
    else{var it3=tsbItem();it3.tg=tg2;if(tx&&String(it3.id).charAt(0)==='c'&&tx.value.trim())it3.t=tx.value.trim();if(it3.n>tg2)it3.n=tg2}
    tsbPanel='';save()}
  else if(a==='tsbdel'){var T5=tsbGet();if(String(tsbItem().id).charAt(0)==='c'){T5.list.splice(T5.sel,1);T5.sel=0;tsbPanel='';save()}}
  else if(a==='scat'){setCat=v||'';setOpen=null;msg='';window.scrollTo(0,0)}
  else if(a==='sopen'){setOpen=(setOpen===v)?null:v;msg='';secOk=''}
  else if(a==='secchoose'){
    secOk='';
    if(v==='bio'){bioToggle();return}
    if(v==='pin'||v==='password'){secMethod=v;secStage='setup';msg=''}
  }
  else if(a==='secDisable'){secStage='disable';msg='';secOk=''}
  else if(a==='secCancel'){secStage='choose';msg='';secOk=''}
  else if(a==='secConfirmDisable'){
    var disableInput=document.getElementById('secdisableold'),disableValue=disableInput?disableInput.value:'',disableMsg=document.getElementById('secdisablemsg');
    var disableFail=function(t){if(disableMsg){disableMsg.textContent='✗ '+t;disableMsg.className='sec-msg err'}toast(t)};
    if(!S.pin){secStage='choose';msg='الحماية غير مفعّلة بالفعل'}
    else if(lockRemaining()>0){disableFail('محاولات كثيرة؛ انتظر '+Math.ceil(lockRemaining()/1000)+' ثانية قبل المحاولة');return}
    else if(!disableValue){disableFail('أدخل وسيلة الحماية الحالية أولاً');return}
    else{try{if(!await verifyPin(disableValue,S.pin)){var disableWait=recordBadPin();disableFail(disableWait>0?'وسيلة الحماية غير صحيحة؛ أوقفنا المحاولة مؤقتاً':'وسيلة الحماية الحالية غير صحيحة؛ لم يتم إلغاء القفل');return}
      S.pin=null;delete S.lockType;S.security={method:'pin'};clearBadPins();unlocked=true;save();secStage='choose';secOk='✓ تم إلغاء قفل التطبيق بنجاح';msg='';toast('تم إلغاء قفل التطبيق بنجاح')
    }catch(err){disableFail('تعذر التحقق الآمن؛ لم يتم تغيير الحماية');return}}
  }

  else if(a==='secSave'){
    var oldEl=document.getElementById('secold'),newEl=document.getElementById('secnew'),cfEl=document.getElementById('secconfirm');
    var oldVal=oldEl?oldEl.value:'',newVal=newEl?newEl.value:'',cfVal=cfEl?cfEl.value:'';
    var isPin=secMethod==='pin',nm=isPin?'رمز PIN':'كلمة المرور';
    var fail=function(t){secShow('✗ '+t,'err');toast(t)};
    if(S.pin){
      if(!oldVal){fail('أدخل وسيلة الحماية الحالية أولاً');return}
      try{if(!await verifyPin(oldVal,S.pin)){fail('وسيلة الحماية الحالية غير صحيحة؛ لم يتم أي تغيير');return}}catch(e){fail('تعذر التحقق الآمن؛ لم يتم تغيير الحماية');return}
    }
    if(!newVal){fail('أدخل '+nm+' الجديد');return}
    if(isPin&&!/^\d{4}$/.test(newVal)){fail('رمز PIN يجب أن يتكون من 4 أرقام فقط (أدخلت '+newVal.length+')');return}
    if(!isPin&&newVal.length<8){fail('كلمة المرور قصيرة؛ يجب 8 خانات على الأقل (أدخلت '+newVal.length+')');return}
    if(!isPin&&newVal.length>64){fail('كلمة المرور طويلة؛ الحد الأقصى 64 خانة');return}
    if(!isPin&&/\s/.test(newVal)){fail('كلمة المرور لا يجب أن تحتوي على مسافات');return}
    if(!cfVal){fail('أعد إدخال '+nm+' للتأكيد');return}
    if(newVal!==cfVal){fail(isPin?'الرقمان غير متطابقين؛ أعد إدخال PIN بنفس الأرقام':'كلمتا المرور غير متطابقتين؛ أعد المحاولة');return}
    try{S.pin=await makePinRecord(newVal);S.security={method:secMethod};delete S.lockType;patFirst='';save();secStage='choose';msg='';secOk='✓ تم حفظ '+nm+' بنجاح، وسيُطلب عند فتح التطبيق';toast('✓ تم حفظ '+nm+' بنجاح')}catch(e){fail('تعذر إنشاء حماية آمنة؛ لم يتم حفظ التغيير');return}
  }

  else if(a==='goboost'){tab='boost';window.scrollTo(0,0)}
  else if(a==='success'||a==='relapse'){
    if(a==='relapse'&&!confirmRelapse){confirmRelapse=true;render();return}
    var n=document.getElementById('note');var kd=dk(),tr=draftTrig!==null?draftTrig:((S.days[kd]&&S.days[kd].trig)||[]);S.days[kd]={status:a,note:n?n.value:'',trig:tr};draft=null;draftTrig=null;confirmRelapse=false;save();checkNew()}
  else if(a==='trg'){var k3=dk(),cur=(draftTrig!==null?draftTrig:((S.days[k3]&&S.days[k3].trig)||[])).slice(),ix=cur.indexOf(v);if(ix<0)cur.push(v);else cur.splice(ix,1);draftTrig=cur;var n3=document.getElementById('note');if(n3)draft=n3.value;if(S.days[k3]){S.days[k3].trig=cur;save();checkNew()}}
  else if(a==='worship'){worshipToggle(v,d.state==='yes')}
  else if(a==='addworship'){addingWorship=true}
  else if(a==='cancelworship'){addingWorship=false}
  else if(a==='saveworship'){var wi=document.getElementById('new-worship-name'),wt=wi?wi.value.trim().slice(0,60):'';if(wt&&(S.customWorship||[]).length<30){S.customWorship=S.customWorship||[];S.customWorship.push({id:'cw'+Date.now().toString(36),t:wt});save();addingWorship=false;toast('تمت إضافة العبادة الخاصة بك')}else if(!wt)toast('اكتب اسم العبادة أولًا من فضلك')}
  else if(a==='delworship'){S.customWorship=(S.customWorship||[]).filter(function(x){return x.id!==v});Object.keys(S.worship||{}).forEach(function(k){if(S.worship[k])delete S.worship[k][v]});save();toast('تم حذف العبادة')}
  else if(a==='hab'){S.habits=S.habits||{};var hk=dk();S.habits[hk]=S.habits[hk]||{};var hl='h:'+hk+':'+v;if(S.habits[hk][v]){if(lockLeft(hl)>0){lockBlock(lockLeft(hl));return}if(S.locks)delete S.locks[hl]}else lockSet(hl);S.habits[hk][v]=!S.habits[hk][v];save();checkNew()}
  else if(a==='pray'){var pk=dk();S.prayers[pk]=S.prayers[pk]||{};if(PR.some(function(p){return p[0]===v})){var pl='p:'+pk+':'+v;if(S.prayers[pk][v]){if(lockLeft(pl)>0){lockBlock(lockLeft(pl));return}if(S.locks)delete S.locks[pl]}else lockSet(pl);S.prayers[pk][v]=!S.prayers[pk][v]}save();checkNew()}
  else if(a==='qstart'){loadHeavy();var st0=S.quran.pos;rd={from:st0,to:Math.min(604,st0+S.quran.goal-1),page:st0};tab='reader';window.scrollTo(0,0)}
  else if(a==='qsura'){loadHeavy(function(){var c=parseInt(v,10)||1,st=suraPage(c),en=c<114?Math.max(st,suraPage(c+1)-1):604;rd={from:st,to:en,page:st,free:true,sura:c};tab='reader';window.scrollTo(0,0);render()})}
  else if(a==='adkopen'){group=v;hsnOpen(v);window.scrollTo(0,0)}
  else if(a==='qopen'){loadHeavy();var st1=Math.max(1,Math.min(604,parseInt(v,10)||1));rd={from:st1,to:Math.min(604,st1+S.quran.goal-1),page:st1};tab='reader';window.scrollTo(0,0)}
  else if(a==='qpage'){if(rd){try{mpSel='';mpHap()}catch(e){}rd.dir=v==='1'?1:-1;rd.page=Math.max(1,Math.min(604,rd.page+(v==='1'?1:-1)))}}
  else if(a==='qjump'||a==='qjgo'){if(mpAct(a,v))return}
  else if(/^(qsrch|qsclose|qsdo|qsgo|qimm)$/.test(a)){if(mpAct2(a,v))return}
  else if(/^rc[a-z]+$/.test(a)){if(rcAct(a,v))return}
  else if(/^dg[a-z]+$/.test(a)){if(dgAct(a,v))return}
  else if(/^hdt[a-z]+$/.test(a)){if(typeof hdtAct==='function'&&hdtAct(a,v)===false)return}
  else if(/^hsn[a-z]+$/.test(a)){if(typeof hsnAct==='function'&&hsnAct(a,v)===false)return}
  else if(/^asm[a-z]+$/.test(a)){if(typeof asmAct==='function'&&asmAct(a,v)===false)return}
  else if(/^msb[a-z]+$/.test(a)){if(typeof msbAct==='function'&&msbAct(a,v)===false)return}
  else if(a==='qriw'){loadHeavy(function(){S.quran.riwaya=(v==='warsh'&&window.WDATA)?'warsh':'hafs';save();window.scrollTo(0,0);render()})}
  else if(a==='qtj'){S.quran.tj=S.quran.tj===false;save()}
  else if(a==='qfs'){S.quran.fs=Math.max(18,Math.min(44,S.quran.fs+(v==='2'?2:-2)));save()}
  else if(a==='showidx'){showIdx=!showIdx}
  else if(a==='qdone'){if(rd&&rd.free){if(rd.sura)markSuraDone(rd.sura);rd=null;tab='home';window.scrollTo(0,0);toast('تقبّل الله منك')}else if(rd){if(!(qPages(dk())>0))lockSet('q:'+dk());var nn=Math.max(1,rd.page-rd.from+1),kq=dk(),before=qPages(kq);S.quran.log[kq]=before+nn;var wrap=rd.page>=604;S.quran.pos=wrap?1:rd.page+1;rd=null;tab='quran';save();window.scrollTo(0,0);toast(wrap?'ما شاء الله، أتممت ختمة المصحف':(S.quran.log[kq]>=S.quran.goal?'تقبّل الله منك، أتممت وردك اليوم':'تم تسجيل '+ar(nn)+' صفحة'));checkNew()}}
  else if(a==='qadd'){var qk=dk();if(!(S.quran.log[qk]>0))lockSet('q:'+qk);S.quran.log[qk]=Math.min(604,(S.quran.log[qk]||0)+1);save()}
  else if(a==='qsub'){var qk2=dk();if(lockLeft('q:'+qk2)>0){lockBlock(lockLeft('q:'+qk2));return}S.quran.log[qk2]=Math.max(0,(S.quran.log[qk2]||0)-1);if(!S.quran.log[qk2])delete S.quran.log[qk2];save()}
  else if(a==='qgoal'){S.quran.goal=Math.max(1,Math.min(30,S.quran.goal+(v==='1'?1:-1)));save()}
  else if(a==='addh'){addingHabit=!addingHabit}
  else if(a==='saveh'){var nh=document.getElementById('nh'),tx=nh?nh.value.trim().slice(0,60):'';if(tx&&S.myHabits.length<30){S.myHabits.push({id:'c'+Date.now().toString(36)+S.myHabits.length,t:tx});save();addingHabit=false;toast('أُضيفت العادة')}}
  else if(a==='delh'){S.myHabits=S.myHabits.filter(function(h){return h.id!==v});save()}
  else if(a==='addextra'){addingHabit=true;addingHabitType='good'}
  else if(a==='newhtype'){addingHabitType=v==='bad'?'bad':'good'}
  else if(a==='cancelextra'){addingHabit=false}
  else if(a==='saveextra'){var xh=document.getElementById('new-habit-name'),xt=xh?xh.value.trim().slice(0,60):'';if(xt&&S.extraHabits.length<40){var nxid='x'+Date.now().toString(36);S.extraHabits.push({id:nxid,t:xt,type:addingHabitType});if(manageTargets)S.target=nxid;save();addingHabit=false;toast(addingHabitType==='good'?'أُضيفت العادة الحسنة':'أُضيفت العادة التي تريد تركها')}}
  else if(a==='delxh'){S.extraHabits=S.extraHabits.filter(function(h){return h.id!==v});if(S.target===v)S.target='main';save()}
  else if(a==='badinc'){evLog(v,1)}
  else if(a==='baddec'){evUndo(v,1)}
  else if(a==='evlog'){var ni=document.getElementById('note');if(ni)draft=ni.value;evLog(curTarget()[0],v==='1')}
  else if(a==='evundo'){evUndo(curTarget()[0])}
  else if(a==='settarget'){S.target=v;save()}
  else if(a==='mgtarget'){manageTargets=!manageTargets;if(manageTargets)addingHabitType='bad'}
  else if(a==='savegoal'){var gn=parseInt((document.getElementById('goal-n')||{}).value,10);S.goals=S.goals||{};var gid=curTarget()[0];if(gn>=1&&gn<=999)S.goals[gid]=gn;else delete S.goals[gid];save();toast('تم حفظ الهدف')}
  else if(a==='allchips'){showAllChips=!showAllChips}
  else if(a==='savemain'){var mn=document.getElementById('main-name');S.mainName=mn?mn.value.trim().slice(0,40):'';save();toast('تم حفظ الاسم')}
  else if(a==='showrep'){showRep=!showRep}
  else if(a==='repr'){repRange=v==='month'?'month':'week'}
  else if(a==='fastpref'){S.fasting.prefs[v]=!S.fasting.prefs[v];save()}
  else if(a==='fastremind'){S.fasting.reminders[v]=!S.fasting.reminders[v];save()}
  else if(a==='fastrecord'){var fk=dk(),fl='f:'+fk,fcur=S.fasting.records[fk],fnew=v==='done'?'done':'missed';if(fcur&&fcur!==fnew&&lockLeft(fl)>0){lockBlock(lockLeft(fl));return}if(!fcur||inGrace(fl))lockSet(fl);S.fasting.records[fk]=fnew;save();toast(v==='done'?'تم تسجيل صيام اليوم':'تم تسجيل عدم الصيام')}
  else if(a==='fastcustom'){var fc=document.getElementById('fast-custom-date'),fd=fc&&fc.value;if(!fd)toast('اختر التاريخ أولًا');else if(S.fasting.customDates.indexOf(fd)<0){S.fasting.customDates.push(fd);save();toast('تمت إضافة يوم الصيام')}else toast('هذا اليوم مضاف مسبقًا')}
  else if(a==='fastcustomdel'){S.fasting.customDates=(S.fasting.customDates||[]).filter(function(x){return x!==v});save();toast('تم حذف اليوم')}
  else if(a==='fasttimes'){var su=document.getElementById('suhoor-time'),it=document.getElementById('iftar-time');if(su&&/^\\d{2}:\\d{2}$/.test(su.value))S.fasting.reminders.suhoorTime=su.value;if(it&&/^\\d{2}:\\d{2}$/.test(it.value))S.fasting.reminders.iftarTime=it.value;save();toast('تم حفظ أوقات التذكير')}
  else if(a==='fastdismiss'){toast('يمكنك العودة إلى جدول الصيام من المزيد')}
  else if(a==='per'){per=v==='month'?'month':'week'}
  else if(a==='showlog'){showLog=!showLog}
  else if(a==='update109Done'){try{localStorage.setItem('alsaer_seen_update_1016','1')}catch(e){}var up=document.getElementById('update109-notice');if(up)up.remove();tourAuto()}
  else if(a==='showprivacy'){showPrivacy=!showPrivacy}
  else if(a==='urge'){S.urges=S.urges||[];S.urges.push(Date.now());save();checkNew();toast('أحسنت، سُجّل تجاوزك لهذه الرغبة')}
  else if(a==='cover'){covered=true}
  else if(a==='uncover'){covered=false;if(S.pin){unlocked=false;bioPrompted=false}}
  else if(a==='gsel'){obGender=v==='female'?'female':'male'}
  else if(a==='ob'){var og=document.querySelector('input[name="ob-gender"]:checked');S.gender=og?og.value:obGender;var on=document.getElementById('ob-name'),oa=document.getElementById('ob-age');S.profile=S.profile||{name:'',age:'',photo:''};S.profile.name=(on?on.value.trim():'').slice(0,40);var age=oa?parseInt(oa.value,10):0;S.profile.age=age>=1&&age<=120?String(age):'';var obr=document.getElementById('ob-reason'),rr=obr?obr.value.trim():'';if(rr)S.reasons.push(rr.slice(0,200));S.onboarded=true;save();checkNew()}
  else if(a==='editprofilephoto'){
    /* حقل اختيار مستقل خارج منطقة العرض: لا يضيع إن أُعيد رسم الصفحة أثناء فتح معرض الصور */
    var old=document.getElementById('profile-photo-tmp');if(old)old.remove();
    var tmp=document.createElement('input');tmp.type='file';tmp.accept='image/*';tmp.id='profile-photo-tmp';
    tmp.style.cssText='position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0';
    var fired=false;
    var onPick=function(){if(fired)return;fired=true;handlePhotoInput(tmp);setTimeout(function(){tmp.remove()},120000)};
    tmp.addEventListener('change',onPick);tmp.addEventListener('input',onPick);
    document.body.appendChild(tmp);tmp.click()}
  else if(a==='viewprofilephoto'){if(S.profile&&S.profile.photo){var ov=document.createElement('div');ov.className='profile-photo-viewer';ov.setAttribute('data-a','closeprofilephoto');ov.innerHTML='<div class="profile-photo-viewer-inner"><button type="button" class="profile-photo-viewer-close" aria-label="إغلاق">×</button><img src="'+S.profile.photo+'" alt="الصورة الشخصية بالحجم الكامل"></div>';document.body.appendChild(ov);history.pushState({alsaerViewer:1},'',location.href)}else toast('لم تُضف صورة شخصية بعد')}
  else if(a==='closeprofilephoto'){var ov2=document.querySelector('.profile-photo-viewer');if(ov2){ov2.remove();ignorePop=true;history.back()}}
  else if(a==='saveprofile'){var pn=document.getElementById('profile-name'),pa=document.getElementById('profile-age'),age2=pa?parseInt(pa.value,10):0;S.profile=S.profile||{name:'',age:'',photo:''};S.profile.name=(pn?pn.value.trim():'').slice(0,40);S.profile.age=age2>=1&&age2<=120?String(age2):'';save();toast('تم حفظ الملف الشخصي')}
  else if(a==='prev'){calD=new Date(calD.getFullYear(),calD.getMonth()-1,1)}
  else if(a==='next'){calD=new Date(calD.getFullYear(),calD.getMonth()+1,1)}
  else if(a==='sel'){calSel=d.k}
  else if(a==='setday'){if(v)S.days[calSel]={status:v,note:(S.days[calSel]&&S.days[calSel].note)||''};else delete S.days[calSel];save();checkNew()}
  else if(a==='grp'){group=v}
  else if(a==='tap'){var k=dk();S.counters[k]=S.counters[k]||{};if(!S.counters[k][d.id])lockSet('c:'+k+':'+d.id);S.counters[k][d.id]=Math.min(+d.n,(S.counters[k][d.id]||0)+1);save();checkNew()}
  else if(a==='rst'){var k2=dk();if(lockLeft('c:'+k2+':'+d.id)>0){lockBlock(lockLeft('c:'+k2+':'+d.id));return}S.counters[k2]=S.counters[k2]||{};S.counters[k2][d.id]=0;save()}
  else if(a==='nextq'){qi++}
  else if(a==='tstart'){timerDeadline=Date.now()+300000;secs=300;startTimerTick()}
  else if(a==='tstop'){stopTimer()}
  else if(a==='addr'){var r=document.getElementById('reason');if(r&&r.value.trim()){S.reasons.push(r.value.trim().slice(0,200));save();checkNew()}}
  else if(a==='delr'){S.reasons.splice(+d.i,1);save()}
  else if(a==='setpin'||a==='nopin'){msg='استخدم مركز الأمان لتغيير وسيلة الحماية بعد التحقق من الوسيلة الحالية'}
  else if(a==='unlock'){await tryUnlock(document.getElementById('lk').value)}
  else if(a==='biounlock'){bioPrompt(false)}
  else if(a==='bkenc'){
    var pw=(document.getElementById('bkpw')||{}).value||'',tb=document.getElementById('bk');
    if(pw.length<6)msg='كلمة مرور النسخة يجب ألا تقل عن ٦ أحرف. احفظها جيدًا؛ لا يمكن استرجاع النسخة بدونها.';
    else{try{var et=await bkEncrypt(JSON.stringify(S),pw);tb.value=et;try{await navigator.clipboard.writeText(et);msg='تم نسخ النسخة المشفّرة'}catch(x){tb.select();msg='حدّد النص وانسخه يدوياً'}}catch(x){msg='تعذر التشفير على هذا الجهاز'}}
    var mm=document.querySelector('.msg');if(mm)mm.textContent=msg;return}
  else if(a==='bkcopy'){var txt=JSON.stringify(S),ta=document.getElementById('bk');ta.value=txt;
    (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){msg='تم النسخ'}).catch(function(){ta.select();msg='حدّد النص وانسخه يدوياً'}).then(function(){var m=document.querySelector('.msg');if(m)m.textContent=msg});return}
  else if(a==='bkrestore'){try{var raw=document.getElementById('bk').value.trim();if(raw.indexOf('ALSAER-ENC1:')===0){try{raw=await bkDecrypt(raw,(document.getElementById('bkpw')||{}).value||'')}catch(x2){throw 'pw'}}var o=JSON.parse(raw);if(!validBackup(o))throw 0;var restored=fixShape(Object.assign(def(),o));if(restored.pin!==null&&typeof restored.pin!=='string'&&(!restored.pin||restored.pin.type!=='pbkdf2-sha256'||typeof restored.pin.salt!=='string'||typeof restored.pin.hash!=='string'))throw 0;restored.onboarded=true;S=restored;save();unlocked=!S.pin;bioPrompted=false;msg='تم الاسترجاع بعد التحقق من البيانات'}catch(x){msg=(x==='pw')?'كلمة المرور غير صحيحة أو النسخة تالفة؛ لم تتغير بياناتك':'النسخة غير صالحة أو ناقصة؛ لم تتغير بياناتك'}}
  else if(a==='reset'){if(!confirmReset){confirmReset=true}else{S=def();save();confirmReset=false;draft=null;obStep=1;msg='تم المسح'}}
  render();
});
if(!S.onboarded&&Object.keys(S.days).length)S.onboarded=true;
try{S.quran=S.quran||{};if(!S.quran.v2){if(S.quran.pg===undefined||S.quran.pg==='ornate')S.quran.pg='auto';S.quran.img=false;S.quran.v2=1;save()}}catch(e){}
bioProbePoll();
/* رجوع داخلي: يغلق نوافذ المصحف العائمة، أو يعود من قسم الإعدادات إلى قائمة الأقسام، قبل مغادرة الشاشة */
function innerBack(){
  if(typeof mpCloseOverlays==='function'&&mpCloseOverlays())return true;
  if(tab==='settings'&&setCat){setCat='';setOpen=null;msg='';window.scrollTo(0,0);render();return true}
  return false;
}
var ignorePop=false;
window.addEventListener('popstate',function(){
  if(ignorePop){ignorePop=false;return}
  if(innerBack()){try{history.pushState({alsaerStep:navTrail.length},'',location.href)}catch(e){}return}
  var viewer=document.querySelector('.profile-photo-viewer');
  if(viewer){viewer.remove();return}
  if(navTrail.length>1){
    navTrail.pop();
    tab=navTrail[navTrail.length-1]||'home';
    confirmRelapse=false;confirmReset=false;addingHabit=false;addingWorship=false;setOpen=null;msg='';
    backPopHandling=true;
    render();
  }
});
function handleNativeBack(){
  if(innerBack())return true;
  var viewer=document.querySelector('.profile-photo-viewer');
  if(viewer){viewer.remove();ignorePop=true;history.back();return true}
  if(navTrail.length>1){
    /* تنقّل مباشر بدل history.back(): بعض إصدارات WebView تتخطّى سجلّات pushState غير المرتبطة بلمسة فيخرج التطبيق */
    navTrail.pop();tab=navTrail[navTrail.length-1]||'home';
    confirmRelapse=false;confirmReset=false;addingHabit=false;addingWorship=false;setOpen=null;msg='';
    backPopHandling=true;window.scrollTo(0,0);render();return true;
  }
  if(tab!=='home'){tab='home';navTrail=['home'];backPopHandling=true;window.scrollTo(0,0);render();return true}
  return false;
}
window.alsaerBack=handleNativeBack;
document.addEventListener('backbutton',function(e){
  if(e&&e.preventDefault)e.preventDefault();
  handleNativeBack();
},false);
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'||e.key==='BrowserBack'){
    e.preventDefault();handleNativeBack();
  }
});
try{
  var cap=window.Capacitor;
  var appPlugin=cap&&(cap.Plugins&&cap.Plugins.App);
  if(appPlugin&&typeof appPlugin.addListener==='function'){
    appPlugin.addListener('backButton',function(){handleNativeBack()});
  }
}catch(e){}
backHistoryReady=true;
/* ALSAER UI+: اهتزاز خفيف عند تسجيل أي إنجاز */
function alsaerHap(){try{if(navigator.vibrate)navigator.vibrate(22)}catch(e){}}

/* اهتزاز لطيف عند اللمس نفسه (أوضح من انتظار النقر): المسبحة وفعلتها/لم أفعلها */
document.addEventListener('pointerdown',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('[data-a=tsbtap],[data-a=evlog],[data-a=worship],[data-a=pray],[data-a=hab]');
  if(!b||!navigator.vibrate)return;
  var yes=b.dataset.v==='1'||b.dataset.state==='yes';
  hapGo(b.dataset.a==='tsbtap'?[35]:(yes?[45,40,60]:[70]))
},true);
