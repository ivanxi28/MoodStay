import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, Wifi, Wind, Utensils, Car, Droplet, Flame, Leaf, Coffee } from 'lucide-react';

function PropertyCard({ property }) {
  // Format location from city and country
  const location = property && property.city ? `${property.city}, ${property.country}` : 'Ubicación no disponible';
  
  // Get property type with first letter capitalized
  const propertyType = property && property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'Propiedad';
  
  // Get amenities as an array for display
  const amenitiesList = property && property.amenities ? Object.entries(property.amenities)
    .filter(([_, value]) => value === true)
    .map(([key]) => key) : [];

  // Ensure property exists before rendering
  if (!property) {
    return <div>No hay datos de propiedad disponibles</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="relative">
        <img 
          src={property.image || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200'} 
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {propertyType}
        </div>
        {property.featured && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Destacado
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {location}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
        
        {/* Amenities section */}
        <div className="flex flex-wrap gap-2 mb-4">
          {amenitiesList.length > 0 && amenitiesList.map((amenity, index) => (
            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {amenity === 'wifi' && <Wifi className="h-3 w-3 mr-1" />}
              {amenity === 'airConditioning' && <Wind className="h-3 w-3 mr-1" />}
              {amenity === 'kitchen' && <Utensils className="h-3 w-3 mr-1" />}
              {amenity === 'parking' && <Car className="h-3 w-3 mr-1" />}
              {amenity === 'pool' && <Droplet className="h-3 w-3 mr-1" />}
              {amenity === 'fireplace' && <Flame className="h-3 w-3 mr-1" />}
              {amenity === 'garden' && <Leaf className="h-3 w-3 mr-1" />}
              {amenity === 'bbq' && <Coffee className="h-3 w-3 mr-1" />}
              {amenity === 'wifi' && 'WiFi'}
              {amenity === 'airConditioning' && 'Aire acondicionado'}
              {amenity === 'kitchen' && 'Cocina'}
              {amenity === 'parking' && 'Parking'}
              {amenity === 'pool' && 'Piscina'}
              {amenity === 'fireplace' && 'Chimenea'}
              {amenity === 'garden' && 'Jardín'}
              {amenity === 'bbq' && 'Barbacoa'}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>Anfitrión: {property.host?.firstName || ''} {property.host?.lastName || ''}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>Máx. {property.maxGuest || '?'} huéspedes</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-semibold">{property.rating || '4.8'}</span>
            {property.reviews && (
              <span className="text-gray-500 ml-1">({property.reviews} reseñas)</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="font-bold text-lg text-gray-900 mr-1">{property.pricePerNight}€</span>
            <span className="text-gray-500 text-sm">/ noche</span>
          </div>
        </div>
        
        <Link 
          to={`/properties/${property.id}`}
          className="mt-4 w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
}

export default PropertyCard;