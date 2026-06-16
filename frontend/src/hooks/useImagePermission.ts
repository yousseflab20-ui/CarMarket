import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface UseImagePermissionOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  permissionDeniedTitle?: string;
  permissionDeniedMessage?: string;
}

interface UseImagePermissionReturn {
  pickImage: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
}

/**
 * Custom hook to handle image picking from gallery or camera.
 * Handles camera permissions automatically.
 * Does NOT use useTranslation internally to avoid Hook ordering issues.
 * Pass translated strings via options if needed.
 */
export function useImagePermission(
  options: UseImagePermissionOptions = {}
): UseImagePermissionReturn {
  const {
    aspect = [1, 1],
    quality = 0.8,
    allowsEditing = true,
    permissionDeniedTitle = "Permission Denied",
    permissionDeniedMessage = "Camera access is needed to take a photo.",
  } = options;

  const pickImage = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing,
      aspect,
      quality,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(permissionDeniedTitle, permissionDeniedMessage);
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing,
      aspect,
      quality,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  return { pickImage, takePhoto };
}
