import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);

  return (
    <AuthContext.Provider value={{ role, setRole, username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}