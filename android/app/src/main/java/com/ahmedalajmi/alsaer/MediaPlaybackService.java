package com.ahmedalajmi.alsaer;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.Icon;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;
import android.webkit.WebView;
import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;

import java.lang.ref.WeakReference;

/**
 * بطاقة تحكم في شريط الإشعارات للصوت الذي يشغّله التطبيق (إذاعة، تلاوة، حصن المسلم...).
 * الصوت نفسه يبقى في WebView؛ هذه الخدمة تُبقي العملية حيّة وتعرض اسم الخدمة وزرّي التشغيل/الإيقاف المؤقت والإيقاف،
 * وترسل ضغطات الأزرار إلى الصفحة عبر window.alsaerMediaCmd.
 */
public class MediaPlaybackService extends Service {
    static final String ACT_UPDATE = "com.ahmedalajmi.alsaer.MEDIA_UPDATE";
    static final String ACT_RADIO = "com.ahmedalajmi.alsaer.MEDIA_RADIO";
    static final String ACT_PLAY = "com.ahmedalajmi.alsaer.MEDIA_PLAY";
    static final String ACT_PAUSE = "com.ahmedalajmi.alsaer.MEDIA_PAUSE";
    static final String ACT_STOP = "com.ahmedalajmi.alsaer.MEDIA_STOP";
    private static final String CH = "alsaer_media";
    private static final int NID = 7420;
    private static WeakReference<WebView> web = new WeakReference<>(null);

    private MediaSession session;
    private String title = "", sub = "";
    private boolean playing = true;
    private ExoPlayer player;
    private int radioRetry = 0;
    private String radioUrl = "";
    private final android.os.Handler main = new android.os.Handler(android.os.Looper.getMainLooper());
    private android.os.PowerManager.WakeLock wakeLock;
    private android.net.wifi.WifiManager.WifiLock wifiLock;

    static void bind(WebView w) { web = new WeakReference<>(w); }

