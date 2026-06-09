import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import {
  Map,
  Camera,
  LogManager,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useLocation } from "../hooks/useLocation";
import { LocateFixed } from "lucide-react-native";
import { getCarsForMap } from "../service/car/api";

LogManager.setLogLevel("error");
LogManager.onLog(() => true);

const API_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? "";
const MAP_STYLE = `https://api.maptiler.com/maps/outdoor-v4/style.json?key=mKautShoxe78ion42mlg`;

// Car Image marker component
function CarImageMarker({ car }: { car: any }) {
  let imageUrl = "";
  if (car.images) {
    try {
      const parsedImages =
        typeof car.images === "string" ? JSON.parse(car.images) : car.images;
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        imageUrl = parsedImages[0];
      }
    } catch (e) {
      console.log("Error parsing image for marker", e);
    }
  }

  const formattedPrice =
    car.price >= 1000 ? `${(car.price / 1000).toFixed(0)}k` : `${car.price}`;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {/* Map Pin Container */}
      <View
        style={{
          width: 48,
          height: 48,
          backgroundColor: "#3B82F6", // Primary blue border
          borderRadius: 24,
          padding: 2,
          alignItems: "center",
          justifyContent: "center",
          // Removed elevation here to prevent the gray square artifact on Android MapLibre markers
        }}
      >
        {/* Circular Image */}
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          resizeMode="cover"
        />
      </View>

      {/* Pin Arrow (Triangle pointing down) */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#3B82F6",
          marginTop: -1,
        }}
      />

      {/* Price Badge floating below the pin */}
      <View
        style={{
          backgroundColor: "#18181B",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: "#3B82F6",
          marginTop: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 10,
            fontFamily: "Lexend_700Bold",
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {formattedPrice} DH
        </Text>
      </View>
    </View>
  );
}

export default function MapComponent() {
  const {
    getLocation,
    isLoading: isLocating,
    error: locationError,
  } = useLocation();

  const cameraRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [cars, setCars] = useState<any[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const boundsTimeoutRef = useRef<any>(null);

  // Initial fetch - load all cars with coordinates on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setIsLoadingCars(true);
        const data = await getCarsForMap();
        setCars(data ?? []);
        console.log(`Initial fetch: ${data?.length ?? 0} cars loaded.`);
      } catch (err) {
        console.log("Error initial fetch:", err);
      } finally {
        setIsLoadingCars(false);
      }
    };
    fetchInitial();
  }, []);

  // Fetch cars when map region changes (debounced 500ms)
  const handleRegionDidChange = useCallback(async (feature: any) => {
    if (boundsTimeoutRef.current) clearTimeout(boundsTimeoutRef.current);

    boundsTimeoutRef.current = setTimeout(async () => {
      try {
        const bbox = feature?.properties?.visibleBounds;
        if (!bbox) return;

        const [sw, ne] = bbox;
        const [minLng, minLat] = sw;
        const [maxLng, maxLat] = ne;

        setIsLoadingCars(true);
        const data = await getCarsForMap({ minLat, maxLat, minLng, maxLng });
        setCars(data ?? []);
        console.log(`Fetched ${data?.length ?? 0} cars for map region.`);
      } catch (err) {
        console.log("Error fetching cars for map:", err);
      } finally {
        setIsLoadingCars(false);
      }
    }, 500);
  }, []);

  const handleLocateMe = async () => {
    const coords = await getLocation();
    if (coords) {
      const newLoc: [number, number] = [coords.longitude, coords.latitude];
      setUserLocation(newLoc);
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
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [-9.5981, 30.4278],
            zoom: 12,
          }}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker id="user-location" lngLat={userLocation}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#3B82F6",
                borderWidth: 2.5,
                borderColor: "#FFF",
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 6,
                elevation: 6,
              }}
            />
          </Marker>
        )}

        {/* Car price markers */}
        {cars.map((car) =>
          car.latitude && car.longitude ? (
            <Marker
              key={`car-${car.id}`}
              id={`car-${car.id}`}
              lngLat={[car.longitude, car.latitude]}
            >
              <CarImageMarker car={car} />
            </Marker>
          ) : null,
        )}
      </Map>

      {/* Loading indicator */}
      {isLoadingCars && (
        <View
          style={{
            position: "absolute",
            top: 16,
            alignSelf: "center",
            backgroundColor: "#18181B",
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 12,
              fontFamily: "Lexend_400Regular",
            }}
          >
            Loading...
          </Text>
        </View>
      )}

      {/* Locate Me button */}
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
