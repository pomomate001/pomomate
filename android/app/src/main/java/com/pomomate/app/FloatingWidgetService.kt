package com.pomomate.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.*
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.abs

/**
 * Native Android WindowManager Floating Overlay Service for PomoMate Mini Mode.
 *
 * Implements a robust, lightweight floating widget (compact bubble and expandable menu)
 * using standard Android WindowManager APIs. Strictly complies with Android 12+ and
 * Samsung Knox untrusted touch policies (omits full-screen touch watchers)
 * ensuring full stability during WebRTC screen sharing sessions.
 */
class FloatingWidgetService : Service() {

    companion object {
        const val CHANNEL_ID = "floating_widget_channel"
        const val NOTIFICATION_ID = 101

        var instance: FloatingWidgetService? = null
        var isOverlayAttached: Boolean = false
        var currentMicOn: Boolean = true
        var currentCamOn: Boolean = false
        var currentScreenShareOn: Boolean = false
    }

    private var windowManager: WindowManager? = null
    private var bubbleView: View? = null
    private var menuView: View? = null
    private var isExpanded: Boolean = false

    private var bubbleParams: WindowManager.LayoutParams? = null
    private var menuParams: WindowManager.LayoutParams? = null

    private var micButton: ImageButton? = null
    private var camButton: ImageButton? = null
    private var screenButton: ImageButton? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this

