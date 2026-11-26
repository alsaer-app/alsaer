package com.ahmedalajmi.alsaer;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/** One-shot device location without relying on the WebView geolocation prompt. Results go to window.gpsOnNative(lat,lng,accuracy,error). */
final class LocationBridge {
    static final int REQUEST = 7403;
    private final MainActivity activity;
    private final Handler main = new Handler(Looper.getMainLooper());
    private boolean waitingPermission;
    private boolean active;
    private final List<LocationListener> listeners = new ArrayList<>();
    private Runnable timeout;
    LocationBridge(MainActivity activity) { this.activity = activity; }

    boolean hasPermission() {
        return activity.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || activity.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    void request() {
        activity.runOnUiThread(() -> {
            if (waitingPermission || active) { deliver(0, 0, 0, "busy"); return; }
            if (!hasPermission()) {
                waitingPermission = true;
                activity.requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQUEST);
                return;
            }
            locate();
        });
    }

    boolean onPermission(int request, int[] results) {
        if (request != REQUEST) return false;
        waitingPermission = false;
        boolean ok = false;
        if (results != null) for (int r : results) if (r == PackageManager.PERMISSION_GRANTED) ok = true;
        if (ok) locate(); else deliver(0, 0, 0, "denied");
        return true;
    }

    private void locate() {
        LocationManager lm = (LocationManager) activity.getSystemService(Context.LOCATION_SERVICE);
        if (lm == null) { deliver(0, 0, 0, "nomgr"); return; }
        try {
            // A recent known fix answers at once.
            Location best = null;
            for (String p : new String[]{LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER}) {
                try {
                    Location l = lm.getLastKnownLocation(p);
                    if (l != null && System.currentTimeMillis() - l.getTime() < 3600000L && (best == null || l.getTime() > best.getTime())) best = l;
                } catch (Exception ignored) { }
            }
            if (best != null) { deliver(best.getLatitude(), best.getLongitude(), best.getAccuracy(), ""); return; }
            boolean gps = false, net = false;
            try { gps = lm.isProviderEnabled(LocationManager.GPS_PROVIDER); } catch (Exception ignored) { }
            try { net = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER); } catch (Exception ignored) { }
            if (!gps && !net) { deliver(0, 0, 0, "off"); return; }
            active = true;
            final LocationManager mgr = lm;
            LocationListener l = new LocationListener() {
                @Override public void onLocationChanged(Location loc) { finish(mgr, loc.getLatitude(), loc.getLongitude(), loc.getAccuracy(), ""); }
                @Override public void onStatusChanged(String provider, int status, Bundle extras) { }
                @Override public void onProviderEnabled(String provider) { }
                @Override public void onProviderDisabled(String provider) { }
            };
            listeners.add(l);
            if (net) lm.requestSingleUpdate(LocationManager.NETWORK_PROVIDER, l, Looper.getMainLooper());
            if (gps) lm.requestSingleUpdate(LocationManager.GPS_PROVIDER, l, Looper.getMainLooper());
            timeout = () -> finish(mgr, 0, 0, 0, "timeout");
            main.postDelayed(timeout, 30000);
        } catch (SecurityException e) {
            deliver(0, 0, 0, "denied");
        } catch (Exception e) {
            active = false;
            deliver(0, 0, 0, "error");
        }
    }

    private void finish(LocationManager lm, double lat, double lng, double acc, String error) {
        if (!active) return;
        active = false;
        if (timeout != null) main.removeCallbacks(timeout);
        for (LocationListener l : listeners) { try { lm.removeUpdates(l); } catch (Exception ignored) { } }
        listeners.clear();
        deliver(lat, lng, acc, error);
    }

    private void deliver(double lat, double lng, double acc, String error) {
        WebView view = activity.getBridge() == null ? null : activity.getBridge().getWebView();
        if (view != null) view.post(() -> view.evaluateJavascript("window.gpsOnNative&&window.gpsOnNative(" + lat + "," + lng + "," + acc + "," + JSONObject.quote(error) + ")", null));
    }
}
