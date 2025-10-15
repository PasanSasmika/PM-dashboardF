import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Addcustomer() {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/customers`, customerData);
setLoading(false);
      navigate('/dashboard/customers');
      toast.success('Customer added successfully!');
    } catch (err) {
      setLoading(false);
      setError('Failed to create customer. Please check your data and try again.');
      console.error("Error creating customer:", err);
    }
  };

  return (
    <div className="p-8 font-second rounded-lg shadow-md">
      <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">Add New Customer</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Customer Details</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Customer Name</label>
            <input type="text" name="name" id="name" required value={customerData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-600">Contact Person</label>
            <input type="text" name="contactPerson" id="contactPerson" value={customerData.contactPerson} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
              <input type="email" name="email" id="email" required value={customerData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-600">Phone Number</label>
              <input type="tel" name="phone" id="phone" value={customerData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-600">Address</label>
            <textarea name="address" id="address" rows="2" value={customerData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"></textarea>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
            <select name="status" id="status" value={customerData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm">
              <option>Active</option>
              <option>Inactive</option>
              <option>Lead</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] hover:from-[#7b4fe0] hover:to-[#3b82d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6] disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Addcustomer;