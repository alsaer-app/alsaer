package com.ahmedalajmi.alsaer

/* كسب تلقائي برمجي للميكروفون الخام (نفس خوارزمية SherpaAsr التي أُثبتت في 10183): هدف rms ≈ ٠٫٠٧،
   سقف ٢٠×، بوابة ضجيج ٠٫٠٠٢، ومنع القصّ فورًا. بلا أي اعتماد على أندرويد كي يُختبر بمفرده.
   يجمع أيضًا إحصاءات المستوى (قبل الكسب) لسجل التشخيص: rms وذروة ومدة الكلام وعدد المقاطع المقصوصة. */
class TfAgc {
    var gain = 1f
        private set

    private var frames = 0
    private var voiced = 0
    private var voicedRmsSum = 0.0
    private var voicedGainSum = 0.0
    private var maxRawPeak = 0f
    private var maxRawRms = 0f
    private var clipped = 0
    private var wFrames = 0
    private var wRmsMax = 0f
    private var wPeakMax = 0f
    private var wGainMax = 0f

    /* يعالج n عيّنة في f (قيم -1..1) في مكانها ويُحدّث الإحصاءات */
    fun process(f: FloatArray, n: Int) {
        if (n <= 0) return
        var ss = 0.0
        var pk = 0f
        for (i in 0 until n) {
            val v = f[i]
            ss += v.toDouble() * v
            val a = if (v < 0f) -v else v
            if (a > pk) pk = a
        }
        val rms = Math.sqrt(ss / n).toFloat()
        var want = 1f
        if (rms > 0.002f) want = Math.min(20f, 0.07f / rms)
        if (pk * want > 0.95f) want = 0.95f / Math.max(1e-6f, pk)
        gain += (want - gain) * 0.25f
        if (pk * gain > 0.98f) gain = 0.98f / Math.max(1e-6f, pk)
        for (i in 0 until n) f[i] *= gain
        frames++
        if (rms > 0.002f) { voiced++; voicedRmsSum += rms; voicedGainSum += gain }
        if (pk > maxRawPeak) maxRawPeak = pk
        if (rms > maxRawRms) maxRawRms = rms
        if (pk >= 0.98f) clipped++
        wFrames++
        if (rms > wRmsMax) wRmsMax = rms
        if (pk > wPeakMax) wPeakMax = pk
        if (gain > wGainMax) wGainMax = gain
    }

    /* سطر نافذة قصيرة ثم تصفير النافذة */
    fun windowLine(): String {
        val s = String.format(java.util.Locale.US, "mic win rms_max=%.4f peak_max=%.3f g_max=%.1fx n=%d", wRmsMax, wPeakMax, wGainMax, wFrames)
        wFrames = 0; wRmsMax = 0f; wPeakMax = 0f; wGainMax = 0f
        return s
    }

    /* ملخص المقطع كاملًا */
    fun summary(): String {
        val vr = if (voiced > 0) voicedRmsSum / voiced else 0.0
        val vg = if (voiced > 0) voicedGainSum / voiced else 0.0
        return String.format(java.util.Locale.US,
            "mic take: frames=%d voiced=%d rms_voiced_avg=%.4f rms_max=%.4f peak_max=%.3f g_voiced_avg=%.1fx clipped=%d",
            frames, voiced, vr, maxRawRms, maxRawPeak, vg, clipped)
    }
}