        try {
            startNotificationForeground()
            windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
            setupViews()
            showBubble()
        } catch (e: Exception) {
            e.printStackTrace()
            isOverlayAttached = false
            Handler(Looper.getMainLooper()).post {
                stopSelf()
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try {
            startNotificationForeground()
            if (!isOverlayAttached && bubbleView != null) {
                showBubble()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        removeViews()
        isOverlayAttached = false
        if (instance == this) {
            instance = null
        }
        super.onDestroy()
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        Handler(Looper.getMainLooper()).post {
            try {
                if (isExpanded) {
                    centerMenuView()
                } else {
                    snapBubbleToEdge()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Initializes ongoing Foreground Notification supporting Android 12 through Android 14+.
     */
    fun startNotificationForeground() {
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

    /**
     * Sets up views and layout params using Knox-compliant WindowManager flags.
     */
    private fun setupViews() {
        val windowType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

        // Knox & Android 12 untrusted touch compliant flags:
        // FLAG_NOT_FOCUSABLE prevents capturing system inputs.
        // FLAG_NOT_TOUCH_MODAL allows touches outside our small view to pass to apps underneath.
        // Deliberately omitting outside touch observation to avoid Samsung Knox security kills.
        val baseFlags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL

        // 1. Bubble Layout Params
        val density = resources.displayMetrics.density
        val bubbleSize = (64 * density).toInt()
        bubbleParams = WindowManager.LayoutParams(
            bubbleSize,
            bubbleSize,
            windowType,
            baseFlags,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = (resources.displayMetrics.widthPixels - bubbleSize - 16 * density).toInt()
            y = (resources.displayMetrics.heightPixels * 0.3f).toInt()
        }

        // 2. Menu Layout Params
        menuParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            windowType,
            baseFlags,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 0
            y = 0
        }

        // 3. Inflate or construct views
        bubbleView = createBubbleView()
        menuView = createMenuView()

        setupBubbleTouch()
        setupMenuButtons()
    }

    private fun createBubbleView(): View {
        return try {
            val themedContext = ContextThemeWrapper(this, R.style.AppTheme)
            val v = LayoutInflater.from(themedContext).inflate(R.layout.floating_bubble, null)
            v ?: createDefaultBubbleView()
        } catch (e: Exception) {
            createDefaultBubbleView()
        }
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

    private fun createMenuView(): View {
        return try {
            val themedContext = ContextThemeWrapper(this, R.style.AppTheme)
            val v = LayoutInflater.from(themedContext).inflate(R.layout.floating_menu, null)
            v ?: createDefaultMenuView()
        } catch (e: Exception) {
            createDefaultMenuView()
        }
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
        layout.addView(createBtn(R.id.btn_minimize_menu, "ic_pip_minimize", android.R.drawable.ic_menu_revert))

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

    private fun setupBubbleTouch() {
        val view = bubbleView ?: return
        val params = bubbleParams ?: return
        val touchSlop = ViewConfiguration.get(this).scaledTouchSlop

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isDragging = false
        var downTime = 0L

        view.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isDragging = false
                    downTime = System.currentTimeMillis()
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = (event.rawX - initialTouchX).toInt()
                    val dy = (event.rawY - initialTouchY).toInt()

                    if (!isDragging && (abs(dx) > touchSlop || abs(dy) > touchSlop)) {
                        isDragging = true
                    }

                    if (isDragging) {
                        params.x = initialX + dx
                        params.y = initialY + dy
                        updateView(view, params)
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    val duration = System.currentTimeMillis() - downTime
                    if (!isDragging) {
                        if (duration > 600) {
                            // Long press: bring app directly to front
                            bringAppToFront()
                        } else {
                            // Click: expand actions menu
                            expand()
                        }
                    } else {
                        // Snap to nearest screen edge
                        snapBubbleToEdge()
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun setupMenuButtons() {
        val view = menuView ?: return

        micButton = view.findViewById(R.id.btn_mic)
        camButton = view.findViewById(R.id.btn_cam)
        screenButton = view.findViewById(R.id.btn_screen)
        val openAppButton = view.findViewById<ImageButton?>(R.id.btn_open_app)
        val minimizeButton = view.findViewById<ImageButton?>(R.id.btn_minimize_menu)
        val closeButton = view.findViewById<ImageButton?>(R.id.btn_close_menu)

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
        minimizeButton?.setOnClickListener {
            minimize()
        }
        closeButton?.setOnClickListener {
            closeWidget()
        }
    }

    fun closeWidget() {
        Handler(Looper.getMainLooper()).post {
            try {
                removeViews()
                isOverlayAttached = false
                sendEventToJS("onWidgetClosed")
                stopSelf()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun showBubble() {
        val wm = windowManager ?: return
        val view = bubbleView ?: return
        val params = bubbleParams ?: return

        Handler(Looper.getMainLooper()).post {
            try {
                if (menuView?.isAttachedToWindow == true) {
                    wm.removeView(menuView)
                }
                if (view.isAttachedToWindow != true) {
                    wm.addView(view, params)
                }
                isExpanded = false
                isOverlayAttached = true
            } catch (e: Exception) {
                e.printStackTrace()
                isOverlayAttached = false
            }
        }
    }

    fun showExpandedMenu() {
        val wm = windowManager ?: return
        val view = menuView ?: return
        val params = menuParams ?: return

        Handler(Looper.getMainLooper()).post {
            try {
                if (bubbleView?.isAttachedToWindow == true) {
                    wm.removeView(bubbleView)
                }

                centerMenuView()

                if (view.isAttachedToWindow != true) {
                    wm.addView(view, params)
                }
                isExpanded = true
                isOverlayAttached = true
                updateButtonStates()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun expand() {
        showExpandedMenu()
    }

    fun minimize() {
        showBubble()
    }

    private fun centerMenuView() {
        val view = menuView ?: return
        val params = menuParams ?: return
        val bParams = bubbleParams ?: return
        val screenWidth = resources.displayMetrics.widthPixels

        view.measure(View.MeasureSpec.UNSPECIFIED, View.MeasureSpec.UNSPECIFIED)
        val menuWidth = view.measuredWidth
        val menuHeight = view.measuredHeight

        params.x = (screenWidth - menuWidth) / 2
        params.y = (bParams.y).coerceIn(40, (resources.displayMetrics.heightPixels - menuHeight - 100))

        if (view.isAttachedToWindow) {
            updateView(view, params)
        }
    }

    private fun snapBubbleToEdge() {
        val view = bubbleView ?: return
        val params = bubbleParams ?: return
        val screenWidth = resources.displayMetrics.widthPixels
        val viewWidth = view.width.takeIf { it > 0 } ?: (64 * resources.displayMetrics.density).toInt()

        val targetX = if (params.x + viewWidth / 2 < screenWidth / 2) {
            16
        } else {
            screenWidth - viewWidth - 16
        }

        params.x = targetX
        params.y = params.y.coerceIn(80, resources.displayMetrics.heightPixels - 120)
        updateView(view, params)
    }

    private fun updateView(view: View, params: WindowManager.LayoutParams) {
        try {
            if (view.isAttachedToWindow) {
                windowManager?.updateViewLayout(view, params)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun removeViews() {
        try {
            if (bubbleView?.isAttachedToWindow == true) {
                windowManager?.removeView(bubbleView)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        try {
            if (menuView?.isAttachedToWindow == true) {
                windowManager?.removeView(menuView)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun bringAppToFront() {
        try {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                )
                startActivity(launchIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun updateButtonStates() {
        Handler(Looper.getMainLooper()).post {
            try {
                val micDrawable = androidx.core.content.ContextCompat.getDrawable(
                    this,
                    if (currentMicOn) R.drawable.ic_pip_mic_on else R.drawable.ic_pip_mic_off
                )
                if (micDrawable != null) {
                    micButton?.setImageDrawable(micDrawable)
                } else {
                    micButton?.setImageResource(if (currentMicOn) android.R.drawable.ic_btn_speak_now else android.R.drawable.ic_delete)
                }
            } catch (e: Exception) {
                micButton?.setImageResource(if (currentMicOn) android.R.drawable.ic_btn_speak_now else android.R.drawable.ic_delete)
            }

            try {
                val camDrawable = androidx.core.content.ContextCompat.getDrawable(
                    this,
                    if (currentCamOn) R.drawable.ic_pip_cam_on else R.drawable.ic_pip_cam_off
                )
                if (camDrawable != null) {
                    camButton?.setImageDrawable(camDrawable)
                } else {
                    camButton?.setImageResource(if (currentCamOn) android.R.drawable.ic_menu_camera else android.R.drawable.ic_delete)
                }
            } catch (e: Exception) {
                camButton?.setImageResource(if (currentCamOn) android.R.drawable.ic_menu_camera else android.R.drawable.ic_delete)
            }

            try {
                val screenDrawable = androidx.core.content.ContextCompat.getDrawable(
                    this,
                    if (currentScreenShareOn) R.drawable.ic_pip_screen_on else R.drawable.ic_pip_screen_off
                )
                if (screenDrawable != null) {
                    screenButton?.setImageDrawable(screenDrawable)
                } else {
                    screenButton?.setImageResource(if (currentScreenShareOn) android.R.drawable.ic_menu_share else android.R.drawable.ic_delete)
                }
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
