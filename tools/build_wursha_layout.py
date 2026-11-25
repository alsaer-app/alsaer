#!/usr/bin/env python3
"""Builds the verse-rectangle layout for the optional Warsh page-image reader from a local copy of the
layout database (layout_kzwarsh_v2.db). Output goes OUTSIDE the repo (default /tmp/wursha-out/layout.json).
Nothing from the pack is committed. Rect = [sura, aya(Hafs-style layout numbering), x, y, w, h] as fractions
of the page image, merged per verse and text line."""
import json,sqlite3,sys,os
db=sys.argv[1] if len(sys.argv)>1 else '/tmp/wursha/x/layout_kzwarsh_v2.db'
out=sys.argv[2] if len(sys.argv)>2 else '/tmp/wursha-out/layout.json'
c=sqlite3.connect(db)
ys={}
for p,l,y in c.execute("select page_number,line,min(y) from words group by 1,2"):
    ys.setdefault(p,{})[l]=y
def pitch(p):
    v=sorted(ys[p].values());d=sorted(b-a for a,b in zip(v,v[1:]) if b-a>0.02)
    return d[len(d)//2] if d else 0.0645
rows=c.execute("select page_number,surah,ayah,line,min(x),max(x+width),min(y) from words where x is not null and width is not null and y is not null group by 1,2,3,4 order by 1,4,5 desc").fetchall()
pages={};pt={p:pitch(p) for p in ys}
for p,s_,a,l,x0,x1,y in rows:
    h=pt[p];pages.setdefault(str(p),[]).append([s_,a,round(x0,4),round(y,4),round(x1-x0,4),round(h,4)])
os.makedirs(os.path.dirname(out),exist_ok=True)
json.dump({'v':1,'pages':pages},open(out,'w'),separators=(',',':'))
print('pages',len(pages),'rects',sum(len(v) for v in pages.values()),'bytes',os.path.getsize(out))
