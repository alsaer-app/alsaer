# Notification sounds

Source: provided by the user (the app owner).

| File (android/app/src/main/res/raw) | Used for |
|---|---|
| alsaer_pray_fajr.wav, alsaer_pray_dhuhr.wav, alsaer_pray_asr.wav, alsaer_pray_maghrib.wav, alsaer_pray_isha.wav | The notification at each prayer time (default "chime" mode), one channel per prayer: alsaer_pray_<prayer>_v2 |
| alsaer_notify.wav | All other reminders in the default mode (also the "time to prepare" reminder before a prayer) |
| alsaer_tone.mp3 | Previous tone, kept in the project but no longer used |

The WAV files are used as delivered (no re-encoding). Silent and system-tone modes are unchanged. Channel IDs are v2 because Android fixes a channel's sound when it is created.
