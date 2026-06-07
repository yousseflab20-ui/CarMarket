import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MapComponent from "../components/MapComponent";

export default function MapSearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <MapComponent />
    </SafeAreaView>
  );
}
