import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/src/components/Screen";
import {
  emptyAirportFlightPlan,
  type AirportFlightPlan,
  useAirportJourney,
} from "@/src/context/AirportContext";
import { colors, radius } from "@/src/theme";

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numbers-and-punctuation";
};

function Field({ label, value, placeholder, onChangeText, keyboardType = "default" }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A1A7AF"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export default function AirportScreen() {
  const router = useRouter();
  const { plan, savePlan, clearPlan } = useAirportJourney();
  const [draft, setDraft] = useState<AirportFlightPlan>(plan);
  const [error, setError] = useState("");

  const update = (key: keyof AirportFlightPlan, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const isValidDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const save = async () => {
    if (!draft.outboundDate && !draft.returnDate) {
      setError("출국일 또는 귀국일을 하나 이상 입력해 주세요.");
      return;
    }
    if (draft.outboundDate && !isValidDate(draft.outboundDate)) {
      setError("출국일은 YYYY-MM-DD 형식으로 입력해 주세요.");
      return;
    }
    if (draft.returnDate && !isValidDate(draft.returnDate)) {
      setError("귀국일은 YYYY-MM-DD 형식으로 입력해 주세요.");
      return;
    }
    await savePlan(draft);
    router.replace("/(tabs)");
  };

  const clear = async () => {
    await clearPlan();
    setDraft(emptyAirportFlightPlan);
    router.replace("/(tabs)");
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable accessibilityLabel="뒤로 가기" hitSlop={10} onPress={() => router.back()} style={styles.back}>
              <MaterialCommunityIcons color={colors.text} name="chevron-left" size={28} />
            </Pressable>
            <Text style={styles.title}>공항 일정 설정</Text>
            <View style={styles.back} />
          </View>

          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <MaterialCommunityIcons color="#FFFFFF" name="airplane-clock" size={27} />
            </View>
            <Text style={styles.introTitle}>앱 시작 화면을 자동으로 맞춰드려요</Text>
            <Text style={styles.introDescription}>
              아래 날짜를 저장하면 출국일에는 인천공항 출국 안내가, 귀국일에는 입국 안내가 앱 첫 화면으로 열립니다.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <MaterialCommunityIcons color={colors.blue} name="airplane-takeoff" size={21} />
              <Text style={styles.sectionTitle}>출국 일정</Text>
            </View>
            <View style={styles.twoColumns}>
              <Field label="출국일" placeholder="2026-10-01" value={draft.outboundDate} onChangeText={(value) => update("outboundDate", value)} keyboardType="numbers-and-punctuation" />
              <Field label="출발 시간" placeholder="10:10" value={draft.outboundTime} onChangeText={(value) => update("outboundTime", value)} keyboardType="numbers-and-punctuation" />
            </View>
            <View style={styles.twoColumns}>
              <Field label="항공편" placeholder="KE703" value={draft.outboundFlight} onChangeText={(value) => update("outboundFlight", value)} />
              <Field label="터미널" placeholder="1" value={draft.outboundTerminal} onChangeText={(value) => update("outboundTerminal", value)} keyboardType="numbers-and-punctuation" />
            </View>
            <Field label="도착 도시" placeholder="도쿄" value={draft.outboundDestination} onChangeText={(value) => update("outboundDestination", value)} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <MaterialCommunityIcons color={colors.teal} name="airplane-landing" size={21} />
              <Text style={styles.sectionTitle}>귀국 일정</Text>
            </View>
            <View style={styles.twoColumns}>
              <Field label="귀국일" placeholder="2026-10-05" value={draft.returnDate} onChangeText={(value) => update("returnDate", value)} keyboardType="numbers-and-punctuation" />
              <Field label="도착 시간" placeholder="18:30" value={draft.returnTime} onChangeText={(value) => update("returnTime", value)} keyboardType="numbers-and-punctuation" />
            </View>
            <View style={styles.twoColumns}>
              <Field label="항공편" placeholder="KE704" value={draft.returnFlight} onChangeText={(value) => update("returnFlight", value)} />
              <Field label="터미널" placeholder="1" value={draft.returnTerminal} onChangeText={(value) => update("returnTerminal", value)} keyboardType="numbers-and-punctuation" />
            </View>
            <Field label="출발 도시" placeholder="도쿄" value={draft.returnOrigin} onChangeText={(value) => update("returnOrigin", value)} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={() => void save()} style={styles.saveButton}>
            <MaterialCommunityIcons color="#FFFFFF" name="content-save-outline" size={19} />
            <Text style={styles.saveButtonText}>저장하고 홈으로</Text>
          </Pressable>
          <Pressable onPress={() => void clear()} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>저장된 공항 일정 삭제</Text>
          </Pressable>

          <Text style={styles.privacy}>
            입력한 항공 일정은 이 기기의 앱 저장공간에만 보관됩니다.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 28 },
  header: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 19, fontWeight: "900" },
  intro: { borderRadius: radius.lg, backgroundColor: "#EDF5FF", padding: 18, marginTop: 8 },
  introIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center", marginBottom: 13 },
  introTitle: { color: colors.text, fontSize: 21, lineHeight: 26, fontWeight: "900", letterSpacing: -0.5 },
  introDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  section: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 12 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  twoColumns: { flexDirection: "row", gap: 9 },
  field: { flex: 1, minWidth: 0, marginBottom: 10 },
  fieldLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800", marginBottom: 5 },
  input: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 11, fontSize: 13, fontWeight: "700", backgroundColor: "#FAFAFB" },
  error: { color: colors.danger, fontSize: 12, fontWeight: "800", textAlign: "center", marginTop: 12 },
  saveButton: { height: 50, borderRadius: radius.md, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 16 },
  saveButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  clearButton: { minHeight: 42, alignItems: "center", justifyContent: "center", marginTop: 5 },
  clearButtonText: { color: colors.danger, fontSize: 12, fontWeight: "800" },
  privacy: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 10, paddingHorizontal: 20 },
});
