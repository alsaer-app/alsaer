const fs=require('fs'),vm=require('vm'),a=require('node:assert/strict');const c={window:{addEventListener(){}},document:{addEventListener(){}}};vm.createContext(c);vm.runInContext(fs.readFileSync('src/services/storage.js','utf8'),c);
for(const bad of [[],null,'broken',42]){const s=c.fixShape(Object.assign(c.def(),{fasting:{prefs:bad,records:bad,reminders:bad}}));a.equal(Array.isArray(s.fasting.records),false);s.fasting.records['2026-11-24']='done';a.equal(JSON.parse(JSON.stringify(s)).fasting.records['2026-11-24'],'done');a.equal(s.fasting.prefs.monThu,true);a.equal(s.fasting.reminders.suhoorTime,'03:30')}
for(const bad of [[],null,'bad',42])a.equal(c.validBackup({days:{},counters:{},fasting:{records:bad}}),false);
a.equal(c.validBackup({days:{},counters:{},fasting:{records:{'2026-11-24':'done'},prefs:{dawud:true}}}),true);
console.log('PASS malformed optional fasting containers rejected on import and normalized on load; later date record survives JSON persistence');
