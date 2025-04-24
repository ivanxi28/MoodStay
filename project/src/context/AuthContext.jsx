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

  const API_URL = import.meta.env.VITE_API_URL;

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
  
      // Actualizar el estado del usuario, incluyendo la URL del avatar
      setUser(data.user);
  
      // Devolver los datos del usuario, incluyendo la URL del avatar
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

      // {{ Attempt to parse JSON response even if status is not ok }}
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        // If parsing fails, throw error based on status text
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      if (!response.ok) {
        // {{ Log the full error data received from the backend }}
        console.error('Registration API Error Response:', data);

        // {{ Try to extract a more specific error message }}
        // Adjust based on how your Symfony backend formats validation errors
        let errorMessage = 'Error al registrarse'; // Default
        if (data) {
          if (data.message) { // Common general message field
            errorMessage = data.message;
          } else if (data.detail) { // API Platform often uses 'detail'
             errorMessage = data.detail;
          } else if (data.violations && Array.isArray(data.violations)) { // API Platform validation errors
            // Combine messages from violations
            errorMessage = data.violations.map(v => `${v.propertyPath || 'field'}: ${v.message}`).join('; ');
          } else if (typeof data === 'string') { // Sometimes the error is just a string
             errorMessage = data;
          }
        }
        // Add the status code for context
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      // Guardar token y datos de usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      // This will now log the potentially more detailed error message constructed above
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