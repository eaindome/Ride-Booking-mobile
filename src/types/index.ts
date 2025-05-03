export interface User {
    id: number;
    name: string;
    email: string;
}
  
export interface Ride {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  destination?: string;
  date: string;
  cost: number;
  distance: number;
  status: string;
  driver?: {
    image?: string;
    name: string;
    rating: number;
  };
  eta?: string;
  vehicle?: {
    model: string;
    plate: string;
  };
  pickup_coordinates?: [number, number]
  destination_coordinates?: [number, number]
}

  
export interface Place {
    id: string;
    place_name: string;
    address?: string;
    geometry: {
      coordinates: [number, number];
    };
}
  
export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}
  
export interface ApiError {
    message: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
      };
    };
  }