import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { PlusCircle, Home, Utensils, Map, ArrowLeft } from 'lucide-react';

function AdminDashboard() {
  const { createAccommodation, createRestaurant, createExperience } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accommodations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Accommodation form state
  const [accommodation, setAccommodation] = useState({
    title: '',
    description: '',
    city: '',
    type:'',
    country: 'España',
    pricePerNight: '',
    maxGuest: 2,
    rooms: 1,
    image: '',
    latitude: '',
    longitude: '',
    amenities:[],
  });

  // Restaurant form state
  const [restaurant, setRestaurant] = useState({
    name: '',
    description: '',
    city: '',
    country: 'España',
    cuisine: '',
    priceRange: 'medium',
    image: '',
    latitude: '',
    longitude: ''
  });

  // Experience form state
  const [experience, setExperience] = useState({
    title: '',
    description: '',
    city: '',
    country: 'España',
    price: '',
    duration: 2,
    maxParticipants: 10,
    image: '',
    latitude: '',
    longitude: ''
  });
  
  useEffect(() => {
    // Verify admin status on component mount
    const verifyAdminStatus = async () => {
      try {
        setIsVerifying(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await fetch(`http://localhost:8000/api/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // Get the JSON response to see if user is admin
          const data = await response.json();
          
          // Here you can check any property in the returned data
          // For example, if the API returns { isAdmin: true }
          if (data && data.isAdmin === true) {
            setIsAdmin(true);
          } else {
            // If the response doesn't confirm admin status, redirect
            navigate('/');
          }
        } else {
          // If not admin, redirect
          navigate('/');
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        navigate('/');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAdminStatus();
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Verificando permisos de administrador...
        </div>
      </div>
    );
  }

  // Check if user is admin based on server verification
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No tienes permisos para acceder a esta página.
        </div>
      </div>
    );
  }

  // Handle accommodation form change
  const handleAccommodationChange = (e) => {
    const { name, value } = e.target;
    setAccommodation(prev => ({
      ...prev,
      [name]: name === 'pricePerNight' || name === 'maxGuest' || name === 'rooms' 
        ? parseInt(value) || '' 
        : value
    }));
  };

  // Handle restaurant form change
  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setRestaurant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle experience form change
  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setExperience(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' || name === 'maxParticipants' 
        ? parseInt(value) || '' 
        : value
    }));
  };

  // Submit accommodation form
  const handleAccommodationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createAccommodation(accommodation);
      setSuccess('Alojamiento creado correctamente');
      setAccommodation({
        title: '',
        description: '',
        city: '',
        country: 'España',
        pricePerNight: '',
        maxGuest: 2,
        rooms: 1,
        image: '',
        latitude: '',
        longitude: ''
      });
      console.log('Created accommodation:', result);
    } catch (err) {
      console.error('Error creating accommodation:', err);
      setError('Error al crear el alojamiento. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Submit restaurant form
  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createRestaurant(restaurant);
      setSuccess('Restaurante creado correctamente');
      setRestaurant({
        name: '',
        description: '',
        city: '',
        country: 'España',
        cuisine: '',
        priceRange: 'medium',
        image: '',
        latitude: '',
        longitude: ''
      });
      console.log('Created restaurant:', result);
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError('Error al crear el restaurante. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Submit experience form
  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createExperience(experience);
      setSuccess('Experiencia creada correctamente');
      setExperience({
        title: '',
        description: '',
        city: '',
        country: 'España',
        price: '',
        duration: 2,
        maxParticipants: 10,
        image: '',
        latitude: '',
        longitude: ''
      });
      console.log('Created experience:', result);
    } catch (err) {
      console.error('Error creating experience:', err);
      setError('Error al crear la experiencia. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Administración</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex">
          <button 
            className={`py-2 px-4 font-medium flex items-center ${activeTab === 'accommodations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('accommodations')}
          >
            <Home className="h-5 w-5 mr-2" />
            Alojamientos
          </button>
          <button 
            className={`py-2 px-4 font-medium flex items-center ${activeTab === 'restaurants' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('restaurants')}
          >
            <Utensils className="h-5 w-5 mr-2" />
            Restaurantes
          </button>
          <button 
            className={`py-2 px-4 font-medium flex items-center ${activeTab === 'experiences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('experiences')}
          >
            <Map className="h-5 w-5 mr-2" />
            Experiencias
          </button>
        </div>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Accommodation Form */}
      {activeTab === 'accommodations' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" />
            Crear Nuevo Alojamiento
          </h2>
          
          <form onSubmit={handleAccommodationSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={accommodation.title}
                  onChange={handleAccommodationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la imagen *
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={accommodation.image}
                  onChange={handleAccommodationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={accommodation.description}
                  onChange={handleAccommodationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={accommodation.city}
                  onChange={handleAccommodationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  País *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={accommodation.country}
                  onChange={handleAccommodationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por noche (€) *
                </label>
                <input
                  type="number"
                  id="pricePerNight"
                  name="pricePerNight"
                  value={accommodation.pricePerNight}
                  onChange={handleAccommodationChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="maxGuest" className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de huéspedes *
                </label>
                <input
                  type="number"
                  id="maxGuest"
                  name="maxGuest"
                  value={accommodation.maxGuest}
                  onChange={handleAccommodationChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de habitaciones *
                </label>
                <input
                  type="number"
                  id="rooms"
                  name="rooms"
                  value={accommodation.rooms}
                  onChange={handleAccommodationChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={accommodation.latitude}
                  onChange={handleAccommodationChange}
                  placeholder="Ej: 40.416775"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={accommodation.longitude}
                  onChange={handleAccommodationChange}
                  placeholder="Ej: -3.703790"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Alojamiento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Restaurant Form */}
      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" />
            Crear Nuevo Restaurante
          </h2>
          
          <form onSubmit={handleRestaurantSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={restaurant.name}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la imagen *
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={restaurant.image}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={restaurant.description}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={restaurant.city}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  País *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={restaurant.country}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cocina *
                </label>
                <input
                  type="text"
                  id="cuisine"
                  name="cuisine"
                  value={restaurant.cuisine}
                  onChange={handleRestaurantChange}
                  placeholder="Ej: Italiana, Mediterránea, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de precios *
                </label>
                <select
                  id="priceRange"
                  name="priceRange"
                  value={restaurant.priceRange}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="low">Económico</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                  <option value="luxury">Lujo</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={restaurant.latitude}
                  onChange={handleRestaurantChange}
                  placeholder="Ej: 40.416775"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={restaurant.longitude}
                  onChange={handleRestaurantChange}
                  placeholder="Ej: -3.703790"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Restaurante'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Experience Form */}
      {activeTab === 'experiences' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" />
            Crear Nueva Experiencia
          </h2>
          
          <form onSubmit={handleExperienceSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={experience.title}
                  onChange={handleExperienceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la imagen *
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={experience.image}
                  onChange={handleExperienceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={experience.description}
                  onChange={handleExperienceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={experience.city}
                  onChange={handleExperienceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  País *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={experience.country}
                  onChange={handleExperienceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (€) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={experience.price}
                  onChange={handleExperienceChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (horas) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={experience.duration}
                  onChange={handleExperienceChange}
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de participantes *
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={experience.maxParticipants}
                  onChange={handleExperienceChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={experience.latitude}
                  onChange={handleExperienceChange}
                  placeholder="Ej: 40.416775"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={experience.longitude}
                  onChange={handleExperienceChange}
                  placeholder="Ej: -3.703790"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Experiencia'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

// At the beginning of your component
