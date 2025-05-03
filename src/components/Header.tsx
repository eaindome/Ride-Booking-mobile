import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING } from "../utils/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  transparent?: boolean;
  large?: boolean;
}

export default function Header({
  title,
  onBack,
  rightIcon,
  onRightPress,
  transparent = false,
  large = false
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        styles.container,
        transparent ? styles.transparent : styles.solid,
        { paddingTop: insets.top > 0 ? insets.top : SPACING.md }
      ]}
    >
      <View style={styles.content}>
        {/* Left/back button */}
        {onBack ? (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={transparent ? COLORS.text.inverse : COLORS.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
        
        {/* Title */}
        <Text 
          style={[
            styles.title,
            large ? styles.largeTitle : null,
            transparent ? styles.titleLight : null,
            { maxWidth: '70%' }
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        
        {/* Right button */}
        {rightIcon ? (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onRightPress}
            disabled={!onRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={rightIcon as any} 
              size={24} 
              color={transparent ? COLORS.text.inverse : COLORS.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
      
      {/* Divider line */}
      {!transparent && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  solid: {
    backgroundColor: COLORS.background,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: "semibold",
    color: COLORS.text.primary,
    textAlign: "center",
    flex: 1,
  },
  largeTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: "bold",
  },
  titleLight: {
    color: COLORS.text.inverse,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  }
});