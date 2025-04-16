import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Users, CreditCard } from 'lucide-react';

function Booking() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detalles de la Propiedad */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"
              alt="Propiedad"
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-gray-600">Calle Ejemplo 123, Ciudad, País</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Villa de Lujo Frente al Mar</h1>
              <p className="mt-2 text-gray-600">
                Experimenta el lujo en esta impresionante villa frente al mar con vistas panorámicas al océano.
                Esta espaciosa propiedad cuenta con comodidades modernas y acceso directo a la playa.
              </p>
              
              <div className="mt-6 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900">Comodidades</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="ml-2">Hasta 6 huéspedes</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="ml-2">Cancelación flexible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Reserva */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900">Reserva tu estancia</h2>
            <p className="mt-2 text-gray-600">$299 por noche</p>

            <form className="mt-6 space-y-4">
              <div>
                <label htmlFor="check-in" className="block text-sm font-medium text-gray-700">Entrada</label>
                <input
                  type="date"
                  id="check-in"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="check-out" className="block text-sm font-medium text-gray-700">Salida</label>
                <input
                  type="date"
                  id="check-out"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700">Huéspedes</label>
                <select
                  id="guests"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option>1 huésped</option>
                  <option>2 huéspedes</option>
                  <option>3 huéspedes</option>
                  <option>4 huéspedes</option>
                  <option>5 huéspedes</option>
                  <option>6 huéspedes</option>
                </select>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">$598</span>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Reservar Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;