import { Car as BaseCar } from "../car";

export interface FavoriteCar extends BaseCar {
    // Favorites often include the full car object returned from the join
}

export interface FavoriteResponse {
    All: Array<{
        id: number;
        userId: number;
        carId: number;
        Car: FavoriteCar;
    }>;
}
