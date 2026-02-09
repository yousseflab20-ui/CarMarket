
import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser } from './api';
import { useAuthStore } from '../../store/authStore';

export const useLoginMutation = () => {
    const { setAuth } = useAuthStore();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: async (data) => {
            const user = data.user || data.data?.user;
            const token = data.token || data.data?.token;

            if (user && token) {
                await setAuth(user, token);
            }
        },
    });
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: registerUser,
    });
};