const fs=require('fs'),vm=require('vm'),a=require('node:assert/strict');
const img=fs.readFileSync('src/services/mushaf-img.js','utf8');
const rd=fs.readFileSync('src/screens/reader.js','utf8');
const wr=fs.readFileSync('src/services/quran-warsh.js','utf8');
const sheet=fs.readFileSync('src/components/mushaf-settings.js','utf8');
/* 1. image mode is the default: mpiOnFor has no constant-false and no settings key */
a.ok(!/function mpiOnFor\(p\)\{return false\}/.test(img),'mpiOnFor must not be hard-disabled');
const onFor=img.slice(img.indexOf('function mpiOnFor'),img.indexOf('function mpiVerses'));
a.ok(!/S\.quran\.img/.test(onFor),'mpiOnFor must not read a settings toggle');
a.ok(/function mpiAskMaybe\([^)]*\)\{\s*return;/.test(img),'consent prompt stays disabled (no toggle, default ON)');
/* 2. both riwayas route through it */
a.ok(/useImg=mpiOnFor\(p\)/.test(rd),'hafs reader must branch on mpiOnFor');
a.ok(/useImg=mpiOnFor\(p\)/.test(wr),'warsh reader must branch on mpiOnFor');
/* 3. no in-app fallback toggle in the mushaf options sheet */
const html=sheet.slice(sheet.indexOf('function mpSheetHtml'),sheet.indexOf('function mpRe'));
a.ok(!/data-mp=\\?"img/.test(html),'sheet must not render an image/text toggle');
a.ok(!/imgyes|imgno/.test(html),'sheet must not render an opt-in prompt');
/* 4. offline download UI is offered in the sheet */
a.ok(/id="mpi-dl"/.test(html),'sheet must include the download-all block');
/* 5. functional: enabled with verse data, per-page failure falls back to text without looping */
const c={window:{},document:{addEventListener(){}},location:{search:''},console};
vm.createContext(c);
vm.runInContext('var AYAPOS={p:[],x:[],y:[]},AYAW=[];var isW=function(){return false};'+img,c);
a.equal(c.mpiOnFor(1),true,'page 1 defaults to image mode');
a.equal(c.mpiOnFor(604),true,'page 604 defaults to image mode');
vm.runInContext('mpiBad[mpiKey(150)]=1',c);
a.equal(c.mpiOnFor(150),false,'failed page falls back to text (no render loop)');
a.equal(c.mpiOnFor(151),true,'neighbouring page stays in image mode');
vm.runInContext('isW=function(){return true}',c);
a.equal(c.mpiOnFor(1),true,'warsh defaults to image mode');
/* 6. coordinate data ships and lazy-loads with the heavy mushaf bundle */
const hl=fs.readFileSync('src/services/heavy-loader.js','utf8');
a.ok(/mushaf-img-data\.js/.test(hl),'heavy loader must fetch mushaf-img-data.js');
a.ok(fs.existsSync('www/mushaf-img-data.js'),'www/mushaf-img-data.js must exist for packaging');
a.ok(fs.readFileSync('www/mushaf-img-data.js','utf8').length>100000,'coordinate data must be complete');
console.log('PASS mushaf image renderer is default-on for hafs+warsh, no in-app toggle, per-page fallback cannot loop');
