import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProfileRequiredRouteProps {
  children: React.ReactNode;
}

const ProfileRequiredRoute = ({ children }: ProfileRequiredRouteProps) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Si el usuario no ha completado su perfil y no está en /profile, redirigir a /profile
  if (!currentUser?.isProfileComplete && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default ProfileRequiredRoute;
