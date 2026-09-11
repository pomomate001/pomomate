package com.pomomate.app

import android.app.Activity
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.View
import android.view.WindowManager
import com.facebook.react.bridge.*

class FloatingWidgetModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        var contextRef: ReactApplicationContext? = null
    }

    init {
        contextRef = reactContext
    }

    override fun getName(): String = "FloatingWidget"

    /**
     * Bulletproof permission check.
     * Combines AppOpsManager, Settings.canDrawOverlays, and a functional WindowManager addView test.
     * This eliminates false-positives caused by MediaProjection (screen share) temporarily granting
     * overlay permission at the system level on Android 12.
     */
    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            // 1. AppOpsManager check — strictly checks whether user explicitly enabled the setting
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
            if (appOps != null) {
                val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    appOps.unsafeCheckOpNoThrow(
                        AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW,
                        android.os.Process.myUid(),
                        reactContext.packageName
                    )
                } else {
                    appOps.checkOpNoThrow(
                        AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW,
                        android.os.Process.myUid(),
                        reactContext.packageName
                    )
                }
                if (mode != AppOpsManager.MODE_ALLOWED) {
                    promise.resolve(false)
                    return
                }
            }

            // 2. Settings check
            if (!Settings.canDrawOverlays(reactContext)) {
                promise.resolve(false)
                return
            }

            // 3. Functional check: attempt to add and immediately remove a 0x0 transparent view.
            // If the system rejects TYPE_APPLICATION_OVERLAY, this will throw SecurityException/BadTokenException.
            val wm = reactContext.getSystemService(Context.WINDOW_SERVICE) as? WindowManager
            if (wm != null) {
                val testView = View(reactContext)
                val testParams = WindowManager.LayoutParams(
                    0, 0,
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    else
                        WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT
                )
                try {
                    wm.addView(testView, testParams)
                    wm.removeView(testView)
                } catch (wmEx: Exception) {
                    promise.resolve(false)
                    return
                }
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Unconditionally opens the system "Appear on top" / "Üstte göster" permission settings screen.
     * Uses currentActivity when available and provides multiple OEM fallbacks (Samsung, Xiaomi, etc.).
     */
    @ReactMethod
    fun requestPermission(promise: Promise) {
        val activity = reactContext.currentActivity ?: MainActivity.instance

        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactContext.packageName)
            )
            if (activity != null) {
                activity.startActivity(intent)
            } else {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                // Fallback 1: Generic overlay permission list without package URI
                val genericIntent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                if (activity != null) {
                    activity.startActivity(genericIntent)
                } else {
                    reactContext.startActivity(genericIntent)
                }
                promise.resolve(true)
            } catch (e2: Exception) {
                try {
                    // Fallback 2: Application details settings page
                    val appDetailsIntent = Intent(
                        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                        Uri.parse("package:" + reactContext.packageName)
                    ).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    if (activity != null) {
                        activity.startActivity(appDetailsIntent)
                    } else {
                        reactContext.startActivity(appDetailsIntent)
                    }
                    promise.resolve(true)
                } catch (e3: Exception) {
                    promise.reject("PERMISSION_ERROR", e3.message)
                }
            }
        }
    }

    @ReactMethod
    fun showWidget(promise: Promise) {
        // Verify real overlay capability
        if (!Settings.canDrawOverlays(reactContext)) {
            promise.reject("PERMISSION_DENIED", "Overlay permission not granted")
            return
        }

        val activity = reactContext.currentActivity ?: MainActivity.instance

        try {
            val intent = Intent(reactContext, FloatingWidgetService::class.java)
            // Use startService universally. SYSTEM_ALERT_WINDOW provides background start exemption.
            // This prevents ForegroundServiceStartNotAllowedException and 10s ANR crashes on Android 12+.
            reactContext.startService(intent)

            // Only minimize the app to background IF the overlay has confirmed it is attached and displaying!
            // This prevents dumping the user to the home screen if the service encounters an error.
            Handler(Looper.getMainLooper()).postDelayed({
                try {
                    if (FloatingWidgetService.isOverlayAttached) {
                        val minimized = activity?.moveTaskToBack(true) ?: false
                        if (!minimized) {
                            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                                addCategory(Intent.CATEGORY_HOME)
                                flags = Intent.FLAG_ACTIVITY_NEW_TASK
                            }
                            reactContext.startActivity(homeIntent)
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }, 600)

            promise.resolve(true)
        } catch (e: Exception) {
            try {
                val fallbackIntent = Intent(reactContext, FloatingWidgetService::class.java)
                reactContext.startService(fallbackIntent)
                Handler(Looper.getMainLooper()).postDelayed({
                    if (FloatingWidgetService.isOverlayAttached) {
                        activity?.moveTaskToBack(true)
                    }
                }, 600)
                promise.resolve(true)
            } catch (fallbackEx: Exception) {
                promise.reject("SERVICE_START_FAILED", fallbackEx.message)
            }
        }
    }

    @ReactMethod
    fun hideWidget(promise: Promise) {
        val intent = Intent(reactContext, FloatingWidgetService::class.java)
        reactContext.stopService(intent)
        FloatingWidgetService.isOverlayAttached = false
        promise.resolve(true)
    }

    @ReactMethod
    fun updateWidgetActions(micOn: Boolean, camOn: Boolean, screenShareOn: Boolean, promise: Promise) {
        FloatingWidgetService.currentMicOn = micOn
        FloatingWidgetService.currentCamOn = camOn
        FloatingWidgetService.currentScreenShareOn = screenShareOn
        FloatingWidgetService.instance?.updateButtonStates()
        promise.resolve(true)
    }
}
