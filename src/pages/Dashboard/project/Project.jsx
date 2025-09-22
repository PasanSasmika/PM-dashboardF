import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/24/solid";
import { ClockIcon, UsersIcon } from "@heroicons/react/24/outline";

function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects");
        setProjects(response.data);
      } catch (err) {
        setError("Failed to fetch projects.");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (projectId) => {
    navigate(`/dashboard/projects/${projectId}`);
  };


  if (loading) {
    return <div className="p-8 font-main text-center">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-8 font-main text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        {/* Encapsulated title and subtitle */}
        <div>
          <h1 className="text-2xl font-semibold font-main">Project Overview</h1>
          <p className="font-second text-gray-600">Track progress along all active projects</p>
        </div>
        
       <Link to="/dashboard/addproject">
        <button
          className="flex items-center bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8a5cf6]"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Project
        </button></Link>
      </div>
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => {
            const totalMilestones = project.milestones?.length || 0;
            const completedMilestones = project.milestones?.filter(m => m.completed).length || 0;
            const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
            
            const statusStyle = {
              'Planned': 'bg-pink-100 text-pink-800',
              'Ongoing': 'bg-yellow-100 text-yellow-800',
              'In Review': 'bg-blue-100 text-blue-800',
              'Completed': 'bg-green-100 text-green-800',
            };

            return (
              <div
                key={project._id}
                className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between font-second"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span className="mr-1">Due</span>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString("en-US", { month: 'short', day: '2-digit' }) : 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      <span className="mr-1">
                        {project.teamMembers.length}
                      </span> members
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle[project.status] || 'bg-gray-100 text-gray-800'}`}>
                    {project.status}
                  </span>
                  <button
                    onClick={() => handleProjectClick(project._id)} // Call the navigation function
                    className="p-2 rounded-full text-gray-400 hover:text-[#4A90E2] transition-colors"
                    aria-label={`View details for ${project.name}`}
                  >
                    <ArrowRightIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="font-second text-center text-gray-500">No projects found.</div>
        )}
      </div>
    </div>
  );
}

export default Project;
