/**
 * Car Form Schema
 * 
 * Zod validation schema for the Add Car form.
 * Defines all field validations and types.
 */

import { z } from 'zod';

// Constants for form options
export const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT'] as const;
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'] as const;
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

const currentYear = new Date().getFullYear();

// Zod schema for car form validation
export const carFormSchema = z.object({
    // Basic Info
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

    // Pricing
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

    // Specifications (always strings, empty is valid)
    speed: z.string().regex(/^\d*$/, 'Speed must be a number'),
    seats: z.string().regex(/^\d*$/, 'Seats must be a number'),
    mileage: z.string().regex(/^\d*$/, 'Mileage must be a number'),

    // Selects
    transmission: z.enum(TRANSMISSIONS),
    fuelType: z.enum(FUEL_TYPES),

    // Description
    description: z.string().max(500, 'Description must be less than 500 characters'),

    // Features
    features: z.array(z.string()),

    // Options
    insuranceIncluded: z.boolean(),
    deliveryAvailable: z.boolean(),
});

// Infer the TypeScript type from schema
export type CarFormData = z.infer<typeof carFormSchema>;

// Default form values
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
};
