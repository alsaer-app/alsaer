const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),R=require('node:path').join(__dirname,'../');
const read=p=>fs.readFileSync(R+p,'utf8');
let ctx={console,Date,Math,JSON,KEY:'tawba_v1',mem:null,window:{addEventListener(){},AlsaerNative:{mirrorSet(){ctx.mirrored++}}},AlsaerNative:{mirrorSet(){ctx.mirrored++}},document:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){throw Error('quota')}},setTimeout(){},clearTimeout(){},toast(){ctx.warned++},mirrored:0,warned:0};vm.createContext(ctx);vm.runInContext(read('src/services/storage.js'),ctx);ctx.S=ctx.def();ctx.saveNow();console.log('STORAGE_QUOTA',JSON.stringify({mirrorCalls:ctx.mirrored,warnings:ctx.warned}));
ctx.localStorage={setItem(k,v){ctx.stored=v},getItem(){return null}};ctx.BK_KEEP=[];ctx.location={reload(){}};vm.runInContext(read('src/services/extras.js').split('function bkAgo')[0].split('/* ----- النسخ الاحتياطي ----- */')[1],ctx);
let malformed={app:'alsaer',S:{days:[],counters:{}}};console.log('RESTORE_SCHEMA',ctx.validBackup(malformed.S),JSON.stringify(ctx.bkApply(JSON.stringify(malformed))),Array.isArray(ctx.S.days));
ctx.S=ctx.def();ctx.S.days['2026-11-24']={status:'success',note:'preserve me',trig:[]};Object.assign(ctx,{BAD_HABITS:[],allHabits:()=>[],draft:null,draftTrig:null,save(){},checkNew(){}});vm.runInContext(read('src/services/habit-tracker.js'),ctx);let a=ctx.evSeed('main','2026-11-24');a.pop();ctx.evSync('main','2026-11-24');assert.equal(ctx.evCounts('2026-11-24','main','bad').s,0);assert.equal(ctx.S.days['2026-11-24'].note,'preserve me');
ctx.S=ctx.def();ctx.S.habits={'2026-11-24':{good:true}};ctx.allHabits=()=>[['good','good']];console.log('LEGACY_GOOD',JSON.stringify(ctx.evCounts('2026-11-24','good','good')));ctx.evSeed('good','2026-11-24');ctx.evSync('good','2026-11-24');console.log('LEGACY_GOOD_AFTER_SYNC',JSON.stringify(ctx.S.habits));
let schedules=[];let sctx={console,Date,Math,JSON,setInterval(){},setTimeout(){},clearTimeout(){},save(){},dk:()=> '2026-11-24',S:{quran:{goal:1,pos:1},prayers:{'2026-11-24':{fajr:true}},ptimes:{fajr:'05:00'},books:[]},PR:[['fajr','الفجر']],qPages:()=>0,window:{AlsaerNative:{setSchedule(x){schedules.push(JSON.parse(x))}},addEventListener(){}},document:{addEventListener(){}},localStorage:{getItem(){return JSON.stringify({enabled:true,consent:true,malik:false,kahf:false,salat:false,dua:false,weekly:false,backup:false,wird:false,fasting:false,prayers:true})}},render(){}};
vm.createContext(sctx);let native=read('src/services/native-schedule.js').replace('  var lastW=\'\';',"  window.__build=build;var lastW='';");vm.runInContext(native,sctx);console.log('PRAYER_DONE_SCHEDULE',JSON.stringify(sctx.window.__build()));

assert.equal(ctx.mirrored,1);assert.equal(ctx.validBackup(malformed.S),false);assert.equal(ctx.S.habits['2026-11-24'].good,true);
assert.equal(sctx.window.__build()[0].skipDate,'2026-11-24');assert.equal(sctx.window.__build()[0].dow.length,0);
console.log('PASS storage mirror independence, wrapped schema rejection, note-only undo, date-scoped skip');

