import React, { useState } from "react";
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  View, 
  Text, 
  Animated, 
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager 
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../utils/constants";
import { Ionicons } from "@expo/vector-icons";

// Enable layout animations for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface InputFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  error?: string;
  icon?: string;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  numberOfLines?: number,
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
}

export default function InputField({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
  error,
  icon,
  autoCapitalize = "none",
  numberOfLines,
  ellipsizeMode = "tail",
  ...rest
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  
  // Animation for focus state
  const [focusAnim] = useState(new Animated.Value(0));
  
  const animateFocus = (status: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFocused(status);
    Animated.timing(focusAnim, {
      toValue: status ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = error
    ? COLORS.error
    : isFocused
    ? COLORS.primary
    : COLORS.border;

  const labelColor = error
    ? COLORS.error
    : isFocused
    ? COLORS.primary
    : COLORS.text.secondary;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        { borderColor: borderColor }
      ]}>
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.text.secondary} 
            style={styles.icon} 
          />
        )}
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.text.hint}
          onFocus={() => animateFocus(true)}
          onBlur={() => animateFocus(false)}
          autoCapitalize={autoCapitalize}
          numberOfLines={numberOfLines}
          {...rest}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.size.sm,
    fontWeight: "500", 
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 50,
    overflow: "hidden"
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: FONTS.size.md,
    paddingVertical: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.size.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  }
});