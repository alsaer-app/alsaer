(function(){
var KEY='tawba_v1', TKEY='tawba_theme', mem=null;
var MONTHS=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
var WEEK=['ح','ن','ث','ر','خ','ج','س'];
var WKD=['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
var IC={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
 book:'<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z"/><path d="M12 6v14"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4"/><path d="M12 13v4M8 21h8M10 17h4"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2l.4 2.7h4l.4-2.7a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 sos:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 sparkles:'<path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8zM5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6z"/>',
 pen:'<path d="M4 20l4-1L19 8l-3-3L5 16z"/>',
 heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>',
 beads:'<circle cx="12" cy="5" r="2"/><circle cx="18" cy="10" r="2"/><circle cx="16" cy="17" r="2"/><circle cx="8" cy="17" r="2"/><circle cx="6" cy="10" r="2"/>',
 up:'<path d="M4 17l6-6 4 4 6-7"/><path d="M15 8h5v5"/>',
 eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 6.2A9.8 9.8 0 0112 6c5 0 8.5 4 9.5 6a14 14 0 01-3 3.7M6.6 6.7C4.4 8.1 2.9 10.3 2.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 mosque:'<path d="M3 21h18"/><path d="M5 21v-6h14v6"/><path d="M7.5 15a4.5 4.5 0 019 0"/><path d="M12 10.5V7.5"/><path d="M12 7.5a1.6 1.6 0 100-3.2"/><path d="M3.5 21V12M20.5 21V12"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
 chart:'<path d="M4 20V11M10 20V4M16 20v-7M22 20H2"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 chev:'<path d="M15 5l-7 7 7 7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 minus:'<path d="M5 12h14"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.4"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.3M12 17v.2"/>',
 leaf:'<path d="M5 19C5 10 10 5 20 5c0 10-5 15-14 15"/><path d="M5 19l8-8"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 doc:'<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
 phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
 refresh:'<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>',
 dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
 bell:'<path d="M6 17v-6a6 6 0 0112 0v6l2 2H4z"/><path d="M10 21a2 2 0 004 0"/>',
 cloud:'<path d="M7 18a4 4 0 01-.6-7.95A5.5 5.5 0 0117.2 9 4.5 4.5 0 0117.5 18z"/>',
 pencil:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4z"/>',
};
function ic(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'}

/* ---------- illustrations (inline SVG, no external images) ---------- */
function stars(list,id){return list.map(function(s,i){return '<circle cx="'+s[0]+'" cy="'+s[1]+'" r="'+(s[2]||1.2)+'" fill="#f4ecd0" opacity="'+(.5+((i*37)%50)/100)+'"/>'}).join('')}
function mosqueSil(x,y,sc,fill){
  return '<g transform="translate('+x+','+y+') scale('+sc+')" fill="'+fill+'">'
  +'<rect x="-52" y="-60" width="8" height="60"/><path d="M-52 -60l4 -16 4 16z"/><circle cx="-48" cy="-80" r="2.4"/>'
  +'<rect x="44" y="-72" width="8" height="72"/><path d="M44 -72l4 -18 4 18z"/><circle cx="48" cy="-93" r="2.4"/>'
  +'<path d="M-38 0V-34h76V0z"/><path d="M-24 -34a24 24 0 0148 0z"/><path d="M0 -58v-12"/><rect x="-1" y="-72" width="2" height="14"/><circle cx="0" cy="-74" r="3"/>'
  +'<rect x="-38" y="-34" width="76" height="3" opacity=".6"/></g>'
  +'<g fill="#f0d78c" opacity=".85"><rect x="'+(x-26*sc)+'" y="'+(y-22*sc)+'" width="'+(4*sc)+'" height="'+(9*sc)+'" rx="2"/><rect x="'+(x-4*sc)+'" y="'+(y-22*sc)+'" width="'+(4*sc)+'" height="'+(9*sc)+'" rx="2"/><rect x="'+(x+18*sc)+'" y="'+(y-22*sc)+'" width="'+(4*sc)+'" height="'+(9*sc)+'" rx="2"/></g>';
}
function man(x,y,sc){
  return '<g transform="translate('+x+','+y+') scale('+sc+')" fill="#030b0a" stroke="#030b0a" stroke-linecap="round" stroke-linejoin="round">'
  +'<circle cx="2" cy="-66" r="7.5" stroke="none"/>'
  +'<path d="M-5 -57l12 0 3 30-17 0z" stroke="none"/><rect x="-15" y="-56" width="10" height="22" rx="4" stroke="none"/>'
  +'<path d="M-6 -28l7 0 6 28-6 0-5-18-3 18-6 0z" stroke="none"/><path d="M2 -28l9 0 -3 28-7 0z" stroke="none"/>'
  +'<path d="M7 -52l10 20" stroke-width="4" fill="none"/><path d="M18 -72L13 0" stroke-width="2.4" fill="none"/></g>';
}
function sceneSplash(){
  return '<svg class="bgsvg" viewBox="0 0 360 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'
  +'<linearGradient id="spk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020a09"/><stop offset=".5" stop-color="#07231f"/><stop offset="1" stop-color="#15493f"/></linearGradient>'
  +'<radialGradient id="spg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f0dc9c" stop-opacity=".5"/><stop offset="1" stop-color="#f0dc9c" stop-opacity="0"/></radialGradient><radialGradient id="hgl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".75"/><stop offset=".45" stop-color="#e9b95a" stop-opacity=".25"/><stop offset="1" stop-color="#e9b95a" stop-opacity="0"/></radialGradient></defs>'
  +'<rect width="360" height="700" fill="url(#spk)"/>'
  +stars([[40,60],[92,32],[250,52,1.6],[302,112],[205,26],[332,44],[58,150],[160,96],[284,176],[22,210],[330,230,1.5],[120,40,1]],'')
  +'<circle cx="118" cy="160" r="96" fill="url(#spg)"/>'
  +'<path d="M96 108a50 50 0 1 0 58 70 39 39 0 1 1-58-70z" fill="#f1e8c4"/>'
  +'<path d="M0 470Q80 430 170 462T360 448V700H0z" fill="#0a2c26"/>'
  +'<circle cx="262" cy="452" r="140" fill="url(#hgl)"/>'+mosqueSil(290,452,1.25,'#05181a')
  +'<path d="M0 560Q120 500 240 542T360 528V700H0z" fill="#0e3b33"/>'
  +''
  +man(118,458,1.5)
  +'<path d="M0 640Q130 600 360 650V700H0z" fill="#082721" opacity=".9"/></svg>';
}
function sceneSunset(){
  return '<svg viewBox="0 0 360 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'
  +'<linearGradient id="ssk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2a2c"/><stop offset=".55" stop-color="#2f4a45"/><stop offset=".8" stop-color="#b5744a"/><stop offset="1" stop-color="#e7a45e"/></linearGradient></defs>'
  +'<rect width="360" height="160" fill="url(#ssk)"/>'+stars([[40,20],[90,34],[290,24],[330,48],[150,14]],'')
  +'<circle cx="270" cy="128" r="26" fill="#f5c777" opacity=".55"/>'
  +mosqueSil(190,146,1.05,'#0a1a1a')+'<path d="M0 150Q100 138 200 148T360 142V160H0z" fill="#07140f"/></svg>';
}
function sceneBook(){
  return '<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>'
  +'<radialGradient id="qbg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#1d5a48"/><stop offset="1" stop-color="#06201b"/></radialGradient>'
  +'<linearGradient id="qpg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8d9b0"/><stop offset=".5" stop-color="#f6ecd0"/><stop offset="1" stop-color="#e8d9b0"/></linearGradient></defs>'
  +'<rect width="360" height="150" fill="url(#qbg)"/>'
  +'<path d="M-10 150C30 110 60 90 95 100C70 120 60 140 50 160z" fill="#0b3a2d" opacity=".8"/><path d="M370 150C330 108 300 90 262 100C290 120 300 140 310 160z" fill="#0b3a2d" opacity=".8"/>'
  +'<path d="M180 118c-26-18-70-22-112-14v-52c42-8 86-4 112 14z" fill="url(#qpg)" stroke="#b98d3f" stroke-width="2"/><path d="M180 118c26-18 70-22 112-14v-52c-42-8-86-4-112 14z" fill="url(#qpg)" stroke="#b98d3f" stroke-width="2"/>'
  +'<g stroke="#a98a52" stroke-width="1.4" opacity=".75"><path d="M84 62h74M84 74h74M84 86h70M204 62h74M204 74h74M204 86h70"/></g>'
  +'<path d="M180 66v52" stroke="#b98d3f" stroke-width="2"/><path d="M60 122h240" stroke="#052019" stroke-width="10" opacity=".5"/></svg>';
}
function sceneHill(){
  return '<svg viewBox="0 0 360 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="hsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04100f"/><stop offset="1" stop-color="#103a33"/></linearGradient></defs>'
  +'<rect width="360" height="190" fill="url(#hsk)"/>'+stars([[40,30],[80,60],[300,28],[330,70],[200,20],[140,44]],'')
  +'<path d="M120 24a24 24 0 1 0 18 40 18 18 0 1 1-18-40z" fill="#f1e8c4" transform="translate(-10,0)"/>'
  +mosqueSil(250,150,1.1,'#061a17')+'<path d="M0 150Q120 120 240 148T360 140V190H0z" fill="#0b2f29"/></svg>';
}
function avMale(){return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 62c1-14 10-20 22-20s21 6 22 20z" fill="#c79a49"/><circle cx="32" cy="26" r="12" fill="#f1dcae"/><path d="M19 24c0-10 6-15 14-15 8 0 13 5 12 14-3-5-8-7-13-7s-10 2-13 8z" fill="#17352e"/></svg>'}
function avFemale(){return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6C20 6 14 15 14 28c0 6 2 10 4 13-8 3-12 9-13 21h54c-1-12-5-18-13-21 2-3 4-7 4-13C50 15 44 6 32 6z" fill="#c79a49"/><ellipse cx="32" cy="28" rx="10" ry="12" fill="#f1dcae"/></svg>'}
function forestDeco(){
  var tr='',xs=[22,64,104,146];
  xs.forEach(function(x,i){var h=62+((i*17)%28),b=118;tr+='<path d="M'+x+' '+(b-h)+'l14 22h-8l12 20h-9l12 20H'+(x-21)+'l12-20h-9l12-20h-8z" opacity="'+(.9-i*.08)+'"/>'});
  return '<svg class="deco" viewBox="0 0 190 120" aria-hidden="true"><g fill="#062e2c">'+tr+'</g><g fill="#f4ecd0"><circle cx="28" cy="16" r="1.2"/><circle cx="70" cy="30" r="1"/><circle cx="118" cy="12" r="1.3"/><circle cx="160" cy="34" r="1"/><circle cx="96" cy="48" r=".9"/></g></svg>'
}
function leafDeco(){return '<svg class="deco" viewBox="0 0 150 110" aria-hidden="true"><g fill="none" stroke="#6fd0aa" stroke-width="1.6" opacity=".7"><path d="M10 110C20 70 50 40 100 20"/><path d="M40 90c0-16 10-26 26-30M62 72c2-14 12-22 26-24M30 100c-14-6-20-16-18-28M80 52c-4-12 0-22 10-28"/></g><circle cx="120" cy="22" r="2" fill="#f0dc9c"/><circle cx="96" cy="8" r="1.4" fill="#f0dc9c"/><circle cx="136" cy="48" r="1.4" fill="#f0dc9c"/></svg>'}

/* ---------- data ---------- */
var ADHKAR=[
{id:'morning',title:'الصباح',items:[
{id:'m1',t:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',n:1},
{id:'m2',t:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',n:3},
{id:'m3',t:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',n:100},
{id:'m4',t:'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',n:100}]},
{id:'evening',title:'المساء',items:[
{id:'e1',t:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',n:1},
{id:'e2',t:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',n:3},
{id:'e3',t:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',n:33},
{id:'e4',t:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',n:33}]},
{id:'urge',title:'عند الرغبة',items:[
{id:'u1',t:'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',n:3},
{id:'u2',t:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',n:33},
{id:'u3',t:'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',n:10},
{id:'u4',t:'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ',n:33}]},
{id:'sleep',title:'قبل النوم',items:[
{id:'s1',t:'قراءة آية الكرسي (البقرة: 255)',n:1},
{id:'s2',t:'قراءة سور الإخلاص والفلق والناس ثم النفث في الكفين ومسح الجسد',n:3},
{id:'s3',t:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',n:1}]}
];
var DUAS=[
{t:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',s:'صحيح مسلم'},
{t:'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',s:'الترمذي'},
{t:'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',s:'أبو داود والترمذي'},
{t:'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',s:'أبو داود وابن ماجه'},
{t:'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',s:'البقرة: 201'},
{t:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',s:'سيد الاستغفار - البخاري'}
];
var MOTIV=[
{t:'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.',s:'صحيح البخاري · رقم 1',grade:'صحيح'},
{t:'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.',s:'صحيح البخاري · رقم 6018',grade:'صحيح'},
{t:'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',s:'صحيح البخاري · رقم 13',grade:'صحيح'},
{t:'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ.',s:'صحيح البخاري · رقم 2989',grade:'صحيح'},
{t:'مَنْ لَا يَرْحَمُ لَا يُرْحَمُ.',s:'صحيح البخاري · رقم 5997',grade:'صحيح'}
];

var currentHadithIndex=0,currentHadith=null,hadithRequest=0;
function hadithOfflinePool(){
  var pool=MOTIV.slice();
  try{var saved=JSON.parse(localStorage.getItem('alsaer_hadith_cache')||'[]');if(Array.isArray(saved))pool=pool.concat(saved.filter(function(x){return x&&x.t&&x.s}))}catch(e){}
  var seen={},unique=[];
  pool.forEach(function(x){var k=String(x.t||'').trim();if(k&&!seen[k]){seen[k]=1;unique.push(x)}});
  return unique;
}
function chooseHadithForOpen(){
  var pool=hadithOfflinePool(),prev='';
  try{prev=localStorage.getItem('alsaer_last_open_hadith_text')||''}catch(e){}
  var choices=pool.filter(function(x){return x.t!==prev}),pick=choices.length?choices[Math.floor(Math.random()*choices.length)]:pool[0];
  if(pick){currentHadith=pick;currentHadithIndex=Math.max(0,MOTIV.findIndex(function(x){return x.t===pick.t}))}
  var req=++hadithRequest;
  var books=[{id:'bukhari',name:'صحيح البخاري',count:6638},{id:'muslim',name:'صحيح مسلم',count:4930}];
  var book=books[Math.floor(Math.random()*books.length)],number=1+Math.floor(Math.random()*book.count);
  try{if(typeof fetch!=='function')return Promise.resolve(false)}catch(e){return Promise.resolve(false)}
  return fetch('https://api.hadith.gading.dev/books/'+book.id+'/'+number,{method:'GET',headers:{'Accept':'application/json'},cache:'no-store'})
    .then(function(r){if(!r.ok)throw new Error('network');return r.json()})
    .then(function(json){
      if(req!==hadithRequest)return false;
      var data=json&&json.data||{},h=data.hadith||data;
      var arab=h.arab||h.ar||h.arabic||h.text||'';
      var num=h.number||data.requested||number;
      if(typeof arab!=='string'||arab.trim().length<12)throw new Error('empty hadith');
      var item={t:arab.trim(),s:book.name+' · رقم '+num};
      currentHadith=item;
      try{
        var cache=JSON.parse(localStorage.getItem('alsaer_hadith_cache')||'[]');
        if(!Array.isArray(cache))cache=[];
        cache=cache.filter(function(x){return x&&x.t!==item.t});
        cache.unshift(item);localStorage.setItem('alsaer_hadith_cache',JSON.stringify(cache.slice(0,40)));
        localStorage.setItem('alsaer_last_open_hadith_text',item.t);
      }catch(e){}
      if(typeof tab!=='undefined'&&tab==='home'&&typeof unlocked!=='undefined'&&unlocked&&!splash&&!covered)render();
      return true;
    })
    .catch(function(){
      if(req!==hadithRequest)return false;
      var fallback=hadithOfflinePool(),opts=fallback.filter(function(x){return x.t!==prev});
      if(opts.length){currentHadith=opts[Math.floor(Math.random()*opts.length)];currentHadithIndex=Math.max(0,MOTIV.findIndex(function(x){return x.t===currentHadith.t}))}
      if(currentHadith)try{localStorage.setItem('alsaer_last_open_hadith_text',currentHadith.t)}catch(e){}
      if(typeof tab!=='undefined'&&tab==='home'&&typeof unlocked!=='undefined'&&unlocked&&!splash&&!covered)render();
      return false;
    });
}
chooseHadithForOpen();
var SOS=[
'قل: أعوذ بالله من الشيطان الرجيم، واستحضر أن الله يراك ويحبّ لك الخير.',
'غيّر مكانك فوراً: اخرج من الغرفة، اجلس مع أهلك، أو اخرج للمشي.',
'توضأ أو اغتسل بماء بارد، وصلِّ ركعتين إن استطعت.',
'ابتعد عن الهاتف أو أي شيء يثير الرغبة، وانشغل بشيء بدني: تمارين، ترتيب، رياضة.',
'اقرأ ما تيسّر من القرآن أو اذكر الله، وتذكّر أسبابك التي كتبتها.',
'انتظر؛ الرغبة تخفّ عادةً خلال دقائق. أنت أقوى منها.'
];

var MILES=[1,3,7,14,21,30,60,90,180,365];
var TRIG=[['bored','ملل'],['lonely','وحدة'],['late','سهر'],['phone','جوال أو مشاهد'],['stress','ضغط'],['tired','تعب']];
var HABITS=[['pray','صلاة في وقتها'],['quran','ورد من القرآن'],['sport','رياضة أو مشي'],['sleep','نوم مبكر'],['nophone','الجوال بعيد عن السرير ليلاً']];
var PR=[['fajr','الفجر'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']];
var TTIPS={bored:'ضع جدولاً لوقت الفراغ وجهّز نشاطين جاهزين: مشي أو رياضة أو مكالمة صديق.',lonely:'اقترب من الناس: أهلك وأصدقاؤك ومسجد الحي. العزلة بيئة مناسبة للرغبة.',late:'حدّد وقتاً ثابتاً للنوم ولا تبقَ مستيقظاً وحدك على الجوال بعده.',phone:'فعّل حجب المواقع والتطبيقات المثيرة، واجعل الجوال خارج الغرفة وقت النوم.',stress:'جهّز بدائل للتفريغ: وضوء وصلاة ومشي سريع وتنفّس عميق قبل أن تقوى الرغبة.',tired:'النوم الكافي وانتظام الوجبات يقللان الاندفاع، فلا تجعل التعب حالتك الدائمة.'};
var GTIPS=['فعّل حجب المواقع على الجوال والحاسوب وعلى الراوتر إن أمكن.','لا تدخل الغرفة أو الحمام بالجوال وحدك.','نم عند أول شعور بالنعاس، ولا تستلقِ على السرير مستيقظاً.','ابدأ يومك بحركة: مشي ١٥ دقيقة يغيّر المزاج كله.','حدّد ما ستفعله في أوقاتك الحرجة قبل أن تأتي، ولا تنتظر الرغبة لتتحرك.','أخبر شخصاً موثوقاً بتقدمك إن أمكن، فالمصارحة تخفف الحمل.'];
var QURAN_PAGES=604;

function dk(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parse(k){var p=k.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])}
function def(){return{startDate:dk(),days:{},reasons:[],pin:null,counters:{},seen:[],gender:null,profile:{name:'',age:'',photo:''},prayers:{},ptimes:{},quran:{goal:2,log:{},pos:1,fs:26},ui:{},worship:{},customWorship:[],myHabits:[],extraHabits:[],habitCounts:{},fasting:{prefs:{monThu:true,whiteDays:true,ashura:false,arafa:false,shawwal:false,dawud:false},records:{},customDates:[],reminders:{enabled:true,beforeDay:true,suhoor:true,suhoorTime:'03:30',iftar:false,iftarTime:'17:00'},dawudAnchor:dk()},updatedAt:Date.now()}}
function fixShape(o){
  var isO=function(v){return !!v&&typeof v==='object'&&!Array.isArray(v)};
  if(!isO(o.prayers))o.prayers={};if(!isO(o.ptimes))o.ptimes={};
  if(!isO(o.quran))o.quran={goal:2,log:{},pos:1,fs:26};if(!isO(o.quran.log))o.quran.log={};
  var g=parseInt(o.quran.goal,10);o.quran.goal=(g>=1&&g<=30)?g:2;var ps=parseInt(o.quran.pos,10);o.quran.pos=(ps>=1&&ps<=604)?ps:1;var fz=parseInt(o.quran.fs,10);o.quran.fs=(fz>=18&&fz<=44)?fz:26;
  if(!isO(o.profile))o.profile={name:'',age:'',photo:''};o.profile.name=String(o.profile.name||'').slice(0,40);o.profile.age=String(o.profile.age||'').slice(0,3);o.profile.photo=typeof o.profile.photo==='string'&&o.profile.photo.indexOf('data:image/')===0&&o.profile.photo.length<100000?o.profile.photo:'';
  if(!isO(o.ui))o.ui={};
  if(o.lockType!=='pattern'||!o.pin)delete o.lockType;
  if(o.quran.riwaya!=='warsh')o.quran.riwaya='hafs';
  if(!isO(o.worship))o.worship={};
  if(!Array.isArray(o.customWorship))o.customWorship=[];o.customWorship=o.customWorship.filter(function(x){return x&&typeof x.id==='string'&&typeof x.t==='string'}).slice(0,30).map(function(x){return{id:x.id.slice(0,28),t:x.t.slice(0,60)}});
  Object.keys(o.worship).slice(0,5000).forEach(function(k){if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!isO(o.worship[k]))delete o.worship[k];else{Object.keys(o.worship[k]).forEach(function(id){if(typeof o.worship[k][id]!=='boolean')delete o.worship[k][id]})}});
  if(!Array.isArray(o.myHabits))o.myHabits=[];
  o.myHabits=o.myHabits.filter(function(h){return h&&typeof h.id==='string'&&typeof h.t==='string'}).slice(0,30).map(function(h){return{id:h.id.slice(0,24),t:h.t.slice(0,60)}});
  if(!Array.isArray(o.extraHabits))o.extraHabits=[];
  o.extraHabits=o.extraHabits.filter(function(h){return h&&typeof h.id==='string'&&typeof h.t==='string'&&(h.type==='good'||h.type==='bad')}).slice(0,40).map(function(h){return{id:h.id.slice(0,28),t:h.t.slice(0,60),type:h.type}});
  if(!o.habitCounts||typeof o.habitCounts!=='object'||Array.isArray(o.habitCounts))o.habitCounts={};
  if(!o.fasting||typeof o.fasting!=='object')o.fasting=def().fasting;
  var fd=def().fasting;o.fasting.prefs=Object.assign({},fd.prefs,o.fasting.prefs||{});
  o.fasting.records=o.fasting.records&&typeof o.fasting.records==='object'?o.fasting.records:{};
  o.fasting.customDates=Array.isArray(o.fasting.customDates)?o.fasting.customDates.filter(function(x){return /^\\d{4}-\\d{2}-\\d{2}$/.test(x)}).slice(0,100):[];
  o.fasting.reminders=Object.assign({},fd.reminders,o.fasting.reminders||{});
  if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(o.fasting.dawudAnchor||''))o.fasting.dawudAnchor=dk();
  return o;
}
function load(){try{var r=localStorage.getItem(KEY);if(r)return fixShape(Object.assign(def(),JSON.parse(r)))}catch(e){}return mem||def()}
function save(){S.updatedAt=Date.now();mem=S;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('تعذر حفظ البيانات؛ مساحة التخزين قد تكون ممتلئة')}}
async function hashPin(pin,salt){
  if(!window.crypto||!crypto.subtle||!window.TextEncoder)throw new Error('SECURE_CRYPTO_UNAVAILABLE');
  var enc=new TextEncoder(),base=await crypto.subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveBits']);
  var bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:180000,hash:'SHA-256'},base,256);
  return Array.from(new Uint8Array(bits)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
}
async function makePinRecord(pin){var salt=crypto.getRandomValues(new Uint8Array(16));return{type:'pbkdf2-sha256',salt:Array.from(salt).map(function(b){return b.toString(16).padStart(2,'0')}).join(''),hash:await hashPin(pin,salt),iterations:180000}}
async function verifyPin(pin,record){
  if(typeof record==='string')return pin===record; // legacy PIN; migrate after successful unlock
  if(!record||record.type!=='pbkdf2-sha256'||!record.salt||!record.hash)return false;
  var salt=new Uint8Array(record.salt.match(/.{2}/g).map(function(x){return parseInt(x,16)}));
  return (await hashPin(pin,salt))===record.hash;
}
function validBackup(o){
  if(!o||typeof o!=='object'||Array.isArray(o))return false;
  var obj=function(v){return !!v&&typeof v==='object'&&!Array.isArray(v)};
  if(!obj(o.days)||!obj(o.counters)||!Array.isArray(o.reasons||[])||!obj(o.habits||{})||!Array.isArray(o.urges||[])||!Array.isArray(o.seen||[]))return false;
  if(o.prayers!==undefined&&!obj(o.prayers))return false;
  if(o.ptimes!==undefined&&!obj(o.ptimes))return false;
  if(o.quran!==undefined&&(!obj(o.quran)||(o.quran.log!==undefined&&!obj(o.quran.log))))return false;
  if(o.myHabits!==undefined&&(!Array.isArray(o.myHabits)||o.myHabits.length>30))return false;
  if(o.extraHabits!==undefined&&(!Array.isArray(o.extraHabits)||o.extraHabits.length>40))return false;
  if(o.habitCounts!==undefined&&!obj(o.habitCounts))return false;
  if(o.worship!==undefined&&!obj(o.worship))return false;
  if(o.fasting!==undefined&&!obj(o.fasting))return false;
  if(o.startDate&&!/^\d{4}-\d{2}-\d{2}$/.test(o.startDate))return false;
  if(Object.keys(o.days).length>5000||Object.keys(o.counters).length>5000||(o.reasons||[]).length>500||(o.urges||[]).length>50000)return false;
  for(var k of Object.keys(o.days)){var d=o.days[k];if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!obj(d)||!['success','relapse'].includes(d.status)||typeof (d.note||'')!=='string'||(d.note||'').length>4000||!Array.isArray(d.trig||[]))return false;}
  for(var k2 of Object.keys(o.counters)){if(!/^\d{4}-\d{2}-\d{2}$/.test(k2)||!obj(o.counters[k2]))return false;for(var id of Object.keys(o.counters[k2])){var n=o.counters[k2][id];if(!Number.isInteger(n)||n<0||n>100000)return false;}}
  if((o.reasons||[]).some(function(x){return typeof x!=='string'||x.length>1000;}))return false;
  if(Object.keys(o.habits||{}).length>5000)return false;
  return true;
}
var LOCK_KEY='alsaer_lock_guard_v1';
function lockState(){try{return JSON.parse(localStorage.getItem(LOCK_KEY)||'{"fails":0,"until":0}')}catch(e){return{fails:0,until:0}}}
function setLockState(v){try{localStorage.setItem(LOCK_KEY,JSON.stringify(v))}catch(e){}}
function lockRemaining(){return Math.max(0,(lockState().until||0)-Date.now())}
function recordBadPin(){var x=lockState();x.fails=(x.fails||0)+1;if(x.fails>=5){var level=Math.min(6,Math.floor(x.fails/5));x.until=Date.now()+Math.min(30*60*1000,Math.pow(2,level-1)*30000)}setLockState(x);return lockRemaining()}
function clearBadPins(){setLockState({fails:0,until:0})}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ---------- derived data ---------- */
function allHabits(){return HABITS.concat((S.myHabits||[]).map(function(h){return [h.id,h.t,true]})).concat((S.extraHabits||[]).filter(function(h){return h.type==='good'}).map(function(h){return [h.id,h.t,true]}))}
function qPages(k){return (S.quran.log[k]||0)}
function dayDone(k){
  var p=S.prayers[k]||{},h=(S.habits||{})[k]||{},n=0;
  PR.forEach(function(x){if(p[x[0]])n++});
  allHabits().forEach(function(x){if(h[x[0]])n++});
  if(qPages(k)>=S.quran.goal)n++;
  return n;
}
function dayTotal(){return PR.length+allHabits().length+1}
function periodStats(N){
  var ok=0,rel=0,tot=0,done=0,active=0,T=dayTotal();
  for(var i=0;i<N;i++){var d=new Date();d.setDate(d.getDate()-i);var k=dk(d),r=S.days[k],dn=dayDone(k);
    if(r){tot++;if(r.status==='success')ok++;else if(r.status==='relapse')rel++}
    if(r||dn>0){active++;done+=dn}}
  return{ok:ok,rel:rel,tot:tot,rate:active?Math.min(100,Math.round(done/(active*T)*100)):0,active:active};
}
function stats(){
  var today=dk(),v=Object.keys(S.days||{}).map(function(k){return S.days[k]});
  var ok=v.filter(function(x){return x&&x.status==='success'}).length;
  var rel=v.filter(function(x){return x&&x.status==='relapse'}).length;
  var cur=0,best=0,start=parse(S.startDate),end=parse(today);
  for(var d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    var rec=S.days[dk(d)];
    if(rec&&rec.status==='success')cur++;
    else cur=0;
    if(cur>best)best=cur;
  }
  cur=0;
  var cursor=new Date(end),todayRec=S.days[today];
  if(!todayRec)cursor.setDate(cursor.getDate()-1);
  for(;cursor>=start;cursor.setDate(cursor.getDate()-1)){
    var dayRec=S.days[dk(cursor)];
    if(dayRec&&dayRec.status==='success')cur++;
    else break;
  }
  var total=ok+rel;
  return{cur:cur,best:best,ok:ok,rel:rel,rate:total?Math.round(ok/total*100):0};
}
function groupDone(){
  var c=S.counters||{};
  return Object.keys(c).some(function(day){return ADHKAR.some(function(g){return g.items.every(function(it){return (c[day][it.id]||0)>=it.n})})});
}
function achievements(){
  var s=stats(),list=[];
  MILES.forEach(function(n){list.push({id:'s'+n,kind:'streak',n:n,title:n===1?'اليوم الأول':n+' يوماً',desc:'سلسلة '+n+(n<11?' أيام':' يوماً')+' متتالية',done:s.best>=n,p:Math.min(1,s.cur/n)})});
  var notes=Object.keys(S.days).filter(function(k){return S.days[k].note}).length;
  list.push({id:'first',icon:'flag',title:'أول خطوة',desc:'سجّل أول يوم لك',done:Object.keys(S.days).length>=1,p:Math.min(1,Object.keys(S.days).length)});
  list.push({id:'ok10',icon:'star',title:'١٠ أيام نجاح',desc:'عشرة أيام نجاح مسجّلة',done:s.ok>=10,p:Math.min(1,s.ok/10)});
  list.push({id:'ok50',icon:'trophy',title:'٥٠ يوم نجاح',desc:'خمسون يوماً مسجّلاً بنجاح',done:s.ok>=50,p:Math.min(1,s.ok/50)});
  list.push({id:'back',icon:'up',title:'عدتُ أقوى',desc:'أكمل ٣ أيام بعد انتكاسة',done:s.rel>0&&s.cur>=3,p:s.rel>0?Math.min(1,s.cur/3):0});
  list.push({id:'why',icon:'heart',title:'أعرف لماذا',desc:'اكتب ٣ أسباب للإقلاع',done:S.reasons.length>=3,p:Math.min(1,S.reasons.length/3)});
  list.push({id:'wird',icon:'beads',title:'ورد كامل',desc:'أتمّ كل أذكار مجموعة في يوم',done:groupDone(),p:groupDone()?1:0});
  list.push({id:'note',icon:'pen',title:'أتأمل نفسي',desc:'اكتب ٥ ملاحظات يومية',done:notes>=5,p:Math.min(1,notes/5)});
  var urges=(S.urges||[]).length;
  list.push({id:'urge5',icon:'shield',title:'حارس القلب',desc:'تجاوز ٥ رغبات',done:urges>=5,p:Math.min(1,urges/5)});
  var pd=Object.keys(S.habits||{}).filter(function(k){return HABITS.every(function(h){return S.habits[k][h[0]]})}).length;
  list.push({id:'plan3',icon:'check',title:'ملتزم بالخطة',desc:'أكمل خطة اليوم ٣ أيام',done:pd>=3,p:Math.min(1,pd/3)});
  var td=Object.keys(S.days).filter(function(k){return (S.days[k].trig||[]).length}).length;
  list.push({id:'know',icon:'star',title:'أعرف نفسي',desc:'سجّل المحفّزات في ٥ أيام',done:td>=5,p:Math.min(1,td/5)});
  var pf=Object.keys(S.prayers).filter(function(k){return PR.every(function(p){return S.prayers[k][p[0]]})}).length;
  list.push({id:'pr7',icon:'mosque',title:'محافظ على الصلاة',desc:'أتمّ الصلوات الخمس في ٧ أيام',done:pf>=7,p:Math.min(1,pf/7)});
  var tp=0;Object.keys(S.quran.log).forEach(function(d){tp+=S.quran.log[d]||0});
  list.push({id:'khatma',icon:'book',title:'ختمة المصحف',desc:'اقرأ ٦٠٤ صفحات',done:tp>=604,p:Math.min(1,tp/604)});
  var wp=totalWorshipPoints();
  [10,25,50,100,250,500].forEach(function(n){list.push({id:'worship'+n,icon:'star',title:n+' نقطة عبادات',desc:'اجمع '+n+' نقطة من عباداتك اليومية',done:wp>=n,p:Math.min(1,wp/n)})});
  return list;
}
function rankName(b){return b<3?'بداية الطريق':b<7?'خطوة ثابتة':b<30?'عزيمة':b<90?'إرادة صلبة':'ثبات'}

/* ---------- state ---------- */
var S=load(), tab='home', unlocked=!S.pin, draft=null, draftTrig=null, covered=false, confirmRelapse=false, confirmReset=false;
var calD=new Date(), calSel=null, group='morning', qi=new Date().getDate(), secs=null, tmr=null, msg='', toastT=null;
var lastTab=null,navTrail=['home'],backPopHandling=false,backHistoryReady=false,pressKey=null,pressXY=null,splash=true, obStep=1, obGender='male', per='week', addingHabit=false, addingHabitType='good', addingWorship=false, showPrivacy=false, showLog=false, showIdx=false, rd=null, setOpen=null;
var app=document.getElementById('app'), tabs=document.getElementById('tabs'), top=document.getElementById('top'), toastEl=document.getElementById('toast');
var NAV=[['home','الرئيسية','home'],['calendar','التقويم','cal'],['progress','التقدم','chart'],['more','المزيد','menu']];
var PARENT={worship:'home',reminders:'home',fasting:'home',reader:'quran',prayers:'home',quran:'home',adhkar:'home',habits:'home',boost:'more',ach:'more',developer:'more',settings:'more'};
var TITLES={worship:'عباداتي اليوم',reminders:'تذكيرات اليوم',fasting:'الصيام والتذكير',reader:'المصحف الشريف',calendar:'التقويم والمتابعة',progress:'التقدم والتقييم',more:'المزيد',prayers:'الصلوات',quran:'القرآن الكريم',adhkar:'الأذكار والأدعية',habits:'العادات والتغيير',boost:'محفزات ولحظة الرغبة',ach:'الإنجازات والشارات',developer:'المطوّر وحقوق التطبيق',settings:'الإعدادات'};
var TICON={worship:'sparkles',reminders:'bell',fasting:'moon',reader:'book',calendar:'cal',progress:'chart',more:'menu',prayers:'mosque',quran:'book',adhkar:'beads',habits:'target',boost:'shield',ach:'trophy',developer:'star',settings:'gear'};

var ACC=[{id:'maleem',n:'الأصلي',l:'#017D84',l2:'#00535F',d:'#0E8A86',d2:'#0A4A51',g:'#5FCFC1'},
{id:'green',n:'أخضر',l:'#0E6B57',l2:'#0A5243',d:'#2FA586',d2:'#13574A'},{id:'blue',n:'أزرق',l:'#1D5FBF',l2:'#164A94',d:'#4C8DF0',d2:'#1B3F78'},
{id:'purple',n:'بنفسجي',l:'#6D3FC0',l2:'#532F96',d:'#9B7BEA',d2:'#43287A'},{id:'pink',n:'وردي',l:'#C2366E',l2:'#962A56',d:'#EC6A9C',d2:'#7A2348'},
{id:'orange',n:'برتقالي',l:'#C2571A',l2:'#964314',d:'#F08A4B',d2:'#7A3912'},{id:'teal',n:'تركواز',l:'#0E7490',l2:'#0B5A70',d:'#2BB3D3',d2:'#0E4C5E'},
{id:'terracotta',n:'طوبي',l:'#B5532A',l2:'#8E3F1F',d:'#E08A5C',d2:'#6E301A'},{id:'ocean',n:'محيط',l:'#0B5C86',l2:'#084664',d:'#4FB0E0',d2:'#0E4560'},
{id:'gold',n:'ذهبي',l:'#9A7410',l2:'#7A5C0C',d:'#B38B1C',d2:'#6B5410'}];
var STY={calm:{n:'هادئ',dark:false,pv:['#EEF6F6','#FFFFFF','#017D84']},midnight:{n:'منتصف الليل',dark:true,pv:['#000000','#1A1A1F','#4C8DF0']},paper:{n:'ورقي دافئ',dark:false,pv:['#F6F1E7','#FFFBF3','#B5532A']},royal:{n:'ملكي',dark:true,pv:['#0A1020','#1B2540','#D4AF37']},ocean:{n:'محيط',dark:false,pv:['#EAF3F8','#FFFFFF','#0B5C86']}};
var LOOKS=[['classic','كلاسيك','الشكل الأصلي'],['flat','مسطح','حدود رفيعة بلا ظلال'],['compact','مضغوط','مسافات أقل وخط أصغر'],['comfy','مريح','خط وأزرار أكبر'],['soft','ناعم','حواف دائرية']];
var FONTS=[['plex','الأصلي'],['cairo','كايرو'],['tajawal','تجوّل'],['almarai','المراعي'],['alexandria','الإسكندرية'],['readex','ريدكس']];
var PRESSES=[['bounce','نابضة','ينضغط الزر ويرتد قليلًا'],['soft','هادئة','ضغطة خفيفة بلا ارتداد'],['ripple','موجة','دائرة تمتد من مكان لمسك'],['glow','توهّج','حلقة بلون التطبيق حول الزر'],['none','بلا','بلا أي حركة']];
var TRANSES=[['rise','ناعمة','تظهر الشاشة وترتفع قليلًا'],['slide','انزلاق','تدخل الشاشة من الجانب'],['zoom','تكبير','تكبر الشاشة وهي تظهر'],['fade','تلاشٍ','تظهر بهدوء في مكانها'],['none','فورية','بلا حركة']];
function pick(list,v,def){for(var i=0;i<list.length;i++){var id=Array.isArray(list[i])?list[i][0]:list[i];if(id===v)return v}return def}
function U(){var u=S.ui||(S.ui={});return u}
function uiMode(){var m=U().mode;if(m!=='light'&&m!=='dark'&&m!=='system'){try{m=localStorage.getItem(TKEY)==='light'?'light':'dark'}catch(e){m='dark'}}return m}
function isDark(){return document.documentElement.getAttribute('data-theme')!=='light'}
function mix(h,w,p){var c=function(s,i){return parseInt(s.substr(i,2),16)};var o='#';for(var i=1;i<7;i+=2){var v=Math.round(c(h,i)*(1-p)+c(w,i)*p);o+=(v<16?'0':'')+v.toString(16)}return o}
/* ---- English UI (runtime translation of Arabic UI strings; religious texts stay Arabic) ---- */
var SUR_EN=['Al-Fatihah','Al-Baqarah','Al Imran','An-Nisa','Al-Ma\'idah','Al-An\'am','Al-A\'raf','Al-Anfal','At-Tawbah','Yunus','Hud','Yusuf','Ar-Ra\'d','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha','Al-Anbiya','Al-Hajj','Al-Mu\'minun','An-Nur','Al-Furqan','Ash-Shu\'ara','An-Naml','Al-Qasas','Al-\'Ankabut','Ar-Rum','Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqi\'ah','Al-Hadid','Al-Mujadilah','Al-Hashr','Al-Mumtahanah','As-Saff','Al-Jumu\'ah','Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Ma\'arij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Nazi\'at','\'Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-A\'la','Al-Ghashiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-\'Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-\'Adiyat','Al-Qari\'ah','At-Takathur','Al-\'Asr','Al-Humazah','Al-Fil','Quraysh','Al-Ma\'un','Al-Kawthar','Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'];
var EN={
'يناير':'January','فبراير':'February','مارس':'March','أبريل':'April','مايو':'May','يونيو':'June','يوليو':'July','أغسطس':'August','سبتمبر':'September','أكتوبر':'October','نوفمبر':'November','ديسمبر':'December',
'السبت':'Saturday','الأحد':'Sunday','الاثنين':'Monday','الثلاثاء':'Tuesday','الأربعاء':'Wednesday','الخميس':'Thursday','الجمعة':'Friday',
'ح':'Su','ن':'Mo','ث':'Tu','ر':'We','خ':'Th','ج':'Fr','س':'Sa',
'الصباح':'Morning','المساء':'Evening','عند الرغبة':'When tempted','قبل النوم':'Before sleep','أدعية':'Duas','آيات':'Verses',
'صحيح مسلم':'Sahih Muslim','الترمذي':'At-Tirmidhi','أبو داود والترمذي':'Abu Dawud & At-Tirmidhi','أبو داود وابن ماجه':'Abu Dawud & Ibn Majah','سيد الاستغفار - البخاري':'Sayyid al-Istighfar – Al-Bukhari','حديث حسن - ابن ماجه':'Hasan hadith – Ibn Majah',
'قراءة آية الكرسي (البقرة: 255)':'Recite Ayat al-Kursi (Al-Baqarah: 255)','قراءة سور الإخلاص والفلق والناس ثم النفث في الكفين ومسح الجسد':'Recite Al-Ikhlas, Al-Falaq and An-Nas, blow into your palms and wipe over your body',
'البقرة: 201':'Al-Baqarah: 201','النور: 30':'An-Nur: 30','الطلاق: 2':'At-Talaq: 2','الرعد: 28':'Ar-Ra\'d: 28','البقرة: 222':'Al-Baqarah: 222','الزمر: 53':'Az-Zumar: 53',
'الرغبة موجة؛ تعلو وتنكسر خلال دقائق إن لم تغذِّها. اصبر قليلاً فقط.':'Urges are waves: they rise and break within minutes if you do not feed them. Just be patient a little.',
'كل يوم تنتصر فيه هو لبنة في بناء شخصيتك وإرادتك.':'Every day you win is a brick in building your character and willpower.',
'الانتكاسة ليست نهاية الطريق؛ هي درس. قم، تُب، وابدأ من جديد فوراً.':'A relapse is not the end of the road; it is a lesson. Get up, repent, and start again right away.',
'النوم المبكر والرياضة وتجنّب العزلة والفراغ من أقوى أسلحتك.':'Early sleep, exercise, and avoiding isolation and idle time are among your strongest weapons.',
'لا تُحاسب نفسك على الماضي؛ ركّز على يومك هذا فقط.':'Do not judge yourself over the past; focus on today only.',
'قل: أعوذ بالله من الشيطان الرجيم، واستحضر أن الله يراك ويحبّ لك الخير.':'Say: "I seek refuge in Allah from the accursed Satan," and remember that Allah sees you and wants good for you.',
'غيّر مكانك فوراً: اخرج من الغرفة، اجلس مع أهلك، أو اخرج للمشي.':'Change your place right away: leave the room, sit with your family, or go for a walk.',
'توضأ أو اغتسل بماء بارد، وصلِّ ركعتين إن استطعت.':'Perform wudu or take a cold shower, and pray two rak\'ahs if you can.',
'ابتعد عن الهاتف أو أي شيء يثير الرغبة، وانشغل بشيء بدني: تمارين، ترتيب، رياضة.':'Stay away from your phone or anything that stirs the urge, and do something physical: exercise, tidying, sports.',
'اقرأ ما تيسّر من القرآن أو اذكر الله، وتذكّر أسبابك التي كتبتها.':'Read some Quran or remember Allah, and recall the reasons you wrote down.',
'انتظر؛ الرغبة تخفّ عادةً خلال دقائق. أنت أقوى منها.':'Wait; the urge usually fades within minutes. You are stronger than it.',
'ملل':'Boredom','وحدة':'Loneliness','سهر':'Late nights','جوال أو مشاهد':'Phone or triggering content','ضغط':'Stress','تعب':'Fatigue',
'صلاة في وقتها':'Pray on time','ورد من القرآن':'Daily Quran portion','رياضة أو مشي':'Exercise or walk','نوم مبكر':'Sleep early','الجوال بعيد عن السرير ليلاً':'Phone away from bed at night',
'الفجر':'Fajr','الظهر':'Dhuhr','العصر':'Asr','المغرب':'Maghrib','العشاء':'Isha',
'ضع جدولاً لوقت الفراغ وجهّز نشاطين جاهزين: مشي أو رياضة أو مكالمة صديق.':'Plan your free time and have two activities ready: a walk, exercise, or a call with a friend.',
'اقترب من الناس: أهلك وأصدقاؤك ومسجد الحي. العزلة بيئة مناسبة للرغبة.':'Be close to people: your family, friends and the local mosque. Isolation is fertile ground for urges.',
'حدّد وقتاً ثابتاً للنوم ولا تبقَ مستيقظاً وحدك على الجوال بعده.':'Set a fixed bedtime and do not stay up alone on your phone afterwards.',
'فعّل حجب المواقع والتطبيقات المثيرة، واجعل الجوال خارج الغرفة وقت النوم.':'Enable blocking for triggering sites and apps, and keep your phone outside the room at bedtime.',
'جهّز بدائل للتفريغ: وضوء وصلاة ومشي سريع وتنفّس عميق قبل أن تقوى الرغبة.':'Prepare outlets: wudu, prayer, a brisk walk and deep breathing before the urge gets strong.',
'النوم الكافي وانتظام الوجبات يقللان الاندفاع، فلا تجعل التعب حالتك الدائمة.':'Enough sleep and regular meals reduce impulsiveness, so do not let fatigue become your permanent state.',
'فعّل حجب المواقع على الجوال والحاسوب وعلى الراوتر إن أمكن.':'Enable site blocking on your phone, computer and, if possible, your router.',
'لا تدخل الغرفة أو الحمام بالجوال وحدك.':'Do not go into the room or bathroom alone with your phone.',
'نم عند أول شعور بالنعاس، ولا تستلقِ على السرير مستيقظاً.':'Sleep at the first sign of drowsiness, and do not lie in bed awake.',
'ابدأ يومك بحركة: مشي ١٥ دقيقة يغيّر المزاج كله.':'Start your day with movement: a 15-minute walk changes your whole mood.',
'حدّد ما ستفعله في أوقاتك الحرجة قبل أن تأتي، ولا تنتظر الرغبة لتتحرك.':'Decide what you will do in your critical moments before they come, and do not wait for the urge to act.',
'أخبر شخصاً موثوقاً بتقدمك إن أمكن، فالمصارحة تخفف الحمل.':'Tell someone you trust about your progress if possible; openness lightens the load.',
'تعذر حفظ البيانات؛ مساحة التخزين قد تكون ممتلئة':'Could not save data; storage may be full',
'اليوم الأول':'First day','أول خطوة':'First step','سجّل أول يوم لك':'Log your first day','١٠ أيام نجاح':'10 success days','عشرة أيام نجاح مسجّلة':'Ten success days logged','٥٠ يوم نجاح':'50 success days','خمسون يوماً مسجّلاً بنجاح':'Fifty successful days logged',
'عدتُ أقوى':'Came back stronger','أكمل ٣ أيام بعد انتكاسة':'Complete 3 days after a relapse','أعرف لماذا':'I know why','اكتب ٣ أسباب للإقلاع':'Write 3 reasons to quit','ورد كامل':'Complete wird','أتمّ كل أذكار مجموعة في يوم':'Finish all adhkar of a group in a day',
'أتأمل نفسي':'Self-reflection','اكتب ٥ ملاحظات يومية':'Write 5 daily notes','حارس القلب':'Guardian of the heart','تجاوز ٥ رغبات':'Overcome 5 urges','ملتزم بالخطة':'Sticking to the plan','أكمل خطة اليوم ٣ أيام':'Complete the daily plan for 3 days',
'أعرف نفسي':'I know myself','سجّل المحفّزات في ٥ أيام':'Log triggers on 5 days','محافظ على الصلاة':'Steady in prayer','أتمّ الصلوات الخمس في ٧ أيام':'Complete all five prayers on 7 days','ختمة المصحف':'Quran completion','اقرأ ٦٠٤ صفحات':'Read 604 pages',
'بداية الطريق':'Start of the road','خطوة ثابتة':'Steady step','عزيمة':'Determination','إرادة صلبة':'Strong will','ثبات':'Steadfastness',
'الرئيسية':'Home','التقويم':'Calendar','التقدم':'Progress','المزيد':'More',
'تذكيرات اليوم':'Today\'s reminders','المصحف الشريف':'The Holy Quran','التقويم والمتابعة':'Calendar & tracking','التقدم والتقييم':'Progress & review','الصلوات':'Prayers','القرآن الكريم':'The Holy Quran','الأذكار والأدعية':'Adhkar & duas','العادات والتغيير':'Habits & change','محفزات ولحظة الرغبة':'Triggers & urge moments','الإنجازات والشارات':'Achievements & badges','المطوّر وحقوق التطبيق':'Developer & rights','الإعدادات':'Settings',
'الأصلي':'Original','أخضر':'Green','أزرق':'Blue','بنفسجي':'Purple','وردي':'Pink','برتقالي':'Orange','تركواز':'Turquoise','طوبي':'Terracotta','محيط':'Ocean','ذهبي':'Gold',
'هادئ':'Calm','منتصف الليل':'Midnight','ورقي دافئ':'Warm paper','ملكي':'Royal',
'كلاسيك':'Classic','الشكل الأصلي':'The original look','مسطح':'Flat','حدود رفيعة بلا ظلال':'Thin borders, no shadows','مضغوط':'Compact','مسافات أقل وخط أصغر':'Less spacing, smaller text','مريح':'Comfy','خط وأزرار أكبر':'Larger text and buttons','ناعم':'Soft','حواف دائرية':'Rounded corners',
'كايرو':'Cairo','تجوّل':'Tajawal','المراعي':'Almarai','الإسكندرية':'Alexandria','ريدكس':'Readex',
'نابضة':'Bouncy','ينضغط الزر ويرتد قليلًا':'The button presses and bounces back slightly','هادئة':'Gentle','ضغطة خفيفة بلا ارتداد':'A light press with no bounce','موجة':'Ripple','دائرة تمتد من مكان لمسك':'A circle spreads from where you touch','توهّج':'Glow','حلقة بلون التطبيق حول الزر':'A ring in the app colour around the button','بلا':'None','بلا أي حركة':'No motion at all',
'ناعمة':'Smooth','تظهر الشاشة وترتفع قليلًا':'The screen appears and rises slightly','انزلاق':'Slide','تدخل الشاشة من الجانب':'The screen enters from the side','تكبير':'Zoom','تكبر الشاشة وهي تظهر':'The screen scales up as it appears','تلاشٍ':'Fade','تظهر بهدوء في مكانها':'It appears quietly in place','فورية':'Instant','بلا حركة':'No motion',
'الوضع':'Mode','تلقائي':'Auto','فاتح':'Light','داكن':'Dark','النمط':'Style','لون التطبيق':'App colour','شكل الواجهة':'Interface look','الخط':'Font','أبجد':'Abc','عادي':'Regular','عريض':'Bold','حركة الضغط':'Press animation','حركة الانتقال':'Transition animation','المظهر':'Appearance','اللغة':'Language',
'إنجاز جديد: ':'New achievement: ',
'© 2026 جميع الحقوق محفوظة لـ أحمد العجمي':'© 2026 All rights reserved to Ahmed Al-Ajmi','© 2026 AHMED ELAGAMY · جميع الحقوق محفوظة':'© 2026 AHMED ELAGAMY · All rights reserved',
'السائر إلى الله':'Al-Sa\'ir ila Allah','رحلة نحو القرب من الله':'A journey toward closeness to Allah','وتحسين حياتك':'and improving your life',
'اختر نوعك':'Choose your type','لتقديم تجربة مناسبة لك':'To give you a suitable experience','أنثى':'Female','ذكر':'Male','متابعة':'Continue','ابدأ رحلتك':'Start your journey','خطوتان بسيطتان، ويمكنك تركهما كما هما':'Two simple steps, and you can leave them as they are',
'منذ كم يوماً وأنت ثابت؟':'How many days have you been steadfast?','ما أهم سبب يدفعك للإقلاع؟':'What is the most important reason that drives you to quit?','ابدأ':'Start','تخطي':'Skip',
'تذكير بالصلاة':'Prayer reminder','تمت':'Done','متابعة ورد القرآن':'Quran portion reminder','ابدأ القراءة':'Start reading','القرآن':'Quran','أحسنت':'Well done','أتممت صلواتك ووردك اليوم، تقبّل الله منك.':'You completed your prayers and Quran portion today. May Allah accept it from you.',
'دعمك اليوم':'Support for today','هل تحتاج مساعدة لتجاوز رغبة الآن؟':'Do you need help getting through an urge right now?','أنا بخير':'I\'m fine','ساعدني':'Help me','هذه تذكيرات داخل التطبيق بحسب ما سجّلته اليوم.':'These are in-app reminders based on what you logged today.',
'السلام عليكم':'Peace be upon you','رحلتك مستمرة':'Your journey continues','كل يوم بداية جديدة':'Every day is a new beginning','إنجاز اليوم':'Today\'s progress','الأذكار':'Adhkar','الصباح والمساء':'Morning & evening','العادات':'Habits','رحلة الثبات':'The steadfastness journey',
'يوم متتالٍ':'day streak','أطول سلسلة':'Longest streak','أيام النجاح':'Success days','نسبة النجاح':'Success rate','تسجيل اليوم':'Log today','تم اليوم':'Done today','فعلتها':'I slipped','تأكيد؟ اضغط مرة أخرى':'Confirm? Press again',
'سجّلت اليوم كيوم نجاح، بارك الله فيك.':'Logged today as a success day. May Allah bless you.','سجّلت اليوم انتكاسة. لا تيأس، ابدأ من جديد الآن.':'Logged a relapse today. Do not despair; start again now.',
'ما الذي أثار الرغبة اليوم؟ (اختياري)':'What triggered the urge today? (optional)','ملاحظة اختيارية: ما الذي ساعدك؟ ما الذي أثارك؟':'Optional note: what helped you? what triggered you?','نصيحة بحسب محفّزاتك':'Advice based on your triggers','أشعر برغبة الآن':'I feel an urge now',
'ضبط الوقت':'Set time','يمكنك ضبط موعد كل صلاة بالضغط على الوقت بحسب مدينتك، وتُحفظ المواعيد على جهازك.':'You can set each prayer\'s time by tapping the time, according to your city. Times are saved on your device.',
'معدل الالتزام الأسبوعي':'Weekly commitment rate','آخر ٧ أيام':'Last 7 days',
'تعذر تحميل نص المصحف.':'Could not load the Quran text.','فهرس السور':'Surah index','اختر سورة وابدأ القراءة منها':'Pick a surah and start reading from it','وردك اليومي':'Your daily portion','اقرأ المزيد':'Read more',
'الورد':'Portion','تقدّم الختمة':'Khatm progress','قرأت من مصحف ورقي؟':'Read from a paper Mushaf?','سجّل عدد الصفحات يدوياً.':'Log the number of pages manually.','إضافة صفحة':'Add a page','إنقاص':'Decrease',
'غنّة · إخفاء · إقلاب':'Ghunnah · Ikhfa · Iqlab','حرف لا يُنطق · إدغام':'Silent letter · Idgham','مد لازم ٦':'Madd lazim 6','مد واجب · جائز':'Madd wajib · jaiz','مد طبيعي · عارض':'Natural · temporary madd','قلقلة':'Qalqalah',
'لا توجد جلسة قراءة.':'No reading session.','رجوع':'Back','من وردك':'of your portion','تم':'Done','ألوان التجويد: تشغيل':'Tajweed colours: on','ألوان التجويد: إيقاف':'Tajweed colours: off','الصفحة السابقة':'Previous page','الصفحة التالية':'Next page',
'اختر ما التزمت به اليوم، وأضف عاداتك الخاصة.':'Choose what you stuck to today, and add your own habits.','اسم العادة الجديدة':'New habit name','إلغاء':'Cancel','إضافة عادة':'Add habit','حذف العادة':'Delete habit','حفظ':'Save',
'ملتزم':'On track','تعثر':'Slipped','بدون متابعة':'Not tracked','الشهر التالي':'Next month','الشهر السابق':'Previous month','إحصائيات الشهر':'Month statistics','تحليل المحفّزات':'Trigger analysis',
'سجّل ما أثار الرغبة كل يوم من الصفحة الرئيسية، وستظهر هنا أكثر المحفّزات تأثيراً عليك.':'Log what triggered the urge each day from the home page, and your most influential triggers will appear here.',
'أحسنت':'Well done','جيد، واصل':'Good, keep going','ابدأ من جديد':'Start fresh','استمر، أنت تتقدم بخطوات ثابتة.':'Keep going; you are progressing with steady steps.','أنت على الطريق، زِد قليلاً كل يوم.':'You are on the way; add a little each day.','كل خطوة صغيرة تُحسب، ولا تحاسب نفسك على الماضي.':'Every small step counts; do not hold yourself accountable for the past.',
'أسبوعي':'Weekly','شهري':'Monthly','معدل الالتزام':'Commitment rate','أيام ملتزمة':'Days on track','أيام تعثر':'Days slipped','إجمالي الأيام':'Total days',
'مراجعة صادقة مع النفس':'An honest self-review','ما أكثر شيء ساعدك؟ وما خطوة واحدة تريد تحسينها؟':'What helped you most? What one step would you like to improve?','اكتب ملاحظاتك الخاصة...':'Write your private notes...','حفظ المراجعة على هذا الجهاز':'Save the review on this device',
'هذه مؤشرات ذاتية مبنية على ما سجلته فقط، وليست حكماً على قيمتك أو التزامك.':'These are self-reported indicators based only on what you logged, not a judgment of your worth or commitment.',
'لحظة الرغبة: افعل هذا الآن':'Urge moment: do this now','ابدأ مؤقت ٥ دقائق':'Start a 5-minute timer','إيقاف':'Stop','إعادة':'Reset','رغبة تجاوزتها بفضل الله':'urges overcome by Allah\'s grace','تجاوزتُ الرغبة الآن':'I overcame the urge','نصائح عملية':'Practical tips','التالي ›':'Next ›',
'أسبابي للإقلاع':'My reasons to quit','اكتب أسبابك لتقرأها وقت الضعف.':'Write your reasons to read them in moments of weakness.','سبب جديد...':'New reason...','حذف':'Delete','إضافة':'Add',
'الشارات المحققة':'Badges earned','الصفحات المقروءة':'Pages read','مرتبتك':'Your rank','أبرز الإنجازات':'Top achievements','سلسلة الأيام':'Day streaks',
'الصباح والمساء وقبل النوم':'Morning, evening and before sleep','مؤقت وخطوات عملية وأسبابي':'Timer, practical steps and my reasons','لوحة الإنجازات':'Achievements board','أوسمتك وسلاسل الأيام':'Your badges and day streaks','التواصل والاقتراحات':'Contact & suggestions','المظهر والقفل والنسخ الاحتياطي':'Appearance, lock and backup',
'مطوّر تطبيق السائر إلى الله':'Developer of Al-Sa\'ir ila Allah','الحقوق محفوظة':'All rights reserved','تجربة رقمية تساعد على تحسين العادات والمحافظة على العبادة بخطوات متدرجة.':'A digital experience that helps improve habits and keep up worship in gradual steps.',
'التواصل الرسمي':'Official contact','واتساب':'WhatsApp','صفحة المطوّر على فيسبوك':'Developer\'s Facebook page','اقتراح تطوير':'Suggest an improvement','الإبلاغ عن مشكلة':'Report a problem','سجل الإصدارات':'Release notes','الخصوصية':'Privacy',
'اقتراح لتطوير تطبيق السائر إلى الله:':'Suggestion for improving Al-Sa\'ir ila Allah:','أريد الإبلاغ عن مشكلة في تطبيق السائر إلى الله:':'I want to report a problem in Al-Sa\'ir ila Allah:',
'كل بياناتك تُحفظ على جهازك فقط، بياناتك الشخصية والعبادات محفوظة على جهازك. الأحاديث اليومية محفوظة داخل التطبيق، ولا تُرسل سجلاتك أو ملفك الشخصي إلى أي خادم.':'All your data is stored on your device only, and the app sends nothing to any server. The internet is used only when you open the contact links above.',
'الحساب والأمان':'Account & security','القفل مفعّل':'Lock enabled','قفل التطبيق':'App lock','رمز جديد':'New code','رمز من ٤ أرقام على الأقل':'Code of at least 4 digits','إلغاء القفل':'Remove lock','الملف الشخصي':'Profile','طريقة المخاطبة':'Form of address',
'النسخ الاحتياطي':'Backup','على هذا الجهاز':'On this device','تنبيه خصوصية: النسخة الاحتياطية نص قابل للقراءة؛ احفظها في مكان خاص ولا ترسلها للآخرين.':'Privacy notice: the backup is readable text; keep it somewhere private and do not share it.','الصق النسخة هنا للاسترجاع':'Paste the backup here to restore','نسخ بياناتي':'Copy my data','استرجاع':'Restore',
'مساعدة ودعم':'Help & support','عن التطبيق':'About the app','مسح كل البيانات':'Erase all data','سيُحذف كل ما سجّلته على هذا الجهاز نهائياً.':'Everything you logged on this device will be deleted permanently.','تأكيد المسح النهائي؟ اضغط مرة أخرى':'Confirm final erase? Press again','مسح':'Erase',
'أدخل الرمز السري':'Enter your passcode','دخول':'Enter','اضغط للمتابعة':'Tap to continue','إخفاء الشاشة':'Hide screen',
'تم تحديث طريقة المخاطبة':'Form of address updated','تم حفظ مراجعتك على هذا الجهاز':'Your review was saved on this device','ثبّتك الله، واصل':'May Allah keep you firm; keep going',
'ما شاء الله، أتممت ختمة المصحف':'Mashallah, you completed the Quran','تقبّل الله منك، أتممت وردك اليوم':'May Allah accept it from you; you completed today\'s portion','أُضيفت العادة':'Habit added','أحسنت، سُجّلت رغبة تجاوزتها':'Well done, an overcome urge was recorded',
'استخدم رمزاً رقمياً من ٤ إلى ١٢ رقماً':'Use a numeric code of 4 to 12 digits','تم حفظ الرمز بصورة مشتقة تشفيرياً':'Code saved in a cryptographically derived form','تعذر إنشاء حماية آمنة على هذا الجهاز؛ لم يتم حفظ الرمز':'Could not create secure protection on this device; the code was not saved','أُلغي القفل':'Lock removed',
'رمز خاطئ؛ تم إيقاف المحاولة مؤقتاً':'Wrong code; attempts are temporarily paused','رمز خاطئ':'Wrong code','تعذر التحقق الآمن من الرمز على هذا الجهاز':'Could not verify the code securely on this device','تم النسخ':'Copied','حدّد النص وانسخه يدوياً':'Select the text and copy it manually',
'تم الاسترجاع بعد التحقق من البيانات':'Restored after validating the data','النسخة غير صالحة أو ناقصة؛ لم تتغير بياناتك':'The backup is invalid or incomplete; your data is unchanged','تم المسح':'Erased',
'منذ كم يوماً':'how many days','موعد الفجر':'Fajr time','موعد الظهر':'Dhuhr time','موعد العصر':'Asr time','موعد المغرب':'Maghrib time','موعد العشاء':'Isha time',
'الجزء':'Juz','حزب':'Hizb','سورة':'Surah','ص':'p.','الخميس · اليوم':'Thursday · Today',
'نص المصحف: مشروع تنزيل (tanzil.net) · رواية حفص برسم عثماني · رخصة CC BY 3.0 · منقول دون تعديل. مخطط صفحات المصحف المدني: zonetecde/mushaf-layout و fawazahmed0/quran-api · ألوان التجويد: cpfair/quran-tajweed (CC BY 4.0) · خط المصحف: مجمع الملك فهد لطباعة المصحف الشريف.':'Quran text: Tanzil project (tanzil.net) · Hafs narration, Uthmani script · CC BY 3.0 · unmodified. Madani Mushaf page layout: zonetecde/mushaf-layout and fawazahmed0/quran-api · Tajweed colours: cpfair/quran-tajweed (CC BY 4.0) · Mushaf font: King Fahd Complex for the Printing of the Holy Quran.'
,'رواية حفص':'Hafs','رواية ورش':'Warsh','الرواية':'Narration','التحويل إلى رواية حفص':'Switch to Hafs','التحويل إلى رواية ورش':'Switch to Warsh','نص رواية ورش عن نافع وخطها: مجمع الملك فهد لطباعة المصحف الشريف (Uthmanic Warsh v10).':'Warsh narration (from Nafi) text and font: King Fahd Glorious Quran Printing Complex (Uthmanic Warsh v10).'
};
var ENP=[
[/^(\d+) من (\d+)$/,'$1 of $2'],[/^(\d+) \/ (\d+) صفحة$/,'$1 / $2 pages'],[/^(\d+) ملتزم · (\d+) تعثر$/,'$1 on track · $2 slipped'],
[/^الهدف القادم: (\d+) (?:أيام|يوماً) · (.+)$/,function(m,n,r){return 'Next goal: '+n+' days · '+(EN[r]||r)}],
[/^إنجاز جديد: (.+?)(?: \(\+(\d+)\))?$/,function(m,t,n){return 'New achievement: '+(EN[t]||t)+(n?' (+'+n+')':'')}],
[/^سورة (.+)$/,function(m,n){var i=QD().n.indexOf(n);return i>=0?'Surah '+SUR_EN[i]:null}],
[/^ص (\d+)$/,'p. $1'],[/^الجزء (\d+) · حزب (\d+)$/,'Juz $1 · Hizb $2'],
[/^من صفحة (\d+) إلى (\d+) · (?:سورة )?(.+)$/,function(m,a,b,n){var i=QD().n.indexOf(n);return 'From page '+a+' to '+b+' · '+(i>=0?'Surah '+SUR_EN[i]:n)}],
[/^(\d+) \/ (\d+) صفحة$/,'$1 / $2 pages'],[/^قرأت اليوم (\d+) من (\d+) صفحات?\.$/,'You read $1 of $2 pages today.'],
[/^وردك اليوم (\d+) (?:صفحات|صفحة)، وقرأت (\d+)\. هل تقرأ الآن؟$/,'Your portion today is $1 pages, and you read $2. Read now?'],
[/^لم تسجّل صلاة (.+) بعد\. إن صلّيتها فسجّلها الآن\.$/,function(m,p){return 'You have not logged '+(EN[p]||p)+' yet. If you prayed it, log it now.'}],
[/^(\d+) صفحة مقروءة(?: · (\d+) ختمة مكتملة)?$/,function(m,a,b){return a+(a==='1'?' page':' pages')+' read'+(b?' · '+b+' khatm completed':'')}],
[/^(\d+) صفحة$/,'$1 pages'],[/^سلسلة (\d+) (?:أيام|يوماً)$/,'$1-day streak'],[/^(\d+) (?:أيام|يوماً)$/,'$1 days'],[/^(\d+) متتالية$/,'$1 in a row'],
[/^منها (\d+) في أيام انتكاسة$/,'$1 on relapse days'],[/^أتممت وردك اليوم، بارك الله فيك \((\d+) صفحة\)\.$/,'You completed your portion today, may Allah bless you ($1 pages).'],
[/^تم تسجيل (\d+) صفحة$/,'$1 pages recorded'],[/^محاولات كثيرة؛ حاول بعد (\d+) ثانية$/,'Too many attempts; try again in $1 seconds'],
[/^(.+) (\d{4})$/,function(m,mo,y){return EN[mo]?EN[mo]+' '+y:null}],
[/^(.+) · اليوم$/,function(m,d){return EN[d]?EN[d]+' · Today':null}],
[/^قرأت اليوم (\d+) صفحة\.?$/,'You read $1 pages today.'],[/^(\d+)٪$/,'$1%']
];
var FR={
'الرئيسية':'Accueil','التقويم':'Calendrier','التقدم':'Progression','المزيد':'Plus','السائر إلى الله':'Le chemin vers Allah','رحلتك مستمرة':'Votre chemin continue','صباح الخير':'Bonjour','مساء الخير':'Bonsoir','عبادات':'Actes d’adoration','عبادات اليوم':'Adoration du jour','كل عبادة تُنجزها = نقطة واحدة':'Chaque acte accompli = 1 point','فعلت':'Fait','لم أفعل':'Non fait','من ١١ نقطة':'sur 11 points','نقطة عبادات':'points d’adoration','حديث آخر':'Autre hadith','المصدر والتخريج: البيان':'Source et référence : Al-Bayan','الصلاة':'Prière','الصوم':'Jeûne','الأذكار':'Invocations','قراءة القرآن':'Lecture du Coran','الورد اليومي':'Lecture quotidienne','الاستغفار':'Demande de pardon','الصدقة':'Aumône','حضور درس علم':'Cours religieux','قيام الليل':'Prière nocturne','مساعدة محتاج':'Aider une personne dans le besoin','زيارة مريض':'Visiter un malade','العمر':'Âge','سنة':'ans','رحلتك إلى الله تبدأ بخطوة':'Votre chemin vers Allah commence par un pas','اللغة':'Langue','الإنجليزية':'Anglais','الفرنسية':'Français','التركية':'Turc','تم':'Terminé','إعدادات':'Paramètres','الملف الشخصي':'Profil','الاسم':'Nom','السن':'Âge','الصورة الشخصية':'Photo de profil','حفظ الملف الشخصي':'Enregistrer le profil','الصلوات':'Prières','الصيام':'Jeûne','القرآن':'Coran','الأذكار والأدعية':'Invocations et supplications','التذكيرات':'Rappels','العادات':'Habitudes','إنجاز اليوم':'Accomplissement du jour','كل يوم بداية جديدة':'Chaque jour est un nouveau départ','رحلة الثبات':'Parcours de constance','تذكيرات اليوم':'Rappels du jour','الإعدادات':'Paramètres','عاداتك':'Vos habitudes','الإنجازات والشارات':'Réalisations et badges'
};
var TR={
'الرئيسية':'Ana Sayfa','التقويم':'Takvim','التقدم':'İlerleme','المزيد':'Daha Fazla','السائر إلى الله':'Allah’a Doğru Yolculuk','رحلتك مستمرة':'Yolculuğun devam ediyor','صباح الخير':'Günaydın','مساء الخير':'İyi akşamlar','عبادات':'İbadetler','عبادات اليوم':'Günün ibadetleri','كل عبادة تُنجزها = نقطة واحدة':'Tamamlanan her ibadet = 1 puan','فعلت':'Yaptım','لم أفعل':'Yapmadım','من ١١ نقطة':'11 puan üzerinden','نقطة عبادات':'ibadet puanı','حديث آخر':'Başka hadis','المصدر والتخريج: البيان':'Kaynak ve tahriç: Al-Bayan','الصلاة':'Namaz','الصوم':'Oruç','الأذكار':'Zikirler','قراءة القرآن':'Kur’an okuma','الورد اليومي':'Günlük vird','الاستغفار':'İstiğfar','الصدقة':'Sadaka','حضور درس علم':'İlim dersine katılma','قيام الليل':'Gece namazı','مساعدة محتاج':'İhtiyaç sahibine yardım','زيارة مريض':'Hastayı ziyaret','العمر':'Yaş','سنة':'yaşında','رحلتك إلى الله تبدأ بخطوة':'Allah’a yolculuğun bir adımla başlar','اللغة':'Dil','الإنجليزية':'İngilizce','الفرنسية':'Fransızca','التركية':'Türkçe','تم':'Tamamlandı','إعدادات':'Ayarlar','الملف الشخصي':'Profil','الاسم':'Ad','السن':'Yaş','الصورة الشخصية':'Profil fotoğrafı','حفظ الملف الشخصي':'Profili kaydet','الصلوات':'Namazlar','الصيام':'Oruç','القرآن':'Kur’an','الأذكار والأدعية':'Zikirler ve dualar','التذكيرات':'Hatırlatmalar','العادات':'Alışkanlıklar','إنجاز اليوم':'Bugünün ilerlemesi','كل يوم بداية جديدة':'Her gün yeni bir başlangıç','رحلة الثبات':'Sebat yolculuğu','تذكيرات اليوم':'Günün hatırlatmaları','الإعدادات':'Ayarlar','عاداتك':'Alışkanlıkların','الإنجازات والشارات':'Başarılar ve rozetler'
};

var ES={
'الرئيسية':'Inicio','التقويم':'Calendario','التقدم':'Progreso','المزيد':'Más','السائر إلى الله':'El camino hacia Allah','كل يوم بداية جديدة':'Cada día es un nuevo comienzo','حديث آخر':'Otro hadiz','المصدر والتخريج: البيان':'Fuente y referencia: Al-Bayan','عباداتي':'Mis actos de adoración','عبادات اليوم':'Adoración de hoy','كل عبادة تُنجزها = نقطة واحدة':'Cada acto completado = 1 punto','فعلت':'Hecho','لم أفعل':'No hecho','من ١١ نقطة':'de 11 puntos','الصلاة':'Oración','الصوم':'Ayuno','الأذكار':'Recuerdos de Allah','قراءة القرآن':'Lectura del Corán','الورد اليومي':'Lectura diaria','الاستغفار':'Pedir perdón','الصدقة':'Caridad','حضور درس علم':'Clase de conocimiento','قيام الليل':'Oración nocturna','مساعدة محتاج':'Ayudar a quien lo necesita','زيارة مريض':'Visitar a un enfermo','صباح الخير':'Buenos días','مساء الخير':'Buenas tardes','العمر':'Edad','سنة':'años','الاسم':'Nombre','السن':'Edad','الصورة الشخصية':'Foto de perfil','حفظ الملف الشخصي':'Guardar perfil','اللغة':'Idioma','الإنجليزية':'Inglés','الفرنسية':'Francés','التركية':'Turco','الإسبانية':'Español','الألمانية':'Alemán','الإندونيسية':'Indonesio','الأردية':'Urdu','افتح قسم عباداتي':'Abrir mis actos de adoración','ملفك الشخصي':'Tu perfil'
};
var DE={
'الرئيسية':'Startseite','التقويم':'Kalender','التقدم':'Fortschritt','المزيد':'Mehr','السائر إلى الله':'Der Weg zu Allah','كل يوم بداية جديدة':'Jeder Tag ist ein neuer Anfang','حديث آخر':'Anderen Hadith','المصدر والتخريج: البيان':'Quelle und Nachweis: Al-Bayan','عباداتي':'Meine Gottesdienste','عبادات اليوم':'Heutige Gottesdienste','كل عبادة تُنجزها = نقطة واحدة':'Jede erfüllte Handlung = 1 Punkt','فعلت':'Erledigt','لم أفعل':'Nicht erledigt','من ١١ نقطة':'von 11 Punkten','الصلاة':'Gebet','الصوم':'Fasten','الأذكار':'Gedenken','قراءة القرآن':'Koran lesen','الورد اليومي':'Tägliche Lesung','الاستغفار':'Bitte um Vergebung','الصدقة':'Spende','حضور درس علم':'Religionsunterricht','قيام الليل':'Nachtgebet','مساعدة محتاج':'Bedürftigen helfen','زيارة مريض':'Kranke besuchen','صباح الخير':'Guten Morgen','مساء الخير':'Guten Abend','العمر':'Alter','سنة':'Jahre','الاسم':'Name','السن':'Alter','الصورة الشخصية':'Profilbild','حفظ الملف الشخصي':'Profil speichern','اللغة':'Sprache','الإنجليزية':'Englisch','الفرنسية':'Französisch','التركية':'Türkisch','الإسبانية':'Spanisch','الألمانية':'Deutsch','الإندونيسية':'Indonesisch','الأردية':'Urdu','افتح قسم عباداتي':'Meine Gottesdienste öffnen','ملفك الشخصي':'Dein Profil'
};
var ID={
'الرئيسية':'Beranda','التقويم':'Kalender','التقدم':'Kemajuan','المزيد':'Lainnya','السائر إلى الله':'Perjalanan menuju Allah','كل يوم بداية جديدة':'Setiap hari adalah awal yang baru','حديث آخر':'Hadis lainnya','المصدر والتخريج: البيان':'Sumber dan referensi: Al-Bayan','عباداتي':'Ibadah saya','عبادات اليوم':'Ibadah hari ini','كل عبادة تُنجزها = نقطة واحدة':'Setiap ibadah yang dilakukan = 1 poin','فعلت':'Sudah','لم أفعل':'Belum','من ١١ نقطة':'dari 11 poin','الصلاة':'Salat','الصوم':'Puasa','الأذكار':'Zikir','قراءة القرآن':'Membaca Al-Qur’an','الورد اليومي':'Bacaan harian','الاستغفار':'Istigfar','الصدقة':'Sedekah','حضور درس علم':'Menghadiri kajian','قيام الليل':'Salat malam','مساعدة محتاج':'Membantu yang membutuhkan','زيارة مريض':'Menjenguk orang sakit','صباح الخير':'Selamat pagi','مساء الخير':'Selamat malam','العمر':'Usia','سنة':'tahun','الاسم':'Nama','السن':'Usia','الصورة الشخصية':'Foto profil','حفظ الملف الشخصي':'Simpan profil','اللغة':'Bahasa','الإنجليزية':'Inggris','الفرنسية':'Prancis','التركية':'Turki','الإسبانية':'Spanyol','الألمانية':'Jerman','الإندونيسية':'Indonesia','الأردية':'Urdu','افتح قسم عباداتي':'Buka ibadah saya','ملفك الشخصي':'Profil Anda'
};
var UR={
'الرئيسية':'صفحۂ اول','التقويم':'تقویم','التقدم':'پیش رفت','المزيد':'مزید','السائر إلى الله':'اللہ کی طرف سفر','كل يوم بداية جديدة':'ہر دن ایک نئی شروعات ہے','حديث آخر':'ایک اور حدیث','المصدر والتخريج: البيان':'ماخذ اور حوالہ: البیان','عباداتي':'میری عبادات','عبادات اليوم':'آج کی عبادات','كل عبادة تُنجزها = نقطة واحدة':'ہر مکمل عبادت = ایک پوائنٹ','فعلت':'کر لیا','لم أفعل':'نہیں کیا','من ١١ نقطة':'11 پوائنٹس میں سے','الصلاة':'نماز','الصوم':'روزہ','الأذكار':'اذکار','قراءة القرآن':'قرآن کی تلاوت','الورد اليومي':'روزانہ ورد','الاستغفار':'استغفار','الصدقة':'صدقہ','حضور درس علم':'علمی درس میں شرکت','قيام الليل':'تہجد','مساعدة محتاج':'ضرورت مند کی مدد','زيارة مريض':'مریض کی عیادت','صباح الخير':'صبح بخیر','مساء الخير':'شام بخیر','العمر':'عمر','سنة':'سال','الاسم':'نام','السن':'عمر','الصورة الشخصية':'پروفائل تصویر','حفظ الملف الشخصي':'پروفائل محفوظ کریں','اللغة':'زبان','الإنجليزية':'انگریزی','الفرنسية':'فرانسیسی','التركية':'ترکی','الإسبانية':'ہسپانوی','الألمانية':'جرمن','الإندونيسية':'انڈونیشیائی','الأردية':'اردو','افتح قسم عباداتي':'میری عبادات کھولیں','ملفك الشخصي':'آپ کا پروفائل'
};

function activeDict(){var L=U().lang;return ({fr:FR,tr:TR,es:ES,de:DE,id:ID,ur:UR})[L]||EN}
function trS(s){
  var t=s.replace(/\s+/g,' ').trim();if(!t)return null;
  var D=activeDict();if(D[t]!==undefined)return D[t];if(EN[t]!==undefined)return EN[t];
  var d=t.replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632});
  if(d!==t&&EN[d]!==undefined)return EN[d];
  var si=QD().n.indexOf(t);if(si>=0)return SUR_EN[si];
  for(var i=0;i<ENP.length;i++){var m=d.match(ENP[i][0]);if(m){var r=typeof ENP[i][1]==='function'?ENP[i][1].apply(null,m):d.replace(ENP[i][0],ENP[i][1]);if(r)return r}}
  return null;
}
function trWalk(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode())){var p=n.parentNode;if(p&&p.closest&&p.closest('.mp,.keepar,script,style'))continue;list.push(n)}
  list.forEach(function(n){
    var v=n.nodeValue,lead=v.match(/^\s*/)[0],trail=v.match(/\s*$/)[0],r=trS(v);
    if(r!==null)n.nodeValue=lead+r+trail;
    else if(/^[\s٠-٩\d%·\/:.-]+$/.test(v))n.nodeValue=v.replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632});
  });
  root.querySelectorAll('[placeholder],[aria-label]').forEach(function(e){['placeholder','aria-label'].forEach(function(a){var v=e.getAttribute(a);if(v){var r=trS(v);if(r!==null)e.setAttribute(a,r)}})});
}

function lang(){return ['en','fr','tr','es','de','id','ur'].indexOf(U().lang)>=0?U().lang:'ar'}
function applyUI(){
  var r=document.documentElement,u=U(),sid=pick(Object.keys(STY),u.style,'calm'),sd=STY[sid],mode=uiMode();
  var sysDark=!!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  var th=sd.dark?'dark':(mode==='system'?(sysDark?'dark':'light'):mode);
  r.setAttribute('data-theme',th);
  if(sid==='calm')r.removeAttribute('data-style');else r.setAttribute('data-style',sid);
  var A=ACC.filter(function(x){return x.id===u.accent})[0]||ACC[0];
  if(sid!=='calm'&&!u.accent){var sa={midnight:'blue',paper:'terracotta',royal:'gold',ocean:'ocean'}[sid];A=ACC.filter(function(x){return x.id===sa})[0]||A}
  r.style.setProperty('--ac-l',A.l);r.style.setProperty('--ac2-l',A.l2);r.style.setProperty('--ac-d',A.d);r.style.setProperty('--ac2-d',A.d2);
  r.style.setProperty('--ac-g',A.g||mix(A.d,'#ffffff',.5));
  var pr=function(k,v,def){if(v===def)r.removeAttribute(k);else r.setAttribute(k,v)};
  pr('data-look',pick(LOOKS,u.look,'classic'),'classic');pr('data-font',pick(FONTS,u.font,'plex'),'plex');
  pr('data-press',pick(PRESSES,u.press,'bounce'),'bounce');pr('data-trans',pick(TRANSES,u.trans,'rise'),'rise');
  if(u.fontW==='bold')r.setAttribute('data-fw','bold');else r.removeAttribute('data-fw');
  var L=lang();r.setAttribute('lang',L);r.setAttribute('dir',L==='ar'?'rtl':'ltr');
}
function applyTheme(){applyUI()}
applyUI();
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(uiMode()==='system')applyUI()})}catch(e){}
function setUI(k,v){U()[k]=v;if(k==='style'&&v!=='calm'&&STY[v]){delete U().accent}save();applyUI()}
function oBtn(act,val,cur,html,cls){return '<button class="'+(cls||'uo')+'" data-a="'+act+'" data-v="'+val+'" aria-pressed="'+(cur===val)+'">'+html+'</button>'}
function vAppearance(){
  var u=U(),m=uiMode(),sid=pick(Object.keys(STY),u.style,'calm'),ac=u.accent||'',lk=pick(LOOKS,u.look,'classic'),fn=pick(FONTS,u.font,'plex'),pr=pick(PRESSES,u.press,'bounce'),tr=pick(TRANSES,u.trans,'rise');
  var h='<section class="card ap">';
  h+='<h3>الوضع</h3><div class="seg n3">'+[['system','تلقائي'],['light','فاتح'],['dark','داكن']].map(function(x){return '<button class="'+(m===x[0]?'on':'')+'" data-a="umode" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
  h+='<h3>النمط</h3><div class="sty-grid">'+Object.keys(STY).map(function(k){var s=STY[k];return oBtn('ustyle',k,sid,'<span class="pv" style="background:'+s.pv[0]+'"><i style="background:'+s.pv[1]+'"></i><b style="background:'+s.pv[2]+'"></b></span><small>'+s.n+'</small>','uo sty')}).join('')+'</div>';
  h+='<h3>لون التطبيق</h3><div class="acc-row">'+ACC.map(function(x){var on=(ac||(sid==='calm'?'maleem':''))===x.id;return '<button class="acc" data-a="uacc" data-v="'+x.id+'" aria-pressed="'+on+'" aria-label="'+x.n+'" style="background:'+(isDark()?x.d:x.l)+'">'+(on?'✓':'')+'</button>'}).join('')+'</div>';
  h+='<h3>شكل الواجهة</h3><div class="look-row">'+LOOKS.map(function(x){return oBtn('ulook',x[0],lk,'<span class="lk-pv '+x[0]+'"><i></i><i></i></span><b>'+x[1]+'</b>','uo lo')}).join('')+'</div><p class="note">'+LOOKS.filter(function(x){return x[0]===lk})[0][2]+'</p>';
  h+='<h3>الخط</h3><div class="font-grid">'+FONTS.map(function(x){return oBtn('ufont',x[0],fn,'<span class="fo-s fo-'+x[0]+'">أبجد</span><small>'+x[1]+'</small>','uo fo')}).join('')+'</div>'
   +'<div class="seg" style="margin-top:10px"><button class="'+(u.fontW!=='bold'?'on':'')+'" data-a="ufw" data-v="normal">عادي</button><button class="'+(u.fontW==='bold'?'on':'')+'" data-a="ufw" data-v="bold" style="font-weight:800">عريض</button></div>';
  h+='<h3>حركة الضغط</h3><div class="opt-list">'+PRESSES.map(function(x){return oBtn('upress',x[0],pr,'<b>'+x[1]+'</b><small>'+x[2]+'</small>','uo ol')}).join('')+'</div>';
  h+='<h3>حركة الانتقال</h3><div class="opt-list">'+TRANSES.map(function(x){return oBtn('utrans',x[0],tr,'<b>'+x[1]+'</b><small>'+x[2]+'</small>','uo ol')}).join('')+'</div>';
  return h+'</section>';
}
function toast(t){if(lang()!=='ar'){var tt=trS(t);if(tt!==null)t=tt}toastEl.textContent=t;toastEl.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){toastEl.hidden=true},3500)}
function checkNew(){
  S.seen=S.seen||[];var fresh=achievements().filter(function(a){return a.done&&S.seen.indexOf(a.id)<0});
  if(fresh.length){fresh.forEach(function(a){S.seen.push(a.id)});save();toast('إنجاز جديد: '+fresh[0].title+(fresh.length>1?' (+'+(fresh.length-1)+')':''))}
}
function quote(q){return '<p>'+esc(q.t)+'</p>'+(q.s?'<small>'+esc(q.s)+'</small>':'')}
function dateLabel(){try{return new Date().toLocaleDateString('ar-EG',{weekday:'long'})}catch(e){return ''}}
function trigCounts(){
  var c={},r={},tot=0;
  Object.keys(S.days).forEach(function(k){var d=S.days[k];(d.trig||[]).forEach(function(t){c[t]=(c[t]||0)+1;if(d.status==='relapse')r[t]=(r[t]||0)+1;tot++})});
  return{c:c,r:r,tot:tot};
}
function topTrig(){
  var x=trigCounts(),best=null;
  TRIG.forEach(function(t){if(x.c[t[0]]&&(!best||x.c[t[0]]>x.c[best]))best=t[0]});
  return best;
}
function logoSvg(){return '<svg class="logo" viewBox="0 0 512 512" aria-hidden="true" style="width:84px;height:84px"><rect width="512" height="512" rx="112" fill="#0b2924"/><rect x="148" y="92" width="216" height="328" rx="12" fill="#0b2924" stroke="#d9b56d" stroke-width="12"/><path d="M200 372V256q0-70 56-104 56 34 56 104v116z" fill="#071b19" stroke="#d9b56d" stroke-width="8" stroke-linejoin="round"/><circle cx="256" cy="232" r="26" fill="#e4c47a"/><circle cx="266" cy="226" r="22" fill="#071b19"/><path d="M256 318l22 22-22 22-22-22z" fill="#e4c47a"/></svg>'}
var COPY='<p class="copy">© 2026 جميع الحقوق محفوظة لـ أحمد العجمي</p>';

/* ---------- views ---------- */
function vSplash(){
  return '<div class="splash"><div class="sp-tile"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M40 10a22 22 0 1 0 14 38A18 18 0 0 1 40 10z" fill="#fff" opacity=".95"/><path d="M6 54c14-9 28-9 52 0" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".7"/><circle cx="44" cy="22" r="2.4" fill="#fff"/></svg></div><div class="t">السائر إلى الله</div><div class="s">رحلة نحو القرب من الله<br>وتحسين حياتك</div></div>';
}
function vOb(){
  var p=S.profile||{},gender=obGender||S.gender||'male';
  return '<div class="ob-page">'
  +'<div class="ob-brand"><div class="ob-mark">'+ic('moon')+'</div><p class="ob-eyebrow">السائر إلى الله</p>'
  +'<h2>أهلاً بك في رحلتك</h2><p class="ob-intro">خطوة صادقة نحو حياةٍ أقرب إلى الله. أكمِل بياناتك لتبدأ رحلتك.</p></div>'
  +'<section class="card ob-form profile-edit">'
  +'<div class="ob-photo-row"><label class="ob-photo-picker" for="ob-photo" aria-label="اختيار صورة شخصية"><div class="profile-edit-head">'+(p.photo?'<img class="profile-photo" style="width:86px;height:86px" src="'+p.photo+'" alt="الصورة الشخصية">':'<div class="ob-avatar">'+(gender==='female'?avFemale():avMale())+'</div>')+'<div class="ob-photo-copy"><strong>صورتك الشخصية</strong><small>اضغط هنا لاختيار صورة من جهازك</small></div></div><span class="ob-photo-action">'+ic('camera')+'</span></label><input id="ob-photo" type="file" accept="image/*" class="profile-file ob-file"></div>'
  +'<label class="profile-label" for="ob-name">الاسم</label><input id="ob-name" type="text" maxlength="40" autocomplete="name" placeholder="اكتب اسمك" value="'+esc(p.name||'')+'">'
  +'<label class="profile-label" for="ob-age">العمر</label><input id="ob-age" type="number" inputmode="numeric" min="1" max="120" placeholder="العمر بالسنوات" value="'+esc(p.age||'')+'">'
  +'<label class="profile-label">الجنس</label><div class="ob-genders">'
  +'<label class="ob-gender '+(gender==='male'?'selected':'')+'"><input type="radio" name="ob-gender" value="male" '+(gender==='male'?'checked':'')+'><span>'+avMale()+'ذكر</span></label>'
  +'<label class="ob-gender '+(gender==='female'?'selected':'')+'"><input type="radio" name="ob-gender" value="female" '+(gender==='female'?'checked':'')+'><span>'+avFemale()+'أنثى</span></label></div>'
  +'<div class="ob-divider"></div>'
  +'<label class="profile-label" for="ob-reason">ما أهم سبب يدفعك إلى الإقلاع عن عادتك السيئة؟</label><textarea id="ob-reason" maxlength="200" rows="3" placeholder="اكتب السبب الذي تريد تذكير نفسك به..."></textarea>'
  +'</section><button class="btn block ob-start" data-a="ob">ابدأ رحلتك</button>'
  +'<p class="ob-privacy">بياناتك الشخصية وعاداتك محفوظة على جهازك.</p></div>'+COPY;
}
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
  return h+'<p class="note" style="text-align:center">التنبيهات الحالية داخل التطبيق. إشعارات Android في الخلفية تحتاج دمج إضافة محلية أصلية في مشروع Android كامل.</p>';
}
function tile(t,icon,label,sub){return '<button class="tile" data-a="tab" data-v="'+t+'">'+ic(icon)+'<span>'+label+'</span><small>'+sub+'</small></button>'}
function profileAvatar(size){
  var p=S.profile||{},sz=size||48;
  return p.photo?'<img class="profile-photo" style="width:'+sz+'px;height:'+sz+'px" src="'+p.photo+'" alt="الصورة الشخصية">':(S.gender==='female'?avFemale():avMale());
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
  var rows=items.map(function(x){var val=w[x[0]],yes=val===true,no=val===false;return '<div class="worship-row"><span class="worship-name">'+ic(x[2])+esc(x[1])+'</span><div class="worship-actions"><button class="worship-choice yes '+(yes?'selected':'')+'" data-a="worship" data-v="'+x[0]+'" data-state="yes" aria-pressed="'+yes+'">'+(yes?ic('check'):'')+'فعلت</button><button class="worship-choice no '+(no?'selected':'')+'" data-a="worship" data-v="'+x[0]+'" data-state="no" aria-pressed="'+no+'">'+(no?ic('x'):'')+'لم أفعل</button></div>'+(x[3]?'<button class="worship-remove" data-a="delworship" data-v="'+x[0]+'" aria-label="حذف العبادة">×</button>':'')+'</div>'}).join('');
  var heading='<div class="worship-head"><div><span class="eyebrow">متابعة اليوم</span><h2>عباداتي اليوم</h2><p class="note">كل عبادة تُنجزها = نقطة واحدة</p></div><div class="worship-score"><b>'+points+'</b><small>من '+ar(total)+' نقطة</small></div></div><div class="bar"><div style="width:'+Math.round(points/Math.max(1,total)*100)+'%"></div></div>';
  if(!full)return '<section class="card worship-card worship-summary">'+heading+'<div class="worship-progress">'+done+' من '+ar(total)+' عبادة تم تسجيلها اليوم</div><button class="btn block worship-open" data-a="tab" data-v="worship">'+ic('sparkles')+'افتح عباداتي اليوم '+ic('chev')+'</button></section>';
  return '<section class="card worship-card">'+heading+'<div class="worship-progress">'+done+' من '+ar(total)+' عبادة تم تسجيلها اليوم</div><div class="worship-list">'+rows+'</div><div class="worship-add-area">'+(addingWorship?'<input id="new-worship-name" class="field" maxlength="60" placeholder="اكتب العبادة التي تريد إضافتها"><div class="row"><button class="btn good" data-a="saveworship">إضافة العبادة</button><button class="btn ghost" data-a="cancelworship">إلغاء</button></div>':'<button class="btn block" data-a="addworship">'+ic('plus')+' إضافة عبادة خاصة بي</button>')+'</div><p class="note worship-privacy">اختياراتك خاصة ومحفوظة على جهازك، ويمكنك تعديلها خلال اليوم.</p></section>';
}
function vWorship(){return worshipHomeCard(true)}
function vHome(){
  var s=stats(),k=dk(),t=S.days[k],note=draft!==null?draft:(t&&t.note)||'';
  var q=currentHadith||MOTIV[currentHadithIndex];
  var trigs=draftTrig!==null?draftTrig:((t&&t.trig)||[]),tt=topTrig();
  var nxt=MILES.filter(function(n){return n>s.cur})[0]||MILES[MILES.length-1];
  var C=2*Math.PI*76,off=C*(1-Math.min(1,s.cur/nxt));
  var wk='';
  for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var kk=dk(d),st=S.days[kk]?S.days[kk].status:'';wk+='<div class="wk '+st+(i===0?' today':'')+'"><i>'+(st==='success'?ic('check'):st==='relapse'?ic('x'):'')+'</i><span>'+WEEK[d.getDay()]+'</span></div>'}
  var dn=dayDone(k),T=dayTotal(),pdone=PR.filter(function(p){return S.prayers[k]&&S.prayers[k][p[0]]}).length;
  var hdone=allHabits().filter(function(h){return ((S.habits||{})[k]||{})[h[0]]}).length;
  var greet=greetingNow(),pname=(S.profile&&S.profile.name||'').trim(),dates=calendarToday(),age=(S.profile&&S.profile.age||'').trim();
  var profile='<section class="profile-hero '+(greet.morning?'is-morning':'is-evening')+'"><div class="profile-main"><button class="profile-avatar-large" data-a="tab" data-v="settings" aria-label="تعديل الملف الشخصي">'+profileAvatar(82)+'</button><div class="profile-identity"><div class="welcome-line '+(greet.morning?'is-morning':'is-evening')+'">'+ic(greet.icon)+'<span>'+esc(greet.text||'أكمل ملفك الشخصي')+'</span></div><div class="profile-sub">'+(age?'<span class="age-chip">'+ic('user')+' العمر · '+esc(age)+' سنة</span>':'أضف عمرك إن أحببت')+'</div></div></div><div class="calendar-line"><span>'+ic('cal')+' '+esc(dates.greg)+'</span><span class="cal-sep">•</span><span>'+ic('moon')+' '+esc(dates.hijri)+'</span></div></section>';
  return profile
  +'<section class="banner new-day-card">'+forestDeco()+'<div class="new-day-kicker">✦ بداية اليوم ✦</div><h3>كل يوم بداية جديدة</h3><p class="new-day-hadith">'+esc(q.t)+'</p>'+(q.s?'<small class="new-day-source">'+esc(q.s)+(q.grade?' · '+esc(q.grade):'')+'</small>':'')+'</section>'
  +worshipHomeCard()
  +'<section class="card flat dprog"><div class="row between"><span>تقدم اليوم</span><b>'+dn+' من '+T+'</b></div><div class="bar"><div style="width:'+Math.round(dn/T*100)+'%"></div></div></section>'
  +'<div class="tiles">'+tile('prayers','mosque','الصلوات',pdone+' من 5')+tile('fasting','moon','الصيام','جدول الصيام')+tile('quran','book','القرآن',Math.min(qPages(k),99)+' / '+S.quran.goal+' صفحة')+tile('adhkar','beads','الأذكار','الصباح والمساء')+'</div>'
  +'<div class="tiles">'+tile('reminders','bell','التذكيرات','مركز التنبيهات')+tile('habits','target','العادات',hdone+' من '+allHabits().length)+'</div>'
  +'<div class="sect">'+ic('flag')+'رحلة الثبات</div>'
  +'<section class="card hero"><div class="ring"><svg viewBox="0 0 176 176"><circle class="tr" cx="88" cy="88" r="76" fill="none" stroke-width="12"/><circle class="pg" cx="88" cy="88" r="76" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div class="mid"><div class="count">'+s.cur+'</div><small>يوم متتالٍ</small></div></div><div class="next">الهدف القادم: '+nxt+' '+(nxt<11?'أيام':'يوماً')+' · '+rankName(s.best)+'</div><div class="week">'+wk+'</div></section>'
  +'<section class="grid3"><div class="stat o"><b>'+s.best+'</b><small>أطول سلسلة</small></div><div class="stat g"><b>'+s.ok+'</b><small>أيام النجاح</small></div><div class="stat"><b>'+s.rate+'%</b><small>نسبة النجاح</small></div></section>'
  +'<section class="card"><h3>تسجيل اليوم</h3>'+(t?'<p class="'+(t.status==='success'?'ok':'no')+'">'+(t.status==='success'?'سجّلت اليوم كيوم نجاح، بارك الله فيك.':'سجّلت اليوم انتكاسة. لا تيأس، ابدأ من جديد الآن.')+'</p>':'')+'<p class="note">ما الذي أثار الرغبة اليوم؟ (اختياري)</p><div class="tg">'+TRIG.map(function(g){return '<button class="'+(trigs.indexOf(g[0])>=0?'on':'')+'" data-a="trg" data-v="'+g[0]+'">'+g[1]+'</button>'}).join('')+'</div><textarea id="note" placeholder="ملاحظة اختيارية: ما الذي ساعدك؟ ما الذي أثارك؟">'+esc(note)+'</textarea><div class="row"><button class="btn good" data-a="success">'+ic('check')+'تم اليوم</button><button class="btn bad" data-a="relapse">'+(confirmRelapse?'تأكيد؟ اضغط مرة أخرى':ic('x')+'فعلتها')+'</button></div></section>'
  +(tt?'<section class="card tipc"><h3>نصيحة بحسب محفّزاتك</h3><p style="margin:0">'+TTIPS[tt]+'</p></section>':'')+'<button class="sos" data-a="goboost">'+ic('sos')+'أشعر برغبة الآن</button>'+COPY;
}
function vPrayers(){
  var k=dk(),p=S.prayers[k]||{};
  var wkRate=0,cnt=0;for(var i=0;i<7;i++){var d=new Date();d.setDate(d.getDate()-i);var pp=S.prayers[dk(d)]||{};PR.forEach(function(x){if(pp[x[0]])cnt++})}
  wkRate=Math.round(cnt/35*100);
  return '<div class="scene">'+sceneSunset()+'<div class="pillday">'+esc(dateLabel())+' · اليوم</div></div>'
  +'<div class="cl">'+PR.map(function(x){var on=!!p[x[0]],tv=S.ptimes[x[0]]||'';
    return '<div class="cli'+(on?' on':'')+'"><span class="nm">'+x[1]+'</span><label class="tmw">'+ic('clock')+'<span>'+(tv?esc(tv):'ضبط الوقت')+'</span><input type="time" data-pt="'+x[0]+'" value="'+esc(tv)+'" aria-label="موعد '+x[1]+'"></label><button class="ck" data-a="pray" data-v="'+x[0]+'" aria-label="'+x[1]+'" aria-pressed="'+on+'">'+ic('check')+'</button></div>'}).join('')+'</div>'
  +'<p class="note" style="margin-top:10px">يمكنك ضبط موعد كل صلاة بالضغط على الوقت بحسب مدينتك، وتُحفظ المواعيد على جهازك.</p>'
  +'<section class="card"><div class="rateline"><div><h3 style="margin:0">معدل الالتزام الأسبوعي</h3><small>آخر ٧ أيام</small></div><b>'+wkRate+'%</b></div><div class="bar"><div style="width:'+wkRate+'%"></div></div></section>';
}
var SPG={};
function isW(){return S.quran&&S.quran.riwaya==='warsh'&&!!window.WDATA}
function WD(){return window.WDATA||{s:[],p:[],b:''}}
function curP(){return isW()?WD().p:QD().p}
function suraPage(c){
  var rk=isW()?'w':'h',SG=SPG[rk];
  if(!SG){SG=SPG[rk]=[];var P=curP();for(var i=0;i<P.length;i++){var r=P[i];for(var c2=r[0];c2<=r[2];c2++){if(!SG[c2]&&((c2===r[0]&&r[1]===1)||c2>r[0]))SG[c2]=i+1}}}
  return SG[c]||1;
}
function warshMarks(t){
  var out='';
  for(var i=0;i<t.length;i++){
    var c=t.charCodeAt(i),cl=-1;
    if(c===0x064B)cl=0;       // tanwin fatha
    else if(c===0x064C)cl=3;  // tanwin damma
    else if(c===0x064D)cl=5;  // tanwin kasra
    else if(c===0x064E||c===0x0670)cl=4; // fatha / dagger alif
    else if(c===0x064F)cl=3;  // damma
    else if(c===0x0650)cl=5;  // kasra
    else if(c===0x0651||c===0x0652)cl=1; // shadda / sukun
    else if(c===0x0653)cl=2;  // maddah
    else if(c===0x0654||c===0x0655)cl=3; // hamza marks
    if(cl>=0)out+='<span class="wh-mark t'+cl+'">'+esc(t.charAt(i))+'</span>';
    else out+=esc(t.charAt(i));
  }
  return out;
}
function riwSwitch(){
  if(!window.WDATA)return '';
  var w=isW();
  return '<div class="riw" role="group" aria-label="الرواية"><button class="'+(w?'':'on')+'" data-a="qriw" data-v="hafs" aria-pressed="'+!w+'">رواية حفص</button><button class="'+(w?'on':'')+'" data-a="qriw" data-v="warsh" aria-pressed="'+w+'">رواية ورش</button></div>';
}
function warshPage(p){
  var W=WD(),r=W.p[p-1],out='',tj=S.quran.tj!==false;if(!r)return '';
  for(var c=r[0];c<=r[2];c++){
    var v1=(c===r[0]?r[1]:1),v2=(c===r[2]?r[3]:W.s[c-1].length);
    if(v1===1){out+='<div class="sura"><span>سورة '+esc(QD().n[c-1])+'</span></div>'+(c!==9?'<div class="wbsm">'+(tj?warshMarks(W.b):esc(W.b))+'</div>':'')}
    out+='<p class="wp-p">';
    for(var v=v1;v<=v2;v++)out+=(tj?warshMarks(W.s[c-1][v-1]):esc(W.s[c-1][v-1]))+' ';
    out+='</p>';
  }
  return out;
}
function vWarshReader(){
  var p=rd.page,W=WD(),r=W.p[p-1],n=p-rd.from+1,tj=S.quran.tj!==false;
  var lg=tj?'<div class="tjl"><span><i class="t0"></i>تنوين الفتح</span><span><i class="t3"></i>الضم</span><span><i class="t5"></i>الكسر</span><span><i class="t4"></i>الفتح والألف الخنجرية</span><span><i class="t1"></i>الشدة والسكون</span><span><i class="t2"></i>المد</span></div>':'';
  return '<div class="mp wr'+(tj?'':' notj')+'" id="mp"><div class="mp-in">'
  +'<div class="mp-h"><span>الجزء '+ar(r[4])+'</span><span class="sb">'+esc(QD().n[r[0]-1])+'</span></div>'
  +'<div class="wp" lang="ar" dir="rtl">'+warshPage(p)+'</div>'
  +'<div class="mp-f"><span class="pn">'+ar(p)+'</span></div></div></div>'
  +'<div class="rbar"><button class="ib" data-a="qpage" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'</button>'
  +'<div class="rmid"><b>'+ar(n)+' / '+ar(rd.to-rd.from+1)+'</b><small>من وردك</small></div>'
  +'<button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button>'
  +'<button class="ib" data-a="qpage" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+ic('chev')+'</button></div>'
  +lg
  +'<div class="fsz"><button class="ib" data-a="qtj" aria-pressed="'+tj+'">ألوان الحركات: '+(tj?'تشغيل':'إيقاف')+'</button></div>';
}
function QD(){return window.QDATA||{n:[],s:[],p:[]}}
function ar(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})}
function pageSura(p){var r=curP()[p-1];return r?QD().n[r[0]-1]:''}
function vQuran(){
  var D=QD(),k=dk(),pg=qPages(k),goal=S.quran.goal,pos=S.quran.pos,to=Math.min(604,pos+goal-1),total=0;
  if(!curP().length)return '<section class="card"><p class="no">تعذر تحميل نص المصحف.</p></section>';
  Object.keys(S.quran.log).forEach(function(d){total+=S.quran.log[d]||0});
  var khatmas=Math.floor(total/QURAN_PAGES),prog=Math.round((total%QURAN_PAGES)/QURAN_PAGES*100),done=pg>=goal;
  var idx=showIdx?'<section class="card"><h3>فهرس السور</h3><div class="sidx">'+D.n.map(function(nm,i){return '<button class="srow" data-a="qopen" data-v="'+suraPage(i+1)+'"><span class="no">'+ar(i+1)+'</span><span class="nm">سورة '+esc(nm)+'</span><small>ص '+ar(suraPage(i+1))+'</small></button>'}).join('')+'</div></section>':'';
  return '<div class="qhero">'+sceneBook()+'</div>'
  +riwSwitch()
  +'<section class="card"><h3>وردك اليومي</h3>'
  +'<p class="note" style="text-align:center;margin-bottom:4px">'+(pos===to?'صفحة '+ar(pos):'من صفحة '+ar(pos)+' إلى '+ar(to))+' · سورة '+esc(pageSura(pos))+'</p>'
  +'<div class="bar"><div style="width:'+Math.min(100,Math.round(pg/goal*100))+'%"></div></div>'
  +'<p class="note" style="text-align:center;margin:8px 0 12px">'+(done?'أتممت وردك اليوم، بارك الله فيك ('+ar(pg)+' صفحة).':'قرأت اليوم '+ar(pg)+' من '+ar(goal)+' '+(goal<11?'صفحات':'صفحة')+'.')+'</p>'
  +'<button class="btn block" data-a="qstart">'+ic('book')+(done?'اقرأ المزيد':'ابدأ القراءة')+'</button>'
  +'<div class="row" style="justify-content:center;margin-top:10px"><button class="btn ghost" data-a="qgoal" data-v="-1">'+ic('minus')+'الورد</button><button class="btn ghost" data-a="qgoal" data-v="1">'+ic('plus')+'الورد</button></div></section>'
  +'<button class="lrow" data-a="showidx" style="margin:12px 0">'+ic('doc')+'<span class="t">فهرس السور<small class="muted">اختر سورة وابدأ القراءة منها</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'+idx
  +'<section class="card"><div class="rateline"><div><h3 style="margin:0">تقدّم الختمة</h3><small>'+ar(total)+' صفحة مقروءة'+(khatmas?' · '+ar(khatmas)+' ختمة مكتملة':'')+'</small></div><b>'+ar(prog)+'%</b></div><div class="bar"><div style="width:'+prog+'%"></div></div></section>'
  +'<section class="card flat"><h3>قرأت من مصحف ورقي؟</h3><div class="step" style="margin:0"><button class="ib" data-a="qsub" aria-label="إنقاص">'+ic('minus')+'</button><b style="font-size:26px">'+ar(pg)+'</b><button class="ib" data-a="qadd" aria-label="إضافة صفحة">'+ic('plus')+'</button></div><p class="note" style="text-align:center;margin:0">سجّل عدد الصفحات يدوياً.</p></section>'
  +(window.WDATA?'<p class="note" style="font-size:12px;text-align:center">نص رواية ورش عن نافع وخطها: مجمع الملك فهد لطباعة المصحف الشريف (Uthmanic Warsh v10).</p>':'')
  +'<p class="note" style="font-size:12px;text-align:center">نص المصحف: مشروع تنزيل (tanzil.net) · رواية حفص برسم عثماني · رخصة CC BY 3.0 · منقول دون تعديل. مخطط صفحات المصحف المدني: zonetecde/mushaf-layout و fawazahmed0/quran-api · ألوان التجويد: cpfair/quran-tajweed (CC BY 4.0) · خط المصحف: مجمع الملك فهد لطباعة المصحف الشريف.</p>';
}
function verseText(c,v){
  var t=QD().s[c-1][v-1];
  if(v===1&&c!==1&&c!==9){ // مصدر النص يُلحق البسملة بأول آية؛ تُعرض مرة واحدة في ترويسة السورة
    var w=t.split(' '),n=w.slice(0,4).join(' ').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/\u0671/g,'\u0627');
    if(n==='\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645'&&w.length>4)return w.slice(4).join(' ');
  }
  return t;
}
function pageHtml(p){
  var D=QD(),r=D.p[p-1];if(!r)return '';
  var out='';
  for(var c=r[0];c<=r[2];c++){
    var v1=(c===r[0]?r[1]:1),v2=(c===r[2]?r[3]:D.s[c-1].length);
    if(v1===1){out+='<div class="sura"><span>سورة '+esc(D.n[c-1])+'</span></div>'+((c!==1&&c!==9)?'<div class="bsm">'+esc(D.s[0][0])+'</div>':'')}
    out+='<p class="mush-p">';
    for(var v=v1;v<=v2;v++)out+='<span class="v">'+esc(verseText(c,v))+'</span><span class="vn">'+ar(v)+'</span> ';
    out+='</p>';
  }
  return out;
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
  if(l[0]==='h')return '<div class="ml hd"><span>سورة '+esc(QD().n[l[1]-1])+'</span></div>';
  if(l[0]==='b')return '<div class="ml bs"><span>'+esc(QD().s[0][0])+'</span></div>';
  return '<div class="ml"><div class="mi">'+l[1].split(' ').map(function(t){return '<span class="mw">'+mTok(t)+'</span>'}).join('')+'</div></div>';
}
function vReader(){
  var MU=window.MUSHAF;
  if(rd&&isW())return vWarshReader();
  if(!rd||!MU)return '<section class="card"><p class="note">لا توجد جلسة قراءة.</p><button class="btn block" data-a="tab" data-v="quran">رجوع</button></section>';
  var p=rd.page,pg=MU.p[p-1],m=MU.m[p-1],atEnd=p>=rd.to,n=p-rd.from+1,tj=S.quran.tj!==false;
  var lg=tj?'<div class="tjl">'+TJL.map(function(x){return '<span><i class="t'+x[1]+'"></i>'+x[0]+'</span>'}).join('')+'</div>':'';
  return '<div class="mp'+(tj?'':' notj')+'" id="mp"><div class="mp-in">'
  +'<div class="mp-h"><span>الجزء '+ar(m[0])+' · حزب '+ar(m[1])+'</span><span class="sb">'+esc(QD().n[m[2]-1])+'</span></div>'
  +'<div class="mp-l">'+pg.map(mLine).join('')+'</div>'
  +'<div class="mp-f"><span class="pn">'+ar(p)+'</span></div></div></div>'
  +'<div class="rbar"><button class="ib" data-a="qpage" data-v="-1" aria-label="الصفحة السابقة"'+(p<=1?' disabled':'')+'>'+ic('chev').replace('class="i"','class="i" style="transform:scaleX(-1)"')+'</button>'
  +'<div class="rmid"><b>'+ar(n)+' / '+ar(rd.to-rd.from+1)+'</b><small>من وردك</small></div>'
  +'<button class="btn good reader-done" data-a="qdone">'+ic('check')+'تم</button>'
  +'<button class="ib" data-a="qpage" data-v="1" aria-label="الصفحة التالية"'+(p>=604?' disabled':'')+'>'+ic('chev')+'</button></div>'
  +lg
  +'<div class="fsz"><button class="ib" data-a="qtj" aria-pressed="'+tj+'">ألوان التجويد: '+(tj?'تشغيل':'إيقاف')+'</button>'+'</div>';
}
var fitTok=0;
function fitMushaf(){
  var mp=document.getElementById('mp');if(!mp)return;
  var L=mp.querySelector('.mp-l');if(!L)return;
  var rows=[].slice.call(L.querySelectorAll('.ml:not(.hd):not(.bs)'));
  if(!rows.length)return;
  var W=L.clientWidth,H=L.clientHeight;if(!W||!H)return;
  /* Fit every original line inside the page's real available height. */
  var rowH=H/rows.length;
  var size=Math.min(29,Math.max(16,Math.floor(rowH/1.18)));
  L.style.fontSize=size+'px';
  L.style.justifyContent='space-between';
  rows.forEach(function(r){
    var mi=r.firstChild;if(!mi)return;
    r.style.flex='1 1 0';r.style.minHeight='0';r.style.height='auto';
    r.style.lineHeight='1.08';
    mi.style.transform='none';mi.style.transformOrigin='center center';
    mi.style.width='max-content';mi.style.maxWidth='none';
    mi.style.justifyContent='center';mi.style.gap='.12em';
    var natural=mi.scrollWidth;
    var scale=natural>W?Math.max(.5,W/natural):1;
    mi.style.transform='scaleX('+scale.toFixed(4)+')';
  });
  mp.style.overflow='hidden';
}
function fitWarshPage(){
  var mp=document.getElementById('mp');if(!mp||!isW())return;
  var L=mp.querySelector('.wp');if(!L)return;
  var H=L.clientHeight;if(!H)return;
  var ps=[].slice.call(L.querySelectorAll('.wp-p'));
  /* Keep paragraph boxes at their natural height so the last ayat cannot be clipped. */
  L.style.overflowY='auto';
  L.style.overflowX='hidden';
  L.style.justifyContent='flex-start';
  L.style.alignContent='start';
  ps.forEach(function(p){
    p.style.flex='0 0 auto';
    p.style.minHeight='max-content';
    p.style.height='auto';
    p.style.overflow='visible';
  });
  var max=29,min=17,sz=max;
  L.style.fontSize=sz+'px';
  L.style.lineHeight='1.30';
  for(var pass=0;pass<24;pass++){
    if(L.scrollHeight<=H+1)break;
    sz=Math.max(min,sz-.5);
    L.style.fontSize=sz+'px';
  }
  /* If even the minimum font does not fit, preserve the complete page in an internal scroll area. */
  if(L.scrollHeight<=H+1){
    L.style.overflowY='hidden';
    L.style.justifyContent='space-evenly';
  }else{
    L.style.overflowY='auto';
    L.style.justifyContent='flex-start';
  }
}
function fitSoon(){
  if(isW()){
    fitWarshPage();
    if(document.fonts&&document.fonts.load){
      var wt=++fitTok;
      document.fonts.load('23px KFGQPCWarsh','\u0628\u0633\u0645').then(function(){if(wt===fitTok)fitWarshPage()},function(){});
    }
    setTimeout(fitWarshPage,400);setTimeout(fitWarshPage,1200);
    return;
  }
  fitMushaf();
  if(document.fonts&&document.fonts.load){var t=++fitTok;document.fonts.load('30px KFGQPC','\u0628\u0633\u0645').then(function(){if(t===fitTok)fitMushaf()},function(){});
  setTimeout(fitMushaf,400);setTimeout(fitMushaf,1200)}
}
var BAD_HABITS=[['smoke','التدخين'],['lie','الكذب'],['deceive','الخداع'],['backbite','الغيبة']];
var WORSHIP=[['prayer','الصلاة','mosque'],['fast','الصوم','moon'],['adhkar','الأذكار','beads'],['quran','قراءة القرآن','book'],['wird','الورد اليومي','doc'],['istighfar','الاستغفار','refresh'],['charity','الصدقة','heart'],['lesson','حضور درس علم','book'],['night','قيام الليل','moon'],['help','مساعدة محتاج','heart'],['visit','زيارة مريض','user']];
function worshipItems(){return WORSHIP.concat((S.customWorship||[]).map(function(x){return [x.id,x.t,'sparkles',true]}))}
function worshipDay(k){return (S.worship||{})[k]||{}}
function worshipPoints(k){var w=worshipDay(k);return worshipItems().reduce(function(n,x){return n+(w[x[0]]===true?1:0)},0)}
function totalWorshipPoints(){return Object.keys(S.worship||{}).reduce(function(n,k){return n+worshipPoints(k)},0)}
function worshipToggle(id,val){var k=dk();S.worship=S.worship||{};S.worship[k]=S.worship[k]||{};S.worship[k][id]=val;save();checkNew()}

function hijriNumeric(d){
  try{
    var f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});
    var p=f.formatToParts(d),o={};p.forEach(function(x){if(x.type==='day'||x.type==='month'||x.type==='year')o[x.type]=parseInt(x.value,10)});
    if(o.day&&o.month&&o.year)return o;
  }catch(e){}
  try{
    var f2=new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});
    var p2=f2.formatToParts(d),o2={};p2.forEach(function(x){if(x.type==='day'||x.type==='month'||x.type==='year')o2[x.type]=parseInt(x.value,10)});
    return o2;
  }catch(e){return null}
}
function fastingReasons(d){
  d=d||new Date();var p=(S.fasting&&S.fasting.prefs)||{},out=[],h=hijriNumeric(d),wd=d.getDay();
  if(p.monThu&&(wd===1||wd===4))out.push(wd===1?'صيام الاثنين':'صيام الخميس');
  if(h){
    if(p.whiteDays&&h.day>=13&&h.day<=15)out.push('الأيام البيض ('+h.day+')');
    if(p.ashura&&h.month===1&&(h.day===9||h.day===10))out.push(h.day===9?'تاسوعاء':'عاشوراء');
    if(p.arafa&&h.month===12&&h.day===9)out.push('يوم عرفة');
    if(p.shawwal&&h.month===10&&h.day>=2&&h.day<=7)out.push('ست من شوال');
  }
  if(p.dawud&&S.fasting.dawudAnchor){
    var diff=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-parse(S.fasting.dawudAnchor))/86400000);
    if(diff>=0&&diff%2===0)out.push('صيام يوم وإفطار يوم');
  }
  if((S.fasting.customDates||[]).indexOf(dk(d))>=0)out.push('يوم صيام مخصص');
  return out;
}
function nextFastingDays(limit){
  var out=[],today=new Date();today.setHours(0,0,0,0);
  for(var i=0;i<70&&out.length<limit;i++){var d=new Date(today);d.setDate(d.getDate()+i);var r=fastingReasons(d);if(r.length)out.push({date:dk(d),day:d.toLocaleDateString('ar-EG',{weekday:'long'}),reasons:r})}
  return out;
}
function fastingStatus(k){return (S.fasting.records||{})[k]||''}
function vFasting(){
  var today=dk(),todayReasons=fastingReasons(new Date()),up=nextFastingDays(8),p=S.fasting.prefs,r=S.fasting.reminders;
  var items=[['monThu','الاثنين والخميس','صيام التطوع الأسبوعي'],['whiteDays','الأيام البيض','13 و14 و15 من كل شهر هجري'],['ashura','تاسوعاء وعاشوراء','9 و10 محرم'],['arafa','يوم عرفة','9 ذو الحجة'],['shawwal','ستة من شوال','من 2 إلى 7 شوال'],['dawud','صيام داود','يوم صيام ويوم إفطار']];
  var html='<section class="card fasting-hero"><div class="fasting-icon">'+ic('moon')+'</div><h2>باب الصيام</h2><p class="note">تابع صيام التطوع، وخطّط لأيامك القادمة، وسجّل ما أتممته.</p><div class="fasting-today"><b>اليوم</b><span>'+(todayReasons.length?todayReasons.join(' · '):'لا يوجد صيام تطوع محدد اليوم')+'</span></div><div class="row"><button class="btn good" data-a="fastrecord" data-v="done">صمت اليوم</button><button class="btn ghost" data-a="fastrecord" data-v="missed">لم أصم</button></div>'+(fastingStatus(today)?'<p class="note" style="margin:8px 0 0">حالة اليوم: '+(fastingStatus(today)==='done'?'تم تسجيل الصيام':'لم يتم الصيام')+'</p>':'')+'</section>';
  html+='<section class="card"><h3>أيام الصيام التي تتابعها</h3><p class="note">فعّل الأيام التي تريد إدراجها في جدولك.</p><div class="fast-options">'+items.map(function(x){return '<button class="fast-option '+(p[x[0]]?'on':'')+'" data-a="fastpref" data-v="'+x[0]+'"><span class="fast-check">'+(p[x[0]]?ic('check'):'')+'</span><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span></button>'}).join('')+'</div></section>';
  html+='<section class="card"><h3>الأيام القادمة</h3>'+(up.length?up.map(function(x){return '<div class="fast-next"><div><b>'+esc(x.day)+'</b><small>'+esc(x.date)+'</small></div><span>'+esc(x.reasons.join(' · '))+'</span></div>'}).join(''):'<p class="note">فعّل نوعًا من الصيام لعرض الأيام القادمة.</p>')+'<div class="addrow"><input type="date" id="fast-custom-date"><button class="btn" data-a="fastcustom">إضافة يوم</button></div></section>';
  html+='<section class="card"><h3>تذكيرات الصيام</h3><div class="fast-option"><span><b>تفعيل التذكيرات داخل التطبيق</b><small>عرض تنبيهات الصيام في مركز التذكيرات</small></span><button class="toggle '+(r.enabled?'on':'')+'" data-a="fastremind" data-v="enabled">'+(r.enabled?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>التذكير قبل يوم الصيام</b><small>عند فتح التطبيق في اليوم السابق</small></span><button class="toggle '+(r.beforeDay?'on':'')+'" data-a="fastremind" data-v="beforeDay">'+(r.beforeDay?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>تذكير السحور</b><small>الوقت المفضل لديك</small></span><button class="toggle '+(r.suhoor?'on':'')+'" data-a="fastremind" data-v="suhoor">'+(r.suhoor?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>موعد السحور</b></span><input type="time" id="suhoor-time" value="'+esc(r.suhoorTime||'03:30')+'"></div><div class="fast-option"><span><b>تذكير الإفطار</b><small>تذكير اختياري داخل التطبيق</small></span><button class="toggle '+(r.iftar?'on':'')+'" data-a="fastremind" data-v="iftar">'+(r.iftar?'مفعّل':'متوقف')+'</button></div><div class="fast-option"><span><b>وقت الإفطار</b></span><input type="time" id="iftar-time" value="'+esc(r.iftarTime||'17:00')+'"></div><button class="btn block" data-a="fasttimes">حفظ أوقات التذكير</button><p class="note" style="margin-top:10px">تُعرض التذكيرات داخل التطبيق حاليًا. التنبيهات التي تعمل بعد إغلاق التطبيق تحتاج إضافة مكوّن إشعارات Android الأصلي.</p></section>';
  return html+COPY;
}
function vHabits(){
  var k=dk(),hb=(S.habits||{})[k]||{},counts=(S.habitCounts||{})[k]||{};
  var good=allHabits(),bad=BAD_HABITS.concat((S.extraHabits||[]).filter(function(h){return h.type==='bad'}).map(function(h){return [h.id,h.t,true]}));
  var done=good.filter(function(h){return !!hb[h[0]]}).length;
  var badCount=bad.reduce(function(n,h){return n+(counts[h[0]]||0)},0);
  var h='<section class="card habits-summary"><div class="row between"><b>العادات الحسنة</b><strong>'+done+' / '+good.length+'</strong></div><div class="bar"><div style="width:'+(good.length?Math.round(done/good.length*100):0)+'%"></div></div><p class="note">كل خطوة حسنة تُسجّلها اليوم تقرّبك من هدفك.</p><div class="row between"><b>مرات تسجيل العادات السيئة اليوم</b><strong>'+badCount+'</strong></div><p class="note">العداد للتوعية والمتابعة، وليس للحكم عليك. ابدأ من جديد دون جلد للذات.</p></section>';
  h+='<div class="sect">'+ic('leaf')+'عادات حسنة</div><div class="cl">'+good.map(function(x){var on=!!hb[x[0]],custom=!!x[2];return '<div class="cli sq'+(on?' on':'')+'"><span class="nm">'+esc(x[1])+'</span>'+(custom?'<button class="x" data-a="delxh" data-v="'+esc(x[0])+'" aria-label="حذف العادة">'+ic('trash')+'</button>':'')+'<button class="ck" data-a="hab" data-v="'+esc(x[0])+'" aria-pressed="'+on+'">'+ic('check')+'</button></div>'}).join('')+'</div>';
  h+='<div class="sect bad-sect">'+ic('target')+'عادات تريد التقليل منها أو تركها</div><p class="note">سجّل كل مرة تحدث فيها العادة، وتابع انخفاض العدد مع الوقت.</p><div class="cl">'+bad.map(function(x){var n=counts[x[0]]||0,custom=!!x[2];return '<div class="cli bad-habit"><span class="nm">'+esc(x[1])+'</span><span class="habit-count">'+n+'</span><button class="count-btn" data-a="baddec" data-v="'+esc(x[0])+'" aria-label="تقليل العداد">−</button><button class="count-btn plus" data-a="badinc" data-v="'+esc(x[0])+'" aria-label="تسجيل مرة">+</button>'+(custom?'<button class="x" data-a="delxh" data-v="'+esc(x[0])+'" aria-label="حذف العادة">'+ic('trash')+'</button>':'')+'</div>'}).join('')+'</div>';
  h+='<section class="card"><h3>'+(addingHabit?'إضافة عادة جديدة':'إضافة عادة')+'</h3>'+(addingHabit?'<div class="row"><button class="btn '+(addingHabitType==='good'?'':'ghost')+'" data-a="newhtype" data-v="good">عادة حسنة</button><button class="btn '+(addingHabitType==='bad'?'':'ghost')+'" data-a="newhtype" data-v="bad">عادة سيئة</button></div><input type="text" id="new-habit-name" maxlength="60" placeholder="مثال: قراءة صفحة قرآن أو التدخين"><button class="btn block" data-a="saveextra">حفظ العادة</button><button class="btn ghost block" data-a="cancelextra">إلغاء</button>':'<button class="addbtn" data-a="addextra">'+ic('plus')+'إضافة عادة حسنة أو سيئة</button>')+'</section>';
  return h+COPY;
}
function vCal(){
  var y=calD.getFullYear(),m=calD.getMonth(),first=(new Date(y,m,1).getDay()+1)%7,n=new Date(y,m+1,0).getDate(),h='',ok=0,rel=0;
  for(var i=0;i<first;i++)h+='<div></div>';
  for(var d=1;d<=n;d++){var k=dk(new Date(y,m,d)),st=S.days[k]?S.days[k].status:'';if(st==='success')ok++;if(st==='relapse')rel++;
    h+='<button class="day '+st+(k===dk()?' today':'')+'" data-a="sel" data-k="'+k+'">'+d+'</button>'}
  var rate=(ok+rel)?Math.round(ok/(ok+rel)*100):0;
  var sel=calSel?'<section class="card"><h3>'+esc(calSel)+'</h3>'+(S.days[calSel]&&S.days[calSel].note?'<p>'+esc(S.days[calSel].note)+'</p>':'')
   +'<div class="row"><button class="btn good" data-a="setday" data-v="success">ملتزم</button><button class="btn bad" data-a="setday" data-v="relapse">تعثر</button><button class="btn ghost" data-a="setday" data-v="">مسح</button></div></section>':'';
  return '<section class="card"><div class="mhead"><button class="icon" data-a="next" aria-label="الشهر التالي">›</button><h2>'+MONTHS[m]+' '+y+'</h2><button class="icon" data-a="prev" aria-label="الشهر السابق">‹</button></div>'
  +'<div class="cal">'+WKD.map(function(w){return '<div class="wd">'+w+'</div>'}).join('')+h+'</div>'
  +'<p class="legend"><span><span class="dot" style="background:var(--good)"></span>ملتزم</span><span><span class="dot" style="background:var(--bad)"></span>تعثر</span><span><span class="dot" style="background:var(--line)"></span>بدون متابعة</span></p></section>'
  +sel
  +'<section class="card"><div class="rateline"><div><h3 style="margin:0">إحصائيات الشهر</h3><small>'+ok+' ملتزم · '+rel+' تعثر</small></div><b>'+rate+'%</b></div><div class="bar"><div style="width:'+rate+'%"></div></div></section>'
  +vInsights();
}
function vInsights(){
  var x=trigCounts();
  if(!x.tot)return '<section class="card"><h3>تحليل المحفّزات</h3><p class="muted" style="margin:0">سجّل ما أثار الرغبة كل يوم من الصفحة الرئيسية، وستظهر هنا أكثر المحفّزات تأثيراً عليك.</p></section>';
  var mx=Math.max.apply(null,TRIG.map(function(t){return x.c[t[0]]||0}));
  return '<section class="card"><h3>تحليل المحفّزات</h3>'+TRIG.map(function(t){var n=x.c[t[0]]||0,r=x.r[t[0]]||0;
    return '<div class="ins"><span>'+t[1]+'</span><div class="bar"><div style="width:'+Math.round(n/mx*100)+'%"></div></div><b>'+n+'</b></div>'+(r?'<div class="ins" style="margin-top:-4px"><span></span><small>منها '+r+' في أيام انتكاسة</small></div>':'')}).join('')+'</section>';
}
function vProgress(){
  var N=per==='week'?7:30,x=periodStats(N),C=2*Math.PI*84,off=C*(1-x.rate/100);
  var msgT=x.rate>=80?'أحسنت':x.rate>=50?'جيد، واصل':'ابدأ من جديد',msgS=x.rate>=80?'استمر، أنت تتقدم بخطوات ثابتة.':x.rate>=50?'أنت على الطريق، زِد قليلاً كل يوم.':'كل خطوة صغيرة تُحسب، ولا تحاسب نفسك على الماضي.';
  return '<div class="seg"><button class="'+(per==='week'?'on':'')+'" data-a="per" data-v="week">أسبوعي</button><button class="'+(per==='month'?'on':'')+'" data-a="per" data-v="month">شهري</button></div>'
  +'<div class="bigring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="84" fill="none" stroke="var(--surface-2)" stroke-width="14"/><circle cx="100" cy="100" r="84" fill="none" stroke="var(--good)" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div class="mid"><b>'+x.rate+'%</b><small>معدل الالتزام</small></div></div>'
  +'<div class="grid3"><div class="stat g"><b>'+x.ok+'</b><small>أيام ملتزمة</small></div><div class="stat r"><b>'+x.rel+'</b><small>أيام تعثر</small></div><div class="stat o"><b>'+x.tot+'</b><small>إجمالي الأيام</small></div></div>'
  +'<section class="card cheer">'+ic('leaf')+'<div><b>'+msgT+'</b><span class="muted">'+msgS+'</span></div></section>'
  +'<section class="card"><h3>مراجعة صادقة مع النفس</h3><p class="note">ما أكثر شيء ساعدك؟ وما خطوة واحدة تريد تحسينها؟</p><textarea id="review-note" maxlength="2000" placeholder="اكتب ملاحظاتك الخاصة..."></textarea><button class="btn block" data-a="savereview">حفظ المراجعة على هذا الجهاز</button></section>'
  +'<p class="note">هذه مؤشرات ذاتية مبنية على ما سجلته فقط، وليست حكماً على قيمتك أو التزامك.</p>';
}
function vAdhkar(){
  var chips='<div class="chips">'+ADHKAR.map(function(a){return '<button class="chip'+(a.id===group?' on':'')+'" data-a="grp" data-v="'+a.id+'">'+a.title+'</button>'}).join('')
   +'<button class="chip'+(group==='duas'?' on':'')+'" data-a="grp" data-v="duas">أدعية</button></div>';
  if(group==='duas')return chips+DUAS.map(function(d){return '<section class="card"><p class="ar">'+esc(d.t)+'</p><small>'+esc(d.s)+'</small></section>'}).join('');
  var g=ADHKAR.filter(function(x){return x.id===group})[0],c=S.counters[dk()]||{};
  return chips+g.items.map(function(it){var v=c[it.id]||0;
    return '<section class="card dhikr'+(v>=it.n?' done':'')+'"><p class="ar">'+esc(it.t)+'</p><div class="row between"><button class="counter" data-a="tap" data-id="'+it.id+'" data-n="'+it.n+'">'+v+' / '+it.n+'</button><button class="icon" data-a="rst" data-id="'+it.id+'" aria-label="إعادة">↺</button></div></section>'}).join('');
}
function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function vBoost(){
  var q=MOTIV[qi%MOTIV.length];
  return '<section class="card"><h3>لحظة الرغبة: افعل هذا الآن</h3><ol>'+SOS.map(function(s){return '<li style="display:list-item;border:0">'+esc(s)+'</li>'}).join('')+'</ol>'
  +(secs===null?'<button class="btn good block" data-a="tstart">ابدأ مؤقت ٥ دقائق</button>':'<div class="timer" id="timer">'+fmt(secs)+'</div><button class="btn ghost block" data-a="tstop">إيقاف</button>')+'</section>'
  +'<section class="card"><div class="sum"><b>'+(S.urges||[]).length+'</b><div style="flex:1">رغبة تجاوزتها بفضل الله</div></div><button class="btn good block" style="margin-top:10px" data-a="urge">'+ic('check')+'تجاوزتُ الرغبة الآن</button></section>'
  +'<section class="card"><h3>نصائح عملية</h3><ul class="tips">'+GTIPS.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></section>'
  +'<section class="card quote">'+quote(q)+'<button class="btn ghost" data-a="nextq">التالي ›</button></section>'
  +'<section class="card"><h3>أسبابي للإقلاع</h3>'+(S.reasons.length?'':'<p class="muted">اكتب أسبابك لتقرأها وقت الضعف.</p>')
  +'<ul>'+S.reasons.map(function(r,i){return '<li><span>'+esc(r)+'</span><button class="icon" data-a="delr" data-i="'+i+'" aria-label="حذف">'+ic('x')+'</button></li>'}).join('')+'</ul>'
  +'<div class="row"><input type="text" id="reason" maxlength="200" placeholder="سبب جديد..."><button class="btn" style="flex:0 0 auto" data-a="addr">إضافة</button></div></section>';
}
function badge(a){
  var inner=a.kind==='streak'?'<div class="bi">'+ic('trophy')+'<span'+(a.n>=100?' class="s3"':'')+'>'+a.n+'</span></div>':'<div class="bi">'+ic(a.icon)+'</div>';
  return '<div class="bd'+(a.done?' got':'')+'">'+inner+'<b>'+esc(a.title)+'</b><small>'+esc(a.desc)+'</small>'
   +(a.done?'<span class="okc">'+ic('check')+'</span>':'<div class="bar"><div style="width:'+Math.round(a.p*100)+'%"></div></div>')+'</div>';
}
function vAch(){
  var all=achievements(),got=all.filter(function(a){return a.done}).length,s=stats(),tp=0;
  Object.keys(S.quran.log).forEach(function(d){tp+=S.quran.log[d]||0});
  var st=all.filter(function(a){return a.kind==='streak'}),ot=all.filter(function(a){return a.kind!=='streak'});
  return '<div class="astats"><div class="astat"><small>الشارات المحققة</small><b>'+got+'</b></div><div class="astat"><small>الصفحات المقروءة</small><b>'+tp+'</b></div><div class="astat"><small>نقاط العبادات</small><b>'+totalWorshipPoints()+'</b></div></div>'
  +'<section class="card flat" style="padding:12px 16px"><div class="row between"><span>مرتبتك</span><span class="rank">'+rankName(s.best)+'</span></div><div class="bar"><div style="width:'+Math.round(got/all.length*100)+'%"></div></div></section>'
  +'<div class="sect">أبرز الإنجازات</div><div class="badges">'+ot.map(badge).join('')+'</div>'
  +'<div class="sect">سلسلة الأيام</div><div class="badges">'+st.map(badge).join('')+'</div>';
}
function lrow(tabId,icon,title,sub){return '<button class="lrow" data-a="tab" data-v="'+tabId+'">'+ic(icon)+'<span class="t">'+title+(sub?'<small class="muted">'+sub+'</small>':'')+'</span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'}
function vMore(){
  return '<div class="lrows">'+lrow('fasting','moon','الصيام والتذكير','الاثنين والخميس والأيام البيض والمناسبات')+lrow('habits','target','العادات الحسنة والسيئة','متابعة العادات والعدادات اليومية')+lrow('adhkar','beads','الأذكار والأدعية','الصباح والمساء وقبل النوم')+lrow('boost','shield','محفزات ولحظة الرغبة','مؤقت وخطوات عملية وأسبابي')+lrow('ach','trophy','لوحة الإنجازات','أوسمتك وسلاسل الأيام')+lrow('developer','star','المطوّر وحقوق التطبيق','التواصل والاقتراحات')+lrow('settings','gear','الإعدادات','المظهر والقفل والنسخ الاحتياطي')+'</div>'+COPY;
}
function vDeveloper(){
  var wa='https://wa.me/201020372842';
  return '<section class="card devc"><div class="avatar">Æ</div><h2 style="margin:0">AHMED ELAGAMY</h2><p class="muted" style="margin:4px 0 10px">مطوّر تطبيق السائر إلى الله</p><span class="chipv">'+ic('shield').replace('class="i"','class="i" style="width:16px;height:16px"')+'الحقوق محفوظة</span><p class="note">تجربة رقمية تساعد على تحسين العادات والمحافظة على العبادة بخطوات متدرجة.</p></section>'
  +'<div class="lrows">'
  +'<a class="lrow" href="'+wa+'" target="_blank" rel="noopener">'+ic('mail')+'<span class="t">التواصل الرسمي<small class="muted">واتساب</small></span>'+ic('chev').replace('class="i"','class="i chev"')+'</a>'
  +'<a class="lrow" href="https://www.facebook.com/share/1E4Mr4L2Yd/" target="_blank" rel="noopener">'+ic('user')+'<span class="t">صفحة المطوّر على فيسبوك</span>'+ic('chev').replace('class="i"','class="i chev"')+'</a>'
  +'<a class="lrow" href="'+wa+'?text='+encodeURIComponent('اقتراح لتطوير تطبيق السائر إلى الله:')+'" target="_blank" rel="noopener">'+ic('pen')+'<span class="t">اقتراح تطوير</span>'+ic('chev').replace('class="i"','class="i chev"')+'</a>'
  +'<a class="lrow" href="'+wa+'?text='+encodeURIComponent('أريد الإبلاغ عن مشكلة في تطبيق السائر إلى الله:')+'" target="_blank" rel="noopener">'+ic('help')+'<span class="t">الإبلاغ عن مشكلة</span>'+ic('chev').replace('class="i"','class="i chev"')+'</a>'
  +'<button class="lrow" data-a="showlog">'+ic('doc')+'<span class="t">سجل الإصدارات</span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'
  +(showLog?'<section class="card flat release-log"><div class="release-log-head"><b>سجل التحديثات</b><span>آخر التحسينات</span></div><p><b>1.0.8 · تحسينات حديثة</b><br>إظهار قلم تعديل الصورة بوضوح، وعرض الصورة بالحجم الكامل، وتحديث حديث «كل يوم بداية جديدة» عبر الإنترنت عند توفر الاتصال، مع حفظ الأحاديث للقراءة دون إنترنت.</p><p><b>1.0.8</b> · إضافة مخطط الصيام، ومركز تذكيرات تفاعلي، وعدّادات العادات الحسنة والسيئة.</p><p><b>1.0</b> · النسخة الأولى: الصلوات والقرآن والأذكار والعادات والتقويم والتقدم، مع قفل برمز سري ونسخ احتياطي.</p></section>':'')
  +'<button class="lrow" data-a="showprivacy">'+ic('shield')+'<span class="t">الخصوصية</span>'+ic('chev').replace('class="i"','class="i chev"')+'</button>'
  +(showPrivacy?'<section class="card flat"><p class="note" style="margin:0">كل بياناتك تُحفظ على جهازك فقط، بياناتك الشخصية والعبادات محفوظة على جهازك. الأحاديث اليومية محفوظة داخل التطبيق، ولا تُرسل سجلاتك أو ملفك الشخصي إلى أي خادم.</p></section>':'')
  +'</div><p class="copy">© 2026 AHMED ELAGAMY · جميع الحقوق محفوظة</p>';
}
function srow(key,icon,title,val){return '<button class="lrow" data-a="sopen" data-v="'+key+'" aria-expanded="'+(setOpen===key)+'">'+ic(icon)+'<span class="t">'+title+'</span>'+(val?'<span class="val">'+val+'</span>':'')+ic('chev').replace('class="i"','class="i chev"')+'</button>'}
function vSettings(){
  var CH=ic('chev').replace('class="i"','class="i chev"'),M='<p class="msg">'+esc(msg)+'</p>';
  var P=function(k,html){return setOpen===k?'<div class="panel">'+html+'</div>':''};
  return '<div class="lrows">'
  +srow('acct','shield','الحساب والأمان',S.pin?'القفل مفعّل':'')
  +P('acct','<section class="card"><h3>قفل التطبيق</h3><div class="row" style="flex-wrap:nowrap"><input type="password" inputmode="numeric" id="pin" placeholder="'+(S.pin?'رمز جديد':'رمز من ٤ أرقام على الأقل')+'"><button class="btn" style="flex:0 0 auto" data-a="setpin">حفظ</button></div>'+(S.pin?'<p style="margin-top:10px"><button class="btn ghost" data-a="nopin">إلغاء القفل</button></p>':'')+'<h3 style="margin-top:16px">القفل بنمط</h3><p class="note" style="margin:0">'+(patFirst?'أعد رسم النمط للتأكيد':'ارسم نمطاً يربط ٤ نقاط على الأقل ثم أعد رسمه للتأكيد. النمط يحل محل الرمز الحالي.')+'</p>'+patHtml()+M+'</section>')
  +srow('look',isDark()?'moon':'sun','المظهر',isDark()?'داكن':'فاتح')
  +P('look',vAppearance())
  +srow('lng','info',lang()==='ar'?'اللغة':'Language',({ar:'العربية',en:'English',fr:'Français',tr:'Türkçe',es:'Español',de:'Deutsch',id:'Bahasa Indonesia',ur:'اردو'})[lang()]||'العربية')
  +P('lng','<section class="card ap"><div class="opt-list">'+oBtn('ulang','ar',lang(),'<b>العربية</b><small>Arabic</small>','uo ol')+oBtn('ulang','en',lang(),'<b>English</b><small>الإنجليزية</small>','uo ol')+oBtn('ulang','fr',lang(),'<b>Français</b><small>الفرنسية</small>','uo ol')+oBtn('ulang','tr',lang(),'<b>Türkçe</b><small>التركية</small>','uo ol')+oBtn('ulang','es',lang(),'<b>Español</b><small>الإسبانية</small>','uo ol')+oBtn('ulang','de',lang(),'<b>Deutsch</b><small>الألمانية</small>','uo ol')+oBtn('ulang','id',lang(),'<b>Bahasa Indonesia</b><small>الإندونيسية</small>','uo ol')+oBtn('ulang','ur',lang(),'<b>اردو</b><small>الأردية</small>','uo ol')+'</div></section>')
  +srow('prof','user','الملف الشخصي',(S.profile&&S.profile.name)||'إضافة الاسم والصورة')
  +P('prof','<section class="card profile-edit"><div class="profile-preview" id="profile-preview"><div class="profile-photo-line"><div class="profile-edit-head"><button type="button" class="profile-photo-open" data-a="viewprofilephoto" aria-label="عرض الصورة بالحجم الكامل">'+profileAvatar(76)+'</button><div><h3 id="profile-preview-name">'+esc((S.profile&&S.profile.name)||'ملفك الشخصي')+'</h3><p class="note" id="profile-preview-age">'+((S.profile&&S.profile.age)?'العمر · '+esc(S.profile.age)+' سنة':'بياناتك الخاصة تظهر هنا بشكل أنيق')+'</p></div></div><button type="button" class="profile-photo-pencil" data-a="editprofilephoto" aria-label="تعديل الصورة">'+ic('pencil')+'</button></div></div><input id="profile-photo" type="file" accept="image/*" class="profile-file" style="display:none"><label class="profile-label" for="profile-name">الاسم</label><input id="profile-name" type="text" maxlength="40" value="'+esc(S.profile&&S.profile.name||'')+'" placeholder="اكتب اسمك"><label class="profile-label" for="profile-age">السن</label><input id="profile-age" type="number" inputmode="numeric" min="1" max="120" value="'+esc(S.profile&&S.profile.age||'')+'" placeholder="عمرك بالسنوات"><p class="note">يمكنك ترك السن أو الصورة دون إضافة.</p><button class="btn block" data-a="saveprofile">حفظ الملف الشخصي</button></section><section class="card"><p class="note">طريقة المخاطبة</p><div class="row"><button class="btn ghost" data-a="gender" data-v="male">ذكر</button><button class="btn ghost" data-a="gender" data-v="female">أنثى</button></div></section>')
  +srow('bk','cloud','النسخ الاحتياطي','على هذا الجهاز')
  +P('bk','<section class="card"><p class="note">تنبيه خصوصية: النسخة الاحتياطية نص قابل للقراءة؛ احفظها في مكان خاص ولا ترسلها للآخرين.</p><textarea id="bk" placeholder="الصق النسخة هنا للاسترجاع"></textarea><div class="row"><button class="btn" data-a="bkcopy">نسخ بياناتي</button><button class="btn ghost" data-a="bkrestore">استرجاع</button></div>'+M+'</section>')
  +'<a class="lrow" href="https://wa.me/201020372842" target="_blank" rel="noopener">'+ic('help')+'<span class="t">مساعدة ودعم</span>'+CH+'</a>'
  +'<button class="lrow" data-a="tab" data-v="developer">'+ic('info')+'<span class="t">عن التطبيق</span>'+CH+'</button>'
  +srow('rst','trash','مسح كل البيانات','')
  +P('rst','<section class="card"><p class="note">سيُحذف كل ما سجّلته على هذا الجهاز نهائياً.</p><button class="btn bad" data-a="reset">'+(confirmReset?'تأكيد المسح النهائي؟ اضغط مرة أخرى':'مسح')+'</button>'+M+'</section>')
  +'</div>'+COPY;
}

var patSeq=[],patDown=false,patFirst='',patPid=null;
function patHtml(){
  var h='<div class="pat" id="pat"><svg viewBox="0 0 240 240" aria-hidden="true"><polyline id="patl" points=""/></svg>';
  for(var i=1;i<=9;i++){var x=(i-1)%3,y=Math.floor((i-1)/3);h+='<i data-n="'+i+'" style="left:'+(12+80*x)+'px;top:'+(12+80*y)+'px"></i>'}
  return h+'</div>';
}
function patCenter(n){return[40+80*((n-1)%3),40+80*Math.floor((n-1)/3)]}
function patDraw(cx,cy){
  var el=document.getElementById('patl');if(!el)return;
  var pts=patSeq.map(function(n){return patCenter(n).join(',')});
  if(cx!=null)pts.push(cx+','+cy);
  el.setAttribute('points',pts.join(' '));
  [].forEach.call(document.querySelectorAll('#pat i'),function(d){d.classList.toggle('on',patSeq.indexOf(+d.dataset.n)>-1)});
}
function patHit(e){
  var box=document.getElementById('pat');if(!box)return;
  var r=box.getBoundingClientRect(),k=240/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k;
  for(var n=1;n<=9;n++){var c=patCenter(n);if(Math.hypot(x-c[0],y-c[1])<=30&&patSeq.indexOf(n)<0){patSeq.push(n);if(navigator.vibrate)try{navigator.vibrate(12)}catch(_){}}}
  patDraw(Math.max(0,Math.min(240,x)),Math.max(0,Math.min(240,y)));
}
async function tryUnlock(l){
  var wait=lockRemaining();
  if(wait>0){msg='محاولات كثيرة؛ حاول بعد '+Math.ceil(wait/1000)+' ثانية';return}
  try{if(await verifyPin(l,S.pin)){clearBadPins();if(typeof S.pin==='string'){S.pin=await makePinRecord(l)}unlocked=true;msg='';save()}else{var rem=recordBadPin();msg=rem>0?'رمز خاطئ؛ تم إيقاف المحاولة مؤقتاً':'رمز خاطئ'}}catch(err){msg='تعذر التحقق الآمن من الرمز على هذا الجهاز'}
}
async function patDone(code){
  if(!unlocked){await tryUnlock(code);render();return}
  if(!patFirst){patFirst=code;msg='أعد رسم النمط للتأكيد'}
  else if(patFirst===code){patFirst='';try{S.pin=await makePinRecord(code);S.lockType='pattern';save();msg='تم حفظ النمط بصورة مشتقة تشفيرياً'}catch(err){msg='تعذر إنشاء حماية آمنة على هذا الجهاز؛ لم يتم حفظ النمط'}}
  else{patFirst='';msg='النمطان غير متطابقين؛ ابدأ من جديد'}
  render();
}
document.addEventListener('pointerdown',function(e){
  var box=e.target.closest&&e.target.closest('#pat');if(!box)return;
  e.preventDefault();patDown=true;patSeq=[];patPid=e.pointerId;try{box.setPointerCapture(e.pointerId)}catch(_){}patHit(e);
});
document.addEventListener('pointermove',function(e){if(patDown&&e.pointerId===patPid)patHit(e)});
function patEnd(e){
  if(!patDown||(e&&e.pointerId!==patPid))return;
  patDown=false;var code=patSeq.join('');
  if(patSeq.length<4){patSeq=[];patDraw();msg='اربط ٤ نقاط على الأقل';var m=document.querySelector('.msg');if(m)m.textContent=msg;return}
  patSeq=[];patDone(code);
}
document.addEventListener('pointerup',patEnd);
document.addEventListener('pointercancel',function(e){if(patDown&&e.pointerId===patPid){patDown=false;patSeq=[];patDraw()}});
function vLock(){return '<div class="lock">'+logoSvg()+'<h2>السائر إلى الله</h2><p class="muted">'+(S.lockType==='pattern'?'ارسم النمط لفتح التطبيق':'أدخل الرمز السري')+'</p>'+(S.lockType==='pattern'?patHtml():'<input type="password" inputmode="numeric" id="lk"><button class="btn" data-a="unlock">دخول</button>')+'<p class="msg">'+esc(msg)+'</p>'+COPY+'</div>'}

var hadithLoading=false,hadithNonce=0,hadithLoadedSession=false;

function cleanHadithText(v){
  if(typeof v==='string')return v.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
  if(v&&typeof v==='object')return cleanHadithText(v.arabic||v.ar||v.text||v.content||'');
  return '';
}
function validHadithText(v){var t=cleanHadithText(v);return t.length>=24&&/[ء-ي]/.test(t)&&!/^([.،؛:…\-\s])+$/u.test(t)}
function localHadithForToday(){
  var pool=[
    {text:'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.',bookTitle:'صحيح البخاري',number:'1',grade:'صحيح'},
    {text:'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.',bookTitle:'صحيح البخاري',number:'6018',grade:'صحيح'},
    {text:'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',bookTitle:'صحيح البخاري',number:'13',grade:'صحيح'},
    {text:'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ.',bookTitle:'صحيح البخاري',number:'2989',grade:'صحيح'},
    {text:'مَنْ لَا يَرْحَمُ لَا يُرْحَمُ.',bookTitle:'صحيح البخاري',number:'5997',grade:'صحيح'}
  ];
  var d=new Date(),n=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(d.getFullYear(),0,0))/86400000);
  var h=pool[n%pool.length];return {date:dk(),text:h.text,bookTitle:h.bookTitle,number:h.number,grade:h.grade,link:h.link,source:'مصدر موثق'};
}

