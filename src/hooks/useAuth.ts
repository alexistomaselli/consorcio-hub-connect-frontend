import { useCallback, useEffect, useState } from 'react';

type AuthUser = {
  id: string;
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  buildingId?: string;
  buildingName?: string;
  role: string;
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return { ...user, token };
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  });

  const signOut = useCallback(async () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  }, []);

  // Actualizar el usuario cuando cambie el token o los datos del usuario en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        setCurrentUser({ ...user, token });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user: currentUser,
    signOut,
    isAuthenticated: !!currentUser,
  };
}
