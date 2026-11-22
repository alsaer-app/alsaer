package com.ahmedalajmi.alsaer

import android.app.Activity
import android.os.Build
import android.os.Handler
import android.os.Looper
import ai.quranlab.tajweedformer.TajweedClient
import ai.quranlab.tajweedformer.TajweedClientOptions
import ai.quranlab.tajweedformer.TajweedEvent
import ai.quranlab.tajweedformer.TajweedModel
import ai.quranlab.tajweedformer.TajweedSession
import ai.quranlab.tajweedformer.TajweedSessionOptions
import ai.quranlab.tajweedformer.TajweedError
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONObject

/* محرك Quran Lab TajweedFormer V4 التجريبي: تسميع بمحاذاة وحدات صوتية مقابل وحدات الآيات
   المتوقعة من بيانات المرجع. يعمل على المعالج بلا إنترنت بعد أول تنزيل للنموذج (~٦٣ ميجا).
   المفتاح يأتي من BuildConfig.QURANLAB_KEY (سرّ GitHub وقت البناء) لا يُكتب في المصدر أو السجل؛ وهو مضمّن في APK التجريبي لاستخدام SDK.
   SDK يتطلب أندرويد 8 (API 26)؛ الأجهزة الأقدم تُعلَم بذلك وتبقى على النماذج المحلية. */
object TfEngine {
    private val ui = Handler(Looper.getMainLooper())
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    @Volatile private var sid = 0
    @Volatile private var running = false

    private var client: TajweedClient? = null
    private var model: TajweedModel? = null
    private var session: TajweedSession? = null
    private var mainJob: Job? = null
    private var collectors: Job? = null
    private var ticker: Job? = null

    /* نافذة الآيات: s سورة، a آية، i فهرس أول كلمة (عام في صفحة التلاوة)، n عدد كلمات الآية */
    private class Win(val s: Int, val a: Int, val i: Int, val n: Int)
    private val wins = ArrayList<Win>()
    private val winsLock = Any()

    /* التسلسل المتوقع: وحدات الآيات بلا فواصل الكلمات + فهرس الكلمة العام لكل وحدة + وحدات كل كلمة */
    private var exp = IntArray(0)
    private var expWordJs = IntArray(0)
    private var wordUnits = IntArray(0)
    private var totalJsWords = 0
    private var barId = -1

    /* حالة المحاذاة */
    private var cursorAbs = 0                                    // أول عمود متوقع غير محكوم
    private val heardAll = ArrayList<Int>()                      // الوحدات المسموعة المستقرة (بلا فواصل)
    private var lastTokProc = 0
    private var dropIdx = 0
    private var judged = BooleanArray(0)
    private var lastEmitPos = -1
    private var startWord = 0

    /* هل المحرك متاح على هذا الجهاز/البناء (يظهر في بطاقة النماذج) */
    fun available(): Boolean {
        if (Build.VERSION.SDK_INT < 26) return false
        return try { !BuildConfig.QURANLAB_KEY.isNullOrEmpty() } catch (t: Throwable) { false }
    }

    /* إعداد نافذة التسميع من الصفحة: {"w":[{"s":2,"a":255,"i":0,"n":50},...]} */
    fun configure(json: String) {
        try {
            val config = JSONObject(json)
            startWord = config.optInt("pos", 0).coerceAtLeast(0)
            val arr = config.optJSONArray("w") ?: return
            val tmp = ArrayList<Win>()
            for (k in 0 until arr.length()) {
                val w = arr.getJSONObject(k)
                val x = Win(w.getInt("s"), w.getInt("a"), w.getInt("i"), w.getInt("n"))
                if (x.s in 1..114 && x.a >= 1 && x.n > 0) tmp.add(x)
            }
            synchronized(winsLock) { wins.clear(); wins.addAll(tmp) }
        } catch (t: Throwable) { SherpaAsr.diag("tf: إعداد نافذة غير صالح") }
    }

    /* ختم آخر تقدّم في التجهيز: يُحدَّث من خيط التنزيل ويقرؤه مراقب التوقف */
    private val advStamp = java.util.concurrent.atomic.AtomicLong(0L)
    @Volatile private var stalled = false

