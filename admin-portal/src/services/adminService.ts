import api from '../services/api';

export const adminService = {
    getUsers: async () => {
        const response = await api.get('/admin/alluser');
        return response.data.alluser;
    },

    getCars: async () => {
        const response = await api.get('/admin/AllCar');
        return response.data.Carall;
    },

    getMessages: async () => {
        const response = await api.get('/admin/getMessage');
        return response.data.getAll;
    },

    getStats: async () => {
        const [users, cars, messages] = await Promise.all([
            adminService.getUsers(),
            adminService.getCars(),
            adminService.getMessages(),
        ]);

        return {
            totalUsers: users.length,
            totalCars: cars.length,
            totalMessages: messages.length,
        };
    },

    deleteUser: async (id: string | number) => {
        const response = await api.delete(`/admin/deletUser/${id}`);
        return response.data;
    },

    deleteCar: async (id: string | number) => {
        const response = await api.delete(`/admin/deletCar/${id}`);
        return response.data;
    },
};
