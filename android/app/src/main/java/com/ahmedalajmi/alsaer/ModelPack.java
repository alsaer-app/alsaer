package com.ahmedalajmi.alsaer;

import android.app.Activity;

import java.io.File;

/** أُزيل النموذج المحلي من التطبيق. هذه الفئة تبقى فقط لحذف أي حزمة نموذج سبق تنزيلها (≈١٥٠ ميجا) وتحرير مساحتها. */
public class ModelPack {
    private final Activity act;

    public ModelPack(Activity a) { act = a; }

    public File dir() { return new File(act.getFilesDir(), "pack"); }
    public boolean ready() { return dir().exists(); }

    public void delete() { rm(dir()); }

    private static void rm(File f) {
        if (f == null || !f.exists()) return;
        File[] k = f.listFiles();
        if (k != null) for (File c : k) rm(c);
        f.delete();
    }
}
