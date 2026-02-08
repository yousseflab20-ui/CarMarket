
import { useMutation } from '@tanstack/react-query';
import { loginUser, registerUser } from './endpointLogin';
import { useAuthStore } from '../../store/authStore';

export const useLoginMutation = () => {
    const setToken = useAuthStore((state) => state.setToken);
    const setUser = useAuthStore((state) => state.setUser);

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