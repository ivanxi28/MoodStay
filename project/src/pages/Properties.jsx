import React, { useState, useEffect, useContext } from 'react';
import PropertyCard from '../components/PropertyCard';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Properties() {
  const { accommodations, loading, error, fetchAccommodations } = useAppContext();
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1); // You can keep this for backward compatibility
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

  useEffect(() => {
    // Fetch accommodations using the context
    fetchAccommodations();
  }, [fetchAccommodations]);

  // Update filtered properties when accommodations change
  useEffect(() => {
    setFilteredProperties(accommodations);
  }, [accommodations]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredProperties(accommodations);
    } else {
      const filtered = accommodations.filter(property => 
        property.title?.toLowerCase().includes(value.toLowerCase()) ||
        property.description?.toLowerCase().includes(value.toLowerCase()) ||
        property.city?.toLowerCase().includes(value.toLowerCase()) ||
        property.country?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = () => {
    let filtered = [...accommodations];
    
    if (location) {
      filtered = filtered.filter(property => 
        property.city?.toLowerCase().includes(location.toLowerCase()) ||
        property.country?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Filter by total guest count (adults + children)
    const totalGuests = adults + children;
   
    
    // Make sure maxGuest exists and is a number before comparing
    filtered = filtered.filter(property => {
      return property.maxGuest && parseInt(property.maxGuest) >= totalGuests;
    });
    
    
    // Additional filters for dates could be added here
    
    setFilteredProperties(filtered);
  };

  if (loading?.accommodations) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error?.accommodations) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error.accommodations}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Alojamientos Disponibles</h1>
        <p className="mt-4 text-xl text-gray-600">Encuentra el lugar perfecto para tu próxima estancia</p>
      </div>

      {/* Advanced Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-center">Ubicación</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                placeholder="¿A dónde vas?"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 text-center">Entrada</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="check-in"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 text-center">Salida</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="check-out"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
              />
            </div>
          </div>
          <div className="flex-1 ml-4">
            <label className="block text-sm font-medium text-gray-700 text-center mb-2">Huéspedes</label>
            <div className="mt-1 flex space-x-4">
              <div className="flex-1">
                <label htmlFor="adults" className="block text-xs text-gray-500 text-center">Adultos</label>
                <div className="flex items-center justify-center mt-1">
                  <button 
                    type="button"
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                    onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="mx-2 text-sm">{adults}</span>
                  <button 
                    type="button"
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                    onClick={() => setAdults(prev => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor="children" className="block text-xs text-gray-500 text-center">Niños</label>
                <div className="flex items-center justify-center mt-1">
                  <button 
                    type="button"
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                    onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                  >
                    -
                  </button>
                  <span className="mx-2 text-sm">{children}</span>
                  <button 
                    type="button"
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md focus:outline-none"
                    onClick={() => setChildren(prev => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full md:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleAdvancedSearch}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

     

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron propiedades que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Properties;