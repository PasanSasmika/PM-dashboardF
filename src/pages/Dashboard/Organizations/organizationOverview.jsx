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

  // --- Existing handlers (edit, delete org, project doc upload) remain the same ---
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organization.contactDetails.map((contact, index) => (
                <div key={index} className='p-4 border rounded-lg bg-gray-50 shadow-sm'>
                  <p className="font-bold text-gray-800">{contact.name}</p>
                  <p className='text-sm text-gray-600 font-semibold mb-1'>{contact.role}</p>
                  <p className="flex items-center text-xs text-gray-500"><EnvelopeIcon className='h-3 w-3 mr-1' />{contact.email}</p>
                  <p className="flex items-center text-xs text-gray-500"><PhoneIcon className='h-3 w-3 mr-1' />{contact.phone}</p>
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
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {organization.documents.length > 0 ? (
                organization.documents.map((doc, index) => (
                  <a key={index} href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" className='flex flex-col items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors'>
                    <div className="flex justify-between items-center w-full">
                      <p className='font-medium text-gray-800'>{doc.fileName}</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800`}>
                        {doc.documentType}
                      </span>
                    </div>
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
                className="flex items-center text-[#4A90E2] hover:text-[#3A7BBE] text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> {showAddProject ? 'Cancel' : 'Add Project'}
              </button>
            </div>

            {/* New Project Form (toggleable) */}
            {showAddProject && (
              <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Add New Project</h3>
                <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Project Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={newProject.name} 
                      onChange={handleNewProjectChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status</label>
                    <select 
                      name="status" 
                      value={newProject.status} 
                      onChange={handleNewProjectChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    >
                      {projectStatuses.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <textarea 
                      rows="2" 
                      name="description" 
                      value={newProject.description} 
                      onChange={handleNewProjectChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Current Stage</label>
                    <input 
                      type="text" 
                      name="currentStage" 
                      value={newProject.currentStage} 
                      onChange={handleNewProjectChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Done (one per line)</label>
                    <textarea 
                      rows="3" 
                      name="done" 
                      value={newProject.done.join('\n')} 
                      onChange={handleNewProjectChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">To Do (one per line)</label>
                    <textarea 
                      rows="3" 
                      name="todo" 
                      value={newProject.todo.join('\n')} 
                      onChange={handleNewProjectChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold mb-2">Project Contact Person</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Role *</label>
                        <input 
                          type="text" 
                          name="contactPerson.role" 
                          required 
                          value={newProject.contactPerson.role} 
                          onChange={handleNewProjectChange} 
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Name *</label>
                        <input 
                          type="text" 
                          name="contactPerson.name" 
                          required 
                          value={newProject.contactPerson.name} 
                          onChange={handleNewProjectChange} 
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Email</label>
                        <input 
                          type="email" 
                          name="contactPerson.email" 
                          value={newProject.contactPerson.email} 
                          onChange={handleNewProjectChange} 
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Phone</label>
                        <input 
                          type="tel" 
                          name="contactPerson.phone" 
                          value={newProject.contactPerson.phone} 
                          onChange={handleNewProjectChange} 
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddProject(false)} 
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={addingProject}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#4A90E2] rounded-md hover:bg-[#3A7BBE] disabled:opacity-50"
                    >
                      {addingProject ? 'Adding...' : 'Add Project'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Projects List */}
            <div className="grid grid-cols-1 gap-6">
              {organization.projects.map((project) => (
                <div key={project._id} className="border rounded-lg p-6 bg-white shadow-sm space-y-4 relative">
                  {/* Delete button for project */}
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    title="Delete Project"
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5 text-red-400 hover:text-red-600" />
                  </button>

                  <div className="flex justify-between items-start pt-6"> {/* pt-6 to account for absolute button */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${projectStatusStyle[project.status]}`}>
                          {project.status}
                        </span>
                        <span className="text-sm text-gray-500">Stage: {project.currentStage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Details Grid (unchanged) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center"><CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />Done</h4>
                          <ul className="space-y-1 text-sm text-gray-600 max-h-32 overflow-y-auto">
                            {project.done.map((task, tIndex) => (
                              <li key={tIndex} className="flex items-center"><CheckCircleIcon className="h-3 w-3 mr-1 text-green-400" />{task}</li>
                            ))}
                            {project.done.length === 0 && <li className="text-gray-400">Nothing done yet.</li>}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center"><ExclamationTriangleIcon className="h-4 w-4 mr-1 text-yellow-500" />To Do</h4>
                          <ul className="space-y-1 text-sm text-gray-600 max-h-32 overflow-y-auto">
                            {project.todo.map((task, tIndex) => (
                              <li key={tIndex} className="flex items-center"><ExclamationTriangleIcon className="h-3 w-3 mr-1 text-yellow-400" />{task}</li>
                            ))}
                            {project.todo.length === 0 && <li className="text-gray-400">No tasks pending.</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium text-gray-700 mb-2">Project Contact</h4>
                      <p className="text-sm font-semibold">{project.contactPerson.name} - {project.contactPerson.role}</p>
                      <p className="text-xs text-gray-500">{project.contactPerson.email} | {project.contactPerson.phone}</p>
                    </div>
                  </div>

                  {/* Project Documents (unchanged) */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Project Documents ({project.documents.length})</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                      {project.documents.length > 0 ? (
                        project.documents.map((doc, dIndex) => (
                          <a key={dIndex} href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" className='flex justify-between items-center p-2 border rounded hover:bg-gray-50 text-sm'>
                            <span className='truncate'>{doc.fileName}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800`}>
                              {doc.documentType}
                            </span>
                          </a>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No project documents uploaded.</p>
                      )}
                    </div>
                  </div>

                  {/* Upload Documents to Project (unchanged) */}
                  <div className="p-3 border-t pt-4">
                    <button 
                      onClick={() => setUploadingProjectDoc(uploadingProjectDoc === project._id ? null : project._id)} 
                      className="text-sm text-[#4A90E2] hover:underline flex items-center"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1" /> {uploadingProjectDoc === project._id ? 'Cancel' : 'Add Document to Project'}
                    </button>
                    {uploadingProjectDoc === project._id && (
                      <div className="mt-3 space-y-2">
                        <select 
                          value={projectDocType} 
                          onChange={(e) => setProjectDocType(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        >
                          {['UAT', 'PROD', 'Contract', 'Invoice', 'SOW', 'Other'].map(type => (
                            <option key={type}>{type}</option>
                          ))}
                        </select>
                        <input 
                          type="file" 
                          multiple 
                          onChange={handleProjectFileChange} 
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E6F0FA] file:text-[#4A90E2]"
                        />
                        {projectDocFiles.length > 0 && (
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {projectDocFiles.map((file, fIndex) => (
                              <div key={fIndex} className="flex justify-between items-center text-xs p-1 bg-gray-100 rounded">
                                <span className="truncate">{file.name}</span>
                                <button onClick={() => removeProjectFile(fIndex)} className="text-red-500">
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button 
                          onClick={() => handleProjectDocUpload(project._id)}
                          disabled={uploadingProjectDoc !== null && projectDocFiles.length === 0}
                          className="px-3 py-1 bg-[#4A90E2] text-white text-sm rounded disabled:opacity-50"
                        >
                          {uploadingProjectDoc === project._id ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {organization.projects.length === 0 && !showAddProject && <p className="text-sm text-gray-500">No projects yet. Add one above!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationOverview;