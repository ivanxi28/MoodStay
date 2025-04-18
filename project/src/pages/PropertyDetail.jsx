import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, Wifi, Wind, Utensils, Car, Droplet, Flame, Leaf, Coffee, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

// Fix for default marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function PropertyDetail() {
  const { id } = useParams();
  const { fetchAccommodation, fetchReviews, createGenericReview } = useAppContext();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [nights, setNights] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [bookingNotes, setBookingNotes] = useState(''); // Add state for booking notes
  
  // Add these state variables for calculated rating
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  // Review form state - moved inside the component
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  
  const navigate = useNavigate();

  
  // Fetch property details
  useEffect(() => {
    const getPropertyDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchAccommodation(id);
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('No se pudo cargar la información de la propiedad.');
      } finally {
        setLoading(false);
      }
    };

    getPropertyDetails();
  }, [id, fetchAccommodation]);

  // Fetch reviews for the property
  useEffect(() => {
    const getReviewsAndCalculateAverage = async () => {
      try {
        if (!id) return;
        
        setReviewsLoading(true);
        const reviews = await fetchReviews(id);
        setReviews(reviews || []);
        
        // Calculate number of reviews
        const count = reviews ? reviews.length : 0;
        
        // Calculate average rating
        let sum = 0;
        if (count > 0) {
          sum = reviews.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating((sum / count).toFixed(1));
          setReviewCount(count);
        } else {
          setAverageRating(0);
          setReviewCount(0);
        }
        
      } catch (error) {
        console.error('Error getting property reviews:', error);
        // Keep default values in case of error
        setReviewCount(0);
      } finally {
        setReviewsLoading(false);
      }
    };

    getReviewsAndCalculateAverage();
  }, [id, fetchReviews]);

  // Calculate nights and total price when dates change
  useEffect(() => {
    if (startDate && endDate && property) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Ensure we have at least 1 night
      const nightsCount = Math.max(1, diffDays);
      setNights(nightsCount);
      
      // Calculate total price with 25% discount on additional rooms
      const baseRoomPrice = property.pricePerNight * nightsCount;
      const additionalRoomsPrice = (rooms - 1) * baseRoomPrice * 0.75; // 25% discount on additional rooms
      const roomCost = baseRoomPrice + (rooms > 1 ? additionalRoomsPrice : 0);
      
      const cleaningFee = 35 * rooms; // Cleaning fee per room
      const serviceFee = 25;
      const calculatedTotal = roomCost + cleaningFee + serviceFee;
      
      setTotalPrice(calculatedTotal);
    }
  }, [startDate, endDate, property, rooms]); // Add rooms as a dependency

  
  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setReviewError('Debes iniciar sesión para dejar una reseña');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setReviewError(null);
      
      const reviewData = {
        userId: user.id,
        rating: reviewRating,
        comment: reviewComment,
        accommodationId: id
      };
      
      const { review, updatedReviews } = await createGenericReview(reviewData);
      
      // Update reviews list if we got updated reviews back
      if (updatedReviews) {
        setReviews(updatedReviews);
        
        // Recalculate average rating
        const count = updatedReviews.length;
        if (count > 0) {
          const sum = updatedReviews.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating((sum / count).toFixed(1));
          setReviewCount(count);
        }
      }
      
      // Reset form
      setReviewComment('');
      setReviewRating(5);
      setReviewSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError('No se pudo enviar la reseña. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert('Por favor, selecciona las fechas de llegada y salida');
      return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Save current property and booking details to localStorage
      localStorage.setItem('pendingBooking', JSON.stringify({
        propertyId: id,
        startDate,
        endDate,
        guests
      }));
      
      // Redirect to login page with a return URL
      window.location.href = `/login?redirect=/properties/${id}`;
      return;
    }
    
    try {
      const bookingData = {
        accommodationId: property.id,
        checkInDate: startDate,
        checkOutDate: endDate,
        totalGuestCount: guests + children,
        rooms: rooms,
        totalPrice: totalPrice,
        notes: bookingNotes // Include notes in booking data
      };
      
      
      // Use navigate instead of window.location.href
      navigate(`/payment/${property.id}`, {
        state: {
          amount: totalPrice,
          accommodationId: property.id,
          checkInDate: startDate,
          checkOutDate: endDate,
          rooms: rooms,
          notes: bookingNotes // Pass notes to payment page
        }
      });
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('No se pudo completar la reserva. Por favor, inténtalo de nuevo.');
    }
  };

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

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No se encontró la propiedad.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link to="/properties" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a alojamientos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Property Images */}
          <div className="bg-gray-200 rounded-lg overflow-hidden mb-6 h-96">
            <img 
              src={property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Property Details */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{property.city}, {property.country}</span>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span>{averageRating}</span>
                <span className="ml-1">({reviewCount} reseñas)</span>
              </div>
            </div>
            
            {/* Tabs for Details and Reviews */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex">
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Detalles
                </button>
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reseñas ({reviewCount})
                </button>
              </div>
            </div>
            
            {activeTab === 'details' && (
              <>
                <p className="text-gray-700 mb-6">{property.description}</p>
                
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Características</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{property.maxGuest || 2} huéspedes</span>
                    </div>
                    <div className="flex items-center">
                      <Wifi className="h-5 w-5 text-gray-500 mr-2" />
                      <span>WiFi</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Aire acondicionado</span>
                    </div>
                    <div className="flex items-center">
                      <Utensils className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Cocina</span>
                    </div>
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Estacionamiento</span>
                    </div>
                    <div className="flex items-center">
                      <Droplet className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Agua caliente</span>
                    </div>
                    <div className="flex items-center">
                      <Flame className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Calefacción</span>
                    </div>
                    <div className="flex items-center">
                      <Leaf className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Jardín</span>
                    </div>
                    <div className="flex items-center">
                      <Coffee className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Desayuno</span>
                    </div>
                  </div>
                </div>
                
                {/* Map */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Ubicación</h2>
                  <div className="h-96 rounded-lg overflow-hidden">
                    {property.latitude && property.longitude ? (
                      <MapContainer 
                        center={[parseFloat(property.latitude), parseFloat(property.longitude)]} 
                        zoom={13} 
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[parseFloat(property.latitude), parseFloat(property.longitude)]}>
                          <Popup>
                            {property.title}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      // Default map centered on Madrid if no coordinates
                      <MapContainer 
                        center={[40.416775, -3.703790]} 
                        zoom={13} 
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[40.416775, -3.703790]}>
                          <Popup>
                            Ubicación aproximada
                          </Popup>
                        </Marker>
                      </MapContainer>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Opiniones de huéspedes
                </h2>
                
                {/* Display reviews */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6 mb-8">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-center mb-2">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                            <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500">
                              {review.user?.firstName?.charAt(0) || review.userName?.charAt(0) || 'U'}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">
                              {review.user?.firstName || ''} {review.user?.lastName || ''} 
                              {!review.user?.firstName && !review.user?.lastName && (review.userName || 'Usuario')}
                            </p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 mb-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay reseñas disponibles</p>
                  </div>
                )}
                
                {/* Review Form */}
                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                  <h3 className="font-medium text-gray-900 mb-4">Deja tu opinión</h3>
                  
                  {!user && (
                    <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4">
                      Inicia sesión para dejar una reseña
                    </div>
                  )}
                  
                  {reviewSuccess && (
                    <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
                      ¡Gracias por tu reseña!
                    </div>
                  )}
                  
                  {reviewError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                      {reviewError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Puntuación
                      </label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`h-6 w-6 ${star <= reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-gray-700 text-sm font-medium mb-2">
                        Comentario
                      </label>
                      <textarea
                        id="comment"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Cuéntanos cómo fue tu estancia..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                        disabled={!user || isSubmitting}
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={!user || isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {property.pricePerNight ? `€${property.pricePerNight}` : 'Consultar'} <span className="text-gray-500 text-base font-normal">/ noche</span>
            </h2>
            
            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Fechas</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Llegada</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={startDate || ''}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">Salida</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={endDate || ''}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Huéspedes y habitaciones</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Adultos</span>
                    
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                        onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                      >
                        -
                      </button>
                      <span className="mx-3">{guests}</span>
                      <button 
                        type="button"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                        onClick={() => {
                          // Check if adding an adult would exceed maxGuest
                          if (guests + children + 1 <= (property.maxGuest || 10)) {
                            setGuests(prev => prev + 1);
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Niños</span>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                        onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                      >
                        -
                      </button>
                      <span className="mx-3">{children}</span>
                      <button 
                        type="button"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                        onClick={() => {
                          // Check if adding a child would exceed maxGuest
                          if (guests + children + 1 <= (property.maxGuest || 10)) {
                            setChildren(prev => prev + 1);
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Habitaciones</span>
                    <div className="flex items-center">
                      <button 
                         type="button"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                        onClick={() => setRooms(prev => Math.max(1, prev - 1))}
                      >
                        -
                      </button>
                      <span className="mx-3">{rooms}</span>
                      <button 
                        type="button"
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                        onClick={() => setRooms(prev => Math.min(property.rooms || 5, prev + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  
                  
                  {guests + children === property.maxGuest && (
                    <p className="text-sm text-orange-600">
                      Has alcanzado el máximo de {property.maxGuest} huéspedes para este alojamiento.
                    </p>
                  )}
                </div>
              </div>
              
              
              {/* Add special requests/notes input */}
              <div className="mb-6">
                <label htmlFor="bookingNotes" className="block text-gray-700 text-sm font-medium mb-2">
                  Peticiones especiales
                </label>
                <textarea
                  id="bookingNotes"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Añade cualquier petición especial o nota para el anfitrión..."
                  rows="3"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  El anfitrión hará lo posible por atender tus peticiones, sujeto a disponibilidad.
                </p>
              </div>
              
              
              
              
              {startDate && endDate && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      {property.pricePerNight ? `€${property.pricePerNight}` : '?'} x {nights} noches x {rooms} {rooms === 1 ? 'habitación' : 'habitaciones'}
                      {rooms > 1 ? ' (25% dto. en adicionales)' : ''}
                    </span>
                    <span className="text-gray-900">
                      {property.pricePerNight ? `€${property.pricePerNight * nights + (rooms > 1 ? property.pricePerNight * nights * (rooms-1) * 0.75 : 0)}` : '?'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      Tarifa de limpieza {rooms > 1 ? `(€35 x ${rooms} habitaciones)` : ''}
                    </span>
                    <span className="text-gray-900">€{35 * rooms}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tarifa de servicio</span>
                    <span className="text-gray-900">€25</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>€{totalPrice}</span>
                  </div>
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reservar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
