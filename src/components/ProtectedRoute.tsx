
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
    // Redirigir a los propietarios a sus reclamos, a otros usuarios a otra página
    return <Navigate to={currentUser?.role === 'OWNER' ? '/my-claims' : '/unauthorized'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
