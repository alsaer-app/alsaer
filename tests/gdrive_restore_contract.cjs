/* Standalone contract: node tests/gdrive_restore_contract.cjs */
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const ctx={console,Promise,Date,setTimeout:(fn,ms)=>{if(ms!==400)return setTimeout(fn,ms)},clearTimeout,window:{},document:{addEventListener(){},getElementById(){return null}},navigator:{},S:{days:{},counters:{},profile:{name:'current'},pin:'keep'},KEY:'state',saveOff:false,saveTm:0,def:()=>({days:{},counters:{}}),fixShape:x=>x,validBackup:x=>!!(x&&x.days&&x.counters),render(){},bkSay(){},gdBusy:false,location:{reload(){}},Map,esc:s=>String(s),ar:s=>String(s)};
const store=new Map();ctx.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/services/extras.js','utf8'),ctx);vm.runInContext(fs.readFileSync('src/services/gdrive-backup.js','utf8'),ctx);
ctx.gdHasRt=()=>true;ctx.bkSay=m=>ctx.message=m;ctx.bkDecrypt=async(raw,pw)=>{if(pw!=='correct')throw Error('bad');return JSON.stringify({app:'alsaer',S:{days:{},counters:{},profile:{name:'encrypted'}}})};
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
  const remote=JSON.stringify({app:'alsaer',S:{days:{},counters:{},profile:{name:'remote'}},rem:{enabled:true}});
  let renderCount=0;ctx.render=()=>renderCount++;
  ctx.gdStage(remote,'drive',{name:'version.json',size:100});assert.equal(ctx.gdRestoreRaw,remote);assert.ok(renderCount);assert.equal(store.has('state'),false);assert.match(ctx.gdRestorePanel(),/data-a="gdverify"/);
  ctx.gdAct('gdcancel');assert.equal(ctx.gdRestoreRaw,'');assert.equal(store.size,0);
  ctx.gdStage(remote,'drive',{});await ctx.gdVerifyRestore();ctx.gdAct('gdrestore');await flush();assert.equal(JSON.parse(store.get('state')).profile.name,'remote');assert.equal(JSON.parse(store.get(ctx.GD_SAFETY_KEY)).S.profile.name,'current');assert.equal(JSON.parse(store.get('state')).pin,'keep');assert.equal(JSON.parse(store.get('alsaer_daily_reminders_v1')).enabled,true);
  const safety=store.get(ctx.GD_SAFETY_KEY);ctx.gdRestoreRaw='bad json';ctx.gdVerified='';await ctx.gdVerifyRestore();assert.equal(store.get(ctx.GD_SAFETY_KEY),safety);assert.match(ctx.message,/غير صالح/);
  ctx.gdRestoreRaw='ALSAER-ENC1:test';ctx.document.getElementById=()=>({value:'wrong'});await ctx.gdVerifyRestore();assert.equal(store.get(ctx.GD_SAFETY_KEY),safety);assert.match(ctx.message,/كلمة المرور/);assert.equal(ctx.gdBusy,false);
  ctx.document.getElementById=()=>({value:'correct'});await ctx.gdVerifyRestore();ctx.gdAct('gdrestore');await flush();assert.equal(JSON.parse(store.get('state')).profile.name,'encrypted');
  const before=store.get('state');ctx.gdStage(remote,'drive',{});await ctx.gdVerifyRestore();const set=ctx.localStorage.setItem;ctx.localStorage.setItem=(k,v)=>{if(k===ctx.GD_SAFETY_KEY)throw Error('quota');set(k,v)};ctx.gdAct('gdrestore');await flush();assert.equal(store.get('state'),before);assert.match(ctx.message,/أُوقفت/);ctx.localStorage.setItem=set;
  ctx.gdAct('gdsafety');assert.equal(ctx.gdRestoreSource,'safety');assert.ok(ctx.gdRestoreRaw);assert.match(ctx.gdRestorePanel(),/نسخة أمان داخل التطبيق/);
  const driveBefore=ctx.gdStatus().driveRestoreAt;await ctx.gdVerifyRestore();ctx.gdAct('gdrestore');await flush();assert.equal(ctx.gdStatus().driveRestoreAt,driveBefore);assert.ok(ctx.gdStatus().safetyRestoreAt>0);
  let requested='';ctx.gdReq=async url=>{requested=url;return {json:async()=>({files:[]})}};await ctx.gdFindFile();assert.match(requested,/orderBy=modifiedTime%20desc/);
  console.log('PASS: download opens explicit confirmation; cancel; plaintext/encrypted restore; PIN preserved; reminders; safety recovery; invalid/wrong-password/quota fail closed; latest ordering');
})().catch(e=>{console.error(e);process.exitCode=1});
