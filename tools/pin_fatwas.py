#!/usr/bin/env python3
"""Adds per-file sha256 digests ('h') to www/fatwas/index.json for every chunk and search.json.
The app checks each downloaded chunk against these digests before using or caching it.
Run after tools/build_fatwas.py (it is deterministic; running twice changes nothing)."""
import json,hashlib,os,glob
O=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','www','fatwas')
p=os.path.join(O,'index.json');d=json.load(open(p,encoding='utf-8'))
h={}
for f in sorted(glob.glob(os.path.join(O,'f[0-9][0-9][0-9].json')))+[os.path.join(O,'search.json')]:
    h[os.path.basename(f)]=hashlib.sha256(open(f,'rb').read()).hexdigest()
d['h']=h
open(p,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,separators=(',',':')))
print(len(h),'digests')
