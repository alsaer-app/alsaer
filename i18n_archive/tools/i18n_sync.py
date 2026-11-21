#!/usr/bin/env python3
"""أداة وقت التطوير: تقرير الترجمات الناقصة لكل لغة (مقارنةً بالإنجليزية) وملف TSV لإكمالها.
الاستخدام: python3 tools/i18n_sync.py            -> تقرير تغطية
           python3 tools/i18n_sync.py fr          -> يكتب i18n_missing_fr.tsv (العربية<TAB>الإنجليزية<TAB>)
           python3 tools/i18n_sync.py fr file.tsv -> يدمج الترجمات المكتملة في src/i18n/fr.json
إن توفّرت argostranslate محليًا تُملأ الفراغات آليًا؛ وإلا تبقى الإنجليزية احتياطًا وتُسجَّل اللغة الناقصة وقت التشغيل."""
import json,sys,os,glob
D=os.path.join(os.path.dirname(__file__),'..','src','i18n')
ld=lambda c:json.load(open(os.path.join(D,c+'.json'),encoding='utf-8'))
en=ld('en');langs=[os.path.basename(f)[:-5] for f in sorted(glob.glob(D+'/*.json')) if not os.path.basename(f).startswith('_') and not f.endswith('/en.json')]
a=sys.argv[1:]
if not a:
    print('lang\tkeys\tcoverage');
    for c in langs:
        d=ld(c);print('%s\t%d/%d\t%.1f%%'%(c,len([k for k in en if k in d]),len(en),100*len([k for k in en if k in d])/len(en)))
elif len(a)==1:
    d=ld(a[0]);m=[k for k in en if k not in d]
    open('i18n_missing_%s.tsv'%a[0],'w',encoding='utf-8').write(''.join('%s\t%s\t\n'%(k,en[k]) for k in m));print(len(m),'missing')
else:
    d=ld(a[0]);n=0
    for l in open(a[1],encoding='utf-8'):
        p=l.rstrip('\n').split('\t')
        if len(p)>=3 and p[2].strip():d[p[0]]=p[2].strip();n+=1
    json.dump(d,open(os.path.join(D,a[0]+'.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=0);print('merged',n)
