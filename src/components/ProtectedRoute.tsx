
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    // Podríamos mostrar un spinner aquí
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-consorcio-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redireccionar a login si el usuario no está autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere rol de admin y el usuario no tiene permisos suficientes
  if (requiredRole === 'admin' && !['admin', 'SUPER_ADMIN', 'BUILDING_ADMIN'].includes(currentUser?.role || '')) {
    // Redirigir según el rol
    if (['OWNER', 'RESIDENT'].includes(currentUser?.role || '')) {
      return <Navigate to="/my-claims" replace />;
    }
    if (currentUser?.role === 'SERVICE_PROVIDER') {
      return <Navigate to="/service-claims" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
