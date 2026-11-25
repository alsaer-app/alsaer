var I18N_PACKS={};
(function(){["en", "fr", "tr", "de", "fa", "ur"].forEach(function(k){var c;Object.defineProperty(I18N_PACKS,k,{enumerable:true,get:function(){if(c)return c;var s=window.__PK_S&&window.__PK_S[k];return s?(c=JSON.parse(s)):undefined}})})})();
function i18nLoad(ls,cb){var n=0,t=ls.filter(function(l){return !I18N_PACKS[l]});if(!t.length){cb();return}t.forEach(function(l){var sc=document.createElement('script');sc.src='i18n-'+l+'.js';sc.onload=sc.onerror=function(){if(++n===t.length)cb()};document.head.appendChild(sc)})}
function ENPK(){return I18N_PACKS.en||{}}
var I18N_META={"ar":{"dir":"rtl","en":"Arabic","native":"العربية"},"de":{"ar":"الألمانية","dir":"ltr","native":"Deutsch"},"en":{"ar":"الإنجليزية","dir":"ltr","native":"English"},"fa":{"ar":"الفارسية","dir":"rtl","native":"فارسی"},"fr":{"ar":"الفرنسية","dir":"ltr","native":"Français"},"tr":{"ar":"التركية","dir":"ltr","native":"Türkçe"},"ur":{"ar":"الأردية","dir":"rtl","native":"اردو"}};
