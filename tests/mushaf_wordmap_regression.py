# بوابة المصحف: خريطة «صفحة المصحف ← كلمات تنزيل».
# يمشي على صفحات www/mushaf.js الـ604 بنفس آلة أسطر القارئ (h/b/t، وعلامة نهاية الآية U+E0F0)
# ويثبت أن كلمات كل صفحة — بعد إزالة علامات التجويد PUA وتطبيق norm — تطابق نص Tanzil
# في www/quran.js كلمةً كلمة، لكل آية من الآيات الـ6236، وأرقام علامات الآيات صحيحة.
# أي اختلاف هنا يعني أن تظليل الكلمات في القارئ سيشير لكلمات غلط.
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_js_var(path, name):
    s = (ROOT / path).read_text(encoding='utf-8')
    i = s.index(name + '=') + len(name) + 1
    return json.loads(s[i:].rstrip().rstrip(';'))

Q = load_js_var('www/quran.js', 'window.QDATA')
M = load_js_var('www/mushaf.js', 'window.MUSHAF')

DIAC = re.compile('[ؐ-ًؚ-ٰٟۖ-ۭـ]')
PUA = re.compile('[-]')
NONAR = re.compile('[^ء-ي ]')
WS = re.compile(r'\s+')

def norm(s):
    # مطابق حرفيًا لـ norm في قاعدة تطبيع الحروف (بدون طيّ الحروف المقطعة)
    s = unicodedata.normalize('NFC', str(s))
    s = DIAC.sub('', s)
    s = re.sub('[أإآٱ]', 'ا', s).replace('ى', 'ي').replace('ة', 'ه').replace('ؤ', 'و').replace('ئ', 'ي').replace('ء', '')
    s = NONAR.sub(' ', s)
    return WS.sub(' ', s).strip()

AR_DIGITS = {ord('٠') + i: str(i) for i in range(10)}
def ar_int(s):
    return int(s.translate(AR_DIGITS))

def ayah_words(c, v):
    # كلمات الآية من تنزيل، مع حذف البسملة من أول آية لغير الفاتحة
    ws = str(Q['s'][c - 1][v - 1]).split()
    if v == 1 and c not in (1, 9) and len(ws) > 4:
        if [norm(x) for x in ws[:4]] == ['بسم', 'الله', 'الرحمن', 'الرحيم']:
            ws = ws[4:]
    return [w for w in (norm(x) for x in ws) if w]

assert len(M['p']) == 604, f"pages != 604: {len(M['p'])}"
assert len(M['m']) == 604, f"meta != 604: {len(M['m'])}"
assert len(Q['p']) == 604, f"QDATA pages != 604: {len(Q['p'])}"
assert sum(len(x) for x in Q['s']) == 6236, 'QDATA ayah count != 6236'

# فروق رسم موثّقة بين مصحف المدينة (mushaf.js) ونص تنزيل، تحقّقنا منها يدويًا على النسختين:
#  - 5:52: المدينة يكتب «دَائِرَ ةٌ» كلمتين وتنزيل «دَآئِرَةٌ» كلمة واحدة — ندمجهما قبل المقارنة.
#  - 11:13: المدينة «افْتَرَاهُ» بالألف وتنزيل «ٱفْتَرَىٰهُ» بالياء — النطق واحد.
# القائمة مغلقة: أي اختلاف جديد يُسقط الاختبار.
MERGE_WORDS = {(5, 52): (11,)}
ALT_RASM = {(11, 13): {2: 'افتراه'}}

def reconcile(c, v, pending, exp):
    if (c, v) in MERGE_WORDS:
        for i in MERGE_WORDS[(c, v)]:
            assert pending[i] == 'داير' and pending[i + 1] == 'ه', f'{c}:{v}: unexpected tokens at merge point {i}'
            pending = pending[:i] + [pending[i] + pending[i + 1]] + pending[i + 2:]
    if (c, v) in ALT_RASM:
        for i, alt in ALT_RASM[(c, v)].items():
            assert pending[i] == alt and exp[i] != alt, f'{c}:{v}: alt rasm changed'
            pending = pending[:i] + [exp[i]] + pending[i + 1:]
    return pending

errors = []
def err(msg):
    errors.append(msg)
    if len(errors) <= 12:
        print('MISMATCH:', msg)

c, v = None, None          # السورة/الآية الجاريان أثناء المشي
pending = []               # كلمات الآية الجارية (مُوحّدة)
seen_ayahs = set()
total_words = 0

for p in range(1, 605):
    start = Q['p'][p - 1]
    c, v = start[0], start[1]
    if M['m'][p - 1][2] != c:
        err(f'page {p}: meta surah {M["m"][p-1][2]} != page-start surah {c}')
    for line in M['p'][p - 1]:
        kind = line[0]
        if kind == 'h':
            if int(line[1]) != c or v != 1:
                err(f'page {p}: surah header {line[1]} at state {c}:{v}')
            c, v = int(line[1]), 1
            continue
        if kind == 'b':
            continue
        if kind != 't':
            err(f'page {p}: unknown line kind {kind!r}')
            continue
        for tok in line[1].split(' '):
            if not tok:
                continue
            if tok[0] == '' or (tok and ord(tok[0]) == 0xE0F0):
                num = ar_int(tok[1:])
                if num != v:
                    err(f'page {p}: ayah marker {num} but expected {v} (surah {c})')
                exp = ayah_words(c, v)
                if reconcile(c, v, pending, exp) != exp:
                    err(f'page {p} {c}:{v}: mushaf words {pending[:6]}... != tanzil {exp[:6]}... ({len(pending)} vs {len(exp)})')
                total_words += len(reconcile(c, v, pending, exp))
                if (c, v) in seen_ayahs:
                    err(f'ayah {c}:{v} seen twice (page {p})')
                seen_ayahs.add((c, v))
                pending = []
                v += 1
                if v > len(Q['s'][c - 1]):
                    c, v = c + 1, 1
            else:
                n = norm(PUA.sub('', tok))
                if n:
                    pending.append(n)

# كل آية ظهرت بالضبط مرة واحدة
all_ayahs = {(ci + 1, vi + 1) for ci, s in enumerate(Q['s']) for vi in range(len(s))}
missing = all_ayahs - seen_ayahs
extra = seen_ayahs - all_ayahs
if missing:
    err(f'{len(missing)} ayahs never closed by a marker, e.g. {sorted(missing)[:5]}')
if extra:
    err(f'{len(extra)} unknown ayahs, e.g. {sorted(extra)[:5]}')
if pending:
    err(f'page walk ended with {len(pending)} unclosed words at {c}:{v}')

exp_words = sum(len(ayah_words(c, v)) for c, v in sorted(all_ayahs))
if total_words != exp_words:
    err(f'total words {total_words} != expected {exp_words} (logical words after verified merges)')

if errors:
    print(f'FAIL: {len(errors)} mismatch(es)')
    sys.exit(1)
print(f'OK: 604 pages, {len(seen_ayahs)} ayahs, {total_words} words — mushaf page map matches Tanzil word-for-word')
