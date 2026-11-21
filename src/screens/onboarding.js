function vSplash(){
  return '<div class="splash"><div class="sp-tile"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M40 10a22 22 0 1 0 14 38A18 18 0 0 1 40 10z" fill="#fff" opacity=".95"/><path d="M6 54c14-9 28-9 52 0" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".7"/><circle cx="44" cy="22" r="2.4" fill="#fff"/></svg></div><div class="t">السائر إلى الله</div><div class="s">رحلة نحو القرب من الله<br>وتحسين حياتك</div></div>';
}
function vOb(){
  var p=S.profile||{},gender=obGender||S.gender||'male';
  return '<div class="ob-page">'
  +'<div class="ob-brand"><div class="ob-mark">'+ic('moon')+'</div><p class="ob-eyebrow">السائر إلى الله</p>'
  +'<h2>أهلاً بك في رحلتك</h2><p class="ob-intro">خطوة صادقة نحو حياةٍ أقرب إلى الله. أخبرنا باسمك وعمرك لنخاطبك كما يليق بك.</p></div>'
  +'<section class="card ob-form profile-edit">'
  +'<div class="ob-photo-row"><label class="ob-photo-picker" for="ob-photo" aria-label="اختيار صورة شخصية"><div class="profile-edit-head">'+(p.photo?'<img class="profile-photo" style="width:86px;height:86px" src="'+p.photo+'" alt="الصورة الشخصية">':'<div class="ob-avatar">'+(gender==='female'?avFemale():avMale())+'</div>')+'<div class="ob-photo-copy"><strong>صورتك الشخصية</strong><small>اضغط هنا لاختيار صورة من جهازك</small></div></div><span class="ob-photo-action">'+ic('camera')+'</span></label><input id="ob-photo" type="file" accept="image/*" class="profile-file ob-file"></div>'
  +'<label class="profile-label" for="ob-name">الاسم</label><input id="ob-name" type="text" maxlength="40" autocomplete="name" placeholder="اكتب اسمك" value="'+esc(p.name||'')+'">'
  +'<label class="profile-label">الجنس</label><div class="ob-genders">'
  +'<label class="ob-gender '+(gender==='male'?'selected':'')+'"><input type="radio" name="ob-gender" value="male" '+(gender==='male'?'checked':'')+'><span>'+avMale()+'ذكر</span></label>'
  +'<label class="ob-gender '+(gender==='female'?'selected':'')+'"><input type="radio" name="ob-gender" value="female" '+(gender==='female'?'checked':'')+'><span>'+avFemale()+'أنثى</span></label></div>'
  +'<div class="ob-divider"></div>'
  +'<label class="profile-label" for="ob-age">العمر</label><input id="ob-age" type="number" inputmode="numeric" min="1" max="120" placeholder="العمر بالسنوات" value="'+esc(p.age||'')+'">'
  +'</section><button class="btn block ob-start" data-a="ob">ابدأ رحلتك</button>'
  +'<p class="ob-privacy">بياناتك الشخصية وعاداتك محفوظة على جهازك.</p></div>'+COPY;
}
