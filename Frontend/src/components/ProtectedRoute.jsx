import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirect to their own dashboard if they try to access wrong portal
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
