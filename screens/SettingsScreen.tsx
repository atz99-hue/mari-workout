import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenLayout, Section } from "../components/ScreenLayout";
import { TextField } from "../components/TextField";
import { borderRadius, colors, spacing } from "../constants/theme";
import { AppSettings, AvatarGender } from "../types";

type Props = {
  onBack: () => void;
  settings: AppSettings;
  onSave: (settings: Partial<AppSettings>) => void;
  onClearChatHistory: () => void;
  onResetAllData: () => Promise<void>;
};

export function SettingsScreen({
  onBack,
  settings,
  onSave,
  onClearChatHistory,
  onResetAllData,
}: Props) {
  const [userName, setUserName] = useState(settings.userName);
  const [avatarGender, setAvatarGender] = useState<AvatarGender>(settings.avatarGender ?? "female");
  const [targetWeight, setTargetWeight] = useState(
    settings.targetWeight !== undefined ? String(settings.targetWeight) : ""
  );
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(String(settings.dailyCalorieGoal));
  const [dailyProteinGoal, setDailyProteinGoal] = useState(String(settings.dailyProteinGoal));

  useEffect(() => {
    setUserName(settings.userName);
    setAvatarGender(settings.avatarGender ?? "female");
    setTargetWeight(settings.targetWeight !== undefined ? String(settings.targetWeight) : "");
    setDailyCalorieGoal(String(settings.dailyCalorieGoal));
    setDailyProteinGoal(String(settings.dailyProteinGoal));
  }, [settings]);

  const handleSave = () => {
    if (!userName.trim()) {
      Alert.alert("入力エラー", "ユーザー名を入力してください");
      return;
    }

    const calories = parseInt(dailyCalorieGoal, 10);
    const protein = parseInt(dailyProteinGoal, 10);
    if (isNaN(calories) || calories <= 0) {
      Alert.alert("入力エラー", "有効なカロリー目標を入力してください");
      return;
    }
    if (isNaN(protein) || protein <= 0) {
      Alert.alert("入力エラー", "有効なタンパク質目標を入力してください");
      return;
    }

    let parsedTargetWeight: number | undefined;
    if (targetWeight.trim()) {
      parsedTargetWeight = parseFloat(targetWeight);
      if (isNaN(parsedTargetWeight) || parsedTargetWeight <= 0 || parsedTargetWeight > 500) {
        Alert.alert("入力エラー", "有効な目標体重（0〜500kg）を入力してください");
        return;
      }
    }

    onSave({
      userName: userName.trim(),
      avatarGender,
      targetWeight: parsedTargetWeight,
      dailyCalorieGoal: calories,
      dailyProteinGoal: protein,
    });
    Alert.alert("保存しました", "設定を更新しました");
  };

  const handleClearChat = () => {
    Alert.alert(
      "チャット履歴を削除",
      "AIマリとの会話履歴をすべて削除します。この操作は取り消せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: () => {
            onClearChatHistory();
            Alert.alert("完了", "チャット履歴を削除しました");
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      "全データをリセット",
      "体重・食事・トレーニング・チャット履歴をすべて削除し、設定を初期値に戻します。この操作は取り消せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "リセット",
          style: "destructive",
          onPress: async () => {
            try {
              await onResetAllData();
              setUserName("ゲスト");
              setTargetWeight("");
              setDailyCalorieGoal("2000");
              setDailyProteinGoal("120");
              Alert.alert("完了", "すべてのデータをリセットしました");
            } catch {
              Alert.alert("エラー", "データのリセットに失敗しました。もう一度お試しください");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout title="Settings" subtitle="アプリ設定" onBack={onBack}>
      <Section title="プロフィール">
        <View style={styles.form}>
          <TextField
            label="ユーザー名"
            value={userName}
            onChangeText={setUserName}
            placeholder="名前"
          />
          <TextField
            label="目標体重 (kg)"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="decimal-pad"
            placeholder="未設定の場合は空欄"
          />
        </View>
      </Section>

      <Section title="ユーザーアバター">
        <View style={styles.avatarSelector}>
          <Text style={styles.avatarHint}>あなたの分身として表示するキャラクター</Text>
          <View style={styles.avatarOptions}>
            {([
              ["female", "女性ユーザー"],
              ["male", "男性ユーザー"],
            ] as const).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                style={[styles.avatarOption, avatarGender === value && styles.avatarOptionSelected]}
                onPress={() => setAvatarGender(value)}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarOptionText}>{avatarGender === value ? "✓ " : ""}{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Section>

      <Section title="食事目標">
        <View style={styles.form}>
          <TextField
            label="1日のカロリー目標 (kcal)"
            value={dailyCalorieGoal}
            onChangeText={setDailyCalorieGoal}
            keyboardType="number-pad"
            placeholder="2000"
          />
          <TextField
            label="1日のタンパク質目標 (g)"
            value={dailyProteinGoal}
            onChangeText={setDailyProteinGoal}
            keyboardType="number-pad"
            placeholder="120"
          />
        </View>
      </Section>

      <PrimaryButton label="保存する" onPress={handleSave} />

      <Section title="データ管理">
        <View style={styles.form}>
          <PrimaryButton label="チャット履歴を削除" onPress={handleClearChat} variant="ghost" />
          <View style={styles.spacer} />
          <PrimaryButton label="全データをリセット" onPress={handleResetAll} variant="ghost" />
        </View>
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  avatarSelector: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatarHint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  avatarOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  avatarOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  avatarOptionSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.surfaceLight,
  },
  avatarOptionText: {
    color: colors.text,
    fontWeight: "600",
  },
  form: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  spacer: {
    height: spacing.sm,
  },
});
