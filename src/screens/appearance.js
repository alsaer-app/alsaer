/* ===== مساعدات «الشكل والعرض» (الاتجاه أ): اللون الحالي + مفتاح «الحركات» الموحّد ===== */
function apAcc(){
  var u=U(),sid=pick(Object.keys(STY),u.style,'calm'),ac=u.accent||(sid==='calm'?'maleem':''),ent=null;
  ACC.forEach(function(x){if(x.id===ac)ent=x});
  return {id:ac,name:ent?ent.n:'',col:ent?(isDark()?ent.d:ent.l):'var(--gold)'};
}
/* «الحركات» ثلاثي الحالات فوق مفتاحَي الضغط والانتقال المخزّنين (يبقى التخزين كما هو) */
function apMotionCur(){
  var u=U();
  if(u.press==='none'&&u.trans==='none')return 'none';
  if(u.press==='soft'&&u.trans==='fade')return 'reduced';
  return 'full';
}
