import React from "react";
import { View } from "react-native";
import { Map, Camera, LogManager } from "@maplibre/maplibre-react-native";

LogManager.setLogLevel("error");
LogManager.onLog(() => true);

const API_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? "";
const MAP_STYLE = `https://api.maptiler.com/maps/outdoor-v4/style.json?key=${API_KEY}`;

export default function MapComponent() {
  return (
    <View className="flex-1 w-full h-full">
      <Map
        className="flex-1 w-full h-full"
        mapStyle={MAP_STYLE}
      >
        <Camera
          initialViewState={{
            center: [-7.5898, 33.5731],
            zoom: 10,
          }}
        />
      </Map>
    </View>
  );
}
