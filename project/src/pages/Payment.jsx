import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { updatePaymentStatus, createBooking } = useAppContext();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get data from location state
  const { 
    amount, 
    accommodationId, 
    experienceId,
    checkInDate, 
    checkOutDate, 
    rooms,
    bookingData,
    notes // Get the booking data passed from PropertyDetail
  } = location.state || {};
  
  

  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };

  // In the handleSubmit function of Payment.jsx
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('El número de tarjeta debe tener 16 dígitos');
      return;
    }
    
    if (expiryDate.length !== 5) {
      setError('La fecha de caducidad debe tener el formato MM/YY');
      return;
    }
    
    if (cvv.length !== 3) {
      setError('El CVV debe tener 3 dígitos');
      return;
    }
    
    if (!cardName) {
      setError('Por favor, introduce el nombre del titular de la tarjeta');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let bookingId = id;
      
      // Create booking at payment time
      if (createBooking) {
        try {
          let bookingData;
          
          // Prepare booking data based on type
          if (accommodationId) {
            bookingData = {
              accommodationId: accommodationId,
              checkInDate: checkInDate,
              checkOutDate: checkOutDate,
              totalGuestCount: location.state?.totalGuestCount || 1,
              rooms: rooms || 1,
              totalPrice: amount,
              notes:notes
            };
          } else if (experienceId) {
            bookingData = {
              experienceId: experienceId,
              numberOfParticipants: location.state?.totalGuestCount || 1,
              bookingDate: location.state?.checkInDate,
              totalPrice: amount
            };
          }
          
          if (bookingData) {
            console.log("Creating booking with data:", bookingData);
            const bookingResponse = await createBooking(bookingData);
            console.log("Booking created:", bookingResponse);
            
            // Use the new booking ID if available
            if (bookingResponse && bookingResponse.id) {
              bookingId = bookingResponse.id;
            }
          }
        } catch (err) {
          console.error('Error creating booking:', err);
          setError('Error al crear la reserva. Por favor, inténtalo de nuevo.');
          setLoading(false);
          return;
        }
      }
      
      // Create payment data based on what type of booking this is
      let paymentData = {};
      
      // If this is an accommodation booking
      if (accommodationId) {
        paymentData = {
          accommodationId: accommodationId,
          paymentStatus: "paid"
        };
      } 
      // If this is an experience booking
      else if (experienceId) {
        paymentData = {
          experienceId: experienceId,
          paymentStatus: "paid"
        };
      }
      
      console.log("Payment data being sent:", paymentData);
      
      // Update payment status
      if (updatePaymentStatus && (accommodationId || experienceId)) {
        try {
          const response = await updatePaymentStatus(paymentData);
          console.log("Payment status update response:", response);
          
          // Navigate to confirmation page after successful payment
          setLoading(false);
          navigate('/payment-confirmation', { 
            state: { 
              bookingId: bookingId,
              amount,
              accommodationId,
              experienceId,
              checkInDate: location.state?.checkInDate,
              checkOutDate: location.state?.checkOutDate,
              rooms,
              cardLast4: cardNumber.replace(/\s/g, '').slice(-4)
            } 
          });
        } catch (err) {
          console.error('Error updating payment status:', err);
          // Continue to confirmation page anyway for demo purposes
          setTimeout(() => {
            setLoading(false);
            navigate('/payment-confirmation', { 
              state: { 
                bookingId: id,
                amount,
                accommodationId,
                experienceId,
                checkInDate,
                checkOutDate,
                rooms,
                cardLast4: cardNumber.replace(/\s/g, '').slice(-4)
              } 
            });
          }, 1500);
        }
      } else {
        // If function doesn't exist, just simulate success for demo
        console.log('updatePaymentStatus function not available or missing ID, simulating success');
        setTimeout(() => {
          setLoading(false);
          navigate('/payment-confirmation', { 
            state: { 
              bookingId: id,
              amount,
              accommodationId,
              experienceId,
              checkInDate,
              checkOutDate,
              rooms,
              cardLast4: cardNumber.replace(/\s/g, '').slice(-4)
            } 
          });
        }, 1500);
      }
    } catch (error) {
      setLoading(false);
      setError('Error al procesar el pago. Por favor, inténtalo de nuevo.');
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-semibold text-white">Completar pago</h1>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Detalles del pago</h2>
              <span className="text-xl font-bold text-gray-900">€{amount}</span>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <p className="text-sm text-gray-600">
                Tu reserva está pendiente de pago. Por favor, introduce los datos de tu tarjeta para completar la reserva.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nombre como aparece en la tarjeta"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de tarjeta
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="cardNumber"
                      className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de caducidad
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="expiryDate"
                        className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="cvv"
                        className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      'Pagar ahora'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 text-center">
              Tus datos de pago están seguros. Utilizamos encriptación de 256 bits para proteger tu información.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;