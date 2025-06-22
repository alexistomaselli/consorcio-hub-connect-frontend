import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Redirigir a unauthorized si no hay usuario
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  if (!currentUser.isProfileComplete && location.pathname !== '/profile') {
    // Redirigir a completar perfil si no está completo
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
