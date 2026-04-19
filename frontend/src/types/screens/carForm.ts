import { UseFormReturn } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";

export const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT'] as const;
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'] as const;
export const MOROCCAN_CITIES = ['Casablanca', 'Marrakech', 'Rabat', 'Agadir', 'Tangier'] as const;
export const FEATURES = [
    'AC',
    'Leather Seats',
    'GPS',
    'Sunroof',
    'Backup Camera',
    'Bluetooth',
    'Cruise Control',
    'Heated Seats',
] as const;

export interface CarFormData {
    title: string;
    brand: string;
    model: string;
    year: string;
    price: string;
    pricePerDay: string;
    speed: string;
    seats: string;
    mileage: string;
    transmission: typeof TRANSMISSIONS[number];
    fuelType: typeof FUEL_TYPES[number];
    description: string;
    features: string[];
    insuranceIncluded: boolean;
    deliveryAvailable: boolean;
    city: typeof MOROCCAN_CITIES[number];
}

export interface UseCarFormReturn {
    form: UseFormReturn<CarFormData>;
    images: ImagePicker.ImagePickerAsset[];
    setImages: (images: ImagePicker.ImagePickerAsset[]) => void;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isLoading: boolean;
}

export interface UseCarFormOptions {
    onSuccess?: () => void;
}

export interface EditCarInitialData {
    id: number;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    pricePerDay: number;
    speed?: number;
    seats?: number;
    mileage?: number;
    transmission: string;
    fuelType: string;
    description: string;
    features: string[];
    images: string[];
    insuranceIncluded?: boolean;
    deliveryAvailable?: boolean;
    city?: string;
}

export interface UseEditCarFormOptions {
    carId: number;
    initialData?: any; // The backend response structure varies
    onSuccess?: () => void;
}

export interface UseEditCarFormReturn extends Omit<UseCarFormReturn, 'images' | 'setImages'> {
    images: any[]; 
    setImages: (images: any[]) => void;
}

export interface AnimatedAddButtonProps {
    onPress: () => void;
    isLoading: boolean;
}

export interface AnimatedUpdateButtonProps {
    onPress: () => void;
    isLoading: boolean;
}

export interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
}

