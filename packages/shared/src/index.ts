// Example shared types - customize based on your needs

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Example shared constants
export const API_ENDPOINTS = {
  CARS: '/api/cars',
  USERS: '/api/users',
  AUTH: '/api/auth',
} as const;

// Example shared utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