    static void update(Context c, String title, boolean playing) {
        Intent i = new Intent(c, MediaPlaybackService.class).setAction(ACT_UPDATE)
            .putExtra("t", title == null ? "" : title).putExtra("p", playing);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception e) { DiagLog.add("svc start FAILED " + e.getClass().getSimpleName()); }
    }

    /* الإذاعة تُشغَّل هنا بمشغّل أصلي (ExoPlayer) لا بعنصر Audio داخل الـWebView */
    static void radioPlay(Context c, String url, String title) {
        Intent i = new Intent(c, MediaPlaybackService.class).setAction(ACT_RADIO)
            .putExtra("u", url == null ? "" : url).putExtra("t", title == null ? "" : title);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception e) { DiagLog.add("radio start FAILED " + e.getClass().getSimpleName()); }
    }

    private void radioState(final String st) {
        final WebView w = web.get();
        if (w == null) return;
        w.post(new Runnable() { public void run() {
            try { w.evaluateJavascript("window.alsaerRadioState&&window.alsaerRadioState('" + st + "')", null); } catch (Exception ignored) { }
        } });
    }

    private void startRadio(String url, String t) {
        releasePlayer();
        radioUrl = url; radioRetry = 0; title = t; playing = true;
        try {
            player = new ExoPlayer.Builder(this)
                .setAudioAttributes(new AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MUSIC).build(), true)
                .setHandleAudioBecomingNoisy(true)
                .setWakeMode(C.WAKE_MODE_NETWORK)
                .build();
            player.addListener(new Player.Listener() {
                @Override public void onPlaybackStateChanged(int s) {
                    DiagLog.add("exo state " + (s == Player.STATE_READY ? "ready" : s == Player.STATE_BUFFERING ? "buffering" : s == Player.STATE_ENDED ? "ended" : "idle"));
                    if (s == Player.STATE_READY) { radioRetry = 0; radioState("play"); }
                    else if (s == Player.STATE_BUFFERING) radioState("load");
                }
                @Override public void onPlayWhenReadyChanged(boolean pw, int reason) {
                    DiagLog.add("exo playWhenReady " + pw + " reason " + reason);
                    playing = pw; show();
                }
                @Override public void onPlayerError(PlaybackException e) {
                    DiagLog.add("exo error " + e.getErrorCodeName());
                    if (radioRetry < 3 && player != null) {
                        radioRetry++;
                        main.postDelayed(new Runnable() { public void run() {
                            if (player != null) { player.setMediaItem(MediaItem.fromUri(radioUrl)); player.prepare(); player.play(); DiagLog.add("exo retry " + radioRetry); }
                        } }, 2000L * radioRetry);
                    } else { radioState("error"); stopRadioService(); }
                }
            });
            player.setMediaItem(MediaItem.fromUri(url));
            player.prepare();
            player.play();
            DiagLog.add("exo start");
            radioState("load");
        } catch (Exception e) { DiagLog.add("exo start FAILED " + e.getClass().getSimpleName()); releasePlayer(); radioState("error"); }
        show();
    }

    private void releasePlayer() {
        main.removeCallbacksAndMessages(null);
        if (player != null) { try { player.release(); } catch (Exception ignored) { } player = null; }
    }

    private void stopRadioService() {
        releasePlayer(); holdLocks(false); stopForeground(true); stopSelf();
    }

    /* أمر من زر الإشعار/الجلسة: للإذاعة الأصلية مباشرة، وإلا للصفحة */
    private void command(String c) {
        if (player == null) { toPage(c); return; }
        DiagLog.add("cmd " + c + " native");
        if ("pause".equals(c)) player.pause();
        else if ("play".equals(c)) { player.seekToDefaultPosition(); player.play(); }
        else if ("stop".equals(c)) { radioState("stop"); stopRadioService(); }
    }

    static void stop(Context c) {
        try { c.stopService(new Intent(c, MediaPlaybackService.class)); } catch (Exception ignored) { }
    }

    private void toPage(final String cmd) {
        final WebView w = web.get();
        if (w == null) { DiagLog.add("cmd " + cmd + " NO-WEBVIEW"); return; }
        DiagLog.add("cmd " + cmd + " ->page");
        w.post(new Runnable() { public void run() {
            try {
                w.evaluateJavascript("window.alsaerMediaCmd&&window.alsaerMediaCmd('" + cmd + "')", null);
            } catch (Exception e) { DiagLog.add("cmd " + cmd + " eval-failed"); }
        } });
    }

    /* تبقي المعالج والواي فاي حيّين أثناء التشغيل فقط (مهلة أمان ٦ ساعات) ثم تُحرَّر عند الإيقاف/الإنهاء */
    private void holdLocks(boolean on) {
        try {
            if (on) {
                if (wakeLock == null) {
                    android.os.PowerManager pm = (android.os.PowerManager) getSystemService(Context.POWER_SERVICE);
                    wakeLock = pm.newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "alsaer:media");
                    wakeLock.setReferenceCounted(false);
                }
                if (!wakeLock.isHeld()) { wakeLock.acquire(6 * 60 * 60 * 1000L); DiagLog.add("wakelock on"); }
                if (wifiLock == null) {
                    android.net.wifi.WifiManager wm = (android.net.wifi.WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                    wifiLock = wm.createWifiLock(android.net.wifi.WifiManager.WIFI_MODE_FULL_HIGH_PERF, "alsaer:media");
                    wifiLock.setReferenceCounted(false);
                }
                if (!wifiLock.isHeld()) wifiLock.acquire();
            } else {
                if (wakeLock != null && wakeLock.isHeld()) { wakeLock.release(); DiagLog.add("wakelock off"); }
                if (wifiLock != null && wifiLock.isHeld()) wifiLock.release();
            }
        } catch (Exception e) { DiagLog.add("lock-error " + e.getClass().getSimpleName()); }
    }

    @Override public void onTaskRemoved(Intent rootIntent) { DiagLog.add("task removed"); super.onTaskRemoved(rootIntent); }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent in, int flags, int startId) {
        String a = in == null ? null : in.getAction();
        if (ACT_RADIO.equals(a)) { startRadio(in.getStringExtra("u"), in.getStringExtra("t")); return START_NOT_STICKY; }
        if (ACT_STOP.equals(a) && player != null) { command("stop"); return START_NOT_STICKY; }
        if (ACT_STOP.equals(a)) {
            toPage("stop");
            holdLocks(false);
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }
        DiagLog.add("svc action " + (a == null ? "null" : a.substring(a.lastIndexOf('_') + 1)));
        /* الأزرار تطلب من الصفحة فقط؛ الحالة تتغير عندما تؤكد الصفحة (mediaUpdate) فلا تكذب البطاقة */
        if (ACT_PLAY.equals(a)) { command("play"); return START_NOT_STICKY; }
        else if (ACT_PAUSE.equals(a)) { command("pause"); return START_NOT_STICKY; }
        else if (ACT_UPDATE.equals(a) && player != null) { return START_NOT_STICKY; }
        else if (ACT_UPDATE.equals(a)) {
            title = in.getStringExtra("t");
            playing = in.getBooleanExtra("p", true);
            DiagLog.add("page state " + (playing ? "playing" : "paused"));
        }
        show();
        return START_NOT_STICKY;
    }

    private PendingIntent pi(String act, int rc) {
        Intent i = new Intent(this, MediaPlaybackService.class).setAction(act);
        int f = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        return Build.VERSION.SDK_INT >= 26 ? PendingIntent.getForegroundService(this, rc, i, f) : PendingIntent.getService(this, rc, i, f);
    }

    private void show() {
        sub = NativeStrings.get(this, playing ? "media_playing" : "media_paused");
        holdLocks(playing);
        if (session == null) {
            session = new MediaSession(this, "alsaer");
            session.setCallback(new MediaSession.Callback() {
                @Override public void onPlay() { DiagLog.add("session play"); command("play"); }
                @Override public void onPause() { DiagLog.add("session pause"); command("pause"); }
                @Override public void onStop() { DiagLog.add("session stop"); if (player != null) { command("stop"); return; } toPage("stop"); holdLocks(false); stopForeground(true); stopSelf(); }
            });
            session.setActive(true);
        }
        session.setPlaybackState(new PlaybackState.Builder()
            .setActions(PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_STOP)
            .setState(playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED, PlaybackState.PLAYBACK_POSITION_UNKNOWN, 1f)
            .build());
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CH, NativeStrings.get(this, "media_channel"), NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
            b = new Notification.Builder(this, CH);
        } else {
            b = new Notification.Builder(this);
        }
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(this, 0, open,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        String tt = (title == null || title.isEmpty()) ? getString(R.string.app_name) : title;
        Notification.Action toggle = new Notification.Action.Builder(
            Icon.createWithResource(this, playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play),
            NativeStrings.get(this, playing ? "media_pause" : "media_play"),
            pi(playing ? ACT_PAUSE : ACT_PLAY, 1)).build();
        Notification.Action stopA = new Notification.Action.Builder(
            Icon.createWithResource(this, android.R.drawable.ic_menu_close_clear_cancel),
            NativeStrings.get(this, "media_stop"), pi(ACT_STOP, 2)).build();
        b.setSmallIcon(R.drawable.ic_stat_alsaer)
            .setContentTitle(tt).setContentText(sub)
            .setSubText(getString(R.string.app_name))
            .setContentIntent(content)
            .setOngoing(playing).setShowWhen(false)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(toggle).addAction(stopA)
            .setStyle(new Notification.MediaStyle().setMediaSession(session.getSessionToken()).setShowActionsInCompactView(0, 1));
        Notification n = b.build();
        if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(NID, n);
        if (!playing && Build.VERSION.SDK_INT >= 24) stopForeground(Service.STOP_FOREGROUND_DETACH);
    }

    @Override public void onDestroy() {
        DiagLog.add("svc destroy");
        releasePlayer();
        holdLocks(false);
        if (session != null) { try { session.setActive(false); session.release(); } catch (Exception ignored) { } session = null; }
        super.onDestroy();
    }
}
