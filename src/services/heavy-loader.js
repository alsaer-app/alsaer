var heavyState=0,heavyCbs=[];
function loadHeavy(cb){
  if(window.MUSHAF&&window.WDATA&&window.WTJ){if(cb)cb();return}
  if(cb)heavyCbs.push(cb);
  if(heavyState)return;heavyState=1;
  var files=['mushaf.js','warsh.js','tajweed_warsh.js'],i=0;
  (function nx(){
    if(i>=files.length){heavyState=(window.MUSHAF&&window.WDATA&&window.WTJ)?2:0;heavyCbs.splice(0).forEach(function(f){try{f()}catch(e){}});if(tab==='quran'||tab==='reader')render();return}
    var sc=document.createElement('script');sc.src=files[i++];sc.onload=nx;sc.onerror=nx;document.head.appendChild(sc);
  })();
}
