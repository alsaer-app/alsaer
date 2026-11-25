const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const data=new Map(),calls=[];let revokes=0;
let timer;
const ctx={Promise,Date,console,setTimeout(f){timer=f;return 1},clearTimeout(){},window:{AlsaerNative:{gdriveAuthorize(v){calls.push(v)},gdriveRevoke(){revokes++}}},document:{hidden:false,addEventListener(){},getElementById:()=>null},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},S:{onboarded:true},save(){},render(){},bkSay(){},ic:()=>'',esc:s=>s};ctx.AlsaerNative=ctx.window.AlsaerNative;vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/services/gdrive-backup.js','utf8'),ctx);
(async()=>{
 const flush=()=>new Promise(setImmediate);
 data.set('alsaer_gdrive_native','1');data.set('alsaer_gdrive_email','old@example.com');data.set('alsaer_drive_sealed_pw','sealed');data.set('alsaer_backup_status_v2','{"driveAt":123}');data.set('tawba_v1','personal');
 let p=ctx.gdNativeToken(false);ctx.window.gdriveOnNativeToken('','consent-required','');await assert.rejects(p);assert.equal(ctx.gdHasRt(),false);assert.equal(data.has('alsaer_gdrive_email'),false);assert.equal(data.get('alsaer_drive_sealed_pw'),'sealed');assert.equal(data.get('tawba_v1'),'personal');assert.equal(JSON.parse(data.get('alsaer_backup_status_v2')).driveAt,123);
 assert.ok(revokes>=1,'auth reset must also purge the on-device Google cache (native revoke)');
 /* network-unverifiable token is accepted as before (no fetch in this harness -> validation cannot prove it bad) */
 p=ctx.gdNativeToken(true);ctx.window.gdriveOnNativeToken('fresh','','new@example.com');await p;assert.equal(ctx.gdHasRt(),true);assert.equal(ctx.gdEmail(),'new@example.com');assert.equal(ctx.gdStatus().driveAt,0);
 p=ctx.gdNativeToken(true);ctx.window.gdriveOnNativeToken('','cancelled','');await assert.rejects(p);assert.equal(ctx.gdHasRt(),true);assert.equal(ctx.gdEmail(),'new@example.com');
 ctx.gdFetch=async()=>({status:401,ok:false});await assert.rejects(ctx.gdReq('stub'));assert.equal(ctx.gdHasRt(),false);assert.equal(ctx.gdTok.t,'');
 p=ctx.gdNativeToken(true);await assert.rejects(ctx.gdNativeToken(true));timer();await assert.rejects(p);assert.equal(ctx.gdNativePending,null);assert.equal(data.get('alsaer_gdrive_pending_auth'),'1');
 /* Late interactive result after the JS timeout is completed, not silently dropped (second-audit item 1); validation via stubbed transport */
 ctx.gdFetch=async()=>({status:200,ok:true,json:async()=>({user:{emailAddress:'late@example.com'}})});
 ctx.window.gdriveOnNativeToken('late-token','','unrequested@example.com');await flush();assert.equal(ctx.gdEmail(),'unrequested@example.com');assert.equal(ctx.gdHasRt(),true);assert.equal(data.has('alsaer_gdrive_pending_auth'),false);
 /* A stray callback with no pending attempt is still ignored */
 ctx.window.gdriveOnNativeToken('stray','','stray@example.com');await flush();assert.equal(ctx.gdEmail(),'unrequested@example.com');
 /* Stale cached token (the unlink/relink bug): a 401/403 on the proof call rejects the link instead of declaring success */
 ctx.gdFetch=async()=>({status:401,ok:false});
 p=ctx.gdNativeToken(true);ctx.window.gdriveOnNativeToken('stale-cached','','stale@example.com');await assert.rejects(p);assert.equal(ctx.gdHasRt(),false);assert.equal(ctx.gdEmail(),'');
 assert.deepEqual(calls,[false,true,true,true,true]);
 let native=fs.readFileSync('android/app/src/main/java/com/ahmedalajmi/alsaer/DriveAuthorization.java','utf8');assert.ok(native.includes('if (allowUi) builder.setPrompt(AuthorizationRequest.Prompt.SELECT_ACCOUNT)'));
 assert.ok(native.includes('RevokeAccessRequest'),'native unlink must clear the Play services authorization cache');
 console.log('PASS stale consent/401 recovery, token/email reset, explicit picker request, cancel preserves link, timeout/duplicate guards, late interactive completion, stray callback ignored, stale cached token rejected after proof call, native revoke on reset, backups/password/history untouched');
})().catch(e=>{console.error(e);process.exitCode=1});
