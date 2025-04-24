import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Calendar, Home, Users, AlertTriangle } from 'lucide-react';

function ReservationManagementPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHost, setIsHost] = useState(false); // Nuevo estado para verificar el rol de host

    const API_URL = import.meta.env.VITE_API_URL; // Asegúrate de que esta URL sea correcta

    useEffect(() => {
        const checkUserRole = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Updated to match the backend endpoint which uses GET method
                const response = await fetch(`${API_URL}/host/verify`, {
                    method: 'GET', // Explicitly set method to GET
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Host verification failed:', errorData);
                    navigate('/login');
                    return;
                }

                const data = await response.json();
                // Updated to use isHost property from the response
                setIsHost(data.isHost);
                
                if (!data.isHost) {
                    console.log('User is not a host:', data.roles);
                }

            } catch (error) {
                console.error('Error checking host role:', error);
                setError('Error al verificar el rol.');
                navigate('/login'); // Redirigir en caso de error de comunicación
            }
        };

        checkUserRole();
    }, [user, navigate, API_URL]);

    useEffect(() => {
        const fetchHostReservations = async () => {
            if (!isHost) {
                return; // No fetch si no es host
            }

            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`${API_URL}/reservations/host`, { // Endpoint para obtener reservas del host
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch reservations');
                }

                const data = await response.json();
                setReservations(data);
            } catch (err) {
                console.error('Error fetching host reservations:', err);
                setError('No se pudieron cargar las reservas.');
            } finally {
                setLoading(false);
            }
        };

        fetchHostReservations();
    }, [isHost, API_URL]);

    const handleAcceptReservation = async (reservationId) => {
        // Lógica para enviar la aceptación de la reserva al backend
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/reservations/${reservationId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                // Actualizar el estado de las reservas en el frontend
                setReservations(prevReservations =>
                    prevReservations.map(res =>
                        res.id === reservationId ? { ...res, status: 'accepted' } : res
                    )
                );
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to accept reservation');
            }
        } catch (error) {
            console.error('Error accepting reservation:', error);
            setError('No se pudo aceptar la reserva.');
        }
    };

    const handleRejectReservation = async (reservationId) => {
        // Lógica para enviar el rechazo de la reserva al backend
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/reservations/${reservationId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                // Actualizar el estado de las reservas en el frontend
                setReservations(prevReservations =>
                    prevReservations.map(res =>
                        res.id === reservationId ? { ...res, status: 'rejected' } : res
                    )
                );
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to reject reservation');
            }
        } catch (error) {
            console.error('Error rejecting reservation:', error);
            setError('No se pudo rechazar la reserva.');
        }
    };

    const handleViewReservationDetails = (reservationId) => {
        // Lógica para navegar a una página de detalles de la reserva
        navigate(`/reservations/${reservationId}`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Verificando permisos de host...
        </div>
      </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center bg-red-50 p-6 rounded-lg shadow-md max-w-md w-full">
                    <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-red-500" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!isHost) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center bg-orange-50 p-8 rounded-lg shadow-md max-w-md w-full">
                    <XCircle className="mx-auto mb-4 w-16 h-16 text-orange-500" />
                    <h2 className="text-2xl font-bold text-orange-700 mb-2">Acceso Denegado</h2>
                    <p className="text-orange-600 mb-2">No tienes los permisos necesarios para ver esta página.</p>
                    <p className="text-gray-600 text-sm mb-6">Esta sección está reservada para anfitriones.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    // Get status badge style based on reservation status
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending':
                return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
            case 'accepted':
                return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
            case 'confirmed':  // Add this case for the 'confirmed' status
                return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
            case 'rejected':
                return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
            case 'completed':
                return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
            case 'cancelled':
                return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
            default:
                return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
        }
    };

    // Get item type icon
    const getItemTypeIcon = (type) => {
        switch(type) {
            case 'accommodation':
                return <Home className="inline-block mr-1 w-4 h-4" />;
            case 'experience':
                return <Calendar className="inline-block mr-1 w-4 h-4" />;
            case 'restaurant':
                return <Users className="inline-block mr-1 w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h1>
                        <p className="text-gray-600 mt-1">Administra todas tus reservas desde este panel</p>
                    </div>
                    
                    {reservations.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-xl font-medium text-gray-500 mb-2">No hay reservas disponibles</p>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Cuando recibas reservas para tus propiedades, aparecerán aquí para que puedas gestionarlas.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reserva
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Detalles
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fechas
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reservations.map(reservation => (
                                        <tr key={reservation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">#{reservation.id}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(reservation.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        {getItemTypeIcon(reservation.itemType)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{reservation.itemName}</div>
                                                        <div className="text-sm text-gray-500 capitalize">{reservation.itemType}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{reservation.customerName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(reservation.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - 
                                                    {new Date(reservation.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24))} días
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(reservation.status)}>
                                                    {reservation.status === 'pending' && 'Pendiente'}
                                                    {reservation.status === 'accepted' && 'Aceptada'}
                                                    {reservation.status === 'confirmed' && 'Confirmada'}  {/* Add this line */}
                                                    {reservation.status === 'rejected' && 'Rechazada'}
                                                    {reservation.status === 'completed' && 'Completada'}
                                                    {reservation.status === 'cancelled' && 'Cancelada'}
                                                    {!['pending', 'accepted', 'confirmed', 'rejected', 'completed', 'cancelled'].includes(reservation.status) && reservation.status}  {/* Add this fallback */}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {reservation.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleAcceptReservation(reservation.id)}
                                                                className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-md transition-colors"
                                                                title="Aceptar reserva"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectReservation(reservation.id)}
                                                                className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-md transition-colors"
                                                                title="Rechazar reserva"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleViewReservationDetails(reservation.id)}
                                                        className="text-white bg-blue-500 hover:bg-blue-600 p-1.5 rounded-md transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReservationManagementPage;