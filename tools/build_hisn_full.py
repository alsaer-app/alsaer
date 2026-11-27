#!/usr/bin/env python3
"""Builds www/hisn-full.js (all Hisn al-Muslim entries) from two openly licensed datasets, downloaded outside the repo:
  --od   OpenDua catalogue.json (CC BY 4.0): Arabic text, entry numbers, recitation audio URLs
  --mit  asellam/HisnElMuslim hisn.json (MIT): Arabic chapter titles, repeat counts, hadith references
Text always comes from OpenDua. Titles/counts/references are taken from the MIT file only where its item matches an OpenDua item
(normalised text equal or >= 0.9 similar). Prints the differences. Audio fields of the MIT file are never used."""
import json,re,difflib,collections,argparse
ap=argparse.ArgumentParser();ap.add_argument('--od',default='/tmp/od/cat.json');ap.add_argument('--mit',default='/tmp/od/hisn.json')
ap.add_argument('--out',default='www/hisn-full.js');ap.add_argument('--diff',default='/tmp/od/diffs.json');a=ap.parse_args()
H=json.load(open(a.mit,encoding='utf-8'));C=json.load(open(a.od,encoding='utf-8'))
def norm(s):
    s=re.sub('[\u064b-\u065f\u0670\u06d6-\u06ed\u0640]','',s)
    s=re.sub('[إأآٱ]','ا',s).replace('ى','ي').replace('ة','ه').replace('ؤ','و').replace('ئ','ي')
    s=re.sub(r'[^\u0621-\u064a ]',' ',s);return ' '.join(s.split())
keys=list(H.keys());M=[]
for ci,(t,v) in enumerate(H.items()):
    for x in v['Adhkar']:M.append(dict(ci=ci,t=t,text=x['Text'],c=int(x['Count'] or 1),r=(x['Reference'] or '').strip(),n=norm(x['Text'])))
D=[]
for ei,e in enumerate(C['entries']):
    for v in e.get('variations',[]):
        for s in v['steps']:
            if s['type']=='recitation':
                for it in s['items']:D.append(dict(ei=ei,id=it['dua']['id'],text=it['dua']['arabic'],n=norm(it['dua']['arabic'])))
first={}
for j,d in enumerate(D):first.setdefault(d['n'],j)
Dn=[d['n'] for d in D];match={}
for mi,m in enumerate(M):
    if m['n'] in first:match[mi]=first[m['n']];continue
    if not m['n']:continue
    sc,j=max((difflib.SequenceMatcher(None,m['n'],x).ratio(),j) for j,x in enumerate(Dn))
    if sc>=.9:match[mi]=j
byentry=collections.defaultdict(list)
for mi,j in match.items():byentry[D[j]['ei']].append(mi)
num={c['id']:c['number'] for c in C['chapters']}
votes=collections.defaultdict(collections.Counter)
for mi,j in match.items():
    o=M[mi]['ci']+1-num[C['entries'][D[j]['ei']]['chapterId']]
    if o in (0,1):votes[num[C['entries'][D[j]['ei']]['chapterId']]][o]+=1
vo={n:c.most_common(1)[0][0] for n,c in votes.items()}
def off(n):
    if n in vo:return vo[n]
    p=[vo[k] for k in sorted(vo) if k<n];q=[vo[k] for k in sorted(vo) if k>n]
    pp=p[-1] if p else 0;qq=q[0] if q else pp
    return pp if pp==qq else None
TITLE_OVERRIDE={27:'أَذْكَارُ الصَّبَاحِ وَالْمَسَاءِ'}  # OpenDua keeps morning and evening as one chapter
chs=[];flag=[]
for c in C['chapters']:
    n=c['number'];o=off(n)
    t=TITLE_OVERRIDE.get(n) or (keys[n-1+o] if o is not None and 0<=n-1+o<len(keys) else None)
    if t is None:flag.append(n)
    chs.append(dict(n=n,t=t or c['title'],e=[]))
