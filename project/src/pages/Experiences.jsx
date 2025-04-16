import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import ExperienceCard from '../components/ExperienceCard';
import { useAppContext } from '../context/AppContext';

function Experiences() {
  const { experiences, loading, error, fetchExperiences } = useAppContext();
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  useEffect(() => {
    setFilteredExperiences(experiences);
  }, [experiences]);

  const handleLocationSearch = (e) => {
    const value = e.target.value;
    setSearchLocation(value);
    
    if (value.trim() === '') {
      setFilteredExperiences(experiences);
    } else {
      const filtered = experiences.filter(experience => 
        experience.location?.toLowerCase().includes(value.toLowerCase()) ||
        experience.city?.toLowerCase().includes(value.toLowerCase()) ||
        experience.country?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredExperiences(filtered);
    }
  };

  if (loading?.experiences) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error?.experiences) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error.experiences}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Experiencias Inolvidables</h1>
        <p className="mt-4 text-xl text-gray-600">Descubre actividades únicas en tu destino</p>
      </div>

      {/* Location Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar experiencias por ubicación..."
            value={searchLocation}
            onChange={handleLocationSearch}
          />
        </div>
      </div>

      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron experiencias en esta ubicación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Experiences;