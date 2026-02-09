import { AxiosError } from 'axios';
export interface AppError {
    title: string;
    message: string;
    code?: number | string;
    originalError?: any;
}

const ERROR_MESSAGES: Record<number, { title: string; message: string }> = {
    400: {
        title: 'Bad Request',
        message: 'Please check your input and try again.',
    },
    401: {
        title: 'Session Expired',
        message: 'Please login again to continue.',
    },
    403: {
        title: 'Access Denied',
        message: "You don't have permission to perform this action.",
    },
    404: {
        title: 'Not Found',
        message: 'The requested resource was not found.',
    },
    409: {
        title: 'Conflict',
        message: 'This resource already exists.',
    },
    422: {
        title: 'Validation Error',
        message: 'Please check your input and try again.',
    },
    429: {
        title: 'Too Many Requests',
        message: 'Please wait a moment before trying again.',
    },
    500: {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
    },
    502: {
        title: 'Server Unavailable',
        message: 'The server is temporarily unavailable. Please try again.',
    },
    503: {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
    },
};

export function catchError(error: any): AppError {
    if (error?.isAxiosError || error?.response) {
        const axiosError = error as AxiosError<any>;
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;

        const backendMessage =
            responseData?.message ||
            responseData?.error ||
            responseData?.errors?.[0]?.message ||
            (typeof responseData === 'string' ? responseData : null);

        const defaultError = status ? ERROR_MESSAGES[status] : null;

        if (status && defaultError) {
            return {
                title: defaultError.title,
                message: backendMessage || defaultError.message,
                code: status,
                originalError: error,
            };
        }

        if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ERR_NETWORK') {
            return {
                title: 'Connection Error',
                message: 'Unable to connect to the server. Please check your internet connection.',
                code: 'NETWORK_ERROR',
                originalError: error,
            };
        }

        if (!axiosError.response) {
            return {
                title: 'Network Error',
                message: 'No internet connection. Please check your network and try again.',
                code: 'NO_RESPONSE',
                originalError: error,
            };
        }

        return {
            title: 'Error',
            message: backendMessage || 'An unexpected error occurred. Please try again.',
            code: status,
            originalError: error,
        };
    }

    if (error instanceof Error) {
        return {
            title: 'Error',
            message: error.message || 'An unexpected error occurred.',
            originalError: error,
        };
    }

    if (typeof error === 'string') {
        return {
            title: 'Error',
            message: error,
        };
    }

    if (error?.message) {
        return {
            title: error.title || 'Error',
            message: error.message,
            code: error.code,
            originalError: error,
        };
    }

    return {
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        originalError: error,
    };
}

export function isAuthError(error: AppError): boolean {
    return error.code === 401 || error.code === 403;
}

export function isNetworkError(error: AppError): boolean {
    return error.code === 'NETWORK_ERROR' || error.code === 'NO_RESPONSE';
}