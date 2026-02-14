import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";

const BASE_POINTS = { FLASH: 100, SPEED: 150, STANDARD: 250 };

const getTvInterval = (timeframe) => {
  if (timeframe?.endsWith("m")) return timeframe.replace("m", "");
  if (timeframe?.endsWith("h")) return String(Number(timeframe.replace("h", "")) * 60);
  return "5";
};

const buildTvUrl = (symbol, timeframe) => {
  const params = new URLSearchParams({
    symbol: `BINANCE:${symbol}`,
    interval: getTvInterval(timeframe),
    theme: "dark",
    style: "1",
    timezone: "Etc/UTC",
    hide_top_toolbar: "0",
    hide_legend: "0",
    saveimage: "0",
    withdateranges: "0",
    studies: "",
  });
  return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
};

export default function Rounds({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { mode, gameId, rounds } = route.params;
  const [picks, setPicks] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);

  useEffect(() => {
    api.warmAIPredictions(gameId).catch(() => null);
  }, [gameId]);

  const ready = rounds.every((r) => picks[r.round_id]);
  const activeRound = rounds[activeRoundIndex];
  const expected = useMemo(() => {
    const base = BASE_POINTS[mode] || 100;
    return [
      { score: "1:0", points: Math.round((base * 1) / 3) },
      { score: "2:0", points: Math.round((base * 2) / 3) },
      { score: "3:0", points: base },
    ];
  }, [mode]);

  const handlePick = (idx, direction) => {
    if (idx > 0 && !picks[rounds[idx - 1].round_id]) return;
    const round = rounds[idx];
    setPicks((prev) => ({ ...prev, [round.round_id]: direction }));
    if (idx < rounds.length - 1) setActiveRoundIndex(idx + 1);
  };

  const handleSubmit = async () => {
    if (!ready) {
      Alert.alert("Incomplete", "Please select UP or DOWN for all rounds.");
      return;
    }

    setSubmitStatus("Submitting predictions...");
    setLoading(true);

    try {
      const predictions = rounds.map((round) => ({
        round_id: round.round_id,
        direction: picks[round.round_id]
      }));

      await api.submitPredictions(gameId, predictions);
      setSubmitStatus("Submitted. Moving to waiting screen...");
      navigation.replace("Waiting", { gameId, mode });
    } catch (error) {
      setSubmitStatus("");
      Alert.alert("Error", error.response?.data?.error || "Failed to submit predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 28, 44) }]}
    >
      <Text style={styles.header}>Forecast Ticket · {mode}</Text>
      <Text style={styles.sub}>Round 1 → Round 2 → Round 3</Text>

      <View style={styles.orderCard}>
        {rounds.map((round, idx) => {
          const enabled = idx === 0 || Boolean(picks[rounds[idx - 1].round_id]);
          const selected = picks[round.round_id];
          const active = idx === activeRoundIndex;
          return (
            <View key={round.round_id} style={[styles.roundRow, active && styles.roundRowActive]}>
              <Pressable style={styles.roundMetaBtn} disabled={!enabled} onPress={() => enabled && setActiveRoundIndex(idx)}>
                <Text style={[styles.roundMeta, !enabled && styles.muted]}>
                  Round {idx + 1} · {round.asset} · {round.timeframe}
                </Text>
              </Pressable>
              <View style={styles.row}>
                <Pressable
                  style={[styles.pickBtn, selected === "UP" && styles.pickUp]}
                  disabled={!enabled || loading}
                  onPress={() => handlePick(idx, "UP")}
                >
                  <Text style={styles.pickText}>UP</Text>
                </Pressable>
                <Pressable
                  style={[styles.pickBtn, selected === "DOWN" && styles.pickDown]}
                  disabled={!enabled || loading}
                  onPress={() => handlePick(idx, "DOWN")}
                >
                  <Text style={styles.pickText}>DOWN</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>Expected Reward</Text>
          {expected.map((x) => (
            <View key={x.score} style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>Lead {x.score}</Text>
              <Text style={styles.rewardValue}>+{x.points} pt</Text>
            </View>
          ))}
        </View>

        <Pressable style={[styles.submit, (!ready || loading) && styles.disabled]} onPress={handleSubmit} disabled={!ready || loading}>
          {loading ? <ActivityIndicator size="small" color="#0b0f1a" /> : <Text style={styles.submitText}>{ready ? "Prediction Complete" : "Pick all rounds"}</Text>}
        </Pressable>
        {submitStatus ? <Text style={styles.status}>{submitStatus}</Text> : null}
      </View>

      {activeRound ? (
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{activeRound.asset}</Text>
            <Text style={styles.chartTf}>{activeRound.timeframe} chart</Text>
          </View>
          <WebView
            source={{ uri: buildTvUrl(activeRound.asset, activeRound.timeframe) }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 44
  },
  header: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "700"
  },
  sub: {
    color: "#94a3b8",
    marginTop: 4,
    marginBottom: 12
  },
  orderCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    gap: 10
  },
  roundRow: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    borderRadius: 12,
    padding: 10,
    gap: 8
  },
  roundRowActive: {
    borderColor: "rgba(56,189,248,0.7)"
  },
  roundMetaBtn: {
    paddingVertical: 2
  },
  roundMeta: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600"
  },
  muted: {
    color: "#64748b"
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  pickBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
    backgroundColor: "#0f172a",
    alignItems: "center"
  },
  pickUp: {
    borderColor: "rgba(34,197,94,0.75)",
    backgroundColor: "rgba(34,197,94,0.12)"
  },
  pickDown: {
    borderColor: "rgba(239,68,68,0.75)",
    backgroundColor: "rgba(239,68,68,0.12)"
  },
  pickText: {
    color: "#e2e8f0",
    fontWeight: "700"
  },
  rewardCard: {
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#0d1424"
  },
  rewardTitle: {
    color: "#facc15",
    fontWeight: "700",
    marginBottom: 8
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  rewardLabel: {
    color: "#cbd5e1"
  },
  rewardValue: {
    color: "#38bdf8",
    fontWeight: "700"
  },
  submit: {
    marginTop: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#38bdf8",
    alignItems: "center"
  },
  submitText: {
    color: "#0b0f1a",
    fontWeight: "700"
  },
  disabled: {
    opacity: 0.5
  },
  status: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4
  },
  chartCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111827"
  },
  chartHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.2)",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  chartTitle: {
    color: "#e2e8f0",
    fontWeight: "700"
  },
  chartTf: {
    color: "#94a3b8"
  },
  webview: {
    height: 420,
    backgroundColor: "#05070d"
  }
});
