import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { initNetworkMonitoring, addNetworkListener } from '../src/utils/network';
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { COLORS } from "../src/utils/constants";
import { initSocket } from "../src/utils/socket";
import { processQueue } from "../src/utils/offlineQueue";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // start monitoring network
    const unsubscribe = initNetworkMonitoring();

    // Add listener
    const removeListener = addNetworkListener((connected) => {
      setIsOffline(!connected);

      if (connected) {
        // Process queued actions when connection is restored
        processQueue().catch(error => {
          console.error('Error processing offline queue:', error);
        });
      }
    });

    return () => {
      unsubscribe();
      removeListener();
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const token = await AsyncStorage.getItem("token");
        console.log("Token found:", !!token);

        if (token) {
          try {
            console.log("Initializing socket...");
            initSocket();
            console.log("Socket initialized successfully");
          } catch (error) {
            console.error("Socket initialization error:", error);
            // If socket fails, we'll still keep the user logged in
            // but log the error
          }
        }

        setIsAuthenticated(!!token);
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Failed to check authentication status");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text.secondary }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Show error message if authentication check failed
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: COLORS.error, marginBottom: 10 }}>{error}</Text>
        <Text>Please restart the app and try again.</Text>
      </View>
    );
  }

  return (
    <>
    {/* Offline banner */}
    {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            You are currently offline. Some features may be limited.
          </Text>
        </View>
      )}

    {/* Main Stack Navigator */}
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text.primary,
        headerTitleStyle: { fontWeight: "bold" },
      }}
      initialRouteName={isAuthenticated ? "home" : "login"}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen
        name="home"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen
        name="ride-history"
        options={{ title: "Ride History", headerShown: false }}
      />
    </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: COLORS.warning,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
