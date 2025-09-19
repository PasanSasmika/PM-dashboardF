import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, UsersIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
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
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between font-second transition-shadow hover:shadow-xl">
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                    <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span className="mr-1">Due:</span>
                        {project.endDate ? new Date(project.endDate).toLocaleDateString("en-US", { month: 'short', day: '2-digit' }) : 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>{project.teamMembers.length} members</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle[project.status] || 'bg-gray-100 text-gray-800'}`}>
                    {project.status}
                </span>
                <div className="w-32 h-2 rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2]" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-gray-600 font-bold w-10 text-right">{progress}%</span>
                <button
                    onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                    className="p-2 rounded-full text-gray-400 hover:text-[#4A90E2] transition-colors"
                    title={`View ${project.name}`}
                >
                    <ArrowRightIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

const DashboardContent = () => {
    const [favoriteProjects, setFavoriteProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavoriteProjects = async () => {
            try {
                const favoriteIds = JSON.parse(localStorage.getItem('favoriteProjects')) || [];
                if (favoriteIds.length === 0) {
                    setLoading(false);
                    return;
                }
                const response = await axios.get('http://localhost:5000/api/projects');
                const allProjects = response.data;
                const favorites = allProjects.filter(project => favoriteIds.includes(project._id));
                setFavoriteProjects(favorites);
            } catch (err) {
                console.error("Failed to fetch favorite projects:", err);
                setError("Could not load favorite projects.");
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteProjects();
    }, []);

    if (loading) return <div className="p-8 font-main text-center">Loading Dashboard...</div>;
    if (error) return <div className="p-8 font-main text-center text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">Dashboard Overview</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold font-main mb-4 flex items-center">
        
        Book Mark Projects
    </h2>
    {favoriteProjects.length > 0 ? (
        <div className="space-y-4">
            {favoriteProjects.map(project => (
                <ProjectCard key={project._id} project={project} />
            ))}
        </div>
    ) : (
        <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
            <p className="font-semibold">No favorite projects yet!</p>
            <p className="text-sm mt-2">Click the ❤️ icon on a project's page to pin it to your dashboard.</p>
        </div>
    )}
</div>
        </div>
    );
};

export default DashboardContent;