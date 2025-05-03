# Welcome to ySwiftRide - Ride-Booking Mobile App Expo app 👋
## Set up Instructions
This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

# SwiftRide - Ride-Booking Mobile App
# Documentation
A modern ride-booking mobile application built with Expo and React Native. This app provides a seamless interface for users to book rides and manage their ride history.

# Table of Contents
* Overview
* Features
* Tech Stack
* Project Structure
* Screens
* Components
* Setup Instructions
* Usage
* Socket Communication
* API Endpoints
* License

## Overview
SwiftRide is a comprehensive ride-booking mobile application that allows users to:
* Search for destinations
* Book rides to selected locations
* Track driver location in real-time
* View ride status updates
* Cancel or update ride status
* View ride history
The app features a clean, intuitive user interface with real-time map visualizations and animations for a smooth user experience.

## Features
* *User Authentication:* Secure login and signup functionality
* *Real-time Tracking:* Live tracking of driver locations
* *Interactive Maps*: Visual representation of routes and locations
* *Place Search*: Search and select destinations
* *Ride Management*: Book, track, update, and cancel rides
* *Status Updates*: Receive real-time ride status updates
* *Ride History*: View past rides with filtering options
* *Socket Integration*: Real-time updates using Socket.IO
* *Responsive UI*: Smooth animations and transitions

## Tech Stack
* *Frontend Framework*: React Native
* *Development Platform*: Expo (v53.0.5)
* *Language*: TypeScript
* *State Management*: React Hooks (useState, useEffect, useRef, useCallback)
* *Navigation*: Expo Router
* *Maps*: Leaflet (embedded via WebView)
* *Real-time Communication*: Socket.IO
* *HTTP Client*: Axios
* *UI Components*: Custom built components
* *Styling*: React Native StyleSheet
* *Icons*: Expo Vector Icons
* *Storage*: AsyncStorage for token persistence
* *Location*: Expo Location API

## Project Structure
```bash
Ride-Booking-mobile/
├── app/                 # Main application screens (file-based routing)
│   ├── _layout.tsx      # Root layout for navigation
│   ├── index.tsx        # Entry point and redirect
│   ├── home.tsx         # Main home screen with map and booking
│   ├── login.tsx        # Login screen
│   ├── signup.tsx       # Signup screen
│   └── ride-history.tsx # Ride history screen
├── src/
│   ├── components/      # Reusable UI components
│   ├── types/           # TypeScript interfaces and types
│   └── utils/           # Utility functions and helpers
│       ├── api.ts       # API endpoints and Axios config
│       ├── auth.ts      # Authentication utilities
│       ├── constants.ts # App-wide constants
│       ├── helpers.ts   # Helper functions
│       └── socket.ts    # Socket.IO configuration
├── assets/              # Static assets like images
└── package.json         # Dependencies and scripts
```
## Screens
1. Home Screen (**home.tsx**)
The main screen of the application where users can:
* View an interactive map
* Search for destinations
* Book rides
* Track active rides
* Update ride status
* Cancel rides

   **Features:**
   * Real-time map with custom markers
   * Animated search bar that expands/collapses
   * Bottom sheet for ride booking
   * Ride status card with dynamic updates
   * Custom header with location refresh and logout

2. Login Screen (login.tsx)
Handles user authentication with:
* Email and password validation
* Error handling
* Success redirection to home screen
* Link to signup for new users

3. Signup Screen (signup.tsx)
Allows new users to create an account with:
* Form validation
* User information collection
* Error handling
* Success redirection to home screen

4. Ride History Screen (ride-history.tsx)
Displays past rides with:
* Filterable list by ride status
* Section list grouped by date
* Pull-to-refresh functionality
* Empty state handling

## Components
1. MapView
* Displays interactive map using Leaflet
* Shows user, driver, and destination locations
* Draws routes between points
* Changes visualization based on ride status

2. InputField
* Customizable text input with labels
* Error state handling
* Icon support
* Focus animations

3. Button
* Multiple variants (filled, outlined, text)
* Loading state
* Icon support
* Size variations

4. ErrorMessage
* Display error messages with appropriate styling
* Different message types (error, warning, info)

5. RideCard
* Displays ride information in history view
* Shows pickup and dropoff locations
* Includes ride date, status, and distance
* Touchable for navigation to details

6. Header
* Customizable page header with back button
* Optional right icon button
* Large title support
* Transparent mode option

7. ScrollableFilter
* Horizontal scrolling filter options
* Active state indication
* Touch feedback

8. LoadingSpinner
* Activity indicator with optional text
* Size variations

9. EmptyState
* Displays when no data is available
* Customizable icon and messages
* Optional action button

## Setup Instructions
1. Prerequisites
   * Node.js (v14 or later)
   * npm or yarn
   * Expo CLI
   * Android Studio (for Android emulator) or Xcode (for iOS simulator)
   * Physical device with Expo Go app (optional)

2. Installation
   * Clone the repository:
   ```bash
   git clone https://github.com/eaindome/ride-booking-mobile.git
   cd ride-booking-mobile
   ```

   * Install dependencies:
   `npm install`

   * Configure API and socket endpoints:
   Open app.json and update the extra section with your API and socket URLs:
   ```json
   "extra": {
      "apiUrl": "http://192.168.x.x:5000/api",
      "socketUrl": "http://192.168.x.x:5000"
   }
   ```

> ### ⚠️ IMPORTANT: Network Configuration
>
> The mobile app and backend server **MUST** be on the same network for proper communication.
> 
> Use your local IP address (like `192.168.x.x`) instead of `localhost` or `127.0.0.1`, as these refer to the device itself, not your development machine.

   * Start the development server:
   `npx expo start`

   * Open the app:
      * Scan the QR code with Expo Go app on Android
      * Use the Camera app to scan the QR code on iOS
      * Press 'a' to open in Android emulator
      * Press 'i' to open in iOS simulator

## Usage
1. Authentication:
   * Create an account or log in with existing credentials
   * Both signup and login screens perform validation

2. Booking a Ride:
      * On the home screen, search for a destination
      * Select a destination from the search results
      * Tap "Book Ride" in the bottom sheet

3. Managing Active Rides:
      * View ride status in the active ride card
      * Track driver location on the map
      * Update ride status with the "Update" button (progresses through status workflow)
      * Cancel ride if needed

4. Viewing Ride History:
      * Navigate to the History tab
      * Browse past rides
      * Filter by ride status (All, Completed, Cancelled)
      * Pull down to refresh the list

## Socket Communication
The app uses Socket.IO for real-time updates:

* *Connection:* Established when user authenticates
* *Events:*
   * **joinRide:** Emitted when a user books a ride or has an active ride
   * **statusUpdate**: Received when ride status changes
   * **driverLocationUpdate**: Received when driver location changes
   * **error**: Received when there's an error with the ride
Socket connection is managed in `socket.ts` with automatic reconnection and error handling.

## API Endpoints
The app communicates with a backend server through these endpoints:

1. Authentication:
   * **POST /auth/signup:** Create new user account
   * **POST /auth/login**: Authenticate user

2. Rides:
   * **GET /rides/places:** Search for places by query
   * **POST /rides:** Book a new ride
   * **GET /rides/status:** Get status of active ride
   * **GET /rides/history:** Get ride history
   * **PUT /rides/:id/status:** Update ride status
   * **DELETE /rides/:id:** Cancel a ride
API calls are managed in `api.ts` using Axios with token-based authentication.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

© 2025 SwiftRide. All rights reserved.
