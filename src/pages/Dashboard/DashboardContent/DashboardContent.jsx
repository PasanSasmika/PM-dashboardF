import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, UsersIcon, ArrowRightIcon, PaperClipIcon, HeartIcon } from "@heroicons/react/24/solid";
import ChartSection from '../../../components/ChartSections';

const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones = project.milestones?.filter(m => m.completed).length || 0;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const statusStyle = {
        'Planned': 'bg-pink-100 text-pink-800',
        'Ongoing': 'bg-yellow-100 text-yellow-800',
        'On Hold': 'bg-blue-100 text-blue-800',
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

const ResourceCard = ({ resource }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between font-second transition-shadow hover:shadow-xl">
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{resource.name}</h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
                    <div className="flex items-center">
                        <PaperClipIcon className="h-4 w-4 mr-1" />
                        <span>{resource.files.length} files</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate(`/dashboard/resources/${resource._id}`)}
                    className="p-2 rounded-full text-gray-400 hover:text-[#4A90E2] transition-colors"
                    title={`View ${resource.name}`}
                >
                    <ArrowRightIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

const DetailsCardSection = ({ projectCounts }) => {
    const cardData = [
        { title: "Planned projects", value: projectCounts.Planned || 0 },
        { title: "Ongoing projects", value: projectCounts.Ongoing || 0 },
        { title: "On Hold projects", value: projectCounts['On Hold'] || 0 },
        { title: "Completed projects", value: projectCounts.Completed || 0 },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cardData.map((card, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md font-second">
                    <div className="text-gray-600 mb-2">{card.title}</div>
                    <div className="flex items-end">
                        <div className="text-3xl font-bold">{card.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Main dashboard content component
const DashboardContent = () => {
    const [favoriteProjects, setFavoriteProjects] = useState([]);
    const [savedResources, setSavedResources] = useState([]);
    const [projectCounts, setProjectCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch all projects to get the counts
                const allProjectsResponse = await axios.get('http://localhost:5000/api/projects');
                const allProjects = allProjectsResponse.data;

                // Calculate project counts by status
                const counts = allProjects.reduce((acc, project) => {
                    acc[project.status] = (acc[project.status] || 0) + 1;
                    return acc;
                }, {});
                setProjectCounts(counts);

                // Fetch favorite project IDs and resource IDs from localStorage
                const favoriteProjectIds = JSON.parse(localStorage.getItem('favoriteProjects')) || [];
                const favoriteResourceIds = JSON.parse(localStorage.getItem('favoriteResources')) || [];

                // Filter all projects for bookmarked ones
                const bookmarkedProjectsData = allProjects.filter(project => favoriteProjectIds.includes(project._id));
                setFavoriteProjects(bookmarkedProjectsData);

                // Fetch all resources and filter for saved ones
                const resourceResponse = await axios.get('http://localhost:5000/api/resources');
                const allResources = resourceResponse.data;
                const savedResourcesData = allResources.filter(resource => favoriteResourceIds.includes(resource._id));
                setSavedResources(savedResourcesData);

            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) return <div className="p-8 font-main text-center">Loading Dashboard...</div>;
    if (error) return <div className="p-8 font-main text-center text-red-500">{error}</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">Dashboard Overview</h1>
            
            <DetailsCardSection projectCounts={projectCounts} />
            <ChartSection />

            {/* Favorite Projects Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold font-main mb-4 flex items-center">
                    <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
                    Bookmarked Projects
                </h2>
                {favoriteProjects.length > 0 ? (
                    <div className="space-y-4">
                        {favoriteProjects.map(project => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                        <p className="font-semibold">No bookmarked projects yet!</p>
                        <p className="text-sm mt-2">Click the ❤️ icon on a project's page to pin it to your dashboard.</p>
                    </div>
                )}
            </div>

            {/* Saved Resources Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold font-main mb-4 flex items-center">
                    <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
                    Saved Resources
                </h2>
                {savedResources.length > 0 ? (
                    <div className="space-y-4">
                        {savedResources.map(resource => (
                            <ResourceCard key={resource._id} resource={resource} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                        <p className="font-semibold">No saved resources yet!</p>
                        <p className="text-sm mt-2">Click the ❤️ icon on a resource's page to pin it to your dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardContent;