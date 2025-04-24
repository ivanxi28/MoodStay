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
import CreateNew from '../pages/CreateNew';
import RestaurantDetail from '../pages/RestaurantDetail';
import PaymentConfirmation from '../pages/PaymentConfirmation';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Properties from '../pages/Properties';
import CancelBooking from '../pages/CancelBookingPage';
import PropertyDetail from '../pages/PropertyDetail';
import ProtectedRoute from '../components/ProtectedRoute';
import Restaurants from '../pages/Restaurants';
import ChatPage from '../pages/ChatPage';
import ReservationManagementPage from '../pages/ReservationManagementPage ';
import ReservationDetailsPage from '../pages/ReservationDetailsPage';
import UserRoleManagement from '../pages/UserRoleManagement';

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
        path:"/chat/:bookingId" ,
        element: <ProtectedRoute>
        <ChatPage />
        </ProtectedRoute>, 
      },
      {
        path: "properties",
        element: <Properties />,
      },
      {
        path: "reservationmanagement",
        element: <ReservationManagementPage />,
      },
      {
        path:"/reservations/:reservationId" ,
        element:<ReservationDetailsPage />,
      },
      {
        path: "user-roles",
        element: <UserRoleManagement />,
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
        path: "cancel-booking/:bookingId",
        element: (
        <ProtectedRoute>
        <CancelBooking />
        </ProtectedRoute>),
      },
      {
        path:"/create-new",
        element: <CreateNew/>,
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