import React from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../utils/constants";

interface FilterOption {
  value: string;
  label: string;
}

interface ScrollableFilterProps {
  options: FilterOption[];
  activeValue: string;
  onChange: (value: string) => void;
}

export default function ScrollableFilter({
  options,
  activeValue,
  onChange,
}: ScrollableFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              isActive && styles.activeFilterButton,
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                isActive && styles.activeFilterText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
  },
  filterButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.round,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.size.sm,
    fontWeight: "medium",
    color: COLORS.text.secondary,
  },
  activeFilterText: {
    color: COLORS.text.inverse,
  },
});