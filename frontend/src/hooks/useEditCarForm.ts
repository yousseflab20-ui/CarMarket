import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { carFormSchema, CarFormData, defaultCarFormValues } from "../schemas/carFormSchema";
import { Alert } from "react-native";
import { useAuthStore } from "../store/authStore";
import { uploadMultipleToCloudinary } from "../utils/cloudinary";
import { editCar } from "../service/car/api";
import { useQueryClient } from "@tanstack/react-query";

interface UseEditCarFormOptions {
    carId: number;
    initialData?: any;
    onSuccess?: () => void;
}

export function useEditCarForm({ carId, initialData, onSuccess }: UseEditCarFormOptions) {
    const token = useAuthStore.getState().token;
    const [images, setImages] = useState<any[]>([]); // Can be strings (existing) or ImagePickerAsset (new)
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<CarFormData>({
        resolver: zodResolver(carFormSchema) as Resolver<CarFormData>,
        defaultValues: defaultCarFormValues,
        mode: "onBlur",
    });

    useEffect(() => {
        if (initialData) {
            // The backend returns { message: "...", get: { car data } } or { car: { car data } }
            const carObj = initialData.get || initialData.car || initialData;

            form.reset({
                title: carObj.title || "",
                brand: carObj.brand || "",
                model: carObj.model || "",
                year: carObj.year ? carObj.year.toString() : new Date().getFullYear().toString(),
                price: carObj.price ? carObj.price.toString() : "",
                pricePerDay: carObj.pricePerDay ? carObj.pricePerDay.toString() : "",
                speed: carObj.speed ? carObj.speed.toString() : "",
                seats: carObj.seats ? carObj.seats.toString() : "5",
                mileage: carObj.mileage ? carObj.mileage.toString() : "0",
                transmission: carObj.transmission || "Automatic",
                fuelType: carObj.fuelType || "Petrol",
                description: carObj.description || "",
                features: carObj.features || [],
                insuranceIncluded: carObj.insuranceIncluded ?? true,
                deliveryAvailable: carObj.deliveryAvailable ?? false,
            });

            if (carObj.images && Array.isArray(carObj.images)) {
                const existingImages = carObj.images.map((url: string) => ({ uri: url, isExisting: true }));
                setImages(existingImages);
            }
        }
    }, [initialData, form]);

    const handleSubmit = form.handleSubmit(async (data) => {
        if (images.length === 0) {
            Alert.alert("Error", "Please have at least one image");
            return;
        }

        setIsLoading(true);

        try {
            // Separate new assets from existing URLs
            const newImagesToUpload = images.filter(img => !img.isExisting).map(img => img.uri);
            const existingImageUrls = images.filter(img => img.isExisting).map(img => img.uri);

            let uploadedUrls: string[] = [];

            if (newImagesToUpload.length > 0) {
                console.log("📤 Uploading new images to Cloudinary...");
                uploadedUrls = await uploadMultipleToCloudinary(newImagesToUpload);
            }

            const finalImageUrls = [...existingImageUrls, ...uploadedUrls];

            const payload = {
                ...data,
                images: finalImageUrls,
                userId: useAuthStore.getState().user?.id,
            };

            console.log("📤 Sending update to backend...");

            await editCar(carId, payload);

            queryClient.invalidateQueries({ queryKey: ["car", carId] });
            queryClient.invalidateQueries({ queryKey: ["cars"] });

            Alert.alert("Success", "Car updated successfully!");
            onSuccess?.();

        } catch (error: any) {
            console.error("❌ Edit Error:", error);
            Alert.alert("Error", error.message || "Failed to edit car");
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
