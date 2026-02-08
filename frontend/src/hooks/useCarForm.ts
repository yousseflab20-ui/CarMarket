import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Asset } from 'react-native-image-picker';
import { carFormSchema, CarFormData, defaultCarFormValues } from '../schemas/carFormSchema';
import { useAddCarMutation } from '../service/car/mutations';
import { Alert } from 'react-native';

interface UseCarFormOptions {
    onSuccess?: () => void;
}

export function useCarForm(options?: UseCarFormOptions) {
    const [images, setImages] = useState<Asset[]>([]);
    const addCarMutation = useAddCarMutation();

    const form = useForm<CarFormData>({
        resolver: zodResolver(carFormSchema) as Resolver<CarFormData>,
        defaultValues: defaultCarFormValues,
        mode: 'onBlur',
    });

    const handleSubmit = form.handleSubmit(async (data) => {
        if (images.length === 0) {
            Alert.alert('Please upload at least one image');
            return;
        }

        const base64Images = await Promise.all(
            images.map(async (img) => {
                return img.base64 ? `data:${img.type};base64,${img.base64}` : null;
            })
        );

        const validImages = base64Images.filter((img) => img !== null);

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
            images: validImages,
        };

        addCarMutation.mutate(payload as any, {
            onSuccess: (response) => {
                console.log('✅ Car added:', response);
                Alert.alert('Your car has been added successfully!', 'Car Added', [
                    {
                        text: 'OK',
                        onPress: () => {
                            reset();
                            options?.onSuccess?.();
                        },
                    },
                ]);
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