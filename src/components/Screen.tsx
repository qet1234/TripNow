import type { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useResponsiveLayout } from "@/src/hooks/useResponsiveLayout";
import { colors } from "@/src/theme";

type Props = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = true }: Props) {
  const {
    contentMaxWidth,
    horizontalPadding,
    isCompactWidth,
    isLargeScreen,
  } = useResponsiveLayout();
  const content = (
    <View
      style={[
        styles.content,
        {
          maxWidth: contentMaxWidth,
          paddingBottom: isLargeScreen ? 40 : 32,
          paddingHorizontal: horizontalPadding,
          paddingTop: isCompactWidth ? 8 : 12,
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});
