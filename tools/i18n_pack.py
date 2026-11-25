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
decls=''.join('var %s=%s;\n'%(k.upper(),j(packs[k])) for k in LANGS)
open(os.path.join(R,'src','i18n','packs.js'),'w',encoding='utf-8',newline='').write(
 decls+'var I18N_PACKS={'+','.join('%s:%s'%(k,k.upper()) for k in LANGS)+'};\nvar I18N_META='+j(meta)+';\n')
print(' '.join('%s %d'%(k,len(packs[k])) for k in LANGS))
