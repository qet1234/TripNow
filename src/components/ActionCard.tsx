import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/src/theme";

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  tone?: "blue" | "teal" | "danger";
  onPress?: () => void;
};

export function ActionCard({
  icon,
  title,
  subtitle,
  tone = "blue",
  onPress,
}: Props) {
  const background =
    tone === "danger"
      ? colors.dangerSoft
      : tone === "teal"
        ? colors.tealSoft
        : colors.surface;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: background, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 126,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    justifyContent: "space-between",
  },
  iconWrap: {
    alignSelf: "flex-start",
  },
  icon: {
    fontSize: 27,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
});
