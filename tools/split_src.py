#!/usr/bin/env python3
"""One-off: split www/index.html into the modular src/ tree + src/manifest.json (byte-identical rebuild)."""
import re, os, json, sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html=open(os.path.join(ROOT,'www','index.html'),encoding='utf-8').read()
manifest=[]
def emit_file(path,text):
    full=os.path.join(ROOT,'src',path);os.makedirs(os.path.dirname(full),exist_ok=True)
    open(full,'w',encoding='utf-8',newline='').write(text);manifest.append({'file':path})
def emit_lit(t): manifest.append({'lit':t})
def split_lines(text,ranges,prefix):
    lines=text.split('\n');n=len(lines)
    for i,(a,name) in enumerate(ranges):
        b=ranges[i+1][0] if i+1<len(ranges) else n
        chunk='\n'.join(lines[a:b])+('\n' if b<n else '')
        emit_file(prefix+name,chunk)
CSS=[ {0:None} ]
css_plans=[
 [(0,'styles/base.css'),(256,'styles/mushaf.css'),(297,'styles/theme-maleem.css'),(477,'styles/fonts-palettes-looks.css'),(586,'styles/profile-fasting-habits.css'),(744,'styles/onboarding-security.css')],
 [(0,'styles/reader.css')],
 [(0,'styles/reader-final.css')],
 [(0,'styles/release-1.1-reminders.css'),(107,'styles/reminders-center.css'),(164,'styles/new-look-and-lists.css'),(257,'styles/release-1.2.css')],
]
JS=[(0,'core/bootstrap.js'),(4,'constants/base.js'),(52,'components/icons-art.js'),(119,'constants/adhkar.js'),(200,'services/daily-card.js'),(390,'constants/misc.js'),(407,'services/storage.js'),(483,'services/security-biometric.js'),(541,'services/stats.js'),(615,'core/state.js'),(642,'services/i18n.js'),(798,'services/theme.js'),(820,'screens/appearance.js'),(833,'components/ui-helpers.js'),(857,'screens/onboarding.js'),(876,'screens/reminders-stub.js'),(904,'components/home-common.js'),(927,'screens/worship.js'),(928,'services/habit-tracker.js'),(1072,'components/home-tiles.js'),(1114,'services/heavy-loader.js'),(1125,'services/home-config.js'),(1130,'services/gender-address.js'),(1148,'screens/home.js'),(1175,'components/mushaf-settings.js'),(1210,'screens/home-new.js'),(1291,'components/list-editor.js'),(1349,'services/prayer-times.js'),(1406,'screens/prayers.js'),(1418,'services/quran-warsh.js'),(1489,'screens/quran.js'),(1508,'screens/reader.js'),(1561,'services/reader-layout.js'),(1731,'services/worship-fasting.js'),(1782,'screens/progress-habits-calendar.js'),(1847,'screens/more.js'),(1907,'components/security-center.js'),(1929,'screens/settings.js'),(1953,'screens/lock.js'),(2001,'services/hadith-update.js'),(2039,'core/render.js'),(2115,'core/event-dispatcher.js'),(2392,'core/enhancers.js'),(2426,'services/reminders-ui.js'),(2698,'services/native-schedule.js')]
pos=0;si=0;mi=0
for m in re.finditer(r'<style>(.*?)</style>|<script>(.*?)</script>',html,re.S):
    mk=html[pos:m.start()]
    if mk:
        emit_file('shell/markup-%d.html'%mi,mk);mi+=1
    if m.group(1) is not None:
        emit_lit('<style>');
        # css content starts after '<style>'
        css=m.group(1);plan=css_plans[si];si+=1;split_lines(css,plan,'');emit_lit('</style>')
    else:
        js=m.group(2);emit_lit('<script>');split_lines(js,JS,'');emit_lit('</script>')
    pos=m.end()
tail=html[pos:]
if tail: emit_file('shell/markup-%d.html'%mi,tail)
json.dump(manifest,open(os.path.join(ROOT,'src','manifest.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(len(manifest),'segments')
