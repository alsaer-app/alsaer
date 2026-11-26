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

import java.lang.ref.WeakReference;

/**
 * بطاقة تحكم في شريط الإشعارات للصوت الذي يشغّله التطبيق (إذاعة، تلاوة، حصن المسلم...).
 * الصوت نفسه يبقى في WebView؛ هذه الخدمة تُبقي العملية حيّة وتعرض اسم الخدمة وزرّي التشغيل/الإيقاف المؤقت والإيقاف،
 * وترسل ضغطات الأزرار إلى الصفحة عبر window.alsaerMediaCmd.
 */
public class MediaPlaybackService extends Service {
    static final String ACT_UPDATE = "com.ahmedalajmi.alsaer.MEDIA_UPDATE";
    static final String ACT_PLAY = "com.ahmedalajmi.alsaer.MEDIA_PLAY";
    static final String ACT_PAUSE = "com.ahmedalajmi.alsaer.MEDIA_PAUSE";
    static final String ACT_STOP = "com.ahmedalajmi.alsaer.MEDIA_STOP";
    private static final String CH = "alsaer_media";
    private static final int NID = 7420;
    private static WeakReference<WebView> web = new WeakReference<>(null);

    private MediaSession session;
    private String title = "", sub = "";
    private boolean playing = true;

    static void bind(WebView w) { web = new WeakReference<>(w); }

    static void update(Context c, String title, boolean playing) {
        Intent i = new Intent(c, MediaPlaybackService.class).setAction(ACT_UPDATE)
            .putExtra("t", title == null ? "" : title).putExtra("p", playing);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception ignored) { }
    }

    static void stop(Context c) {
        try { c.stopService(new Intent(c, MediaPlaybackService.class)); } catch (Exception ignored) { }
    }

    private void toPage(final String cmd) {
        final WebView w = web.get();
        if (w == null) return;
        w.post(new Runnable() { public void run() {
            w.evaluateJavascript("window.alsaerMediaCmd&&window.alsaerMediaCmd('" + cmd + "')", null);
        } });
    }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent in, int flags, int startId) {
        String a = in == null ? null : in.getAction();
        if (ACT_STOP.equals(a)) {
            toPage("stop");
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }
        if (ACT_PLAY.equals(a)) { toPage("play"); playing = true; }
        else if (ACT_PAUSE.equals(a)) { toPage("pause"); playing = false; }
        else if (ACT_UPDATE.equals(a)) {
            title = in.getStringExtra("t");
            playing = in.getBooleanExtra("p", true);
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
        if (session == null) {
            session = new MediaSession(this, "alsaer");
            session.setCallback(new MediaSession.Callback() {
                @Override public void onPlay() { toPage("play"); playing = true; show(); }
                @Override public void onPause() { toPage("pause"); playing = false; show(); }
                @Override public void onStop() { toPage("stop"); stopForeground(true); stopSelf(); }
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
        if (session != null) { try { session.setActive(false); session.release(); } catch (Exception ignored) { } session = null; }
        super.onDestroy();
    }
}
