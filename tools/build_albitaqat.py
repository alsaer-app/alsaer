#!/usr/bin/env python3
"""Builds www/albitaqat.js from the public data of the Al-Bitaqat project.
Content: Prof. Yasser bin Ismail Radi, albitaqat.com. All rights are reserved to the author;
this data is used with credit under the app owner's responsibility (see docs/DATA_SOURCES.md).
Text is copied verbatim from the source JSON; nothing is edited, merged or corrected.
Source: https://github.com/rn0x/albitaqat_quran (data/quran_cards.json). Removable: delete www/albitaqat.js and the cards-sura code."""
import json,sys,urllib.request
U='https://raw.githubusercontent.com/rn0x/albitaqat_quran/main/data/quran_cards.json'
src=sys.argv[1] if len(sys.argv)>1 else None
d=json.load(open(src,encoding='utf-8')) if src else json.load(urllib.request.urlopen(U))
K=['ayahs_count','name_meaning','name_reason','other_names','general_purpose','revelation_reason','virtue','occasions']
titles=[d['surahs'][0]['card_data'][k]['title'] for k in K]
rows=[]
for s in d['surahs']:
    c=s['card_data'];m=s['media']
    rows.append([s['number']]+[c[k]['content'] for k in K]+[m['audio'],m['pdf'],m['youtube_video_id']])
assert len(rows)==114 and [r[0] for r in rows]==list(range(1,115))
out='window.ALBQ='+json.dumps({'author':d['author'],'site':'https://albitaqat.com/','titles':titles,'rows':rows},ensure_ascii=False,separators=(',',':'))+';\n'
open('www/albitaqat.js','w',encoding='utf-8').write(out)
print('wrote www/albitaqat.js',len(out))
