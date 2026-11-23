/* Existing foreground fallback: guard, due time and persisted daily dedup. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/services/reminders-ui.js'),'utf8').split('/* === ALSAER NATIVE NOTIFICATIONS BRIDGE')[0];
function run(nativeEnabled,focused=true,consent=true,malik=false){
 let store={alsaer_snd_v8:'1',alsaer_daily_reminders_v1:JSON.stringify({enabled:true,consent,malik,malikTime:'12:00',kahf:false,dua:false,salat:true,salatTime:'12:00',last:{}})},ticks=[],sent=[];
 class Clock extends Date {constructor(){super('2026-11-24T12:00:00')} }
 function Notification(title,opts){sent.push({title,opts})}Notification.permission='granted';
 const native=nativeEnabled===null?null:{notificationsEnabled:()=>nativeEnabled};
 const ctx={window:{Notification,AlsaerNative:native},AlsaerNative:native,Notification,Date:Clock,Audio:function(){},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},document:{addEventListener(){},hasFocus:()=>focused},setInterval:f=>ticks.push(f),console};
 vm.runInNewContext(source,ctx);ticks[0]();ticks[0]();return {sent,store,tick:ticks[0]};
}
assert.equal(run(null,true,true,true).sent.length,2,'nightly Malik also delivers on Tuesday, not only Sunday');
assert.equal(run(true).sent.length,0,'native owns delivery');
assert.equal(run(null,false).sent.length,0,'unfocused stays quiet');
assert.equal(run(null,true,false).sent.length,0,'no consent stays quiet');
for(const mode of [null,false]){let x=run(mode);assert.equal(x.sent.length,1);assert.equal(JSON.parse(x.store.alsaer_daily_reminders_v1).last.salat_2026_11_24,undefined);assert.equal(Object.keys(JSON.parse(x.store.alsaer_daily_reminders_v1).last).length,1);x.tick();assert.equal(x.sent.length,1)}
console.log('PASS foreground fallback: native guard, focus/consent gates, due delivery, persisted date-key dedup');
