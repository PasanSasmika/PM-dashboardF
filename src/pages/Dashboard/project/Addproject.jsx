import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

function Addproject() {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    status: 'Planned',
    startDate: '',
    endDate: '',
    budget: {
      allocated: 0,
      currency: 'LKR',
      costIncurred: 0,
    },
  });
  const [teamMembers, setTeamMembers] = useState([{ name: '' }]);
  const [milestones, setMilestones] = useState([{ name: '', date: '' }]);
  const [files, setFiles] = useState([]); // Changed to array for multiple files
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Handlers for Project Data ---
  const handleProjectDataChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      budget: { ...prev.budget, [name]: value }
    }));
  };

  // --- Handlers for Team Members ---
  const handleMemberChange = (index, event) => {
    const newMembers = [...teamMembers];
    newMembers[index].name = event.target.value;
    setTeamMembers(newMembers);
  };

  const addMember = () => {
    setTeamMembers([...teamMembers, { name: '' }]);
  };

  const removeMember = (index) => {
    const newMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(newMembers);
  };

  // --- Handlers for Milestones ---
  const handleMilestoneChange = (index, event) => {
    const newMilestones = [...milestones];
    newMilestones[index][event.target.name] = event.target.value;
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { name: '', date: '' }]);
  };

  const removeMilestone = (index) => {
    const newMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(newMilestones);
  };
  
  // --- File Handler ---
  const handleFileChange = (e) => {
    setFiles(e.target.files); // Store all selected files
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalProjectData = {
      ...projectData,
      teamMembers,
      milestones,
    };
    
    const formData = new FormData();
    formData.append('projectData', JSON.stringify(finalProjectData));
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]); // Append each file
    }

    try {
await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/projects`, formData, {
          headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);
      navigate('/dashboard/projects'); 
      toast.success('Project added successfully!');
    } catch (err) {
      setLoading(false);
      setError('Failed to create project. Please check your data and try again.');
      console.error("Error creating project:", err);
    }
  };

  return (
    <div className="p-8 font-second  rounded-lg shadow-md">
      <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">Create New Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Details */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Project Details</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600">Project Name</label>
              <input type="text" name="name" id="name" required value={projectData.name} onChange={handleProjectDataChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-600">Description</label>
              <textarea name="description" id="description" rows="3" value={projectData.description} onChange={handleProjectDataChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-600">Status</label>
                  <select name="status" id="status" value={projectData.status} onChange={handleProjectDataChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm">
                    <option>Planned</option>
                    <option>Ongoing</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-600">Start Date</label>
                  <input type="date" name="startDate" id="startDate" required value={projectData.startDate} onChange={handleProjectDataChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-600">End Date</label>
                  <input type="date" name="endDate" id="endDate" required value={projectData.endDate} onChange={handleProjectDataChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
                </div>
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

        {/* Team Members */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Team Members</h2>
          {teamMembers.map((member, index) => (
            <div key={index} className="flex items-center gap-4 mt-4">
              <input type="text" placeholder="Member Name" value={member.name} onChange={(e) => handleMemberChange(index, e)} className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
              <button type="button" onClick={() => removeMember(index)} className="p-2 text-red-500 hover:text-red-700">
                <TrashIcon className="h-5 w-5"/>
              </button>
            </div>
          ))}
          <button type="button" onClick={addMember} className="mt-4 flex items-center text-sm font-medium text-[#4A90E2] hover:text-[#357ABD]">
            <PlusIcon className="h-5 w-5 mr-1"/> Add Member
          </button>
        </div>
        
        {/* Milestones */}
        <div>
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Milestones</h2>
            {milestones.map((milestone, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-center">
                    <div className="md:col-span-2">
                        <input type="text" name="name" placeholder="Milestone Name" required value={milestone.name} onChange={(e) => handleMilestoneChange(index, e)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="date" name="date" required value={milestone.date} onChange={(e) => handleMilestoneChange(index, e)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"/>
                        <button type="button" onClick={() => removeMilestone(index)} className="p-2 text-red-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </div>
            ))}
            <button type="button" onClick={addMilestone} className="mt-4 flex items-center text-sm font-medium text-[#4A90E2] hover:text-[#357ABD]">
                <PlusIcon className="h-5 w-5 mr-1"/> Add Milestone
            </button>
        </div>

        {/* File Upload */}
        <div>
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Project Files</h2> {/* Pluralized for clarity */}
            <div className="mt-4">
                <input type="file" name="files" onChange={handleFileChange} multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E6F0FA] file:text-[#4A90E2] hover:file:bg-[#d1e0f3]"/>
            </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        {/* Submit Button */}
        <div className="flex justify-end">
            <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] hover:from-[#7b4fe0] hover:to-[#3b82d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6] disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Project'}
            </button>
        </div>
      </form>
    </div>
  );
}

export default Addproject;