import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Animated,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from 'expo-location';
import MapView from "../src/components/MapView";
import InputField from "../src/components/InputField";
import Button from "../src/components/Button";
import ErrorMessage from "../src/components/ErrorMessage";
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { searchPlaces, bookRide, getRideStatus, cancelRide, updateRideStatus } from "../src/utils/api";
import { getSocket } from "../src/utils/socket";
import { logout } from "../src/utils/auth";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../src/utils/constants";
import { Ride, Place, ApiError } from "../src/types";
import { isOnline } from "@/src/utils/network";
import { queueAction } from "@/src/utils/offlineQueue";

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  // State management
  const [query, setQuery] = useState<string>("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([-74.0060, 40.7128]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  
  // Animation values
  const searchBarHeight = useRef(new Animated.Value(60)).current;
  const bottomSheetHeight = useRef(new Animated.Value(0)).current;
  const rideStatusOpacity = useRef(new Animated.Value(0)).current;
  
  // Refs
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Animations
  const animateSearchBar = useCallback((focused: boolean, hasSelected: boolean) => {
    Animated.timing(searchBarHeight, {
      toValue: focused ? 300 : (hasSelected ? 120 : 50),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [searchBarHeight]);
  
  const animateBottomSheet = useCallback((visible: boolean) => {
    Animated.timing(bottomSheetHeight, {
      toValue: visible ? (height * 0.3) : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [bottomSheetHeight]);
  
  const animateRideStatus = useCallback((visible: boolean) => {
    Animated.timing(rideStatusOpacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [rideStatusOpacity]);

  // Fetch active ride on mount
  const checkRideStatus = useCallback(async () => {
    try {
      const response = await getRideStatus();
      // If active ride exists
      if (response) {
        setRide(response);
        getSocket().emit("joinRide", response.id);
        animateRideStatus(true);
        
        // Hide search if ride is active
        setSearchFocused(false);
        if (selectedPlace) setSelectedPlace(null);
      }
    } catch (err) {
      if ((err as ApiError).response?.status !== 404) {
        showError((err as ApiError).response?.data?.message || "Failed to fetch ride status");
      }
    }
  }, [animateRideStatus, selectedPlace]);

  // Error handling utility
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  // Setup socket connection and location
  useEffect(() => {
    const socket = getSocket();

    socket.on("statusUpdate", (updatedRide: Ride) => {
      console.log(`Received ride update: ${updatedRide.status}`);

      // check if transitioning to completed state
      const isCompletingRide = (!ride || ride.status.toLowerCase() !== "completed") ||  updatedRide.status.toLowerCase() === "ride completed" ||  updatedRide.status.toLowerCase() === "completed";
      
      // update ride state
      setRide(updatedRide);
      animateRideStatus(true);
      
      // Notify user about completion immediately
      if (isCompletingRide) {
        // Visual notification
        Toast.show({
          type: 'success',
          text1: 'Ride Completed',
          text2: 'Your ride has been completed successfully.',
          visibilityTime: 4000,
        });
        
        // Haptic feedback (if available)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });

    socket.on("driverLocationUpdate", (data: { coordinates: [number, number] }) => {
      // Handle real-time driver location updates if backend sends these
      if (ride) {
        setRide(prev => prev ? {
          ...prev,
          pickup_coordinates: data.coordinates
        } : null);
      }
    });
    
    socket.on("error", (err: { message: string }) => {
      showError(err.message);
    });

    // Get user's location
    getUserLocation();

    // Check if there's an active ride
    checkRideStatus();

    return () => {
      socket.off("statusUpdate");
      socket.off("driverLocationUpdate");
      socket.off("error");
    };
  }, [animateRideStatus, checkRideStatus, ride]);

  // Effect for handling animations
  useEffect(() => {
    animateSearchBar(searchFocused, !!selectedPlace);
    animateBottomSheet(!!selectedPlace && !searchFocused && !ride);
  }, [searchFocused, selectedPlace, ride, animateSearchBar, animateBottomSheet]);

  // Get user location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. Using default location."
        );
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation([location.coords.longitude, location.coords.latitude]);
    } catch (err) {
      console.error("Error getting location:", err);
    }
  };

  // Debounced search
  const handleSearch = (text: string) => {
    setQuery(text);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      if (text.length > 2) {
        setError("");
        setLoading(true);
        try {
          const response = await searchPlaces(text);
          setPlaces(response);
        } catch (err) {
          showError((err as ApiError).response?.data?.message || "Failed to search places");
        } finally {
          setLoading(false);
        }
      } else {
        setPlaces([]);
      }
    }, 500);
  };

  // Book a ride
  const handleBookRide = async () => {
    if (!selectedPlace) {
      showError("Please select a destination");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const response = await bookRide(selectedPlace.place_name);
      setRide(response);
      getSocket().emit("joinRide", response.id);
      
      // Clear search state
      setSelectedPlace(null);
      setQuery("");
      setPlaces([]);
      setSearchFocused(false);
      
      animateRideStatus(true);
    } catch (err) {
      showError((err as ApiError).response?.data?.message || "Failed to book ride");
    } finally {
      setLoading(false);
    }
  };

  // Select place from results
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setSearchFocused(false);
    setQuery(place.place_name);
  };

  // Cancel ride
  const handleCancelRide = async () => {
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel this ride?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes",
          onPress: async () => {
            if (!(await isOnline())) {
              // Queue the action for later
              await queueAction('CANCEL_RIDE', { rideId: ride?.id });
              
              // Provide feedback to user
              Toast.show({
                type: 'info',
                text1: 'You\'re offline',
                text2: 'Your ride will be cancelled when you\'re back online.',
              });
              
              return;
            }
            try {
              if (ride && ride.id) {
                await cancelRide(ride.id);
              }
              setRide(null);
              animateRideStatus(false);
            } catch (err) {
              console.log(`error: ${err}`);
              showError("Failed to cancel ride");
            }
          }
        }
      ]
    );
  };

  // Update ride status
  const handleUpdateRideStatus = () => {
    console.log("Update button clicked");
    console.log("Current ride:", JSON.stringify(ride));
    
    // Only allow updating to next logical status based on current status
    let nextStatus: string;
    
    // Use the exact status strings from the backend
    switch (ride?.status) {
      case "Accepted":
        nextStatus = "Driver on the way";
        break;
      case "Driver on the way":
        nextStatus = "Driver arrived";  // This is what the backend expects
        break;
      case "Driver arrived":
        nextStatus = "Ride started";    // This is what the backend expects
        break;
      case "Ride started":
        nextStatus = "Ride completed";  // This is what the backend expects
        break;
      default:
        // Try with lowercase comparison if exact match fails
        switch (ride?.status.toLowerCase()) {
          case "accepted":
            nextStatus = "Driver on the way";
            break;
          case "driver on the way":
            nextStatus = "Driver arrived";
            break;
          case "driver arrived":
            nextStatus = "Ride started";
            break;
          case "ride started":
            nextStatus = "Ride completed";
            break;
          default:
            nextStatus = "";
        }
    }
    
    console.log("Next status:", nextStatus);
  
    if (!nextStatus) {
      console.log("No valid next status for:", ride?.status);
      showError("Cannot update from current status");
      return;
    }
    
    Alert.alert(
      "Update Ride Status",
      `Change status to "${nextStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update",
          onPress: async () => {
            try {
              console.log("Update confirmed");
              if (ride && ride.id) {
                console.log("Attempting to update ride ID:", ride.id, "to status:", nextStatus);
                const updatedRide = await updateRideStatus(ride.id.toString(), nextStatus);
                setRide(updatedRide);
                
                // If status was updated to completed, auto-dismiss after delay
                if (nextStatus === "Ride completed" || nextStatus.toLowerCase() === "completed") {
                  console.log("Ride completed, showing done button");
                }
              } else {
                console.log("Invalid ride or ride ID:", ride);
                showError("Cannot update: Invalid ride information");
              }
            } catch (err) {
              console.log(`Error: ${err}`)
              showError("Failed to update ride status");
            }
          }
        }
      ]
    );
  };

  //  a notification when a ride completes
useEffect(() => {
  if (ride?.status?.toLowerCase() === "completed" || 
      ride?.status?.toLowerCase() === "ride completed") {
    // Could use a toast library or Alert here
    Alert.alert(
      "Ride Completed",
      "Your ride has been completed. It may take a few moments to process.",
      [{ text: "OK" }]
    );
  }
}, [ride?.status]);

  // Ride status utilities
  const getRideStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted": return COLORS.secondary;
      case "driver on the way": return "#F9A826";
      case "arrived": return "#4CAF50";
      case "in progress": return COLORS.primary;
      case "completed": return "#43A047";
      case "ride completed": return "#43A047";
      default: return COLORS.primary;
    }
  };

  const getRideStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted": return "checkmark-circle";
      case "on the way": return "car";
      case "arrived": return "location";
      case "in progress": return "navigate";
      case "completed": return "flag";
      default: return "time";
    }
  };

  // Reset search
  const resetSearch = () => {
    setSelectedPlace(null);
    setQuery("");
    setSearchFocused(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Map */}
      <MapView
        coordinates={selectedPlace?.geometry?.coordinates || userLocation}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        {/* Left side - Empty or can have app logo/name */}
        {/* <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>SHORTZY</Text>
        </View> */}

        <View style={{ flex: 1 }} />
        
        {/* Right side - Buttons */}
        <View style={styles.headerRight}>
          {/* Location button */}
          <TouchableOpacity
            style={[styles.headerButton, { marginRight: SPACING.sm }]}
            onPress={getUserLocation}
          >
            <Ionicons name="locate" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          
          {/* Logout button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search bar - Always visible but size changes */}
      <Animated.View 
        style={[
          styles.searchContainer,
          { height: searchBarHeight }
        ]}
      >
        <View style={styles.searchBar}>
          <TouchableOpacity 
            style={styles.searchInputWrapper}
            onPress={() => !ride && setSearchFocused(true)}
            activeOpacity={ride ? 1 : 0.7}
          >
            <InputField
              label=""
              placeholder="Where would you like to go?"
              value={query.length > 40 ? query.substring(0, 39) + '...' : query}
              onChangeText={ride ? () => {} : handleSearch}
              icon="search-outline"
              onFocus={() => !ride && setSearchFocused(true)}
              onBlur={() => {}}
              editable={!ride}
              style={[ride ? styles.disabledInput : {}, { paddingBottom: SPACING.sm }]}
              numberOfLines={1} 
            />
          </TouchableOpacity>
        </View>
        
        {error ? <ErrorMessage message={error} /> : null}
        
        {loading && <ActivityIndicator style={styles.loading} color={COLORS.primary} />}
        
        {/* Search results */}
        {searchFocused && (
          <FlatList
            data={places}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.placeItem}
                onPress={() => handleSelectPlace(item)}
              >
                <Ionicons name="location-outline" size={18} color={COLORS.primary} style={styles.placeIcon} />
                <View style={styles.placeTextContainer}>
                  <Text style={styles.placeText} numberOfLines={1}>{item.place_name}</Text>
                  {item.address && (
                    <Text style={styles.placeSubtext} numberOfLines={1}>{item.address}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={styles.placeList}
            contentContainerStyle={styles.placeListContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              query.length > 2 && !loading ? (
                <Text style={styles.noResults}>No destinations found</Text>
              ) : query.length > 0 && query.length < 3 ? (
                <Text style={styles.searchHint}>Type at least 3 characters to search</Text>
              ) : null
            }
          />
        )}
        
        {/* Selected place summary (when place selected but not in search mode) */}
        {selectedPlace && !searchFocused && !ride && (
          <View style={styles.selectedPlaceInfo}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <View style={styles.selectedPlaceText}>
              <Text 
                style={styles.selectedPlaceTitle} 
                numberOfLines={1}>
                  {selectedPlace.place_name}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={resetSearch}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
      
      {/* Bottom sheet for booking */}
      {selectedPlace && !searchFocused && !ride && (
        <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
          <View style={styles.bottomSheetHandle} />
          
          <View style={styles.destinationCard}>
            <View style={styles.destinationHeader}>
              <Text style={styles.destinationTitle}>Your destination</Text>
              <TouchableOpacity onPress={() => setSearchFocused(true)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.destinationDetails}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <View style={styles.destinationTextContainer}>
                <Text style={styles.destinationName} numberOfLines={1}>
                  {selectedPlace.place_name}
                </Text>
                {selectedPlace.address && (
                  <Text style={styles.destinationAddress} numberOfLines={1}>
                    {selectedPlace.address}
                  </Text>
                )}
              </View>
            </View>
            
            <Button
              title="Book Ride"
              onPress={handleBookRide}
              loading={loading}
              style={styles.bookButton}
            />
          </View>
        </Animated.View>
      )}
      
      {/* Active ride card */}
      {ride && (
        <Animated.View 
          style={[
            styles.rideStatusCard,
            { 
              opacity: rideStatusOpacity,
              transform: [{ 
                translateY: rideStatusOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.rideStatusHeader}>
            <View style={[
              styles.rideStatusIconContainer,
              { backgroundColor: getRideStatusColor(ride.status) + '20' }
            ]}>
              <Ionicons 
                name={getRideStatusIcon(ride.status)} 
                size={24} 
                color={getRideStatusColor(ride.status)} 
              />
            </View>
            
            <View style={styles.rideStatusInfo}>
              <Text style={styles.rideStatusTitle}>
                {ride.status === "completed" ? "Ride completed" : `${ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}`}
              </Text>
              
              {ride.status.toLowerCase() !== "completed" && (
                <Text style={styles.rideStatusSubtitle}>
                  ETA: {ride.eta || "Calculating..."}
                </Text>
              )}
            </View>
            
            {/* Only show action buttons if ride is not completed or cancelled */}
            {!["completed", "ride completed", "cancelled"].includes(ride.status.toLowerCase()) && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.updateButton}
                  onPress={handleUpdateRideStatus}
                >
                  <Text style={styles.updateText}>Update</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.cancelButton, { marginLeft: SPACING.xs }]}
                  onPress={handleCancelRide}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.rideDetails}>
            <View style={styles.rideDetailRow}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.rideDetailText} numberOfLines={1}>
                {ride.destination}
              </Text>
            </View>
            
            {ride.driver && (
              <View style={styles.rideDetailRow}>
                <Ionicons name="person" size={18} color={COLORS.text.secondary} />
                <Text style={styles.rideDetailText}>
                  {ride.driver.name} · {ride.driver.rating}★
                </Text>
              </View>
            )}
            
            {ride.vehicle && (
              <View style={styles.rideDetailRow}>
                <Ionicons name="car" size={18} color={COLORS.text.secondary} />
                <Text style={styles.rideDetailText}>
                  {ride.vehicle.model} · {ride.vehicle.plate}
                </Text>
              </View>
            )}
          </View>
          
          {ride && (ride.status.toLowerCase() === "completed" || 
                ride.status.toLowerCase() === "ride completed") && (
          <Button
            title="Done"
            onPress={() => {
              setRide(null);
              animateRideStatus(false);
            }}
            style={styles.doneButton}
            icon="car-outline"
            iconPosition="right"
          />
        )}
        </Animated.View>
      )}
      
      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {}}
        >
          <Ionicons name="home" size={24} color={COLORS.primary} />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/ride-history")}
        >
          <Ionicons name="list" size={24} color={COLORS.text.secondary} />
          <Text style={[styles.navButtonText, { color: COLORS.text.secondary }]}>History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 50 : 30, 
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
    marginTop: -SPACING.sm,
  },
  headerButtonsContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  searchContainer: {
    position: "absolute",
    left: SPACING.md,
    right: SPACING.md,
    top: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
    overflow: "hidden",
    zIndex: 100,
    paddingBottom: SPACING.md,
    minHeight: 67
  },
  searchBar: {
    padding: SPACING.sm,
  },
  searchInputWrapper: {
    width: "100%",
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: FONTS.size.md,
    paddingVertical: SPACING.md,
  },
  disabledInput: {
    opacity: 0.7,
  },
  loading: {
    marginVertical: SPACING.xs,
  },
  placeList: {
    flex: 1,
  },
  placeListContent: {
    paddingHorizontal: SPACING.sm,
  },
  placeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  placeIcon: {
    marginRight: SPACING.sm,
  },
  placeTextContainer: {
    flex: 1,
  },
  placeText: {
    color: COLORS.text.primary,
    fontSize: FONTS.size.md,
    fontWeight: "500",
  },
  placeSubtext: {
    color: COLORS.text.secondary,
    fontSize: FONTS.size.sm,
    marginTop: 2,
  },
  noResults: {
    textAlign: "center",
    padding: SPACING.md,
    color: COLORS.text.secondary,
  },
  searchHint: {
    textAlign: "center",
    padding: SPACING.md,
    color: COLORS.text.hint,
    fontStyle: "italic",
  },
  selectedPlaceInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: -SPACING.sm, 
    position: "relative",
    top: -SPACING.sm, 
  },
  selectedPlaceText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  selectedPlaceTitle: {
    fontSize: FONTS.size.md,
    fontWeight: "500",
    color: COLORS.text.primary,
    flexShrink: 1,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  updateButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  updateText: {
    color: COLORS.primary,
    fontSize: FONTS.size.sm,
    fontWeight: "500",
  },
  clearButton: {
    padding: SPACING.xs,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    ...SHADOWS.large,
    zIndex: 50,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: SPACING.sm,
  },
  destinationCard: {
    padding: SPACING.md,
  },
  destinationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  destinationTitle: {
    fontSize: FONTS.size.md,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  changeText: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    fontWeight: "500",
  },
  destinationDetails: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  destinationTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  destinationName: {
    fontSize: FONTS.size.md,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  destinationAddress: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  fareEstimate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  fareLabel: {
    fontSize: FONTS.size.md,
    color: COLORS.text.secondary,
  },
  fareAmount: {
    fontSize: FONTS.size.md,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  bookButton: {
    backgroundColor: COLORS.secondary,
  },
  rideStatusCard: {
    position: "absolute",
    bottom: 80,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
    zIndex: 40,
  },
  rideStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  rideStatusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  rideStatusInfo: {
    flex: 1,
  },
  rideStatusTitle: {
    fontSize: FONTS.size.md,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  rideStatusSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelText: {
    color: COLORS.error,
    fontSize: FONTS.size.sm,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  rideDetails: {
    gap: SPACING.sm,
  },
  rideDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rideDetailText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.size.sm,
    color: COLORS.text.primary,
  },
  doneButton: {
    marginTop: SPACING.md,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  navButton: {
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  navButtonText: {
    fontSize: FONTS.size.xs,
    marginTop: 4,
    color: COLORS.primary,
    fontWeight: "500",
  },
});