# Notification sounds

Source of the prayer-time sounds and alsaer_notify.wav: provided by the user (the app owner). alsaer_tone.mp3 is the app's original tone.

| File (android/app/src/main/res/raw) | Used for |
|---|---|
| alsaer_pray_fajr.wav, alsaer_pray_dhuhr.wav, alsaer_pray_asr.wav, alsaer_pray_maghrib.wav, alsaer_pray_isha.wav | The notification at each prayer time (default "chime" mode), one channel per prayer: alsaer_pray_<prayer>_v2 |
| alsaer_tone.mp3 | All other reminders in the default mode (also the "time to prepare" reminder before a prayer, fasting, habits) |
| alsaer_notify.wav | Provided by the user, kept in the project, currently not used |

The WAV files are used as delivered (no re-encoding). Silent and system-tone modes are unchanged. Channel IDs are v2 because Android fixes a channel's sound when it is created.
