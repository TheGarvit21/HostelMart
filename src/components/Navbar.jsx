import React, { useState } from 'react';
import { Search, User, ShoppingBag, MapPin, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold text-blue-600">HostelMart</span>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-600">0 Mins Delivery to</span>
            <div className="relative">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-blue-600 focus:outline-none"
              >
                <MapPin className="w-4 h-4" />
                <span>Select Your Location</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hostel Block A</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hostel Block B</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hostel Block C</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Campus Area</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search for 'Cakes'"
              />
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            {/* Sign In Button */}
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none">
              <User className="w-5 h-5" />
              <span>Sign in</span>
            </button>

            {/* My Cart Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <ShoppingBag className="w-5 h-5" />
              <span>My Cart</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
