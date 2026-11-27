/* Journal screen contract: day cards from real marks, hours only from stored mark-times, never invented. */
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const today='2026-11-24',yday='2026-11-23';
const S0={
 onboarded:true,goal:2,
 prayers:{[today]:{fajr:true,dhuhr:true},[yday]:{fajr:true,dhuhr:true,asr:true,maghrib:true,isha:true}},
 quran:{goal:2,log:{[today]:2,[yday]:1}},
 fasting:{records:{[today]:'done',[yday]:'missed'},customDates:[],reminders:{}},
 habits:{[today]:{adhkar_sabah:true}},
 myHabits:[],extraHabits:[],
 mtimes:{[today]:{'p:fajr':new Date(today+'T05:12:00').getTime(),'q':new Date(today+'T07:30:00').getTime(),'fast':new Date(today+'T04:50:00').getTime(),'h:adhkar_sabah':new Date(today+'T06:00:00').getTime()}}
};
const ctx={
 console,Date,JSON,Object,Math,String,Number,Array,isNaN,parseInt,parseFloat,
 S:S0,JN_F:'all',
 PR:[['fajr','الفجر'],['dhuhr','الظهر'],['asr','العصر'],['maghrib','المغرب'],['isha','العشاء']],
 WEEK:['ح','ن','ث','ر','خ','ج','س'],
 HABITS:[['adhkar_sabah','أذكار الصباح',true],['adhkar_masaa','أذكار المساء',true]],
 esc:s=>String(s),ic:()=>'',ar:n=>String(n),
 dk:d=>{d=d||new Date(today+'T12:00:00');return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
 qPages:k=>(S0.quran.log[k]||0),
 allHabits:()=>ctx.HABITS.map(h=>[h[0],h[1],true]),
 hmFmt:hm=>hm,lang:()=>'ar',render(){},mtOf:(k,id)=>(S0.mtimes[k]||{})[id]||0
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/services/stats.js','utf8').split('\n').filter(l=>/function qPages|function allHabits/.test(l)).join('\n'),ctx);
vm.runInContext(fs.readFileSync('src/screens/journal.js','utf8'),ctx);

let h=ctx.vJournal();
assert.ok(h.includes('سجل')===false,'view has no own header (render() owns it)');
assert.ok(h.includes('jn-fchips'),'filter chips rendered');
assert.ok(h.includes('data-v="prayers"')&&h.includes('data-v="habits"'),'all filters present');
assert.ok(h.includes('الصلاة · 2 من ٥'),'prayer count');
assert.ok(h.includes('>الفجر ✓<small class="jn-t">5:12</small>'),'prayer chip with stored hour');
assert.ok(h.includes('القرآن · وردك اكتمل ✓'),'quran goal complete');
assert.ok(h.includes('>2 صفحات من 2<small class="jn-t">7:30</small>'),'quran line with hour');
assert.ok(h.includes('صمت هذا اليوم ✓<small class="jn-t">4:50</small>'),'fasting with hour');
assert.ok(h.includes('أذكار الصباح ✓<small class="jn-t">6:00</small>'),'habit with hour');
/* older day: no mtimes stored => day-level only, no invented hour */
assert.ok(!h.includes('5 of 5')&&h.includes('الصلاة · 5 من ٥ ✓'),'older day full prayers');
assert.equal((h.match(/class="jn-t"/g)||[]).length,4,'exactly the 4 stored hours shown; none invented for older day');
assert.ok(h.includes('لم يُسجَّل صيام'),'missed fasting shown without time');
/* filter keeps only its rows */
ctx.JN_F='fasting';h=ctx.vJournal();
assert.ok(h.includes('الصيام')&&!h.includes('الصلاة · 2 من ٥'),'fasting filter');
/* empty state */
ctx.S={onboarded:true,quran:{goal:2,log:{}},fasting:{records:{},customDates:[],reminders:{}},prayers:{},habits:{},myHabits:[],extraHabits:[]};
ctx.JN_F='all';h=ctx.vJournal();
assert.ok(h.includes('لا يوجد نشاط مسجّل بعد'),'empty state');
/* day cap honored */
ctx.S=S0;
const src=fs.readFileSync('src/screens/journal.js','utf8');
assert.ok(src.includes('JN_MAX=400'),'day cap constant');
assert.ok(src.includes('slice(0,JN_MAX)'),'days sliced to cap');
/* registration */
assert.ok(fs.readFileSync('src/core/render.js','utf8').includes('journal:vJournal'),'render map');
const st=fs.readFileSync('src/core/state.js','utf8');
assert.ok(st.includes("journal:'home'")&&st.includes("journal:'سجل النشاط اليومي'")&&st.includes("journal:'clock'"),'state registration');
assert.ok(fs.readFileSync('src/screens/home.js','utf8').includes("lrow('journal','clock','سجل النشاط اليومي'"),'home row');
assert.ok(fs.readFileSync('src/manifest.json','utf8').includes('screens/journal.js'),'manifest entry');
assert.ok(fs.readFileSync('src/core/event-dispatcher.js','utf8').includes("a==='jnfilter'"),'filter dispatcher');
console.log('PASS journal: day cards, stored hours only (none invented), filters, empty state, registration');
