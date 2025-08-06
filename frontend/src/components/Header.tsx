import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Zestly</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
              Buy
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
              Rent
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
              Sell
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
              Agents
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
              About
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600 font-medium">
              Sign In
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                Buy
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                Rent
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                Sell
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                Agents
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
                About
              </a>
              <div className="pt-4 border-t space-y-2">
                <button className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium">
                  Sign In
                </button>
                <button className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;