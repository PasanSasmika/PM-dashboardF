import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ChartSection = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/projects');
                const projects = response.data;

                // Aggregate projects by status and month based on startDate
                const months = [];
                const currentDate = new Date();
                // Generate last 12 months for the chart
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    months.push({
                        name: date.toLocaleString('en-US', { month: 'short' }),
                        Planned: 0,
                        Ongoing: 0,
                        'On Hold': 0,
                        Completed: 0,
                    });
                }

                projects.forEach(project => {
                    const startDate = new Date(project.startDate);
                    const monthYear = startDate.toLocaleString('en-US', { month: 'short' });
                    const monthIndex = months.findIndex(m => m.name === monthYear);

                    if (monthIndex !== -1) {
                        months[monthIndex][project.status] = (months[monthIndex][project.status] || 0) + 1;
                    }
                });

                setChartData(months);
            } catch (err) {
                setError('Failed to fetch project data for chart.');
                console.error('Error fetching projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <div className="p-4 font-main text-center">Loading chart...</div>;
    if (error) return <div className="p-4 font-main text-center text-red-500">{error}</div>;

    return (
        <div className=" p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl text-gray-600 font-semibold font-main mb-4">Project Status Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <defs>
                        <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOngoing" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#facc15" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInReview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="Planned" stroke="#f472b6" fillOpacity={1} fill="url(#colorPlanned)" />
                    <Area type="monotone" dataKey="Ongoing" stroke="#facc15" fillOpacity={1} fill="url(#colorOngoing)" />
                    <Area type="monotone" dataKey="On Hold" stroke="#60a5fa" fillOpacity={1} fill="url(#colorInReview)" />
                    <Area type="monotone" dataKey="Completed" stroke="#4ade80" fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartSection;