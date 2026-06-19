import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { carFormSchema, defaultCarFormValues } from "../schemas/carFormSchema";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { uploadMultipleToCloudinary } from "../utils/cloudinary";
import { useStackedToastStore } from "../store/stackedToastStore";

import API from "../service/api";
import {
  CarFormData,
  UseCarFormOptions,
  UseCarFormReturn,
} from "../types/screens/carForm";

export function useCarForm(options?: UseCarFormOptions): UseCarFormReturn {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useStackedToastStore((state) => state.addToast);
  const form = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema) as Resolver<CarFormData>,
    defaultValues: defaultCarFormValues,
    mode: "onBlur",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (images.length === 0) {
      Alert.alert(t("addCar.error"), t("addCar.incompleteInfo"));
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload images
      console.log("📤 Uploading images to Cloudinary...");
      const mediaItems = images.map((img) => ({
        uri: img.uri,
        type: img.type === "video" ? "video" : "image",
      }));
      const uploadedUrls = await uploadMultipleToCloudinary(mediaItems as any);

      console.log("✅ Images uploaded:", uploadedUrls);

      // 2. Prepare payload
      const payload = {
        ...data,
        images: uploadedUrls,
        userId: useAuthStore.getState().user?.id,
      };

      console.log("📦 Payload:", JSON.stringify(payload, null, 2)); // ⬅️ ADD THIS

      console.log("📤 Sending to backend...");

      const response = await API.post("car/add", payload);

      console.log("📥 Response status:", response.status || 200);

      const result = response.data;

      console.log("📥 Response body:", result); // ⬅️ ADD THIS

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          result.error || result.message || t("addCar.failedPublish"),
        );
      }

      console.log("✅ Car added:", result);

      // Alert.alert(t('addCar.success'), t('addCar.listingPublished'));
      addToast({
        title: t("addCar.success"),
        description: t("addCar.listingPublished"),
        type: "success",
      });
      form.reset();
      setImages([]);
      options?.onSuccess?.();
    } catch (error: any) {
      console.log(
        "❌ ADD CAR ERROR:",
        error?.response?.data || error?.message || error,
      );

      addToast({
        title: t("addCar.error"),
        description:
          error?.response?.data?.message ||
          error?.message ||
          t("common.somethingWentWrong"),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  });

  return {
    form,
    images,
    setImages,
    handleSubmit,
    isLoading,
  };
}
