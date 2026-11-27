const vm=require('node:vm'),fs=require('node:fs'),a=require('node:assert/strict');let store=new Map(),requests=[],replies=[];
let ctx={console,Promise,Date,setTimeout(){},clearTimeout(){},window:{},document:{addEventListener(){},getElementById(){return {checked:true}}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},S:{gdAt:42},render(){},bkSay:m=>ctx.message=m,bkBuild:()=>'{"app":"alsaer"}',ar:String,esc:String};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/services/gdrive-backup.js','utf8'),ctx);
ctx.gdHasRt=()=>true;ctx.gdReq=async(u,o)=>{requests.push({u,o});let v=replies.shift();if(v instanceof Error)throw v;return {json:async()=>v||{},text:async()=>''}};
const f=(id,legacy=false)=>({id,name:legacy?'alsaer-backup.json':'alsaer-backup-date.json',size:128,ownedByMe:true,capabilities:{canDelete:true},appProperties:legacy?{}:{alsaerBackup:'v2'}});
(async()=>{
 replies=[{files:[f('one')],nextPageToken:'next'},{files:[f('two',true),{id:'folder',name:'alsaer-backup.json',mimeType:'application/vnd.google-apps.folder'}]}];let files=await ctx.gdListFiles();a.equal(files.length,2);a.ok(requests[1].u.includes('pageToken=next'));
 replies=[{files:[f('one')],incompleteSearch:true}];await a.rejects(ctx.gdListFiles(),/incomplete-list/);
 requests=[];await ctx.gdUpload('RAW');await ctx.gdUpload('RAW');a.equal(requests.length,2);a.ok(requests.every(r=>r.o.method==='POST'&&r.o.body.includes('alsaerBackup')&&r.o.body.includes('backupAt')));a.ok(requests.every(r=>!r.u.includes('uploadType=media')));
 ctx.gdPicker={mode:'delete',confirm:true,files:[f('one'),f('two',true)]};ctx.gdSelected=['two'];replies=[{}, {files:[f('one')]}];requests=[];await ctx.gdDeleteSelected();a.equal(requests.filter(r=>r.o?.method==='DELETE').length,1);a.ok(requests[0].u.endsWith('/two'));a.match(ctx.message,/١|1/);
 ctx.gdPicker={mode:'delete',confirm:true,files:[f('one')]};ctx.gdSelected=['one'];replies=[Error('timeout'),{files:[]}];await ctx.gdDeleteSelected();a.match(ctx.message,/غير مؤكدة/);a.match(ctx.message,/0/);
 ctx.gdPicker=null;replies=[Error('auth')];a.equal(await ctx.gdLoadPicker('delete'),false);a.equal(ctx.gdPicker,null);
 ctx.gdStatusSet('driveAt',500);ctx.S.gdAt=1;a.equal(ctx.gdStatus().driveAt,500);ctx.gdStatusSet('fileRestoreAt',700);a.equal(ctx.gdStatus().fileRestoreAt,700);
 console.log('PASS full pagination/incomplete fail closed, timestamped create-only marked versions, folders excluded, exact legacy selection, partial/ambiguous delete outcomes, auth failure, device-local status');
})().catch(e=>{console.error(e);process.exitCode=1});
