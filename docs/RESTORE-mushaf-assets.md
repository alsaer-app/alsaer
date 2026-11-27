# Restoring the old Warsh page-reader assets

In 2.0.0 Warsh moved to the same flow reader as Hafs. These files are no longer shipped or loaded:

- `www/mushaf.js` (1,902,523 bytes, 604-page Madani line layout, used only by the old page reader)
- `www/tajweed_warsh.js` (9,656 bytes, Warsh tajweed colouring engine)

Both are unchanged in git history. Last commit that contains them: `931b738`.

    git show 931b738:www/mushaf.js > www/mushaf.js
    git show 931b738:www/tajweed_warsh.js > www/tajweed_warsh.js

`tests/mushaf_wordmap_regression.py` skips itself while `www/mushaf.js` is absent and runs again once it is restored.
The old page-reader code (`vWarshReader`, `mpWrap`, tajweed engine in `quran-warsh.js`) is also in `931b738^`.