function ensureDailyHadith(force){
  return;
  var key='alsaer_hadith_daily_v1',cached=null;
  try{cached=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
  if(!force&&cached&&cached.date===dk()&&validHadithText(cached.text)){paintHadith(cached);return}
  var data=localHadithForToday();
  try{localStorage.setItem(key,JSON.stringify(data))}catch(e){}
  paintHadith(data);
}
function render(){
  applyUI();
  if(splash){tabs.hidden=true;top.innerHTML='';app.innerHTML=vSplash();return}
  if(!unlocked){tabs.hidden=true;top.innerHTML='';app.innerHTML=vLock();return}
  if(!S.onboarded){tabs.hidden=true;top.innerHTML='';app.innerHTML=vOb();return}
  if(covered){tabs.hidden=true;top.innerHTML='';app.innerHTML='<button class="cover" data-a="uncover">اضغط للمتابعة</button>';return}
  tabs.hidden=false;
  var par=tab;while(PARENT[par])par=PARENT[par];
  if(tab==='home'){top.innerHTML='';top.style.display='none';top.style.position=''}
  else{top.style.display='';top.style.position=(tab==='reader'?'static':'');top.innerHTML='<h1>'+ic(TICON[tab])+TITLES[tab]+'</h1>'+(PARENT[tab]?'<button class="ib" data-a="tab" data-v="'+PARENT[tab]+'" aria-label="رجوع">'+ic('chev')+'</button>':'<span></span>')}
  tabs.hidden=(tab==='reader');app.style.paddingBottom=(tab==='reader'?'16px':'');
  tabs.innerHTML=NAV.map(function(t){return '<button class="tab'+(par===t[0]?' on':'')+'" data-a="tab" data-v="'+t[0]+'"><span class="pill">'+ic(t[2])+'</span>'+t[1]+'</button>'}).join('');
  var v={home:vHome,worship:vWorship,calendar:vCal,progress:vProgress,more:vMore,fasting:vFasting,prayers:vPrayers,quran:vQuran,reader:vReader,reminders:vReminders,adhkar:vAdhkar,habits:vHabits,boost:vBoost,ach:vAch,developer:vDeveloper,settings:vSettings}[tab];
  app.innerHTML=v();
  if(tab==='home')ensureDailyHadith(false);
  if(tab!==lastTab){
    if(lastTab!==null&&!backPopHandling){
      if(navTrail[navTrail.length-1]!==tab)navTrail.push(tab);
      if(backHistoryReady)history.pushState({alsaerStep:navTrail.length},'',location.href);
    }
    if(backPopHandling)backPopHandling=false;
    lastTab=tab;app.classList.remove('vin');void app.offsetWidth;app.classList.add('vin')
  }
  if(pressKey){var pe=document.querySelector(pressKey);pressKey=null;if(pe){pe.classList.add('pressed');setTimeout(function(){pe&&pe.classList.remove('pressed')},460);
    if(document.documentElement.getAttribute('data-press')==='ripple'&&pressXY&&pressXY[0]!==undefined){var bb=pe.getBoundingClientRect(),sz=Math.max(bb.width,bb.height)*2,rp=document.createElement('span');rp.className='rip';rp.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+(pressXY[0]-bb.left-sz/2)+'px;top:'+(pressXY[1]-bb.top-sz/2)+'px';pe.classList.add('rp-clip');pe.appendChild(rp);setTimeout(function(){rp.remove()},480)}}}
  if(lang()!=='ar'){trWalk(app);trWalk(top);trWalk(tabs)}
  if(tab==='reader')fitSoon();
}
function stopTimer(){clearInterval(tmr);tmr=null;secs=null;timerDeadline=0}
function startTimerTick(){clearInterval(tmr);if(!timerDeadline)return;secs=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));if(secs<=0){stopTimer();render();toast('انتهى مؤقت الخمس دقائق');return}var el=document.getElementById('timer');if(el)el.textContent=fmt(secs);if(document.visibilityState==='hidden')return;tmr=setInterval(function(){if(document.visibilityState==='hidden'){clearInterval(tmr);tmr=null;return}secs=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));var node=document.getElementById('timer');if(node)node.textContent=fmt(secs);if(secs<=0){stopTimer();render();toast('انتهى مؤقت الخمس دقائق')}},1000)}
var alsaerWasBackgrounded=false;
var bgAt=0;
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='hidden'){
    alsaerWasBackgrounded=true;bgAt=Date.now();
    clearInterval(tmr);tmr=null;
  }else{
    if(timerDeadline)startTimerTick();
    if(alsaerWasBackgrounded){
      alsaerWasBackgrounded=false;
      if(S.pin&&unlocked&&Date.now()-bgAt>30000){unlocked=false;msg='';render();return}
      chooseHadithForOpen();
      if(tab==='home'&&unlocked&&!splash&&!covered)render();
    }
  }
});