chm={c['n']:c for c in chs}
cntdiff=[]
for ei,e in enumerate(C['entries']):
    x=[]
    for v in e.get('variations',[]):
        for s in v['steps']:
            if s['type']=='recitation':x.append(['r','\n'.join(it['dua']['arabic'] for it in s['items'])])
            elif s.get('arabic'):x.append(['i',s['arabic']])
    for s in e.get('steps',[]):
        if s.get('arabic'):x.append(['i',s['arabic']])
    u=[r['url'] for v in e.get('variations',[]) for s in v['steps'] for r in s.get('recordings',[])]
    ms=[M[i] for i in byentry.get(ei,[])]
    cs=sorted(set(m['c'] for m in ms))
    if len(cs)>1:cntdiff.append(e['sourceReference'])
    ent=dict(s=e['sourceReference'],x=x,c=(cs[0] if len(cs)==1 else 1))
    refs=[]
    for m in ms:
        if m['r'] and m['r'] not in refs:refs.append(m['r'])
    if refs:ent['r']=' ؛ '.join(refs)
    if u:ent['u']=u
    chm[num[e['chapterId']]]['e'].append(ent)
# MIT items with no OpenDua counterpart: items that read like narration/instructions are only listed; the others are placed in their
# chapter right after the previous matched item (book order), flagged m=1 so the app marks them as extra text for review.
NARR=re.compile('قال|كان|يقول|اذا|من فعل|يفعل')
inv={}
for c in C['chapters']:
    o=off(c['number'])
    if o is not None:inv[c['number']-1+o]=c['number']
placed=[];narr=[];lastE={};lastIns={}
eidx={}
for ei,e in enumerate(C['entries']):eidx[ei]=e
for mi,m in enumerate(M):
    if mi in match:
        lastE[m['ci']]=D[match[mi]]['ei'];lastIns.pop(m['ci'],None);continue
    if len(m['n'])>60 and NARR.search(m['n'][:40]):narr.append(mi);continue
    n=inv.get(m['ci'])
    if n is None:narr.append(mi);continue
    ent=dict(s='',x=[['r',m['text']]],c=m['c'],m=1)
    if m['r']:ent['r']=m['r']
    L=chm[n]['e'];pos=0
    if m['ci'] in lastIns and lastIns[m['ci']] in L:pos=L.index(lastIns[m['ci']])+1
    elif m['ci'] in lastE:
        key=eidx[lastE[m['ci']]]['sourceReference']
        for k,x in enumerate(L):
            if x['s']==key:pos=k+1
    L.insert(pos,ent);placed.append(mi);lastIns[m['ci']]=ent
out='/* حصن المسلم الكامل. النص العربي والصوت: OpenDua (CC BY 4.0، مأخوذ من كتاب حصن المسلم للشيخ سعيد بن علي بن وهف القحطاني). عناوين الأبواب والتكرار والمراجع: asellam/HisnElMuslim (MIT). ملف بيانات لا يمس نص المصحف. يُبنى بـ tools/build_hisn_full.py */\nwindow.HSNF='+json.dumps(dict(v=C['dataVersion'],ch=chs),ensure_ascii=False,separators=(',',':'))+';\n'
open(a.out,'w',encoding='utf-8').write(out)
json.dump(dict(unmatched_mit=[dict(chapter=M[i]['t'],text=M[i]['text'][:200],placed=(i in placed)) for i in range(len(M)) if i not in match],
 unmatched_od=[dict(id=D[j]['id'],text=D[j]['text'][:200]) for j in range(len(D)) if j not in set(match.values())],
 chapters_title_flagged=flag,entries_with_differing_counts=cntdiff),open(a.diff,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('placed',len(placed),'narration_not_placed',len(narr))
print('chapters',len(chs),'entries',sum(len(c['e']) for c in chs),'matched',len(match),'MIT unmatched',len(M)-len(match),'flagged titles',flag,'diff counts',cntdiff,'bytes',len(out.encode()))
