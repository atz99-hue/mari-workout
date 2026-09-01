import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenLayout, Section } from "../components/ScreenLayout";
import { TextField } from "../components/TextField";
import { UserAvatar } from "../components/UserAvatar";
import { MariAvatar } from "../components/MariAvatar";
import { borderRadius, colors, spacing } from "../constants/theme";
import { AppSettings, UserGender } from "../types";

type Props = {
  onBack: () => void;
  settings: AppSettings;
  onSave: (settings: Partial<AppSettings>) => void;
  onClearChatHistory: () => void;
  onResetAllData: () => Promise<void>;
  musicEnabled: boolean;
  musicVolume: number;
  onMusicEnabledChange: (enabled: boolean) => void;
  onMusicVolumeChange: (volume: number) => void;
};

export function SettingsScreen({
  onBack,
  settings,
  onSave,
  onClearChatHistory,
  onResetAllData,
  musicEnabled,
  musicVolume,
  onMusicEnabledChange,
  onMusicVolumeChange,
}: Props) {
  const [userName, setUserName] = useState(settings.userName);
  const [userGender, setUserGender] = useState<UserGender>(settings.userGender);
  const [targetWeight, setTargetWeight] = useState(
    settings.targetWeight !== undefined ? String(settings.targetWeight) : ""
  );
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(String(settings.dailyCalorieGoal));
  const [dailyProteinGoal, setDailyProteinGoal] = useState(String(settings.dailyProteinGoal));

  useEffect(() => {
    setUserName(settings.userName);
    setUserGender(settings.userGender);
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
      userGender,
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
              setUserGender("male");
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
          <View style={styles.avatarPreviewRow}>
            <View style={styles.avatarPreviewItem}>
              <UserAvatar gender={userGender} name={userName} size={56} />
              <Text style={styles.avatarPreviewLabel}>ユーザー</Text>
            </View>
            <View style={styles.avatarPreviewItem}>
              <MariAvatar size={56} />
              <Text style={styles.avatarPreviewLabel}>マリトレーナー</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>性別</Text>
          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((option) => {
              const selected = userGender === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.genderOption, selected && styles.genderOptionActive]}
                  onPress={() => setUserGender(option)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderOptionText, selected && styles.genderOptionTextActive]}>
                    {option === "male" ? "男性" : "女性"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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

      <Section title="音楽">
        <View style={styles.form}>
          <View style={styles.musicRow}>
            <Text style={styles.musicLabel}>音楽</Text>
            <Switch
              value={musicEnabled}
              onValueChange={onMusicEnabledChange}
              trackColor={{ false: colors.surfaceLight, true: colors.goldDark }}
              thumbColor={musicEnabled ? colors.gold : colors.textSecondary}
            />
          </View>
          <Text style={styles.musicHint}>ON / OFF</Text>
          <Text style={styles.volumeLabel}>音楽音量 {Math.round(musicVolume)}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={musicVolume}
            onValueChange={onMusicVolumeChange}
            minimumTrackTintColor={colors.gold}
            maximumTrackTintColor={colors.surfaceLight}
            thumbTintColor={colors.gold}
            disabled={!musicEnabled}
          />
        </View>
      </Section>

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
  form: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  avatarPreviewRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarPreviewItem: {
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarPreviewLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  genderRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  genderOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  genderOptionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  genderOptionText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  genderOptionTextActive: {
    color: colors.text,
  },
  spacer: {
    height: spacing.sm,
  },
  musicRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  musicLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  musicHint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  volumeLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
