
import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser } from './api';
import { useAuthStore } from '../../stores/authStore';

export const useLoginMutation = () => {
    const { setToken, setUser } = useAuthStore();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
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
