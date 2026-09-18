package expo.modules.tripnownotificationexpense

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class PaymentCandidate(
  val id: String = UUID.randomUUID().toString(),
  val amount: Long,
  val currency: String,
  val merchant: String,
  val timestamp: Long,
)

object PaymentCandidateStore {
  private const val PREFS_NAME = "tripnow_payment_candidates"
  private const val KEY_CANDIDATES = "pending"
  private const val MAX_CANDIDATES = 30

  fun list(context: Context): List<PaymentCandidate> {
    val raw = context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_CANDIDATES, null)
      ?: return emptyList()

    return try {
      val array = JSONArray(raw)
      buildList {
        for (index in 0 until array.length()) {
          val item = array.optJSONObject(index) ?: continue
          val id = item.optString("id")
          val amount = item.optLong("amount", -1)
          val currency = item.optString("currency")
          val merchant = item.optString("merchant")
          val timestamp = item.optLong("timestamp", 0)

          if (
            id.isNotBlank() &&
            amount > 0 &&
            (currency == "JPY" || currency == "KRW") &&
            merchant.isNotBlank() &&
            timestamp > 0
          ) {
            add(
              PaymentCandidate(
                id = id,
                amount = amount,
                currency = currency,
                merchant = merchant,
                timestamp = timestamp,
              ),
            )
          }
        }
      }
    } catch (_: Exception) {
      emptyList()
    }
  }

  @Synchronized
  fun add(context: Context, candidate: PaymentCandidate) {
    val current = list(context).toMutableList()

    val duplicate = current.any {
      it.amount == candidate.amount &&
        it.currency == candidate.currency &&
        it.merchant == candidate.merchant &&
        kotlin.math.abs(it.timestamp - candidate.timestamp) <= 2 * 60 * 1000
    }
    if (duplicate) return

    current.add(0, candidate)
    save(context, current.take(MAX_CANDIDATES))
  }

  @Synchronized
  fun remove(context: Context, id: String) {
    save(context, list(context).filterNot { it.id == id })
  }

  @Synchronized
  fun clear(context: Context) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_CANDIDATES)
      .apply()
  }

  private fun save(context: Context, candidates: List<PaymentCandidate>) {
    val array = JSONArray()
    candidates.forEach { candidate ->
      array.put(
        JSONObject()
          .put("id", candidate.id)
          .put("amount", candidate.amount)
          .put("currency", candidate.currency)
          .put("merchant", candidate.merchant)
          .put("timestamp", candidate.timestamp),
      )
    }

    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_CANDIDATES, array.toString())
      .apply()
  }
}
