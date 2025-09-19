import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  BriefcaseIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  PaperClipIcon,
  UserGroupIcon,
  PencilIcon, // <-- Import PencilIcon
  TrashIcon,   // <-- Import TrashIcon
  HeartIcon,   // <-- Import HeartIcon
} from "@heroicons/react/24/solid";

function ProjectOverview() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check if the current project is in the favorites list in localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteProjects')) || [];
    setIsFavorite(favorites.includes(id));

    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects`);
        const foundProject = response.data.find(p => p._id === id);
        if (foundProject) {
          setProject(foundProject);
        } else {
          setError("Project not found.");
        }
      } catch (err) {
        setError("Failed to fetch project details.");
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // --- HANDLERS ---
  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProjects')) || [];
    let updatedFavorites;

    if (favorites.includes(id)) {
      // Remove from favorites if it's already there
      updatedFavorites = favorites.filter(favId => favId !== id);
    } else {
      // Add to favorites if it's not
      updatedFavorites = [...favorites, id];
    }
    
    // Save the updated list back to localStorage
    localStorage.setItem('favoriteProjects', JSON.stringify(updatedFavorites));
    // Update the UI
    setIsFavorite(!isFavorite);
  };

  const handleEdit = () => {
    // Add navigation to an edit page later
    alert(`Edit project: ${project.name}`);
  };

  const handleDelete = () => {
    // Add a confirmation modal and API call later
    if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
        alert(`Deleting project: ${project.name}`);
    }
  };

  if (loading) {
    return <div className="p-8 font-main text-center">Loading project details...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }
  
  const statusStyle = {
    'Planned': 'bg-pink-100 text-pink-800',
    'Ongoing': 'bg-yellow-100 text-yellow-800',
    'In Review': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
  };

  return (
    <div className="p-8 font-second">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-main text-gray-800">{project.name}</h1>
        {/* --- Action Icons --- */}
        <div className="flex items-center space-x-2">
          <button onClick={handleToggleFavorite} title="Add to Favorites" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <HeartIcon className={`h-6 w-6 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
          </button>
          <button onClick={handleEdit} title="Edit Project" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <PencilIcon className="h-6 w-6 text-gray-400 hover:text-blue-500" />
          </button>
          <button onClick={handleDelete} title="Delete Project" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <TrashIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-8">{project.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Project Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><BriefcaseIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Details</h2>
          <div className="space-y-4">
            <p className="flex items-center">
              <span className="font-bold w-32 text-gray-600">Status:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle[project.status] || 'bg-gray-100 text-gray-800'}`}>{project.status}</span>
            </p>
            <p className="flex items-center">
              <span className="font-bold w-32 text-gray-600">Start Date:</span>
              <span>{new Date(project.startDate).toLocaleDateString()}</span>
            </p>
            <p className="flex items-center">
              <span className="font-bold w-32 text-gray-600">End Date:</span>
              <span>{new Date(project.endDate).toLocaleDateString()}</span>
            </p>
             <p className="flex items-center">
               <span className="font-bold w-32 text-gray-600">Budget:</span>
               <span>{project.budget?.currency} {project.budget?.allocated}</span>
             </p>
             <p className="flex items-center">
               <span className="font-bold w-32 text-gray-600">Cost Incurred:</span>
               <span>{project.budget?.currency} {project.budget?.costIncurred}</span>
             </p>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Milestones</h2>
          <ul className="space-y-2">
            {project.milestones.map((milestone) => (
              <li key={milestone._id} className="flex items-center">
                <span className={`h-2 w-2 rounded-full mr-3 ${milestone.completed ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className={`${milestone.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {milestone.name}
                </span>
                <span className="ml-auto text-sm text-gray-500">{new Date(milestone.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Team Members */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><UserGroupIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Team Members</h2>
          <div className="flex flex-wrap gap-2">
            {project.teamMembers.map((member, index) => (
              <span key={index} className="px-3 py-1 bg-gray-200 rounded-full text-sm">{member.name}</span>
            ))}
          </div>
        </div>
        
        {/* Files */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><PaperClipIcon className="h-6 w-6 mr-2 text-[#4A90E2]" />Files</h2>
            <ul className="space-y-2">
                {project.files.map((file) => (
                <li key={file._id} className="flex items-center text-blue-500 hover:underline">
                    <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
                    {file.fileName}
                    </a>
                    <span className="ml-auto text-sm text-gray-500">{file.fileType}</span>
                </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}

export default ProjectOverview;