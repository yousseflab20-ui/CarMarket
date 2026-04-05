export interface AuthStatus {
    status: "success" | "error";
    title: string;
}

export interface LoginResponse {
    user: any; // We have User in ../user.ts, but login might return more
    token: string;
}

export interface RegistrationPayload {
    name: string;
    email: string;
    password: string;
    photo: string;
}
