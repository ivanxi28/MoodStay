import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-extrabold text-blue-600">Oops!</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Algo salió mal
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {error.statusText || error.message || "Ha ocurrido un error inesperado"}
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;