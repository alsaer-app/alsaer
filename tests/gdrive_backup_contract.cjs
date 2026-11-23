const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const data=new Map(),ctx={Promise,Date,console,setTimeout(){},clearTimeout(){},window:{AlsaerNative:{gdriveSeal:p=>'sealed:'+p,gdriveOpen:s=>s.slice(7),gdriveSaveBackup:()=>true}},document:{hidden:false,addEventListener(){},getElementById:()=>({value:'password'})},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},S:{onboarded:true},save(){},render(){},bkSay:m=>ctx.msg=m,bkBuild:()=>'{"sample":true}',bkEncrypt:async(r,p)=>'ALSAER-ENC1:'+r,ic:()=>'',esc:s=>s,bkAgo:()=>'',gdNative:()=>true};ctx.AlsaerNative=ctx.window.AlsaerNative;vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/services/gdrive-backup.js','utf8'),ctx);
ctx.gdHasRt=()=>true;ctx.gdNative=()=>true;ctx.gdEmailLoading=true;
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 let uploads=[];ctx.gdUpload=async c=>uploads.push(c);
 assert.equal(ctx.gdPrefs().auto,true);assert.equal(ctx.gdPrefs().encrypt,false);
 await ctx.gdRunBackup(false);assert.equal(uploads[0],'{"sample":true}');assert.ok(ctx.gdPrefs().phoneAt);assert.ok(ctx.S.gdAt);
 ctx.gdAct('gdstore','drive');assert.equal(ctx.gdPrefs().storage,'drive');
 ctx.gdAct('gdpwsave');assert.equal(ctx.gdPrefs().encrypt,true);assert.ok(data.get('alsaer_drive_sealed_pw').startsWith('sealed:'));
 await ctx.gdRunBackup(false);assert.ok(uploads.at(-1).startsWith('ALSAER-ENC1:'));
 ctx.S.gdAt=Date.now();let n=uploads.length;ctx.gdAutoOnOpen();await tick();assert.equal(uploads.length,n);
 ctx.S.gdAt=Date.now()-8*864e5;ctx.gdAutoOnOpen();await tick();assert.equal(uploads.length,n+1);ctx.gdAutoOnOpen();await tick();assert.equal(uploads.length,n+1);
 ctx.gdAct('gdauto');assert.equal(ctx.gdPrefs().auto,false);ctx.gdAutoTried=0;ctx.S.gdAt=0;ctx.gdAutoOnOpen();await tick();assert.equal(uploads.length,n+1);
 ctx.gdForgetLocalAuth();assert.equal(ctx.gdPrefs().encrypt,false);assert.equal(data.has('alsaer_drive_sealed_pw'),false);
 const html=ctx.gdRestorePanel();assert.ok(!html.includes('gdsafety'));
 console.log('PASS optional encryption, local sealed password, phone/Drive choice, interval gating/off/retry guard, unlink cleanup, no local recovery button');
})().catch(e=>{console.error(e);process.exitCode=1});
