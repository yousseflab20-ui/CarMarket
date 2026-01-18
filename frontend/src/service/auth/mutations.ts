
import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser } from './api';
import { useAuthStore } from '../../stores/authStore';

export const useLoginMutation = () => {
    const { setToken, setUser } = useAuthStore();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            // Assuming data contains user and token based on previous endpointService.ts analysis
            // Verify structure: res.data.user / res.data.token
            const user = data.user || data.data?.user;
            const token = data.token || data.data?.token;

            if (token) {
                setToken(token);
            }
            if (user) {
                setUser(user);
            }
        },
    });
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: registerUser,
    });
};
