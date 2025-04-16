import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Search, Map, User, Utensils } from 'lucide-react';
// Fix the import to match what your AuthContext file exports
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProfileClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
    // If authenticated, the Link will work normally
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Compass className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MoodStay</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/properties" className="text-gray-600 hover:text-gray-900">
              <Search className="h-6 w-6" />
            </Link>
            <Link to="/experiences" className="text-gray-600 hover:text-gray-900">
              <Map className="h-6 w-6" />
            </Link>
            <Link to="/restaurants" className="text-gray-600 hover:text-gray-900">
              <Utensils className="h-6 w-6" />
            </Link>
            <Link 
              to="/profile" 
              className="text-gray-600 hover:text-gray-900"
              onClick={handleProfileClick}
            >
              <User className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;