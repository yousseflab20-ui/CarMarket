import React from "react";
import { View, useColorScheme } from "react-native";
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";
import { MapPin } from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";

type MapCardProps = {
  latitude: number | string;
  longitude: number | string;
  location?: string;
  fullScreen?: boolean;
};

export default function MapCard({
  latitude,
  longitude,
  fullScreen = false,
}: MapCardProps) {
  const theme = useThemeStore((state) => state.theme);
  const systemTheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <View
      style={{
        height: fullScreen ? "100%" : 180,
        marginHorizontal: fullScreen ? 0 : 16,
        borderRadius: fullScreen ? 0 : 24,
        overflow: "hidden",
        borderWidth: fullScreen ? 0 : 1,
        borderColor: isDark ? "#1E2A3A" : "#E2E8F0",
      }}
    >
      <Map
        style={{ flex: 1 }}
        mapStyle={`https://api.maptiler.com/maps/outdoor-v4/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
      >
        <Camera
          initialViewState={{
            center: [lng, lat],
            zoom: fullScreen ? 15 : 14,
          }}
        />

        <Marker id="car-location" lngLat={[lng, lat]}>
          <View
            style={{
              backgroundColor: "#EF4444",
              padding: fullScreen ? 10 : 8,
              borderRadius: 999,
              shadowColor: "#EF4444",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <MapPin size={fullScreen ? 24 : 20} color="white" />
          </View>
        </Marker>
      </Map>
    </View>
  );
}
