# V4 test engine

This branch adds `ai.quranlab:tajweedformer:4.0.1` as a separate, opt-in recitation engine. It is not a production release.

- Android 8 / API 26 or newer is required for V4. Older devices keep the existing Whisper options.
- Select Quran Lab V4 in recitation settings, save, then start listening while online for its first model/reference download, approximately 63 MB according to the SDK documentation. First-run download, key acceptance and on-device behavior have not been tested on the user's phone.
- The CPU backend is requested explicitly. No certificate registration or hardware-verification success is claimed.
- Expected verse token IDs come from the SDK reference table. Reference word counts must match the displayed Quran words; a mismatch fails visibly instead of guessing a mapping.
- Settled phonemes are aligned against the expected verse prefix using edit distance. Words with at least 70% matching expected units are marked matched. This threshold is experimental, not a calibrated pronunciation or tajweed score.
- Unfinished trailing words wait until later speech or finalization. Consumed heard units are removed before the next alignment, so old speech cannot be reused as the next verse.
- The app reads `QURANLAB_KEY` only from the build environment. CI supplies it from the GitHub Secret. It is absent from source, but necessarily embedded in the client APK. Treat this as a personal test artifact and do not distribute it widely.
- V4 works locally after setup, but the SDK also contacts Quran Lab for verification/configuration and anonymous usage reporting. Do not claim that nothing leaves the phone. Recording sharing requires the SDK's separate consent UI; the app does not enable sharing itself.
- The dependency is governed by NPL-1.2, not this repository's MIT license. Charging for its powered features or showing ads on those features is restricted by that license.
- The existing APK already exceeded 20 MB before this change. This integration does not satisfy a 20 MB APK limit.

Checks: Android Kotlin and Java compilation, existing browser regression suite, production merge-method regression tests, extracted production alignment tests, and a rendered settings check. None is a substitute for testing the SDK with a real key on the target phone. No tag, app release or update.json change is included.

Sources:
- https://sdk.quranlab.ai/docs/4/quickstart/android
- https://sdk.quranlab.ai/privacy
- https://sdk.quranlab.ai/licence
- https://repo1.maven.org/maven2/ai/quranlab/tajweedformer/4.0.1/
