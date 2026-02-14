import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { storage } from "../utils/storage";
import { api } from "../api/client";

export default function Profile({ navigation }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const username = await storage.getUsername();
      if (!username) {
        Alert.alert("Error", "Username not found");
        return;
      }

      const data = await api.getUserProfile(username);
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? Your game history will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await storage.clearUsername();
            const rootNav = navigation.getParent();
            if (rootNav) {
              rootNav.replace("Onboarding");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load profile</Text>
        <Pressable style={styles.button} onPress={loadProfile}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 28, 44) }}
    >
      <Text style={styles.header}>Profile</Text>

      {/* Username Card */}
      <View style={styles.usernameCard}>
        <Text style={styles.usernameLabel}>Username</Text>
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.level}>Level {profile.level}</Text>
      </View>

      {/* Points Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Points</Text>
        <Text style={styles.pointsValue}>{profile.points}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile.total_games}</Text>
          <Text style={styles.statLabel}>Total Games</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile.win_rate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>

      {/* Record Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Record</Text>
        <View style={styles.recordRow}>
          <View style={styles.recordItem}>
            <Text style={[styles.recordValue, { color: "#10b981" }]}>
              {profile.wins}
            </Text>
            <Text style={styles.recordLabel}>Wins</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={[styles.recordValue, { color: "#ef4444" }]}>
              {profile.losses}
            </Text>
            <Text style={styles.recordLabel}>Losses</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={[styles.recordValue, { color: "#64748b" }]}>
              {profile.draws}
            </Text>
            <Text style={styles.recordLabel}>Draws</Text>
          </View>
        </View>
      </View>

      {/* Streak Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Streaks</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Current</Text>
            <Text
              style={[
                styles.streakValue,
                { color: profile.current_streak >= 0 ? "#10b981" : "#ef4444" }
              ]}
            >
              {profile.current_streak >= 0 ? "+" : ""}
              {profile.current_streak}
            </Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Best</Text>
            <Text style={[styles.streakValue, { color: "#38bdf8" }]}>
              {profile.best_streak}
            </Text>
          </View>
        </View>
      </View>

      {/* Refresh Button */}
      <Pressable
        style={[styles.button, refreshing && styles.buttonDisabled]}
        onPress={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color="#0b0f1a" />
        ) : (
          <Text style={styles.buttonText}>Refresh</Text>
        )}
      </Pressable>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <View style={styles.spacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    padding: 24
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 40,
    marginBottom: 20
  },
  usernameCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    alignItems: "center"
  },
  usernameLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4
  },
  username: {
    color: "#e2e8f0",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4
  },
  level: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600"
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)"
  },
  cardTitle: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12
  },
  pointsValue: {
    color: "#38bdf8",
    fontSize: 42,
    fontWeight: "700",
    textAlign: "center"
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    alignItems: "center"
  },
  statValue: {
    color: "#e2e8f0",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12
  },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  recordItem: {
    alignItems: "center"
  },
  recordValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4
  },
  recordLabel: {
    color: "#64748b",
    fontSize: 12
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  streakItem: {
    alignItems: "center"
  },
  streakLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4
  },
  streakValue: {
    fontSize: 32,
    fontWeight: "700"
  },
  button: {
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 12
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "#0b0f1a",
    fontSize: 16,
    fontWeight: "700"
  },
  logoutButton: {
    backgroundColor: "transparent",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)"
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600"
  },
  error: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100
  },
  spacing: {
    height: 40
  }
});