    fun start(act: Activity, jsid: Int) {
        sid = jsid
        if (Build.VERSION.SDK_INT < 26) { emitErr(jsid, "oldsdk"); return }
        val key = try { BuildConfig.QURANLAB_KEY } catch (t: Throwable) { "" }
        if (key.isNullOrEmpty()) { emitErr(jsid, "nokey"); return }
        stopInternal()
        running = true
        stalled = false
        advStamp.set(android.os.SystemClock.elapsedRealtime())
        emit(jsid, "loading", "")
        /* نبضة تحميل كل ١٢ ثانية: تنزيل النموذج أول مرة قد يطول، والصفحة تفترض الفشل بعد ٤٥ ثانية بلا نبضة */
        ticker = scope.launch {
            while (isActive) { delay(12000); if (running) emit(jsid, "loading", "") }
        }
        mainJob = scope.launch {
            /* مراقب التوقف: ١٥٠ ثانية بلا أي تقدّم (بايتات أو انتقال مرحلة) = فشل واضح بدل انتظار بلا نهاية.
               SDK نفسه يقطع الطلب بعد ٣٠ ثانية جمود ويستأنف (٥ مرات كحد أقصى لكل ملف)، لكن حلول الاسم (DNS)
               بلا مهلة فيه، والرابط البطيء الحي لا يُقطع أبدًا — من هنا جاء «تعليق» ١٠١٨٧ بلا أي مؤشر */
            val wd = scope.launch {
                while (isActive) {
                    delay(5000)
                    if (running && android.os.SystemClock.elapsedRealtime() - advStamp.get() > 150_000) {
                        stalled = true
                        mainJob?.cancel()
                        break
                    }
                }
            }
            try {
                val c = TajweedClient.current ?: TajweedClient(act.applicationContext, key,
                    TajweedClientOptions(appId = act.packageName))
                client = c
                SherpaAsr.diag("tf: العميل جاهز — فحص النموذج وتنزيله (~63MB أول مرة)")
                advStamp.set(android.os.SystemClock.elapsedRealtime())
                var lastPct = -10
                c.prefetch(unmeteredOnly = false) { done, total ->
                    advStamp.set(android.os.SystemClock.elapsedRealtime())
                    val pct = if (total > 0) ((done * 100) / total).toInt() else -1
                    if (pct >= lastPct + 10 || (total > 0 && done >= total && lastPct < 100)) {
                        lastPct = pct
                        SherpaAsr.diag("tf: تنزيل النموذج ${done / 1048576}/${total / 1048576}MB ($pct%)")
                        emit(jsid, "dl", "$done/$total")
                    }
                }
                if (!running || sid != jsid) return@launch
                SherpaAsr.diag("tf: التنزيل مكتمل — فتح النموذج")
                emit(jsid, "dl", "open")
                advStamp.set(android.os.SystemClock.elapsedRealtime())
                val m = c.model()                                  // يفتح النموذج: فحوص Core واختباره الذاتي
                if (!running || sid != jsid) return@launch
                model = m
                SherpaAsr.diag("tf: النموذج مفتوح — جلب بيانات المرجع")
                emit(jsid, "dl", "ref")
                advStamp.set(android.os.SystemClock.elapsedRealtime())
                val ref = m.reference
                if (ref == null) { fail(jsid, "noref", "بناء النموذج بلا بيانات مرجع"); return@launch }
                try { ref.fetch() } catch (t: Throwable) { failSdk(jsid, "noref", t); return@launch }
                if (!buildExpected(m, ref)) { fail(jsid, "noref", "تعذر بناء التسلسل المتوقع"); return@launch }
                if (!running || sid != jsid) return@launch
                SherpaAsr.diag("tf: المرجع جاهز — بدء جلسة الاستماع")
                advStamp.set(android.os.SystemClock.elapsedRealtime())
                val s = m.listen(TajweedSessionOptions(backend = TajweedSessionOptions.Backend.CPU))          // بلا إيقاف صمتي: مراقب الخمول في الصفحة يملك الإيقاف
                session = s
                resetAlign()
                ticker?.cancel()
                emit(jsid, "ready", "")
                SherpaAsr.diag("tf: جاهز (${exp.size} وحدة متوقعة، $totalJsWords كلمة)")
                collectAll(s, jsid)
            } catch (t: Throwable) {
                if (t is kotlinx.coroutines.CancellationException && !stalled) throw t
                if (stalled) fail(jsid, "dlstall", "لا تقدّم في التجهيز لأكثر من ١٥٠ ثانية")
                else failSdk(jsid, "start", t)
            } finally {
                wd.cancel()
            }
        }
    }

