#!/usr/bin/env python3
"""يولّد www/fatwas/* من ملف فتاوى ابن باز (قائمة التقوى، المصدر الأصلي binbaz.org.sa): كل فتوى مرة واحدة في شرائح، وفهرس فئات، وفهرس بحث بالعناوين.
usage: build_fatwas.py /path/to/fatwas.json"""
import json,sys,os,collections
src=sys.argv[1];R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));O=os.path.join(R,'www','fatwas')
os.makedirs(O,exist_ok=True)
for f in os.listdir(O):os.remove(os.path.join(O,f))
d=sorted(json.load(open(src,encoding='utf-8')),key=lambda x:x['id'])
j=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
PRE='https://binbaz.org.sa/fatwas/'
APRE='https://files.zadapps.info/binbaz.org.sa/'  # الصوت: المسار بعد هذه البادئة فقط (6th field)
def aud(x):
    a=(x.get('audio') or '').strip()
    return a[len(APRE):] if a.startswith(APRE) and '..' not in a and '?' not in a and '#' not in a else ''
def strip(a):
    a=a.strip()
    return a[len('الجواب:'):].lstrip() if a.startswith('الجواب:') else a
N=150;chunks=[d[i:i+N] for i in range(0,len(d),N)]
for n,ch in enumerate(chunks):
    rows=[[x['id'],x['title'].strip(),x['question'].strip(),strip(x['answer']),x['link'][len(PRE):] if x['link'].startswith(PRE) else x['link'],aud(x)] for x in ch]
    open(os.path.join(O,'f%03d.json'%n),'w',encoding='utf-8').write(j(rows))
cats=collections.OrderedDict()
for x in d:
    for c in x['categories']:cats.setdefault(c,[]).append(x['id'])
names=sorted(cats,key=lambda c:(-len(cats[c]),c))
import hashlib
V=hashlib.sha256(j([[x['id'],x['title'],x['question'],x['answer']] for x in d]).encode()).hexdigest()[:12]
open(os.path.join(O,'index.json'),'w',encoding='utf-8').write(j({'v':V,'n':len(d),'per':N,'cats':[[c,cats[c]] for c in names],'src':'binbaz.org.sa (قائمة التقوى Altaqwaa)'}))
open(os.path.join(O,'search.json'),'w',encoding='utf-8').write(j([[x['id'],x['title'].strip()] for x in d]))
print(len(d),'fatwas',len(chunks),'chunks',len(names),'cats',V,sum(os.path.getsize(os.path.join(O,f)) for f in os.listdir(O)))
