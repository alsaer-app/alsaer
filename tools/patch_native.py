"""تعديلات على APK جاهز دون إعادة ترجمة Java:
 1) المانيفست: صلاحيتا VIBRATE وUSE_EXACT_ALARM، وversionCode/versionName.
 2) أيقونة الإشعار الصغيرة: سجادة صلاة (تطابق أيقونة التطبيق).
 3) قنوات الإشعار: من v5 إلى v6 لإجبار النظام على إنشائها من جديد بمسار النغمة الصحيح.
الاستخدام: python3 tools/patch_native.py <base.apk> <proj-dir> <versionCode> <versionName>"""
import sys, os, shutil, zipfile, zlib, hashlib, struct
sys.path.insert(0, os.path.dirname(__file__))
from axml import *
BASE, PROJ, VC, VN = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
z = zipfile.ZipFile(BASE)
# 1) manifest
a = AXML(z.read('AndroidManifest.xml'))
PERMS = ['android.permission.VIBRATE', 'android.permission.USE_EXACT_ALARM', 'android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS']
if os.environ.get('ALSAER_NO_EXACT') == '1': PERMS.remove('android.permission.USE_EXACT_ALARM')   # نسخة اختبار: بدون الإذن المقيَّد
for perm in PERMS: a.add_permission(perm)
# 1b) الكلاسات المعدَّلة (native_overlay/classes3.dex) في الحزمة .x: إعادة توجيه المانيفست إليها + خدمة التذكيرات العائمة
OV = os.path.join(os.path.dirname(__file__), '..', 'native_overlay', 'classes3.dex')
if os.path.exists(OV):
    for k, sv in enumerate(a.strings):
        if sv in ('com.ahmedalajmi.alsaer.MainActivity', 'com.ahmedalajmi.alsaer.AlarmReceiver', 'com.ahmedalajmi.alsaer.ActionReceiver', 'com.ahmedalajmi.alsaer.BootReceiver'):
            a.strings[k] = sv.replace('com.ahmedalajmi.alsaer.', 'com.ahmedalajmi.alsaer.x.')
    rc = [i for i in a.elements() if a.elem_name(i) == 'receiver' and a.get_attr_str(i, ATTR_NAME) == 'com.ahmedalajmi.alsaer.x.AlarmReceiver'][0]
    assert a.chunks[rc + 1][0] == END
    st = bytearray(a.chunks[rc][1]); en = bytearray(a.chunks[rc + 1][1])
    struct.pack_into('<I', st, 20, a.sidx('service')); struct.pack_into('<I', en, 20, a.sidx('service'))
    a.chunks[rc + 2:rc + 2] = [[START, st], [END, en]]
    assert a.set_attr_str(rc + 2, ATTR_NAME, 'com.ahmedalajmi.alsaer.x.FloatingReminderService')
    shutil.copy(OV, os.path.join(PROJ, 'classes3.dex'))
    # ودجت الشاشة الرئيسية: مستقبِل + meta-data (مصدر @xml) + موارد في resources.arsc
    WR = os.path.join(os.path.dirname(__file__), '..', 'native_overlay', 'res')
    if os.path.isdir(WR):
        def end_of(i):
            dep = 0
            for j in range(i, len(a.chunks)):
                if a.chunks[j][0] == START: dep += 1
                elif a.chunks[j][0] == END:
                    dep -= 1
                    if dep == 0: return j
        def tag(ch, name): struct.pack_into('<I', ch[1], 20, a.sidx(name))
        rcv = [i for i in a.elements() if a.elem_name(i) == 'receiver' and a.get_attr_str(i, ATTR_NAME) == 'com.ahmedalajmi.alsaer.x.AlarmReceiver'][0]
        boot = [i for i in a.elements() if a.elem_name(i) == 'receiver' and a.get_attr_str(i, ATTR_NAME) == 'com.ahmedalajmi.alsaer.x.BootReceiver'][0]
        ifl = [i for i in a.elements() if a.elem_name(i) == 'intent-filter' and i > boot][0]
        act = ifl + 1; assert a.elem_name(act) == 'action'
        meta = [i for i in a.elements() if a.elem_name(i) == 'meta-data'][0]
        cp = lambda i: [[a.chunks[i][0], bytearray(a.chunks[i][1])], [a.chunks[end_of(i)][0], bytearray(a.chunks[end_of(i)][1])]]
        R = cp(rcv); IF = cp(ifl); AC = cp(act); MD = cp(meta)
        new = [R[0], MD[0], MD[1], IF[0], AC[0], AC[1], IF[1], R[1]]
        pos = end_of(boot) + 1
        a.chunks[pos:pos] = new
        # اضبط الأسماء/القيم على النسخ (فهارسها صارت pos..)
        ri, mi, ai = pos, pos + 1, pos + 4
        assert a.set_attr_str(ri, ATTR_NAME, 'com.ahmedalajmi.alsaer.x.AlsaerWidget')
        assert a.set_attr_bool(ri, 0x01010010, True)
        assert a.set_attr_str(ai, ATTR_NAME, 'android.appwidget.action.APPWIDGET_UPDATE')
        assert a.set_attr_str(mi, ATTR_NAME, 'android.appwidget.provider')
        ok = False
        for o, ns, nm, raw, dt, data in a.attrs(mi):
            if a._attr_id(nm) == 0x01010025:
                struct.pack_into('<I', a.chunks[mi][1], o + 8, 0xFFFFFFFF); struct.pack_into('<I', a.chunks[mi][1], o + 16, 0x7f120002); ok = True
        assert ok
        # موارد
        import subprocess
        os.makedirs(os.path.join(PROJ, 'res'), exist_ok=True)
        for f in ('Wg1.xml', 'Wg2.xml', 'Wg3.xml', 'Wg4.xml', 'Wg5.xml', 'Wg6.xml', 'Wg7.xml'): shutil.copy(os.path.join(WR, f), os.path.join(PROJ, 'res', f))
        tmp_in = os.path.join(PROJ, '_in.arsc'); open(tmp_in, 'wb').write(z.read('resources.arsc'))
        subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), 'add_res.py'), tmp_in, os.path.join(PROJ, 'resources.arsc'),
                        'layout:alsaer_widget:res/Wg1.xml', 'xml:alsaer_widget_info:res/Wg2.xml', 'drawable:alsaer_widget_bg:res/Wg3.xml',
                        'drawable:alsaer_widget_bg_light:res/Wg4.xml', 'drawable:alsaer_widget_bg_gold:res/Wg5.xml', 'drawable:alsaer_widget_bg_black:res/Wg6.xml', 'drawable:alsaer_widget_bg_glass:res/Wg7.xml'], check=True, capture_output=True)
        os.remove(tmp_in)
