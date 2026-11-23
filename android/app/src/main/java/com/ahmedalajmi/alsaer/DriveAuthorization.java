package com.ahmedalajmi.alsaer;

import android.app.Activity;
import android.content.Intent;
import android.webkit.WebView;
import com.google.android.gms.auth.api.identity.AuthorizationRequest;
import com.google.android.gms.auth.api.identity.AuthorizationResult;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.common.api.Scope;
import org.json.JSONObject;
import java.util.Collections;

/** Device-owned access tokens. No client secret, server exchange or redirect URI. */
final class DriveAuthorization {
    static final int REQUEST = 7402;
    private final MainActivity activity;
    private boolean busy;
    private boolean interactive;
    DriveAuthorization(MainActivity activity) { this.activity = activity; }
    void authorize(boolean allowUi) {
        activity.runOnUiThread(() -> {
            if (busy) { deliver("", "busy"); return; }
            busy = true; interactive = allowUi;
            AuthorizationRequest request = AuthorizationRequest.builder()
                .setRequestedScopes(Collections.singletonList(new Scope("https://www.googleapis.com/auth/drive.file"))).build();
            Identity.getAuthorizationClient(activity).authorize(request)
                .addOnSuccessListener(this::accept)
                .addOnFailureListener(e -> deliver("", "authorization-failed"));
        });
    }
    private void accept(AuthorizationResult result) {
        if (result.hasResolution()) {
            if (!interactive) { deliver("", "consent-required"); return; }
            try {
                activity.startIntentSenderForResult(result.getPendingIntent().getIntentSender(), REQUEST, null, 0, 0, 0);
            } catch (Exception e) { deliver("", "resolution-failed"); }
            return;
        }
        String token = result.getAccessToken();
        if (!result.getGrantedScopes().contains("https://www.googleapis.com/auth/drive.file") || token == null || token.isEmpty()) {
            deliver("", "scope-not-granted"); return;
        }
        String email = "";
        try { if (result.toGoogleSignInAccount() != null && result.toGoogleSignInAccount().getEmail() != null) email = result.toGoogleSignInAccount().getEmail(); } catch (Exception ignored) {}
        deliver(token, "", email);
    }
    boolean onResult(int request, int result, Intent data) {
        if (request != REQUEST) return false;
        if (result != Activity.RESULT_OK || data == null) { deliver("", "cancelled"); return true; }
        try { accept(Identity.getAuthorizationClient(activity).getAuthorizationResultFromIntent(data)); }
        catch (Exception e) { deliver("", "authorization-failed"); }
        return true;
    }
    private void deliver(String token, String error) { deliver(token, error, ""); }
    private void deliver(String token, String error, String email) {
        busy = false;
        WebView view = activity.getBridge() == null ? null : activity.getBridge().getWebView();
        if (view != null) view.post(() -> view.evaluateJavascript("window.gdriveOnNativeToken&&window.gdriveOnNativeToken(" + JSONObject.quote(token) + "," + JSONObject.quote(error) + "," + JSONObject.quote(email) + ")", null));
    }
}
