import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";
import { storage } from "../utils/storage";

function formatSeconds(totalSeconds) {
  const secs = Math.max(0, Number(totalSeconds) || 0);
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return "-";
  return new Date(ms).toLocaleString();
}

function roundStatus(round) {
  if (round.result === "user_win") return "Win";
  if (round.result === "ai_win") return "Lose";
  if (round.result === "draw") return "Draw";
  if (!round.user_prediction) return "Pending Pick";
  if (typeof round.time_remaining === "number" && round.time_remaining > 0) {
    return `Pending (${round.time_remaining}s)`;
  }
  return "In Progress";
}

function statusColor(statusText) {
  if (statusText.startsWith("Win")) return "#10b981";
  if (statusText.startsWith("Lose")) return "#ef4444";
  if (statusText.startsWith("Pending")) return "#fbbf24";
  return "#94a3b8";
}

export default function ResultCheck({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { gameId, mode } = route.params;

  const [data, setData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let timer = null;
    let cancelled = false;

    const poll = async () => {
      try {
        const currentUser = await storage.getUsername();
        if (!cancelled && currentUser) setUsername(currentUser);

        const result = await api.getResult(gameId);
        if (!cancelled) setData(result);

        if (currentUser) {
          const pred = await api.getUserPredictions(currentUser, 20, 0);
          if (!cancelled && Array.isArray(pred?.entries)) {
            setEntries(pred.entries);
          }
        }

        if (!cancelled && result.status !== "completed") {
          timer = setTimeout(poll, 3000);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to fetch latest result status.");
          timer = setTimeout(poll, 3000);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [gameId]);

  const maxRemaining = useMemo(() => {
    if (!data?.rounds?.length) return 0;
    return Math.max(
      0,
      ...data.rounds.map((r) => (typeof r.time_remaining === "number" ? r.time_remaining : 0))
    );
  }, [data]);

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={[styles.loadingWrap, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
          <Text style={styles.loadingText}>Loading result check...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = data.status === "completed";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom + 120, 150)
        }}
        showsVerticalScrollIndicator
      >
        <Text style={styles.header}>Result Check · {mode}</Text>

        <View style={styles.panel}>
          <Text style={styles.score}>You {data.user_score} : {data.ai_score} AI</Text>
          <Text style={styles.points}>Points: +{data.points_earned || 0}</Text>

          {isCompleted ? (
            <Text style={styles.done}>Final result settled.</Text>
          ) : (
            <Text style={styles.state}>Waiting next candle close · {formatSeconds(maxRemaining)}</Text>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            {isCompleted ? (
              <Pressable
                style={styles.linkBtn}
                onPress={() => navigation.replace("Result", { result: data, gameId, mode })}
              >
                <Text style={styles.linkBtnText}>Open Final Result</Text>
              </Pressable>
            ) : null}

            {username ? (
              <Pressable
                style={styles.linkBtnSecondary}
                onPress={() => navigation.navigate("Main", { screen: "History" })}
              >
                <Text style={styles.linkBtnSecondaryText}>Go to History</Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.linkBtnSecondary} onPress={() => navigation.popToTop()}>
              <Text style={styles.linkBtnSecondaryText}>Back to Home</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Current Prediction Overview</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colOverview]}>Round Overview</Text>
            <Text style={[styles.th, styles.colPick]}>Your Pick</Text>
            <Text style={[styles.th, styles.colPick]}>AI Pick</Text>
            <Text style={[styles.th, styles.colStatus]}>Status</Text>
          </View>
          {(data.rounds || []).map((round) => {
            const st = roundStatus(round);
            return (
              <View key={round.round_id} style={styles.row}>
                <View style={styles.colOverview}>
                  <Text style={styles.overviewStrong}>Round {round.round_number} · {round.asset} · {round.timeframe}</Text>
                  <Text style={styles.overviewMeta}>Start {round.start_price} · End {round.end_price ?? "-"}</Text>
                </View>
                <Text style={[styles.cell, styles.colPick]}>{round.user_prediction || "-"}</Text>
                <Text style={[styles.cell, styles.colPick]}>{round.ai_prediction || "-"}</Text>
                <Text style={[styles.cell, styles.colStatus, { color: statusColor(st) }]}>{st}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>History / Pending Timeline</Text>
          {entries.length === 0 ? (
            <Text style={styles.state}>No prediction history yet.</Text>
          ) : (
            entries.map((g) => (
              <View key={g.game_id} style={styles.gameCard}>
                <View style={styles.gameHead}>
                  <Text style={styles.gameTitle}>{g.mode} · {g.game_id.slice(0, 8)}...</Text>
                  <Text style={styles.gameState}>{g.status}</Text>
                </View>
                <Text style={styles.gameMeta}>Predict: {formatDateTime(g.created_at)}</Text>
                <Text style={styles.gameMeta}>Settle: {formatDateTime(g.completed_at)}</Text>
                <Text style={styles.gameMeta}>Score: You {g.user_score}:{g.ai_score} AI</Text>
                <Text style={styles.gameMeta}>Points: +{g.points_earned}</Text>
              </View>
            ))
          )}
        </View>
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 16
  },
  header: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12
  },
  panel: {
    backgroundColor: "#111827",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    padding: 14,
    marginBottom: 12
  },
  score: {
    color: "#e2e8f0",
    fontSize: 34,
    fontWeight: "700"
  },
  points: {
    color: "#93c5fd",
    fontSize: 18,
    marginTop: 6
  },
  state: {
    color: "#fbbf24",
    fontSize: 15,
    marginTop: 10
  },
  done: {
    color: "#6ee7b7",
    fontSize: 15,
    marginTop: 10
  },
  error: {
    color: "#fca5a5",
    marginTop: 8,
    fontSize: 13
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  linkBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  linkBtnText: {
    color: "#f8fafc",
    fontWeight: "700"
  },
  linkBtnSecondary: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  linkBtnSecondaryText: {
    color: "#cbd5e1",
    fontWeight: "600"
  },
  sectionTitle: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10
  },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.2)",
    paddingBottom: 8,
    marginBottom: 8
  },
  th: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700"
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.12)",
    paddingVertical: 10
  },
  colOverview: {
    flex: 2.4,
    paddingRight: 6
  },
  colPick: {
    flex: 1,
    textAlign: "center"
  },
  colStatus: {
    flex: 1.3,
    textAlign: "right"
  },
  overviewStrong: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 18
  },
  overviewMeta: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2
  },
  cell: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600"
  },
  gameCard: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    borderRadius: 12,
    backgroundColor: "#0f172a",
    padding: 12,
    marginBottom: 8
  },
  gameHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8
  },
  gameTitle: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 13
  },
  gameState: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  gameMeta: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 2
  }
});
