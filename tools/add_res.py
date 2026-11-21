"""يضيف موارد ملفية (layout / xml / drawable) إلى resources.arsc جاهز دون aapt (يلزم aapt2 فقط لترجمة الـXML نفسه).
الاستخدام: python3 tools/add_res.py <in.arsc> <out.arsc> <type:key:path> ...
مثال: layout:alsaer_widget:res/wg1.xml   → المورد يأخذ رقم المدخل التالي في النوع (يطبع الأرقام).
يدعم مجمّع نصوص UTF-8 بلا styles، وأنواعًا غير sparse. المدخل يوضع في إعداد «الافتراضي» وتبقى بقية الإعدادات NO_ENTRY."""
import sys, struct

SRC, DST, SPECS = sys.argv[1], sys.argv[2], [a.split(':', 2) for a in sys.argv[3:]]
d = open(SRC, 'rb').read()
U16 = lambda b, o: struct.unpack_from('<H', b, o)[0]
U32 = lambda b, o: struct.unpack_from('<I', b, o)[0]
assert U16(d, 0) == 2
gp = U16(d, 2); gsz = U32(d, gp + 4); pk = gp + gsz
assert U16(d, gp) == 1 and U16(d, pk) == 0x200
pk_hs, pk_sz = U16(d, pk + 2), U32(d, pk + 4)
ts_off, _, ks_off, _ = struct.unpack_from('<IIII', d, pk + 12 + 256)
assert ts_off == pk_hs


def read_pool(b, base):
    hs, size = U16(b, base + 2), U32(b, base + 4)
    cnt, sc, fl, ss, st = struct.unpack_from('<IIIII', b, base + 8)
    assert sc == 0 and st == 0, 'يدعم دون styles'
    strs = []
    for i in range(cnt):
        o = base + ss + U32(b, base + hs + 4 * i)
        if not fl & 0x100:
            l = U16(b, o); strs.append(bytes(b[o + 2:o + 2 + 2 * l]).decode('utf-16le')); continue
        l = b[o]; o += 2 if l & 0x80 else 1
        l2 = b[o]; o += 1
        if l2 & 0x80: l2 = ((l2 & 0x7f) << 8) | b[o]; o += 1
        strs.append(bytes(b[o:o + l2]).decode('utf-8', 'replace'))
    return strs, size


def enc8(s):
    b = s.encode('utf-8'); ln = lambda x: bytes([x]) if x < 128 else bytes([0x80 | (x >> 8), x & 0xff])
    return ln(len(s)) + ln(len(b)) + b + b'\0'


def append_pool(b, base, new):
    hs, size = U16(b, base + 2), U32(b, base + 4)
    cnt, sc, fl, ss, st = struct.unpack_from('<IIIII', b, base + 8)
    assert fl & 0x100 and sc == 0 and st == 0
    offs = [U32(b, base + hs + 4 * i) for i in range(cnt)]
    blob = bytearray(b[base + ss:base + size])
    while len(blob) % 4: blob += b'\0'
    add = []
    for s in new:
        add.append(len(blob)); blob += enc8(s)
    while len(blob) % 4: blob += b'\0'
    n = cnt + len(new); nss = hs + 4 * n
    head = bytearray(b[base:base + hs]); struct.pack_into('<I', head, 8, n); struct.pack_into('<I', head, 20, nss)
    out = head + b''.join(struct.pack('<I', o) for o in offs + add) + blob
    struct.pack_into('<I', out, 4, len(out))
    return bytes(out), cnt


types, tsz = read_pool(d, pk + ts_off)
keys, ksz = read_pool(d, pk + ks_off)
gstr, _ = read_pool(d, gp)
# 1) النصوص: مسارات الملفات في المجمّع العام، والمفاتيح في مجمّع المفاتيح
new_global, g0 = append_pool(d, gp, [s[2] for s in SPECS])
new_keys, k0 = append_pool(d, pk + ks_off, [s[1] for s in SPECS])
# 2) قطع الحزمة
body_start = pk + ks_off + ksz; end = pk + pk_sz
by_type = {}
for i, (t, key, path) in enumerate(SPECS):
    by_type.setdefault(t, []).append((key, g0 + i, k0 + i))
p = body_start; out_chunks = []; ids = []
while p < end:
    t, hs, sz = U16(d, p), U16(d, p + 2), U32(d, p + 4); c = bytes(d[p:p + sz]); tid = d[p + 8]
    tname = types[tid - 1] if t in (0x201, 0x202) else None
    if tname in by_type:
        add = by_type[tname]; k = len(add)
        if t == 0x202:
            cnt = U32(c, 12); c = bytearray(c); struct.pack_into('<I', c, 12, cnt + k); c += b'\0' * (4 * k); struct.pack_into('<I', c, 4, len(c)); c = bytes(c)
            for j, (key, gi, ki) in enumerate(add): ids.append((tname, key, '0x7f%02x%04x' % (tid, cnt + j)))
        else:
            assert not (c[9] & 0x03), 'sparse/offset16 غير مدعوم'
            cnt, es = struct.unpack_from('<II', c, 12); hdr = bytearray(c[:es]); old_entries = c[es:]
            cfgsz = U32(c, 20); dflt = bytes(c[24:20 + cfgsz]) == b'\0' * (cfgsz - 4)
            struct.pack_into('<II', hdr, 12, cnt + k, es + 4 * k)
            new_offs = []; data = b''
            for (key, gi, ki) in add:
                if dflt:
                    new_offs.append(len(old_entries) + len(data)); data += struct.pack('<HHI', 8, 0, ki) + struct.pack('<HBBI', 8, 0, 3, gi)
                else: new_offs.append(0xFFFFFFFF)
            hdr += b''.join(struct.pack('<I', o) for o in new_offs)
            # الأوفستات القديمة تقع في hdr بعد رأس النوع؛ ندرج الجديدة بعدها (hdr كان طوله es بالضبط)
            c = bytes(hdr) + bytes(old_entries) + data
            c = bytearray(c); struct.pack_into('<I', c, 4, len(c)); c = bytes(c)
    out_chunks.append(c); p += sz
pkg_head = bytearray(d[pk:pk + pk_hs]) + d[pk + ts_off:pk + ts_off + tsz]
pkg = bytes(pkg_head) + new_keys + b''.join(out_chunks)
pkg = bytearray(pkg); struct.pack_into('<I', pkg, 4, len(pkg))
out = bytearray(d[:gp]) + new_global + pkg
struct.pack_into('<I', out, 4, len(out))
open(DST, 'wb').write(out)
for i in ids: print(*i)
print('ok', len(d), '->', len(out))
