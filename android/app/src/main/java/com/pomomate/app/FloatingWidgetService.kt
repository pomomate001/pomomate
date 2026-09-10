package com.pomomate.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.view.LayoutInflater
import android.widget.ImageButton
import androidx.core.app.NotificationCompat
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.torrydo.floatingbubbleview.*
import com.torrydo.floatingbubbleview.service.expandable.*

import android.content.pm.ServiceInfo
import android.os.Handler
import android.os.Looper
import androidx.core.app.ServiceCompat

class FloatingWidgetService : ExpandableBubbleService() {

    companion object {
        const val CHANNEL_ID = "floating_widget_channel"
        const val NOTIFICATION_ID = 101
        
        var instance: FloatingWidgetService? = null
        var currentMicOn: Boolean = true
        var currentCamOn: Boolean = false
        var currentScreenShareOn: Boolean = false
    }

    private var micButton: ImageButton? = null
    private var camButton: ImageButton? = null
    private var screenButton: ImageButton? = null

    override fun onCreate() {
        try {
            super.onCreate()
            instance = this
            minimize()
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    override fun onDestroy() {
        if (instance == this) {
            instance = null
        }
        super.onDestroy()
    }

    /**
     * Overrides FloatingBubbleService's open method startNotificationForeground().
     * This intercepts the library's internal startForeground call, ensuring our custom
     * notification channel and Android 14+ foreground service types are used safely without duplicates.
     */
    override fun startNotificationForeground() {
        try {
            val notification = createNotification()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                ServiceCompat.startForeground(
                    this,
                    NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
                )
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun createNotification(): Notification {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "PomoMate Widget",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }

        val iconRes = try {
            val resId = resources.getIdentifier("notification_icon", "drawable", packageName)
            if (resId != 0) resId else android.R.drawable.ic_dialog_info
        } catch (e: Exception) {
            android.R.drawable.ic_dialog_info
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("PomoMate")
            .setContentText("Mini Mod aktif")
            .setSmallIcon(iconRes)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun configBubble(): BubbleBuilder? {
        return try {
            val themedContext = android.view.ContextThemeWrapper(this, R.style.AppTheme)
            val bubbleView = LayoutInflater.from(themedContext).inflate(R.layout.floating_bubble, null)
            bubbleView.setOnClickListener { expand() }
            bubbleView.setOnLongClickListener {
                try {
                    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                    if (launchIntent != null) {
                        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                        startActivity(launchIntent)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                true
            }

            BubbleBuilder(this)
                .bubbleView(bubbleView)
                .startLocation(0, 100)
                .enableAnimateToEdge(true)
                .distanceToClose(100)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    override fun configExpandedBubble(): ExpandedBubbleBuilder? {
        return try {
            val themedContext = android.view.ContextThemeWrapper(this, R.style.AppTheme)
            val menuView = LayoutInflater.from(themedContext).inflate(R.layout.floating_menu, null)

            micButton = menuView.findViewById(R.id.btn_mic)
            camButton = menuView.findViewById(R.id.btn_cam)
            screenButton = menuView.findViewById(R.id.btn_screen)
            val openAppButton = menuView.findViewById<ImageButton?>(R.id.btn_open_app)
            val closeButton = menuView.findViewById<ImageButton>(R.id.btn_close_menu)

            updateButtonStates()

            micButton?.setOnClickListener {
                sendEventToJS("toggleMic")
            }
            camButton?.setOnClickListener {
                sendEventToJS("toggleCam")
            }
            screenButton?.setOnClickListener {
                sendEventToJS("toggleScreen")
            }
            openAppButton?.setOnClickListener {
                try {
                    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                    if (launchIntent != null) {
                        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                        startActivity(launchIntent)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                minimize()
            }
            closeButton?.setOnClickListener {
                minimize()
            }

            ExpandedBubbleBuilder(this)
                .expandedView(menuView)
                .dimAmount(0.0f) // No dimming to keep it unintrusive
                .fillMaxWidth(false)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun updateButtonStates() {
        Handler(Looper.getMainLooper()).post {
            micButton?.setImageResource(if (currentMicOn) R.drawable.ic_pip_mic_on else R.drawable.ic_pip_mic_off)
            camButton?.setImageResource(if (currentCamOn) R.drawable.ic_pip_cam_on else R.drawable.ic_pip_cam_off)
            screenButton?.setImageResource(if (currentScreenShareOn) R.drawable.ic_pip_screen_on else R.drawable.ic_pip_screen_off)
        }
    }

    private fun sendEventToJS(action: String) {
        val reactContext = FloatingWidgetModule.contextRef
            ?: (application as? ReactApplication)?.reactHost?.currentReactContext

        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("onOverlayAction", action)
    }
}
