import json, sys, unicodedata, collections

SP = sys.argv[1]
LAY = SP + '/data/layout/repo/mushaf/QPC1/'
TAJ = SP + '/data/tajweed/repo/output/tajweed.hafs.uthmani-pause-sajdah.json'
INFO = SP + '/data/qapi/repo/info.json'
QJS = SP + '/proj/assets/public/quran.js'
OUT = sys.argv[2]

js = open(QJS, encoding='utf-8').read()
Q = json.loads(js[js.index('window.QDATA=') + 13:].rstrip().rstrip(';'))
TANZIL = Q['s']; NAMES = Q['n']
taj = json.load(open(TAJ, encoding='utf-8'))
info = json.load(open(INFO))

# ---- rule -> colour class (0 green,1 grey,2 red,3 orange,4 amber,5 blue); priority: lower index wins ties by list order
CLS = {'madd_6': 2, 'madd_muttasil': 3, 'madd_munfasil': 3, 'madd_246': 4, 'madd_2': 4, 'qalqalah': 5,
       'ghunnah': 0, 'idghaam_ghunnah': 0, 'ikhfa': 0, 'ikhfa_shafawi': 0, 'iqlab': 0, 'idghaam_shafawi': 0,
       'idghaam_no_ghunnah': 1, 'idghaam_mutajanisayn': 1, 'idghaam_mutaqaribayn': 1, 'silent': 1, 'hamzat_wasl': 1, 'lam_shamsiyyah': 1}
PRIO = [2, 3, 5, 0, 4, 1]  # who wins when two rules hit the same character

AR_DIG = set('٠١٢٣٤٥٦٧٨٩')
NORM = {}
for c in 'اأإآٱ': NORM[c] = 'ا'
for c in 'يىی': NORM[c] = 'ي'
for c in 'كک': NORM[c] = 'ك'
NORM['ہ'] = 'ه'


def is_base(c):
    if c == 'ـ' or c == ' ' or c == '۞' or c == '۩' or c == '۝' or c == '‏': return False
    if c in AR_DIG: return False
    cat = unicodedata.category(c)
    return cat.startswith('L')


def bases(s):
    """list of (index_in_s) for base letters, normalised letter list"""
    idx = []; let = []
    for i, c in enumerate(s):
        if is_base(c): idx.append(i); let.append(NORM.get(c, c))
    return idx, let


# ---- parse layout
pages = []   # per page: list of lines; line = dict(type, tokens[(kind,text,verse,wordidx)])
verse_tokens = collections.defaultdict(list)  # (s,a) -> list of token refs (page,line,tokenpos)
for p in range(1, 605):
    d = json.load(open(LAY + 'page-%03d.json' % p, encoding='utf-8'))
    assert d['page'] == p
    lines = []
    for l in d['lines']:
        if l['type'] == 'surah-header': lines.append({'t': 'h', 's': int(l['surah'])})
        elif l['type'] == 'basmala': lines.append({'t': 'b'})
        else:
            toks = []
            for w in l['words']:
                s, a, wi = [int(x) for x in w['location'].split(':')]
                for tk in w['word'].split(' '):
                    if not tk: continue
                    if tk == '۞': toks.append({'k': 'hz'})
                    elif all(c in AR_DIG for c in tk): toks.append({'k': 'n', 'x': tk})
                    else:
                        t = {'k': 'w', 'x': tk, 's': s, 'a': a, 'c': [None] * len(tk)}
                        toks.append(t); verse_tokens[(s, a)].append(t)
            lines.append({'t': 't', 'toks': toks})
    pages.append(lines)

# ---- verse presence / word count check
bad_words = 0
for s in range(1, 115):
    for a in range(1, len(TANZIL[s - 1]) + 1):
        tz = TANZIL[s - 1][a - 1].split(' ')
        if len(verse_tokens[(s, a)]) != len(tz): bad_words += 1
print('verses with word-count mismatch vs Tanzil:', bad_words)

