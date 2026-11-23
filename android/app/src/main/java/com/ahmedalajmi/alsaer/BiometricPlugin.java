package com.ahmedalajmi.alsaer;

import android.content.Context;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "Biometric")
public class BiometricPlugin extends Plugin {

    @PluginMethod
    public void isAvailable(PluginCall call) {
        Context context = getContext();
        BiometricManager manager = BiometricManager.from(context);

        int status = manager.canAuthenticate(
                BiometricManager.Authenticators.BIOMETRIC_STRONG
        );

        // نفس منطق authenticate: جهاز بقارئ «ضعيف» فقط ما زال يستطيع المصادقة،
        // فلا نظهر له «الجهاز لا يدعم البصمة».
        boolean available = status == BiometricManager.BIOMETRIC_SUCCESS;
        if (!available) {
            int weak = manager.canAuthenticate(
                    BiometricManager.Authenticators.BIOMETRIC_WEAK
            );
            available = weak == BiometricManager.BIOMETRIC_SUCCESS;
        }

        JSObject result = new JSObject();
        result.put("available", available);
        result.put("code", status);

        call.resolve(result);
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        String reason = call.getString(
                "reason",
                "تأكيد هويتك لفتح تطبيق السائر إلى الله"
        );

        androidx.fragment.app.FragmentActivity activity = (androidx.fragment.app.FragmentActivity) getActivity();
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) {
            call.reject("التطبيق ليس في المقدمة الآن، أعد المحاولة", "ACTIVITY_UNAVAILABLE");
            return;
        }

        Context context = getContext();
        BiometricManager manager = BiometricManager.from(context);
        int status = manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG);

        final int level;
        if (status == BiometricManager.BIOMETRIC_SUCCESS) {
            level = BiometricManager.Authenticators.BIOMETRIC_STRONG;
        } else {
            // بعض الأجهزة تدعم بصمة ضعيفة فقط؛ لا ننهار بل ن revert
            int weak = manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK);
            if (weak != BiometricManager.BIOMETRIC_SUCCESS) {
                call.reject("البصمة غير متاحة على هذا الجهاز", "BIOMETRIC_UNAVAILABLE");
                return;
            }
            level = BiometricManager.Authenticators.BIOMETRIC_WEAK;
        }

        final androidx.fragment.app.FragmentActivity act = activity;
        final int authLevel = level;
        final String promptReason = reason;

        Executor executor = ContextCompat.getMainExecutor(context);
        executor.execute(() -> {
            if (act.isFinishing() || act.isDestroyed()) {
                call.reject("التطبيق ليس في المقدمة الآن، أعد المحاولة", "ACTIVITY_UNAVAILABLE");
                return;
            }
            try {
                BiometricPrompt prompt = new BiometricPrompt(
                        act,
                        executor,
                        new BiometricPrompt.AuthenticationCallback() {

                            @Override
                            public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                                try {
                                    JSObject response = new JSObject();
                                    response.put("success", true);
                                    call.resolve(response);
                                } catch (Throwable ignored) {}
                            }

                            @Override
                            public void onAuthenticationError(int errorCode, CharSequence errString) {
                                try { call.reject(errString.toString(), "BIOMETRIC_ERROR"); } catch (Throwable ignored) {}
                            }

                            @Override
                            public void onAuthenticationFailed() {
                                // البصمة غير متطابقة؛ تظل نافذة التحقق مفتوحة.
                            }
                        }
                );

                BiometricPrompt.PromptInfo info =
                        new BiometricPrompt.PromptInfo.Builder()
                                .setTitle("السائر إلى الله")
                                .setSubtitle(promptReason)
                                .setNegativeButtonText("إلغاء")
                                .setAllowedAuthenticators(authLevel)
                                .build();

                prompt.authenticate(info);
            } catch (Throwable t) {
                call.reject("تعذر فتح نافذة البصمة: " + t.getMessage(), "BIOMETRIC_START_FAILED");
            }
        });
    }
}