    /* فشل من SDK أو غيره: نسجّل الرمز الثابت والإصلاح المقترح وتقرير diagnose ثم نُعلم الصفحة برمز مفهوم */
    private suspend fun failSdk(jsid: Int, stage: String, t: Throwable) {
        val e = t as? TajweedError
        val code = e?.code ?: t.javaClass.simpleName
        val fix = e?.fix ?: ""
        SherpaAsr.diag("tf: فشل مرحلة $stage: $code — $fix")
        try {
            val d = client?.diagnose()?.toJson()
            if (d != null) SherpaAsr.diag("tf: diagnose: " + if (d.length > 500) d.substring(0, 500) + "…" else d)
        } catch (x: Throwable) { }
        val uiCode = when (code) {
            "needs_connection", "network_not_permitted", "download_failed" -> "net"
            "invalid_key", "server_rejected", "sdk_too_old" -> "key"
            else -> stage
        }
        fail(jsid, uiCode, code)
    }

    fun stop() {
        if (!running && session == null) return
        running = false
        val s = session; session = null
        if (s == null) mainJob?.cancel()
        val jsid = sid
        ticker?.cancel()
        scope.launch {
            try { s?.finish() } catch (t: Throwable) { SherpaAsr.diag("tf: finish: $t") }
            collectors?.cancel()
            emit(jsid, "fin", "")
        }
    }

    private fun stopInternal() {
        running = false
        ticker?.cancel()
        mainJob?.cancel()
        collectors?.cancel()
        val s = session; session = null
        if (s != null) scope.launch { try { s.finish() } catch (t: Throwable) {} }
    }

    private fun fail(jsid: Int, code: String, why: String) {
        running = false
        ticker?.cancel()
        SherpaAsr.diag("tf: فشل ($code): $why")
        emitErr(jsid, code)
    }

    /* بناء التسلسل المتوقع من بيانات المرجع: وحدات كل آية بلا فواصل، مع فهرس الكلمة العام */
    private fun buildExpected(m: TajweedModel, ref: ai.quranlab.tajweedformer.TajweedReference): Boolean {
        val ws: List<Win> = synchronized(winsLock) { ArrayList(wins) }
        if (ws.isEmpty()) return false
        barId = m.tokens.wordBar
        val e = ArrayList<Int>()
        val ewj = ArrayList<Int>()
        val wu = HashMap<Int, Int>()
        var total = 0
        for (w in ws) {
            val units = try { ref.units(w.s, w.a) } catch (t: Throwable) { SherpaAsr.diag("tf: لا مرجع لـ ${w.s}:${w.a}"); return false }
            var wordInAyah = 0
            for (id in units) {
                if (id == barId) { wordInAyah++; continue }
                e.add(id)
                if (wordInAyah >= w.n) { SherpaAsr.diag("tf: word mapping mismatch ${w.s}:${w.a}"); return false }
                val wj = w.i + wordInAyah
                ewj.add(wj)
                wu[wj] = (wu[wj] ?: 0) + 1
            }
            val observed = if (units.lastOrNull() == barId) wordInAyah else wordInAyah + 1
            if (observed != w.n) { SherpaAsr.diag("tf: reference words=$observed UI words=${w.n} at ${w.s}:${w.a}"); return false }
            total = maxOf(total, w.i + w.n)
        }
        exp = e.toIntArray()
        expWordJs = ewj.toIntArray()
        wordUnits = IntArray(total) { wu[it] ?: 1 }
        totalJsWords = total
        return exp.isNotEmpty()
    }

    private fun resetAlign() {
        cursorAbs = expWordJs.indexOfFirst { it >= startWord }.let { if (it < 0) exp.size else it }
        heardAll.clear()
        lastTokProc = 0
        dropIdx = 0
        judged = BooleanArray(totalJsWords) { it < startWord }
        lastEmitPos = -1
    }

