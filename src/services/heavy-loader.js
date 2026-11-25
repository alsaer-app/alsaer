var heavyState=0,heavyCbs=[];
/* بيانات ورش (warsh.js) تُحمَّل عند الحاجة؛ حفص مضمَّن في quran.js */
function loadHeavy(cb){
  if(window.WDATA){if(cb)cb();return}
  if(cb)heavyCbs.push(cb);
  if(heavyState)return;heavyState=1;
  var sc=document.createElement('script');
  sc.src='warsh.js';
  sc.onload=sc.onerror=function(){heavyState=window.WDATA?2:0;heavyCbs.splice(0).forEach(function(f){try{f()}catch(e){}});if(tab==='quran'||tab==='reader')render()};
  document.head.appendChild(sc);
}
