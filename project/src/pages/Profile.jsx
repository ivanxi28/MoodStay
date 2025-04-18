import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, LogOut, Home, Calendar, MapPin, Clock, Utensils } from 'lucide-react';

function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  
  // Fetch user bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user || !user.id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch with better error handling
        const response = await fetch(`http://localhost:8000/api/users/${user.id}/bookings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Check content type to ensure we're getting JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
       
        
        // Ensure bookings is always an array
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('No se pudieron cargar tus reservas');
        setBookings([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserBookings();
  }, [user]);
  
  // Separate bookings into upcoming and completed
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
  
  // Make sure bookings is an array before filtering
  const upcomingBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    // For restaurant bookings, use reservationDate
    if (booking.restaurant && booking.reservationDate) {
      const reservationDate = new Date(booking.reservationDate);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate >= today;
    }
    
    // For accommodation and experience bookings, use checkInDate
    if (!booking.checkInDate) return false;
    
    // Convert to date object and normalize to start of day
    const checkInDate = new Date(booking.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    
    return checkInDate >= today;
  }) : [];
  
  const completedBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    // For restaurant bookings, use reservationDate
    if (booking.restaurant && booking.reservationDate) {
      const reservationDate = new Date(booking.reservationDate);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate < today;
    }
    
    // For accommodation and experience bookings, use checkInDate
    if (!booking.checkInDate) return false;
    
    // Convert to date object and normalize to start of day
    const checkInDate = new Date(booking.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    
    return checkInDate < today;
  }) : [];
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  const handleLogout = () => {
    logout();
  };
  // Add the handleCancelBooking function inside the component
const handleCancelBooking = async (bookingId) => {
  if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
    return;
  }
  
  try {
    setCancellingId(bookingId);
    const token = localStorage.getItem('token');
    
    // Updated API endpoint
    const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`Error al cancelar la reserva: ${response.status}`);
    }
    
    // Remove the cancelled booking from state
    setBookings(bookings.filter(booking => booking.id !== bookingId));
    
    // Show success message
    alert('Reserva cancelada con éxito');
    
  } catch (err) {
    console.error('Error cancelling booking:', err);
    alert('No se pudo cancelar la reserva. Por favor, inténtalo de nuevo.');
  } finally {
    setCancellingId(null);
  }
};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header with user avatar and name */}
        <div className="bg-blue-600 px-6 py-12 text-center">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white text-blue-600 text-3xl mb-4">
            <User size={48} />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {user?.firstName} {user?.lastName}
          </h1>
          <div className="flex items-center justify-center mt-2 text-blue-100">
            <Mail className="h-4 w-4 mr-2" />
            <span>{user?.email}</span>
          </div>
        </div>
        
        {/* User information sections */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Información personal</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Miembro desde</p>
                  <p className="font-medium">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Reservas completadas</h2>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 p-3 rounded">
                  {error}
                </div>
              ) : completedBookings.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {completedBookings.map(booking => (
                    <div key={booking.id} className="flex items-start border-b pb-3 last:border-b-0">
                      {booking.accommodation ? (
                        <Home className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      ) : booking.restaurant ? (
                        <Utensils className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Calendar className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          {booking.accommodation ? booking.accommodation.title : 
                           booking.restaurant ? booking.restaurant.name : 
                           booking.experience ? booking.experience.title : 'Reserva'}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${booking.accommodation.city}, ${booking.accommodation.country}` : 
                              booking.restaurant ? booking.restaurant.location || 'Ubicación no disponible' :
                              booking.experience ? booking.experience.city : 'Ubicación no disponible'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}` : 
                              booking.restaurant && booking.reservationDate ? 
                                `${formatDate(booking.reservationDate)} ${booking.reservationTime || ''}` :
                              booking.checkInDate ? formatDate(booking.checkInDate) : 'Fecha no disponible'}
                          </span>
                        </div>
                        {booking.restaurant && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <User className="h-3 w-3 mr-1" />
                            <span>{booking.guestCount || 2} {(booking.guestCount === 1) ? 'comensal' : 'comensales'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded p-4 text-center">
                  <p className="text-gray-500">No tienes reservas completadas.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Upcoming reservations section */}
          <div className="mt-6 border rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Próximas reservas</h2>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-3 rounded">
                {error}
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                    <div 
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {booking.accommodation ? booking.accommodation.title : 
                           booking.restaurant ? booking.restaurant.name : 
                           booking.experience ? booking.experience.title : 'Reserva'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${booking.accommodation.city}, ${booking.accommodation.country}` : 
                              booking.restaurant ? booking.restaurant.location || 'Ubicación no disponible' :
                              booking.experience ? booking.experience.city : 'Ubicación no disponible'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}` : 
                              booking.restaurant && booking.reservationDate ? 
                                `${formatDate(booking.reservationDate)} ${booking.reservationTime || ''}` :
                              booking.checkInDate ? formatDate(booking.checkInDate) : 'Fecha no disponible'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">€{parseFloat(booking.totalPrice).toFixed(2)}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                          booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente de pago'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Expanded booking details */}
                    {expandedBookingId === booking.id && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Detalles de la reserva</h4>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <p className="text-gray-500">ID de reserva:</p>
                          <p>{booking.id}</p>
                          
                          <p className="text-gray-500">Fecha de reserva:</p>
                          <p>{formatDate(booking.createdAt || new Date())}</p>
                          
                          {/* Add check-in and check-out times */}
                          {booking.accommodation ? (
                            <>
                              <p className="text-gray-500">Fecha de entrada:</p>
                              <p>{booking.checkInDate }</p>
                              
                              <p className="text-gray-500">Fecha de salida:</p>
                              <p>{booking.checkOutDate }</p>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-500">Hora de entrada:</p>
                              <p>{booking.checkInTime || booking.reservationTime || '15:00'}</p>
                            </>
                          )}
                          {/* Fix the conditional rendering for notes */}
                          {(booking.notes || 
                            (booking.accommodation && booking.accommodation.notes) || 
                            (booking.restaurant && booking.restaurant.notes)) ? (
                            <>
                              <p className="text-gray-500">Notas adicionales:</p>
                              <p>{booking.notes || 
                                 (booking.accommodation && booking.accommodation.notes) || 
                                 (booking.restaurant && booking.restaurant.notes)}</p>
                            </>
                          ) : null}
                          
                          
                          
                          {booking.guestCount && (
                            <>
                              <p className="text-gray-500">Número de {booking.accommodation ? 'huéspedes' : booking.restaurant ? 'comensales' : 'participantes'}:</p>
                              <p>{booking.guestCount}</p>
                            </>
                          )}
                          
                          {booking.accommodation && booking.rooms && booking.rooms > 0 && (
                            <>
                              <p className="text-gray-500">Habitaciones:</p>
                              <p>{booking.rooms}</p>
                            </>
                          )}
                          <p className="text-gray-500">Precio total:</p>
                          <p>€{parseFloat(booking.totalPrice).toFixed(2)}</p>
                          
                          <p className="text-gray-500">Estado de pago:</p>
                          <p className={booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                            {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente de pago'}
                          </p>
                        </div>
                        
                        {/* Cancel button - moved inside expanded view */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            handleCancelBooking(booking.id);
                          }}
                          disabled={cancellingId === booking.id}
                          className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-md hover:bg-red-50"
                        >
                          {cancellingId === booking.id ? 'Cancelando...' : 'Cancelar reserva'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded p-4 text-center">
                <p className="text-gray-500">No tienes reservas próximas.</p>
                <div className="mt-2 flex justify-center space-x-4">
                  <a href="/properties" className="text-blue-600 hover:text-blue-800">
                    Explorar alojamientos
                  </a>
                  <a href="/experiences" className="text-blue-600 hover:text-blue-800">
                    Explorar experiencias
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Logout button */}
          <div className="mt-8 border-t pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
}



export default Profile;