import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

function AddResources() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name) {
      setError('Name is required.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await axios.post('http://localhost:5000/api/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);
      navigate('/dashboard/resources');
      toast.success('Resource added successfully!');
    } catch (err) {
      setLoading(false);
      setError('Failed to create resource. Please check your data and try again.');
      console.error('Error creating resource:', err);
    }
  };

  return (
    <div className="p-8 font-second rounded-lg shadow-md">
      <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">Create New Resource</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Resource Details</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Resource Name</label>
            <input type="text" name="name" id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Resource Files</h2>
          <div className="mt-4">
            <input type="file" name="files" onChange={handleFileChange} multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E6F0FA] file:text-[#4A90E2] hover:file:bg-[#d1e0f3]"/>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] hover:from-[#7b4fe0] hover:to-[#3b82d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6] disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Resource'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddResources;