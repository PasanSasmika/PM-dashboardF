// components/EditOrganization.jsx (updated)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

function EditOrganization() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [organizationData, setOrganizationData] = useState({
    name: '',
    address: '',
    status: 'Active',
    contactDetails: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/organizations/${id}`);
        const { name, address, status, contactDetails } = response.data;
        // Normalize contacts if needed
        const normalizedContacts = contactDetails.map(contact => ({
          ...contact,
          role: contact.role || '',
          name: contact.name || '',
        }));
        setOrganizationData({ name, address, status, contactDetails: normalizedContacts });
      } catch (err) {
        setError("Failed to fetch organization details.");
        console.error("Error fetching organization:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOrganization();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrganizationData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContactChange = (index, e) => {
    const { name, value } = e.target;
    const newContacts = [...organizationData.contactDetails];
    newContacts[index] = { ...newContacts[index], [name]: value.trim() };
    setOrganizationData(prev => ({ ...prev, contactDetails: newContacts }));
  };

  const addContact = () => {
    setOrganizationData(prev => ({
      ...prev,
      contactDetails: [...prev.contactDetails, { role: '', name: '', email: '', phone: '' }],
    }));
  };

  const removeContact = (index) => {
    if (organizationData.contactDetails.length > 1) {
      const newContacts = organizationData.contactDetails.filter((_, i) => i !== index);
      setOrganizationData(prev => ({ ...prev, contactDetails: newContacts }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!organizationData.name.trim()) {
      setError('Organization name is required.');
      setLoading(false);
      return;
    }
    if (organizationData.contactDetails.some(contact => !contact.role.trim() || !contact.name.trim())) {
      setError('All contacts must have role and name filled.');
      setLoading(false);
      return;
    }

    try {
      // Send only org fields (no projects to avoid overwriting)
      const { projects, documents, ...updateData } = organizationData;
      await axios.put(`http://localhost:5000/api/organizations/${id}`, updateData);
      
      setLoading(false);
      navigate(`/dashboard/organizations/${id}`);
      toast.success('Organization updated successfully!');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to update organization.');
      console.error("Error updating organization:", err);
    }
  };

  if (fetchLoading) {
    return <div className="p-8 font-main text-center">Loading organization details...</div>;
  }
  
  if (error && !loading) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 font-second rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">Edit Organization: {organizationData.name}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- Organization Details --- */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Primary Details</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Organization Name *</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              required 
              value={organizationData.name} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-600">Address</label>
            <textarea 
              name="address" 
              id="address" 
              rows="2" 
              value={organizationData.address} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
            <select 
              name="status" 
              id="status" 
              value={organizationData.status} 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Lead</option>
            </select>
          </div>
        </div>

        {/* --- Contact Details --- (same as AddOrganization) */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex justify-between items-center">
            Key Contacts ({organizationData.contactDetails.length})
            <button type="button" onClick={addContact} className="text-[#4A90E2] hover:text-[#3A7BBE] text-sm font-medium flex items-center">
              <PlusIcon className="h-4 w-4 mr-1" /> Add Contact
            </button>
          </h2>
          {organizationData.contactDetails.map((contact, index) => (
            <div key={index} className="border p-3 rounded-lg bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium text-gray-700">Contact #{index + 1}</h3>
                {organizationData.contactDetails.length > 1 && (
                  <button type="button" onClick={() => removeContact(index)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Role *</label>
                  <input 
                    type="text" 
                    name="role" 
                    required 
                    value={contact.role} 
                    onChange={(e) => handleContactChange(index, e)} 
                    placeholder="e.g., Finance Manager" 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={contact.name} 
                    onChange={(e) => handleContactChange(index, e)} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={contact.email} 
                    onChange={(e) => handleContactChange(index, e)} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={contact.phone} 
                    onChange={(e) => handleContactChange(index, e)} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {error && <p className="text-red-500 text-sm p-3 bg-red-50 rounded-md">{error}</p>}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading || !organizationData.name.trim()}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] hover:from-[#7b4fe0] hover:to-[#3b82d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Organization'}
          </button>
        </div>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">Projects are managed separately in the organization overview for easier handling of multiples.</p>
    </div>
  );
}

export default EditOrganization;