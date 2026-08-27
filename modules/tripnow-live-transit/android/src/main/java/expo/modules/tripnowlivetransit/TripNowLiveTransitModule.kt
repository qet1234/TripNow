package expo.modules.tripnowlivetransit

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.os.BuildCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TripNowLiveTransitModule : Module() {
  companion object {
    private const val CHANNEL_ID = "tripnow_transit_live"
    private const val NOTIFICATION_ID = 4101
    private const val PERMISSION_REQUEST_CODE = 4102
  }

  override fun definition() = ModuleDefinition {
    Name("TripNowLiveTransit")

    Function("getSupportInfo") {
      val context = requireContext()
      val manager = NotificationManagerCompat.from(context)
      val galaxy = isGalaxyDevice()
      val liveUpdateEligible = galaxy && canUseLiveUpdate(manager)

      mapOf(
        "android" to true,
        "galaxy" to galaxy,
        "manufacturer" to Build.MANUFACTURER,
        "androidVersion" to Build.VERSION.SDK_INT,
        "notificationsEnabled" to manager.areNotificationsEnabled(),
        "liveUpdateEligible" to liveUpdateEligible,
        "displayMode" to when {
          !galaxy -> "unsupported"
          liveUpdateEligible -> "live_update"
          else -> "progress"
        },
      )
    }

    Function("requestNotificationPermission") {
      if (!isGalaxyDevice()) return@Function false

      val context = requireContext()

      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
        return@Function true
      }

      if (
        context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) ==
          PackageManager.PERMISSION_GRANTED
      ) {
        return@Function true
      }

      val activity = appContext.currentActivity ?: return@Function false
      activity.requestPermissions(
        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
        PERMISSION_REQUEST_CODE,
      )

      false
    }

    Function("start") {
        lineName: String,
        direction: String,
        departureTime: String,
        arrivalTime: String,
        nextStation: String,
        remainingStops: Int,
        progress: Int,
        statusText: String ->
      postTransitNotification(
        lineName,
        direction,
        departureTime,
        arrivalTime,
        nextStation,
        remainingStops,
        progress,
        statusText,
      )
    }

    Function("update") {
        lineName: String,
        direction: String,
        departureTime: String,
        arrivalTime: String,
        nextStation: String,
        remainingStops: Int,
        progress: Int,
        statusText: String ->
      postTransitNotification(
        lineName,
        direction,
        departureTime,
        arrivalTime,
        nextStation,
        remainingStops,
        progress,
        statusText,
      )
    }

    Function("stop") { finalMessage: String ->
      postCompletionNotification(finalMessage)
    }
  }

  private fun requireContext(): Context {
    return requireNotNull(appContext.reactContext) {
      "TripNowLiveTransit requires an active Android context."
    }
  }

  private fun isGalaxyDevice(): Boolean {
    return "samsung".equals(Build.MANUFACTURER, ignoreCase = true)
  }

  private fun canUseLiveUpdate(manager: NotificationManagerCompat): Boolean {
    return BuildCompat.isAtLeastB() && manager.canPostPromotedNotifications()
  }

  private fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = context.getSystemService(NotificationManager::class.java)
    val channel = NotificationChannel(
      CHANNEL_ID,
      "실시간 지하철 안내",
      NotificationManager.IMPORTANCE_DEFAULT,
    ).apply {
      description = "사용자가 시작한 지하철 이동의 출발·도착·다음 역 정보를 표시합니다."
      setSound(null, null)
      enableVibration(false)
      setShowBadge(false)
    }

    manager.createNotificationChannel(channel)
  }

  private fun launchIntent(context: Context): PendingIntent? {
    val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
      ?: return null

    return PendingIntent.getActivity(
      context,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun postTransitNotification(
    lineName: String,
    direction: String,
    departureTime: String,
    arrivalTime: String,
    nextStation: String,
    remainingStops: Int,
    progress: Int,
    statusText: String,
  ): Boolean {
    if (!isGalaxyDevice()) return false

    val context = requireContext()
    val manager = NotificationManagerCompat.from(context)

    if (!manager.areNotificationsEnabled()) return false

    ensureChannel(context)

    val safeProgress = progress.coerceIn(0, 100)
    val safeRemainingStops = remainingStops.coerceAtLeast(0)
    val liveUpdateEligible = canUseLiveUpdate(manager)

    val contentText = buildString {
      append(statusText)
      if (nextStation.isNotBlank()) {
        append(" · 다음 역 ")
        append(nextStation)
      }
      append(" · ")
      append(safeRemainingStops)
      append("개 역 남음")
    }

    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.tripnow_ic_train)
      .setContentTitle("$lineName · $direction")
      .setContentText(contentText)
      .setSubText("출발 $departureTime · 도착예정 $arrivalTime")
      .setCategory(NotificationCompat.CATEGORY_NAVIGATION)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .setPriority(NotificationCompat.PRIORITY_HIGH)

    if (liveUpdateEligible) {
      val liveStyle = NotificationCompat.ProgressStyle()
        .setStyledByProgress(true)
        .setProgress(safeProgress)
        .addProgressSegment(NotificationCompat.ProgressStyle.Segment(100))

      builder
        .setRequestPromotedOngoing(true)
        .setStyle(liveStyle)
        .setShortCriticalText(
          if (safeRemainingStops == 0) "도착" else "${safeRemainingStops}역",
        )
    } else {
      builder
        .setRequestPromotedOngoing(false)
        .setProgress(100, safeProgress, false)
    }

    launchIntent(context)?.let(builder::setContentIntent)

    return try {
      manager.notify(NOTIFICATION_ID, builder.build())
      true
    } catch (_: SecurityException) {
      false
    }
  }

  private fun postCompletionNotification(finalMessage: String): Boolean {
    if (!isGalaxyDevice()) return false

    val context = requireContext()
    val manager = NotificationManagerCompat.from(context)

    if (!manager.areNotificationsEnabled()) {
      manager.cancel(NOTIFICATION_ID)
      return false
    }

    ensureChannel(context)

    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.tripnow_ic_train)
      .setContentTitle("TripNow 지하철 안내 완료")
      .setContentText(finalMessage)
      .setCategory(NotificationCompat.CATEGORY_NAVIGATION)
      .setOngoing(false)
      .setAutoCancel(true)
      .setOnlyAlertOnce(true)

    launchIntent(context)?.let(builder::setContentIntent)

    return try {
      manager.notify(NOTIFICATION_ID, builder.build())
      true
    } catch (_: SecurityException) {
      manager.cancel(NOTIFICATION_ID)
      false
    }
  }
}
