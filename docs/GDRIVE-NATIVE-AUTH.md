# Native Android Drive authorization

This branch uses Google Play services AuthorizationClient and drive.file. It does not use a redirect URI, client secret, Web OAuth client or server refresh-token exchange on Android.

## Cloud configuration

- Enable Google Drive API in the same Cloud project.
- Configure the OAuth consent screen and drive.file scope. While in testing, include the account that will test.
- Android OAuth client: package com.ahmedalajmi.alsaer plus the SHA-1 of the certificate signing the installed APK. Add a separate Android client for each additional debug/release signing certificate as needed.
- The recorded CI signing SHA-1 is 09:3B:29:63:F1:A7:B3:DE:F4:A6:30:0A:47:A7:2F:8F:02:11:08:60. Verify it against the actual build's signing report.
- No custom URI checkbox is needed. No google-services.json is required for this authorization API.

## Token lifecycle

The app requests an access token from Play services. A native consent/account chooser is launched only from Connect. Later operations request a fresh token silently; if new consent is required they fail and the user reconnects. Tokens live in JS memory only. A non-secret connected marker persists. Existing Drive upload/download format and request timeouts are retained. Disconnect calls Google's revoke endpoint and clears local state only on success. Old browser PKCE code remains for non-native builds; it is not a validated browser deployment.

No unattended background Drive backup is introduced. No server refresh token is requested or stored by the native route.

## Required device tests

- Compile with Gradle, install with the configured signing certificate, and check Google Play services availability.
- Connect, select account, grant drive.file; cancel and decline tests.
- Upload, change a test value, download without applying, then restore with explicit confirmation.
- Restart app and upload again (silent token request).
- Revoke permission from Google, retry, then reconnect.
- Disconnect online and offline; never report successful remote revoke while offline.
- Rotate/kill app during consent: current operation may be lost; reconnect safely. No refresh token or secret should appear in logs or backups.

Sources: https://developers.google.com/android/reference/com/google/android/gms/auth/api/identity/AuthorizationClient and https://developers.google.com/android/reference/com/google/android/gms/auth/api/identity/AuthorizationResult
