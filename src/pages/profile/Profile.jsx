import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  LockClosedIcon,
} from '@heroicons/react/24/solid';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilepic: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        profilepic: userData.profilepic || 'https://via.placeholder.com/32',
      });
      setLoading(false);
    } else {
      setError('No user data found. Please log in.');
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  return (
    <div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold font-main mb-4 flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />
            Profile Details
          </h2>
          <div className="space-y-4">
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