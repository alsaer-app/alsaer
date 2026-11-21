"""يضيف أسماء تشغيل (label) مترجمة للتطبيق في resources.arsc دون aapt.
الاستخدام: python3 tools/patch_arsc.py <in.arsc> <out.arsc> <i18n-dir>
المبدأ: لكل لغة نضيف نصًا جديدًا إلى مجمّع النصوص العام ثم قطعة ResTable_type لنوع string بإعداد اللغة،
ولا تحوي إلا مدخلات app_name و title_activity_main (الباقي NO_ENTRY فيرجع للافتراضي العربي)."""
import sys, struct, json, os
SRC, DST, I18N = sys.argv[1], sys.argv[2], sys.argv[3]
d = bytearray(open(SRC, 'rb').read())
U16 = lambda o: struct.unpack_from('<H', d, o)[0]; U32 = lambda o: struct.unpack_from('<I', d, o)[0]
assert U16(0) == 2
gp = U16(2)                                  # بداية مجمّع النصوص العام
assert U16(gp) == 1
g_hs, g_sz = U16(gp + 2), U32(gp + 4)
g_cnt, g_sc, g_fl, g_ss, g_st = struct.unpack_from('<IIIII', d, gp + 8)
assert g_fl & 0x100 and g_sc == 0 and g_st == 0, 'يدعم UTF-8 دون styles فقط'
pk = gp + g_sz; assert U16(pk) == 0x200
pk_hs, pk_sz = U16(pk + 2), U32(pk + 4)
ts_off, ts_n, ks_off, ks_n = struct.unpack_from('<IIII', d, pk + 12 + 256)
def pool_strings(base, utf8):
    cnt, sc, fl, ss, st = struct.unpack_from('<IIIII', d, base + 8); hs = U16(base + 2); out = []
    for i in range(cnt):
        so = base + ss + U32(base + hs + 4 * i)
        if utf8:
            o = so; l = d[o]; o += 2 if l & 0x80 else 1
            l2 = d[o]; o += 1
            if l2 & 0x80: l2 = ((l2 & 0x7f) << 8) | d[o + 1]; o += 2 - 1 + 1 - 1
            out.append(bytes(d[o:o + l2]).decode('utf-8', 'replace') if True else '')
        else:
            l = U16(so); out.append(bytes(d[so + 2:so + 2 + 2 * l]).decode('utf-16le'))
    return out
# أنواع (UTF-16 عادة) ومفاتيح
types = pool_strings(pk + ts_off, bool(U32(pk + ts_off + 16) & 0x100)); keys = pool_strings(pk + ks_off, bool(U32(pk + ks_off + 16) & 0x100))
str_tid = types.index('string') + 1
want = {keys.index(k) for k in ('app_name', 'title_activity_main') if k in keys}
assert want, 'لا مفاتيح label'
# اجمع قطع النوع string
p = pk + pk_hs; end = pk + pk_sz; chunks = []
while p < end:
    t, hs, sz = U16(p), U16(p + 2), U32(p + 4); chunks.append((p, t, hs, sz)); p += sz
assert p == end
default_type = None; last_str_end = None; spec_flags = None
for (p, t, hs, sz) in chunks:
    if t == 0x0202 and d[p + 8] == str_tid: spec_flags = p
    if t == 0x0201 and d[p + 8] == str_tid:
        last_str_end = p + sz
        cfgsz = U32(p + 20)
        if bytes(d[p + 24:p + 20 + cfgsz]) == b'\0' * (cfgsz - 4): default_type = p
assert default_type is not None and last_str_end
ec, es = struct.unpack_from('<II', d, default_type + 12)
ents = {}   # key_idx -> (entry_index, res value data)
for i in range(ec):
    off = U32(default_type + 84 + 4 * i)
    if off == 0xFFFFFFFF: continue
    eo = default_type + es + off; ksi = U32(eo + 4)
    if ksi in want: ents[ksi] = (i, eo)
