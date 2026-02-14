import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { storage } from "../utils/storage";

export default function Onboarding({ navigation }) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (text) => {
    // Allow only alphanumeric characters, 3-20 length
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(text);
  };

  const handleContinue = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert(
        "Invalid Username",
        "Username must be 3-20 characters and contain only letters, numbers, and underscores"
      );
      return;
    }

    setIsLoading(true);

    try {
      await storage.saveUsername(username);
      // Navigate to main app
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("Error", "Failed to save username. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AI Beat Challenge</Text>
      <Text style={styles.subtitle}>Predict. Compete. Improve.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Choose your username</Text>
        <Text style={styles.hint}>3-20 characters, letters and numbers only</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
        />
      </View>

      <Pressable
        style={[styles.button, (!username || isLoading) && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!username || isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Loading..." : "Continue"}
        </Text>
      </Pressable>

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
    justifyContent: "center"
  },
  title: {
    color: "#e2e8f0",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)"
  },
  label: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },
  hint: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 12
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    color: "#e2e8f0",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)"
  },
  button: {
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    padding: 16,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "#0b0f1a",
    fontSize: 16,
    fontWeight: "700"
  },
  disclaimer: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24
  }
});
