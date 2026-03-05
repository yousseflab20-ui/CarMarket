import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('admin_token');
    const userString = localStorage.getItem('admin_user');

    let isAuthorized = false;

    if (token && userString) {
        try {
            const user = JSON.parse(userString);
            if (user?.role?.toUpperCase() === 'ADMIN') {
                isAuthorized = true;
            }
        } catch (e) {
            console.error("Failed to parse user data");
        }
    }

    if (!isAuthorized) {
        
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
