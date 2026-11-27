// عقد أوامر بطاقة الوسائط: stop يوقف كل المصادر دائمًا، pause/play على العنصر الحالي فقط (جسر وهمي، لا جهاز حقيقي)
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(__dirname+'/../src/services/media-card.js','utf8');
function mk(){const log=[];const w={AlsaerNative:{mediaUpdate(){},mediaStop(){},diagLog(t){log.push(t)}},setTimeout:()=>0,
 document:{addEventListener(){},visibilityState:'visible'}};
 function Aud(){this.paused=false;this.ended=false;this.ls={};this.addEventListener=(e,f)=>{};this.pause=()=>{this.paused=true};this.play=()=>{this.paused=false;return Promise.resolve()}}
 w.Audio=Aud;
 const c=Object.assign(w,{window:w,stops:[],RDO:[[1,'x']],rdoS:{a:null,id:1},mqAu:{a:null,k:'1:1',pa:false},
  rdoStop(){c.stops.push('radio')},rctStop(){c.stops.push('rct')},ftAuStop(){c.stops.push('fatwa')},mqAuStop(){c.stops.push('mq')},hsnAuStop(){c.stops.push('hisn')},mqAuBar(){}});
 vm.createContext(c);vm.runInContext(src+';this.__MC=MC;',c);return {c,log};}
let bad=0;const ok=(n,x)=>{if(!x){bad++;console.log('FAIL',n)}};
// radio: stop
let {c}=mk();let a=new c.Audio();c.rdoS.a=a;c.alsaerMediaCmd('stop');ok('stop radio calls all',c.stops.join()==='radio,rct,fatwa,mq,hisn');
// mushaf: stop must stop (was intercepted before)
({c}=mk());a=new c.Audio();c.mqAu.a=a;c.alsaerMediaCmd('stop');ok('stop mushaf calls all',c.stops.length===5);
// pause/play on radio
({c}=mk());a=new c.Audio();c.rdoS.a=a;c.__MC.list.push(a);c.alsaerMediaCmd('pause');ok('pause radio',a.paused===true);c.alsaerMediaCmd('play');ok('play radio',a.paused===false);
// pause/play on mushaf keeps pa flag
({c}=mk());a=new c.Audio();c.mqAu.a=a;c.__MC.list.push(a);c.alsaerMediaCmd('pause');ok('mq pause',a.paused&&c.mqAu.pa===true);c.alsaerMediaCmd('play');ok('mq play',!a.paused&&c.mqAu.pa===false);
// stale untitled element ignored
({c}=mk());const dead=new c.Audio();c.__MC.list.push(dead);a=new c.Audio();c.rdoS.a=a;c.__MC.list.unshift(a);c.alsaerMediaCmd('pause');ok('filter stale',a.paused&&!dead.paused);
if(bad)process.exit(1);console.log('media card commands ok');
