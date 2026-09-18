package expo.modules.tripnownotificationexpense

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class TripNowPaymentNotificationService : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    val notification = sbn?.notification ?: return
    val extras = notification.extras ?: return

    // 원문은 이 콜백의 지역 변수에서만 사용하고 저장하거나 로그에 남기지 않습니다.
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
    val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty()
    val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString().orEmpty()

    val candidate = PaymentNotificationParser.parse(
      title = title,
      text = if (bigText.isNotBlank()) bigText else text,
      timestamp = sbn.postTime,
    ) ?: return

    PaymentCandidateStore.add(applicationContext, candidate)
  }
}

private object PaymentNotificationParser {
  private val paymentKeywords = listOf(
    "결제",
    "승인",
    "사용",
    "지불",
    "payment",
    "paid",
    "purchase",
    "利用",
    "支払",
    "決済",
    "購入",
  )

  private val cancellationKeywords = listOf(
    "승인취소",
    "결제취소",
    "취소",
    "환불",
    "refund",
    "cancelled",
    "canceled",
    "取消",
    "返金",
  )

  private val yenPatterns = listOf(
    Regex("""[¥￥]\s*([0-9][0-9,]*)"""),
    Regex("""([0-9][0-9,]*)\s*(?:엔|円)"""),
    Regex("""JPY\s*([0-9][0-9,]*)""", RegexOption.IGNORE_CASE),
  )

  private val wonPatterns = listOf(
    Regex("""([0-9][0-9,]*)\s*원"""),
    Regex("""KRW\s*([0-9][0-9,]*)""", RegexOption.IGNORE_CASE),
  )

  fun parse(title: String, text: String, timestamp: Long): PaymentCandidate? {
    val combined = "$title $text".replace(Regex("""\s+"""), " ").trim()
    if (combined.isBlank() || combined.length > 1500) return null

    val lower = combined.lowercase()
    if (cancellationKeywords.any { lower.contains(it.lowercase()) }) return null
    if (paymentKeywords.none { lower.contains(it.lowercase()) }) return null

    val money = findMoney(combined) ?: return null
    val merchant = extractMerchant(title, text, money.matchedText)

    return PaymentCandidate(
      amount = money.amount,
      currency = money.currency,
      merchant = merchant,
      timestamp = timestamp,
    )
  }

  private data class MoneyMatch(
    val amount: Long,
    val currency: String,
    val matchedText: String,
  )

  private fun findMoney(value: String): MoneyMatch? {
    yenPatterns.forEach { pattern ->
      val match = pattern.find(value) ?: return@forEach
      val amount = match.groupValues[1].replace(",", "").toLongOrNull()
      if (amount != null && amount in 1..50_000_000) {
        return MoneyMatch(amount, "JPY", match.value)
      }
    }

    wonPatterns.forEach { pattern ->
      val match = pattern.find(value) ?: return@forEach
      val amount = match.groupValues[1].replace(",", "").toLongOrNull()
      if (amount != null && amount in 1..100_000_000) {
        return MoneyMatch(amount, "KRW", match.value)
      }
    }

    return null
  }

  private fun extractMerchant(
    title: String,
    text: String,
    matchedAmount: String,
  ): String {
    val cleanup = { raw: String ->
      raw
        .replace(Regex("""\[[^]]{1,30}]"""), " ")
        .replace(
          Regex(
            """결제|승인|사용|지불|payment|paid|purchase|利用|支払|決済|購入|일시불|체크카드|신용카드|잔액|누적|카드""",
            RegexOption.IGNORE_CASE,
          ),
          " ",
        )
        .replace(Regex("""\b\d{4,}\b"""), " ")
        .replace(Regex("""\s+"""), " ")
        .trim(' ', '-', ':', '·', '|', '/', ',')
        .take(40)
    }

    fun nearby(raw: String): List<String> {
      val index = raw.indexOf(matchedAmount)
      if (index < 0) return emptyList()

      val before = raw.substring(0, index).takeLast(32)
      val after = raw.substring(index + matchedAmount.length).take(32)

      return listOf(after, before)
        .map(cleanup)
        .filter { it.length in 2..30 }
        .filterNot { value ->
          value.all { character ->
            character.isDigit() || character in listOf(',', '.', '-', ':', '/')
          }
        }
    }

    val fromText = nearby(text)
    if (fromText.isNotEmpty()) return fromText.first()

    // 제목은 금액과 함께 표시된 경우에만 사용합니다. 전체 제목을 그대로 저장하지 않습니다.
    val fromTitle = nearby(title)
    return fromTitle.firstOrNull() ?: "가맹점 확인 필요"
  }
}
