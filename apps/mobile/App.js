import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import Onboarding from "./src/screens/Onboarding";
import ChallengeSelect from "./src/screens/ChallengeSelect";
import Rounds from "./src/screens/Rounds";
import Waiting from "./src/screens/Waiting";
import Result from "./src/screens/Result";
import ResultCheck from "./src/screens/ResultCheck";
import Profile from "./src/screens/Profile";
import History from "./src/screens/History";
import { storage } from "./src/utils/storage";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "rgba(148,163,184,0.2)",
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 60 + insets.bottom
        },
        tabBarActiveTintColor: "#38bdf8",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={ChallengeSelect}
        options={{
          tabBarLabel: "Play",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🎮</Text>
          )
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>📊</Text>
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUsername = async () => {
      try {
        const username = await storage.getUsername();
        setInitialRoute(username ? "Main" : "Onboarding");
      } catch (error) {
        console.error("Error checking username:", error);
        setInitialRoute("Onboarding");
      } finally {
        setIsLoading(false);
      }
    };

    checkUsername();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Rounds" component={Rounds} />
          <Stack.Screen name="Waiting" component={Waiting} />
          <Stack.Screen name="Result" component={Result} />
          <Stack.Screen name="ResultCheck" component={ResultCheck} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    justifyContent: "center",
    alignItems: "center"
  }
});
