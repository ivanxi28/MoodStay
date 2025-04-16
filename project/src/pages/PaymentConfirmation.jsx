import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Home, CreditCard, Users, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function PaymentConfirmation() {
  const location = useLocation();
  const { 
    bookingId, 
    amount, 
    accommodationId, 
    experienceId,
    checkInDate, 
    checkOutDate, 
    rooms, 
    cardLast4 
  } = location.state || {};

  const { fetchAccommodation, fetchExperience } = useAppContext();
  const [propertyName, setPropertyName] = useState('');
  const [experienceName, setExperienceName] = useState('');

  // Fetch property or experience details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (accommodationId) {
          const data = await fetchAccommodation(accommodationId);
          setPropertyName(data?.title || 'Alojamiento');
        } else if (experienceId) {
          const data = await fetchExperience(experienceId);
          setExperienceName(data?.title || 'Experiencia');
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      }
    };

    fetchDetails();
  }, [accommodationId, experienceId, fetchAccommodation, fetchExperience]);

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 px-6 py-8 text-center">
          <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">¡Pago completado con éxito!</h1>
          <p className="text-green-100 mt-2">Tu reserva ha sido confirmada</p>
        </div>
        
        <div className="p-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles de la reserva</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Fechas</p>
                  {accommodationId ? (
                    <p className="text-gray-600">
                      {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      {formatDate(checkInDate)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                {accommodationId ? (
                  <Home className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {accommodationId ? 'Alojamiento' : 'Experiencia'}
                  </p>
                  <p className="text-gray-600">
                    {accommodationId ? propertyName : experienceName}
                  </p>
                </div>
              </div>
              
              {accommodationId && (
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Habitaciones</p>
                    <p className="text-gray-600">{rooms} {parseInt(rooms) === 1 ? 'habitación' : 'habitaciones'}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Método de pago</p>
                  <p className="text-gray-600">Tarjeta terminada en {cardLast4}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-medium text-gray-900">Total pagado</span>
            <span className="text-2xl font-bold text-gray-900">€{amount}</span>
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