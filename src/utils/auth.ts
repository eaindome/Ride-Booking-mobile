import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router"

export const storeToken = async (token: string): Promise<void> => {
  // const expiration = Date.now() + 24 * 60 * 60 * 1000;
  const expiration = Date.now() + 5 * 60 * 1000; 
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("tokenExpiration", expiration.toString());
};

export const getToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem("token");
  const expiration = await AsyncStorage.getItem("tokenExpiration");

  if (!token || !expiration) return null;

  // Check if token is expired
  if (Date.now() > parseInt(expiration)) {
    // Token expired, clear it
    await clearToken();
    return null;
  }

  return token;
};

export const clearToken = async (): Promise<void> => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("tokenExpiration");
};

export const logout = async (): Promise<void> => {
  await clearToken();
  // Navigate to login screen
  router.replace("/login");
};
