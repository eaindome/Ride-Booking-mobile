import Constants from "expo-constants";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const SOCKET_URL: string =
  Constants.expoConfig?.extra?.socketUrl || "http://localhost:3000";

let socket: any | null = null;

export const initSocket = (): void => {
  try {
    if (!socket) {
      socket = io(SOCKET_URL, { 
        transports: ["websocket"],
        timeout: 10000, // 10-second timeout
        reconnectionAttempts: 3 // Limit reconnection attempts
      });

      socket.on("connect_error", async (error: Error) => {
        console.error("Socket connection error:", error);
        // Don't show an error to the user - just handle silently
        
        // If we can't connect to the socket after retries, log the user out
        socket.disconnect();
        socket = null;
        
        // Don't force logout on every connection error - socket.io will retry
        // Only force logout if we explicitly decide the server is unreachable
      });
      
      socket.on("connect", () => {
        console.log("Socket connected successfully");
      });
      
      socket.on("disconnect", (reason: any) => {
        console.log("Socket disconnected:", reason);
        // If the server forcibly disconnected us, log out
        if (reason === "io server disconnect") {
          handleForceLogout();
        }
      });
    }
  } catch (error) {
    console.error("Socket initialization failed:", error);
    // Don't crash the app or show errors to users
  }
};

// Handle forced logout due to server issues
const handleForceLogout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("tokenExpiration");
    router.replace("/login");
  } catch (error) {
    console.error("Force logout failed:", error);
  }
};

export const getSocket = (): any => {
  if (!socket) {
    try {
      initSocket();
    } catch (error) {
      console.error("Socket error in getSocket:", error);
      // Return a dummy socket object that won't crash the app
      return {
        emit: () => console.log("Socket not connected - emission ignored"),
        on: () => console.log("Socket not connected - listener ignored"),
        disconnect: () => {}
      };
    }
  }
  return socket || {
    emit: () => console.log("Socket not connected - emission ignored"),
    on: () => console.log("Socket not connected - listener ignored"),
    disconnect: () => {}
  };
};