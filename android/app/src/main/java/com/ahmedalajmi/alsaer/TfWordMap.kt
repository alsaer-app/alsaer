package com.ahmedalajmi.alsaer

/** Quran Lab's phonetic words -> the mushaf's written words.
 * A multi-letter opening is one written word but one phonetic word per letter.
 * The exceptions below were checked against all 6,236 rows of Quran Lab's
 * quran-tajweed-phonetics and the app's Tanzil text. No arbitrary count folding.
 */
internal object TfWordMap {
    fun openingWords(surah: Int, ayah: Int): Int {
        if (surah == 42 && ayah == 2) return 3
        if (ayah != 1) return 1
        return when (surah) {
            2, 3, 10, 11, 12, 14, 15, 26, 28, 29, 30, 31, 32 -> 3
            7, 13 -> 4
            19 -> 5
            20, 27, 36, 40, 41, 42, 43, 44, 45, 46 -> 2
            else -> 1
        }
    }

    /** Null means the served reference and UI disagree beyond the verified opening. */
    fun map(surah: Int, ayah: Int, referenceWords: Int, uiWords: Int): IntArray? {
        val opening = openingWords(surah, ayah)
        if (uiWords <= 0 || referenceWords != uiWords + opening - 1) return null
        return IntArray(referenceWords) { word -> if (word < opening) 0 else word - opening + 1 }
    }
}
