#!/usr/bin/env python3
"""Generate src/i18n/packs.js from i18n_archive/*.json (phase 1: en/fr; phase 2: tr/de/fa/ur)."""
import json,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS=['en','fr','tr','de','fa','ur']
def L(n):return json.load(open(os.path.join(R,'i18n_archive',n+'.json'),encoding='utf-8'))
packs={k:L(k) for k in LANGS}
for k in LANGS:
    x=os.path.join(R,'src','i18n','extra-'+k+'.json')
    if os.path.exists(x):packs[k].update(json.load(open(x,encoding='utf-8')))
meta=json.load(open(os.path.join(R,'i18n_archive','_meta.json'),encoding='utf-8'))
meta={k:meta[k] for k in ['ar']+LANGS if k in meta}
j=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'),sort_keys=True)
for k in LANGS:
    open(os.path.join(R,'www','i18n-'+k+'.js'),'w',encoding='utf-8',newline='').write('/* حزمة ترجمة %s: تُحمَّل عند الحاجة فقط (انظر src/i18n/packs.js) */\n(window.__PK_S=window.__PK_S||{}).%s=%s;\n'%(k,k,json.dumps(j(packs[k]),ensure_ascii=False)))
lazy="var I18N_PACKS={};\n(function(){%s.forEach(function(k){var c;Object.defineProperty(I18N_PACKS,k,{enumerable:true,get:function(){if(c)return c;var s=window.__PK_S&&window.__PK_S[k];return s?(c=JSON.parse(s)):undefined}})})})();\nfunction i18nLoad(ls,cb){var n=0,t=ls.filter(function(l){return !I18N_PACKS[l]});if(!t.length){cb();return}t.forEach(function(l){var sc=document.createElement('script');sc.src='i18n-'+l+'.js';sc.onload=sc.onerror=function(){if(++n===t.length)cb()};document.head.appendChild(sc)})}\nfunction ENPK(){return I18N_PACKS.en||{}}\n"%json.dumps(LANGS)
open(os.path.join(R,'src','i18n','packs.js'),'w',encoding='utf-8',newline='').write(lazy+'var I18N_META='+j(meta)+';\n')
print(' '.join('%s %d'%(k,len(packs[k])) for k in LANGS))
