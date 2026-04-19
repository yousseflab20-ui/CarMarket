import { z } from 'zod';
import { TRANSMISSIONS, FUEL_TYPES, FEATURES, MOROCCAN_CITIES, CarFormData } from '../types/screens/carForm';

const currentYear = new Date().getFullYear();

export const carFormSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters'),
    brand: z
        .string()
        .min(2, 'Brand must be at least 2 characters'),
    model: z
        .string()
        .min(1, 'Model is required'),
    year: z
        .string()
        .regex(/^\d{4}$/, 'Year must be 4 digits')
        .refine(
            (val) => {
                const year = parseInt(val, 10);
                return year >= 1900 && year <= currentYear + 1;
            },
            { message: `Year must be between 1900 and ${currentYear + 1}` }
        ),

    price: z
        .string()
        .min(1, 'Price is required')
        .regex(/^\d+$/, 'Price must be a valid number')
        .refine((val) => parseInt(val, 10) > 0, 'Price must be positive'),
    pricePerDay: z
        .string()
        .min(1, 'Price per day is required')
        .regex(/^\d+$/, 'Price per day must be a valid number')
        .refine((val) => parseInt(val, 10) > 0, 'Price per day must be positive'),

    speed: z.string().regex(/^\d*$/, 'Speed must be a number'),
    seats: z.string().regex(/^\d*$/, 'Seats must be a number'),
    mileage: z.string().regex(/^\d*$/, 'Mileage must be a number'),

    transmission: z.enum(TRANSMISSIONS),
    fuelType: z.enum(FUEL_TYPES),

    description: z.string().max(500, 'Description must be less than 500 characters'),

    features: z.array(z.string()),

    insuranceIncluded: z.boolean(),
    deliveryAvailable: z.boolean(),
    city: z.enum(MOROCCAN_CITIES),
});

export const defaultCarFormValues: CarFormData = {

    title: '',
    brand: '',
    model: '',
    year: currentYear.toString(),
    price: '',
    pricePerDay: '',
    speed: '',
    seats: '5',
    mileage: '0',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    description: '',
    features: [],
    insuranceIncluded: true,
    deliveryAvailable: false,
    city: 'Casablanca',
};