# ---- tajweed alignment
ok = fail = 0; failed = []; markmiss = 0; total_ann = 0; colored = 0
for v in taj:
    s, a = v['surah'], v['ayah']
    tz = TANZIL[s - 1][a - 1]
    toks = verse_tokens[(s, a)]
    qs = ''.join(t['x'] for t in toks)
    qpos = []  # (tok, idx) per char of qs
    for t in toks:
        for i in range(len(t['x'])): qpos.append((t, i))
    tb, tl = bases(tz); qb, ql = bases(qs)
    d = len(tl) - len(ql)
    if d > 0 and tl[d:] == ql: pass
    else: d = 0
    if tl[d:] != ql:
        fail += 1; failed.append((s, a, len(tl), len(ql))); continue
    ok += 1
    # cluster owner for each char of tz and qs
    def owners(string, bidx):
        own = [-1] * len(string); cur = -1; bi = {i: n for n, i in enumerate(bidx)}
        for i in range(len(string)):
            if i in bi: cur = bi[i]
            own[i] = cur
        return own
    town = owners(tz, tb); qown = owners(qs, qb)
    # clusters in qs: base index -> list of char positions
    qcl = collections.defaultdict(list)
    for i, o in enumerate(qown): qcl[o].append(i)
    for an in v['annotations']:
        cl = CLS.get(an['rule'])
        if cl is None: continue
        for i in range(an['start'], an['end']):
            total_ann += 1
            c = tz[i]
            if c == ' ': continue
            o = town[i] - d
            if o < 0: continue
            if is_base(c): target = qb[o]
            else:
                target = None
                for j in qcl[o]:
                    if qs[j] == c: target = j; break
                if target is None:
                    markmiss += 1; target = qb[o]
            t, ci = qpos[target]
            prev = t['c'][ci]
            if prev is None or PRIO.index(cl) < PRIO.index(prev): t['c'][ci] = cl
            colored += 1
print('tajweed alignment: verses ok', ok, 'failed', fail, '| annotations', total_ann, 'colored', colored, 'mark fallbacks', markmiss)
print('failed sample', failed[:10])

# ---- hizb (quarter) / juz per page + serialise
def vkey(s, a): return s * 1000 + a
quarters = [vkey(m['start']['chapter'], m['start']['verse']) for m in info['maqras']['references']]
juzs = [vkey(m['start']['chapter'], m['start']['verse']) for m in info['juzs']['references']]
assert len(quarters) == 240 and len(juzs) == 30


def count_le(arr, k):
    n = 0
    for x in arr:
        if x <= k: n += 1
    return n


def ser_tok(t):
    if t['k'] == 'hz': return '۞'
    if t['k'] == 'n': return '' + t['x']
    out = []; run = None
    for ch, c in zip(t['x'], t['c']):
        if c != run:
            if run is not None: out.append('')
            if c is not None: out.append(chr(0xe000 + c))
            run = c
        out.append(ch)
    if run is not None: out.append('')
    return ''.join(out)


P = []; M = []; mism = 0
fatiha_basmala = ' '.join(t['x'] for t in verse_tokens[(1, 1)])
tbl = [(r['start']['chapter'], r['start']['verse']) for r in json.load(open(SP + '/data/qapi/repo/info.json'))['pages']['references']]
for pi, lines in enumerate(pages):
    out = []; first = None
    for ln in lines:
        if ln['t'] == 'h': out.append(['h', ln['s']])
        elif ln['t'] == 'b': out.append(['b'])
        else:
            if first is None:
                for t in ln['toks']:
                    if t['k'] == 'w': first = (t['s'], t['a']); break
            out.append(['t', ' '.join(ser_tok(t) for t in ln['toks'])])
    P.append(out)
    k = vkey(*first)
    q = count_le(quarters, k); j = count_le(juzs, k)
    M.append([j, (q - 1) // 4 + 1, first[0]])
    if tbl[pi] != first: mism += 1
print('pages', len(P), '| first-verse mismatches vs pages table:', mism)
cnt = collections.Counter(len([l for l in p]) for p in P); print('lines per page:', dict(cnt))
print('page142 meta', M[141], '| page1', M[0], '| page604', M[603])
data = {'bsm': fatiha_basmala, 'p': P, 'm': M}
open(OUT, 'w', encoding='utf-8').write('/* مخطط المصحف المدني (١٥ سطرًا): zonetecde/mushaf-layout (QPC1) · ألوان التجويد: cpfair/quran-tajweed (CC BY 4.0) · نص تنزيل (CC BY 3.0) */\nwindow.MUSHAF=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
import os; print('mushaf.js', os.path.getsize(OUT) // 1024, 'KB')
