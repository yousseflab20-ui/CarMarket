/**
 * useCarForm Hook
 * 
 * Custom hook encapsulating car form logic with react-hook-form and zod validation.
 */

import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Platform } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { carFormSchema, CarFormData, defaultCarFormValues } from '../schemas/carFormSchema';
import { useAddCarMutation } from '../service/car/mutations';
import { useAlertDialog } from '../context/AlertDialogContext';

interface UseCarFormOptions {
    onSuccess?: () => void;
}

export function useCarForm(options?: UseCarFormOptions) {
    const [images, setImages] = useState<Asset[]>([]);
    const { showError, showSuccess } = useAlertDialog();
    const addCarMutation = useAddCarMutation();

    const form = useForm<CarFormData>({
        resolver: zodResolver(carFormSchema) as Resolver<CarFormData>,
        defaultValues: defaultCarFormValues,
        mode: 'onBlur',
    });

    const handleSubmit = form.handleSubmit(async (data) => {
        // Validate images
        if (images.length === 0) {
            showError('Please upload at least one image');
            return;
        }

        // Convert images to Base64
        const base64Images = await Promise.all(
            images.map(async (img) => {
                // If it's already base64 (some pickers return it), use it.
                // Otherwise we might need to read it. 
                // react-native-image-picker includes 'base64' if includeBase64: true is set.
                return img.base64 ? `data:${img.type};base64,${img.base64}` : null;
            })
        );

        // Filter out any failed conversions
        const validImages = base64Images.filter((img) => img !== null);

        // Build payload object
        const payload = {
            title: data.title,
            brand: data.brand,
            model: data.model,
            year: data.year,
            price: data.price,
            pricePerDay: data.pricePerDay,
            speed: data.speed || null,
            seats: data.seats || '5',
            mileage: data.mileage || '0',
            description: data.description || '',
            features: data.features,
            transmission: data.transmission,
            fuelType: data.fuelType,
            insuranceIncluded: data.insuranceIncluded,
            deliveryAvailable: data.deliveryAvailable,
            images: validImages, // Send array of base64 strings
        };

        // Submit
        addCarMutation.mutate(payload as any, {
            onSuccess: (response) => {
                console.log('✅ Car added:', response);
                showSuccess('Your car has been added successfully!', 'Car Added', [
                    {
                        text: 'OK',
                        onPress: () => {
                            reset();
                            options?.onSuccess?.();
                        },
                    },
                ]);
            },
            onError: (error) => {
                console.log('🔥 Add car error:', error);
                showError(error);
            },
        });
    });

    const reset = () => {
        form.reset(defaultCarFormValues);
        setImages([]);
    };

    return {
        form,
        images,
        setImages,
        handleSubmit,
        reset,
        isLoading: addCarMutation.isPending,
    };
}
