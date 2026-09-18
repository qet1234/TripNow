package expo.modules.tripnownotificationexpense

import android.content.ComponentName
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TripNowNotificationExpenseModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TripNowNotificationExpense")

    AsyncFunction("isNotificationAccessEnabled") {
      val context = requireNotNull(appContext.reactContext)
      val component = ComponentName(context, TripNowPaymentNotificationService::class.java)

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        val manager = context.getSystemService(android.app.NotificationManager::class.java)
        manager?.isNotificationListenerAccessGranted(component) == true
      } else {
        val enabledListeners =
          Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
            .orEmpty()
        enabledListeners.contains(component.flattenToString())
      }
    }

    AsyncFunction("openNotificationAccessSettings") {
      val context = requireNotNull(appContext.reactContext)
      val component = ComponentName(context, TripNowPaymentNotificationService::class.java)

      val detailIntent =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS).apply {
            putExtra(
              Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME,
              component.flattenToString(),
            )
          }
        } else {
          Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        }

      detailIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

      try {
        context.startActivity(detailIntent)
      } catch (_: Exception) {
        context.startActivity(
          Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          },
        )
      }
    }

    AsyncFunction("getPendingCandidates") {
      val context = requireNotNull(appContext.reactContext)
      PaymentCandidateStore.list(context).map { candidate ->
        mapOf(
          "id" to candidate.id,
          "amount" to candidate.amount,
          "currency" to candidate.currency,
          "merchant" to candidate.merchant,
          "timestamp" to candidate.timestamp,
        )
      }
    }

    AsyncFunction("removeCandidate") { id: String ->
      val context = requireNotNull(appContext.reactContext)
      PaymentCandidateStore.remove(context, id)
    }

    AsyncFunction("clearCandidates") {
      val context = requireNotNull(appContext.reactContext)
      PaymentCandidateStore.clear(context)
    }
  }
}
