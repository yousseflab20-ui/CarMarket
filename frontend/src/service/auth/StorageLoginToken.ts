
import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser } from './endpointLogin';
import { useAuthStore } from '../../store/authStore';

export const useLoginMutation = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            const user = data.user || data.data?.user;
            const token = data.token || data.data?.token;

            if (token && user) {
                setAuth(user, token);
            }
        },
    });
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: registerUser,
    });
};