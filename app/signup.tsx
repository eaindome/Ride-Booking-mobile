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
import { signup } from "../src/utils/api";
import { storeToken } from "../src/utils/auth";
import { COLORS, FONTS, SPACING } from "../src/utils/constants";
import { initSocket } from "../src/utils/socket";

export default function SignupScreen() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  const validateInputs = () => {
    let isValid = true;
    
    // Reset all errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    
    // Validate name
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    }
    
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
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSignup = async () => {
    // Clear general error
    setError("");
    
    // Validate inputs
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Signing up...`);
      const response = await signup({ name, email, password });
      await storeToken(response.token);
      console.log(`Token stored: ${response.token}`);
      initSocket();
      
      // Navigate to home screen
      router.replace("/home");
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message || "Failed to register. Please try again."
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

            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>
              Sign up to book rides quickly and easily
            </Text>

            {/* General error message */}
            {error ? <ErrorMessage message={error} /> : null}

            {/* Form inputs */}
            <View style={styles.form}>
              <InputField
                label="Full Name"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                error={nameError}
                autoCapitalize="words"
              />
              
              <InputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon="mail-outline"
                error={emailError}
              />
              
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon="lock-closed-outline"
                error={passwordError}
              />
              
              <InputField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPasswordError ? 
                  (text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError(""); 
                  } : setConfirmPassword
                }
                secureTextEntry
                icon="shield-checkmark-outline"
                error={confirmPasswordError}
              />

              <Button 
                title="Create Account" 
                onPress={handleSignup} 
                loading={loading} 
                size="large"
                icon="arrow-forward-outline"
                iconPosition="right"
              />

              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.terms}>
              By signing up, you agree to our 
              <Text style={styles.termsLink}>{" "}Terms of Service{" "}</Text>
              and 
              <Text style={styles.termsLink}>{" "}Privacy Policy</Text>
            </Text>
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
    fontWeight: "bold", // Use a valid predefined string value
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
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  loginText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.size.md,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "bold", 
    fontSize: FONTS.size.md,
    marginLeft: SPACING.xs,
  },
  terms: {
    fontSize: FONTS.size.xs,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: SPACING.xl,
  },
  termsLink: {
    color: COLORS.primary,
  },
});