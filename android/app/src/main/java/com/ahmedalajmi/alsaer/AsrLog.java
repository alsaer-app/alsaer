package com.ahmedalajmi.alsaer;

/** سجل تشخيصي دائري لمحرك التسميع (V4): أحداث تشغيل فقط، بلا صوت ولا نصوص تلاوة. */
final class AsrLog {
    private AsrLog() {}
    private static final java.util.ArrayDeque<String> DIAG = new java.util.ArrayDeque<>();
    static volatile String pinned = "";

    static synchronized void diag(String m) {
        String line = new java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.US).format(new java.util.Date()) + " " + m;
        while (DIAG.size() >= 300) DIAG.pollFirst();
        DIAG.add(line);
        android.util.Log.d("AlsaerAsr", m);
    }

    static synchronized String diagDump() {
        StringBuilder b = new StringBuilder();
        b.append("Alsaer ").append(BuildConfig.VERSION_NAME).append(" (").append(BuildConfig.VERSION_CODE).append(") | merge=v2-min6s-stop-only v4diag=1 v4map=1 v4mic=1\n");
        if (pinned != null && !pinned.isEmpty()) b.append(pinned).append('\n');
        for (String x : DIAG) b.append(x).append('\n');
        return b.toString();
    }
}
