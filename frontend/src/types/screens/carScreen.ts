import { Car } from "../car";
import { User } from "../user";

export interface CarFilters {
    brand: string;
    minPrice: string;
    maxPrice: string;
    city: string;
    year: string;
    transmission: string;
    search: string;
}

export interface Brand {
    id: number;
    name: string;
    icon: any; // Image source
}

export interface CarCardProps {
    item: Car;
    width: number;
    isLiked: (id: number) => boolean;
    toggleLike: (id: number) => void;
    user: User | null;
}
