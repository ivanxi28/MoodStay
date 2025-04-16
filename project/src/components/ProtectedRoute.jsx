import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;