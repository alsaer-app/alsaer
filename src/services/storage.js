function dk(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parse(k){var p=k.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])}
function def(){return{startDate:dk(),days:{},reasons:[],pin:null,security:{method:'pin'},counters:{},seen:[],gender:null,profile:{name:'',age:'',photo:''},prayers:{},ptimes:{},quran:{goal:2,log:{},pos:1,fs:26},ui:{},worship:{},customWorship:[],myHabits:[],extraHabits:[],habitCounts:{},fasting:{prefs:{monThu:true,whiteDays:true,ashura:false,arafa:false,shawwal:false,dawud:false},records:{},customDates:[],reminders:{enabled:true,beforeDay:true,suhoor:true,suhoorTime:'03:30',iftar:false,iftarTime:'17:00'},dawudAnchor:dk()},updatedAt:Date.now()}}
function fixShape(o){
  var isO=function(v){return !!v&&typeof v==='object'&&!Array.isArray(v)};
  if(!isO(o.prayers))o.prayers={};if(!isO(o.ptimes))o.ptimes={};
  if(!isO(o.quran))o.quran={goal:2,log:{},pos:1,fs:26};if(!isO(o.quran.log))o.quran.log={};
  var g=parseInt(o.quran.goal,10);o.quran.goal=(g>=1&&g<=30)?g:2;var ps=parseInt(o.quran.pos,10);o.quran.pos=(ps>=1&&ps<=604)?ps:1;var fz=parseInt(o.quran.fs,10);o.quran.fs=(fz>=18&&fz<=44)?fz:26;
  if(!isO(o.profile))o.profile={name:'',age:'',photo:''};o.profile.name=String(o.profile.name||'').slice(0,40);var rawAge=String(o.profile.age||'').trim(),ageN=/^\d{1,3}$/.test(rawAge)?Number(rawAge):0;o.profile.age=ageN>=1&&ageN<=120?String(ageN):'';o.profile.photo=typeof o.profile.photo==='string'&&o.profile.photo.indexOf('data:image/')===0&&o.profile.photo.length<100000?o.profile.photo:'';
  if(!isO(o.ui))o.ui={};
  if(o.lockType!=='pattern'||!o.pin)delete o.lockType;
  if(!o.security||typeof o.security!=='object')o.security={method:'pin'};if(!['pin','password'].includes(o.security.method))o.security.method='pin';
  if(o.quran.riwaya!=='warsh')o.quran.riwaya='hafs';
  if(!isO(o.worship))o.worship={};
  if(!Array.isArray(o.customWorship))o.customWorship=[];o.customWorship=o.customWorship.filter(function(x){return x&&typeof x.id==='string'&&typeof x.t==='string'}).slice(0,30).map(function(x){return{id:x.id.slice(0,28),t:x.t.slice(0,60)}});
  Object.keys(o.worship).slice(0,5000).forEach(function(k){if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!isO(o.worship[k]))delete o.worship[k];else{Object.keys(o.worship[k]).forEach(function(id){if(typeof o.worship[k][id]!=='boolean')delete o.worship[k][id]})}});
  if(!Array.isArray(o.myHabits))o.myHabits=[];
  o.myHabits=o.myHabits.filter(function(h){return h&&typeof h.id==='string'&&typeof h.t==='string'}).slice(0,30).map(function(h){return{id:h.id.slice(0,24),t:h.t.slice(0,60)}});
  if(!Array.isArray(o.extraHabits))o.extraHabits=[];
  o.extraHabits=o.extraHabits.filter(function(h){return h&&typeof h.id==='string'&&typeof h.t==='string'&&(h.type==='good'||h.type==='bad')}).slice(0,40).map(function(h){return{id:h.id.slice(0,28),t:h.t.slice(0,60),type:h.type}});
  if(!o.habitCounts||typeof o.habitCounts!=='object'||Array.isArray(o.habitCounts))o.habitCounts={};
  if(!isO(o.evlog))o.evlog={};
  Object.keys(o.evlog).forEach(function(k){var L=o.evlog[k];if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!isO(L)){delete o.evlog[k];return}Object.keys(L).forEach(function(id){var a=L[id];if(!Array.isArray(a)){delete L[id];return}L[id]=a.slice(0,300).filter(function(e){return Array.isArray(e)&&typeof e[0]==='number'&&(e[1]===0||e[1]===1)}).map(function(e){return[e[0],e[1]]})})});
  if(!isO(o.locks))o.locks={};Object.keys(o.locks).slice(0,3000).forEach(function(k){var t=+o.locks[k];if(!(t>0)||Date.now()-t>864e5*2)delete o.locks[k];else o.locks[k]=t});
  if(!isO(o.goals))o.goals={};Object.keys(o.goals).forEach(function(id){var n=parseInt(o.goals[id],10);if(!(n>=1&&n<=999))delete o.goals[id];else o.goals[id]=n});
  o.target=typeof o.target==='string'&&o.target?o.target.slice(0,40):'main';o.mainName=typeof o.mainName==='string'?o.mainName.slice(0,40):'';
  if(!isO(o.fasting))o.fasting=def().fasting;
  var fd=def().fasting;o.fasting.prefs=Object.assign({},fd.prefs,isO(o.fasting.prefs)?o.fasting.prefs:{});
  o.fasting.records=isO(o.fasting.records)?o.fasting.records:{};
  o.fasting.customDates=Array.isArray(o.fasting.customDates)?o.fasting.customDates.filter(function(x){return /^\d{4}-\d{2}-\d{2}$/.test(x)}).slice(0,100):[];
  o.fasting.reminders=Object.assign({},fd.reminders,isO(o.fasting.reminders)?o.fasting.reminders:{});
  if(!/^\d{4}-\d{2}-\d{2}$/.test(o.fasting.dawudAnchor||''))o.fasting.dawudAnchor=dk();
  /* أوقات التعليم (سجل النشاط): مفاتيح الأيام فقط، وقيم طوابع زمنية رقمية؛ تُحفظ آخر 400 يوم */
  if(!isO(o.mtimes))o.mtimes={};
  var mtk=Object.keys(o.mtimes);if(mtk.length>400){mtk.sort();mtk.slice(0,mtk.length-400).forEach(function(k){delete o.mtimes[k]})}
  Object.keys(o.mtimes).forEach(function(k){var L=o.mtimes[k];if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!isO(L)){delete o.mtimes[k];return}Object.keys(L).forEach(function(id){var t=+L[id];if((!/^([pqfh]:|q$|fast$)/.test(id))||!(t>0)){delete L[id];return}L[id]=t});if(!Object.keys(L).length)delete o.mtimes[k]});
  return o;
}
/* يسجّل وقت تعليم عنصر لسجل النشاط (مفتاح إضافي لا يغيّر أي مفتاح قائم، ويتدفق مع النسخة الاحتياطية كما هي) */
function mtSet(id,k){try{S.mtimes=S.mtimes||{};k=k||dk();var L=S.mtimes[k]=S.mtimes[k]||{};L[id]=Date.now()}catch(e){}}
function mtDel(id){try{var k=dk(),L=S.mtimes&&S.mtimes[k];if(L){delete L[id];if(!Object.keys(L).length)delete S.mtimes[k]}}catch(e){}}
function mtOf(k,id){try{return (S.mtimes&&S.mtimes[k]&&S.mtimes[k][id])||0}catch(e){return 0}}
function load(){
  var local=null,mirror=null,raw=null,mraw=null,corrupt=false;
  try{raw=localStorage.getItem(KEY);if(raw){var lo=JSON.parse(raw);if(lo&&typeof lo==='object'&&!Array.isArray(lo))local=fixShape(Object.assign(def(),lo));else corrupt=true}}catch(e){corrupt=true}
  try{if(window.AlsaerNative&&AlsaerNative.mirrorGet){mraw=AlsaerNative.mirrorGet(KEY);if(mraw){var mo=JSON.parse(mraw);if(mo&&typeof mo==='object'&&!Array.isArray(mo))mirror=fixShape(Object.assign(def(),mo));else corrupt=true}}}catch(e){corrupt=true}
  if(mirror&&(!local||Number(mirror.updatedAt)>Number(local.updatedAt))){try{localStorage.setItem(KEY,mraw)}catch(e){}return mirror}
  var ok=local||mirror||mem;if(ok)return ok;
  /* بند 65: توجد بيانات لكنها غير مقروءة في المخزنين — نحجرها ولا نكتب فوقها بصمت، ونعلم المستخدم بمسار الاستعادة */
  if(corrupt){
    try{if(raw)localStorage.setItem(KEY+'_corrupt',raw)}catch(e){}
    try{if(mraw&&window.AlsaerNative&&AlsaerNative.mirrorSet)AlsaerNative.mirrorSet(KEY+'_corrupt',mraw)}catch(e){}
    window.__alsaerCorrupt=true;
    setTimeout(function(){try{toast('تعذّر قراءة بياناتك المحفوظة؛ حُفظت كنسخة تالفة ولم نكتب فوقها. يمكنك الاستعادة من «الأمان والبيانات».')}catch(e){}},2500);
  }
  return def();
}
var saveTm=0,saveOff=false;
function saveNow(){if(saveTm){clearTimeout(saveTm);saveTm=0}if(saveOff)return;S.updatedAt=Date.now();mem=S;var js;try{js=JSON.stringify(S)}catch(e){toast('تعذّر تجهيز بيانات الحفظ');return}var localOK=false,mirrorOK=false;try{localStorage.setItem(KEY,js);localOK=true}catch(e){}try{if(window.AlsaerNative&&AlsaerNative.mirrorSet){AlsaerNative.mirrorSet(KEY,js);mirrorOK=true}}catch(e){}if(!localOK)toast(mirrorOK?'تعذّر الحفظ في تخزين الواجهة؛ حُفظت نسخة الهاتف':'لم نتمكن من الحفظ، فقد تكون مساحة التخزين ممتلئة')}
function save(){if(saveOff)return;S.updatedAt=Date.now();mem=S;if(!saveTm)saveTm=setTimeout(saveNow,160)}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&saveTm)saveNow()});
window.addEventListener('pagehide',function(){if(saveTm)saveNow()});
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
  if(o.evlog!==undefined&&!obj(o.evlog))return false;
  if(o.mtimes!==undefined&&!obj(o.mtimes))return false;
  if(o.worship!==undefined&&!obj(o.worship))return false;
  if(o.fasting!==undefined){if(!obj(o.fasting))return false;for(var fk of ['prefs','records','reminders'])if(o.fasting[fk]!==undefined&&!obj(o.fasting[fk]))return false;}
  if(o.startDate&&!/^\d{4}-\d{2}-\d{2}$/.test(o.startDate))return false;
  if(Object.keys(o.days).length>5000||Object.keys(o.counters).length>5000||(o.reasons||[]).length>500||(o.urges||[]).length>50000)return false;
  for(var k of Object.keys(o.days)){var d=o.days[k];if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!obj(d)||!(d.status===undefined||['success','relapse'].includes(d.status))||typeof (d.note||'')!=='string'||(d.note||'').length>4000||!Array.isArray(d.trig||[]))return false;}
  for(var k2 of Object.keys(o.counters)){if(!/^\d{4}-\d{2}-\d{2}$/.test(k2)||!obj(o.counters[k2]))return false;for(var id of Object.keys(o.counters[k2])){var n=o.counters[k2][id];if(!Number.isInteger(n)||n<0||n>100000)return false;}}
  if((o.reasons||[]).some(function(x){return typeof x!=='string'||x.length>1000;}))return false;
  if(Object.keys(o.habits||{}).length>5000)return false;
  return true;
}
/* نسخة احتياطية مشفّرة: PBKDF2-SHA256 (200 ألف) + AES-GCM */
function b64e(u){var s='';for(var i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
function b64d(t){var s=atob(t),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}
async function bkKey(pw,salt){var enc=new TextEncoder(),base=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:200000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function bkEncrypt(txt,pw){var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),k=await bkKey(pw,salt),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(txt))),o=new Uint8Array(28+ct.length);o.set(salt,0);o.set(iv,16);o.set(ct,28);return 'ALSAER-ENC1:'+b64e(o)}
async function bkDecrypt(t,pw){var u=b64d(t.slice(12).replace(/\s+/g,'')),k=await bkKey(pw,u.subarray(0,16));return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:u.subarray(16,28)},k,u.subarray(28)))}
