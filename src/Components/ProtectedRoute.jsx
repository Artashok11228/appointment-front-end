import { Navigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext.jsx'
import LoadingSpinner from './LoadingSpinner';

function normalizeRole(role) {
    if (role === 'client') return 'customer';
    return role;
}

function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, loading, currentUser } = useAuth();

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole) {
        const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const userRole = normalizeRole(currentUser?.role);
        if (!userRole || !allowed.includes(userRole)) {
            return <Navigate to="/login" replace />;
        }
    }

    return (
        <>
            {children}
        </>
    )
}

export default ProtectedRoute
