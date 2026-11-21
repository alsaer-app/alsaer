import zipfile, struct, hashlib, sys, os, subprocess
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import pkcs12

SP = sys.argv[1]
SRC = SP + '/base.apk'; PATCH = SP + '/proj'
TMP = SP + '/out/stage1.apk'; V1 = SP + '/out/stage2.apk'; ALIGNED = SP + '/out/stage3.apk'; OUT = sys.argv[2]
KS = SP + '/out/alsaer-release-key.p12'
ALIAS = 'alsaer-release'
PASSWORD = os.environ.get('ALSAER_KEYSTORE_PASSWORD')
if not PASSWORD: raise SystemExit('Set ALSAER_KEYSTORE_PASSWORD before building a release APK')


def write_zip(dst, entries):
    with zipfile.ZipFile(dst, 'w') as z:
        for name, data, stored in entries:
            zi = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0)); zi.create_system = 0
            zi.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
            if stored:
                pad = (-(z.fp.tell() + 30 + len(name.encode()))) % 4
                if pad:
                    pad = pad + 4 if pad < 4 else pad
                    zi.extra = struct.pack('<HH', 0xd935, pad - 4) + b'\0' * (pad - 4)
            z.writestr(zi, data)


src = zipfile.ZipFile(SRC); ents = []; have = set()
for i in src.infolist():
    n = i.filename
    if n.startswith('META-INF/') and n.endswith(('.RSA', '.SF', 'MANIFEST.MF')): continue
    if n.endswith('/'): continue
    pf = os.path.join(PATCH, n)
    data = open(pf, 'rb').read() if os.path.exists(pf) else src.read(n)
    ents.append((n, data, i.compress_type == 0)); have.add(n)
for root, _, fs in os.walk(PATCH):
    for f in fs:
        full = os.path.join(root, f); n = os.path.relpath(full, PATCH).replace(os.sep, '/')
        if n in have or (n.startswith('META-INF/') and n.endswith(('.RSA', '.SF', 'MANIFEST.MF'))): continue
        ents.append((n, open(full, 'rb').read(), False))
write_zip(TMP, ents)

if not os.path.exists(KS):
    raise SystemExit('Place alsaer-release-key.p12 in the build folder out/')
subprocess.run(['jarsigner', '-keystore', KS, '-storepass', PASSWORD, '-keypass', PASSWORD, '-sigalg', 'SHA256withRSA',
                '-digestalg', 'SHA-256', '-signedjar', V1, TMP, ALIAS], check=True, capture_output=True)
z = zipfile.ZipFile(V1)
ents = [(i.filename, z.read(i.filename), i.compress_type == 0 or i.filename == 'resources.arsc') for i in z.infolist() if not i.filename.endswith('/')]
write_zip(ALIGNED, ents)

raw = open(ALIGNED, 'rb').read()
eocd = raw.rfind(b'PK\x05\x06'); cd_off = struct.unpack_from('<I', raw, eocd + 16)[0]
s1 = raw[:cd_off]; s3 = raw[cd_off:eocd]; s4 = bytearray(raw[eocd:])
digs = []
for sec in (s1, s3, bytes(s4)):
    for i in range(0, len(sec), 1 << 20):
        c = sec[i:i + (1 << 20)]; digs.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(c)) + c).digest())
top = hashlib.sha256(b'\x5a' + struct.pack('<I', len(digs)) + b''.join(digs)).digest()
key, cert, _ = pkcs12.load_key_and_certificates(open(KS, 'rb').read(), PASSWORD.encode('utf-8'))
cder = cert.public_bytes(serialization.Encoding.DER)
spki = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
lp = lambda b: struct.pack('<I', len(b)) + b
ALGO = 0x0103
dg = lp(struct.pack('<I', ALGO) + lp(top))
signed = lp(dg) + lp(lp(cder)) + lp(b'')
sig = key.sign(signed, padding.PKCS1v15(), hashes.SHA256())
signer = lp(signed) + lp(lp(struct.pack('<I', ALGO) + lp(sig))) + lp(spki)
value = lp(lp(signer))
pair = struct.pack('<Q', 4 + len(value)) + struct.pack('<I', 0x7109871a) + value
blk = struct.pack('<Q', len(pair) + 24) + pair + struct.pack('<Q', len(pair) + 24) + b'APK Sig Block 42'
struct.pack_into('<I', s4, 16, cd_off + len(blk))
open(OUT, 'wb').write(s1 + blk + s3 + bytes(s4))
print('built', OUT, os.path.getsize(OUT))
