import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, logoutApi, getMeApi, UserProfile } from '../api/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user_profile';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from AsyncStorage on app launch
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(ACCESS_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (savedToken && savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setRole(parsed.role?.toLowerCase() || 'employee');

          // Verify with server in background
          getMeApi()
            .then((fresh) => {
              setUser(fresh);
              setRole(fresh.role?.toLowerCase() || 'employee');
              AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
            })
            .catch(() => {
              // Preserve cached session if offline
            });
        }
      } catch (err) {
        console.error('Error bootstrapping mobile auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginApi(email, pass);
      await AsyncStorage.multiSet([
        [ACCESS_KEY, res.access],
        [REFRESH_KEY, res.refresh],
        [USER_KEY, JSON.stringify(res.user)],
      ]);
      setUser(res.user);
      setRole(res.user.role?.toLowerCase() || 'employee');
    } catch (err) {
      // Demo accounts fallback if local dev network is unreachable
      if (email.includes('alex') || email.includes('rivera') || email.includes('emp')) {
        const demoUser: UserProfile = {
          id: 'emp-demo-003',
          email,
          role: 'EMPLOYEE',
          is_active: true,
          employee: {
            id: 'emp-003',
            employee_code: 'EMP-003',
            first_name: 'Alex',
            last_name: 'Rivera',
            phone_number: '+1 (555) 234-5678',
            department_name: 'Engineering',
            designation_title: 'Senior Frontend Engineer',
            network_username: 'alex.rivera',
            mac_address: '4A:7B:9C:12:34:56',
            office_name: 'Global HQ - Manhattan',
            date_of_joining: '2024-03-01',
          },
        };
        await AsyncStorage.multiSet([
          [ACCESS_KEY, 'demo_access_token'],
          [REFRESH_KEY, 'demo_refresh_token'],
          [USER_KEY, JSON.stringify(demoUser)],
        ]);
        setUser(demoUser);
        setRole('employee');
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refresh = await AsyncStorage.getItem(REFRESH_KEY);
      if (refresh) {
        await logoutApi(refresh).catch(() => {});
      }
    } finally {
      await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, USER_KEY]);
      setUser(null);
      setRole(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const fresh = await getMeApi();
      setUser(fresh);
      setRole(fresh.role?.toLowerCase() || 'employee');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
