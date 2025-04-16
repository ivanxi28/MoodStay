import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext(null);

// Add named export for AuthContext
export { AuthContext };

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8000/api';

  // Comprobar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userData');
    
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar el token en localStorage
      localStorage.setItem('token', data.token);
      
      // Guardar los datos del usuario en localStorage
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Actualizar el estado
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }

      // Guardar token y datos de usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error durante el registro:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = !!user;

  // Valores que estarán disponibles en el contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};