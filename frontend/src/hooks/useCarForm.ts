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

        // Build FormData
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('brand', data.brand);
        formData.append('model', data.model);
        formData.append('year', data.year);
        formData.append('price', data.price);
        formData.append('pricePerDay', data.pricePerDay);
        formData.append('speed', data.speed || '');
        formData.append('seats', data.seats || '5');
        formData.append('mileage', data.mileage || '0');
        formData.append('description', data.description || '');

        // Append images
        images.forEach((img, index) => {
            const uri = Platform.OS === 'android' ? img.uri : img.uri?.replace('file://', '');
            formData.append('photo', {
                uri,
                type: img.type || 'image/jpeg',
                name: img.fileName || `car_${index}.jpg`,
            } as any);
        });

        // Submit
        addCarMutation.mutate(formData, {
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
