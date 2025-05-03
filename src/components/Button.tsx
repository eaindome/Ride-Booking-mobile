import React from "react";
import { 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  Pressable,
  View
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../utils/constants";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "filled" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  icon?: string;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  loading = false,
  variant = "filled",
  size = "medium",
  icon,
  iconPosition = "left",
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  
  const getButtonStyle = (): ViewStyle => {
    // Base styles
    const baseStyle: ViewStyle = {
      borderRadius: RADIUS.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      opacity: disabled ? 0.7 : 1,
      alignSelf: fullWidth ? "stretch" : "flex-start",
    };
    
    // Size styles
    switch (size) {
      case "small":
        baseStyle.paddingVertical = SPACING.xs;
        baseStyle.paddingHorizontal = SPACING.md;
        baseStyle.minHeight = 36;
        break;
      case "large":
        baseStyle.paddingVertical = SPACING.md;
        baseStyle.paddingHorizontal = SPACING.lg;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingVertical = SPACING.sm;
        baseStyle.paddingHorizontal = SPACING.md;
        baseStyle.minHeight = 48;
    }
    
    // Variant styles
    switch (variant) {
      case "outlined":
        baseStyle.backgroundColor = "transparent";
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = COLORS.primary;
        break;
      case "text":
        baseStyle.backgroundColor = "transparent";
        break;
      default: // filled
        baseStyle.backgroundColor = COLORS.primary;
        baseStyle.borderWidth = 0;
        baseStyle.shadowColor = COLORS.primary;
        baseStyle.shadowOffset = { width: 0, height: 4 };
        baseStyle.shadowOpacity = 0.15;
        baseStyle.shadowRadius = 8;
        baseStyle.elevation = 4;
    }
    
    return baseStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    // Base text style
    const baseStyle: TextStyle = {
      fontWeight: "500",
      textAlign: "center",
    };
    
    // Size styles
    switch (size) {
      case "small":
        baseStyle.fontSize = FONTS.size.sm;
        break;
      case "large":
        baseStyle.fontSize = FONTS.size.lg;
        break;
      default: // medium
        baseStyle.fontSize = FONTS.size.md;
    }
    
    // Variant styles
    switch (variant) {
      case "outlined":
      case "text":
        baseStyle.color = COLORS.primary;
        break;
      default: // filled
        baseStyle.color = COLORS.text.inverse;
    }
    
    return baseStyle;
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === "filled" ? COLORS.text.inverse : COLORS.primary}
          size={size === "small" ? "small" : "small"}
        />
      );
    }
    
    const iconSize = size === "small" ? 16 : size === "large" ? 24 : 20;
    
    return (
      <>
        {icon && iconPosition === "left" && (
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={variant === "filled" ? COLORS.text.inverse : COLORS.primary}
            style={{ marginRight: SPACING.xs }}
          />
        )}
        
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        
        {icon && iconPosition === "right" && (
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={variant === "filled" ? COLORS.text.inverse : COLORS.primary}
            style={{ marginLeft: SPACING.xs }}
          />
        )}
      </>
    );
  };
  
  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(),
        style,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: variant === "filled" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
    >
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});