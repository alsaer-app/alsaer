var apAdv=false;
document.addEventListener('toggle',function(e){if(e.target&&e.target.id==='ap-adv')apAdv=e.target.open},true);
function vAppearance(){
  var u=U(),m=uiMode(),sid=pick(Object.keys(STY),u.style,'calm'),ac=u.accent||'',lk=pick(LOOKS,u.look,'classic'),fn=pick(FONTS,u.font,'plex'),pr=pick(PRESSES,u.press,'bounce'),tr=pick(TRANSES,u.trans,'rise');
  var h='<section class="card ap">';
  h+='<h3>الوضع</h3><div class="seg n3">'+[['system','تلقائي'],['light','فاتح'],['dark','داكن']].map(function(x){return '<button class="'+(m===x[0]?'on':'')+'" data-a="umode" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
  h+='<h3>النمط</h3><div class="sty-grid">'+Object.keys(STY).map(function(k){var s=STY[k];return oBtn('ustyle',k,sid,'<span class="pv" style="background:'+s.pv[0]+'"><i style="background:'+s.pv[1]+'"></i><b style="background:'+s.pv[2]+'"></b></span><small>'+s.n+'</small>','uo sty')}).join('')+'</div>';
  h+='<h3>لون التطبيق</h3><div class="acc-row">'+ACC.map(function(x){var on=(ac||(sid==='calm'?'maleem':''))===x.id;return '<button class="acc" data-a="uacc" data-v="'+x.id+'" aria-pressed="'+on+'" aria-label="'+x.n+'" style="background:'+(isDark()?x.d:x.l)+'">'+(on?'✓':'')+'</button>'}).join('')+'</div>';
  h+='<details class="sc-adv" id="ap-adv"'+(apAdv?' open':'')+'><summary>خيارات متقدمة: الشكل والاهتزاز والخط والحركة</summary>';
  h+='<h3>شكل الواجهة</h3><div class="look-row">'+LOOKS.map(function(x){return oBtn('ulook',x[0],lk,'<span class="lk-pv '+x[0]+'"><i></i><i></i></span><b>'+x[1]+'</b>','uo lo')}).join('')+'</div><p class="note">'+LOOKS.filter(function(x){return x[0]===lk})[0][2]+'</p>';
  h+='<h3>الاهتزاز اللطيف</h3><div class="seg n4">'+HAPS.map(function(x){return '<button class="'+(((u.hap)||'mid')===x[0]?'on':'')+'" data-a="uhap" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div><p class="note">يهتز الهاتف قليلًا عند المسبحة وتسجيل العبادات. إن لم تشعر به فعّل «ردود الفعل اللمسية» من إعدادات الصوت والاهتزاز في هاتفك.</p>';
  h+='<h3>الخط</h3><div class="font-grid">'+FONTS.map(function(x){return oBtn('ufont',x[0],fn,'<span class="fo-s fo-'+x[0]+'">أبجد</span><small>'+x[1]+'</small>','uo fo')}).join('')+'</div>'
   +'<div class="seg" style="margin-top:10px"><button class="'+(u.fontW!=='bold'?'on':'')+'" data-a="ufw" data-v="normal">عادي</button><button class="'+(u.fontW==='bold'?'on':'')+'" data-a="ufw" data-v="bold" style="font-weight:800">عريض</button></div>';
  h+='<h3>حركة الضغط</h3><div class="opt-list">'+PRESSES.map(function(x){return oBtn('upress',x[0],pr,'<b>'+x[1]+'</b><small>'+x[2]+'</small>','uo ol')}).join('')+'</div>';
  h+='<h3>حركة الانتقال</h3><div class="opt-list">'+TRANSES.map(function(x){return oBtn('utrans',x[0],tr,'<b>'+x[1]+'</b><small>'+x[2]+'</small>','uo ol')}).join('')+'</div>';
  return h+'</details></section>';
}
