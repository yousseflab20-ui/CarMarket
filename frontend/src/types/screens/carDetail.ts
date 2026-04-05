import { User } from "../user";
import { SellerRatingResponse } from "../rating";

export interface CarDetailParams {
    user: string;
    car: string;
    user2Id: string;
}

export interface SpecCardProps {
    icon: React.ReactNode;
    value: string | number;
    unit: string;
    accentColor: string;
}

export interface SellerCardProps {
    user: User | null;
    rating: SellerRatingResponse | null;
    onRate: () => void;
}

export interface RateSellerModalProps {
    visible: boolean;
    onClose: () => void;
    sellerName: string;
    userRating: number;
    setUserRating: (rating: number) => void;
    userComment: string;
    setUserComment: (comment: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export interface PerkChipProps {
    icon: React.ReactNode;
    label: string;
    color: string;
}

export interface SectionHeaderProps {
    title: string;
    action?: string;
}
