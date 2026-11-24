#!/usr/bin/env python3
"""Generate src/i18n/packs.js from i18n_archive/{en,fr}.json (phase 1 languages only)."""
import json,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def L(n):return json.load(open(os.path.join(R,'i18n_archive',n+'.json'),encoding='utf-8'))
en,fr=L('en'),L('fr')
for k,d in (('en',en),('fr',fr)):
    x=os.path.join(R,'src','i18n','extra-'+k+'.json')
    if os.path.exists(x):d.update(json.load(open(x,encoding='utf-8')))
meta=json.load(open(os.path.join(R,'i18n_archive','_meta.json'),encoding='utf-8'))
meta={k:meta[k] for k in ('ar','en','fr')}
j=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'),sort_keys=True)
open(os.path.join(R,'src','i18n','packs.js'),'w',encoding='utf-8',newline='').write(
 'var EN='+j(en)+';\nvar FR='+j(fr)+';\nvar I18N_PACKS={en:EN,fr:FR};\nvar I18N_META='+j(meta)+';\n')
print('en',len(en),'fr',len(fr))