    /* بداية مقطع جديد (حد ٢٠ دقيقة): نحتفظ بالمحكوم ونصفّر المسموع فقط */
    private fun resetTake() {
        heardAll.clear()
        lastTokProc = 0
        dropIdx = 0
    }

    private fun collectAll(s: TajweedSession, jsid: Int) {
        val parent = Job(mainJob)
        collectors = parent
        scope.launch(parent) {
            try { s.chunks.collect { ch -> onChunk(ch, jsid) } }
            catch (t: Throwable) { if (t !is kotlinx.coroutines.CancellationException) SherpaAsr.diag("tf: chunks: $t") }
        }
        scope.launch(parent) {
            try { s.events.collect { ev -> onEvent(ev, jsid) } }
            catch (t: Throwable) { if (t !is kotlinx.coroutines.CancellationException) SherpaAsr.diag("tf: events: $t") }
        }
    }

    private fun onChunk(ch: ai.quranlab.tajweedformer.TajweedChunk, jsid: Int) {
        try {
            if (sid != jsid) return
            val d = ch.decoded
            val toks = d.tokens
            val set = if (d.settled > toks.size) toks.size else d.settled
            if (set < lastTokProc) {           // تبديل المسرّع أعاد مقاطع: إعادة بناء المسموع من الرأس
                heardAll.clear()
                lastTokProc = 0
                dropIdx = 0
            }
            if (set > lastTokProc) {
                for (k in lastTokProc until set) {
                    val t = toks[k]
                    if (t.id != barId) heardAll.add(t.id)
                }
                lastTokProc = set
            }
            if (exp.isEmpty()) return
            alignAndJudge(jsid, d.isFinal)
        } catch (t: Throwable) { SherpaAsr.diag("tf: chunk: $t") }
    }

    /* محاذاة fitting بمسافة تحرير: المسموع (صفوف، بحد أقصى ٤٠٠) ضد المتوقع من المؤشر (٦٠٠ عمود) */
    private fun alignAndJudge(jsid: Int, isFinal: Boolean) {
        var m = heardAll.size - dropIdx
        if (m > 400) { dropIdx += m - 400; m = 400 }
        if (m <= 0) return
        val n0 = cursorAbs
        val n = minOf(exp.size - n0, 600)
        if (n <= 0) return
        val W = n + 1
        val dp = IntArray((m + 1) * W)
        for (j in 1..n) dp[j] = j
        for (i in 1..m) {
            dp[i * W] = i
            val hi = heardAll[dropIdx + i - 1]
            val base = i * W
            val prev = base - W
            for (j in 1..n) {
                val sub = dp[prev + j - 1] + (if (hi == exp[n0 + j - 1]) 0 else 1)
                val del = dp[base + j - 1] + 1
                val ins = dp[prev + j] + 1
                dp[base + j] = minOf(sub, minOf(del, ins))
            }
        }
        var bestJ = 0
        var bestV = Int.MAX_VALUE
        val lastRow = m * W
        for (j in 0..n) if (dp[lastRow + j] < bestV) { bestV = dp[lastRow + j]; bestJ = j }
        /* تتبع خلفي: أي أعمدة المتوقع طابقت وحدة مسموعة تمامًا */
        val colMatched = BooleanArray(n)
        val colHeardEnd = IntArray(n)
        var i = m
        var j = bestJ
        while (i > 0) {
            val base = i * W
            val prev = base - W
            if (j > 0 && dp[base + j] == dp[prev + j - 1] + (if (heardAll[dropIdx + i - 1] == exp[n0 + j - 1]) 0 else 1)) {
                colMatched[j - 1] = heardAll[dropIdx + i - 1] == exp[n0 + j - 1]
                colHeardEnd[j - 1] = i
                i--; j--
            } else if (dp[base + j] == dp[prev + j] + 1) {
                i--                                  // وحدة مسموعة زائدة: تُتجاهل
            } else if (j > 0) {
                j--                                  // وحدة متوقعة طُفيت: نقص في الكلمة
            } else i--
        }
        if (colMatched.count { it } < minOf(3, m) || colMatched.count { it } * 2 < m) return
        val absEnd = n0 + bestJ
        if (absEnd <= cursorAbs) return
        val lastTouched = expWordJs[absEnd - 1]
        val okList = ArrayList<Int>()
        val missList = ArrayList<Int>()
        var c = cursorAbs
        while (c < absEnd) {
            val wj = expWordJs[c]
            var e = c
            var matched = 0
            while (e < absEnd && expWordJs[e] == wj) { if (colMatched[e - n0]) matched++; e++ }
            val inProgress = wj == lastTouched && !isFinal
            if (!inProgress && wj < judged.size && !judged[wj]) {
                judged[wj] = true
                val full = if (wj < wordUnits.size) wordUnits[wj] else (e - c)
                if (matched * 10 >= full * 7) okList.add(wj) else missList.add(wj)
            }
            c = e
        }
        /* تقديم المؤشر إلى أول كلمة غير محكومة */
        var nc = cursorAbs
        while (nc < absEnd) {
            val wj = expWordJs[nc]
            if (wj >= judged.size || !judged[wj]) break
            var e = nc
            while (e < absEnd && expWordJs[e] == wj) e++
            nc = e
        }
        if (nc > cursorAbs) {
            var consumed = 0
            for (k in 0 until (nc - n0)) consumed = maxOf(consumed, colHeardEnd[k])
            val remove = (dropIdx + consumed).coerceAtMost(heardAll.size)
            if (remove > 0) heardAll.subList(0, remove).clear()
            dropIdx = 0
        }
        cursorAbs = nc
        val posJs = if (cursorAbs < exp.size) expWordJs[cursorAbs] else totalJsWords
        if (okList.isEmpty() && missList.isEmpty() && posJs == lastEmitPos) return
        lastEmitPos = posJs
        val o = JSONObject()
        o.put("ok", org.json.JSONArray(okList))
        o.put("miss", org.json.JSONArray(missList))
        o.put("pos", posJs)
        emit(jsid, "wd", o.toString())
    }

