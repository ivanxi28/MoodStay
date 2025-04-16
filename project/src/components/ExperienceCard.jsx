import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';

function ExperienceCard({ experience }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img 
          src={experience.image || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200'} 
          alt={experience.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold">{experience.title}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{experience.location || experience.city}, {experience.country}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm">{experience.rating || 4.8} ({experience.reviewCount || 12})</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-sm">{experience.duration || '2 horas'} horas</span>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{experience.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">€{experience.price}</span>
          <Link 
            to={`/experiences/${experience.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ExperienceCard;