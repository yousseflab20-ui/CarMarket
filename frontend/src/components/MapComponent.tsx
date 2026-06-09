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
import { LocateFixed, Settings2, CalendarDays } from "lucide-react-native";
import { getCarsForMap } from "../service/car/api";
import { useRouter } from "expo-router";

LogManager.setLogLevel("error");
LogManager.onLog(() => true);

const API_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? "";
const MAP_STYLE = `https://api.maptiler.com/maps/outdoor-v4/style.json?key=mKautShoxe78ion42mlg`;

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
  const router = useRouter();
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
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const lastMarkerPress = useRef<number>(0);

  // Initial fetch - load all cars with coordinates on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setIsLoadingCars(true);
        const data = await getCarsForMap();
        setCars(data ?? []);
        console.log("Fetched initial cars for map:", data);
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
        console.log(`Fetched ${data} cars for map region.`);
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
        onPress={() => {
          // Prevent map tap from closing if a marker was just tapped (< 500ms ago)
          if (Date.now() - lastMarkerPress.current > 500) {
            setSelectedCar(null);
          }
        }}
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
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  lastMarkerPress.current = Date.now();
                  setSelectedCar(car);
                }}
              >
                <CarImageMarker car={car} />
              </TouchableOpacity>
            </Marker>
          ) : null,
        )}
      </Map>

      {/* dropdown onPress selectedCar for map search */}
      {/* Modern Bottom Sheet for selected car */}
      {selectedCar && (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#18181B",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 20,
            borderTopWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 20,
          }}
        >
          {/* Draggable Handle */}
          <View
            style={{
              width: 48,
              height: 5,
              borderRadius: 999,
              backgroundColor: "#3F3F46",
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{
                uri:
                  typeof selectedCar.images === "string"
                    ? JSON.parse(selectedCar.images)[0]
                    : selectedCar.images?.[0] ||
                      "https://via.placeholder.com/150",
              }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 18,
                backgroundColor: "#27272A",
              }}
              resizeMode="cover"
            />

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontFamily: "Lexend_700Bold",
                  marginBottom: 6,
                }}
                numberOfLines={1}
              >
                {selectedCar.brand} {selectedCar.model}
              </Text>

              {/* Tags / Chips */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#27272A",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <CalendarDays size={12} color="#94A3B8" />
                  <Text
                    style={{
                      color: "#94A3B8",
                      fontSize: 11,
                      fontFamily: "Lexend_500Medium",
                      marginLeft: 4,
                    }}
                  >
                    {selectedCar.year || "N/A"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#27272A",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Settings2 size={12} color="#94A3B8" />
                  <Text
                    style={{
                      color: "#94A3B8",
                      fontSize: 11,
                      fontFamily: "Lexend_500Medium",
                      marginLeft: 4,
                    }}
                  >
                    {selectedCar.transmission || "Auto"}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: "#3B82F6",
                  fontSize: 18,
                  fontFamily: "Lexend_700Bold",
                }}
              >
                {selectedCar.price >= 1000
                  ? `${(selectedCar.price / 1000).toFixed(0)}k`
                  : selectedCar.price}{" "}
                DH
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: "#3B82F6",
              height: 54,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/CarDetailScreen",
                params: {
                  car: JSON.stringify(selectedCar),
                  user: JSON.stringify(
                    selectedCar.User || selectedCar.user || null,
                  ),
                  user2Id: selectedCar.userId?.toString() || "",
                },
              })
            }
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 16,
                fontFamily: "Lexend_700Bold",
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

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

      {/* Locate Me button (moves up when car is selected) */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: selectedCar ? 260 : 24,
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
