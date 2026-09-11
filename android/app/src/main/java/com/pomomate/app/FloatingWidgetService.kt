package com.pomomate.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.torrydo.floatingbubbleview.*
import com.torrydo.floatingbubbleview.service.expandable.*

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
            startNotificationForeground()
            super.onCreate()
            instance = this
            // super.onCreate() calls setup() which already adds the floating bubble to the WindowManager.
            // Calling minimize() here causes IllegalStateException (view already added) and crashes the service.
        } catch (e: Exception) {
            e.printStackTrace()
            try {
                startNotificationForeground()
            } catch (ignored: Exception) {}
            // Avoid killing the service synchronously before Android acknowledges startForeground
            Handler(Looper.getMainLooper()).post {
                stopSelf()
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try {
            startNotificationForeground()
            super.onStartCommand(intent, flags, startId)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return START_NOT_STICKY
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
        val bubbleView: View = try {
            val themedContext = android.view.ContextThemeWrapper(this, R.style.AppTheme)
            val v = LayoutInflater.from(themedContext).inflate(R.layout.floating_bubble, null)
            v ?: createDefaultBubbleView()
        } catch (e: Exception) {
            e.printStackTrace()
            createDefaultBubbleView()
        }

        bubbleView.setOnClickListener { expand() }
        bubbleView.setOnLongClickListener {
            bringAppToFront()
            true
        }

        return BubbleBuilder(this)
            .bubbleView(bubbleView)
            .startLocation(0, 100)
            .enableAnimateToEdge(true)
            .distanceToClose(100)
    }

    private fun createDefaultBubbleView(): View {
        val density = resources.displayMetrics.density
        val size = (60 * density).toInt()
        val innerSize = (32 * density).toInt()
        val frame = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(size, size)
            val bg = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#212121"))
                setStroke((2 * density).toInt(), Color.parseColor("#A855F7"))
            }
            background = bg
            elevation = 8 * density
        }

        val iv = ImageView(this).apply {
            layoutParams = FrameLayout.LayoutParams(innerSize, innerSize, Gravity.CENTER)
            val logoRes = resources.getIdentifier("ic_logo", "drawable", packageName)
            if (logoRes != 0) {
                setImageResource(logoRes)
            } else {
                setImageResource(android.R.drawable.ic_dialog_info)
            }
        }
        frame.addView(iv)
        return frame
    }

    override fun configExpandedBubble(): ExpandedBubbleBuilder? {
        val menuView: View = try {
            val themedContext = android.view.ContextThemeWrapper(this, R.style.AppTheme)
            val v = LayoutInflater.from(themedContext).inflate(R.layout.floating_menu, null)
            v ?: createDefaultMenuView()
        } catch (e: Exception) {
            e.printStackTrace()
            createDefaultMenuView()
        }

        micButton = menuView.findViewById(R.id.btn_mic)
        camButton = menuView.findViewById(R.id.btn_cam)
        screenButton = menuView.findViewById(R.id.btn_screen)
        val openAppButton = menuView.findViewById<ImageButton?>(R.id.btn_open_app)
        val closeButton = menuView.findViewById<ImageButton?>(R.id.btn_close_menu)

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
            bringAppToFront()
            minimize()
        }
        closeButton?.setOnClickListener {
            minimize()
        }

        return ExpandedBubbleBuilder(this)
            .expandedView(menuView)
            .dimAmount(0.0f) // No dimming to keep it unintrusive
            .fillMaxWidth(false)
    }

    private fun createDefaultMenuView(): View {
        val density = resources.displayMetrics.density
        val padding = (8 * density).toInt()
        val btnSize = (48 * density).toInt()
        val margin = (8 * density).toInt()

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(padding, padding, padding, padding)
            gravity = Gravity.CENTER
            val bg = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = 24 * density
                setColor(Color.parseColor("#212121"))
                setStroke((1 * density).toInt(), Color.parseColor("#A855F7"))
            }
            background = bg
            elevation = 8 * density
        }

        fun createBtn(id: Int, iconResName: String, fallbackIcon: Int): ImageButton {
            return ImageButton(this).apply {
                this.id = id
                layoutParams = LinearLayout.LayoutParams(btnSize, btnSize).apply {
                    marginEnd = margin
                }
                setBackgroundColor(Color.TRANSPARENT)
                val resId = resources.getIdentifier(iconResName, "drawable", packageName)
                if (resId != 0) setImageResource(resId) else setImageResource(fallbackIcon)
            }
        }

        layout.addView(createBtn(R.id.btn_mic, "ic_pip_mic_on", android.R.drawable.ic_btn_speak_now))
        layout.addView(createBtn(R.id.btn_cam, "ic_pip_cam_off", android.R.drawable.ic_menu_camera))
        layout.addView(createBtn(R.id.btn_screen, "ic_pip_screen_off", android.R.drawable.ic_menu_share))
        layout.addView(createBtn(R.id.btn_open_app, "ic_pip_expand", android.R.drawable.ic_menu_view))
        val closeBtn = ImageButton(this).apply {
            this.id = R.id.btn_close_menu
            layoutParams = LinearLayout.LayoutParams(btnSize, btnSize)
            setBackgroundColor(Color.TRANSPARENT)
            val resId = resources.getIdentifier("ic_pip_close", "drawable", packageName)
            if (resId != 0) setImageResource(resId) else setImageResource(android.R.drawable.ic_menu_close_clear_cancel)
        }
        layout.addView(closeBtn)

        return layout
    }

    private fun bringAppToFront() {
        try {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                startActivity(launchIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun updateButtonStates() {
        Handler(Looper.getMainLooper()).post {
            try {
                val micDrawable = androidx.core.content.ContextCompat.getDrawable(this, if (currentMicOn) R.drawable.ic_pip_mic_on else R.drawable.ic_pip_mic_off)
                if (micDrawable != null) micButton?.setImageDrawable(micDrawable) else micButton?.setImageResource(if (currentMicOn) android.R.drawable.ic_btn_speak_now else android.R.drawable.ic_delete)
            } catch (e: Exception) {
                micButton?.setImageResource(if (currentMicOn) android.R.drawable.ic_btn_speak_now else android.R.drawable.ic_delete)
            }

            try {
                val camDrawable = androidx.core.content.ContextCompat.getDrawable(this, if (currentCamOn) R.drawable.ic_pip_cam_on else R.drawable.ic_pip_cam_off)
                if (camDrawable != null) camButton?.setImageDrawable(camDrawable) else camButton?.setImageResource(if (currentCamOn) android.R.drawable.ic_menu_camera else android.R.drawable.ic_delete)
            } catch (e: Exception) {
                camButton?.setImageResource(if (currentCamOn) android.R.drawable.ic_menu_camera else android.R.drawable.ic_delete)
            }

            try {
                val screenDrawable = androidx.core.content.ContextCompat.getDrawable(this, if (currentScreenShareOn) R.drawable.ic_pip_screen_on else R.drawable.ic_pip_screen_off)
                if (screenDrawable != null) screenButton?.setImageDrawable(screenDrawable) else screenButton?.setImageResource(if (currentScreenShareOn) android.R.drawable.ic_menu_share else android.R.drawable.ic_delete)
            } catch (e: Exception) {
                screenButton?.setImageResource(if (currentScreenShareOn) android.R.drawable.ic_menu_share else android.R.drawable.ic_delete)
            }
        }
    }

    private fun sendEventToJS(action: String) {
        val reactContext = FloatingWidgetModule.contextRef
            ?: (application as? ReactApplication)?.reactHost?.currentReactContext

        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("onOverlayAction", action)
    }
}
