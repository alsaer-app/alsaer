"""Fail when a web-facing bridge method disappears, even if JS catches it silently."""
import pathlib,re
root=pathlib.Path(__file__).resolve().parents[1]
s=(root/'android/app/src/main/java/com/ahmedalajmi/alsaer/AlsaerNative.java').read_text()
required='setSchedule notificationsEnabled canExactAlarms requestNotificationPermission testNotification setSoundMode getSoundMode takePending takeRoute openAppNotificationSettings openExactAlarmSettings openBatterySettings canDrawOverlays floatingEnabled setFloating setWidget setWidgetStyle getWidgetStyle widgetActive setFloatStyle getFloatStyle pauseFloating floatingPausedUntil openOverlaySettings testFloating setFloatFeed getFloatFeed setFloatPool floatPoolSize floatUpcoming floatLastShown floatLastError floatRefresh consumeGdriveRedirect shareText appBuildInfo mirrorGet mirrorSet openUrl updateStart backupExport backupImport'.split()
exposed=set(re.findall(r'@JavascriptInterface\s+public\s+[\w.<>]+\s+(\w+)\s*\(',s))
missing=set(required)-exposed
assert not missing, 'Missing @JavascriptInterface bridge methods: '+', '.join(sorted(missing))
print('PASS:',len(required),'native bridge methods present and exposed')

# Direct calls and bridge aliases used in current source. Ignore ordinary JS methods.
ordinary=set('forEach getDate getDay getFullYear getHours getMinutes getMonth getTime indexOf localeCompare map setHours split'.split())
called=set()
for path in (root/'src').rglob('*.js'):
    text=path.read_text()
    called.update(re.findall(r'\b(?:AlsaerNative|nv|nf|nq|nat|n)\.(\w+)\s*\(',text))
assert not (called-exposed-ordinary), 'Unmatched bridge calls: '+str(sorted(called-exposed-ordinary))
print('PASS: web bridge calls match exposed methods (with reviewed JS alias exclusions)')
