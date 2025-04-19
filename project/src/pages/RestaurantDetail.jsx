import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Phone, Globe, ArrowLeft, Menu, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function RestaurantDetail() {
  const { id } = useParams();
  const { fetchRestaurant, loading, createGenericReview, fetchRestaurantReviews } = useAppContext();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');
  
  // Add these state variables for reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  // Add these new state variables for calculated rating
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Fetch restaurant details
  useEffect(() => {
    const getRestaurantDetails = async () => {
      try {
        const data = await fetchRestaurant(id);
        setRestaurant(data);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('No se pudo cargar la información del restaurante.');
      }
    };

    getRestaurantDetails();
  }, [id, fetchRestaurant]);

  // Add this useEffect to fetch reviews and calculate average rating
  useEffect(() => {
    const getReviewsAndCalculateAverage = async () => {
      try {
        if (!id) return;
        
        setReviewsLoading(true);
        const reviews = await fetchRestaurantReviews(id);
        setReviews(reviews);
        
        // Calculate number of reviews
        const count = reviews.length;
        
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
        console.error('Error getting restaurant reviews:', error);
        // Keep default values in case of error
        setReviewCount(0);
      } finally {
        setReviewsLoading(false);
      }
    };

    getReviewsAndCalculateAverage();
  }, [id, fetchRestaurantReviews]);

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
      
      // Make sure we're using the exact format expected by the API
      const reviewData = {
        userId: user.id,
        rating: parseInt(reviewRating), // Ensure rating is a number
        comment: reviewComment,
        restaurantId: id
      };
      
      console.log('Sending review data:', reviewData); // For debugging
      
      const result = await createGenericReview(reviewData);
      console.log('Review creation result:', result);
      
      // Update restaurant data with new review if available
      if (result && result.updatedItem) {
        setRestaurant(result.updatedItem);
      }
      
      // Refresh reviews and recalculate average
      const updatedReviews = await fetchRestaurantReviews(id);
      setReviews(updatedReviews);
      
      // Recalculate average rating
      const count = updatedReviews.length;
      if (count > 0) {
        const sum = updatedReviews.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating((sum / count).toFixed(1));
        setReviewCount(count);
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

  if (loading?.restaurants) {
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

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No se encontró el restaurante.</p>
        </div>
      </div>
    );
  }

  // Get the main image
  const mainImage = restaurant.images && restaurant.images.length > 0 
    ? restaurant.images[0] 
    : restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200';

  // Format opening hours - handle both string and object formats
  const formatOpeningHours = (hours) => {
    if (!hours) return '12:00 - 23:00';
    
    // If hours is a string, return it directly
    if (typeof hours === 'string') return hours;
    
    // If hours is an object with days of the week, format it
    if (typeof hours === 'object') {
      return 'Lun-Dom: Horarios variables';
    }
    
    return '12:00 - 23:00';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link to="/restaurants" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a restaurantes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Restaurant Images */}
          <div className="bg-gray-200 rounded-lg overflow-hidden mb-6 h-96">
            <img 
              src={mainImage} 
              alt={restaurant.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Restaurant Details */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
            <div className="flex items-center text-gray-600 mb-4 flex-wrap">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{restaurant.address}, {restaurant.city}</span>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span>{averageRating}</span>
                <span className="ml-1">({reviewCount} reseñas)</span>
              </div>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                <span>{formatOpeningHours(restaurant.openingHours)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Acerca de este restaurante</h2>
              <p className="text-gray-700">{restaurant.description}</p>
            </div>
            
            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de contacto</h2>
              <div className="space-y-3">
                {restaurant.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-500 mr-2" />
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {restaurant.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tabs for Menu, Reviews, etc. */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'menu' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('menu')}
                >
                  Menú
                </button>
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reseñas ({reviews && reviews.length ? reviews.length : 0})
                </button>
                <button 
                  className={`py-2 px-4 font-medium ${activeTab === 'photos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('photos')}
                >
                  Fotos
                </button>
              </div>
              
              <div className="py-6">
                {activeTab === 'menu' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuestro Menú</h3>
                    {restaurant.menu ? (
                      <div className="space-y-6">
                        {restaurant.menu.map((category, index) => (
                          <div key={index}>
                            <h4 className="text-md font-semibold text-gray-800 mb-3">{category.name}</h4>
                            <div className="space-y-4">
                              {category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex justify-between">
                                  <div>
                                    <h5 className="font-medium">{item.name}</h5>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                  </div>
                                  <span className="font-medium">€{item.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Menu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Menú no disponible</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reseñas de clientes</h3>
                    
                    {/* Display fetched reviews from the reviews state */}
                    {reviewsLoading ? (
                      <div className="flex justify-center py-8 mb-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-6 mb-8">
                        {reviews.map((review, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                            <div className="flex items-center mb-2">
                              <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500">
                                  {review.user?.firstName?.charAt(0) || 'U'}
                                </div>
                              </div>
                              <div>
                                <p className="font-medium">{review.user?.firstName || 'Usuario'} {review.user?.lastName || ''}</p>
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
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay reseñas disponibles</p>
                      </div>
                    )}
                    
                    {/* Review Form - Now below the reviews list */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Deja tu opinión</h4>
                      
                      {!user && (
                        <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4">
                          Inicia sesión para dejar una reseña
                        </div>
                      )}
                      
                      {/* Rest of the form remains the same */}
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
                            placeholder="Comparte tu experiencia en este restaurante..."
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
                
                {activeTab === 'photos' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Galería de fotos</h3>
                    {restaurant.images && restaurant.images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {restaurant.images.map((photo, index) => (
                          <div key={index} className="h-48 rounded-lg overflow-hidden">
                            <img src={photo} alt={`${restaurant.name} - ${index + 1}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No hay fotos disponibles</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-medium text-gray-900">Horario</h3>
                <p className="text-gray-600">{formatOpeningHours(restaurant.openingHours)}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Cocina</h3>
                <p className="text-gray-600">{restaurant.cuisine || 'Mediterránea'}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Precio medio</h3>
                <p className="text-gray-600">€{restaurant.priceRange || '25'} por persona</p>
              </div>
              
              {restaurant.features && restaurant.features.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900">Características</h3>
                  <ul className="text-gray-600">
                    {restaurant.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Booking section - now inside the same parent div */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Reservar mesa</h3>
              {!user ? (
                <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4">
                  Inicia sesión para reservar una mesa
                </div>
              ) : (
                <BookingForm restaurant={restaurant} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add the BookingForm component
function BookingForm({ restaurant }) {
  const { user } = useAuth();
  const { createBooking } = useAppContext();
  const navigate = useNavigate(); // Add this line to import useNavigate
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setBookingError('Debes iniciar sesión para hacer una reserva');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setBookingError(null);
      
      // Calculate a simple estimated price based on number of guests
      const estimatedPrice = guests * 25; // Assuming €25 per person
      
      // Format the booking data according to the required JSON structure
      const bookingData = {
        restaurantId: restaurant.id,
        reservationDate: date,
        reservationTime: time,
        lunchTime:time,
        guestCount: parseInt(guests),
        totalPrice: estimatedPrice,
        notes:notes
      };
      
      console.log('Sending booking data:', bookingData);
      
      const result = await createBooking(bookingData);
      console.log('Booking creation result:', result);
      
      // Set success state briefly
      setBookingSuccess(true);
      
      // Reset form
      setDate('');
      setTime('');
      setGuests(2);
      setNotes('');
      
      // Navigate to payment page with booking information
      setTimeout(() => {
        // You can pass booking data to the payment page if needed
        navigate(`/payment/${restaurant.id}`, { 
          state: { 
            bookingId: result.id || result._id,
            amount: estimatedPrice,
            bookingType: 'restaurant',
            restaurantName: restaurant.name,
            date: date,
            time: time,
            guests: guests,
            notes:notes
          } 
        });
      }, 1000); // Short delay to show success message
      
    } catch (err) {
      console.error('Error submitting booking:', err);
      setBookingError('No se pudo realizar la reserva. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-medium mb-2">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="time" className="block text-gray-700 text-sm font-medium mb-2">
            Hora
          </label>
          <select
            id="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          >
            <option value="">Selecciona una hora</option>
            <option value="12:00">12:00</option>
            <option value="12:30">12:30</option>
            <option value="13:00">13:00</option>
            <option value="13:30">13:30</option>
            <option value="14:00">14:00</option>
            <option value="14:30">14:30</option>
            <option value="20:00">20:00</option>
            <option value="20:30">20:30</option>
            <option value="21:00">21:00</option>
            <option value="21:30">21:30</option>
            <option value="22:00">22:00</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="guests" className="block text-gray-700 text-sm font-medium mb-2">
            Número de comensales
          </label>
          <div className="flex items-center">
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100"
              onClick={() => setGuests(Math.max(1, guests - 1))}
            >
              -
            </button>
            <input
              type="number"
              id="guests"
              className="w-16 px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none"
              min="1"
              max="20"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              required
            />
            <button
              type="button"
              className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100"
              onClick={() => setGuests(Math.min(20, guests + 1))}
            >
              +
            </button>
            <Users className="h-5 w-5 text-gray-500 ml-2" />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="notes" className="block text-gray-700 text-sm font-medium mb-2">
            Notas especiales (opcional)
          </label>
          <textarea
            id="notes"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Alergias, preferencias, ocasión especial..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar reserva'}
        </button>
      </form>
    </div>
  );
}

export default RestaurantDetail;