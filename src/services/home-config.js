var HOME_SECS=[['daily','بطاقة «كل يوم بداية جديدة»'],['timeb','بانر «ذكر هذا الوقت»'],['tiles','الكهف والملك وأذكار الصباح والمساء'],['worship','عباداتي اليوم'],['tracker','تسجيل اليوم'],['journey','رحلة الثبات والإحصاءات']];
function hidH(k){return !!(S.homeHide&&S.homeHide[k])}
function lockDelayVal(){return (S.lockDelay>=0&&S.lockDelay!=null)?S.lockDelay:30}
function lockDelayLabel(){var v=lockDelayVal();return v===0?'فورًا':v===30?'بعد ٣٠ ثانية':v===60?'بعد دقيقة':'بعد '+ar(Math.round(v/60))+' دقائق'}


/* قفل تمرير الصفحة ما دامت نافذة مفتوحة، فلا تُسحب الشاشة خلفها */
try{new MutationObserver(function(){document.documentElement.classList.toggle('ovl',!!(document.getElementById('mps-wrap')))}).observe(document.body,{childList:true})}catch(e){}
