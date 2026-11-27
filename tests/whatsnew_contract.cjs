// "What's new" dialog: once per versionCode after an update, reads the latest release-log entry,
// first install records silently, release log top entry matches build.gradle.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function mk(initial,onboarded,build,ver){
  const ls=new Map(Object.entries(initial||{}));let appended=[];
  const el=()=>({id:'',className:'',innerHTML:'',remove(){appended=appended.filter(x=>x!==this)}});
  const ctx={console,parseInt,String,isNaN,S:{onboarded},unlocked:true,APP_BUILD:build,APP_VERSION:ver,
    esc:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    localStorage:{getItem:k=>ls.has(k)?ls.get(k):null,setItem:(k,v)=>ls.set(k,String(v))},
    document:{createElement:()=>el(),getElementById:id=>appended.find(x=>x.id===id)||null,body:{appendChild:x=>appended.push(x)}}};
  vm.createContext(ctx);
  const more=fs.readFileSync('src/screens/more.js','utf8');
  vm.runInContext(more.split('\n')[0],ctx); // RL_RAW only
  vm.runInContext(fs.readFileSync('src/services/hadith-update.js','utf8'),ctx);
  return {ctx,ls,get shown(){return appended.length}, get html(){return appended[0]?appended[0].innerHTML:''}};
}
// existing user, no key yet -> shown once for the new build
let t=mk({}, true, 10200,'2.0.0'); t.ctx.wnInit(); assert.equal(t.ls.get('alsaer_wn_build'),'0');
t.ctx.renderFirstUpdateNotice(); assert.equal(t.shown,1);
assert.ok(t.html.includes('2.0.0')&&t.html.includes('wnlog')&&t.html.includes('update109Done'));
assert.ok((t.html.match(/<li>/g)||[]).length>=5,'bullets from latest entry');
t.ctx.wnMarkSeen(); t.ctx.renderFirstUpdateNotice(); assert.equal(t.shown,0,'removed after seen');
t.ctx.renderFirstUpdateNotice(); assert.equal(t.shown,0,'not shown again for same build');
// next build shows again
t.ctx.APP_BUILD=10201; t.ctx.renderFirstUpdateNotice(); assert.equal(t.shown,1);
// fresh install: silent
t=mk({}, false, 10200,'2.0.0'); t.ctx.wnInit(); assert.equal(t.ls.get('alsaer_wn_build'),'10200');
t.ctx.S.onboarded=true; t.ctx.renderFirstUpdateNotice(); assert.equal(t.shown,0,'first install never shows');
// init does not overwrite
t.ls.set('alsaer_wn_build','10100'); t.ctx.wnInit(); assert.equal(t.ls.get('alsaer_wn_build'),'10100');
// locked or not onboarded -> hidden
t=mk({alsaer_wn_build:'1'}, true, 10200,'2.0.0'); t.ctx.unlocked=false; t.ctx.renderFirstUpdateNotice(); assert.equal(t.shown,0);
// release guard: top log entry matches build.gradle version and code
const g=fs.readFileSync('android/app/build.gradle','utf8');
const code=/versionCode\s+(\d+)/.exec(g)[1],name=/versionName\s+"([^"]+)"/.exec(g)[1];
const L=t.ctx.wnLatest(); assert.equal(L.ver,name+' ('+code+')','top release-log entry must match build.gradle');
console.log('PASS whatsnew: once per build, silent first install, latest log entry, log matches build.gradle');
