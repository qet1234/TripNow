package expo.modules.tripnowhotelocr

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.japanese.JapaneseTextRecognizerOptions
import com.google.mlkit.vision.text.korean.KoreanTextRecognizerOptions
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private class HotelOcrException(message: String, cause: Throwable? = null) :
  CodedException(message, cause)

class TripNowHotelOcrModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TripNowHotelOcr")

    AsyncFunction("recognizeImage") { uriString: String, promise: Promise ->
      val context = requireContext()
      val uri = Uri.parse(uriString)
      val recognizers = createRecognizers()

      val image = try {
        InputImage.fromFilePath(context, uri)
      } catch (error: Exception) {
        closeRecognizers(recognizers)
        releasePersistedPermission(context, uri)
        promise.reject(HotelOcrException("선택한 사진을 읽을 수 없습니다.", error))
        return@AsyncFunction
      }

      val tasks = recognizers.map { recognizer -> recognizer.process(image) }

      Tasks.whenAllComplete(tasks).addOnCompleteListener {
        try {
          val lines = tasks
            .filter { task: Task<Text> -> task.isSuccessful }
            .mapNotNull { task: Task<Text> -> task.result }
            .flatMap { result -> result.text.lines() }
            .map(String::trim)
            .filter(String::isNotEmpty)
            .distinct()

          if (lines.isEmpty()) {
            promise.reject(HotelOcrException("사진에서 호텔 정보를 찾지 못했습니다."))
          } else {
            promise.resolve(
              mapOf(
                "text" to lines.joinToString("\n"),
                "lineCount" to lines.size,
              ),
            )
          }
        } catch (error: Exception) {
          promise.reject(HotelOcrException("호텔 정보 인식 중 오류가 발생했습니다.", error))
        } finally {
          closeRecognizers(recognizers)
          releasePersistedPermission(context, uri)
        }
      }
    }
  }

  private fun requireContext(): Context {
    return requireNotNull(appContext.reactContext) {
      "TripNowHotelOcr requires an active Android context."
    }
  }

  private fun createRecognizers(): List<TextRecognizer> = listOf(
    TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS),
    TextRecognition.getClient(JapaneseTextRecognizerOptions.Builder().build()),
    TextRecognition.getClient(KoreanTextRecognizerOptions.Builder().build()),
  )

  private fun closeRecognizers(recognizers: List<TextRecognizer>) {
    recognizers.forEach(TextRecognizer::close)
  }

  private fun releasePersistedPermission(context: Context, uri: Uri) {
    val permission = context.contentResolver.persistedUriPermissions
      .firstOrNull { persisted -> persisted.uri == uri }
      ?: return

    var flags = 0
    if (permission.isReadPermission) flags = flags or Intent.FLAG_GRANT_READ_URI_PERMISSION
    if (permission.isWritePermission) flags = flags or Intent.FLAG_GRANT_WRITE_URI_PERMISSION

    if (flags == 0) return

    try {
      context.contentResolver.releasePersistableUriPermission(uri, flags)
    } catch (_: SecurityException) {
      // The system picker may provide only temporary access; no persisted access remains.
    }
  }
}