// Newer independent mirror wins over stale browser data.
const newer=ctx.def();newer.updatedAt=200;newer.profile.name='mirror';const older=ctx.def();older.updatedAt=100;older.profile.name='local';ctx.window.AlsaerNative.mirrorGet=ctx.AlsaerNative.mirrorGet=()=>JSON.stringify(newer);ctx.localStorage={getItem:()=>JSON.stringify(older),setItem(){}};assert.equal(ctx.load().profile.name,'mirror');
// Neither malformed wrapped restore nor reminder-write failure may replace state.
let stateWrites=0;ctx.S=ctx.def();ctx.localStorage={getItem:()=>null,removeItem(){},setItem(k){if(k==='alsaer_daily_reminders_v1')throw Error('quota');if(k===ctx.KEY)stateWrites++}};ctx.saveOff=false;assert.notEqual(ctx.bkApply(JSON.stringify({app:'alsaer',S:ctx.def(),rem:{enabled:true}})),'');assert.equal(stateWrites,0);
// Current browser fallback consumes the full existing schedule, not four hard-coded types.
let timed=[],delivered=[];let rc={window:{alsaerReminderItems:()=>[{id:'cu_1',h:12,m:0,title:'custom',body:'test'}]},document:{addEventListener(){},hasFocus:()=>true},localStorage:{getItem:k=>k==='alsaer_snd_v8'?'1':JSON.stringify({enabled:true,consent:true,last:{}}),setItem(){}},setInterval:f=>timed.push(f),Date:class extends Date{constructor(){super('2026-11-24T12:00:00')}},Notification:function(t){delivered.push(t)},dk:()=> '2026-11-24'};rc.Notification.permission='granted';rc.window.Notification=rc.Notification;vm.createContext(rc);vm.runInContext(read('src/services/reminders-ui.js').split('/* === ALSAER NATIVE NOTIFICATIONS BRIDGE')[0],rc);timed[0]();assert.deepEqual(delivered,['custom']);
// Failed heavy asset load is retryable.
let hc={window:{},document:{createElement:()=>({}),head:{appendChild(s){s.onerror()}}},tab:'home'};vm.createContext(hc);vm.runInContext(read('src/services/heavy-loader.js'),hc);hc.loadHeavy();assert.equal(hc.heavyState,0);
// More tile removed, Settings route and quick shortcut remain.
assert(!read('src/screens/more.js').includes("mrow('backup'"));assert(read('src/screens/settings.js').includes("sgNavTab('backup'"));assert(read('src/services/quick-fab.js').includes("['backup','cloud']"));
console.log('PASS newer mirror recovery, atomic reminder restore failure, full-schedule foreground fallback, heavy-loader retry, More-only tile removal');
// Overnight floating schedule includes the previous day's interval tail.
let fc={window:{},S:{},document:{},setTimeout(){},Date:class extends Date{constructor(...a){super(...(a.length?a:['2026-11-24T00:30:00']))}static now(){return new Date('2026-11-24T00:30:00').getTime()}},Math};vm.createContext(fc);vm.runInContext(read('src/services/floatfeed.js'),fc);let next=fc.ffUpcomingJs({mode:'interval',every:60,all:false,from:'22:00',to:'02:00',days:[1]},1);assert.equal(new Date(next[0]).getHours(),1);assert.equal(new Date(next[0]).getDate(),24);
console.log('PASS overnight Monday interval retains Tuesday 01:00 tail');

// Granting OS permission must not undo a saved master-off choice during migration.
let nativePoll=sctx.window.alsaerPoll;sctx.S.onboarded=true;sctx.window.AlsaerNative.notificationsEnabled=()=>true;sctx.localStorage={getItem:()=>JSON.stringify({enabled:false,consent:false}),setItem(k,v){sctx.lastConfig=JSON.parse(v)}};nativePoll(true);assert.equal(sctx.lastConfig.enabled,false);assert.equal(sctx.lastConfig.autoOn,true);
console.log('PASS explicit reminder master-off preserved during auto-enable migration');

// Corrupt state in BOTH stores must be quarantined, never silently overwritten (item 65).
let cc={console,Date,Math,JSON,KEY:'tawba_v1',mem:null,window:{addEventListener(){},AlsaerNative:{mirrorGet(){return '{broken'},mirrorSet(k,v){cc.mset=(cc.mset||{});cc.mset[k]=v}}},AlsaerNative:{mirrorGet(){return '{broken'},mirrorSet(k,v){cc.mset=(cc.mset||{});cc.mset[k]=v}},document:{addEventListener(){}},localStorage:{getItem(k){return k==='tawba_v1'?'{also broken':null},setItem(k,v){cc.lset=(cc.lset||{});cc.lset[k]=v}},setTimeout(fn){cc.toastLater=fn},clearTimeout(){},toast(m){cc.toasted=m}};vm.createContext(cc);vm.runInContext(read('src/services/storage.js'),cc);
let recovered=cc.load();assert.equal(typeof recovered.profile,'object');assert.equal(recovered.profile.name,'');
assert.equal(cc.window.__alsaerCorrupt,true);assert.equal(cc.lset['tawba_v1_corrupt'],'{also broken');assert.equal(cc.mset['tawba_v1_corrupt'],'{broken');
cc.toastLater();assert.ok(cc.toasted&&cc.toasted.length>10);
console.log('PASS corrupt state quarantined, boot read-only flag and recovery notice');
