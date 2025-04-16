import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, LogOut, Home, Calendar, MapPin, Clock } from 'lucide-react';

function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user || !user.id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Fetching bookings for user:', user.id);
        
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
        console.log('Bookings API response:', data);
        
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
    if (!booking.checkInDate) return false;
    
    // Convert to date object and normalize to start of day
    const checkInDate = new Date(booking.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    
    // For debugging
    console.log('Comparing dates:', {
      checkInDate: checkInDate.toISOString(),
      today: today.toISOString(),
      isUpcoming: checkInDate >= today
    });
    
    return checkInDate >= today;
  }) : [];
  
  const completedBookings = Array.isArray(bookings) ? bookings.filter(booking => {
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
                      ) : (
                        <Calendar className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          {booking.accommodation ? booking.accommodation.title : booking.experience.title}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${booking.accommodation.city}, ${booking.accommodation.country}` : 
                              booking.experience.city}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}` : 
                              formatDate(booking.checkInDate)}
                          </span>
                        </div>
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
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {booking.accommodation ? booking.accommodation.title : booking.experience.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${booking.accommodation.city}, ${booking.accommodation.country}` : 
                              booking.experience.city}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {booking.accommodation ? 
                              `${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}` : 
                              formatDate(booking.checkInDate)}
                          </span>
                        </div>
                        {booking.accommodation && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <User className="h-4 w-4 mr-1" />
                            <span>{booking.guestCount} huéspedes • {booking.rooms} {booking.rooms === 1 ? 'habitación' : 'habitaciones'}</span>
                          </div>
                        )}
                        {booking.experience && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <User className="h-4 w-4 mr-1" />
                            <span>{booking.guestCount} {booking.guestCount === 1 ? 'participante' : 'participantes'}</span>
                          </div>
                        )}
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