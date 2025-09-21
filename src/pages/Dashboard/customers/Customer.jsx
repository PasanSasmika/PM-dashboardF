import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import { PlusIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/outline";

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/customers/");
        setCustomers(response.data);
      } catch (err) {
        setError("Failed to fetch customers.");
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerClick = (customerId) => {
    navigate(`/dashboard/customers/${customerId}`);
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading customers...</div>;
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-main">Customer Overview</h1>
          <p className="font-second text-gray-600">Manage all customer accounts and projects</p>
        </div>
        <Link to="/dashboard/addcustomer">
          <button
            className="flex items-center bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6]"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </Link>
      </div>
      <div className="space-y-4">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between font-second"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{customer.contactPerson}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{customer.projects.length}</span> projects
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle[customer.status] || 'bg-gray-100 text-gray-800'}`}>
                  {customer.status}
                </span>
                <button
                  onClick={() => handleCustomerClick(customer._id)}
                  className="p-2 rounded-full text-gray-400 hover:text-[#4A90E2] transition-colors"
                  aria-label={`View details for ${customer.name}`}
                >
                  <ArrowRightIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="font-second text-center text-gray-500">No customers found.</div>
        )}
      </div>
    </div>
  );
}

export default Customer;