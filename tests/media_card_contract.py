#!/usr/bin/env python3
"""Media notification card: manifest, service, bridge and JS wiring stay consistent."""
import re,pathlib,xml.etree.ElementTree as ET
R=pathlib.Path(__file__).resolve().parent.parent
J=R/'android/app/src/main/java/com/ahmedalajmi/alsaer'
A='{http://schemas.android.com/apk/res/android}'
m=ET.parse(R/'android/app/src/main/AndroidManifest.xml').getroot()
svc=next(x for x in m.find('application').findall('service') if x.get(A+'name')=='.MediaPlaybackService')
assert svc.get(A+'foregroundServiceType')=='mediaPlayback' and svc.get(A+'exported')=='false'
assert 'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK' in [p.get(A+'name') for p in m.findall('uses-permission')]
s=(J/'MediaPlaybackService.java').read_text();n=(J/'AlsaerNative.java').read_text()
assert 'FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK' in s and 'Notification.MediaStyle' in s and 'alsaerMediaCmd' in s
assert s.count('.addAction(')==2
for k in ['media_play','media_pause','media_stop','media_playing','media_paused','media_channel']: assert '"'+k+'"' in s
assert 'void mediaUpdate(String title, boolean playing)' in n and 'void mediaStop()' in n
assert 'MediaPlaybackService.bind(' in (J/'MainActivity.java').read_text()
js=(R/'src/services/media-card.js').read_text()
assert 'window.alsaerMediaCmd' in js and 'mediaUpdate' in js and 'mediaStop' in js and 'eval(' not in js
assert 'services/media-card.js' in (R/'src/manifest.json').read_text()
print('OK: media card contract')
