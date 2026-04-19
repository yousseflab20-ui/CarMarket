import { User } from "./user";
import { CarStatus } from "../utils/statusConfig";
export interface Car {
    status: CarStatus;
    id: number;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    pricePerDay: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    seats: number;
    speed: number;
    description: string;
    images: string[];
    features: string[];
    location?: string;
    userId: number;
    views: number;
    createdAt: string;
    updatedAt: string;
    User?: User;
    user?: User; // Sometimes lowercase from API
}
