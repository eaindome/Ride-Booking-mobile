import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from "@react-native-community/netinfo";

// Global state
let isConnected = true;
let listeners: ((connected: boolean) => void)[] = [];

// Initialize network monitoring
export const initNetworkMonitoring = (): NetInfoSubscription => {
  return NetInfo.addEventListener((state: NetInfoState) => {
    const connected = state.isConnected ?? false;

    // Only notify if the state changed
    if (connected !== isConnected) {
      isConnected = connected;
      notifyListeners();
    }
  });
};

// Add listener for connection changes
export const addNetworkListener = (callback: (connected: boolean) => void) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
};

// Notify all listeners of connection state
const notifyListeners = () => {
  listeners.forEach((listener) => listener(isConnected));
};

// Check if device is online
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

// Cache and retrieve data for offline use
export const cacheData = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      `cache:${key}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Error caching data:", error);
  }
};

// Get cached data with optional expiry (in milliseconds)
export const getCachedData = async <T>(
  key: string,
  expiry?: number
): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(`cache:${key}`);

    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);

    // Check expiry if specified
    if (expiry && Date.now() - timestamp > expiry) {
      // Cache expired
      return null;
    }

    return data as T;
  } catch (error) {
    console.error("Error retrieving cached data:", error);
    return null;
  }
};
