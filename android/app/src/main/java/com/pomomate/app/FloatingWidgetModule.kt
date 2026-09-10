package com.pomomate.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
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

    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            val granted = Settings.canDrawOverlays(reactContext)
            promise.resolve(granted)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        try {
            if (!Settings.canDrawOverlays(reactContext)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactContext.packageName)
                ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
                reactContext.startActivity(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                // Fallback for OEM devices (Xiaomi, Vivo, Huawei, etc.) where package URI is rejected
                val genericIntent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(genericIntent)
                promise.resolve(true)
            } catch (fallbackEx: Exception) {
                promise.reject("PERMISSION_ERROR", fallbackEx.message)
            }
        }
    }

    @ReactMethod
    fun showWidget(promise: Promise) {
        if (!Settings.canDrawOverlays(reactContext)) {
            promise.reject("PERMISSION_DENIED", "Overlay permission not granted")
            return
        }

        val currentActivity = reactApplicationContext.currentActivity ?: MainActivity.instance
        
        try {
            val intent = Intent(reactContext, FloatingWidgetService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            
            // Minimize current task cleanly to background instead of launching an intrusive Home intent
            currentActivity?.runOnUiThread {
                try {
                    val minimized = currentActivity?.moveTaskToBack(true) ?: false
                    if (!minimized) {
                        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                            addCategory(Intent.CATEGORY_HOME)
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                        reactContext.startActivity(homeIntent)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            // In case of Android 12+ strict foreground service start limitation, fallback gracefully
            try {
                val fallbackIntent = Intent(reactContext, FloatingWidgetService::class.java)
                reactContext.startService(fallbackIntent)
                currentActivity?.moveTaskToBack(true)
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
