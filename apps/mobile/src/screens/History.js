import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { storage } from "../utils/storage";
import { api } from "../api/client";

export default function History() {
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadGames = async (offset = 0, isRefresh = false) => {
    try {
      if (offset === 0 && !isRefresh) {
        setLoading(true);
      }

      const username = await storage.getUsername();
      if (!username) {
        Alert.alert("Error", "Username not found");
        return;
      }

      const data = await api.getUserHistory(username, 20, offset);

      if (isRefresh || offset === 0) {
        setGames(data.games);
      } else {
        setGames(prev => [...prev, ...data.games]);
      }

      // Check if there are more games
      setHasMore(data.games.length === 20);
    } catch (error) {
      console.error("Error loading games:", error);
      Alert.alert("Error", "Failed to load game history");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadGames(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && games.length > 0) {
      setLoadingMore(true);
      loadGames(games.length);
    }
  };

  const getResultColor = (userScore, aiScore) => {
    if (userScore > aiScore) return "#10b981";
    if (userScore < aiScore) return "#ef4444";
    return "#64748b";
  };

  const getResultText = (userScore, aiScore) => {
    if (userScore > aiScore) return "Victory";
    if (userScore < aiScore) return "Defeat";
    return "Draw";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderGameItem = ({ item }) => (
    <View style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <View style={styles.modeContainer}>
          <Text style={styles.modeText}>{item.mode}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.completed_at)}</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>You</Text>
          <Text style={[styles.scoreValue, { color: "#10b981" }]}>
            {item.user_score}
          </Text>
        </View>
        <Text style={styles.scoreSeparator}>:</Text>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>AI</Text>
          <Text style={[styles.scoreValue, { color: "#ef4444" }]}>
            {item.ai_score}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.resultText,
            { color: getResultColor(item.user_score, item.ai_score) }
          ]}
        >
          {getResultText(item.user_score, item.ai_score)}
        </Text>
        <Text
          style={[
            styles.pointsText,
            { color: item.points_earned > 0 ? "#10b981" : "#64748b" }
          ]}
        >
          {item.points_earned > 0 ? "+" : ""}{item.points_earned} pts
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Games Yet</Text>
      <Text style={styles.emptyText}>
        Start playing to build your game history!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#38bdf8" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
      <Text style={styles.header}>Game History</Text>

      <FlatList
        data={games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.game_id}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 20, 28) }]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#38bdf8"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
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
  listContent: {
    paddingBottom: 20
  },
  gameCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)"
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  modeContainer: {
    backgroundColor: "rgba(56,189,248,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)"
  },
  modeText: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "600"
  },
  dateText: {
    color: "#64748b",
    fontSize: 12
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 12
  },
  scoreItem: {
    alignItems: "center"
  },
  scoreLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 2
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "700"
  },
  scoreSeparator: {
    color: "#64748b",
    fontSize: 24,
    fontWeight: "300"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.1)"
  },
  resultText: {
    fontSize: 14,
    fontWeight: "600"
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600"
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100
  },
  emptyTitle: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center"
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center"
  }
});
