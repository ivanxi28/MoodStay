import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, Globe, Calendar, ArrowLeft, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function ExperienceDetail() {
  const { id } = useParams();
  const { fetchExperience, loading, fetchExperienceReviews, createGenericReview } = useAppContext();
  const { user } = useAuth();
  const [experience, setExperience] = useState(null);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  // Add these missing state variables for the review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  
  // Fetch experience details
  useEffect(() => {
    const getExperienceDetails = async () => {
      try {
        const data = await fetchExperience(id);
        setExperience(data);
      } catch (err) {
        console.error('Error fetching experience details:', err);
        setError('No se pudo cargar la información de la experiencia.');
      }
    };

    getExperienceDetails();
  }, [id, fetchExperience]);

  // Fetch experience reviews
  useEffect(() => {
    const getExperienceReviews = async () => {
      if (!id) return;
      
      try {
        setReviewsLoading(true);
        const reviewsData = await fetchExperienceReviews(id);
        setReviews(reviewsData || []);
      } catch (err) {
        console.error('Error fetching experience reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    getExperienceReviews();
  }, [id, fetchExperienceReviews]);

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      alert('Por favor, selecciona una fecha para la experiencia');
      return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Save current experience and booking details to localStorage
      localStorage.setItem('pendingBooking', JSON.stringify({
        experienceId: id,
        bookingDate: selectedDate,
        numberOfParticipants: participants
      }));
      
      // Redirect to login page with a return URL
      window.location.href = `/login?redirect=/experiences/${id}`;
      return;
    }
    
    try {
      // Calculate total price
      const totalPrice = experience.price * participants;
      
      // Navigate to payment page with all necessary data
      navigate(`/payment/${experience.id}`, {
        state: {
          amount: totalPrice,
          experienceId: experience.id,
          bookingDate: selectedDate, // Use the correct field name
          checkInDate: selectedDate, // Keep for compatibility
          checkOutDate: selectedDate, // Keep for compatibility
          numberOfParticipants: participants, // Use the correct field name
          totalGuestCount: participants, // Keep for compatibility
          bookingData: {
            experienceId: experience.id,
            numberOfParticipants: participants,
            bookingDate: selectedDate,
            totalPrice: totalPrice
          }
        }
      });
      
    } catch (error) {
      console.error('Error navigating to payment:', error);
      alert('No se pudo procesar la solicitud. Por favor, inténtalo de nuevo.');
    }
  };

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
        experienceId: id
      };
      
      console.log('Sending review data:', reviewData); // For debugging
      
      const result = await createGenericReview(reviewData);
      console.log('Review creation result:', result);
      
      // Update experience data with new review if available
      if (result && result.updatedItem) {
        setExperience(result.updatedItem);
      }
      
      // Refresh reviews
      const updatedReviews = await fetchExperienceReviews(id);
      setReviews(updatedReviews || []);
      
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

  if (loading?.experiences) {
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

  if (!experience) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No se encontró la experiencia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link to="/experiences" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a experiencias
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Experience Images */}
          <div className="bg-gray-200 rounded-lg overflow-hidden mb-6 h-96">
            <img 
              src={experience.image || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200'} 
              alt={experience.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Experience Details */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{experience.title}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{experience.location || experience.city}, {experience.country}</span>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span>{experience.rating || 4.8}</span>
                <span className="ml-1">({reviews.length || 0} reseñas)</span>
              </div>
              <div className="mx-2">•</div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                <span>{experience.duration || '2 horas'} horas</span>
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
                  Reseñas ({reviews.length})
                </button>
              </div>
            </div>
            
            {activeTab === 'details' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Acerca de esta experiencia</h2>
                  <p className="text-gray-700">{experience.longDescription || experience.description}</p>
                </div>
                
                {/* Host Information */}
                {experience.host && (
                  <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tu anfitrión</h2>
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={experience.host.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'} 
                          alt={experience.host.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{experience.host.name}</h3>
                        <p className="text-gray-600 text-sm">{experience.host.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* What's Included */}
                {experience.includes && experience.includes.length > 0 && (
                  <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Qué está incluido</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {experience.includes.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Requirements */}
                {experience.requirements && experience.requirements.length > 0 && (
                  <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Qué debes traer</h2>
                    <ul className="space-y-2">
                      {experience.requirements.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block h-5 w-5 rounded-full bg-gray-200 text-center text-gray-700 mr-2">{index + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Additional Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Información adicional</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Máximo {experience.maxParticipants || 8} participantes</span>
                    </div>
                    {experience.languages && (
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Idiomas: {experience.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reseñas de clientes</h2>
                
                {/* Display reviews */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
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
                  <div className="text-center py-8 mb-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay reseñas disponibles</p>
                  </div>
                )}
                
                {/* Review Form - Below the reviews list */}
                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                  <h3 className="font-medium text-gray-900 mb-4">Deja tu opinión</h3>
                  
                  {!user && (
                    <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4">
                      Inicia sesión para dejar una reseña
                    </div>
                  )}
                  
                  {reviewSuccess && (
                    <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
                      ¡Gracias! Tu reseña ha sido enviada correctamente.
                    </div>
                  )}
                  
                  {reviewError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                      {reviewError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Puntuación</label>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`h-6 w-6 ${i < reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Comentario</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows="4"
                        placeholder="Comparte tu experiencia..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                        disabled={!user || isSubmitting}
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
              €{experience.price} <span className="text-gray-500 text-base font-normal">/ persona</span>
            </h2>
            
            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Fecha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="date" 
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Participantes</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={participants}
                  onChange={(e) => setParticipants(parseInt(e.target.value))}
                >
                  {[...Array(experience.maxParticipants || 8).keys()].map(num => (
                    <option key={num + 1} value={num + 1}>{num + 1} {num === 0 ? 'participante' : 'participantes'}</option>
                  ))}
                </select>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">€{experience.price} x {participants} {participants === 1 ? 'persona' : 'personas'}</span>
                  <span className="text-gray-900">€{experience.price * participants}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tarifa de servicio</span>
                  <span className="text-gray-900">€{Math.round(experience.price * participants * 0.1)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>€{experience.price * participants + Math.round(experience.price * participants * 0.1)}</span>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reservar ahora
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperienceDetail;