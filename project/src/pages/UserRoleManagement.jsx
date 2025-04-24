import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserRoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  // Add search state
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No estás autenticado');
        }
        
        const response = await fetch(`${API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('No tienes permiso para ver esta página');
        }
        
        const data = await response.json();
        setUsers(data);
        
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Check if user is admin before fetching
    if (currentUser && currentUser.roles && currentUser.roles.includes('ROLE_ADMIN')) {
      fetchUsers();
    } else {
      setError('No tienes permiso para acceder a esta página');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [currentUser, navigate]);

  // Update user role
  const updateUserRole = async (userId, role, isAdding) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
      const response = await fetch(`${API_URL}/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: role,
          action: isAdding ? 'add' : 'remove'
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el rol del usuario');
      }
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const updatedRoles = isAdding 
              ? [...(user.roles || []), role]
              : (user.roles || []).filter(r => r !== role);
            
            return { ...user, roles: updatedRoles };
          }
          return user;
        })
      );
      
      setSuccessMessage(`Rol ${isAdding ? 'añadido' : 'eliminado'} correctamente`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Roles de Usuario</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}
      
      {/* Add search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    {user.roles && user.roles.map((role) => (
                      <span 
                        key={role} 
                        className={`px-2 py-1 text-xs rounded-full ${
                          role === 'ROLE_ADMIN' 
                            ? 'bg-red-100 text-red-800' 
                            : role === 'ROLE_HOST' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {role.replace('ROLE_', '')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* Admin role toggle */}
                    {user.roles && user.roles.includes('ROLE_ADMIN') ? (
                      <button
                        onClick={() => updateUserRole(user.id, 'ROLE_ADMIN', false)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                      >
                        Quitar Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserRole(user.id, 'ROLE_ADMIN', true)}
                        className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1 rounded"
                      >
                        Hacer Admin
                      </button>
                    )}
                    
                    {/* Host role toggle */}
                    {user.roles && user.roles.includes('ROLE_HOST') ? (
                      <button
                        onClick={() => updateUserRole(user.id, 'ROLE_HOST', false)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                      >
                        Quitar Host
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserRole(user.id, 'ROLE_HOST', true)}
                        className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1 rounded"
                      >
                        Hacer Host
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserRoleManagement;