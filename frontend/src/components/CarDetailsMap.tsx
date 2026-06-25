import React from "react";
import { View } from "react-native";
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";
import { MapPin } from "lucide-react-native";

type MapCardProps = {
  latitude: number | string;
  longitude: number | string;
  location?: string;
};

export default function MapCard({ latitude, longitude }: MapCardProps) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <View
      style={{
        height: 180,
        marginHorizontal: 16,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1E2A3A",
      }}
    >
      <Map
        style={{ flex: 1 }}
        mapStyle="https://api.maptiler.com/maps/outdoor-v4/style.json?key=mKautShoxe78ion42mlg"
      >
        <Camera
          initialViewState={{
            center: [lng, lat],
            zoom: 14,
          }}
        />

        <Marker id="car-location" lngLat={[lng, lat]}>
          <View className="bg-red-500 p-2 rounded-full">
            <MapPin size={20} color="white" />
          </View>
        </Marker>
      </Map>
    </View>
  );
}
