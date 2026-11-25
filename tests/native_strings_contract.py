#!/usr/bin/env python3
"""Every NativeStrings.get(..., "key") used in the Java sources must exist in tools/native_strings.json,
and every language entry must be non-empty. Also: no raw Arabic string literals left in native sources."""
import json,re,glob,sys
tbl=json.load(open('tools/native_strings.json'))
order=tbl['order']; keys=set(tbl['strings'])
for k,v in tbl['strings'].items():
    assert len(v)==len(order) and all(v),f'entry incomplete: {k}'
used=set()
for f in glob.glob('android/app/src/main/java/com/ahmedalajmi/alsaer/*.java'):
    src=open(f,encoding='utf-8').read()
    for m in re.finditer(r'NativeStrings\.get\([^)]*?,\s*"([^"]+)"',src):
        used.add(m.group(1))
        assert m.group(1) in keys,f'{f}: unknown key {m.group(1)}'
    if f.endswith('NativeStrings.java'):continue
    body=re.sub(r'/\*.*?\*/','',src,flags=re.S)
    body=re.sub(r'//[^\n]*','',body)
    assert not re.search(r'"[^"]*[\u0600-\u06FF][^"]*"',body),f'{f}: raw Arabic literal remains'
print('NATIVE_STRINGS_OK',len(used),'keys used,',len(keys),'defined')
