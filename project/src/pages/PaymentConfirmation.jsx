import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Home, CreditCard, Users, Clock, MapPin, Utensils } from 'lucide-react';

function PaymentConfirmation() {
  const location = useLocation();
  const { 
    bookingId, 
    amount, 
    bookingType,
    // Accommodation specific
    accommodationId, 
    accommodationName,
    checkInDate, 
    checkOutDate, 
    rooms,
    totalGuestCount,
    // Experience specific
    experienceId,
    experienceName,
    experienceDate,
    bookingDate,
    experienceTime,
    participants,
    numberOfParticipants,
    // Restaurant specific
    restaurantId,
    restaurantName,
    date,
    reservationDate,
    time,
    lunchTime,
    guests,
    guestCount,
    // Common
    notes,
    totalPrice,
    // Payment info
    cardLast4 
  } = location.state || {};

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Render different booking details based on booking type
  const renderBookingDetails = () => {
    // If bookingType is not explicitly set, try to determine it from available data
    const determinedType = bookingType || 
      (restaurantId ? 'restaurant' : 
       (experienceId ? 'experience' : 
        (accommodationId ? 'accommodation' : null)));
    
    switch(determinedType) {
      case 'accommodation':
        return (
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Fechas</p>
                <p className="text-gray-600">
                  {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Home className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Alojamiento</p>
                <p className="text-gray-600">{accommodationName || `ID: ${accommodationId}`}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Habitaciones</p>
                <p className="text-gray-600">{rooms} {parseInt(rooms) === 1 ? 'habitación' : 'habitaciones'}</p>
              </div>
            </div>
            
            {totalGuestCount && (
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Huéspedes</p>
                  <p className="text-gray-600">{totalGuestCount} {parseInt(totalGuestCount) === 1 ? 'persona' : 'personas'}</p>
                </div>
              </div>
            )}
            
            {notes && (
              <div className="flex items-start">
                <div className="h-5 w-5 text-gray-500 mr-3 mt-0.5">📝</div>
                <div>
                  <p className="font-medium text-gray-900">Notas</p>
                  <p className="text-gray-600">{notes}</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'experience':
        return (
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Fecha</p>
                <p className="text-gray-600">{formatDate(experienceDate || bookingDate || checkInDate)}</p>
              </div>
            </div>
            
            {experienceTime && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Hora</p>
                  <p className="text-gray-600">{experienceTime}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Experiencia</p>
                <p className="text-gray-600">{experienceName || `ID: ${experienceId}`}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Participantes</p>
                <p className="text-gray-600">
                  {numberOfParticipants || participants || totalGuestCount || 1} 
                  {parseInt(numberOfParticipants || participants || totalGuestCount || 1) === 1 ? ' persona' : ' personas'}
                </p>
              </div>
            </div>
            
            {notes && (
              <div className="flex items-start">
                <div className="h-5 w-5 text-gray-500 mr-3 mt-0.5">📝</div>
                <div>
                  <p className="font-medium text-gray-900">Notas</p>
                  <p className="text-gray-600">{notes}</p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'restaurant':
        return (
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Fecha</p>
                <p className="text-gray-600">{formatDate(date || reservationDate)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Hora</p>
                <p className="text-gray-600">{time || lunchTime}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Utensils className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Restaurante</p>
                <p className="text-gray-600">{restaurantName || `ID: ${restaurantId}`}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Comensales</p>
                <p className="text-gray-600">
                  {guests || guestCount} 
                  {parseInt(guests || guestCount) === 1 ? ' persona' : ' personas'}
                </p>
              </div>
            </div>
            
            {notes && (
              <div className="flex items-start">
                <div className="h-5 w-5 text-gray-500 mr-3 mt-0.5">📝</div>
                <div>
                  <p className="font-medium text-gray-900">Notas</p>
                  <p className="text-gray-600">{notes}</p>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        // Fallback to show whatever data we have
        return (
          <div className="space-y-4">
            {(date || reservationDate || checkInDate || experienceDate || bookingDate) && (
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Fecha</p>
                  <p className="text-gray-600">
                    {formatDate(date || reservationDate || experienceDate || bookingDate || checkInDate)}
                    {checkOutDate && ` - ${formatDate(checkOutDate)}`}
                  </p>
                </div>
              </div>
            )}
            
            {(time || lunchTime || experienceTime) && (
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Hora</p>
                  <p className="text-gray-600">{time || lunchTime || experienceTime}</p>
                </div>
              </div>
            )}
            
            {(restaurantName || restaurantId) && (
              <div className="flex items-start">
                <Utensils className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Restaurante</p>
                  <p className="text-gray-600">{restaurantName || `ID: ${restaurantId}`}</p>
                </div>
              </div>
            )}
            
            {(guests || guestCount || numberOfParticipants || participants || totalGuestCount) && (
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Personas</p>
                  <p className="text-gray-600">
                    {guests || guestCount || numberOfParticipants || participants || totalGuestCount} 
                    {parseInt(guests || guestCount || numberOfParticipants || participants || totalGuestCount) === 1 ? ' persona' : ' personas'}
                  </p>
                </div>
              </div>
            )}
            
            {notes && (
              <div className="flex items-start">
                <div className="h-5 w-5 text-gray-500 mr-3 mt-0.5">📝</div>
                <div>
                  <p className="font-medium text-gray-900">Notas</p>
                  <p className="text-gray-600">{notes}</p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  // Get booking type title
  const getBookingTypeTitle = () => {
    // If bookingType is not explicitly set, try to determine it from available data
    const determinedType = bookingType || 
      (restaurantId ? 'restaurant' : 
       (experienceId ? 'experience' : 
        (accommodationId ? 'accommodation' : null)));
        
    switch(determinedType) {
      case 'accommodation': return 'Alojamiento';
      case 'experience': return 'Experiencia';
      case 'restaurant': return 'Restaurante';
      default: return 'Reserva';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 px-6 py-8 text-center">
          <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">¡Pago completado con éxito!</h1>
          <p className="text-green-100 mt-2">Tu reserva de {getBookingTypeTitle().toLowerCase()} ha sido confirmada</p>
        </div>
        
        <div className="p-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la reserva</h2>
            
            {renderBookingDetails()}
            
            <div className="flex items-start mt-4">
              <CreditCard className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Método de pago</p>
                <p className="text-gray-600">Tarjeta terminada en {cardLast4 || '****'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-medium text-gray-900">Total pagado</span>
            <span className="text-2xl font-bold text-gray-900">€{amount || totalPrice}</span>
          </div>
          
          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-700">
              Hemos enviado un correo electrónico con los detalles de tu reserva. 
              El ID de tu reserva es: <span className="font-semibold">{bookingId}</span>
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link 
              to="/profile" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Ver mis reservas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmation;