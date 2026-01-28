import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Helper interface to maintain compatibility with existing code
export interface ExtendedUser extends User {
  buildingId?: string;
  buildingName?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  isProfileComplete?: boolean;
  managedBuildings?: any[];
}
//...
// Helper to map Supabase user to ExtendedUser
const mapUser = (user: User | null): ExtendedUser | null => {
  if (!user) return null;
  return {
    ...user,
    buildingId: user.user_metadata?.buildingId,
    // Try to get buildingName from metadata first (nested or flat)
    buildingName: user.user_metadata?.buildingName || user.user_metadata?.building?.name,
    role: user.user_metadata?.role,
    firstName: user.user_metadata?.firstName,
    lastName: user.user_metadata?.lastName,
    isProfileComplete: user.user_metadata?.isProfileComplete,
  };
};

interface AuthContextType {
  currentUser: ExtendedUser | null;
  loading: boolean;
  login: (email: string, password: string, method?: string) => Promise<any>;
  logout: () => Promise<void>;
  registerUser: (email: string, password: string, metadata: any) => Promise<{ error: any }>;
  registerAdmin: (data: any) => Promise<{ error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ data: any; error: any }>;
  updateUser: (data: Partial<ExtendedUser>) => Promise<void>;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token || localStorage.getItem('token')}`,
    };
  };

  const fetchUserProfile = async (session: any) => {
    if (session?.access_token) {
      setToken(session.access_token);
      localStorage.setItem('token', session.access_token);
    } else {
      setToken(null);
      localStorage.removeItem('token');
    }
    if (!session?.user) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    const baseUser = mapUser(session.user);

    try {
      // Fetch managed buildings associated with this user
      // We use "adminId" because that matches the column name in the DB
      const { data: buildings } = await supabase
        .from('buildings')
        .select('*')
        .eq('adminId', session.user.id);

      if (baseUser && buildings && buildings.length > 0) {
        baseUser.managedBuildings = buildings;
        // If metadata didn't have buildingId, use the first managed building
        if (!baseUser.buildingId) {
          baseUser.buildingId = buildings[0].id;
        }
        // Always try to set buildingName from the actual DB record if possible
        if (buildings[0].name) {
          baseUser.buildingName = buildings[0].name;
        }
      }
    } catch (err) {
      console.error("Error fetching additional user data:", err);
    }

    setCurrentUser(baseUser);
    setLoading(false);
  };


  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserProfile(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, method?: string) => {
    const credentials: any = {
      password,
    };

    if (method === 'whatsapp' || /^\+?[0-9]{10,15}$/.test(email)) {
      credentials.phone = email;
    } else {
      credentials.email = email;
    }

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) throw error;

    // Manually update user state immediately to avoid race conditions with ProtectedRoute
    if (data.session) {
      await fetchUserProfile(data.session);
    }

    let redirectTo = '/login';
    if (data.session) {
      const user = data.session.user;
      const role = user.user_metadata?.role;
      const buildingId = user.user_metadata?.buildingId;

      const isProfileComplete = user.user_metadata?.isProfileComplete;

      if (role === 'SUPER_ADMIN' || role === 'BUILDING_ADMIN') {
        redirectTo = isProfileComplete === false ? '/profile' : '/dashboard';
      } else if (role === 'OWNER') {
        // If profile/building setup is incomplete, maybe redirect there?
        // For now, default to dashboard or my-claims
        // IMPORTANT: We need to use the buildingId derived from fetchUserProfile/mapUser logic 
        // if we want accuracy, but the session metadata might be stale if we relied on the fallback.
        // However, for redirect purposes, raw metadata check is usually "good enough" or we can default.
        // The fallback logic modifies the STATE object (currentUser), not the session object directly.
        // So checking user.user_metadata here might still be missing buildingId.
        // But the user state WILL be updated by the await above.

        // Let's rely on what we just fetched if possible, but mapUser/fetchUserProfile updates 'currentUser' state.
        // We can't easily access the result of fetchUserProfile here without returning it.
        // But for redirect logic, usually basic metadata is enough. 
        // If they are missing buildingId in metadata (the case we fixed), role is likely BUILDING_ADMIN anyway.

        redirectTo = buildingId ? '/my-claims' : '/settings/building';
      } else {
        redirectTo = '/my-claims';
      }
    }

    // Returning the redirection path as expected by LoginFormNew
    // Note: The interface currently says Promise<{ error: any }>, so we might need to cast or update interface
    return redirectTo as any;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const registerUser = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // firstName, lastName, role, buildingId
      },
    });
    return { error };
  };

  const registerAdmin = async (data: any) => {
    // Flatten the data structure for metadata
    // The previous frontend implementation sent { building: { name: ... } }
    // But our trigger expects flatten keys: buildingName, planName in raw_user_meta_data

    const { email, password, building, firstName, lastName, planName } = data;

    // We handle both structures: if 'building' object is passed (from legacy form) or flat 'buildingName'
    const buildingName = building?.name || data.buildingName;

    console.log('Attempting registerAdmin:', { email }); // Debug

    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: {
          firstName,
          lastName,
          role: 'BUILDING_ADMIN',
          isProfileComplete: false,
          building: {
            name: buildingName,
            address: data.address || '', // Ensure address is passed
          },
          planName: planName || 'Free',
        },
      },
    });

    console.log('Supabase signUp response:', response); // Debug
    const { error } = response;
    return { error };
  };


  const resendVerificationEmail = async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { data, error };
  };

  const updateUser = async (data: Partial<ExtendedUser>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...data });
      // Optionally update Supabase metadata if needed, but usually handled by API
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
        resendVerificationEmail,
        updateUser,
        isAuthenticated: !!currentUser,
        isEmailVerified: !!currentUser?.email_confirmed_at,
        getAuthHeaders,
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

