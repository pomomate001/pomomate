package com.pomomate.app
import expo.modules.splashscreen.SplashScreenManager

import android.app.PictureInPictureParams
import android.app.PendingIntent
import android.app.RemoteAction
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.graphics.drawable.Icon
import android.os.Build
import android.os.Bundle
import android.util.Rational

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import com.oney.WebRTCModule.WebRTCModuleOptions

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {

  companion object {
    var instance: MainActivity? = null
    var isInPiPMode: Boolean = false
    var autoPiPEnabled: Boolean = false
  }

  private var pipReceiver: BroadcastReceiver? = null
  private var currentMicOn: Boolean = true
  private var currentCamOn: Boolean = false

  override fun onUserLeaveHint() {
    super.onUserLeaveHint()
    if (autoPiPEnabled) {
      enterPiPMode()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen

    // Enable WebRTC MediaProjection foreground service for screen sharing
    val options = WebRTCModuleOptions.getInstance()
    options.enableMediaProjectionService = true

    super.onCreate(null)
    instance = this

    // Register receiver for PiP RemoteActions
    val filter = IntentFilter().apply {
      addAction("com.pomomate.app.ACTION_TOGGLE_MIC")
      addAction("com.pomomate.app.ACTION_TOGGLE_CAM")
    }
    pipReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        when (intent?.action) {
          "com.pomomate.app.ACTION_TOGGLE_MIC" -> PiPModule.notifyPiPAction("toggleMic")
          "com.pomomate.app.ACTION_TOGGLE_CAM" -> PiPModule.notifyPiPAction("toggleCam")
        }
      }
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(pipReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      registerReceiver(pipReceiver, filter)
    }
  }

  override fun onDestroy() {
    autoPiPEnabled = false
    isInPiPMode = false
    pipReceiver?.let {
      try {
        unregisterReceiver(it)
      } catch (e: Exception) {
      }
      pipReceiver = null
    }
    if (instance == this) {
      instance = null
    }
    super.onDestroy()
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
   * Enter Picture-in-Picture mode with slim aspect ratio and native actions
   */
  fun enterPiPMode() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val builder = PictureInPictureParams.Builder()
        .setAspectRatio(Rational(239, 100))

      val actions = createPiPActions(currentMicOn, currentCamOn)
      if (actions.isNotEmpty()) {
        builder.setActions(actions)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        builder.setAutoEnterEnabled(autoPiPEnabled)
      }
      enterPictureInPictureMode(builder.build())
    }
  }

  fun updatePiPActions(micOn: Boolean, camOn: Boolean) {
    currentMicOn = micOn
    currentCamOn = camOn
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val builder = PictureInPictureParams.Builder()
        .setAspectRatio(Rational(239, 100))
      val actions = createPiPActions(micOn, camOn)
      if (actions.isNotEmpty()) {
        builder.setActions(actions)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        builder.setAutoEnterEnabled(autoPiPEnabled)
      }
      setPictureInPictureParams(builder.build())
    }
  }

  private fun createPiPActions(micOn: Boolean, camOn: Boolean): List<RemoteAction> {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return emptyList()
    val actions = mutableListOf<RemoteAction>()

    try {
      val micIntent = Intent("com.pomomate.app.ACTION_TOGGLE_MIC").setPackage(packageName)
      val micFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
      val micPendingIntent = PendingIntent.getBroadcast(this, 101, micIntent, micFlags)
      val micIcon = Icon.createWithResource(this, android.R.drawable.ic_btn_speak_now)
      actions.add(RemoteAction(micIcon, if (micOn) "Mute" else "Unmute", if (micOn) "Mute Mic" else "Unmute Mic", micPendingIntent))

      val camIntent = Intent("com.pomomate.app.ACTION_TOGGLE_CAM").setPackage(packageName)
      val camPendingIntent = PendingIntent.getBroadcast(this, 102, camIntent, micFlags)
      val camIcon = Icon.createWithResource(this, android.R.drawable.ic_menu_camera)
      actions.add(RemoteAction(camIcon, if (camOn) "Cam Off" else "Cam On", if (camOn) "Turn Off Cam" else "Turn On Cam", camPendingIntent))
    } catch (e: Exception) {
    }
    return actions
  }

  fun updateAutoPiP(enabled: Boolean) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val builder = PictureInPictureParams.Builder()
        .setAspectRatio(Rational(239, 100))
        .setAutoEnterEnabled(enabled)
      val actions = createPiPActions(currentMicOn, currentCamOn)
      if (actions.isNotEmpty()) {
        builder.setActions(actions)
      }
      setPictureInPictureParams(builder.build())
    }
  }

  override fun onPictureInPictureModeChanged(
    isInPictureInPictureMode: Boolean,
    newConfig: Configuration
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    isInPiPMode = isInPictureInPictureMode
    PiPModule.notifyPiPChanged(isInPictureInPictureMode)
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}

