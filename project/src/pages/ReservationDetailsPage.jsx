import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, Calendar, User, MapPin, CreditCard, Clock, 
  CheckCircle, XCircle, MessageSquare, Home, Users, AlertTriangle 
} from 'lucide-react';

function ReservationDetailsPage() {
  const { reservationId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Check if user is a host
  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/host/verify`, {
          method: 'GET',
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
        setIsHost(data.isHost);
        
        if (!data.isHost) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking host role:', error);
        setError('Error al verificar el rol.');
        navigate('/login');
      }
    };

    checkUserRole();
  }, [user, navigate, API_URL]);

  // Fetch reservation details
  useEffect(() => {
    const fetchReservationDetails = async () => {
      if (!isHost || !reservationId) return;

      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${API_URL}/bookings/${reservationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch reservation details');
        }

        const data = await response.json();
        setReservation(data);
      } catch (err) {
        console.error('Error fetching reservation details:', err);
        setError('No se pudieron cargar los detalles de la reserva.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [isHost, reservationId, API_URL]);

  const handleAcceptReservation = async () => {
    if (!reservation) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/reservations/${reservationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setReservation(prev => ({ ...prev, status: 'accepted' }));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to accept reservation');
      }
    } catch (error) {
      console.error('Error accepting reservation:', error);
      setError('No se pudo aceptar la reserva.');
    }
  };

  const handleRejectReservation = async () => {
    if (!reservation) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/reservations/${reservationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setReservation(prev => ({ ...prev, status: 'rejected' }));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject reservation');
      }
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      setError('No se pudo rechazar la reserva.');
    }
  };

  const handleStartChat = () => {
    // Navigate to chat with this customer
    if (reservation && reservation.customerId) {
      navigate(`/chat/${reservation.customerId}`);
    }
  };

  // Get status badge style based on reservation status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium";
      case 'accepted':
        return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium";
      case 'confirmed':
        return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium";
      case 'rejected':
        return "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium";
      case 'completed':
        return "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium";
      case 'cancelled':
        return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'confirmed': return 'Confirmada';
      case 'rejected': return 'Rechazada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Get item type icon
  const getItemTypeIcon = (type) => {
    switch(type) {
      case 'accommodation':
        return <Home className="w-6 h-6 text-blue-500" />;
      case 'experience':
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case 'restaurant':
        return <Users className="w-6 h-6 text-orange-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando detalles...</p>
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
            onClick={() => navigate('/reservationmanagement')} 
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Volver a Reservas
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

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-blue-50 p-6 rounded-lg shadow-md max-w-md w-full">
          <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-blue-500" />
          <h2 className="text-xl font-bold text-blue-700 mb-2">Reserva no encontrada</h2>
          <p className="text-blue-600">No se encontró la reserva solicitada.</p>
          <button 
            onClick={() => navigate('/reservations/management')} 
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver a Reservas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate('/reservations/management')} 
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Detalles de la Reserva</h1>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Reservation header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-lg font-semibold text-gray-800 mr-3">Reserva #{reservation.id}</span>
                <span className={getStatusBadge(reservation.status)}>
                  {getStatusText(reservation.status)}
                </span>
              </div>
              <p className="text-gray-600">
                Creada el {new Date(reservation.createdAt).toLocaleDateString('es-ES', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Action buttons for pending reservations */}
            {reservation.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleAcceptReservation}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceptar
                </button>
                <button
                  onClick={handleRejectReservation}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rechazar
                </button>
              </div>
            )}
          </div>

          {/* Reservation details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Información de la Reserva</h2>
                
                {/* Property/Item details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {reservation.accommodation && (
                        <div className="h-16 w-16 rounded-md overflow-hidden">
                          <img 
                            src={reservation.accommodation.featuredImage} 
                            alt={reservation.accommodation.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {reservation.accommodation ? reservation.accommodation.title : 'Alojamiento'}
                      </h3>
                      <p className="text-gray-500 capitalize">Alojamiento</p>
                      {reservation.accommodation && (
                        <p className="text-gray-500 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {reservation.accommodation.city}, {reservation.accommodation.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Dates */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    Fechas
                  </h3>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Llegada</p>
                        <p className="font-medium">
                          {new Date(reservation.checkInDate).toLocaleDateString('es-ES', { 
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Salida</p>
                        <p className="font-medium">
                          {new Date(reservation.checkOutDate).toLocaleDateString('es-ES', { 
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Duración: {Math.ceil((new Date(reservation.checkOutDate) - new Date(reservation.checkInDate)) / (1000 * 60 * 60 * 24))} días
                    </p>
                  </div>
                </div>
                
                {/* Guest count and rooms */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Detalles de la estancia
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Huéspedes:</span>
                      <span className="font-medium">{reservation.guestCount} personas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Habitaciones:</span>
                      <span className="font-medium">{reservation.rooms} {reservation.rooms === 1 ? 'habitación' : 'habitaciones'}</span>
                    </div>
                    {reservation.lunchTime && (
                      <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Hora de comida:</span>
                        <span className="font-medium">
                          {new Date(`2000-01-01T${reservation.lunchTime}`).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h2>
                
                {/* Customer details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{reservation.user ? reservation.user.name : 'Cliente'}</h3>
                      <p className="text-gray-500 text-sm">Cliente desde {new Date(reservation.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  
                  {reservation.user && reservation.user.phone && (
                    <p className="text-gray-700">
                      <span className="font-medium">Teléfono:</span> {reservation.user.phone}
                    </p>
                  )}
                  
                  <button
                    onClick={handleStartChat}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chatear con el cliente
                  </button>
                </div>
                
                {/* Payment details */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                    Detalles de Pago
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {reservation.accommodation && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Precio por noche</span>
                        <span className="font-medium">{reservation.accommodation.pricePerNight}€</span>
                      </div>
                    )}
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Noches</span>
                      <span className="font-medium">{Math.ceil((new Date(reservation.checkOutDate) - new Date(reservation.checkInDate)) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{reservation.totalPrice}€</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Estado de pago: {reservation.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {reservation.notes && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h3 className="font-medium text-gray-800 mb-2">Notas del cliente</h3>
                <p className="text-gray-700">{reservation.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationDetailsPage;