import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SectionList, 
  RefreshControl,
  SafeAreaView,
  StatusBar
} from "react-native";
import { router } from "expo-router";
import Header from "../src/components/Header";
import RideCard from "../src/components/RideCard";
import ErrorMessage from "../src/components/ErrorMessage";
import LoadingSpinner from "../src/components/LoadingSpinner";
import EmptyState from "../src/components/EmptyState";
import ScrollableFilter from "../src/components/ScrollableFilter";
import { getRideHistory } from "../src/utils/api";
import { COLORS, FONTS, SPACING } from "../src/utils/constants";
import { Ride, ApiError } from "../src/types";
import { groupRidesByDate } from "../src/utils/helpers";

// Filter types for ride history
type FilterType = "all" | "completed" | "cancelled" | "in_progress";

export default function RideHistoryScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  // Removed unused filteredRides state
  const [sections, setSections] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  
  // Function to fetch ride history
  const fetchHistory = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setError("");
      setLoading(true);
    }
    
    try {
      const response = await getRideHistory();
      setRides(response);
      
      // Apply any active filters
      filterRides(response, activeFilter);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || "Failed to fetch ride history";

      // Only set error if it's not a "no rides" message
      if (!errorMessage.includes("No rides found")) {
        setError(errorMessage);
      }
      // Removed setFilteredRides as filteredRides state is no longer used
      setSections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(false);
  }, [fetchHistory]);
  
  // Filter rides based on status
  const filterRides = (rideList: Ride[], filter: FilterType) => {
    let filtered: Ride[];
    
    if (filter === "all") {
      filtered = [...rideList];
    } else {
      filtered = rideList.filter(ride => ride.status === filter);
    }
    
    // Removed setFilteredRides as filteredRides state is no longer used
    
    // Group rides by date for section list
    if (filtered.length > 0) {
      const groupedRides = groupRidesByDate(filtered);
      setSections(groupedRides);
    } else {
      setSections([]);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    filterRides(rides, filter);
  };
  
  // View ride details
  const handleRidePress = (ride: Ride) => {
    // Navigate to ride details screen
    console.log(`View ride details: ${ride.id}`);
    // router.push(`/ride/${ride.id}`);
  };
  
  // Load data on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  
  // Render section header
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {section.title}
      </Text>
    </View>
  );
  
  // Render filter buttons
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollableFilter 
      options={[
        { value: "all", label: "All" },
        { value: "completed", label: "Completed" },
        // { value: "in_progress", label: "In Progress" },
        { value: "cancelled", label: "Cancelled" }
      ] as { value: FilterType; label: string }[]}
      activeValue={activeFilter}
      onChange={(value: string) => handleFilterChange(value as FilterType)}
      />
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Header 
          title="Your Ride History" 
          onBack={() => router.back()}
        />
        
        {/* Filters */}
        {renderFilters()}
        
        {/* Error message */}
        {error ? (
          <ErrorMessage message={error} />
        ) : null}
        
        {/* Ride list */}
        {loading ? (
          <LoadingSpinner text="Loading your rides..." />
        ) : error && !error.includes("No rides found") ? (
          // Only show ErrorMessage for actual errors, not for empty data
          <ErrorMessage message={error} />
        ) : sections.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => item.id.toString() + index}
            renderItem={({ item }) => (
              <RideCard 
                ride={item} 
                onPress={() => handleRidePress(item)}
              />
            )}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        ) : (
          <EmptyState
            title="No Rides Found"
            message={
              activeFilter !== "all"
                ? `You don't have any ${activeFilter.replace("_", " ")} rides yet.`
                : "You haven't taken any rides yet."
            }
            icon="car-outline"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filtersContainer: {
    marginVertical: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionHeader: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginLeft: -SPACING.md,
    marginRight: -SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeaderText: {
    fontSize: FONTS.size.sm,
    fontWeight: "semibold",
    color: COLORS.text.secondary,
  }
});