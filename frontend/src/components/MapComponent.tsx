import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";
import { Map, Camera, LogManager, Marker } from "@maplibre/maplibre-react-native";
import { useLocation } from "../hooks/useLocation";
import { LocateFixed } from "lucide-react-native";

LogManager.setLogLevel("error");
LogManager.onLog(() => true);

export default function MapComponent() {
  const API_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? "";
  const MAP_STYLE = `https://api.maptiler.com/maps/outdoor-v4/style.json?key=${API_KEY}`;
  
  console.log("MapComponent API_KEY:", API_KEY ? "EXISTS" : "MISSING");
  console.log("MAP_STYLE:", MAP_STYLE);

  const {
    getLocation,
    isLoading: isLocating,
    error: locationError,
  } = useLocation();

  const cameraRef = useRef<any>(null);
  const centerRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleLocateMe = async () => {
    const coords = await getLocation();
    if (coords) {
      const newLoc: [number, number] = [coords.longitude, coords.latitude];
      setUserLocation(newLoc);
      centerRef.current = newLoc;
      cameraRef.current?.flyTo({
        center: newLoc,
        zoom: 14,
        duration: 1000,
      });
    } else if (locationError) {
      Alert.alert("Error", locationError);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Map
        style={{ flex: 1 }}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [-7.5898, 33.5731],
            zoom: 10,
          }}
        />
        {userLocation && (
          <Marker id="user-location" lngLat={userLocation}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#3B82F6",
                borderWidth: 2,
                borderColor: "#FFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            />
          </Marker>
        )}
      </Map>

      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 24,
          right: 16,
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#18181B",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={handleLocateMe}
        disabled={isLocating}
        activeOpacity={0.8}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <LocateFixed size={24} color="#3B82F6" />
        )}
      </TouchableOpacity>
    </View>
  );
}
