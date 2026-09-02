# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native & JNI
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# PiP Module & Custom Native Code
-keep class com.pomomate.app.** { *; }

# WebRTC & RevenueCat Purchases
-keep class com.oney.WebRTCModule.** { *; }
-keep class com.revenuecat.purchases.** { *; }

# React Native bridge annotations
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}
