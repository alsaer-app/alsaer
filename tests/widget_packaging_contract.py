"""Static Gradle packaging contract. Device rendering still needs a launcher test."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
A = '{http://schemas.android.com/apk/res/android}'
manifest = ET.parse(ROOT / 'android/app/src/main/AndroidManifest.xml').getroot()
app = manifest.find('application')
receiver = next(x for x in app.findall('receiver') if x.get(A+'name') == '.AlsaerWidget')
assert receiver.get(A+'exported') == 'false'
assert receiver.find('intent-filter/action').get(A+'name') == 'android.appwidget.action.APPWIDGET_UPDATE'
assert receiver.find('meta-data').get(A+'resource') == '@xml/alsaer_widget_info'
res = ROOT / 'android/app/src/main/res'
for src in (ROOT / 'widget_res/res').rglob('*.xml'):
    dest = res / src.relative_to(ROOT / 'widget_res/res')
    assert dest.read_bytes() == src.read_bytes(), f'Widget XML changed: {dest}'
provider = ET.parse(res / 'xml/alsaer_widget_info.xml').getroot()
assert provider.get(A+'initialLayout') == '@layout/alsaer_widget'
layout = ET.parse(res / 'layout/alsaer_widget.xml').getroot()
ids = {e.get(A+'id', '').split('/')[-1] for e in layout.iter()}
java = (ROOT / 'android/app/src/main/java/com/ahmedalajmi/alsaer/AlsaerWidget.java').read_text()
used = set(re.findall(r'id\(c, "(wg_\w+)"\)', java)) | {f'wg_p{i}' for i in range(1, 6)}
assert used <= ids, used - ids
service = next(x for x in app.findall('service') if x.get(A+'name') == '.FloatingReminderService')
assert service.get(A+'exported') == 'false'
assert service.get(A+'foregroundServiceType') == 'specialUse'
assert service.find('property').get(A+'name') == 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE'
perms = {x.get(A+'name') for x in manifest.findall('uses-permission')}
for p in ['SYSTEM_ALERT_WINDOW', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_SPECIAL_USE', 'POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM', 'RECEIVE_BOOT_COMPLETED']:
    assert 'android.permission.'+p in perms
print('PASS: widget receiver/provider, unchanged XML resources and Java view IDs packaged; floating service/permissions present')
