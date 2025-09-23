import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/solid';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'luxury';
    }
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Set the theme on initial load
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'luxury' : 'light');
    // Save the theme to localStorage
    localStorage.setItem('theme', isDarkMode ? 'luxury' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setLoading(false);
    } else {
      setError('No user data found. Please log in.');
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  return (
    <div className="transition-colors duration-300">
      <div className="p-6 rounded-lg shadow-md relative">
        <h2 className="text-xl font-semibold font-main mb-4 flex items-center">
          <UserIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />
          Profile Details
        </h2>
        <button
          onClick={handleThemeToggle}
          className={`btn absolute top-4 right-4 w-12 h-12 rounded-full transition-all duration-300 transform ${
            isDarkMode ? 'scale-105' : 'scale-105'
          }`}
        >
          {isDarkMode ? (
            <MoonIcon className="h-6 w-6 animate-pulse" />
          ) : (
            <SunIcon className="h-6 w-6 animate-pulse" />
          )}
        </button>
        <div className="space-y-4 mt-12">
          <div className="flex items-center">
            <img
              src={user.profilepic || 'https://via.placeholder.com/32'}
              alt="Profile"
              className="h-16 w-16 rounded-full border-2 border-[#4A90E2] mr-4"
            />
            <div>
              <p className="text-lg font-bold text-gray-800 font-second">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-600 font-second">{user.email}</p>
            </div>
          </div>
          <p className="flex items-center">
            <span className="font-bold w-32 text-gray-600">First Name:</span>
            <span className="font-second">{user.firstName}</span>
          </p>
          <p className="flex items-center">
            <span className="font-bold w-32 text-gray-600">Last Name:</span>
            <span className="font-second">{user.lastName}</span>
          </p>
          <p className="flex items-center">
            <span className="font-bold w-32 text-gray-600">Email:</span>
            <a href={`mailto:${user.email}`} className="text-blue-500 hover:underline font-second">
              {user.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;