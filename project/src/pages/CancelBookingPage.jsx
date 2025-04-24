import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, AlertTriangle, Home, Utensils, Calendar, MapPin, Clock, User as UserIcon } from 'lucide-react'; // Added more icons

// Helper function to format dates (similar to Profile.jsx)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};
const API_URL = import.meta.env.VITE_API_URL;

function CancelBookingPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Assuming user context might be needed, otherwise just get token
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('No se proporcionó ID de reserva.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login'); // Redirect if not logged in
          return;
        }

        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
          // Check if the error indicates the user doesn't own the booking (e.g., 403 Forbidden or 404 Not Found if scoped)
          if (response.status === 403 || response.status === 404) {
             throw new Error('No tienes permiso para ver o cancelar esta reserva, o la reserva no existe.');
          }
          throw new Error(errorData.message || `Error al cargar los detalles de la reserva: ${response.status}`);
        }

        const data = await response.json();
        setBookingDetails(data);

      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError(err.message || 'Ocurrió un error al cargar los detalles de la reserva.');
        setBookingDetails(null); // Clear details on error
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate]); // Add navigate to dependency array

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    setCancelSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
         // Provide more specific feedback if possible (e.g., cancellation window passed)
         throw new Error(errorData.message || `Error al cancelar la reserva: ${response.status}`);
      }

      // Handle successful cancellation
      setCancelSuccess(true);
      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/profile'); // Redirect back to profile after success
      }, 3000); // 3-second delay

    } catch (err) {
      console.error('Error cancelling booking:', err);
      setCancelError(err.message || 'No se pudo cancelar la reserva. Por favor, inténtalo de nuevo.');
    } finally {
      setCancelling(false);
    }
  };

  // Helper to render booking type icon and name
  const renderBookingHeader = () => {
    if (!bookingDetails) return null;

    if (bookingDetails.accommodation) {
      return <><Home className="h-5 w-5 mr-2 text-blue-500" /> {bookingDetails.accommodation.title}</>;
    }
    if (bookingDetails.restaurant) {
      return <><Utensils className="h-5 w-5 mr-2 text-orange-500" /> {bookingDetails.restaurant.name}</>;
    }
    if (bookingDetails.experience) {
      return <><Calendar className="h-5 w-5 mr-2 text-green-500" /> {bookingDetails.experience.title}</>;
    }
    return 'Detalles de la Reserva';
  };

   // Helper to render specific booking details
   const renderBookingSpecificDetails = () => {
    if (!bookingDetails) return null;

    return (
      <>
        {bookingDetails.accommodation && (
          <>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span> {bookingDetails.accommodation.city}, {bookingDetails.accommodation.country}</span>
            </div>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Entrada: {formatDate(bookingDetails.checkInDate)}</span>
            </div>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Salida: {formatDate(bookingDetails.checkOutDate)}</span>
            </div>
             <div className="flex items-center mt-1">
              <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>{bookingDetails.guestCount} Huésped(es)</span>
            </div>
          </>
        )}
        {bookingDetails.restaurant && (
          <>
             <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{bookingDetails.restaurant.address}, {bookingDetails.restaurant.city}</span>
            </div>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Fecha: {formatDate(bookingDetails.reservationDate)}</span>
            </div>
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>Hora: {bookingDetails.reservationTime || 'No especificada'}</span>
            </div>
             <div className="flex items-center mt-1">
              <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>{bookingDetails.guestCount} Comensal(es)</span>
            </div>
          </>
        )}
        {bookingDetails.experience && (
          <>
             <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{bookingDetails.experience.city}, {bookingDetails.experience.country}</span>
            </div>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Fecha: {formatDate(bookingDetails.checkInDate)}</span> {/* Assuming checkInDate is used */}
            </div>
             <div className="flex items-center mt-1">
              <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>{bookingDetails.guestCount} Participante(s)</span>
            </div>
          </>
        )}
         <div className="flex items-center mt-2 pt-2 border-t">
            <span className="font-semibold mr-2">Precio Total:</span>
            <span>€{parseFloat(bookingDetails.totalPrice).toFixed(2)}</span>
         </div>
      </>
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
         <button
            onClick={() => navigate('/profile')} // Go back to profile on error
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Perfil
          </button>
      </div>
    );
  }

  if (!bookingDetails) {
     // This case might occur if fetch completed without error but data is null
     return (
       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
         <p className="text-gray-600">No se encontraron detalles para esta reserva.</p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Perfil
          </button>
       </div>
     );
  }

  // Display cancellation success message
  if (cancelSuccess) {
     return (
       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
           <p>¡Reserva cancelada con éxito!</p>
         </div>
         <p className="text-gray-600 mb-4">Serás redirigido a tu perfil en unos segundos...</p>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir al Perfil Ahora
          </button>
       </div>
     );
  }


  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)} // Go back to the previous page (Profile)
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </button>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
             {renderBookingHeader()}
          </h2>
        </div>

        <div className="px-6 py-6">
           <h3 className="text-lg font-medium text-gray-800 mb-3">Detalles de la Reserva</h3>
           <div className="text-sm text-gray-700 space-y-2 mb-6">
             {renderBookingSpecificDetails()}
           </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  ¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.
                  {/* You might add policy info here, e.g., "Consulta nuestra política de cancelación para posibles reembolsos." */}
                </p>
              </div>
            </div>
          </div>

          {cancelError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{cancelError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
             <button
              onClick={() => navigate('/profile')} // Changed to navigate to profile explicitly
              type="button"
              disabled={cancelling}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              No, mantener reserva
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {cancelling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelando...
                </>
              ) : (
                'Sí, cancelar reserva'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CancelBookingPage;