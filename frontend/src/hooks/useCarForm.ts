import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { carFormSchema, CarFormData, defaultCarFormValues } from "../schemas/carFormSchema";
import { Alert } from "react-native";
import { useAuthStore } from "../store/authStore";
import { uploadMultipleToCloudinary } from "../utils/cloudinary";
import API_URL from "../constant/URL";

interface UseCarFormOptions {
    onSuccess?: () => void;
}

export function useCarForm(options?: UseCarFormOptions) {
    const token = useAuthStore.getState().token;
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CarFormData>({
        resolver: zodResolver(carFormSchema) as Resolver<CarFormData>,
        defaultValues: defaultCarFormValues,
        mode: "onBlur",
    });

    const handleSubmit = form.handleSubmit(async (data) => {
        console.log("token user addcar", token);

        if (images.length === 0) {
            Alert.alert('Error', 'Please upload at least one image');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Upload images
            console.log('📤 Uploading images to Cloudinary...');
            const imageUris = images.map(img => img.uri);
            const uploadedUrls = await uploadMultipleToCloudinary(imageUris);

            console.log('✅ Images uploaded:', uploadedUrls);

            // 2. Prepare payload
            const payload = {
                ...data,
                images: uploadedUrls,
            };

            console.log('📦 Payload:', JSON.stringify(payload, null, 2)); // ⬅️ ADD THIS

            console.log('📤 Sending to backend...');

            const response = await fetch(`${API_URL}/car/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('📥 Response status:', response.status); // ⬅️ ADD THIS

            const result = await response.json();

            console.log('📥 Response body:', result); // ⬅️ ADD THIS

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to add car');
            }

            console.log('✅ Car added:', result);

            Alert.alert('Success', 'Car added successfully!');
            form.reset();
            setImages([]);
            options?.onSuccess?.();

        } catch (error: any) {
            console.error('❌ Full Error:', error); // ⬅️ IMPROVED
            console.error('❌ Error message:', error.message); // ⬅️ ADD THIS
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    });

    return {
        form,
        images,
        setImages,
        handleSubmit,
        isLoading
    };
}