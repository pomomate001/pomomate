package com.pomomate.app

import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class PiPModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    var instance: PiPModule? = null

    fun notifyPiPChanged(isInPiP: Boolean) {
      instance?.let { module ->
        try {
          if (module.reactContext.hasActiveReactInstance()) {
            module.reactContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
              ?.emit("onPiPModeChanged", isInPiP)
          }
        } catch (_: Exception) {
        }
      }
    }
  }

  init {
    instance = this
  }

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
    val activity = currentActivity as? MainActivity
    activity?.runOnUiThread {
      activity.updateAutoPiP(enabled)
    }
    promise.resolve(true)
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required for React Native event emitter
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required for React Native event emitter
  }
}

