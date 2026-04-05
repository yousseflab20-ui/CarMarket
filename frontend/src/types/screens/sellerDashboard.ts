import { Car } from "../car";

export interface SellerStats {
    totalViews: number;
    totalListings: number;
    carsData: CarViewData[];
}

export interface CarViewData extends Partial<Car> {
    id: number;
    title: string;
    views: number;
}
