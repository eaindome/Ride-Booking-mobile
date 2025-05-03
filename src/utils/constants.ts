export const COLORS = {
    // Core palette
    primary: "#0A84FF",      // iOS blue - slightly adjusted for better contrast
    secondary: "#34C759",    // iOS green for success states
    background: "#FFFFFF",   // Clean white background
    surface: "#F2F2F7",      // Light gray for cards/inputs
    error: "#FF3B30",        // iOS red
    text: {
      primary: "#000000",    // Primary text
      secondary: "#3C3C43",  // Secondary text with 60% opacity
      tertiary: "#3C3C43",   // Tertiary text with 30% opacity
      hint: "#3C3C43",       // Hint text with 60% opacity
      disabled: "#3C3C43",   // Disabled text with 30% opacity
      inverse: "#FFFFFF",    // Text on dark backgrounds
    },
    border: "#E5E5EA",       // Light border color
    divider: "#C6C6C8",      // Divider color
    shadow: "#000000",       // Shadow color with opacity in use
  };
  
  export const FONTS = {
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  };
  
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  };
  
  export const SHADOWS = {
    small: {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 2,
    },
    large: {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  };