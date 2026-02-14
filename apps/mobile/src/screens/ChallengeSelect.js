import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { storage } from "../utils/storage";
import { api } from "../api/client";

const MODES = [
  { id: "FLASH", title: "⚡ FLASH", duration: "Play 3 min · 1m chart", reward: "Up to 200pt" },
  { id: "SPEED", title: "💎 SPEED", duration: "Play 5 min · 3m chart", reward: "Up to 300pt" },
  { id: "STANDARD", title: "🔥 STANDARD", duration: "Play 15 min · 5m chart", reward: "Up to 500pt" }
];

export default function ChallengeSelect({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState(null);

  const handleModeSelect = async (mode) => {
    setLoading(true);
    setLoadingMode(mode.id);

    try {
      // Get username
      const username = await storage.getUsername();

      if (!username) {
        Alert.alert("Error", "Username not found. Please restart the app.");
        return;
      }

      // Start game via API
      const result = await api.startGame(username, mode.id);

      // Navigate via root stack to avoid tab navigator action drops
      const rootNav = navigation.getParent();
      const targetPayload = {
        mode: mode.id,
        gameId: result.game_id,
        rounds: result.rounds
      };

      if (rootNav) {
        rootNav.navigate("Rounds", targetPayload);
      } else {
        navigation.navigate("Rounds", targetPayload);
      }
    } catch (error) {
      console.error("Error starting game:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to start game. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingMode(null);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
      <Text style={styles.header}>AI Beat Challenge</Text>
      <Text style={styles.sub}>Pick a mode to start</Text>

      {MODES.map((mode) => (
        <Pressable
          key={mode.id}
          style={[styles.card, loading && styles.cardDisabled]}
          onPress={() => handleModeSelect(mode)}
          disabled={loading}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{mode.title}</Text>
              <Text style={styles.cardMeta}>{mode.duration}</Text>
              <Text style={styles.cardMeta}>{mode.reward}</Text>
            </View>
            {loadingMode === mode.id && (
              <ActivityIndicator size="small" color="#38bdf8" />
            )}
          </View>
        </Pressable>
      ))}

      <Text style={styles.disclaimer}>
        Educational & entertainment purpose only. No cash rewards.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    padding: 24,
    paddingTop: 60
  },
  header: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "700"
  },
  sub: {
    color: "#94a3b8",
    marginTop: 6,
    marginBottom: 20
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)"
  },
  cardDisabled: {
    opacity: 0.6
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardInfo: {
    flex: 1
  },
  cardTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "700"
  },
  cardMeta: {
    color: "#94a3b8",
    marginTop: 6
  },
  disclaimer: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24
  }
});
