import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [isReady, setIsReady] = useState(false);

  // Validasi token saat pertama load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (!storedToken || !storedUsername) {
      setIsReady(true);
      return;
    }

    // Cek token masih valid atau engga
    api.get(`/users/${storedUsername}`)
      .then(() => {
        setIsReady(true);
      })
      .catch(() => {
        // Jika 401, axios interceptor sudah clear localStorage + redirect
        // Jika error lain, tetap mark ready
        setToken(localStorage.getItem('token'));
        setUsername(localStorage.getItem('username'));
        setRole(localStorage.getItem('role'));
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
        setIsReady(true);
      });
  }, []);

  const login = (tokenValue, usernameValue, roleValue) => {
    const isAdminFound = roleValue === 'admin';

    localStorage.setItem('token', tokenValue);
    localStorage.setItem('username', usernameValue);
    localStorage.setItem('role', roleValue);
    localStorage.setItem('isAdmin', isAdminFound ? 'true' : 'false');

    setIsAdmin(isAdminFound);
    setUsername(usernameValue);
    setRole(roleValue);
    setToken(tokenValue);

    return roleValue;
  };

  const logout = async () => {
    try {
      await api.post('/auth/signout');
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('isAdmin');
    setToken(null);
    setUsername(null);
    setRole(null);
    setIsAdmin(false);
  };

  // Tampilkan loading saat cek token
  if (!isReady) {
    return (
      <AuthContext.Provider value={{ token: null, username: null, isAdmin: false, login, logout }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-11 h-11 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ token, username, role, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
