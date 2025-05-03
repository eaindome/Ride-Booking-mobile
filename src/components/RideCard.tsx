import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../utils/constants";
import { Ride } from "../types";
import { formatDate, formatDistance } from "../utils/helpers";

interface RideCardProps {
  ride: Ride;
  onPress?: () => void;
}

export default function RideCard({ ride, onPress }: RideCardProps) {
  // Get icon based on ride status
  const getStatusIcon = (): { name: "checkmark-circle" | "close-circle" | "time" | "ellipsis-horizontal-circle"; color: string } => {
    switch (ride.status) {
      case "completed":
        return { name: "checkmark-circle", color: COLORS.secondary };
      case "cancelled":
        return { name: "close-circle", color: COLORS.error };
      case "in_progress":
        return { name: "time", color: "#FFB800" };
      default:
        return { name: "ellipsis-horizontal-circle", color: COLORS.text.secondary };
    }
  };

  const statusIcon = getStatusIcon();

  // Format the date to be more readable
  const formattedDate = formatDate(ride.date);
  
  // Format the ride cost
  // const formattedCost = formatCurrency(ride.cost);
  
  // Format the ride distance
  const formattedDistance = formatDistance(ride.distance);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left side - Driver info */}
      <View style={styles.leftSection}>
        {ride.driver?.image ? (
          <Image source={{ uri: ride.driver.image }} style={styles.driverImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="person" size={20} color={COLORS.text.secondary} />
          </View>
        )}

        <View style={styles.routeIconContainer}>
          <Ionicons name="ellipse-sharp" size={10} color={COLORS.primary} />
          <View style={styles.routeLine} />
          <Ionicons name="location" size={12} color={COLORS.error} />
        </View>
      </View>

      {/* Middle section - Ride details */}
      <View style={styles.middleSection}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>From</Text>
          <Text 
            style={styles.locationText} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {ride.pickup_location}
          </Text>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>To</Text>
          <Text 
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {ride.dropoff_location}
          </Text>
        </View>

        <View style={styles.metaInfo}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <View style={styles.detailsPill}>
            <Ionicons name="speedometer-outline" size={12} color={COLORS.text.secondary} />
            <Text style={styles.detailsText}>{formattedDistance}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons name={statusIcon.name} size={14} color={statusIcon.color} />
            <Text style={[styles.statusText, { color: statusIcon.color }]}>
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Right section - Cost */}
      {/* <View style={styles.rightSection}>
        <Text style={styles.costText}>{formattedCost}</Text>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={COLORS.text.secondary} 
          style={styles.chevron}
        />
      </View> */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.medium,
    marginTop: SPACING.md,
  },
  leftSection: {
    alignItems: "center",
    width: 50,
    marginRight: SPACING.sm,
  },
  driverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routeIconContainer: {
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
  },
  routeLine: {
    flex: 1,
    width: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 4,
  },
  middleSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  locationContainer: {
    marginBottom: SPACING.xs,
  },
  locationLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.primary,
    fontWeight: "medium",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    flexWrap: "wrap",
  },
  dateText: {
    fontSize: FONTS.size.xs,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  detailsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  detailsText: {
    fontSize: FONTS.size.xs,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: FONTS.size.xs,
    fontWeight: "bold",
    marginLeft: 4,
  },
  rightSection: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: SPACING.sm,
  },
  costText: {
    fontSize: FONTS.size.md,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  chevron: {
    marginTop: SPACING.xs,
  }
});