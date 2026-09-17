import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "@/src/components/Screen";
import {
  canUseHotelOcr,
  deleteStoredHotel,
  emptyDraft,
  loadStoredHotel,
  saveStoredHotel,
  scanHotelConfirmation,
  type HotelDraft,
  type StoredHotel,
} from "@/src/services/hotelOcr";
import { colors, radius } from "@/src/theme";

type Field = keyof HotelDraft;

const fields: ReadonlyArray<{
  key: Field;
  label: string;
  placeholder: string;
}> = [
  { key: "hotelName", label: "호텔명", placeholder: "예: Shibuya Stream Hotel" },
  { key: "address", label: "주소", placeholder: "예: 東京都渋谷区渋谷 3-21-3" },
  { key: "checkIn", label: "체크인", placeholder: "예: 2026.10.12 15:00" },
  { key: "checkOut", label: "체크아웃", placeholder: "예: 2026.10.15 11:00" },
];

export default function HotelScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState<HotelDraft>(emptyDraft);
  const [storedHotel, setStoredHotel] = useState<StoredHotel | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const ocrAvailable = canUseHotelOcr();

  useEffect(() => {
    void loadStoredHotel().then((hotel) => {
      if (!hotel) return;
      setStoredHotel(hotel);
      setDraft(hotel);
    });
  }, []);

  const updateField = (key: Field, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleScan = async () => {
    setIsScanning(true);
    setMessage("");

    try {
      const result = await scanHotelConfirmation();
      if (!result) {
        setMessage("사진 선택을 취소했습니다.");
        return;
      }

      setDraft(result);
      setMessage("인식 결과를 확인하고 틀린 부분을 수정한 뒤 저장해 주세요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사진을 인식하지 못했습니다.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!draft.hotelName.trim() || !draft.address.trim()) {
      Alert.alert("확인이 필요해요", "호텔명과 주소를 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveStoredHotel(draft);
      setStoredHotel(saved);
      setDraft(saved);
      setMessage("확인한 호텔 정보만 이 기기의 보안 저장소에 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "호텔 정보를 삭제할까요?",
      "이 기기에 저장된 호텔명, 주소, 체크인·체크아웃 정보가 즉시 삭제됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            void deleteStoredHotel().then(() => {
              setStoredHotel(null);
              setDraft(emptyDraft);
              setMessage("기기에 저장된 호텔 정보를 삭제했습니다.");
            });
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityLabel="뒤로 가기" onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons color={colors.text} name="chevron-left" size={28} />
        </Pressable>
        <Text style={styles.title}>호텔 정보</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.privacyCard}>
        <View style={styles.privacyIcon}>
          <MaterialCommunityIcons color="#157A55" name="shield-lock-outline" size={25} />
        </View>
        <View style={styles.privacyCopy}>
          <Text style={styles.privacyTitle}>사진과 예약정보를 서버로 보내지 않아요</Text>
          <Text style={styles.privacyText}>
            OCR은 Android 기기 안에서만 실행됩니다. 원본 사진과 OCR 전문은 앱에 저장하지 않고,
            사용자가 확인한 호텔명·주소·체크인·체크아웃만 암호화해 이 기기에 보관합니다.
          </Text>
        </View>
      </View>

      <View style={styles.scanCard}>
        <View style={styles.scanHeading}>
          <View>
            <Text style={styles.sectionTitle}>예약 확인서에서 불러오기</Text>
            <Text style={styles.sectionSubtext}>시스템 선택창에서 사진 한 장만 선택합니다.</Text>
          </View>
          <MaterialCommunityIcons color={colors.primary} name="text-recognition" size={28} />
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={!ocrAvailable || isScanning}
          onPress={handleScan}
          style={({ pressed }) => [
            styles.scanButton,
            (!ocrAvailable || isScanning) && styles.buttonDisabled,
            pressed && ocrAvailable && styles.buttonPressed,
          ]}
        >
          {isScanning ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons color="#FFFFFF" name="image-search-outline" size={21} />
          )}
          <Text style={styles.scanButtonText}>
            {isScanning ? "기기에서 인식 중..." : "예약 사진 선택"}
          </Text>
        </Pressable>
        {!ocrAvailable ? (
          <Text style={styles.platformNotice}>
            {Platform.OS === "web"
              ? "OCR과 보안 저장은 Android 설치 앱에서 제공됩니다."
              : "새 Android 빌드에서 OCR 모듈을 사용할 수 있습니다."}
          </Text>
        ) : null}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>저장 전 직접 확인</Text>
        <Text style={styles.sectionSubtext}>
          투숙객 이름, 예약번호, 이메일, 전화번호는 가져오거나 저장하지 않습니다.
        </Text>

        {fields.map((field) => (
          <View key={field.key} style={styles.field}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={Platform.OS === "android"}
              maxLength={160}
              onChangeText={(value) => updateField(field.key, value)}
              placeholder={field.placeholder}
              placeholderTextColor="#A1A6AD"
              style={styles.input}
              value={draft[field.key]}
            />
          </View>
        ))}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable
          disabled={Platform.OS !== "android" || isSaving}
          onPress={handleSave}
          style={[
            styles.saveButton,
            (Platform.OS !== "android" || isSaving) && styles.buttonDisabled,
          ]}
        >
          {isSaving ? <ActivityIndicator color="#FFFFFF" /> : null}
          <Text style={styles.saveButtonText}>{isSaving ? "저장 중..." : "확인한 정보만 저장"}</Text>
        </Pressable>
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleTitle}>개인정보 보호 원칙</Text>
        <Text style={styles.ruleText}>• 카메라·사진 전체 접근 권한을 요청하지 않음</Text>
        <Text style={styles.ruleText}>• Supabase·TripNow 서버·클라우드 OCR로 전송하지 않음</Text>
        <Text style={styles.ruleText}>• 원본 사진, OCR 전문, 이름, 예약번호를 보관하지 않음</Text>
        <Text style={styles.ruleText}>• 사용자가 언제든 저장 정보를 즉시 삭제 가능</Text>
      </View>

      {storedHotel ? (
        <Pressable accessibilityRole="button" onPress={handleDelete} style={styles.deleteButton}>
          <MaterialCommunityIcons color={colors.danger} name="delete-outline" size={20} />
          <Text style={styles.deleteText}>이 기기의 호텔 정보 삭제</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 54, flexDirection: "row", alignItems: "center" },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  title: { flex: 1, color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  headerSpacer: { width: 34 },
  privacyCard: { borderRadius: radius.md, backgroundColor: colors.tealSoft, padding: 16, flexDirection: "row", gap: 12 },
  privacyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: "#145F47", fontSize: 14, fontWeight: "900", lineHeight: 20 },
  privacyText: { color: "#397060", fontSize: 11, lineHeight: 17, marginTop: 5 },
  scanCard: { marginTop: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 },
  scanHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  sectionSubtext: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  scanButton: { height: 48, borderRadius: 14, backgroundColor: colors.primary, marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  scanButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.82 },
  platformNotice: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 9 },
  formCard: { marginTop: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 },
  field: { marginTop: 14 },
  fieldLabel: { color: colors.text, fontSize: 12, fontWeight: "800", marginBottom: 7 },
  input: { minHeight: 46, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FAFAFB", color: colors.text, fontSize: 13, paddingHorizontal: 13 },
  message: { color: "#47606A", fontSize: 11, lineHeight: 17, marginTop: 13 },
  saveButton: { height: 48, borderRadius: 14, backgroundColor: "#157A55", marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  ruleCard: { marginTop: 14, borderRadius: radius.md, backgroundColor: "#F0F1F4", padding: 15 },
  ruleTitle: { color: colors.text, fontSize: 13, fontWeight: "900", marginBottom: 7 },
  ruleText: { color: colors.textMuted, fontSize: 10, lineHeight: 17 },
  deleteButton: { height: 46, marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: "#F0C8CB", backgroundColor: colors.dangerSoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  deleteText: { color: colors.danger, fontSize: 12, fontWeight: "900" },
});
