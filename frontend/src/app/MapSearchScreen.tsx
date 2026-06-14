import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import MapComponent from "../components/MapComponent";

export default function MapSearchScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <MapComponent />
      
      {/* Floating Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: Platform.OS === "ios" ? 50 : 20,
          left: 16,
          width: 44,
          height: 44,
          backgroundColor: "#18181B",
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
