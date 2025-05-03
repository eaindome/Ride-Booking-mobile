import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getToken } from "../src/utils/auth";
import { COLORS } from "../src/utils/constants";

export default function Index() {
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const token = await getToken();

        // Small delay to allow animation to complete
        setTimeout(() => {
          // Redirect to home or login based on authentication
          if (token) {
            console.log(`token: ${token}`);
            router.replace("/login");
          } else {
            router.replace("/signup");
          }
        }, 1000);
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ marginTop: 20, color: COLORS.text.primary }}>
        Loading...
      </Text>
    </View>
  );
}
