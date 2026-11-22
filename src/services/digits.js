/* نمط الأرقام: مشرقية (٠-٩) أو عادية (0-9) على نصوص الواجهة فقط (لا يمسّ القرآن/المصحف ولا حقول الإدخال) */
var DG_E='٠١٢٣٤٥٦٧٨٩';
function digitsConv(s,west){return west?s.replace(/[٠-٩]/g,function(c){return DG_E.indexOf(c)}):s.replace(/\d/g,function(c){return DG_E[c]})}
function digitsWalk(root){
  var west=U().digits==='west';if(!root)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n;
  while((n=w.nextNode())){var p=n.parentNode;if(!p||(p.closest&&p.closest('.mp,.keepar,.qv,.mushaf,script,style,textarea,input,.tin')))continue;
    var v=n.nodeValue;if(!(west?/[٠-٩]/:/\d/).test(v))continue;var r=digitsConv(v,west);if(r!==v)n.nodeValue=r}
}
function digitsApply(force){
  if(!U().digits)U().digits='east'; /* الافتراضي مشرقية كما تعرض شاشة الإعدادات */
  ['app','top','tabs'].forEach(function(i){digitsWalk(document.getElementById(i))});
  if(force)try{render()}catch(e){}
}
(function(){if(!window.MutationObserver)return;var t=null;
  new MutationObserver(function(){if(!U().digits||t)return;t=setTimeout(function(){t=null;try{digitsApply(false)}catch(e){}},50)}).observe(document.body,{childList:true,subtree:true,characterData:true});
  try{setTimeout(function(){digitsApply(false)},300)}catch(e){}})();
