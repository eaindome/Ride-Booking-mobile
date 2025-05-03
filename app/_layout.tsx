import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initSocket } from "../src/utils/socket";
import { COLORS } from "../src/utils/constants";


export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // await AsyncStorage.removeItem("token");
      // console.log(`inside _layout.tsx`);
      const token = await AsyncStorage.getItem("token");
      // console.log(`token: ${token}`);

      const authenticated = !!token;
      setIsAuthenticated(authenticated);
      
      if (token) {
        try {
          initSocket();
        } catch (error) {
          console.error("Socket initialization error:", error);
          // If socket fails to initialize, log user out
          await AsyncStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } else {
        // Redirect unauthenticated users to login
        router.replace("/login");
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
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
      <Stack.Screen name="home" options={{ title: "Home" }} />
      <Stack.Screen name="ride-history" options={{ title: "Ride History", headerShown: false }} />
    </Stack>
  );
}