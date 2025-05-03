import React from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

interface MapViewProps {
  coordinates: [number, number]; // User location [lng, lat]
  driverLocation?: [number, number]; // Optional driver coordinates
  destinationLocation?: [number, number]; // Optional destination coordinates
  rideStatus?: string;
}

export default function MapView({
  coordinates,
  driverLocation,
  destinationLocation,
  rideStatus,
}: MapViewProps) {
  // Set default values if not provided
  const userLocation = coordinates;
  const hasDestination = !!destinationLocation;
  const hasDriver = !!driverLocation;
  const isActiveRide =
    !!rideStatus &&
    rideStatus.toLowerCase() !== "completed" &&
    rideStatus.toLowerCase() !== "cancelled";

  // Calculate center and zoom level based on available points
  let centerLat = userLocation[1];
  let centerLng = userLocation[0];
  let zoomLevel = 13;

  // If we have multiple points, center the map between them
  if (hasDestination) {
    centerLat = (userLocation[1] + destinationLocation[1]) / 2;
    centerLng = (userLocation[0] + destinationLocation[0]) / 2;
    zoomLevel = 12; // Zoom out a bit to show both points
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Leaflet Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize map
          const map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoomLevel});
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          // Create custom marker icons
          const userIcon = L.divIcon({
            html: '<div style="background-color: #3498db; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white;"></div>',
            className: 'user-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          const driverIcon = L.divIcon({
            html: '<div style="background-color: #e74c3c; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white;"></div>',
            className: 'driver-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          const destinationIcon = L.divIcon({
            html: '<div style="background-color: #2ecc71; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white;"></div>',
            className: 'destination-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          // Add user marker
          const userMarker = L.marker([${userLocation[1]}, ${
    userLocation[0]
  }], { icon: userIcon })
            .addTo(map)
            .bindPopup("Your location");
            
          // Add destination marker if available
          ${
            hasDestination
              ? `
            const destinationMarker = L.marker([${destinationLocation[1]}, ${
                  destinationLocation[0]
                }], { icon: destinationIcon })
              .addTo(map)
              .bindPopup("Destination");
              
            // Draw route line between user and destination
            const routeLine = L.polyline([
              [${userLocation[1]}, ${userLocation[0]}],
              [${destinationLocation[1]}, ${destinationLocation[0]}]
            ], {
              color: '#3498db',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10'
            }).addTo(map);
            
            // Fit bounds to show all markers
            const bounds = L.latLngBounds(
              [${userLocation[1]}, ${userLocation[0]}],
              [${destinationLocation[1]}, ${destinationLocation[0]}]
            );
            ${
              hasDriver
                ? `bounds.extend([${driverLocation[1]}, ${driverLocation[0]}]);`
                : ""
            }
            map.fitBounds(bounds, { padding: [50, 50] });
          `
              : ""
          }
          
          // Add driver marker if available and ride is active
          ${
            hasDriver && isActiveRide
              ? `
            const driverMarker = L.marker([${driverLocation[1]}, ${
                  driverLocation[0]
                }], { icon: driverIcon })
              .addTo(map)
              .bindPopup("Driver location");
              
            // If ride is in progress, draw route from driver to user
            ${
              rideStatus &&
              (rideStatus.toLowerCase() === "driver on the way" ||
                rideStatus.toLowerCase() === "driver arrived")
                ? `
              const driverRoute = L.polyline([
                [${driverLocation[1]}, ${driverLocation[0]}],
                [${userLocation[1]}, ${userLocation[0]}]
              ], {
                color: '#e74c3c',
                weight: 4,
                opacity: 0.7
              }).addTo(map);
            `
                : ""
            }
            
            // If ride is started, draw route from user to destination
            ${
              rideStatus && rideStatus.toLowerCase() === "ride started"
                ? `
              const activeRoute = L.polyline([
                [${driverLocation[1]}, ${driverLocation[0]}],
                [${
                  destinationLocation
                    ? `${destinationLocation[1]}, ${destinationLocation[0]}`
                    : `${userLocation[1]}, ${userLocation[0]}`
                }]
              ], {
                color: '#2ecc71',
                weight: 5,
                opacity: 0.9
              }).addTo(map);
            `
                : ""
            }
          `
              : ""
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
