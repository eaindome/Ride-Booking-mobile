import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "../utils/constants";
import Button from "./Button";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({
  title,
  message,
  icon = "car-outline",
  buttonText,
  onButtonPress
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={56} color={COLORS.text.secondary} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {buttonText && onButtonPress && (
        <Button
          title={buttonText}
          onPress={onButtonPress}
          size="medium"
          variant="filled"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    fontSize: FONTS.size.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.md,
  }
});