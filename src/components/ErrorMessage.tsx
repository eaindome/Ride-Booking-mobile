import React from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../utils/constants";

interface ErrorMessageProps {
  message: string;
  type?: "error" | "warning" | "info";
}

export default function ErrorMessage({ 
  message, 
  type = "error" 
}: ErrorMessageProps) {
  if (!message) return null;
  
  // Determine colors based on message type
  const getColors = () => {
    switch (type) {
      case "warning":
        return {
          bg: "#FFF9EB",
          border: "#FFD166",
          icon: "warning-outline",
          text: "#B38324"
        };
      case "info":
        return {
          bg: "#EBF7FF",
          border: "#66BDFF",
          icon: "information-circle-outline",
          text: "#2474B3"
        };
      default: // error
        return {
          bg: "#FFEFEF",
          border: COLORS.error,
          icon: "alert-circle-outline",
          text: COLORS.error
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.bg,
          borderColor: colors.border 
        }
      ]}
    >
      <Ionicons 
        name={colors.icon as any}
        size={18} 
        color={colors.text} 
        style={styles.icon}
      />
      <Text style={[styles.message, { color: colors.text }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  message: {
    flex: 1,
    fontSize: FONTS.size.sm,
    fontWeight: "500", 
  }
});