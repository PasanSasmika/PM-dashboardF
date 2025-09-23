import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, TrashIcon, PencilIcon, HeartIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
const response = await axios.get('http://localhost:5000/api/resources');
        setResources(response.data);
      } catch (err) {
        setError('Failed to fetch resources.');
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/resources/${id}`);
        setResources(resources.filter(res => res._id !== id));
        toast.success('Resource deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete resource. Please try again.');
        console.error('Error deleting resource:', err);
      }
    }
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading resources...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 font-second">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-main ">Resources</h1>
        <Link to="/dashboard/addresources" className="inline-flex items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] hover:from-[#7b4fe0] hover:to-[#3b82d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6]">
          <PlusIcon className="h-5 w-5 mr-2" /> Add Resource
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{resource.name}</h2>
              <div className="flex space-x-2">
                <Link to={`/dashboard/resources/${resource._id}`} title="View Resource" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                  <ChevronRight className="h-5 w-5 text-gray-400 hover:text-blue-500" />
                </Link>
                <button onClick={() => handleDelete(resource._id, resource.name)} title="Delete Resource" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                  <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-gray-600">Files: {resource.files.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resources;