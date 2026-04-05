import { User as BaseUser } from "../user";
import { Car as BaseCar } from "../car";

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    photo: string;
    role: string;
}

export interface AdminCar {
    id: number;
    title: string;
    brand: string;
    year: number;
    price: string;
    pricePerDay: number;
    images: string[];
}

export interface AdminDashboardStats {
    totalUsers: number;
    totalCars: number;
}
