import { Alert, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

export const useImagePickerAction = (
  onImageSelected: (uri: string) => void,
) => {
  const { t } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);

  const openSheet = () => setSheetVisible(true);
  const closeSheet = () => setSheetVisible(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("verification.alerts.permissionDenied"),
        t("verification.alerts.cameraNeed"),
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return {
    sheetVisible,
    openSheet,
    closeSheet,
    pickImage,
    takePhoto,
  };
};
