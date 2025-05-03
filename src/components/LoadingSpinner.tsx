import React from "react";
import { 
  View, 
  ActivityIndicator, 
  StyleSheet, 
  Text,
  Animated,
  Easing
} from "react-native";
import { COLORS, FONTS, SPACING } from "../utils/constants";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  text?: string;
  fullScreen?: boolean;
  color?: string;
}

export default function LoadingSpinner({
  size = "large",
  text,
  fullScreen = false,
  color = COLORS.primary
}: LoadingSpinnerProps) {
  // Create a rotating animation for a custom spinner effect
  const spinValue = React.useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, [spinValue]);

  return (
    <View style={[
      styles.container,
      fullScreen ? styles.fullScreen : null
    ]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  text: {
    marginTop: SPACING.sm,
    color: COLORS.text.secondary,
    fontSize: FONTS.size.sm,
  }
});