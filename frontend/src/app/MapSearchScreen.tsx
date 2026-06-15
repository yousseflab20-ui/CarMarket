import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import MapComponent from "../components/MapComponent";

export default function MapSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#09090B" }}>
      <MapComponent />
      
      {/* Floating Glassmorphic Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.8}
        style={{
          position: "absolute",
          top: Math.max(insets.top + 10, 20),
          left: 16,
          width: 48,
          height: 48,
          borderRadius: 24,
          overflow: "hidden", // Ensures blur respects the border radius
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        <BlurView
          intensity={80}
          tint="dark"
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.3)", // Adds a slight dark tint
          }}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}
