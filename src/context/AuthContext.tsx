import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  currentUser: ExtendedUser | null;
  loading: boolean;
  login: (identifier: string, password: string, identifierType?: 'email' | 'whatsapp') => Promise<string>;
  logout: () => void;
  registerUser: (userData: UserRegistrationData) => Promise<string>;
  registerAdmin: (adminData: AdminRegistrationData) => Promise<string | { error: string }>;
  updateUser: (userData: Partial<ExtendedUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  completeProfile: (profileData: Partial<ExtendedUser>) => Promise<void>;
  getAuthHeaders: () => HeadersInit;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

interface AdminRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  building: {
    name: string;
    address: string;
    schema: string;
  };
}

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  buildingId: string;
  unitNumber?: string;
}

// Extender la interfaz User de types/index.ts
interface ExtendedUser extends User {
  isProfileComplete: boolean;
  token: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  emailVerification?: {
    id: string;
    email: string;
    verificationCode: string;
    expiresAt: Date;
    isVerified: boolean;
  } | null;
  managedBuildings?: {
    id: string;
    name: string;
    address: string;
    floors: number;
    totalUnits: number;
    constructionYear?: number;
    phoneNumber?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    description?: string;
  }[];
}

// Función para convertir strings de fecha a objetos Date
const convertDatesToObjects = (user: ExtendedUser): ExtendedUser => {
  if (user.emailVerification?.expiresAt) {
    user.emailVerification.expiresAt = new Date(user.emailVerification.expiresAt);
  }
  return user;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface RegisterResponse {
  access_token: string;
  user: User;
  building: {
    id: string;
    name: string;
    plan: {
      type: string;
      name: string;
      features: string[];
    }
  };
  trialEndsAt: string;
  requiresVerification: boolean;
  success?: boolean;
  error?: {
    message: string;
  };
  message?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleRedirect = async (user: ExtendedUser): Promise<string> => {
    if (!user) {
      return '/login';
    }
    if (user.role === 'SUPER_ADMIN') {
      return '/dashboard';
    }
    // Solo requiere verificar email si NO es propietario
    if (!user.emailVerified && user.role !== 'OWNER') {
      return '/verify-email';
    }
    if (!user.isProfileComplete) {
      return '/profile';
    }
    if (user.role === 'OWNER') {
      return '/my-claims';
    }
    if (user.role === 'BUILDING_ADMIN' && user.buildingId) {
      try {
        // Verificar si existe una instancia de WhatsApp para este edificio
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/buildings/whatsapp/exists/${user.buildingId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Si existe instancia de WhatsApp, redirigir al dashboard
          if (result.success && result.data && result.data.exists) {
            return '/dashboard';
          }
        }
        
        // Si no hay instancia o hubo un error, seguir con el comportamiento actual
        return '/settings/building';
      } catch (error) {
        console.error('Error al verificar instancia de WhatsApp:', error);
        return '/settings/building';
      }
    }
    return '/dashboard';
  };


  useEffect(() => {
    console.log('Checking localStorage for user...');
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token);
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Found user in localStorage:', parsedUser);
      
      if (token) {
        const userWithToken = convertDatesToObjects({ ...parsedUser, token });
        console.log('Setting user with token:', userWithToken);
        setCurrentUser(userWithToken);
      } else {
        console.log('No token found in localStorage');
        setCurrentUser(convertDatesToObjects(parsedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string, identifierType: 'email' | 'whatsapp' = 'email'): Promise<string> => {
    try {
      setLoading(true);
      let payload;
      
      // Construir el payload según el tipo de identificador
      if (identifierType === 'email') {
        payload = { email: identifier, password };
      } else {
        payload = { whatsappNumber: identifier, password };
      }
      
      // Usar la URL directa al backend con el prefijo /api
      const apiUrl = 'http://localhost:3000/auth/login';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Obtener el estado de verificación del email
      const emailVerification = data.user.emailVerifications?.[0];
      // Para propietarios (OWNER), consideramos el email como verificado automáticamente
      // ya que ellos se verifican por WhatsApp durante el registro
      const emailVerified = data.user.role === 'OWNER' ? true : (emailVerification?.isVerified || false);
      
      // Crear usuario extendido con la información necesaria
      const extendedUser: ExtendedUser = {
        ...data.user,
        token: data.access_token,
        emailVerified,
        emailVerification,
        buildingId: data.building?.id,
        isProfileComplete: data.user.isProfileComplete || false,
        managedBuildings: data.user.managedBuildings || []
      };

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(extendedUser));
      setCurrentUser(extendedUser);

      if (!emailVerified && data.user.role !== 'OWNER') {
        window.location.href = '/verify-email';
        return '/verify-email';
      }

      if (!data.user.isProfileComplete) {
        window.location.href = '/profile';
        return '/profile';
      }

      // Si es OWNER, redirigir al dashboard
      if (extendedUser.role === 'OWNER') {
        console.log('Usuario con rol OWNER, redirigiendo al dashboard');
        window.location.href = '/dashboard';
        return '/dashboard';
      }
      
      // Si es BUILDING_ADMIN, verificar la instancia de WhatsApp
      if (extendedUser.role === 'BUILDING_ADMIN' && extendedUser.buildingId) {
        try {
          const whatsappResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/buildings/whatsapp/exists/${extendedUser.buildingId}`,
            {
              headers: {
                'Authorization': `Bearer ${data.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const whatsappData = await whatsappResponse.json();
          
          // Si no hay instancia de WhatsApp o la respuesta no es exitosa
          if (!whatsappResponse.ok || !whatsappData.success || !whatsappData.data.exists) {
            console.log('No existe instancia de WhatsApp, redirigiendo a configuración');
            window.location.href = '/settings/building';
            return '/settings/building';
          }
          
          console.log('Existe instancia de WhatsApp, redirigiendo al dashboard');
        } catch (error) {
          console.error('Error al verificar instancia de WhatsApp:', error);
          window.location.href = '/settings/building';
          return '/settings/building';
        }
      }

      window.location.href = '/dashboard';
      return '/dashboard';
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Modificamos el tipo de retorno para incluir información sobre el error si ocurre
  const registerAdmin = async (adminData: AdminRegistrationData): Promise<string | { error: string }> => {
    try {
      setLoading(true);
      
      console.log('Admin data being sent:', adminData);
      
      try {
        const response = await api.post<RegisterResponse>('/auth/register', {
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: adminData.email,
          password: adminData.password,
          building: adminData.building
        });

        if (response.data.success === false && response.data.error) {
          return { error: response.data.error.message || 'Error al registrar usuario' };
        }
        
        const data = response.data;
        
        const emailVerification = data.user.emailVerifications?.[0] || null;
        const emailVerified = emailVerification?.isVerified || false;

        const extendedUser: ExtendedUser = {
          ...data.user,
          token: data.access_token,
          buildingName: data.building.name,
          buildingData: {
            address: '',
            floors: '',
            totalUnits: '',
            contact: {
              phone: '',
              whatsapp: '',
            },
            adminPhone: ''
          },
          isProfileComplete: false, 
          role: 'BUILDING_ADMIN' as const, 
          emailVerified,
          emailVerification
        };
        
        const userToSave = convertDatesToObjects(extendedUser);
        setCurrentUser(userToSave);
        
        localStorage.setItem('user', JSON.stringify(userToSave));
        
        localStorage.setItem('token', data.access_token);
        
        window.location.href = '/verify-email';
        return '/verify-email';
        
      } catch (error: any) {
        console.log('Error al registrar:', error);
        
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || error.response.data.error?.message || 'Error al registrar usuario';
          return { error: errorMessage };
        }
        
        if (error.code === 'ECONNABORTED') {
          return { error: 'La solicitud tomó demasiado tiempo en completarse. Por favor, inténtelo de nuevo.' };
        }
        
        return { error: 'Error de conexión. Por favor, verifique su conexión a internet e inténtelo de nuevo.' };
      }
    } catch (error) {
      console.error('Error al registrar administrador:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<ExtendedUser>): Promise<void> => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar el estado local
      const updatedUser: ExtendedUser = {
        ...currentUser,
        ...userData,
        token: currentUser?.token || '',
        managedBuildings: userData.managedBuildings || currentUser.managedBuildings
      };

      // Convertir los campos numéricos de los edificios
      if (updatedUser.managedBuildings) {
        updatedUser.managedBuildings = updatedUser.managedBuildings.map(building => ({
          ...building,
          floors: typeof building.floors === 'string' ? parseInt(building.floors) : building.floors,
          totalUnits: typeof building.totalUnits === 'string' ? parseInt(building.totalUnits) : building.totalUnits,
          constructionYear: building.constructionYear ? 
            (typeof building.constructionYear === 'string' ? parseInt(building.constructionYear) : building.constructionYear) 
            : undefined
        }));
      }

      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Si hay datos del edificio, actualizarlos en el backend
      if (userData.managedBuildings && userData.managedBuildings.length > 0) {
        const building = userData.managedBuildings[0];
        const buildingId = building.id;

        const buildingData = {
          name: building.name,
          address: building.address,
          floors: building.floors,
          totalUnits: building.totalUnits,
          constructionYear: building.constructionYear,
          phoneNumber: building.phoneNumber,
          whatsapp: building.whatsapp,
          email: building.email,
          website: building.website,
          description: building.description,
          isProfileComplete: userData.isProfileComplete
        };

        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/buildings/${buildingId}`;
        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(buildingData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al actualizar el edificio');
        }

        const updatedBuilding = await response.json();
        console.log('Building updated:', updatedBuilding);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData: UserRegistrationData): Promise<string> => {
    try {
      setLoading(true);
      
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/register`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          buildingId: userData.buildingId,
          unitNumber: userData.unitNumber,
          role: 'BUILDING_ADMIN'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al registrar usuario');
      }

      const data = await response.json();
      
      // Convertir el usuario a ExtendedUser
      // Buscar el edificio del usuario
      const buildingsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/buildings?adminId=${data.user.id}`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (!buildingsResponse.ok) {
        throw new Error('Error al obtener el edificio');
      }
      
      const buildings = await buildingsResponse.json();
      const building = buildings[0] || data.building;
      
      const extendedUser: ExtendedUser = {
        ...data.user,
        token: data.access_token,
        emailVerified: data.user.emailVerifications?.[0]?.isVerified || false,
        emailVerification: data.user.emailVerifications?.[0] || null,
        buildingId: building?.id || '',
        buildingName: building?.name || '',
        isProfileComplete: data.user.isProfileComplete || false,
        buildingData: {
          address: building?.address || '',
          floors: building?.floors?.toString() || '',
          totalUnits: building?.totalUnits?.toString() || '',
          contact: {
            phone: building?.phoneNumber || '',
            whatsapp: building?.whatsapp || '',
            website: building?.website || '',
            description: building?.description || '',
          },
          adminPhone: data.user.phoneNumber || '',
          constructionYear: building?.constructionYear?.toString() || ''
        }
      };
      
      // Guardar el token
      localStorage.setItem('token', data.access_token);
      
      // Guardar el usuario
      setCurrentUser(extendedUser);
      localStorage.setItem('user', JSON.stringify(extendedUser));

      // Verificar email primero
      if (!extendedUser.emailVerified) {
        return '/verify-email';
      }

      // Luego verificar perfil completo
      if (!extendedUser.isProfileComplete) {
        return '/profile';
      }

      // Si es BUILDING_ADMIN, verificar instancia de WhatsApp
      if (data.user.role === 'BUILDING_ADMIN' && data.user.buildingId) {
        try {
          const whatsappResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/buildings/whatsapp/${data.user.buildingId}`,
            {
              headers: {
                'Authorization': `Bearer ${data.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!whatsappResponse.ok) {
            console.log('No hay instancia de WhatsApp en la base de datos, redirigiendo a configuración');
            return '/settings/building';
          }

          const whatsappData = await whatsappResponse.json();
          if (!whatsappData || !whatsappData.exists) {
            console.log('La instancia de WhatsApp no existe, redirigiendo a configuración');
            return '/settings/building';
          }
        } catch (whatsappError) {
          console.error('Error al verificar instancia de WhatsApp:', whatsappError);
          return '/settings/building';
        }
      }

      // Si todo está bien, redirigir al dashboard
      return '/dashboard';
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !currentUser) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al actualizar el usuario');

      const userData = await response.json();
      const emailVerification = userData.emailVerifications?.[0] || null;
      const emailVerified = emailVerification?.isVerified || false;

      const updatedUser: ExtendedUser = {
        ...currentUser,
        ...userData,
        token,
        emailVerified,
        emailVerification
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error al refrescar el usuario:', error);
    }
  };

  const resendVerificationEmail = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al reenviar el email de verificación');
      }
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (code: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Código de verificación inválido');
      }

      if (currentUser) {
        setCurrentUser({ ...currentUser, emailVerified: true });
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (profileData: Partial<ExtendedUser>): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Error al completar el perfil');
      }

      const data = await response.json();
      if (currentUser) {
        setCurrentUser({ ...currentUser, ...data.user });
      }
    } catch (error) {
      console.error('Error al completar perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        registerUser,
        registerAdmin,
        updateUser,
        refreshUser,
        resendVerificationEmail,
        verifyEmail,
        completeProfile,
        getAuthHeaders,
        isAuthenticated: !!currentUser,
        isEmailVerified: currentUser?.emailVerified || false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
