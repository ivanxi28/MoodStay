import React, { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  
  // Accommodation form state
  const [accommodation, setAccommodation] = useState({
    title: '',
    description: '',
    type: 'apartment',
    address: '',
    city: '',
    country: 'España',
    pricePerNight: '',
    hostId: user?.id || '',
    maxGuests: 2,
    imageFiles: [],
    imagePreviews: [],
    locationLat: '',
    locationLng: '',
    amenities: [],
  });

  const [restaurant, setRestaurant] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: 'España',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    latitude: '',
    longitude: '',
    cuisine: '',
    priceRange: '30',
    openingHours: {
      monday: ['12:00-16:00', '20:00-23:30'],
      tuesday: ['12:00-16:00', '20:00-23:30'],
      wednesday: ['12:00-16:00', '20:00-23:30'],
      thursday: ['12:00-16:00', '20:00-23:30'],
      friday: ['12:00-16:00', '20:00-00:30'],
      saturday: ['12:00-16:00', '20:00-00:30'],
      sunday: ['12:00-16:00', '20:00-23:00']
    },
    imageFiles: [],
    imagePreviews: [],
  });

  // Experience form state
  const [experience, setExperience] = useState({
    title: '',
    description: '',
    city: '',
    country: 'España',
    price: '',
    duration: 180,
    maxParticipants: 12,
    imageFiles: [],
    imagePreviews: [],
    latitude: '',
    longitude: '',
    category: 'Cultura'
  });

  // Handle accommodation form change
  const handleAccommodationChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'amenities') {
      setAccommodation(prev => ({
        ...prev,
        amenities: checked 
          ? [...prev.amenities, value]
          : prev.amenities.filter(a => a !== value)
      }));
    } else {
      setAccommodation(prev => ({
        ...prev,
        [name]: name === 'pricePerNight' || name === 'maxGuests'
          ? parseFloat(value) || '' 
          : value
      }));
    }
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

  // Handle file input for accommodation
  const handleAccommodationImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImageFiles = [...accommodation.imageFiles, ...files];
      const newImagePreviews = [
        ...accommodation.imagePreviews,
        ...files.map(file => ({
          preview: URL.createObjectURL(file),
          filename: file.name,
          alt: '',
          isFeatured: accommodation.imagePreviews.length === 0 // First image is featured by default
        }))
      ];
      
      setAccommodation(prev => ({
        ...prev,
        imageFiles: newImageFiles,
        imagePreviews: newImagePreviews
      }));
    }
  };

  // Remove image from accommodation
  const removeAccommodationImage = (index) => {
    setAccommodation(prev => {
      const newImageFiles = [...prev.imageFiles];
      const newImagePreviews = [...prev.imagePreviews];
      
      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(newImagePreviews[index].preview);
      
      newImageFiles.splice(index, 1);
      newImagePreviews.splice(index, 1);
      
      // If we removed the featured image, make the first one featured (if any)
      if (newImagePreviews.length > 0) {
        const hasFeatured = newImagePreviews.some(img => img.isFeatured);
        if (!hasFeatured) {
          newImagePreviews[0].isFeatured = true;
        }
      }
      
      return {
        ...prev,
        imageFiles: newImageFiles,
        imagePreviews: newImagePreviews
      };
    });
  };
  // Remove image from restaurant
  const removeRestaurantImage = (index) => {
    setRestaurant(prev => {
      const newImageFiles = [...prev.imageFiles];
      const newImagePreviews = [...prev.imagePreviews];

      URL.revokeObjectURL(newImagePreviews[index].preview);

      newImageFiles.splice(index, 1);
      newImagePreviews.splice(index, 1);

      if (newImagePreviews.length > 0) {
        const hasFeatured = newImagePreviews.some(img => img.isFeatured);
        if (!hasFeatured) {
          newImagePreviews[0].isFeatured = true;
        }
      }

      return {
        ...prev,
        imageFiles: newImageFiles,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Toggle featured status for a restaurant image (opcional, si lo necesitas)
  const toggleRestaurantFeaturedImage = (index) => {
    setRestaurant(prev => {
      const newImagePreviews = prev.imagePreviews.map((img, i) => ({
        ...img,
        isFeatured: i === index
      }));
      return {
        ...prev,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Update restaurant image alt text
  const updateRestaurantImageAlt = (index, alt) => {
    setRestaurant(prev => {
      const newImagePreviews = [...prev.imagePreviews];
      newImagePreviews[index] = {
        ...newImagePreviews[index],
        alt
      };
      return {
        ...prev,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Toggle featured status for an image
  const toggleFeaturedImage = (index) => {
    setAccommodation(prev => {
      const newImagePreviews = prev.imagePreviews.map((img, i) => ({
        ...img,
        isFeatured: i === index
      }));
      
      return {
        ...prev,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Update image alt text
  const updateImageAlt = (index, alt) => {
    setAccommodation(prev => {
      const newImagePreviews = [...prev.imagePreviews];
      newImagePreviews[index] = {
        ...newImagePreviews[index],
        alt
      };
      
      return {
        ...prev,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Handle file input for restaurant
  const handleRestaurantImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImageFiles = [...restaurant.imageFiles, ...files];
      const newImagePreviews = [
        ...restaurant.imagePreviews,
        ...files.map(file => ({
          preview: URL.createObjectURL(file),
          filename: file.name,
          alt: '',
          isFeatured: restaurant.imagePreviews.length === 0 // First image is featured by default
        }))
      ];

      setRestaurant(prev => ({
        ...prev,
        imageFiles: newImageFiles,
        imagePreviews: newImagePreviews
      }));
    }
  };

  // Handle file input for experience
  const handleExperienceImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImageFiles = [...experience.imageFiles, ...files];
      const newImagePreviews = [
        ...experience.imagePreviews,
        ...files.map(file => ({
          preview: URL.createObjectURL(file),
          filename: file.name,
          alt: '',
          isFeatured: experience.imagePreviews.length === 0 // First image is featured by default
        }))
      ];

      setExperience(prev => ({
        ...prev,
        imageFiles: newImageFiles,
        imagePreviews: newImagePreviews
      }));
    }
  };
  // Remove image from experience
  const removeExperienceImage = (index) => {
    setExperience(prev => {
      const newImageFiles = [...prev.imageFiles];
      const newImagePreviews = [...prev.imagePreviews];

      URL.revokeObjectURL(newImagePreviews[index].preview);

      newImageFiles.splice(index, 1);
      newImagePreviews.splice(index, 1);

      if (newImagePreviews.length > 0) {
        const hasFeatured = newImagePreviews.some(img => img.isFeatured);
        if (!hasFeatured) {
          newImagePreviews[0].isFeatured = true;
        }
      }

      return {
        ...prev,
        imageFiles: newImageFiles,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Toggle featured status for an experience image (opcional)
  const toggleExperienceFeaturedImage = (index) => {
    setExperience(prev => {
      const newImagePreviews = prev.imagePreviews.map((img, i) => ({
        ...img,
        isFeatured: i === index
      }));
      return {
        ...prev,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Update experience image alt text
  const updateExperienceImageAlt = (index, alt) => {
    setExperience(prev => {
      const newImagePreviews = [...prev.imagePreviews];
      newImagePreviews[index] = {
        ...newImagePreviews[index],
        alt
      };
      return {
        ...prev,
        imagePreviews: newImagePreviews
      };
    });
  };

  // Handle opening hours change
  const handleOpeningHoursChange = (day, index, value) => {
    setRestaurant(prev => {
      const updatedHours = { ...prev.openingHours };
      const dayHours = [...updatedHours[day]];
      dayHours[index] = value;
      updatedHours[day] = dayHours;
      
      return {
        ...prev,
        openingHours: updatedHours
      };
    });
  };

  const handleAccommodationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
        const formData = new FormData();

        // Añade los datos del alojamiento al FormData
        formData.append('title', accommodation.title);
        formData.append('description', accommodation.description);
        formData.append('type', accommodation.type);
        formData.append('pricePerNight', accommodation.pricePerNight);
        formData.append('address', accommodation.address);
        formData.append('city', accommodation.city);
        formData.append('country', accommodation.country);
        formData.append('hostId', accommodation.hostId);
        formData.append('locationLat', accommodation.locationLat);
        formData.append('locationLng', accommodation.locationLng);
        formData.append('amenities', JSON.stringify(accommodation.amenities));
        formData.append('maxGuests', accommodation.maxGuests);
        formData.append('hostId', user.id);

        // Añade los archivos de las imágenes al FormData
        accommodation.imageFiles.forEach((file, index) => {
            formData.append('images[]', file, file.name); // 'images[]' para que Symfony lo reciba como un array

            // Encuentra la información de la previsualización correspondiente para obtener alt e isFeatured
            const previewInfo = accommodation.imagePreviews.find(prev => prev.filename === file.name);
            if (previewInfo) {
                formData.append(`alt_${file.name}`, previewInfo.alt);
                formData.append(`isFeatured_${file.name}`, previewInfo.isFeatured);
            }
        });

        console.log('FormData being sent:', formData); // Para depuración

        const result = await createAccommodation(formData);
        setSuccess('Alojamiento creado correctamente');
        setAccommodation({...accommodation, imageFiles: [], imagePreviews: [],amenities:[]});
        console.log('Created accommodation:', result);
    } catch (err) {
        console.error('Error creating accommodation:', err);
        setError('Error al crear el alojamiento. Por favor, inténtalo de nuevo.');
    } finally {
        setLoading(false);
    }
};
const API_URL = import.meta.env.VITE_API_URL;

const handleRestaurantSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  if (!restaurant.name || restaurant.name.trim() === '') {
    setError('El nombre del restaurante es obligatorio.');
    setLoading(false);
    return;
  }
  try {
    
    const formData = new FormData();
    formData.append('name', restaurant.name);
    formData.append('description', restaurant.description);
    formData.append('address', restaurant.address);
    formData.append('city', restaurant.city);
    formData.append('country', restaurant.country);
    formData.append('postalCode', restaurant.postalCode);
    formData.append('phone', restaurant.phone);
    formData.append('email', restaurant.email);
    formData.append('website', restaurant.website);
    formData.append('latitude', restaurant.latitude);
    formData.append('longitude', restaurant.longitude);
    formData.append('cuisine', restaurant.cuisine);
    formData.append('priceRange', restaurant.priceRange);
    formData.append('openingHours', JSON.stringify(restaurant.openingHours));

    
    restaurant.imageFiles.forEach((file, index) => {
      formData.append('images[]', file, file.name);
      const previewInfo = restaurant.imagePreviews.find(prev => prev.filename === file.name);
      if (previewInfo) {
        formData.append(`alt_${file.name}`, previewInfo.alt);
        formData.append(`isFeatured_${file.name}`, previewInfo.isFeatured);
      }
    });

    const result = await createRestaurant(formData);
    setSuccess('Restaurante creado correctamente');
    setRestaurant({...restaurant, imageFiles: [], imagePreviews: [],openingHours:{}});
    console.log('Created restaurant:', result);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    // Keep the specific error message from the backend if available, otherwise use a generic one
    const errorMsg = err.response?.data?.message || err.message || 'Error al crear el restaurante. Por favor, inténtalo de nuevo.';
    setError(errorMsg);
  } finally {
    setLoading(false);
  }
};

const handleExperienceSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const formData = new FormData();
    formData.append('title', experience.title);
    formData.append('price', experience.price);
    formData.append('description', experience.description);
    formData.append('latitude', experience.latitude);
    formData.append('longitude', experience.longitude);
    formData.append('city', experience.city);
    formData.append('country', experience.country);
    formData.append('duration', experience.duration);
    formData.append('maxParticipants', experience.maxParticipants);
    formData.append('category', experience.category);

    experience.imageFiles.forEach((file) => {
      formData.append('images[]', file, file.name);
      const previewInfo = experience.imagePreviews.find(prev => prev.filename === file.name);
      if (previewInfo) {
        formData.append(`alt_${file.name}`, previewInfo.alt);
        formData.append(`isFeatured_${file.name}`, previewInfo.isFeatured);
      }
    });
    for (const pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
    const result = await createExperience(formData);
    setSuccess('Experiencia creada correctamente');
    setExperience({ ...experience, imageFiles: [], imagePreviews: [] });
  
    console.log('Created experience:', result);
  } catch (err) {
    console.error('Error creating experience:', err);
    setError('Error al crear la experiencia. Por favor, inténtalo de nuevo.');
  } finally {
    setLoading(false);
  }
};

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
        
        const response = await fetch(`${API_URL}/host/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // Get the JSON response to see if user is admin
          const data = await response.json();
          
          if (data && data.isHost === true) {
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
          Verificando permisos de host...
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

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Creacion</h1>

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
                  Imágenes *
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleAccommodationImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  multiple
                  required={accommodation.imagePreviews.length === 0}
                />
                {accommodation.imagePreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {accommodation.imagePreviews.map((img, index) => (
                      <div key={index} className="relative border rounded-md p-2">
                        <img 
                          src={img.preview} 
                          alt={`Vista previa ${index + 1}`} 
                          className="h-32 w-full object-cover rounded-md" 
                        />
                        <div className="mt-1 flex flex-col space-y-1">
                          <input
                            type="text"
                            placeholder="Descripción de la imagen"
                            value={img.alt}
                            onChange={(e) => updateImageAlt(index, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded"
                          />
                          <div className="flex justify-between items-center">
                            <label className="inline-flex items-center text-xs">
                              <input
                                type="radio"
                                name="featuredImage"
                                checked={img.isFeatured}
                                onChange={() => toggleFeaturedImage(index)}
                                className="form-radio h-3 w-3 text-blue-600"
                              />
                              <span className="ml-1">Principal</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeAccommodationImage(index)}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de alojamiento *
                </label>
                <select
                  name="type"
                  value={accommodation.type}
                  onChange={handleAccommodationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="villa">Villa</option>
                  <option value="cottage">Cabaña</option>
                </select>
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
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={accommodation.address}
                  onChange={handleAccommodationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de huéspedes *
                </label>
                <input
                  type="number"
                  id="maxGuests"
                  name="maxGuests"
                  value={accommodation.maxGuests}
                  onChange={handleAccommodationChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicios disponibles
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'wifi', label: 'WiFi' },
                    { id: 'air_conditioning', label: 'Aire acondicionado' },
                    { id: 'kitchen', label: 'Cocina' },
                    { id: 'parking', label: 'Parking' },
                    { id: 'pool', label: 'Piscina' }
                  ].map(({ id, label }) => (
                    <label key={id} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={id}
                        checked={(accommodation.amenities || []).includes(id)}
                        onChange={handleAccommodationChange}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="locationLat" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                </label>
                <input
                  type="text"
                  id="locationLat"
                  name="locationLat"
                  value={accommodation.locationLat}
                  onChange={handleAccommodationChange}
                  placeholder="Ej: 41.385063"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="locationLng" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud
                </label>
                <input
                  type="text"
                  id="locationLng"
                  name="locationLng"
                  value={accommodation.locationLng}
                  onChange={handleAccommodationChange}
                  placeholder="Ej: 2.173404"
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
      <label htmlFor="restaurantImage" className="block text-sm font-medium text-gray-700 mb-1">
        Imágenes *
      </label>
      <input
        type="file"
        id="restaurantImage"
        name="restaurantImage"
        accept="image/*"
        onChange={handleRestaurantImageChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        multiple
        required={restaurant.imagePreviews.length === 0}
      />
                {restaurant.imagePreviews.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {restaurant.imagePreviews.map((img, index) => (
            <div key={index} className="relative border rounded-md p-2">
              <img
                src={img.preview}
                alt={`Vista previa ${index + 1}`}
                className="h-32 w-full object-cover rounded-md"
              />
              <div className="mt-1 flex flex-col space-y-1">
                <input
                  type="text"
                  placeholder="Descripción de la imagen"
                  value={img.alt}
                  onChange={(e) => updateRestaurantImageAlt(index, e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                />
                <div className="flex justify-between items-center">
                  <label className="inline-flex items-center text-xs">
                    <input
                      type="radio"
                      name="restaurantFeaturedImage"
                      checked={img.isFeatured}
                      onChange={() => toggleRestaurantFeaturedImage(index)}
                      className="form-radio h-3 w-3 text-blue-600"
                    />
                    <span className="ml-1">Principal</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRestaurantImage(index)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
              
              <div className="md:col-span-2">
                <label htmlFor="restaurantDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  id="restaurantDescription"
                  name="description"
                  rows="4"
                  value={restaurant.description}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
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
                  placeholder="Ej: Mediterránea, Italiana, Asiática..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio medio (€) *
                </label>
                <input
                  type="number"
                  id="priceRange"
                  name="priceRange"
                  value={restaurant.priceRange}
                  onChange={handleRestaurantChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  id="restaurantAddress"
                  name="address"
                  value={restaurant.address}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="restaurantCity" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="restaurantCity"
                  name="city"
                  value={restaurant.city}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="restaurantCountry" className="block text-sm font-medium text-gray-700 mb-1">
                  País *
                </label>
                <input
                  type="text"
                  id="restaurantCountry"
                  name="country"
                  value={restaurant.country}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={restaurant.postalCode}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={restaurant.phone}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={restaurant.email}
                  onChange={handleRestaurantChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio web
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={restaurant.website}
                  onChange={handleRestaurantChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  value={restaurant.latitude}
                  onChange={handleRestaurantChange}
                  placeholder="Ej: 41.385063"
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
                  placeholder="Ej: 2.173404"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de apertura
                </label>
                
                {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                  <div key={day} className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1 capitalize">
                      {day === 'monday' ? 'Lunes' : 
                       day === 'tuesday' ? 'Martes' : 
                       day === 'wednesday' ? 'Miércoles' : 
                       day === 'thursday' ? 'Jueves' : 
                       day === 'friday' ? 'Viernes' : 
                       day === 'saturday' ? 'Sábado' : 'Domingo'}
                    </p>
                    <div className="flex space-x-2">
                      {hours.map((hour, index) => (
                        <input
                          key={index}
                          type="text"
                          value={hour}
                          onChange={(e) => handleOpeningHoursChange(day, index, e.target.value)}
                          placeholder="HH:MM-HH:MM"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      ))}
                    </div>
                  </div>
                ))}
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
      <label htmlFor="experienceImage" className="block text-sm font-medium text-gray-700 mb-1">
        Imágenes *
      </label>
      <input
        type="file"
        id="experienceImage"
        name="experienceImage"
        accept="image/*"
        onChange={handleExperienceImageChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        multiple
        required={experience.imagePreviews.length === 0}
      />
                {experience.imagePreviews.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {experience.imagePreviews.map((img, index) => (
            <div key={index} className="relative border rounded-md p-2">
              <img
                src={img.preview}
                alt={`Vista previa ${index + 1}`}
                className="h-32 w-full object-cover rounded-md"
              />
              <div className="mt-1 flex flex-col space-y-1">
                <input
                  type="text"
                  placeholder="Descripción de la imagen"
                  value={img.alt}
                  onChange={(e) => updateExperienceImageAlt(index, e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                />
                <div className="flex justify-between items-center">
                  <label className="inline-flex items-center text-xs">
                    <input
                      type="radio"
                      name="experienceFeaturedImage"
                      checked={img.isFeatured}
                      onChange={() => toggleExperienceFeaturedImage(index)}
                      className="form-radio h-3 w-3 text-blue-600"
                    />
                    <span className="ml-1">Principal</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeExperienceImage(index)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={experience.category}
                  onChange={handleExperienceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Cultura">Cultura</option>
                  <option value="Gastronomía">Gastronomía</option>
                  <option value="Aventura">Aventura</option>
                  <option value="Naturaleza">Naturaleza</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Relax">Relax</option>
                </select>
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
                  Precio por persona (€) *
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
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={experience.duration}
                  onChange={handleExperienceChange}
                  min="30"
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
                  placeholder="Ej: 41.385063"
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
                  placeholder="Ej: 2.173404"
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