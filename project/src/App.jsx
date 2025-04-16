import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import router from './routes/index';
import { AppProvider } from './context/AppContext';

const queryClient = new QueryClient();

function App() {
  return (
    <AppProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
    </AppProvider>
  );
}

export default App;