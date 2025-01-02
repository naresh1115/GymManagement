import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <header className='bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg border-b border-gray-700'>
      <div className='max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>
        <button
          onClick={handleLogout}
          className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300'
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
