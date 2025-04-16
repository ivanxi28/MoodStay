import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { useAppContext } from '../context/AppContext';

function Home() {
  const { 
    featuredAccommodations, 
    loading: { featuredAccommodations: loading }, 
    fetchFeaturedAccommodations 
  } = useAppContext();

  useEffect(() => {
    fetchFeaturedAccommodations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Encuentra tu perfecto</span>
          <span className="block text-blue-600">hogar lejos de casa</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Descubre y reserva alojamientos únicos en todo el mundo. Desde cabañas acogedoras hasta apartamentos de lujo, encuentra el lugar perfecto para tu próxima aventura.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              to="/properties"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Comenzar a explorar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Featured Properties Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Alojamientos Destacados</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : featuredAccommodations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAccommodations.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Fallback properties if API fails */}
            {[
              {
                id: 1,
                title: 'Villa con vistas al mar',
                description: 'Hermosa villa con impresionantes vistas al mar Mediterráneo.',
                location: 'Marbella, España',
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
                price: 250,
                rating: 4.9,
                reviews: 48,
                capacity: 6,
                propertyType: 'Villa'
              },
              {
                id: 2,
                title: 'Apartamento en el centro',
                description: 'Moderno apartamento ubicado en el corazón de la ciudad.',
                location: 'Barcelona, España',
                image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
                price: 120,
                rating: 4.7,
                reviews: 36,
                capacity: 4,
                propertyType: 'Apartamento'
              },
              {
                id: 3,
                title: 'Cabaña en el bosque',
                description: 'Acogedora cabaña rodeada de naturaleza para una escapada tranquila.',
                location: 'Asturias, España',
                image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200',
                price: 95,
                rating: 4.8,
                reviews: 29,
                capacity: 2,
                propertyType: 'Cabaña'
              }
            ].map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link 
            to="/properties" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Ver todos los alojamientos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          {
            title: 'Propiedades Verificadas',
            description: 'Cada alojamiento está verificado por calidad y seguridad.',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400'
          },
          {
            title: 'Experiencias Locales',
            description: 'Descubre actividades y tours únicos en tu destino.',
            image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=400'
          },
          {
            title: 'Garantía de Mejor Precio',
            description: 'Encuentra las mejores tarifas para tu estancia, garantizado.',
            image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=400'
          }
        ].map((feature, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={feature.image} alt={feature.title} className="h-48 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-base text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;