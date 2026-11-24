# 10198 source-only recovery QA

2026-11-24. Based on a0ec6f48b905f0b9ad5d257908eeae18eddd1b60 / 10197. Version code10198 is reserved, no APK exists from this work. No CI build, release, tag or main update authorized or performed.

## Changes
- Explicit choose/reconnect and change-account controls, with interactive Google SELECT_ACCOUNT prompt. Auth22.0.0 is required because21.4.0 lacks that API. Production DriveAuthorization source compiled against actual22.0.0 and Android API classes with an activity stub. Five deprecated account/email accessor warnings remain; no native packaging claim.
- Expired consent and401 clear stale local authorization state; cancellation keeps an existing link. Pending operations lock concurrent controls, timeout unlocks them, callbacks with no pending request cannot change email. Successful account changes clear prior account's displayed Drive timestamps without deleting backups or changing encryption preferences.
- Unlink is guarded while pending, and failure leaves a retry path. Scoped translated-label wrapping avoids clipping existing Backup status cards.
- Reproduced optional fasting.records array acceptance followed by lost date-entry persistence. Regression failed before the fix. Malformed fasting containers now normalize on load and are rejected on import.
- Policy/README updated separately after review. Recitation claims removed from README only, no cancelled feature added.

## Tests
All Node contracts pass. Native prayer/date/allocator/bridge/widget checks pass.96 native/JS calculation cases,480 times match. One-shot grace/future/expired arithmetic executes. Native overnight floating next-time logic returns Tuesday01:00 for Monday22:00-02:00. Current600000ms snooze and channel mapping execute; old API sound branching and preserving existing channels have source guards.

Actual browser button tests cover account controls in AR/EN/FR320px, encryption/password controls, backup, auto on/off, list/select/verify/confirm/cancel, exact selected delete/ack/back/cancel, protected entries, uncertain delete, independent file save/import/cancel, alternate file button from the Drive dialog and picker-exception recovery. Network/native/Google/file-provider transports are simulated. AES encryption/decryption and same-origin storage/reload are real browser execution.29-row CSV separates UI, contracts and residual proof.

Prayer method/Asr controls immediately update stored calculated times. Pending GPS for7.6seconds does not falsely report disabled; simulated API failure opens the existing dialog. Nightly Malik fallback executes all seven weekdays with daily dedup. Safety recovery status is separate from Drive. Existing protected reader tests pass:604pages/6236ayahs/77433words;48 shell combinations and8 toolbar combinations. Modern/simulated fallback WebView checks pass, not a genuine old WebView.

Language audit:2604strings, zero missing English/French mappings; runtime audit zero untranslated Arabic UI strings. Personal notes/names remain unchanged.

## Deferred read-only work
Seven fresh Chrome starts on local HTTP with external HTTPS blocked: median1139.9ms to home (1129.2-1193.7), includes deliberate one-second splash. Not Android cold start, no optimization claimed. Disposable storage-loss test exported JSON, cleared all browser app storage, reloaded and restored marker. No working phone touched.

Recovery checklist: save an independent file or Drive backup, retain encryption password outside phone, verify correct account and restore on a disposable install, compare records/settings, only then consider removing an old installation. Internal safety copy alone does not cover uninstall/lost phone. Live Google/account/provider/Android uninstall recovery remain untested.

Dormant image renderer stays off. Current font/text assets unchanged. Root MIT/README attribution is not full proof of every font/image license; verify asset-specific terms before enabling another renderer. No QCF/characters/extra languages/auto-log/shared space/trash added.

Store inspection found targetSdk34 and exact-alarm/install/overlay/special-use permissions; no Play readiness claim. Current official policy inspected2026-11-24 says phone new submissions targetAPI36. USE_EXACT_ALARM requires a qualifying core use case. Data Safety must match app/SDK data handling. No targetSdk/permission behavior changed.
Sources:
- https://developer.android.com/google/play/requirements/target-sdk
- https://support.google.com/googleplay/android-developer/answer/16558241?hl=en
- https://support.google.com/googleplay/android-developer/answer/10787469?hl=en

## Residual limits
No live Google account picker, consent, switching, revoke, Drive write/restore/delete, Android file provider, exact alarm delivery, OEM background lifecycle,24/25audio, real boot, network APK resume/install or phone cold start proof. No arbitrary malformed input immunity.160ms save debounce and simultaneous storage/rollback failures remain risks. Do not turn source checks into device-proven claims.

## Remote saving note
The experimental branch holds production source and most tests. Generated src/i18n/packs.js and www/index.html upload did not land. Local source archive contains regenerated exact outputs and latest evidence/test additions. Regenerate using tools/i18n_pack.py and tools/build_web.py before any eventual build; never build the intermediate remote tree as-is.
