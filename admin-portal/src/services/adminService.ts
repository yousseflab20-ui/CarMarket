import api from '../services/api';

export const adminService = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
    },

    getUsers: async () => {
        const response = await api.get('admin/all/user');
        return response.data.alluser;
    },

    getCars: async () => {
        const response = await api.get('/admin/AllCar');
        return response.data.Carall;
    },

    getConversations: async () => {
        const response = await api.get('/admin/get/conversation');
        return response.data.getAll;
    },

    getMessages: async () => {
        const response = await api.get('/admin/get/message');
        return response.data.getAll;
    },

    getMessagesByConversation: async (conversationId: number) => {
        const response = await api.get(`/admin/get/conversation/${conversationId}/messages`);
        return response.data.getAll;
    },

    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    deleteUser: async (id: string | number) => {
        const response = await api.delete(`/admin/user/${id}`);
        return response.data;
    },

    deleteCar: async (id: string | number) => {
        const response = await api.delete(`/admin/all/${id}`);
        return response.data;
    },
};