root = [i for i in a.elements() if a.elem_name(i) == 'manifest'][0]
assert a.set_attr_int(root, ATTR_VERSION_CODE, VC) and a.set_attr_str(root, ATTR_VERSION_NAME, VN)
app = [i for i in a.elements() if a.elem_name(i) == 'application'][0]
assert a.set_attr_bool(app, 0x01010280, False), 'allowBackup attr not found'   # لا نسخ احتياطي تلقائي → لا استرجاع بيانات قديمة بعد إعادة التثبيت
open(os.path.join(PROJ, 'AndroidManifest.xml'), 'wb').write(a.dump())
# 2) small icon
ICON_PATH = ('M5,2.6H19V21.4H5Z M6.4,4V20H17.6V4Z M8.4,18.4V10.6C8.4,7.6 10,5.8 12,5.4C14,5.8 15.6,7.6 15.6,10.6V18.4Z '
             'M12.9,8.3A1.6,1.6 0 1 1 11.5,12A2.1,2.1 0 1 0 12.9,8.3Z M12,14.2L10.9,15.4L12,16.6L13.1,15.4Z '
             + ' '.join('M%s,1.2H%s V2.6H%sZ M%s,21.4H%s V22.8H%sZ' % (x, x + 1, x, x, x + 1, x) for x in (6, 8.4, 10.8, 13.2, 15.6, 18)))
entry = None
for n in z.namelist():
    if n.startswith('res/') and n.endswith('.xml') and b'M12,3a9,9' in z.read(n): entry = n
assert entry, 'icon entry not found'
ic = AXML(z.read(entry)); k = [i for i, s in enumerate(ic.strings) if s.startswith('M12,3a9,9')][0]
ic.strings[k] = ICON_PATH
os.makedirs(os.path.dirname(os.path.join(PROJ, entry)), exist_ok=True)
open(os.path.join(PROJ, entry), 'wb').write(ic.dump())
# 3) dex channel ids
d = bytearray(z.read('classes.dex'))
for old in (b'alsaer_reminders_v5', b'alsaer_reminders_silent_v5', b'alsaer_reminders_system_v5'):
    assert d.count(old) == 1, old
    p = d.find(old); d[p:p + len(old)] = old[:-1] + b'7'
# 4) إعادة توجيه openAppNotificationSettings() إلى شاشة «الموقع» (لا يمكن إعادة ترجمة Java).
#    السلسلة 'APP_NOTIFICATION_SETTINGS' (42 بايت) → 'LOCATION_SOURCE_SETTINGS' (41) مع حشو بايت واحد في حقل الطول (ULEB128 غير مختزل)،
#    وتغيير سلسلة IGNORE_BATTERY.. إلى ما بعدها أبجديًا (M بدل I) كي يبقى ترتيب جدول السلاسل صحيحًا؛ فيرجع زر البطارية إلى تفاصيل التطبيق.
old = b'\x2aandroid.settings.APP_NOTIFICATION_SETTINGS\x00'; assert d.count(old) == 1
new = b'\xa9\x00android.settings.LOCATION_SOURCE_SETTINGS\x00'; assert len(new) == len(old)
p = d.find(old); d[p:p + len(old)] = new
old2 = b'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS'; assert d.count(old2) == 1
p = d.find(old2); d[p:p + len(old2)] = b'android.settings.MGNORE_BATTERY_OPTIMIZATION_SETTINGS'
d[12:32] = hashlib.sha1(bytes(d[32:])).digest()
struct.pack_into('<I', d, 8, zlib.adler32(bytes(d[12:])) & 0xffffffff)
open(os.path.join(PROJ, 'classes.dex'), 'wb').write(d)
print('patched manifest, icon', entry, 'and dex channels')
