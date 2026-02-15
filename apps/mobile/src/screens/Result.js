import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function summarizeReasoning(text) {
  if (!text || typeof text !== "string") return "No analysis available.";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 180) return cleaned;
  return `${cleaned.slice(0, 177)}...`;
}

function formatPrice(price) {
  if (typeof price !== "number") return "-";
  if (price >= 1000) return `$${price.toFixed(2)}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function getResultColor(roundResult) {
  if (roundResult === "user_win") return "#10b981";
  if (roundResult === "ai_win") return "#ef4444";
  return "#64748b";
}

function getResultText(roundResult) {
  if (roundResult === "user_win") return "Win";
  if (roundResult === "ai_win") return "Lose";
  if (roundResult === "draw") return "Draw";
  return "Pending";
}

export default function Result({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { result, gameId, mode } = route.params;
  const isCompleted = result?.status === "completed";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom + 120, 160)
        }}
        showsVerticalScrollIndicator
      >
        <Text style={styles.header}>{isCompleted ? "Game Result" : "AI Analysis Ready"}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>{isCompleted ? "Final Score" : "Current Score"}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreSide}>You {result.user_score}</Text>
            <Text style={styles.scoreSeparator}>:</Text>
            <Text style={styles.scoreSide}>AI {result.ai_score}</Text>
          </View>

          {isCompleted ? (
            <>
              <Text style={styles.points}>Points: +{result.points_earned || 0}</Text>
              <Text style={styles.settleDone}>Final result settled.</Text>
            </>
          ) : (
            <Text style={styles.settlePending}>
              AI picks are locked. Tap Check Result to wait for market settlement.
            </Text>
          )}

          <View style={styles.actionsRow}>
            {!isCompleted ? (
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={() => navigation.navigate("ResultCheck", { gameId, mode })}
              >
                <Text style={styles.primaryButtonText}>Check Result</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.button, isCompleted ? styles.primaryButton : styles.ghostButton]}
              onPress={() => navigation.popToTop()}
            >
              <Text style={isCompleted ? styles.primaryButtonText : styles.ghostButtonText}>
                Back to Home
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Current Prediction Overview</Text>

        {(result.rounds || []).map((round) => {
          return (
            <View key={round.round_id} style={styles.roundCard}>
              <View style={styles.roundTop}>
                <Text style={styles.roundTitle}>Round {round.round_number}</Text>
                <Text style={[styles.status, { color: getResultColor(round.result) }]}>
                  {getResultText(round.result)}
                </Text>
              </View>

              <Text style={styles.roundMeta}>{round.asset} · {round.timeframe}</Text>
              <Text style={styles.roundMeta}>Start {formatPrice(round.start_price)} · End {typeof round.end_price === "number" ? formatPrice(round.end_price) : "pending"}</Text>

              {typeof round.time_remaining === "number" && round.time_remaining > 0 ? (
                <Text style={styles.pendingMeta}>Settlement in {Math.max(0, round.time_remaining)}s</Text>
              ) : null}

              <View style={styles.pickRow}>
                <Text style={styles.pickLabel}>Your Pick</Text>
                <Text style={[styles.pickValue, { color: round.user_prediction === "UP" ? "#10b981" : "#ef4444" }]}>
                  {round.user_prediction}
                </Text>
                <Text style={styles.pickLabel}>AI Pick</Text>
                <Text style={[styles.pickValue, { color: round.ai_prediction === "UP" ? "#10b981" : "#ef4444" }]}>
                  {round.ai_prediction}
                </Text>
              </View>

              <Text style={styles.reasoning}>AI Analysis: {summarizeReasoning(round.ai_reasoning)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0f1a"
  },
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a"
  },
  header: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14
  },
  scoreCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)"
  },
  scoreTitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600"
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8
  },
  scoreSide: {
    color: "#e2e8f0",
    fontSize: 32,
    fontWeight: "700"
  },
  scoreSeparator: {
    color: "#64748b",
    fontSize: 28,
    fontWeight: "300"
  },
  points: {
    color: "#93c5fd",
    fontSize: 16,
    marginBottom: 8
  },
  settleDone: {
    color: "#6ee7b7",
    fontSize: 16,
    marginBottom: 12
  },
  settlePending: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18
  },
  primaryButton: {
    backgroundColor: "#3b82f6"
  },
  primaryButtonText: {
    color: "#f8fafc",
    fontWeight: "700"
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)"
  },
  ghostButtonText: {
    color: "#cbd5e1",
    fontWeight: "600"
  },
  sectionTitle: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12
  },
  roundCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    padding: 14,
    marginBottom: 10
  },
  roundTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  roundTitle: {
    color: "#e2e8f0",
    fontSize: 17,
    fontWeight: "700"
  },
  status: {
    fontSize: 16,
    fontWeight: "700"
  },
  roundMeta: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 4
  },
  pendingMeta: {
    color: "#fbbf24",
    fontSize: 13,
    marginBottom: 8
  },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8
  },
  pickLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600"
  },
  pickValue: {
    fontSize: 14,
    fontWeight: "700",
    marginRight: 10
  },
  reasoning: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 19,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.12)",
    paddingTop: 8
  }
});
