export interface User {
    id: number | string;
    email: string;
    role: string;
    name: string;
    photo: string;
    token?: string;
    verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
    rating?: number;
    verified?: boolean;
    phone?: string;
    city?: string;
    bio?: string;
}
