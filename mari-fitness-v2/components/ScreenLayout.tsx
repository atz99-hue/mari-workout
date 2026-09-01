import { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { GradientBackground } from "./GradientBackground";
import { borderRadius, colors, spacing, typography } from "../constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  scroll?: boolean;
  rightAction?: ReactNode;
  footer?: ReactNode;
};

export function ScreenLayout({
  title,
  subtitle,
  onBack,
  children,
  scroll = true,
  rightAction,
  footer,
}: Props) {
  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.body}>{children}</View>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={12}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightAction ?? <View style={styles.spacer} />}
        </View>
        {content}
        {footer}
      </View>
    </GradientBackground>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function Section({ title, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  backText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "600",
  },
  titleBlock: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: 4,
  },
  spacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