assert len(ents) == len(want), ents
# ترجمات الاسم
meta = json.load(open(os.path.join(I18N, '_meta.json'), encoding='utf-8'))
names = {}
for c in meta:
    if c == 'ar': continue
    f = os.path.join(I18N, c + '.json'); dd = json.load(open(f, encoding='utf-8'))
    v = dd.get('السائر إلى الله')
    if v: names[c] = v
# 1) أضف النصوص إلى المجمّع العام (UTF-8)
def enc8(s):
    b = s.encode('utf-8'); n = len(s)
    assert n < 128 and len(b) < 128 or True
    def ln(x): return bytes([x]) if x < 128 else bytes([0x80 | (x >> 8), x & 0xff])
    return ln(n) + ln(len(b)) + b + b'\0'
new_strings = list(names.items()); base_idx = g_cnt; idx_of = {}
pool_data = bytearray(d[gp + g_hs + 4 * g_cnt:gp + g_sz])          # من بداية الأوفست حتى النهاية (offsets+strings)
offs = [U32(gp + g_hs + 4 * i) for i in range(g_cnt)]
strings_blob = bytearray(d[gp + g_ss:gp + g_sz])
while len(strings_blob) % 4: strings_blob += b'\0'
add_offs = []
for c, v in new_strings:
    add_offs.append(len(strings_blob)); idx_of[c] = base_idx + len(add_offs) - 1; strings_blob += enc8(v)
while len(strings_blob) % 4: strings_blob += b'\0'
n_total = g_cnt + len(new_strings)
new_hs_part = bytearray(d[gp:gp + g_hs]); struct.pack_into('<I', new_hs_part, 8, n_total)
new_ss = g_hs + 4 * n_total; struct.pack_into('<I', new_hs_part, 20, new_ss)
offs_blob = b''.join(struct.pack('<I', o) for o in offs + add_offs)
new_pool = bytearray(new_hs_part) + offs_blob + strings_blob
struct.pack_into('<I', new_pool, 4, len(new_pool))
# 2) قطع النوع الجديدة
def cfg_for(lang):
    c = bytearray(64); struct.pack_into('<I', c, 0, 64); c[8] = ord(lang[0]); c[9] = ord(lang[1]); return bytes(c)
type_chunks = bytearray()
for c in names:
    es2 = 84 + 4 * ec; body = bytearray()
    offsets = [0xFFFFFFFF] * ec; ordered = sorted(ents.items(), key=lambda kv: kv[1][0])
    for ksi, (ei, eo) in ordered:
        offsets[ei] = len(body)
        body += struct.pack('<HHI', 8, 0, ksi) + struct.pack('<HBBI', 8, 0, 3, idx_of[c])
    ch = bytearray(struct.pack('<HHIBBHII', 0x0201, 84, 0, str_tid, 0, 0, ec, es2)) + cfg_for(c)
    ch += b''.join(struct.pack('<I', o) for o in offsets) + body
    struct.pack_into('<I', ch, 4, len(ch)); type_chunks += ch
# 3) أعلام الإعداد في typeSpec (اللغة قد تغيّر هذه المدخلات)
if spec_flags is not None:
    for ksi, (ei, eo) in ents.items():
        o = spec_flags + 16 + 4 * ei; struct.pack_into('<I', d, o, U32(o) | 0x4)
# 4) أعد تجميع الملف
out = bytearray(d[:gp]) + new_pool + bytearray(d[gp + g_sz:last_str_end]) + type_chunks + bytearray(d[last_str_end:])
delta = len(new_pool) - g_sz
new_pk = pk + delta
struct.pack_into('<I', out, new_pk + 4, pk_sz + len(type_chunks))
struct.pack_into('<I', out, 4, len(out))
open(DST, 'wb').write(out)
print('ok', len(d), '->', len(out), 'locales', sorted(names))
