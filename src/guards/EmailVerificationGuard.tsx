import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
  const { isAuthenticated, isEmailVerified, currentUser } = useAuth();
  const location = useLocation();

  // Si el usuario no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si es SUPER_ADMIN, permitir acceso sin verificación
  if (currentUser?.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Si está autenticado pero el email no está verificado
  if (!isEmailVerified) {
    // Si no tiene verificación pendiente, mostrar página de acceso denegado
    if (!currentUser?.emailVerification && location.pathname !== '/forbidden') {
      return <Navigate to="/forbidden" replace />;
    }
    
    // Si tiene verificación pendiente y no está en la página de verificación
    if (currentUser?.emailVerification && location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }
  }

  // Si está en la página de verificación pero ya está verificado
  if (isEmailVerified && location.pathname === '/verify-email') {
    return <Navigate to={currentUser?.isProfileComplete ? '/dashboard' : '/profile'} replace />;
  }

  return <>{children}</>;
};

export default EmailVerificationGuard;
