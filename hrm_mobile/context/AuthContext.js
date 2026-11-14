import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERNAME_KEY = 'username';
const ROLE_KEY = 'role';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the previous session so relaunching the app does not force a
  // re-login. Until this resolves the navigator must not render, or the login
  // screen flashes before the dashboard replaces it.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [[, savedUsername], [, savedRole]] = await AsyncStorage.multiGet([
          USERNAME_KEY,
          ROLE_KEY,
        ]);
        if (savedUsername && savedRole) {
          setUsername(savedUsername);
          setRole(savedRole);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const updateLogin = async (user, roleValue) => {
    setUsername(user);
    setRole(roleValue);
    try {
      await AsyncStorage.multiSet([
        [USERNAME_KEY, user],
        [ROLE_KEY, roleValue],
      ]);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const logout = async () => {
    setUsername(null);
    setRole(null);
    try {
      await AsyncStorage.multiRemove([USERNAME_KEY, ROLE_KEY]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      role,
      username,
      isLoading,
      updateLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
