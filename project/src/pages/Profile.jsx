import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, LogOut, Home, Calendar, MapPin, Clock, Utensils, Camera, MessageSquare } from 'lucide-react';

function Profile() {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user || !user.id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/users/${user.id}/bookings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text);
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('No se pudieron cargar tus reservas');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    if (booking.restaurant && booking.reservationDate) {
      const reservationDate = new Date(booking.reservationDate);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate >= today;
    }
    if (!booking.checkInDate) return false;
    const checkInDate = new Date(booking.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate >= today;
  }) : [];

  const completedBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    if (booking.restaurant && booking.reservationDate) {
      const reservationDate = new Date(booking.reservationDate);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate < today;
    }
    if (!booking.checkInDate) return false;
    const checkInDate = new Date(booking.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate < today;
  }) : [];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError('Por favor, selecciona un archivo de imagen válido.');
        setSelectedFile(null);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(errorData.message || 'Error al subir la imagen.');
      }

      const updatedUserData = await response.json();

      if (setUser) {
        setUser(prevUser => ({ ...prevUser, avatarUrl: updatedUserData.avatarUrl }));
      } else {
        console.warn("setUser function not found in AuthContext. Avatar update might not reflect immediately.");
      }

      setSelectedFile(null);
      setPreviewUrl(null);

    } catch (err) {
      console.error('Error uploading avatar:', err);
      setUploadError(err.message || 'No se pudo subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleChatWithHost = async (booking) => {
    let idKey = '';
    let idValue = null;

    if (booking.accommodation && booking.accommodation.id) {
      idKey = 'accommodationId';
      idValue = booking.accommodation.id;
    } else if (booking.experience && booking.experience.id) {
      idKey = 'experienceId';
      idValue = booking.experience.id;
    } else if (booking.restaurant && booking.restaurant.id) {
      idKey = 'restaurantId';
      idValue = booking.restaurant.id;
    }

    if (idValue) {
      const data = {
        [idKey]: idValue
      };

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/chats/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
          console.error('Error creating chat:', errorData);
          // Aquí puedes mostrar un mensaje de error al usuario
          return;
        }

        const responseData = await response.json();
        console.log('Chat creado:', responseData);
        // Aquí puedes redirigir al usuario a la página del chat
        navigate(`/chats/${responseData.chatId}`); // Asumiendo que la API devuelve un chatId
      } catch (error) {
        console.error('Error al crear el chat:', error);
        // Aquí puedes mostrar un mensaje de error al usuario
      }
    } else {
      console.warn('No se encontró el ID para iniciar el chat.');
      // Aquí puedes mostrar un mensaje al usuario indicando que no se puede iniciar el chat
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header with user avatar and name */}
        <div className="bg-blue-600 px-6 py-12 text-center relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div
            className="relative inline-block mb-4 cursor-pointer group"
            onClick={handleAvatarClick}
            title="Cambiar foto de perfil"
          >
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white text-blue-600 text-3xl overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Previsualización" className="h-full w-full object-cover" />
              ) : user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera size={32} className="text-white" />
            </div>
          </div>

          {selectedFile && !uploading && (
            <div className="mt-2">
              <button
                onClick={handleUpload}
                className="bg-white text-blue-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-50"
              >
                Guardar foto
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-2 text-white text-sm hover:underline"
              >
                Cancelar
              </button>
            </div>
          )}
          {uploading && (
            <div className="mt-2 text-white text-sm">Subiendo...</div>
          )}
          {uploadError && (
            <div className="mt-2 text-red-200 bg-red-800 bg-opacity-50 px-3 py-1 rounded text-sm">
              {uploadError}
            </div>
          )}

          <h1 className="text-2xl font-bold text-white mt-4">
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
                              <p>{booking.checkInTime || booking.lunchTime || '15:00'}</p>
                            </>
                          )}
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

                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/cancel-booking/${booking.id}`);
                            }}
                            className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-md hover:bg-red-50"
                          >
                            Cancelar reserva
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatWithHost(booking);
                            }}
                            className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chatear con el anfitrión
                          </button>
                        </div>
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