import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast installed

function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    status: '',
    startDate: '',
    endDate: '',
    budget: {
      allocated: 0,
      currency: 'USD',
      costIncurred: 0,
    },
    milestones: [],
    teamMembers: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/projects`);
        const foundProject = response.data.find(p => p._id === id);
        if (foundProject) {
          // Format dates to YYYY-MM-DD for input fields
          foundProject.startDate = new Date(foundProject.startDate).toISOString().split('T')[0];
          foundProject.endDate = new Date(foundProject.endDate).toISOString().split('T')[0];
          setProjectData(foundProject);
        } else {
          setError("Project not found.");
        }
      } catch (err) {
        setError("Failed to fetch project details.");
        console.error("Error fetching project:", err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [name]: value,
      },
    }));
  };

  // Add more handlers for milestones and team members as needed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/projects/${id}`, projectData);
      setLoading(false);
      navigate(`/dashboard/projects/${id}`);
      toast.success('Project updated successfully!');
    } catch (err) {
      setLoading(false);
      setError('Failed to update project. Please check your data and try again.');
      console.error("Error updating project:", err);
    }
  };

  if (fetchLoading) {
    return <div className="p-8 font-main text-center">Loading project details...</div>;
  }

  return (
    <div className="p-8 font-second rounded-lg shadow-md">
      <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">Edit Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Project Details</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Project Name</label>
            <input type="text" name="name" id="name" required value={projectData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">Description</label>
            <textarea name="description" id="description" rows="3" required value={projectData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-600">Start Date</label>
              <input type="date" name="startDate" id="startDate" required value={projectData.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-600">End Date</label>
              <input type="date" name="endDate" id="endDate" required value={projectData.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
            <select name="status" id="status" value={projectData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm">
              <option>Planned</option>
              <option>Ongoing</option>
              <option>In Review</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label htmlFor="allocated" className="block text-sm font-medium text-gray-600">Allocated Budget</label>
               <input type="number" name="allocated" id="allocated" value={projectData.budget.allocated} onChange={handleBudgetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
             </div>
             <div>
               <label htmlFor="costIncurred" className="block text-sm font-medium text-gray-600">Cost Incurred</label>
               <input type="number" name="costIncurred" id="costIncurred" value={projectData.budget.costIncurred} onChange={handleBudgetChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
             </div>
          </div>
        </div>

        {/* Milestones and Team Members sections can be added here, similar to the customer form */}
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] hover:from-[#7b4fe0] hover:to-[#3b82d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6] disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProject;