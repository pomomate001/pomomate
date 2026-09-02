package com.pomomate.app

import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PiPModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "PiPModule"

  @ReactMethod
  fun enterPiPMode(promise: Promise) {
    val activity = currentActivity as? MainActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "Activity not found")
      return
    }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      promise.reject("NOT_SUPPORTED", "PiP is not supported on this Android version")
      return
    }

    try {
      activity.runOnUiThread {
        activity.enterPiPMode()
        promise.resolve(true)
      }
    } catch (e: Exception) {
      promise.reject("PIP_ERROR", "Failed to enter PiP mode: ${e.message}")
    }
  }

  @ReactMethod
  fun isPiPSupported(promise: Promise) {
    promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
  }

  @ReactMethod
  fun isInPiPMode(promise: Promise) {
    promise.resolve(MainActivity.isInPiPMode)
  }

  @ReactMethod
  fun setAutoPiPEnabled(enabled: Boolean, promise: Promise) {
    MainActivity.autoPiPEnabled = enabled
    promise.resolve(true)
  }
}
