import { useState, useCallback } from "react";
import * as Location from "expo-location";

export const useLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Permission denied");
      }

      // Try last known first (much faster, especially on Android/Emulators)
      let loc = await Location.getLastKnownPositionAsync();

      if (!loc) {
        // If no last known, request current location
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (loc && loc.coords) {
        return {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      } else {
        throw new Error("Could not retrieve coordinates");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch location");
      console.log("Location Error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getLocation,
    isLoading,
    error,
  };
};
