import { useRouter } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { sampleItinerary } from "@/src/data/tripNowDesign";
import { colors, radius } from "@/src/theme";

export default function ScheduleScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.back}>‹</Text>
        <Text style={styles.title}>도쿄 3박 4일⌄</Text>
        <Text style={styles.options}>⋮</Text>
      </View>
      <View style={styles.dayTabs}>
        {[1, 2, 3, 4].map((day) => (
          <View key={day} style={[styles.dayTab, day === 2 && styles.dayTabActive]}>
            <Text style={[styles.dayText, day === 2 && styles.dayTextActive]}>{day}일차</Text>
          </View>
        ))}
      </View>

      <View style={styles.timeline}>
        {sampleItinerary.map((item, index) => (
          <View key={item.title}>
            <View style={styles.timelineRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.time}>{item.time}</Text>
                <View style={styles.dot} />
                {index < sampleItinerary.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.eventCard}>
                <ImageBackground source={{ uri: item.image }} imageStyle={styles.eventImage} style={styles.eventImageBox} />
                <View style={styles.eventBottom}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.chevron}>›</Text></View>
              </View>
            </View>
            {item.duration ? (
              <Pressable style={styles.duration} onPress={() => router.push("/move")}>
                <Text style={styles.durationText}>▤ {item.duration}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <Pressable style={styles.addButton}><Text style={styles.addButtonText}>＋ 일정 추가</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { color: colors.text, fontSize: 30 },
  title: { color: colors.text, fontSize: 19, fontWeight: "900" },
  options: { color: colors.text, fontSize: 25 },
  dayTabs: { flexDirection: "row", gap: 7, paddingVertical: 12 },
  dayTab: { flex: 1, height: 42, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  dayTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { color: colors.textMuted, fontSize: 13, fontWeight: "700" },
  dayTextActive: { color: "#FFFFFF", fontWeight: "900" },
  timeline: { paddingTop: 8 },
  timelineRow: { flexDirection: "row", minHeight: 146, gap: 10 },
  timeColumn: { width: 46, alignItems: "center" },
  time: { color: colors.text, fontSize: 12, fontWeight: "700", marginBottom: 7 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, borderWidth: 3, borderColor: "#FFD7D3", zIndex: 1 },
  line: { flex: 1, width: 2, backgroundColor: "#FFB4AE" },
  eventCard: { flex: 1, height: 128, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  eventImageBox: { flex: 1 },
  eventImage: { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  eventBottom: { height: 44, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eventTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  chevron: { color: colors.text, fontSize: 24 },
  duration: { alignSelf: "flex-start", marginLeft: 55, marginBottom: 18, marginTop: -5, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 11, paddingVertical: 7 },
  durationText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  addButton: { height: 52, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 6 },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
