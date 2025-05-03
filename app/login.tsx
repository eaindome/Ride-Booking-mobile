import { router } from "expo-router";
import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../src/components/Button";
import ErrorMessage from "../src/components/ErrorMessage";
import InputField from "../src/components/InputField";
import { ApiError } from "../src/types";
import { login } from "../src/utils/api";
import { storeToken } from "../src/utils/auth";
import { COLORS, FONTS, SPACING } from "../src/utils/constants";
import { initSocket } from "../src/utils/socket";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  // const [rememberMe, setRememberMe] = useState<boolean>(false);

  const validateInputs = () => {
    let isValid = true;
    
    // Reset all errors
    setEmailError("");
    setPasswordError("");
    
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    setError("");
    
    // Validate inputs
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await login({ email, password });
      await storeToken(response.token);
      initSocket();
      router.replace("/home");
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* App Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="car-sport" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.appName}>SwiftRide</Text>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to your account to continue
            </Text>

            {/* General error message */}
            {error ? <ErrorMessage message={error} /> : null}

            {/* Form inputs */}
            <View style={styles.form}>
              <InputField
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                icon="mail-outline"
                error={emailError}
              />
              
              <InputField
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
                }}
                secureTextEntry
                icon="lock-closed-outline"
                error={passwordError}
              />

              <Button 
                title="Log In" 
                onPress={handleLogin} 
                loading={loading} 
                size="large"
                icon="log-in-outline"
                iconPosition="right"
              />

              <View style={styles.signupLinkContainer}>
                <Text style={styles.signupText}>Don&apos;t have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  appName: {
    fontSize: FONTS.size.xxl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  form: {
    marginVertical: SPACING.md,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONTS.size.sm,
    fontWeight: "medium",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.text.secondary,
    fontSize: FONTS.size.sm,
  },
  signupLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  signupText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.size.md,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: FONTS.size.md,
    marginLeft: SPACING.xs,
  }
});