"""Source guards for the native location bridge (no Android SDK here, so no run proof): one onRequestPermissionsResult in MainActivity that hands the location request code to LocationBridge first, GPS provider only with FINE permission (approximate-only grants throw SecurityException), each provider registered in its own try, a SecurityException with granted permission is not reported as 'denied', unknown errors fall back to the WebView path in JS."""
from pathlib import Path
import re
R=Path(__file__).resolve().parents[1];J=R/'android/app/src/main/java/com/ahmedalajmi/alsaer'
m=(J/'MainActivity.java').read_text();l=(J/'LocationBridge.java').read_text();js=(R/'src/services/prayer-times.js').read_text()
assert len(re.findall(r'void onRequestPermissionsResult\(',m))==1,'duplicate onRequestPermissionsResult'
body=m[m.index('void onRequestPermissionsResult('):]
assert body.index('locationBridge.onPermission')<body.index('super.onRequestPermissionsResult') and 'alsaerPoll' in body
assert 'boolean hasFine()' in l and 'if (!fine && LocationManager.GPS_PROVIDER.equals(p)) continue;' in l and 'if (!fine) gps = false;' in l
assert l.count('requestSingleUpdate')==2 and l.count('try { lm.requestSingleUpdate')==2
assert 'hasPermission() ? "error" : "denied"' in l and '"nofine"' in l
assert "if(!fell){fell=true;web()}" in js
for meth in re.findall(r'(?:public |private |static |final )*[\w<>\[\]]+ (\w+)\([^)]*\)\s*\{',l):pass
sig=re.findall(r'\n    (?:private |static |final )*[\w<>\[\]]+ (\w+)\(([^)]*)\) \{',l);assert len(sig)==len(set(sig)),'duplicate methods in LocationBridge'
print('PASS location bridge source guards (Java not compiled with the Android SDK, no device run)')
