#!/bin/bash
# يترجم كلاسات الجافا المعدَّلة (الحزمة x) إلى native_overlay/classes3.dex دون Android SDK كامل.
# يحتاج: sdk/android.jar و sdk/d8.jar (ضعهما في المتغيّر SDK_DIR). الكلاسات القديمة تبقى في classes.dex ولا تُستخدم.
set -e
SDK=${SDK_DIR:-/home/claude/sdk}; R=$(cd "$(dirname "$0")/.." && pwd); T=$(mktemp -d)
mkdir -p $T/src/com/ahmedalajmi/alsaer/x $T/st $T/cls $T/out
J=$R/android/app/src/main/java/com/ahmedalajmi/alsaer
for f in ActionReceiver AlarmReceiver AlarmScheduler AlsaerNative AlsaerWidget BootReceiver FloatingReminderService FloatFeed MainActivity Speech ModelPack; do
  sed 's/^package com.ahmedalajmi.alsaer;/package com.ahmedalajmi.alsaer.x;\nimport com.ahmedalajmi.alsaer.BiometricPlugin;/' $J/$f.java > $T/src/com/ahmedalajmi/alsaer/x/$f.java; done
sed -i 's/R\.raw\.alsaer_tone/c.getResources().getIdentifier("alsaer_tone","raw",c.getPackageName())/; s/R\.drawable\.ic_stat_alsaer/c.getResources().getIdentifier("ic_stat_alsaer","drawable",c.getPackageName())/' $T/src/com/ahmedalajmi/alsaer/x/AlarmScheduler.java
javac -nowarn --release 8 -cp $SDK/android.jar -d $T/st $(find $R/native_overlay/stubs -name '*.java')
javac -nowarn --release 8 -cp $SDK/android.jar:$T/st -d $T/cls $(find $T/src -name '*.java')
java -cp $SDK/d8.jar com.android.tools.r8.D8 --lib $SDK/android.jar --classpath $T/st --min-api 22 --release --output $T/out $(find $T/cls -name '*.class')
cp $T/out/classes.dex $R/native_overlay/classes3.dex; echo ok
