# Restoring the old Warsh page-reader assets

In 2.0.0 Warsh moved to the same flow reader as Hafs. These files are no longer shipped or loaded:

- `www/mushaf.js` (1,902,523 bytes, 604-page Madani line layout, used only by the old page reader)
- `www/tajweed_warsh.js` (9,656 bytes, Warsh tajweed colouring engine)

Both are unchanged in git history. Last commit that contains them: `931b738`.

    git show 931b738:www/mushaf.js > www/mushaf.js
    git show 931b738:www/tajweed_warsh.js > www/tajweed_warsh.js

`tests/mushaf_wordmap_regression.py` skips itself while `www/mushaf.js` is absent and runs again once it is restored.
The old page-reader code (`vWarshReader`, `mpWrap`, tajweed engine in `quran-warsh.js`) is also in `931b738^`.

## Warsh removed entirely (after 1a66726)
Warsh text, font, warshFix, switcher and the Warsh-to-Hafs tafsir map were removed on Ahmed's order. Everything is recoverable from commit 1a66726:
    git show 1a66726:www/warsh.js > www/warsh.js
    git show 1a66726:www/fonts/warsh.woff2 > www/fonts/warsh.woff2
    git show 1a66726:src/services/tafsir-map.js > src/services/tafsir-map.js
