#!/usr/bin/env python3
"""Build www/index.html from src/ (manifest order). Usage: build_web.py [--check]"""
import os,sys,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man=json.load(open(os.path.join(ROOT,'src','manifest.json'),encoding='utf-8'))
out=''.join(e['lit'] if 'lit' in e else open(os.path.join(ROOT,'src',e['file']),encoding='utf-8',newline='').read() for e in man)
dst=os.path.join(ROOT,'www','index.html')
if '--check' in sys.argv:
    cur=open(dst,encoding='utf-8',newline='').read();print('IDENTICAL' if cur==out else 'DIFFERENT');sys.exit(0 if cur==out else 1)
open(dst,'w',encoding='utf-8',newline='').write(out)
print('built',len(out),'bytes from',len(man),'segments')
