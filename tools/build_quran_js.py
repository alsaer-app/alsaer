#!/usr/bin/env python3
"""يبني www/quran.js من بيانات مجمع الملك فهد (حفص v18) دون أي تعديل على حروف النص.
الاستعمال: python3 tools/build_quran_js.py hafsData_v18.json
المصدر: github.com/thetruetruth/quran-data-kfgqpc (مرآة) hafs/data/hafsData_v18.json، sha256 المتوقع أدناه.
الحذف الوحيد: لاحقة رقم الآية (NBSP + أرقام هندية) في آخر كل aya_text، لأن القارئ يرسم رقم الآية بنفسه.
أسماء السور وجدول الصفحات (n, p) تُحفظان من الملف الحالي كما هما."""
import hashlib, json, re, sys, collections
SRC_SHA = '5d8bb91726e482839d0057633cb1973031e4d706fa9604eea5e08892f20ba140'
raw = open(sys.argv[1], 'rb').read()
assert hashlib.sha256(raw).hexdigest() == SRC_SHA, 'source hash mismatch'
rows = json.loads(raw.decode('utf-8'))
assert len(rows) == 6236
cur = open('www/quran.js', encoding='utf-8').read()
old = json.loads(cur[cur.index('window.QDATA=') + 13:].rstrip().rstrip(';'))
by = collections.defaultdict(list)
for r in rows:
    t = r['aya_text']
    m = re.search(r'\u00a0[\u0660-\u0669]+$', t)
    assert m and int(t[m.start()+1:].translate(str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789'))) == r['aya_no']
    by[r['sora']].append((r['aya_no'], t[:m.start()]))
s = []
for i in range(114):
    v = by[i + 1]
    assert [a for a, _ in v] == list(range(1, len(v) + 1)) and len(v) == len(old['s'][i]), i
    s.append([t for _, t in v])
assert sum(map(len, s)) == 6236
HDR = ('/* نص المصحف: مجمع الملك فهد لطباعة المصحف الشريف (KFGQPC)، رواية حفص، بيانات النسخة 18 (2021-10-25)، منقول حرفياً دون تعديل عدا حذف رقم الآية في آخرها. '
       'نسخة البيانات من مرآة طرف ثالث (thetruetruth/quran-data-kfgqpc) وليست من موقع المجمع مباشرة. '
       'جدول الصفحات (المصحف المدني ٦٠٤ صفحة): fawazahmed0/quran-api (Unlicense). */\n')
out = HDR + 'window.QDATA=' + json.dumps({'n': old['n'], 's': s, 'p': old['p']}, separators=(',', ':'), ensure_ascii=False) + ';\n'
open('www/quran.js', 'w', encoding='utf-8').write(out)
print('written', len(out), hashlib.sha256(out.encode()).hexdigest())