    private fun onEvent(ev: TajweedEvent, jsid: Int) {
        if (sid != jsid) return
        when (ev) {
            is TajweedEvent.Ended -> when (ev.reason) {
                TajweedEvent.Ended.Reason.ERROR -> {
                    SherpaAsr.diag("tf: انتهى بخطأ: ${ev.error?.code}")
                    running = false
                    emitErr(jsid, "run")
                }
                TajweedEvent.Ended.Reason.LIMIT -> if (running) {
                    /* حد العشرين دقيقة: مقطع جديد بنفس المحاذاة */
                    scope.launch {
                        try {
                            val m = model ?: return@launch
                            val s = m.listen(TajweedSessionOptions(backend = TajweedSessionOptions.Backend.CPU))
                            session = s
                            resetTake()
                            collectAll(s, jsid)
                            SherpaAsr.diag("tf: مقطع جديد بعد حد ٢٠ دقيقة")
                        } catch (t: Throwable) { fail(jsid, "run", t.javaClass.simpleName) }
                    }
                }
                else -> {
                    SherpaAsr.diag("tf: انتهى المقطع (${ev.reason})")
                    if (running) { running = false; emitErr(jsid, "stopped") }
                }
            }
            is TajweedEvent.BackendChanged -> SherpaAsr.diag("tf: تبديل المسرّع إلى ${ev.backend} من المقطع ${ev.fromChunk}")
            else -> {}
        }
    }

    /* ---------- إيصال الأحداث للصفحة (نفس صيغة SherpaAsr) ---------- */

    private fun emit(s: Int, type: String, data: String) {
        val js = "window.__rcAsr&&window.__rcAsr(" + JSONObject.quote(type) + "," + s + "," + JSONObject.quote(data) + ")"
        ui.post {
            try { Speech.wv?.evaluateJavascript(js, null) }
            catch (e: Exception) { SherpaAsr.diag("فشل إيصال حدث tf للصفحة (wv)") }
        }
    }

    private fun emitErr(s: Int, code: String) {
        SherpaAsr.diag("tf err: $code")
        emit(s, "err", code)
    }
}
