// components/Organization.jsx (unchanged)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import { PlusIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { BriefcaseIcon, UsersIcon } from "@heroicons/react/24/outline";

function Organization() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/organizations/`);
        setOrganizations(response.data);
      } catch (err) {
        setError("Failed to fetch organizations.");
        console.error("Error fetching organizations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleOrganizationClick = (organizationId) => {
    navigate(`/dashboard/organizations/${organizationId}`);
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading organizations...</div>;
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
          <h1 className="text-2xl font-semibold font-main">Organization Overview</h1>
          <p className="font-second text-gray-600">Manage all client organizations, contacts, and projects.</p>
        </div>
        <Link to="/dashboard/addorganization">
          <button
            className="flex items-center bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6]"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Organization
          </button>
        </Link>
      </div>
      <div className="space-y-4">
        {organizations.length > 0 ? (
          organizations.map((organization) => (
            <div
              key={organization._id}
              className=" p-6 rounded-lg shadow-md flex items-center justify-between font-second"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{organization.name}</h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-1" />
                    <span>{organization.projects.length} Projects</span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>{organization.contactDetails.length} Key Contacts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle[organization.status] || 'bg-gray-100 text-gray-800'}`}>
                  {organization.status}
                </span>
                <button
                  onClick={() => handleOrganizationClick(organization._id)}
                  className="p-2 rounded-full text-gray-400 hover:text-[#4A90E2] transition-colors"
                  aria-label={`View details for ${organization.name}`}
                >
                  <ArrowRightIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="font-second text-center text-gray-500">No organizations found.</div>
        )}
      </div>
    </div>
  );
}

export default Organization;