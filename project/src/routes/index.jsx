import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import ErrorPage from '../pages/ErrorPage';
import Home from '../pages/Home';
import Payment from '../pages/Payment'; 
import Booking from '../pages/Booking';
import Experiences from '../pages/Experiences';
import ExperienceDetail from '../pages/ExperienceDetail';
import Profile from '../pages/Profile';
import RestaurantDetail from '../pages/RestaurantDetail';
import PaymentConfirmation from '../pages/PaymentConfirmation';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Properties from '../pages/Properties';
import PropertyDetail from '../pages/PropertyDetail';
import ProtectedRoute from '../components/ProtectedRoute';
import Restaurants from '../pages/Restaurants';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "properties",
        element: <Properties />,
      },
      {
        path: "properties/:id",
        element: <PropertyDetail />,
      },
      {
        path: "booking/:id",
        element: <Booking />,
      },
      {
        path: "experiences",
        element: <Experiences />,
      },
      {
        path: "restaurants",
        element: <Restaurants />,
      },
      {
        path: "restaurants/:id",
        element: <RestaurantDetail />,
      },
      {
        path: "payment/:id",
        element: <Payment />,
      },{
        path: "payment-confirmation",
        element: <PaymentConfirmation />,
      },
      {
        path: "experiences/:id",
        element: <ExperienceDetail />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;