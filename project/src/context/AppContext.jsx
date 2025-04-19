import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create the context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppProvider = ({ children }) => {
  const [accommodations, setAccommodations] = useState([]);
  const [featuredAccommodations, setFeaturedAccommodations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [experiences, setExperiences] = useState([]); 
  const [restaurants, setRestaurants] = useState([]); // Add restaurants state
  const [loading, setLoading] = useState({
    accommodations: false,
    featuredAccommodations: false,
    bookings: false,
    reviews: false,
    experiences: false,
    restaurants: false // Add restaurants loading state
  });
  const [error, setError] = useState({
    accommodations: null,
    featuredAccommodations: null,
    bookings: null,
    reviews: null,
    experiences: null,
    restaurants: null // Add restaurants error state
  });

  // Use useCallback to memoize the fetch functions
  const fetchAccommodations = useCallback(async () => {
    // Skip if already loading or if we already have data
    if (loading.accommodations || accommodations.length > 0) return;
    
    try {
      setLoading(prev => ({ ...prev, accommodations: true }));
      const response = await fetch('http://localhost:8000/api/accommodations');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setAccommodations(data);
      setError(prev => ({ ...prev, accommodations: null }));
    } catch (err) {
      console.error('Error fetching accommodations:', err);
      setError(prev => ({ ...prev, accommodations: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, accommodations: false }));
    }
  }, [loading.accommodations, accommodations.length]);

  // Fetch featured accommodations
  const fetchFeaturedAccommodations = useCallback(async () => {
    // Skip if already loading or if we already have data
    if (loading.featuredAccommodations || featuredAccommodations.length > 0) return;
    
    try {
      setLoading(prev => ({ ...prev, featuredAccommodations: true }));
      const response = await fetch('http://localhost:8000/api/accommodations?limit=3');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setFeaturedAccommodations(data.slice(0, 3));
      setError(prev => ({ ...prev, featuredAccommodations: null }));
    } catch (err) {
      console.error('Error fetching featured accommodations:', err);
      setError(prev => ({ ...prev, featuredAccommodations: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, featuredAccommodations: false }));
    }
  }, [loading.featuredAccommodations, featuredAccommodations.length]);

  // Fetch single accommodation
  const fetchAccommodation = useCallback(async (id) => {
    try {
      setLoading(prev => ({ ...prev, accommodations: true }));
      const response = await fetch(`http://localhost:8000/api/accommodations/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching accommodation ${id}:`, err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, accommodations: false }));
    }
  }, []);

  // Fetch reviews for an accommodation
  const fetchReviews = useCallback(async (accommodationId) => {
    try {
      setLoading(prev => ({ ...prev, reviews: true }));
      const response = await fetch(`http://localhost:8000/api/accommodations/${accommodationId}/reviews`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setReviews(data);
      setError(prev => ({ ...prev, reviews: null }));
      return data;
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(prev => ({ ...prev, reviews: err.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  }, []);

  // Fetch user bookings
  const fetchUserBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return [];
      }

      setLoading(prev => ({ ...prev, bookings: true }));
      const response = await fetch('http://localhost:8000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setBookings(data);
      setError(prev => ({ ...prev, bookings: null }));
      return data;
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(prev => ({ ...prev, bookings: err.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  }, []);

  // Create a booking
  const createBooking = useCallback(async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      // Update bookings state
      fetchUserBookings();
      return data;
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  }, [fetchUserBookings]);
  
  // Fetch experiences
  const fetchExperiences = useCallback(async () => {
    // Skip if already loading or if we already have data
    if (loading.experiences || experiences.length > 0) return;
    
    try {
      setLoading(prev => ({ ...prev, experiences: true }));
      const response = await fetch('http://localhost:8000/api/experiences');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setExperiences(data);
      setError(prev => ({ ...prev, experiences: null }));
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError(prev => ({ ...prev, experiences: err.message }));
      
      // Fallback to mock data
      const mockExperiences = [
        {
          id: 1,
          title: "Tour gastronómico por Madrid",
          description: "Descubre los mejores sabores de la capital española en este recorrido por bares de tapas tradicionales.",
          location: "Madrid",
          country: "España",
          price: 65,
          duration: "3 horas",
          rating: 4.9,
          reviewCount: 28,
          image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=1200"
        },
        {
          id: 2,
          title: "Clase de paella valenciana",
          description: "Aprende a cocinar la auténtica paella valenciana con ingredientes frescos y técnicas tradicionales.",
          location: "Valencia",
          country: "España",
          price: 85,
          duration: "4 horas",
          rating: 4.8,
          reviewCount: 42,
          image: "https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&q=80&w=1200"
        },
        {
          id: 3,
          title: "Ruta de senderismo por Picos de Europa",
          description: "Disfruta de impresionantes vistas en esta ruta guiada por uno de los parques nacionales más espectaculares de España.",
          location: "Asturias",
          country: "España",
          price: 45,
          duration: "6 horas",
          rating: 4.7,
          reviewCount: 19,
          image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1200"
        }
      ];
      
      setExperiences(mockExperiences);
    } finally {
      setLoading(prev => ({ ...prev, experiences: false }));
    }
  }, [loading.experiences, experiences.length]);

  // Create a review
  const createReview = useCallback(async (accommodationId, reviewData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`http://localhost:8000/api/accommodations/${accommodationId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      // Refresh reviews
      fetchReviews(accommodationId);
      return data;
    } catch (err) {
      console.error('Error creating review:', err);
      throw err;
    }
  }, [fetchReviews]);

  // Fetch single experience
    const fetchExperience = useCallback(async (id) => {
      try {
        setLoading(prev => ({ ...prev, experiences: true }));
        const response = await fetch(`http://localhost:8000/api/experiences/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (err) {
        console.error(`Error fetching experience ${id}:`, err);
        
        // Fallback to mock data if API fails
        if (experiences.length > 0) {
          const mockExperience = experiences.find(exp => exp.id === parseInt(id));
          if (mockExperience) return mockExperience;
        }
        
        // Default mock experience if no match found
        return {
          id: parseInt(id),
          title: "Experiencia de ejemplo",
          description: "Esta es una experiencia de ejemplo con detalles detallados. Incluye información sobre lo que los participantes pueden esperar, lo que está incluido, y lo que deben traer consigo.",
          longDescription: "Disfruta de esta experiencia única que te permitirá sumergirte en la cultura local. Nuestro guía experto te llevará a través de lugares poco conocidos, compartiendo historias y tradiciones que no encontrarás en las guías turísticas. La experiencia incluye paradas para degustar comida local, bebidas tradicionales y la oportunidad de interactuar con artesanos locales. Es una forma perfecta de conocer la auténtica esencia del lugar de una manera personalizada y memorable.",
          location: "Madrid",
          city: "Madrid",
          country: "España",
          price: 75,
          duration: "4 horas",
          rating: 4.8,
          reviewCount: 24,
          image: `https://source.unsplash.com/random/800x600/?travel&sig=${id}`,
          host: {
            name: "Carlos Rodríguez",
            bio: "Guía local con más de 10 años de experiencia",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
          },
          includes: [
            "Guía profesional",
            "Degustaciones de comida local",
            "Transporte entre ubicaciones",
            "Fotos digitales de la experiencia"
          ],
          requirements: [
            "Calzado cómodo",
            "Ropa adecuada para el clima",
            "Botella de agua"
          ],
          maxParticipants: 8,
          languages: ["Español", "Inglés"]
        };
        
      } finally {
        setLoading(prev => ({ ...prev, experiences: false }));
      }
    }, [experiences]);
  
    // Update payment status
    const updatePaymentStatus = useCallback(async (bookingData) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User not authenticated');
        }
    
        const response = await fetch('http://localhost:8000/api/bookings/payment-status/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        // Update bookings state after payment status change
        fetchUserBookings();
        return data;
      } catch (err) {
        console.error('Error updating payment status:', err);
        throw err;
      }
    }, [fetchUserBookings]);

    // Fetch restaurants
    const fetchRestaurants = useCallback(async () => {
      // Skip if already loading or if we already have data
      if (loading.restaurants || restaurants.length > 0) return restaurants;
      
      try {
        setLoading(prev => ({ ...prev, restaurants: true }));
        const response = await fetch('http://localhost:8000/api/restaurants');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setRestaurants(data);
        setError(prev => ({ ...prev, restaurants: null }));
        return data;
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(prev => ({ ...prev, restaurants: err.message }));
        
        // Fallback to mock data
        const mockRestaurants = [
          {
            id: "01963a3f-c1b6-7ebb-98e5-f065cf90ae7b",
            name: "La Trattoria Italiana",
            description: "Auténtica cocina italiana con ingredientes importados directamente de Italia. Especialidad en pastas caseras y pizzas al horno de leña.",
            address: "Calle Principal 10",
            city: "Seville",
            country: "Spain",
            cuisine: "Italian",
            rating: "4.6",
            priceRange: "38.00",
            priceLevel: "€€",
            openingHours: "13:00 - 23:30",
            images: [
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"
            ],
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
          },
          {
            id: "01963a3f-c1b6-7ebb-98e5-f065cf90ae7c",
            name: "El Rincón Mediterráneo",
            description: "Restaurante especializado en cocina mediterránea con productos frescos del mercado. Amplia carta de vinos nacionales e internacionales.",
            address: "Avenida del Mar 25",
            city: "Barcelona",
            country: "Spain",
            cuisine: "Mediterranean",
            rating: "4.8",
            priceRange: "45.00",
            priceLevel: "€€",
            openingHours: "12:30 - 23:00",
            images: [
              "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1200"
            ],
            image: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=1200"
          },
          {
            id: "01963a3f-c1b6-7ebb-98e5-f065cf90ae7d",
            name: "Sabores de Asia",
            description: "Fusión de sabores asiáticos con toques modernos. Ambiente acogedor y servicio atento.",
            address: "Calle Gran Vía 42",
            city: "Madrid",
            country: "Spain",
            cuisine: "Asian",
            rating: "4.3",
            priceRange: "30.00",
            priceLevel: "€€",
            openingHours: "13:00 - 00:00",
            images: [
              "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1526069631228-723c945bea6b?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"
            ],
            image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1200"
          }
        ];
        
        setRestaurants(mockRestaurants);
        return mockRestaurants;
      } finally {
        setLoading(prev => ({ ...prev, restaurants: false }));
      }
    }, [loading.restaurants, restaurants.length]);

    // Fetch single restaurant
    const fetchRestaurant = useCallback(async (id) => {
      try {
        setLoading(prev => ({ ...prev, restaurants: true }));
        const response = await fetch(`http://localhost:8000/api/restaurants/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (err) {
        console.error(`Error fetching restaurant ${id}:`, err);
        
        // Fallback to mock data if API fails
        if (restaurants.length > 0) {
          const mockRestaurant = restaurants.find(rest => rest.id === id);
          if (mockRestaurant) return mockRestaurant;
        }
        
        // Default mock restaurant if no match found
        return {
          id: id,
          name: "Restaurant Example",
          description: "This is a sample restaurant with detailed information. It includes details about the cuisine, atmosphere, and special offerings.",
          longDescription: "Our restaurant offers a unique dining experience with a focus on locally-sourced ingredients and traditional recipes with a modern twist. Our chef has trained in top culinary schools and brings expertise from around the world to create memorable dishes that delight the senses.",
          address: "Calle Principal 123",
          city: "Madrid",
          country: "Spain",
          cuisine: "Mediterranean",
          rating: "4.5",
          reviewCount: 42,
          priceRange: "35.00",
          priceLevel: "€€",
          openingHours: "12:00 - 23:00",
          phone: "+34 123 456 789",
          website: "https://example.com/restaurant",
          image: `https://source.unsplash.com/random/800x600/?restaurant&sig=${id}`,
          images: [
            `https://source.unsplash.com/random/800x600/?food&sig=1${id}`,
            `https://source.unsplash.com/random/800x600/?restaurant&sig=2${id}`,
            `https://source.unsplash.com/random/800x600/?dining&sig=3${id}`
          ],
          menu: [
            {
              name: "Entrantes",
              items: [
                { name: "Ensalada Mediterránea", description: "Tomate, pepino, cebolla, aceitunas y queso feta", price: 8.50 },
                { name: "Croquetas caseras", description: "De jamón ibérico o boletus", price: 7.00 },
                { name: "Tabla de quesos", description: "Selección de quesos nacionales con mermelada casera", price: 12.00 }
              ]
            },
            {
              name: "Platos Principales",
              items: [
                { name: "Paella de marisco", description: "Arroz con mariscos frescos del día", price: 18.50 },
                { name: "Solomillo al whisky", description: "Con patatas y verduras de temporada", price: 22.00 },
                { name: "Lubina a la espalda", description: "Pescado fresco con ajitos y aceite de oliva", price: 20.00 }
              ]
            },
            {
              name: "Postres",
              items: [
                { name: "Tarta de queso", description: "Casera con mermelada de frutos rojos", price: 6.50 },
                { name: "Coulant de chocolate", description: "Con helado de vainilla", price: 7.00 },
                { name: "Fruta de temporada", description: "Selección de frutas frescas", price: 5.00 }
              ]
            }
          ],
          features: [
            "Terraza exterior",
            "Accesible para sillas de ruedas",
            "Menú para niños",
            "Opciones vegetarianas",
            "Wi-Fi gratuito"
          ],
          reviews: [
            {
              userName: "María García",
              userImage: "https://randomuser.me/api/portraits/women/12.jpg",
              rating: 5,
              date: "15/10/2023",
              comment: "Excelente comida y servicio. Volveremos seguro."
            },
            {
              userName: "Juan Pérez",
              userImage: "https://randomuser.me/api/portraits/men/22.jpg",
              rating: 4,
              date: "02/10/2023",
              comment: "Muy buena relación calidad-precio. Recomendable."
            },
            {
              userName: "Laura Martínez",
              userImage: "https://randomuser.me/api/portraits/women/32.jpg",
              rating: 5,
              date: "25/09/2023",
              comment: "La mejor paella que he probado en Madrid. El ambiente es muy agradable."
            }
          ]
        };
      } finally {
        setLoading(prev => ({ ...prev, restaurants: false }));
      }
    }, [restaurants]);

      // Fetch reviews for a restaurant
      const fetchRestaurantReviews = useCallback(async (restaurantId) => {
        try {
          setLoading(prev => ({ ...prev, reviews: true }));
          const response = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}/reviews`);
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const data = await response.json();
          setError(prev => ({ ...prev, reviews: null }));
          return data;
        } catch (err) {
          console.error('Error fetching restaurant reviews:', err);
          setError(prev => ({ ...prev, reviews: err.message }));
          return [];
        } finally {
          setLoading(prev => ({ ...prev, reviews: false }));
        }
      }, []);

      const fetchAccomodationReviews = useCallback(async (accommodationId) => {
        try {
          setLoading(prev => ({ ...prev, reviews: true }));
          const response = await fetch(`http://localhost:8000/api/accommodations/${accommodationId}/reviews`);
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const data = await response.json();
          setError(prev => ({ ...prev, reviews: null }));
          return data;
        } catch (err) {
          console.error('Error fetching accomodation reviews:', err);
          setError(prev => ({ ...prev, reviews: err.message }));
          return [];
        } finally {
          setLoading(prev => ({ ...prev, reviews: false }));
        }
      }, []);

      // Fetch reviews for an experience
      const fetchExperienceReviews = useCallback(async (experienceId) => {
        try {
          setLoading(prev => ({ ...prev, reviews: true }));
          const response = await fetch(`http://localhost:8000/api/experiences/${experienceId}/reviews`);
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const data = await response.json();
          setError(prev => ({ ...prev, reviews: null }));
          return data;
        } catch (err) {
          console.error('Error fetching experience reviews:', err);
          setError(prev => ({ ...prev, reviews: err.message }));
          return [];
        } finally {
          setLoading(prev => ({ ...prev, reviews: false }));
        }
      }, []);

      const createAccommodation = async (accommodationFormData) => {
        try {
            setLoading(prev => ({ ...prev, accommodations: true }));
    
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
    
            console.log('Sending accommodation FormData:', accommodationFormData);
    
            const response = await fetch(`http://localhost:8000/api/accommodations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Importante: No establecer 'Content-Type': 'application/json'
                    // Dejamos que el navegador establezca el Content-Type automáticamente
                    // cuando el body es un FormData.
                },
                body: accommodationFormData // Enviamos el FormData directamente
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Error creating accommodation';
    
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    if (errorText) errorMessage = errorText;
                }
    
                console.error('Server response:', errorText);
                throw new Error(errorMessage);
            }
    
            const data = await response.json();
    
            if (accommodations.length > 0) {
                setAccommodations([...accommodations, data]);
            }
    
            return data;
        } catch (error) {
            console.error('Error creating accommodation:', error);
            throw error;
        } finally {
            setLoading(prev => ({ ...prev, accommodations: false }));
        }
    };
      
      // Create restaurant
  const createRestaurant = async (restaurantData) => {
    try {
      setLoading(prev => ({ ...prev, restaurants: true }));

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/restaurants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: restaurantData // No need to stringify FormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error creating restaurant';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update restaurants list if it exists
      if (restaurants && Array.isArray(restaurants) && restaurants.length > 0) {
        setRestaurants(prevRestaurants => [...prevRestaurants, data]);
      }

      return data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, restaurants: false }));
    }
  };
      // Create experience
  const createExperience = async (experienceData) => {
    try {
      setLoading(prev => ({ ...prev, experiences: true }));

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8000/api/experiences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: experienceData // No need to stringify FormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error creating experience';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update experiences list if it exists
      if (experiences && Array.isArray(experiences) && experiences.length > 0) {
        setExperiences(prevExperiences => [...prevExperiences, data]);
      }

      return data;
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, experiences: false }));
    }
  };

      // Create a generic review (for restaurants, experiences, or accommodations)
      const createGenericReview = useCallback(async (reviewData) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('User not authenticated');
          }
      
          const response = await fetch('http://localhost:8000/api/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
          });
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Refresh the appropriate data based on what type of review was created
          if (reviewData.restaurantId) {
            // If it's a restaurant review, we might want to refresh restaurant data
            const restaurantData = await fetchRestaurant(reviewData.restaurantId);
            return { review: data, updatedItem: restaurantData };
          } else if (reviewData.experienceId) {
            // If it's an experience review, refresh experience data
            const experienceData = await fetchExperience(reviewData.experienceId);
            return { review: data, updatedItem: experienceData };
          } else if (reviewData.accommodationId) {
            // If it's an accommodation review, refresh reviews for that accommodation
            const reviewsData = await fetchReviews(reviewData.accommodationId);
            return { review: data, updatedReviews: reviewsData };
          }
          
          return { review: data };
        } catch (err) {
          console.error('Error creating review:', err);
          throw err;
        }
      }, [fetchRestaurant, fetchExperience, fetchReviews]);
      
      
      // Value object to be provided to consumers
      const value = {
        accommodations,
        featuredAccommodations,
        bookings,
        reviews,
        experiences,
        restaurants,
        loading,
        error,
        fetchAccommodations,
        fetchFeaturedAccommodations,
        fetchExperienceReviews,
        fetchRestaurantReviews,
        fetchAccommodation,
        fetchReviews,
        fetchUserBookings,
        createBooking,
        createReview,
        createAccommodation,
        createRestaurant,
        createExperience,
        createGenericReview, // Add the new method to the context value
        fetchExperiences,
        fetchExperience,
        fetchRestaurants,
        fetchRestaurant,
        updatePaymentStatus
      };
  
    return (
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    );
  };

  export default AppProvider;




