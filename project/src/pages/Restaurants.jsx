import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Search, Filter } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';

function Restaurants() {
  const { fetchRestaurants, loading, error } = useAppContext();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  // Fetch all restaurants
  useEffect(() => {
    const getRestaurants = async () => {
      try {
        const data = await fetchRestaurants();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      }
    };

    getRestaurants();
  }, [fetchRestaurants]);

  // Filter restaurants based on search term and filters
  useEffect(() => {
    let results = restaurants;
    
    if (searchTerm) {
      results = results.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (cuisineFilter) {
      results = results.filter(restaurant => 
        restaurant.cuisine?.toLowerCase().includes(cuisineFilter.toLowerCase())
      );
    }
    
    if (priceFilter) {
      switch(priceFilter) {
        case 'low':
          results = results.filter(restaurant => parseFloat(restaurant.priceRange) <= 25);
          break;
        case 'medium':
          results = results.filter(restaurant => 
            parseFloat(restaurant.priceRange) > 25 && parseFloat(restaurant.priceRange) <= 50
          );
          break;
        case 'high':
          results = results.filter(restaurant => parseFloat(restaurant.priceRange) > 50);
          break;
        default:
          break;
      }
    }
    
    setFilteredRestaurants(results);
  }, [searchTerm, cuisineFilter, priceFilter, restaurants]);

  if (loading?.restaurants) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Restaurantes Recomendados</h1>
        <p className="mt-4 text-xl text-gray-600">Descubre los mejores lugares para comer cerca de tu alojamiento</p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Buscar por nombre, cocina o ubicación"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
            >
              <option value="">Tipo de cocina</option>
              <option value="italian">Italiana</option>
              <option value="mediterranean">Mediterránea</option>
              <option value="asian">Asiática</option>
              <option value="mexican">Mexicana</option>
              <option value="vegetarian">Vegetariana</option>
            </select>
            
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="">Precio</option>
              <option value="low">Económico (€)</option>
              <option value="medium">Moderado (€€)</option>
              <option value="high">Exclusivo (€€€)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Restaurant List */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {restaurants.length > 0 
              ? 'No se encontraron restaurantes con los filtros seleccionados.' 
              : 'No hay restaurantes disponibles en este momento.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default Restaurants;