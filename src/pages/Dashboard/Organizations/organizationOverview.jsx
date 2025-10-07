// components/OrganizationOverview.jsx (updated)
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import {
  UsersIcon
} from "@heroicons/react/24/outline";

function OrganizationOverview() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingProjectDoc, setUploadingProjectDoc] = useState(null);
  const [projectDocFiles, setProjectDocFiles] = useState([]);
  const [projectDocType, setProjectDocType] = useState('Other');
  // New states for adding project
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'Initiated',
    currentStage: 'Planning',
    done: [],
    todo: [],
    contactPerson: { role: '', name: '', email: '', phone: '' },
  });
  const [addingProject, setAddingProject] = useState(false);
  const navigate = useNavigate();

  const fetchOrganization = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/organizations/${id}`);
      setOrganization(response.data);
    } catch (err) {
      setError("Failed to fetch organization details.");
      console.error("Error fetching organization:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [id]);

  const handleEdit = () => {
    navigate(`/dashboard/organizations/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${organization.name}? This will NOT delete associated projects or customers.`)) {
      try {
        await axios.delete(`http://localhost:5000/api/organizations/${id}`);
        toast.success('Organization deleted successfully!');
        navigate('/dashboard/organization'); 
      } catch (err) {
        toast.error('Failed to delete organization.');
        console.error("Error deleting organization:", err);
      }
    }
  };

  const handleProjectDocUpload = async (projectId) => {
    if (!projectDocFiles.length) {
      toast.error('Please select files to upload.');
      return;
    }
    setUploadingProjectDoc(projectId);
    try {
      const formData = new FormData();
      formData.append('documentType', projectDocType);
      projectDocFiles.forEach(file => {
        formData.append('files', file);
      });

      await axios.post(`http://localhost:5000/api/organizations/${id}/projects/${projectId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Documents added to project successfully!');
      setProjectDocFiles([]);
      setProjectDocType('Other');
      fetchOrganization(); // Refresh
    } catch (err) {
      toast.error('Failed to add documents to project.');
      console.error(err);
    } finally {
      setUploadingProjectDoc(null);
    }
  };

  const handleProjectFileChange = (e) => {
    setProjectDocFiles(Array.from(e.target.files));
  };

  const removeProjectFile = (index) => {
    setProjectDocFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- New handlers for projects ---
  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setNewProject(prev => ({
        ...prev,
        contactPerson: { ...prev.contactPerson, [field]: value },
      }));
    } else if (name === 'done' || name === 'todo') {
      setNewProject(prev => ({
        ...prev,
        [name]: value.split('\n').filter(task => task.trim()),
      }));
    } else {
      setNewProject(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setAddingProject(true);

    // Validation
    if (!newProject.name.trim() || !newProject.contactPerson.role.trim() || !newProject.contactPerson.name.trim()) {
      toast.error('Please fill project name and contact role/name.');
      setAddingProject(false);
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/organizations/${id}/projects`, newProject);
      toast.success('Project added successfully!');
      setNewProject({
        name: '',
        description: '',
        status: 'Initiated',
        currentStage: 'Planning',
        done: [],
        todo: [],
        contactPerson: { role: '', name: '', email: '', phone: '' },
      });
      setShowAddProject(false);
      fetchOrganization(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add project.');
      console.error(err);
    } finally {
      setAddingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:5000/api/organizations/${id}/projects/${projectId}`);
        toast.success('Project deleted successfully!');
        fetchOrganization(); // Refresh
      } catch (err) {
        toast.error('Failed to delete project.');
        console.error(err);
      }
    }
  };

  // --- Styles remain the same ---
  const statusStyle = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Lead': 'bg-yellow-100 text-yellow-800',
  };

  const projectStatusStyle = {
    'Initiated': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-gray-100 text-gray-800',
  };

  const projectStatuses = ['Initiated', 'In Progress', 'Completed', 'On Hold'];

  if (loading) {
    return <div className="p-8 font-main text-center">Loading organization details...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 font-second">
      {/* Header remains the same */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold font-main text-gray-800 flex items-center">
          <BuildingOffice2Icon className='h-8 w-8 mr-3 text-[#4A90E2]' />
          {organization.name}
        </h1>
        <div className="flex items-center space-x-2">
          <button onClick={handleEdit} title="Edit Organization" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <PencilIcon className="h-6 w-6 text-gray-400 hover:text-blue-500" />
          </button>
          <button onClick={handleDelete} title="Delete Organization" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <TrashIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
     
      <p className="text-gray-600 mb-8 flex items-center"><MapPinIcon className='h-5 w-5 mr-2' />{organization.address}</p>

      {/* Tab Navigation remains the same */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`${
              activeTab === 'contacts'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Contacts ({organization.contactDetails.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`${
              activeTab === 'documents'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Organization Documents ({organization.documents.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`${
              activeTab === 'projects'
                ? 'border-[#4A90E2] text-[#4A90E2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Projects ({organization.projects.length})
          </button>
        </nav>
      </div>

      {/* Tab Content remains the same except for projects tab */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          // Overview tab unchanged
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg shadow-md bg-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <UsersIcon className="h-5 w-5 mr-2 text-[#4A90E2]" />
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle[organization.status]}`}>
                    {organization.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Projects:</span>
                  <span className="font-semibold">{organization.projects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Contacts:</span>
                  <span className="font-semibold">{organization.contactDetails.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-semibold">{organization.documents.length}</span>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg shadow-md bg-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-[#4A90E2]" />
                Recent Activity
              </h3>
              <p className="text-sm text-gray-500">No recent activity to display.</p>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          // Contacts tab unchanged
          <div className="p-6 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2"><UserIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Key Contacts ({organization.contactDetails.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organization.contactDetails.map((contact, index) => (
                <div key={index} className='p-6 border rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow'>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg text-gray-800">{contact.name}</p>
                      <p className='text-sm text-gray-600 font-semibold mb-2'>{contact.role}</p>
                    </div>
                    <div className="flex flex-col space-y-1 text-xs text-gray-500">
                      <p className="flex items-center"><EnvelopeIcon className='h-3 w-3 mr-1' />{contact.email}</p>
                      <p className="flex items-center"><PhoneIcon className='h-3 w-3 mr-1' />{contact.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
              {organization.contactDetails.length === 0 && <p className="text-sm text-gray-500 col-span-full">No key contacts listed.</p>}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          // Documents tab unchanged
          <div className='p-6 rounded-lg shadow-md bg-white'>
            <h2 className="text-xl font-semibold mb-4 flex items-center border-b pb-2"><DocumentTextIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Organization Documents ({organization.documents.length})</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {organization.documents.length > 0 ? (
                organization.documents.map((doc, index) => (
                  <a key={index} href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" className='flex flex-col items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors hover:shadow-sm'>
                    <div className="flex justify-between items-center w-full mb-2">
                      <p className='font-medium text-gray-800'>{doc.fileName}</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800`}>
                        {doc.documentType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Click to view</p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-full">No organization documents uploaded.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className='space-y-6'>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center border-b pb-2"><BriefcaseIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Projects ({organization.projects.length})</h2>
              <button 
                onClick={() => setShowAddProject(!showAddProject)} 
                className="flex items-center text-[#4A90E2] hover:text-[#3A7BBE] text-sm font-medium transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> {showAddProject ? 'Cancel' : 'Add Project'}
              </button>
            </div>

            {/* New Project Form (toggleable) - Improved layout for better flow */}
            {showAddProject && (
              <div className="border p-6 rounded-lg bg-gray-50 space-y-6">
                <h3 className="text-xl font-medium text-gray-700 flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2 text-[#4A90E2]" />
                  Add New Project
                </h3>
                <form onSubmit={handleAddProject} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={newProject.name} 
                        onChange={handleNewProjectChange} 
                        placeholder="Enter project name"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        name="status" 
                        value={newProject.status} 
                        onChange={handleNewProjectChange} 
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                      >
                        {projectStatuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows="3" 
                      name="description" 
                      value={newProject.description} 
                      onChange={handleNewProjectChange} 
                      placeholder="Brief description of the project"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
                    <input 
                      type="text" 
                      name="currentStage" 
                      value={newProject.currentStage} 
                      onChange={handleNewProjectChange} 
                      placeholder="e.g., Planning, Development"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Done Tasks (one per line)</label>
                      <textarea 
                        rows="4" 
                        name="done" 
                        value={newProject.done.join('\n')} 
                        onChange={handleNewProjectChange} 
                        placeholder="List completed tasks&#10;One task per line"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Do Tasks (one per line)</label>
                      <textarea 
                        rows="4" 
                        name="todo" 
                        value={newProject.todo.join('\n')} 
                        onChange={handleNewProjectChange} 
                        placeholder="List pending tasks&#10;One task per line"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm resize-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
                      <UserIcon className="h-4 w-4 mr-1 text-[#4A90E2]" />
                      Project Contact Person
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                        <input 
                          type="text" 
                          name="contactPerson.role" 
                          required 
                          value={newProject.contactPerson.role} 
                          onChange={handleNewProjectChange} 
                          placeholder="e.g., Project Manager"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                        <input 
                          type="text" 
                          name="contactPerson.name" 
                          required 
                          value={newProject.contactPerson.name} 
                          onChange={handleNewProjectChange} 
                          placeholder="Full name"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          name="contactPerson.email" 
                          value={newProject.contactPerson.email} 
                          onChange={handleNewProjectChange} 
                          placeholder="user@example.com"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                        <input 
                          type="tel" 
                          name="contactPerson.phone" 
                          value={newProject.contactPerson.phone} 
                          onChange={handleNewProjectChange} 
                          placeholder="+1 (555) 123-4567"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddProject(false)} 
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={addingProject}
                      className="px-6 py-2 text-sm font-medium text-white bg-[#4A90E2] rounded-md hover:bg-[#3A7BBE] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 transition-colors"
                    >
                      {addingProject ? 'Adding...' : 'Add Project'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Projects List - Improved card layout for better readability */}
            <div className="grid grid-cols-1 gap-6">
              {organization.projects.map((project) => (
                <div key={project._id} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Header with delete button */}
                  <div className="relative p-6 border-b">
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      title="Delete Project"
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 transition-colors z-10"
                    >
                      <TrashIcon className="h-5 w-5 text-red-400 hover:text-red-600" />
                    </button>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{project.description || 'No description provided.'}</p>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${projectStatusStyle[project.status]}`}>
                            {project.status}
                          </span>
                          <span className="text-sm text-gray-500">Stage: {project.currentStage}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body: Tasks and Contact */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center text-base">
                            <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" /> 
                            Completed Tasks ({project.done.length})
                          </h4>
                          <ul className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-md">
                            {project.done.map((task, tIndex) => (
                              <li key={tIndex} className="flex items-center p-2 bg-white rounded-md shadow-sm">
                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400 flex-shrink-0" />
                                <span className="truncate">{task}</span>
                              </li>
                            ))}
                            {project.done.length === 0 && <li className="text-gray-400 italic">Nothing completed yet.</li>}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center text-base">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-yellow-500" /> 
                            Pending Tasks ({project.todo.length})
                          </h4>
                          <ul className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-md">
                            {project.todo.map((task, tIndex) => (
                              <li key={tIndex} className="flex items-center p-2 bg-white rounded-md shadow-sm">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-yellow-400 flex-shrink-0" />
                                <span className="truncate">{task}</span>
                              </li>
                            ))}
                            {project.todo.length === 0 && <li className="text-gray-400 italic">No tasks pending.</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center">Contact</h4>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-gray-900">{project.contactPerson.name}</p>
                          <p className="text-gray-600 text-xs">{project.contactPerson.role}</p>
                          <p className="text-gray-500 text-xs">{project.contactPerson.email}</p>
                          <p className="text-gray-500 text-xs">{project.contactPerson.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Documents Section */}
                  <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-1 text-[#4A90E2]" /> 
                        Project Documents ({project.documents.length})
                      </h4>
                      <button 
                        onClick={() => setUploadingProjectDoc(uploadingProjectDoc === project._id ? null : project._id)} 
                        className="text-sm text-[#4A90E2] hover:underline flex items-center transition-colors"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" /> 
                        {uploadingProjectDoc === project._id ? 'Cancel' : 'Add Document'}
                      </button>
                    </div>
                    <div className='grid grid-cols-1 gap-3 mb-4'>
                      {project.documents.length > 0 ? (
                        project.documents.map((doc, dIndex) => (
                          <a key={dIndex} href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" className='flex justify-between items-center p-3 border rounded hover:bg-white text-sm transition-colors'>
                            <span className='truncate font-medium'>{doc.fileName}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800`}>
                              {doc.documentType}
                            </span>
                          </a>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No documents yet. Add some above!</p>
                      )}
                    </div>

                    {/* Upload Form - Improved with better spacing */}
                    {uploadingProjectDoc === project._id && (
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Document Type</label>
                          <select 
                            value={projectDocType} 
                            onChange={(e) => setProjectDocType(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm text-xs"
                          >
                            {['UAT', 'PROD', 'Contract', 'Invoice', 'SOW', 'Other'].map(type => (
                              <option key={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Select Files</label>
                          <input 
                            type="file" 
                            multiple 
                            onChange={handleProjectFileChange} 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#E6F0FA] file:text-[#4A90E2]"
                          />
                        </div>
                        {projectDocFiles.length > 0 && (
                          <div className="space-y-1 max-h-24 overflow-y-auto border rounded-md p-2 bg-white">
                            {projectDocFiles.map((file, fIndex) => (
                              <div key={fIndex} className="flex justify-between items-center text-xs p-2 bg-gray-100 rounded-md">
                                <span className="truncate flex-1 mr-2">{file.name}</span>
                                <button onClick={() => removeProjectFile(fIndex)} className="text-red-500 hover:text-red-700 p-1 rounded">
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button 
                          onClick={() => handleProjectDocUpload(project._id)}
                          disabled={projectDocFiles.length === 0}
                          className="w-full px-4 py-2 bg-[#4A90E2] text-white text-sm rounded-md hover:bg-[#3A7BBE] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 transition-colors"
                        >
                          {uploadingProjectDoc === project._id && projectDocFiles.length > 0 ? 'Uploading...' : 'Upload Documents'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {organization.projects.length === 0 && !showAddProject && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No projects yet. Add your first project above!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationOverview;