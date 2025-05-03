import axios, { AxiosInstance, isAxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { AuthResponse, Ride, Place } from "../types";

const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "http://192.168.43.103:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 100005
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    console.log(`Hitting signup API with data: ${JSON.stringify(data)}`);
    const response = await api.post("/auth/signup", data);
    console.log(`Signup response: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    console.error("Signup error:", error);
    if (isAxiosError(error)) {
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
    }
    throw error;
  }
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const searchPlaces = async (query: string): Promise<Place[]> => {
  const response = await api.get("/rides/places", { params: { query } });
  return response.data;
};

export const bookRide = async (destination: string): Promise<Ride> => {
  console.log(`Destination: ${destination}`);
  const response = await api.post("/rides", { destination });
  console.log(`Book ride response: ${JSON.stringify(response.data)}`);
  return response.data;
};

export const getRideStatus = async (): Promise<Ride> => {
  const response = await api.get("/rides/status");
  return response.data;
};

export const getRideHistory = async (status?: string): Promise<Ride[]> => {
  const params = status ? { status } : {};
  const response = await api.get("/rides/history", { params });
  return response.data;
};

export const updateRideStatus = async (rideId: string, status: string): Promise<Ride> => {
  try {
    console.log(`Ride: ${rideId}, Status to update: ${status}`);
    const response = await api.put(`/rides/${rideId}/status`, { status });
    console.log(`Update ride status response: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    console.error("Update ride status error:", error);
    if (isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      console.error("Headers:", JSON.stringify(error.response?.headers));
    }
    throw error;
  }
};

export const cancelRide = async (rideId: string): Promise<void> => {
  await api.delete(`/rides/${rideId}`);
};