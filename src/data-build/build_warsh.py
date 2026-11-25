"""يولّد www/warsh.js من بيانات مجمع الملك فهد (مستودع ibnhazm/KFGQPC، ملف warsh/data/warshData_v10.json).
الاستخدام: python3 build_warsh.py <warshData_v10.json> <out/warsh.js>
النص يُنقل حرفياً دون أي تعديل؛ تُحذف فقط المسافات العادية في طرفي الآية."""
import json, sys, re
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf-8'))
assert len(d) == 6214 and all(d[i]['id'] == i + 1 for i in range(len(d))), 'unexpected data'
S = [[] for _ in range(114)]
for x in d:
    assert x['aya_no'] == len(S[x['sura_no'] - 1]) + 1
    S[x['sura_no'] - 1].append(x['aya_text'].strip(' '))
assert [len(s) for s in S].count(0) == 0
# صفحة كل آية = أول رقم في حقل page (الآية الممتدة على صفحتين تُنسب لصفحة بدايتها)
rows = {}
for x in d:
    p = int(str(x['page']).split('-')[0])
    r = rows.setdefault(p, [x['sura_no'], x['aya_no'], x['sura_no'], x['aya_no'], x['jozz']])
    r[2], r[3] = x['sura_no'], x['aya_no']
assert sorted(rows) == list(range(1, 605)), 'missing pages'
P = [rows[i] for i in range(1, 605)]
# البسملة بصيغة ورش مأخوذة من نص الآية ٢٧:٣٠ نفسها (آخر أربع كلمات قبل رقم الآية)
t = re.sub(r'[\s ]*[٠-٩]+\s*$', '', S[26][29]).split(' ')
B = ' '.join(t[-4:])
assert 'بِسْمِ' in B
js = ('/* نص رواية ورش عن نافع وخطها: مجمع الملك فهد لطباعة المصحف الشريف (KFGQPC) — Uthmanic Warsh v10 — منقول عبر مستودع ibnhazm/KFGQPC دون تعديل. */\n'
      'window.WDATA=' + json.dumps({'s': S, 'p': P, 'b': B}, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(out, 'w', encoding='utf-8').write(js)
print('ok', len(js), 'bytes; verses', sum(map(len, S)), 'pages', len(P), 'bsm', B)
