import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";

function formatSeconds(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function Waiting({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { gameId, mode } = route.params;
  const [phase, setPhase] = useState("analyzing");
  const [status, setStatus] = useState("AI is analyzing technical structure...");
  const [pulse, setPulse] = useState(0);
  const [analyzeRemainingSec, setAnalyzeRemainingSec] = useState(0);
  const ANALYZE_MIN_MS = 6500;
  const UI_BUILD_TAG = "wait-v2-6500ms";

  useEffect(() => {
    // Reset view state for each new game so timer always starts from analyzing phase.
    setPhase("analyzing");
    setStatus("AI is analyzing technical structure...");
    setPulse(0);
    setAnalyzeRemainingSec(Math.ceil(ANALYZE_MIN_MS / 1000));

    const startedAt = Date.now();

    const phaseTimer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remainingMs = ANALYZE_MIN_MS - elapsed;

      if (remainingMs <= 0) {
        clearInterval(phaseTimer);
        setAnalyzeRemainingSec(0);
        setPhase("fetching");
        setStatus("Preparing AI report...");
        return;
      }

      // Keep countdown at 1..N while still in analyzing phase (avoid showing 0 before phase switch).
      setAnalyzeRemainingSec(Math.max(1, Math.ceil(remainingMs / 1000)));
    }, 200);

    const pulseTimer = setInterval(() => {
      setPulse((v) => (v + 1) % 3);
    }, 450);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(pulseTimer);
    };
  }, [gameId]);

  useEffect(() => {
    if (phase !== "fetching") return;
    const loadInitialResult = async () => {
      try {
        const result = await api.getResult(gameId);
        navigation.replace("Result", { result, gameId, mode });
      } catch (error) {
        console.error("Error loading initial result:", error);
        Alert.alert("Error", "Failed to load AI report. Please try again.");
        navigation.goBack();
      }
    };

    loadInitialResult();
  }, [phase, gameId, navigation]);

  const analyzingText = `AI is analyzing${".".repeat(pulse + 1)}`;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#38bdf8" />

        {phase === "analyzing" ? (
          <>
            <Text style={styles.title}>{analyzingText}</Text>
            <Text style={styles.status}>Checking trend, momentum, volatility, and key levels.</Text>
            <Text style={styles.subStatus}>Switching in {analyzeRemainingSec}s</Text>
          </>
        ) : phase === "fetching" ? (
          <>
            <Text style={styles.title}>Preparing AI Report</Text>
            <Text style={styles.status}>{status}</Text>
          </>
        ) : null}

        <Text style={styles.hint}>AI report first, market settlement later.</Text>

        <Text style={styles.buildTag}>{UI_BUILD_TAG}</Text>
        <Text style={styles.mode}>Mode: {mode}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    padding: 24,
    justifyContent: "center"
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)"
  },
  title: {
    color: "#e2e8f0",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center"
  },
  status: {
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center"
  },
  subStatus: {
    color: "#64748b",
    fontSize: 13,
    marginTop: -10,
    marginBottom: 24,
    textAlign: "center"
  },
  hint: {
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16
  },
  mode: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600"
  },
  buildTag: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 6
  }
});
