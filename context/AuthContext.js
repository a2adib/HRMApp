import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  const updateLogin = async (user, roleValue) => {
    setUsername(user);
    setRole(roleValue);
    await AsyncStorage.setItem('username', user);
    await AsyncStorage.setItem('role', roleValue);
  };

  return (
    <AuthContext.Provider value={{
      role, setRole,
      username, setUsername,
      updateLogin // ✅ exposed here
    }}>
      {children}
    </AuthContext.Provider>
  );
}
