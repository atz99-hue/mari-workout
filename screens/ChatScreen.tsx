import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { MariAvatar } from "../components/MariAvatar";
import { borderRadius, colors, gradients, spacing, typography } from "../constants/theme";
import { ChatMessage } from "../types";
import { formatTime } from "../utils/date";

type Props = {
  onBack: () => void;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
};

const MARI_TRAINER = require("../assets/avatars/mari-trainer-avatar.png");

const QUICK_PROMPTS = [
  "今日のトレーニングのアドバイスをください",
  "タンパク質はどれくらい摂ればいい？",
  "モチベーションが上がりません",
];

export function ChatScreen({ onBack, messages, onSend }: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    try {
      await onSend(msg);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={12}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>AI Mari</Text>
            <Text style={styles.subtitle}>✦ パーソナルフィットネスコーチ</Text>
          </View>
          <MariAvatar size={40} source={MARI_TRAINER} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <LinearGradient colors={[...gradients.accent]} style={styles.emptyCard}>
                <MariAvatar size={64} source={MARI_TRAINER} style={styles.emptyAvatar} />
                <Text style={styles.emptyTitle}>こんにちは、マリです</Text>
                <Text style={styles.emptyText}>
                  トレーニング・食事・体重について{"\n"}何でも相談してください
                </Text>
              </LinearGradient>
              <Text style={styles.promptLabel}>QUICK QUESTIONS</Text>
              {QUICK_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.quickPrompt}
                  onPress={() => handleSend(prompt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubbleWrap,
                item.role === "user" ? styles.userWrap : styles.assistantWrap,
              ]}
            >
              {item.role === "assistant" ? (
                <View style={styles.roleRow}>
                  <MariAvatar size={24} source={MARI_TRAINER} />
                  <Text style={styles.roleLabel}>MARI</Text>
                </View>
              ) : null}
              {item.role === "user" ? (
                <LinearGradient
                  colors={[...gradients.button]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.userBubble}
                >
                  <Text style={styles.userText}>{item.content}</Text>
                  <Text style={styles.userTimestamp}>{formatTime(item.timestamp)}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.assistantBubble}>
                  <Text style={styles.assistantText}>{item.content}</Text>
                  <Text style={styles.assistantTimestamp}>{formatTime(item.timestamp)}</Text>
                </View>
              )}
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="メッセージを入力..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || sending}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[...gradients.button]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendGradient}
            >
              {sending ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.sendText}>送信</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
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
  emptyAvatar: {
    marginBottom: spacing.sm,
  },
  messages: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: spacing.lg,
  },
  emptyCard: {
    width: "100%",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  promptLabel: {
    ...typography.label,
    color: colors.textSecondary,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  quickPrompt: {
    width: "100%",
    backgroundColor: colors.surfaceSolid,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  quickPromptText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleWrap: {
    marginBottom: spacing.md,
    maxWidth: "88%",
  },
  userWrap: {
    alignSelf: "flex-end",
  },
  assistantWrap: {
    alignSelf: "flex-start",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 4,
    marginLeft: 4,
  },
  roleLabel: {
    ...typography.label,
    color: colors.gold,
  },
  userBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  userText: {
    color: colors.background,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  assistantText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  userTimestamp: {
    fontSize: 10,
    color: "rgba(6,6,8,0.5)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  assistantTimestamp: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceSolid,
    color: colors.text,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  sendGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    opacity: 0.45,
  },
  sendText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
});
