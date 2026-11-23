const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let data=new Map(),phoneFail=false,linked=true,uploads=0,uploadFail=false;
const ctx={Promise,Date,console,setTimeout(){},clearTimeout(){},window:{AlsaerNative:{gdriveSaveBackup(){if(phoneFail)return false;return true}}},document:{hidden:false,addEventListener(){}},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},S:{onboarded:true},save(){},render(){},bkSay:m=>ctx.msg=m,bkBuild:()=>'{"app":"alsaer"}'};
ctx.AlsaerNative=ctx.window.AlsaerNative;vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/services/gdrive-backup.js','utf8'),ctx);ctx.gdHasRt=()=>linked;ctx.gdUpload=async()=>{uploads++;if(uploadFail)throw Error('offline')};
(async()=>{
 linked=false;assert.equal(await ctx.gdRunBackup(false),true);assert.ok(ctx.gdPrefs().phoneAt);assert.equal(uploads,0);
 linked=true;uploadFail=true;let p=ctx.gdPrefs();p.phoneAt=0;ctx.gdSetPrefs(p);assert.equal(await ctx.gdRunBackup(false),false);assert.ok(ctx.gdPrefs().phoneAt);assert.equal(ctx.S.gdAt,undefined);
 uploadFail=false;phoneFail=true;assert.equal(await ctx.gdRunBackup(false),false);assert.ok(ctx.S.gdAt);assert.equal(ctx.gdPrefs().phoneRetry,true);let n=uploads;
 phoneFail=false;assert.equal(await ctx.gdRunBackup(true),true);assert.equal(uploads,n);assert.equal(ctx.gdPrefs().phoneRetry,false);
 ctx.gdAutoTried=0;ctx.gdAutoOnOpen();await new Promise(r=>setImmediate(r));assert.equal(uploads,n);assert.equal(ctx.gdBusy,false);
 console.log('PASS offline/unlinked local safety copy, upload-failure local independence, local-failure retry without duplicate Drive upload, per-destination freshness');
})().catch(e=>{console.error(e);process.exitCode=1});
