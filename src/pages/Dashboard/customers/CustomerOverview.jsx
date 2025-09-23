// Modified CustomerOverview component with functional edit and delete handlers
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is installed for consistency with Addcustomer
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  BriefcaseIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

function CustomerOverview() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Added for navigation after delete

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
        setCustomer(response.data);
      } catch (err) {
        setError("Failed to fetch customer details.");
        console.error("Error fetching customer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  // --- HANDLERS ---
  const handleEdit = () => {
    // Navigate to the edit page
    navigate(`/dashboard/customers/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        toast.success('Customer deleted successfully!');
        navigate('/dashboard/customers'); // Navigate back to the customer list
      } catch (err) {
        toast.error('Failed to delete customer.');
        console.error("Error deleting customer:", err);
      }
    }
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading customer details...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  const statusStyle = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Lead': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="p-8 font-second">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-main text-gray-800">{customer.name}</h1>
        <div className="flex items-center space-x-2">
          <button onClick={handleEdit} title="Edit Customer" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <PencilIcon className="h-6 w-6 text-gray-400 hover:text-blue-500" />
          </button>
          <button onClick={handleDelete} title="Delete Customer" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <TrashIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">{customer.address}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Details */}
        <div className=" p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><UserIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Contact Information</h2>
          <div className="space-y-4">
            <p className="flex items-center">
              <span className="font-bold w-32 text-gray-600">Contact Person:</span>
              <span>{customer.contactPerson}</span>
            </p>
            <p className="flex items-center">
              <span className="font-bold w-32 text-gray-600">Email:</span>
              <a href={`mailto:${customer.email}`} className="text-blue-500 hover:underline">{customer.email}</a>
            </p>
            <p className="flex items-center">
              <span className="font-bold w-32 text-gray-600">Phone:</span>
              <span>{customer.phone}</span>
            </p>
            <p className="flex items-center">
              <span className="font-bold w-32 text-gray-600">Status:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle[customer.status] || 'bg-gray-100 text-gray-800'}`}>{customer.status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerOverview;