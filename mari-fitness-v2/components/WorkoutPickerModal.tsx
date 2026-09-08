import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { Workout } from "../types";

type Props = {
  visible: boolean;
  workouts: Workout[];
  selectedId: string;
  defaultId: string;
  onSelect: (workoutId: string) => void;
  onResetDefault: () => void;
  onClose: () => void;
  isOverridden: boolean;
};

export function WorkoutPickerModal({
  visible,
  workouts,
  selectedId,
  defaultId,
  onSelect,
  onResetDefault,
  onClose,
  isOverridden,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>メニューを変更</Text>
            <Text style={styles.subtitle}>今日だけ変更 — 翌日は曜日のデフォルトに戻ります</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {workouts.map((w) => {
              const selected = w.id === selectedId;
              const isDefault = w.id === defaultId;
              return (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.item, selected && styles.itemSelected]}
                  onPress={() => onSelect(w.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.itemEmoji}>{w.emoji}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, selected && styles.itemTitleSelected]}>
                      {w.title}
                    </Text>
                    <Text style={styles.itemMeta}>{w.exercises.length} 種目</Text>
                  </View>
                  {isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>曜日</Text>
                    </View>
                  ) : null}
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {isOverridden ? (
            <TouchableOpacity style={styles.resetBtn} onPress={onResetDefault}>
              <Text style={styles.resetText}>曜日のデフォルトに戻す</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceSolid,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderGold,
    maxHeight: "80%",
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.title,
    color: colors.text,
    fontSize: 20,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
    paddingRight: spacing.xl,
  },
  closeBtn: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  itemSelected: {
    borderColor: colors.gold,
    backgroundColor: "rgba(201,169,98,0.08)",
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  itemTitleSelected: {
    color: colors.gold,
  },
  itemMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  defaultBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  check: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "700",
  },
  resetBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  resetText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },
});
