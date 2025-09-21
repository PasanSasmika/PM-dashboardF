import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/users/', formData);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create your Account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className='w-1/2'>
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
              <input id="firstName" name="firstName" type="text" required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                value={formData.firstName} onChange={handleChange} />
            </div>
            <div className='w-1/2'>
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
              <input id="lastName" name="lastName" type="text" required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                value={formData.lastName} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]"
              value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]"
              value={formData.password} onChange={handleChange} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button type="submit" disabled={loading}
              className="w-full px-4 py-2 text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2] disabled:opacity-50">
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#4A90E2] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
