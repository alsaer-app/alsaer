const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const data=new Map(),calls=[];
let timer;
const ctx={Promise,Date,console,setTimeout(f){timer=f;return 1},clearTimeout(){},window:{AlsaerNative:{gdriveAuthorize(v){calls.push(v)}}},document:{hidden:false,addEventListener(){},getElementById:()=>null},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},S:{onboarded:true},save(){},render(){},bkSay(){},ic:()=>'',esc:s=>s};ctx.AlsaerNative=ctx.window.AlsaerNative;vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/services/gdrive-backup.js','utf8'),ctx);
(async()=>{
 data.set('alsaer_gdrive_native','1');data.set('alsaer_gdrive_email','old@example.com');data.set('alsaer_drive_sealed_pw','sealed');data.set('alsaer_backup_status_v2','{"driveAt":123}');data.set('tawba_v1','personal');
 let p=ctx.gdNativeToken(false);ctx.window.gdriveOnNativeToken('','consent-required','');await assert.rejects(p);assert.equal(ctx.gdHasRt(),false);assert.equal(data.has('alsaer_gdrive_email'),false);assert.equal(data.get('alsaer_drive_sealed_pw'),'sealed');assert.equal(data.get('tawba_v1'),'personal');assert.equal(JSON.parse(data.get('alsaer_backup_status_v2')).driveAt,123);
 p=ctx.gdNativeToken(true);ctx.window.gdriveOnNativeToken('fresh','','new@example.com');await p;assert.equal(ctx.gdHasRt(),true);assert.equal(ctx.gdEmail(),'new@example.com');assert.equal(ctx.gdStatus().driveAt,0);
 p=ctx.gdNativeToken(true);ctx.window.gdriveOnNativeToken('','cancelled','');await assert.rejects(p);assert.equal(ctx.gdHasRt(),true);assert.equal(ctx.gdEmail(),'new@example.com');
 ctx.gdFetch=async()=>({status:401,ok:false});await assert.rejects(ctx.gdReq('stub'));assert.equal(ctx.gdHasRt(),false);assert.equal(ctx.gdTok.t,'');
 p=ctx.gdNativeToken(true);await assert.rejects(ctx.gdNativeToken(true));timer();await assert.rejects(p);assert.equal(ctx.gdNativePending,null);
 ctx.window.gdriveOnNativeToken('late-token','','unrequested@example.com');assert.equal(data.has('alsaer_gdrive_email'),false);
 assert.deepEqual(calls,[false,true,true,true]);
 let native=fs.readFileSync('android/app/src/main/java/com/ahmedalajmi/alsaer/DriveAuthorization.java','utf8');assert.ok(native.includes('if (allowUi) builder.setPrompt(AuthorizationRequest.Prompt.SELECT_ACCOUNT)'));
 console.log('PASS stale consent/401 recovery, token/email reset, explicit picker request, cancel preserves link, timeout/duplicate guards, backups/password/history untouched');
})().catch(e=>{console.error(e);process.exitCode=1});