document.addEventListener('change',function(e){
  if(e.target&&e.target.name==='ob-gender'){
    obGender=e.target.value;
    document.querySelectorAll('.ob-gender').forEach(function(x){x.classList.toggle('selected',!!x.querySelector('input:checked'))});
  }
});
document.addEventListener('input',function(e){if(e.target.id==='note')draft=e.target.value});
document.addEventListener('change',function(e){
  var id=e.target.dataset&&e.target.dataset.pt;
  if(id&&PR.some(function(p){return p[0]===id})){var v=e.target.value;if(/^\d{2}:\d{2}$/.test(v)||v===''){if(v)S.ptimes[id]=v;else delete S.ptimes[id];save()}}
});
document.addEventListener('change',function(e){
  if(e.target&&e.target.id==='suhoor-time'){S.fasting.reminders.suhoorTime=e.target.value;save()}
  if(e.target&&e.target.id==='iftar-time'){S.fasting.reminders.iftarTime=e.target.value;save()}
});
document.addEventListener('change',function(e){
  var input=e.target, id=input&&input.id;
  if(id!=='profile-photo'&&id!=='ob-photo')return;
  var file=input.files&&input.files[0];if(!file)return;
  if(file.type&&!/^image\//.test(file.type)){toast('اختر ملف صورة صالحاً');input.value='';return}
  if(file.size>20*1024*1024){toast('حجم الصورة كبير؛ اختر صورة أقل من 20 ميجابايت');input.value='';return}
  var reader=new FileReader();
  reader.onerror=function(){toast('تعذر قراءة الصورة؛ حاول اختيارها مرة أخرى');input.value=''};
  reader.onload=function(){
    var img=new Image();
    img.onerror=function(){toast('تعذر فتح الصورة؛ جرّب صورة بصيغة JPG أو PNG');input.value=''};
    img.onload=function(){
      try{
        /* صورة الملف الشخصي تظهر بحجم صغير؛ نخزن نسخة خفيفة جداً لتفادي امتلاء localStorage */
        var maxSide=144, scale=Math.min(1,maxSide/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
        var w=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));
        var h=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
        var canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
        if(!ctx){toast('تعذر تجهيز الصورة على هذا الجهاز');input.value='';return}
        var data='';
        for(var attempt=0;attempt<5;attempt++){
          canvas.width=w;canvas.height=h;
          ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
          ctx.drawImage(img,0,0,w,h);
          data=canvas.toDataURL('image/jpeg',attempt<2?.52:.42);
          if(data.length<=70000)break;
          w=Math.max(48,Math.round(w*.78));h=Math.max(48,Math.round(h*.78));
        }
        if(!data||data.length>100000){toast('تعذر تصغير الصورة؛ اختر صورة أخرى');input.value='';return}
        S.profile=S.profile||{name:'',age:'',photo:''};
        S.profile.photo=data;
        save();
        var raw=localStorage.getItem(KEY),verify=null;
        try{verify=raw?JSON.parse(raw):null}catch(ignore){}
        if(!verify||!verify.profile||verify.profile.photo!==data){
          toast('لم تُحفظ الصورة بسبب امتلاء مساحة التخزين. احذف بعض البيانات أو جرّب صورة أخرى.');
          input.value='';return;
        }
        /* حدّث كل أماكن الصورة فوراً مع الاحتفاظ بموضع الصفحة */
        var y=window.scrollY||document.documentElement.scrollTop||0;
        render();
        requestAnimationFrame(function(){window.scrollTo(0,y)});
        toast('تم حفظ الصورة الشخصية وتطبيقها');
      }catch(err){toast('حدث خطأ أثناء حفظ الصورة؛ حاول مرة أخرى')}
      input.value='';
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(file);
});

document.addEventListener('input',function(e){
  if(!e.target)return;
  if(e.target.id==='profile-name'||e.target.id==='profile-age'){
    var nm=document.getElementById('profile-preview-name'),ag=document.getElementById('profile-preview-age');
    if(nm)nm.textContent=e.target.id==='profile-name'?(e.target.value.trim()||'ملفك الشخصي'):(document.getElementById('profile-name')?.value.trim()||'ملفك الشخصي');
    if(ag)ag.textContent=(document.getElementById('profile-age')?.value?('العمر · '+document.getElementById('profile-age').value+' سنة'):'بياناتك الخاصة تظهر هنا بشكل أنيق');
  }
});
document.addEventListener('click',async function(e){
  var b=e.target.closest('[data-a]');if(!b)return;
  if(b.classList.contains('tab')||b.classList.contains('btn')||b.classList.contains('tile')||b.classList.contains('ib')||b.classList.contains('lrow')||b.classList.contains('cli')||b.classList.contains('uo'))pressXY=[e.clientX,e.clientY],pressKey='[data-a="'+b.dataset.a+'"]'+(b.dataset.v!==undefined?'[data-v="'+b.dataset.v+'"]':'')+(b.classList.contains('tab')?'.tab':'');
  var a=b.dataset.a,v=b.dataset.v,d=b.dataset;
  if(a==='tab'){tab=v;confirmRelapse=false;confirmReset=false;addingHabit=false;addingWorship=false;setOpen=null;msg='';window.scrollTo(0,0)}
  else if(a==='umode'){setUI('mode',v)}
  else if(a==='ustyle'){setUI('style',v)}
  else if(a==='uacc'){setUI('accent',v)}
  else if(a==='ulook'){setUI('look',v)}
  else if(a==='ulang'){setUI('lang',v);lastTab=null}
  else if(a==='ufont'){setUI('font',v)}
  else if(a==='ufw'){setUI('fontW',v)}
  else if(a==='upress'){setUI('press',v);pressKey='[data-a="upress"][data-v="'+v+'"]'}
  else if(a==='utrans'){setUI('trans',v);lastTab=null}
  else if(a==='gender'){S.gender=v==='female'?'female':'male';save();toast('تم تحديث طريقة المخاطبة')}
  else if(a==='savereview'){var rv=document.getElementById('review-note');S.reviews=S.reviews||[];S.reviews.push({date:dk(),note:rv?rv.value.slice(0,2000):''});save();toast('تم حفظ مراجعتك على هذا الجهاز')}
  else if(a==='fine'){toast('ثبّتك الله، واصل')}
  else if(a==='sopen'){setOpen=(setOpen===v)?null:v;msg=''}
  else if(a==='goboost'){tab='boost';window.scrollTo(0,0)}
  else if(a==='success'||a==='relapse'){
    if(a==='relapse'&&!confirmRelapse){confirmRelapse=true;render();return}
    var n=document.getElementById('note');var kd=dk(),tr=draftTrig!==null?draftTrig:((S.days[kd]&&S.days[kd].trig)||[]);S.days[kd]={status:a,note:n?n.value:'',trig:tr};draft=null;draftTrig=null;confirmRelapse=false;save();checkNew()}
  else if(a==='trg'){var k3=dk(),cur=(draftTrig!==null?draftTrig:((S.days[k3]&&S.days[k3].trig)||[])).slice(),ix=cur.indexOf(v);if(ix<0)cur.push(v);else cur.splice(ix,1);draftTrig=cur;var n3=document.getElementById('note');if(n3)draft=n3.value;if(S.days[k3]){S.days[k3].trig=cur;save();checkNew()}}
  else if(a==='worship'){worshipToggle(v,d.state==='yes')}
  else if(a==='addworship'){addingWorship=true}
  else if(a==='cancelworship'){addingWorship=false}
  else if(a==='saveworship'){var wi=document.getElementById('new-worship-name'),wt=wi?wi.value.trim().slice(0,60):'';if(wt&&(S.customWorship||[]).length<30){S.customWorship=S.customWorship||[];S.customWorship.push({id:'cw'+Date.now().toString(36),t:wt});save();addingWorship=false;toast('تمت إضافة العبادة الخاصة بك')}else if(!wt)toast('اكتب اسم العبادة أولاً')}
  else if(a==='delworship'){S.customWorship=(S.customWorship||[]).filter(function(x){return x.id!==v});Object.keys(S.worship||{}).forEach(function(k){if(S.worship[k])delete S.worship[k][v]});save();toast('تم حذف العبادة')}
  else if(a==='hab'){S.habits=S.habits||{};var hk=dk();S.habits[hk]=S.habits[hk]||{};S.habits[hk][v]=!S.habits[hk][v];save();checkNew()}
  else if(a==='pray'){var pk=dk();S.prayers[pk]=S.prayers[pk]||{};if(PR.some(function(p){return p[0]===v}))S.prayers[pk][v]=!S.prayers[pk][v];save();checkNew()}
  else if(a==='qstart'){var st0=S.quran.pos;rd={from:st0,to:Math.min(604,st0+S.quran.goal-1),page:st0};tab='reader';window.scrollTo(0,0)}
  else if(a==='qopen'){var st1=Math.max(1,Math.min(604,parseInt(v,10)||1));rd={from:st1,to:Math.min(604,st1+S.quran.goal-1),page:st1};tab='reader';window.scrollTo(0,0)}
  else if(a==='qpage'){if(rd){rd.page=Math.max(1,Math.min(604,rd.page+(v==='1'?1:-1)))}}
  else if(a==='qriw'){S.quran.riwaya=(v==='warsh'&&window.WDATA)?'warsh':'hafs';save();window.scrollTo(0,0)}
  else if(a==='qtj'){S.quran.tj=S.quran.tj===false;save()}
  else if(a==='qfs'){S.quran.fs=Math.max(18,Math.min(44,S.quran.fs+(v==='2'?2:-2)));save()}
  else if(a==='showidx'){showIdx=!showIdx}
  else if(a==='qdone'){if(rd){var nn=Math.max(1,rd.page-rd.from+1),kq=dk(),before=qPages(kq);S.quran.log[kq]=before+nn;var wrap=rd.page>=604;S.quran.pos=wrap?1:rd.page+1;rd=null;tab='quran';save();window.scrollTo(0,0);toast(wrap?'ما شاء الله، أتممت ختمة المصحف':(S.quran.log[kq]>=S.quran.goal?'تقبّل الله منك، أتممت وردك اليوم':'تم تسجيل '+ar(nn)+' صفحة'));checkNew()}}
  else if(a==='qadd'){var qk=dk();S.quran.log[qk]=Math.min(604,(S.quran.log[qk]||0)+1);save()}
  else if(a==='qsub'){var qk2=dk();S.quran.log[qk2]=Math.max(0,(S.quran.log[qk2]||0)-1);if(!S.quran.log[qk2])delete S.quran.log[qk2];save()}
  else if(a==='qgoal'){S.quran.goal=Math.max(1,Math.min(30,S.quran.goal+(v==='1'?1:-1)));save()}
  else if(a==='addh'){addingHabit=!addingHabit}
  else if(a==='saveh'){var nh=document.getElementById('nh'),tx=nh?nh.value.trim().slice(0,60):'';if(tx&&S.myHabits.length<30){S.myHabits.push({id:'c'+Date.now().toString(36)+S.myHabits.length,t:tx});save();addingHabit=false;toast('أُضيفت العادة')}}
  else if(a==='delh'){S.myHabits=S.myHabits.filter(function(h){return h.id!==v});save()}
  else if(a==='addextra'){addingHabit=true;addingHabitType='good'}
  else if(a==='newhtype'){addingHabitType=v==='bad'?'bad':'good'}
  else if(a==='cancelextra'){addingHabit=false}
  else if(a==='saveextra'){var xh=document.getElementById('new-habit-name'),xt=xh?xh.value.trim().slice(0,60):'';if(xt&&S.extraHabits.length<40){S.extraHabits.push({id:'x'+Date.now().toString(36),t:xt,type:addingHabitType});save();addingHabit=false;toast(addingHabitType==='good'?'أُضيفت العادة الحسنة':'أُضيفت العادة التي تريد تركها')}}
  else if(a==='delxh'){S.extraHabits=S.extraHabits.filter(function(h){return h.id!==v});save()}
  else if(a==='badinc'){S.habitCounts=S.habitCounts||{};var bc=dk();S.habitCounts[bc]=S.habitCounts[bc]||{};S.habitCounts[bc][v]=Math.min(999,(S.habitCounts[bc][v]||0)+1);save()}
  else if(a==='baddec'){S.habitCounts=S.habitCounts||{};var bd=dk();S.habitCounts[bd]=S.habitCounts[bd]||{};S.habitCounts[bd][v]=Math.max(0,(S.habitCounts[bd][v]||0)-1);save()}
  else if(a==='fastpref'){S.fasting.prefs[v]=!S.fasting.prefs[v];save()}
  else if(a==='fastremind'){S.fasting.reminders[v]=!S.fasting.reminders[v];save()}
  else if(a==='fastrecord'){S.fasting.records[dk()]=v==='done'?'done':'missed';save();toast(v==='done'?'تم تسجيل صيام اليوم':'تم تسجيل عدم الصيام')}
  else if(a==='fastcustom'){var fc=document.getElementById('fast-custom-date'),fd=fc&&fc.value;if(fd&&S.fasting.customDates.indexOf(fd)<0){S.fasting.customDates.push(fd);save();toast('تمت إضافة يوم الصيام')}}
  else if(a==='fasttimes'){var su=document.getElementById('suhoor-time'),it=document.getElementById('iftar-time');if(su&&/^\\d{2}:\\d{2}$/.test(su.value))S.fasting.reminders.suhoorTime=su.value;if(it&&/^\\d{2}:\\d{2}$/.test(it.value))S.fasting.reminders.iftarTime=it.value;save();toast('تم حفظ أوقات التذكير')}
  else if(a==='fastdismiss'){toast('يمكنك العودة إلى جدول الصيام من المزيد')}
  else if(a==='per'){per=v==='month'?'month':'week'}
  else if(a==='showlog'){showLog=!showLog}
  else if(a==='showprivacy'){showPrivacy=!showPrivacy}
  else if(a==='urge'){S.urges=S.urges||[];S.urges.push(Date.now());save();checkNew();toast('أحسنت، سُجّلت رغبة تجاوزتها')}
  else if(a==='cover'){covered=true}
  else if(a==='uncover'){covered=false;if(S.pin){unlocked=false}}
  else if(a==='gsel'){obGender=v==='female'?'female':'male'}
  else if(a==='ob'){var og=document.querySelector('input[name="ob-gender"]:checked');S.gender=og?og.value:obGender;var on=document.getElementById('ob-name'),oa=document.getElementById('ob-age');S.profile=S.profile||{name:'',age:'',photo:''};S.profile.name=(on?on.value.trim():'').slice(0,40);var age=oa?parseInt(oa.value,10):0;S.profile.age=age>=1&&age<=120?String(age):'';var rr=document.getElementById('ob-reason').value.trim();if(rr)S.reasons.push(rr.slice(0,200));S.onboarded=true;save();checkNew()}
  else if(a==='editprofilephoto'){var pf=document.getElementById('profile-photo');if(pf)pf.click()}
  else if(a==='viewprofilephoto'){if(S.profile&&S.profile.photo){var ov=document.createElement('div');ov.className='profile-photo-viewer';ov.setAttribute('data-a','closeprofilephoto');ov.innerHTML='<div class="profile-photo-viewer-inner"><button type="button" class="profile-photo-viewer-close" aria-label="إغلاق">×</button><img src="'+S.profile.photo+'" alt="الصورة الشخصية بالحجم الكامل"></div>';document.body.appendChild(ov)}else toast('لم تُضف صورة شخصية بعد')}
  else if(a==='closeprofilephoto'){var ov2=document.querySelector('.profile-photo-viewer');if(ov2)ov2.remove()}
  else if(a==='saveprofile'){var pn=document.getElementById('profile-name'),pa=document.getElementById('profile-age'),age2=pa?parseInt(pa.value,10):0;S.profile=S.profile||{name:'',age:'',photo:''};S.profile.name=(pn?pn.value.trim():'').slice(0,40);S.profile.age=age2>=1&&age2<=120?String(age2):'';save();toast('تم حفظ الملف الشخصي')}
  else if(a==='prev'){calD=new Date(calD.getFullYear(),calD.getMonth()-1,1)}
  else if(a==='next'){calD=new Date(calD.getFullYear(),calD.getMonth()+1,1)}
  else if(a==='sel'){calSel=d.k}
  else if(a==='setday'){if(v)S.days[calSel]={status:v,note:(S.days[calSel]&&S.days[calSel].note)||''};else delete S.days[calSel];save();checkNew()}
  else if(a==='grp'){group=v}
  else if(a==='tap'){var k=dk();S.counters[k]=S.counters[k]||{};S.counters[k][d.id]=Math.min(+d.n,(S.counters[k][d.id]||0)+1);save();checkNew()}
  else if(a==='rst'){var k2=dk();S.counters[k2]=S.counters[k2]||{};S.counters[k2][d.id]=0;save()}
  else if(a==='nextq'){qi++}
  else if(a==='tstart'){timerDeadline=Date.now()+300000;secs=300;startTimerTick()}
  else if(a==='tstop'){stopTimer()}
  else if(a==='addr'){var r=document.getElementById('reason');if(r&&r.value.trim()){S.reasons.push(r.value.trim().slice(0,200));save();checkNew()}}
  else if(a==='delr'){S.reasons.splice(+d.i,1);save()}
  else if(a==='setpin'){var p=document.getElementById('pin').value;if(!/^\d{4,12}$/.test(p)){msg='استخدم رمزاً رقمياً من ٤ إلى ١٢ رقماً'}else{try{S.pin=await makePinRecord(p);delete S.lockType;patFirst='';save();msg='تم حفظ الرمز بصورة مشتقة تشفيرياً'}catch(err){msg='تعذر إنشاء حماية آمنة على هذا الجهاز؛ لم يتم حفظ الرمز'}}}
  else if(a==='nopin'){S.pin=null;delete S.lockType;patFirst='';save();msg='أُلغي القفل'}
  else if(a==='unlock'){await tryUnlock(document.getElementById('lk').value)}
  else if(a==='bkcopy'){var txt=JSON.stringify(S),ta=document.getElementById('bk');ta.value=txt;
    (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){msg='تم النسخ'}).catch(function(){ta.select();msg='حدّد النص وانسخه يدوياً'}).then(function(){var m=document.querySelector('.msg');if(m)m.textContent=msg});return}
  else if(a==='bkrestore'){try{var o=JSON.parse(document.getElementById('bk').value);if(!validBackup(o))throw 0;var restored=fixShape(Object.assign(def(),o));if(restored.pin!==null&&typeof restored.pin!=='string'&&(!restored.pin||restored.pin.type!=='pbkdf2-sha256'||typeof restored.pin.salt!=='string'||typeof restored.pin.hash!=='string'))throw 0;restored.onboarded=true;S=restored;save();unlocked=!S.pin;msg='تم الاسترجاع بعد التحقق من البيانات'}catch(x){msg='النسخة غير صالحة أو ناقصة؛ لم تتغير بياناتك'}}
  else if(a==='reset'){if(!confirmReset){confirmReset=true}else{S=def();save();confirmReset=false;draft=null;obStep=1;msg='تم المسح'}}
  render();
});
if(!S.onboarded&&Object.keys(S.days).length)S.onboarded=true;
window.addEventListener('popstate',function(){
  var viewer=document.querySelector('.profile-photo-viewer');
  if(viewer){viewer.remove();history.pushState({alsaerStep:navTrail.length},'',location.href);return}
  if(navTrail.length>1){
    navTrail.pop();
    tab=navTrail[navTrail.length-1]||'home';
    confirmRelapse=false;confirmReset=false;addingHabit=false;addingWorship=false;setOpen=null;msg='';
    backPopHandling=true;
    render();
  }else{
    /* لا نغلق التطبيق عند الرجوع من الشاشة الرئيسية */
    history.pushState({alsaerStep:1},'',location.href);
  }
});
function handleNativeBack(){
  var viewer=document.querySelector('.profile-photo-viewer');
  if(viewer){viewer.remove();return}
  if(navTrail.length>1){
    navTrail.pop();
    tab=navTrail[navTrail.length-1]||'home';
    confirmRelapse=false;confirmReset=false;addingHabit=false;addingWorship=false;setOpen=null;msg='';
    backPopHandling=true;
    render();
  }
  /* At the home screen, intentionally stay in the app. */
}
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
history.pushState({alsaerStep:1},'',location.href);
backHistoryReady=true;
render();
setTimeout(function(){splash=false;render();checkNew()},window.__NOSPLASH?0:1900);
(function(){var x0=null,y0=null;
  document.addEventListener('touchstart',function(e){var m=e.target.closest&&e.target.closest('#mp');if(m&&e.touches.length===1){x0=e.touches[0].clientX;y0=e.touches[0].clientY}else x0=null},{passive:true});
  document.addEventListener('touchend',function(e){if(x0===null)return;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6){var b=document.querySelector('.rbar [data-a=qpage][data-v="'+(dx>0?'1':'-1')+'"]');if(b&&!b.disabled)b.click()}},{passive:true});
  window.addEventListener('resize',fitSoon);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitSoon);if(document.fonts)document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',fitSoon);
})();
})();
