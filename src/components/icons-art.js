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

function avMale(){return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 62c1-14 10-20 22-20s21 6 22 20z" fill="#c79a49"/><circle cx="32" cy="26" r="12" fill="#f1dcae"/><path d="M19 24c0-10 6-15 14-15 8 0 13 5 12 14-3-5-8-7-13-7s-10 2-13 8z" fill="#17352e"/></svg>'}
function avFemale(){return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6C20 6 14 15 14 28c0 6 2 10 4 13-8 3-12 9-13 21h54c-1-12-5-18-13-21 2-3 4-7 4-13C50 15 44 6 32 6z" fill="#c79a49"/><ellipse cx="32" cy="28" rx="10" ry="12" fill="#f1dcae"/></svg>'}
function forestDeco(){
  var tr='',xs=[22,64,104,146];
  xs.forEach(function(x,i){var h=62+((i*17)%28),b=118;tr+='<path d="M'+x+' '+(b-h)+'l14 22h-8l12 20h-9l12 20H'+(x-21)+'l12-20h-9l12-20h-8z" opacity="'+(.9-i*.08)+'"/>'});
  return '<svg class="deco" viewBox="0 0 190 120" aria-hidden="true"><g fill="#062e2c">'+tr+'</g><g fill="#f4ecd0"><circle cx="28" cy="16" r="1.2"/><circle cx="70" cy="30" r="1"/><circle cx="118" cy="12" r="1.3"/><circle cx="160" cy="34" r="1"/><circle cx="96" cy="48" r=".9"/></g></svg>'
}


/* ---------- data ---------- */
