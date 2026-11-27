package com.ahmedalajmi.alsaer;

/**
 * Pure decisions of the reminder system (no Android classes, so a host JVM test can run them).
 * Rules: schedule only a rolling horizon, never fire an event whose time has passed,
 * show a delivered alarm only inside a short window, never show the same event twice.
 */
final class ReminderPlan {
    private ReminderPlan() {}

    /** Alarms exist only for the next two days; a rebuild (open, boot, periodic work, rebuild alarm) extends the window. */
    static final long HORIZON_MS = 2L * 24L * 3600L * 1000L;
    /** Prayer, fasting and snooze alarms are exact: late by more than this means the device was off or asleep, so drop them. */
    static final long LATE_EXACT_MS = 5L * 60L * 1000L;
    /** Window alarms may be delivered up to 10 minutes after their time by design; allow a margin, then drop. */
    static final long LATE_WINDOW_MS = 15L * 60L * 1000L;
    /** The rebuild alarm fires well before the horizon ends. */
    static final long REBUILD_AFTER_MS = 36L * 3600L * 1000L;

    /** True when the event time is in the future and inside the scheduling horizon. */
    static boolean inHorizon(long at, long now) {
        return at > now && at <= now + HORIZON_MS;
    }

    static long lateLimit(boolean exact) {
        return exact ? LATE_EXACT_MS : LATE_WINDOW_MS;
    }

    /** True when an alarm intended for {@code due} reached us too late to be worth showing. due <= 0 (old alarms without the stamp) is never stale. */
    static boolean isStale(long due, long now, boolean exact) {
        return due > 0 && now - due > lateLimit(exact);
    }

    /** True when this exact occurrence (same due time) was already handled. */
    static boolean isDuplicate(long lastHandledDue, long due) {
        return due > 0 && lastHandledDue == due;
    }
}
