#!/usr/bin/env python3
"""docs/i18n/chunks/*.tsv (ar<TAB>en<TAB>fr, machine-translated, NEEDS HUMAN REVIEW) -> src/i18n/extra-{en,fr}.json"""
import glob,json,os,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
en,fr={},{}
for f in sorted(glob.glob(os.path.join(R,'docs/i18n/chunks/*.tsv'))):
    for n,line in enumerate(open(f,encoding='utf-8').read().split('\n'),1):
        if not line.strip():continue
        p=line.split('\t')
        if len(p)!=3 or not all(x.strip() for x in p):sys.exit('bad line %s:%d'%(f,n))
        ar,e,r=p
        if ar in en and (en[ar]!=e or fr[ar]!=r):print('dup differing',ar)
        if ar.startswith('§'):fr[ar]=r;continue
        en[ar]=e;fr[ar]=r
json.dump(en,open(os.path.join(R,'src/i18n/extra-en.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=0,sort_keys=True)
json.dump(fr,open(os.path.join(R,'src/i18n/extra-fr.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=0,sort_keys=True)
print('extra entries',len(en))
