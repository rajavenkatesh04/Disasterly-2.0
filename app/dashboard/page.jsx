"use client"
import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Activity, Users, Shield, Calendar, RefreshCw, Home, Menu } from 'lucide-react';
import { useRouter } from "next/navigation";



const DisasterlyDashboard = () => {

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for hamburger menu

    const handleHomeClick = () => {
        router.push('/'); // Redirects to the home page
    };

    // Simulate loading data
    useEffect(() => {
        const fetchData = () => {
            setTimeout(() => {
                const mockData = {
                    disasterStats: [
                        { name: 'Jan', count: 4 },
                        { name: 'Feb', count: 6 },
                        { name: 'Mar', count: 2 },
                        { name: 'Apr', count: 8 },
                        { name: 'May', count: 5 },
                        { name: 'Jun', count: 7 },
                    ],
                    disasterTypes: [
                        { name: 'Floods', value: 35 },
                        { name: 'Earthquakes', value: 20 },
                        { name: 'Wildfires', value: 25 },
                        { name: 'Hurricanes', value: 15 },
                        { name: 'Other', value: 5 },
                    ],
                    responseMetrics: [
                        { name: 'Jan', responseTime: 12, recoveryCost: 40 },
                        { name: 'Feb', responseTime: 8, recoveryCost: 60 },
                        { name: 'Mar', responseTime: 15, recoveryCost: 30 },
                        { name: 'Apr', responseTime: 6, recoveryCost: 70 },
                        { name: 'May', responseTime: 10, recoveryCost: 50 },
                        { name: 'Jun', responseTime: 9, recoveryCost: 65 },
                    ],
                    quickStats: {
                        activeDisasters: 5,
                        respondersDeployed: 243,
                        peopleAffected: 12580,
                        fundingAllocated: 2450000,
                    },
                    recentEvents: [
                        { id: 1, event: 'Tropical Storm Ana', location: 'Florida Coast', severity: 'Moderate', date: '2025-03-12', status: 'Active' },
                        { id: 2, event: 'Wildfire', location: 'Northern California', severity: 'Severe', date: '2025-03-10', status: 'Contained' },
                        { id: 3, event: 'Flash Flooding', location: 'Arizona', severity: 'Moderate', date: '2025-03-05', status: 'Recovery' },
                        { id: 4, event: 'Landslide', location: 'Washington State', severity: 'Minor', date: '2025-02-28', status: 'Resolved' },
                        { id: 5, event: 'Earthquake', location: 'Nevada', severity: 'Minor', date: '2025-02-25', status: 'Resolved' },
                    ],
                };
                setData(mockData);
                setLoading(false);
            }, 3000); // 3 second loading simulation
        };

        fetchData();
    }, []);

    // Function to refresh data
    const refreshData = () => {
        setLoading(true);
        setTimeout(() => {
            const mockData = {
                disasterStats: [
                    { name: 'Jan', count: 4 },
                    { name: 'Feb', count: 7 },
                    { name: 'Mar', count: 3 },
                    { name: 'Apr', count: 8 },
                    { name: 'May', count: 4 },
                    { name: 'Jun', count: 8 },
                ],
                disasterTypes: [
                    { name: 'Floods', value: 38 },
                    { name: 'Earthquakes', value: 18 },
                    { name: 'Wildfires', value: 25 },
                    { name: 'Hurricanes', value: 14 },
                    { name: 'Other', value: 5 },
                ],
                responseMetrics: [
                    { name: 'Jan', responseTime: 12, recoveryCost: 40 },
                    { name: 'Feb', responseTime: 8, recoveryCost: 60 },
                    { name: 'Mar', responseTime: 14, recoveryCost: 30 },
                    { name: 'Apr', responseTime: 7, recoveryCost: 70 },
                    { name: 'May', responseTime: 10, recoveryCost: 55 },
                    { name: 'Jun', responseTime: 8, recoveryCost: 65 },
                ],
                quickStats: {
                    activeDisasters: 6,
                    respondersDeployed: 251,
                    peopleAffected: 13200,
                    fundingAllocated: 2520000,
                },
                recentEvents: [
                    { id: 1, event: 'Tropical Storm Ana', location: 'Florida Coast', severity: 'Moderate', date: '2025-03-12', status: 'Active' },
                    { id: 6, event: 'Tornado Warning', location: 'Oklahoma', severity: 'Severe', date: '2025-03-16', status: 'Active' },
                    { id: 2, event: 'Wildfire', location: 'Northern California', severity: 'Severe', date: '2025-03-10', status: 'Contained' },
                    { id: 3, event: 'Flash Flooding', location: 'Arizona', severity: 'Moderate', date: '2025-03-05', status: 'Recovery' },
                    { id: 4, event: 'Landslide', location: 'Washington State', severity: 'Minor', date: '2025-02-28', status: 'Resolved' },
                ],
            };
            setData(mockData);
            setLoading(false);
        }, 1500); // Faster refresh
    };

    // Skeleton loader for cards
    const CardSkeleton = () => (
        <div className="rounded-lg bg-gray-100 p-6 shadow-md animate-pulse">
            <div className="h-4 w-16 bg-gray-300 rounded mb-4"></div>
            <div className="h-8 w-24 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-300 rounded"></div>
        </div>
    );

    // Skeleton loader for charts
    const ChartSkeleton = () => (
        <div className="rounded-lg bg-gray-100 p-6 shadow-md animate-pulse h-64">
            <div className="h-4 w-32 bg-gray-300 rounded mb-6"></div>
            <div className="flex items-end mt-8 h-40">
                <div className="h-full w-1/6 bg-gray-300 rounded mx-1"></div>
                <div className="h-3/4 w-1/6 bg-gray-300 rounded mx-1"></div>
                <div className="h-1/2 w-1/6 bg-gray-300 rounded mx-1"></div>
                <div className="h-4/5 w-1/6 bg-gray-300 rounded mx-1"></div>
                <div className="h-3/5 w-1/6 bg-gray-300 rounded mx-1"></div>
                <div className="h-2/3 w-1/6 bg-gray-300 rounded mx-1"></div>
            </div>
        </div>
    );

    // Circular skeleton for pie chart
    const PieChartSkeleton = () => (
        <div className="rounded-lg bg-gray-100 p-6 shadow-md animate-pulse h-64">
            <div className="h-4 w-32 bg-gray-300 rounded mb-6"></div>
            <div className="flex justify-center items-center h-40">
                <div className="h-32 w-32 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    );

    // Color array for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Function to determine status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-red-100 text-red-800';
            case 'Contained':
                return 'bg-amber-100 text-amber-800';
            case 'Recovery':
                return 'bg-blue-100 text-blue-800';
            case 'Resolved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Function to determine severity badge color
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Severe':
                return 'bg-red-100 text-red-800';
            case 'Moderate':
                return 'bg-amber-100 text-amber-800';
            case 'Minor':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Disasterly Dashboard</h1>

                    {/* Hamburger Menu for Mobile */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 focus:outline-none"
                        >
                            <Menu className="h-6 w-6 text-gray-800" />
                        </button>
                    </div>

                    {/* Buttons for Larger Screens */}
                    <div className="hidden lg:flex gap-4">
                        <button
                            onClick={refreshData}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {loading ? 'Refreshing...' : 'Refresh Data'}
                        </button>

                        <button
                            onClick={handleHomeClick}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </button>
                    </div>
                </div>

                {/* Hamburger Menu Content (Mobile Only) */}
                {isMenuOpen && (
                    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
                        <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
                            <div className="p-4">
                                <button
                                    onClick={refreshData}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 mb-4"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {loading ? 'Refreshing...' : 'Refresh Data'}
                                </button>

                                <button
                                    onClick={handleHomeClick}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Home
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Active Disasters</span>
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                                <div className="mt-2">
                                    <span className="text-2xl font-bold">{data.quickStats.activeDisasters}</span>
                                    <p className="text-xs text-gray-500 mt-1">Currently being monitored</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Responders</span>
                                    <Shield className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="mt-2">
                                    <span className="text-2xl font-bold">{data.quickStats.respondersDeployed}</span>
                                    <p className="text-xs text-gray-500 mt-1">Personnel in the field</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-amber-500">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">People Affected</span>
                                    <Users className="h-6 w-6 text-amber-500" />
                                </div>
                                <div className="mt-2">
                                    <span className="text-2xl font-bold">{data.quickStats.peopleAffected.toLocaleString()}</span>
                                    <p className="text-xs text-gray-500 mt-1">Requiring assistance</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Funding</span>
                                    <Activity className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="mt-2">
                                    <span className="text-2xl font-bold">${(data.quickStats.fundingAllocated / 1000000).toFixed(2)}M</span>
                                    <p className="text-xs text-gray-500 mt-1">Total allocated resources</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Disaster Frequency Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        {loading ? (
                            <ChartSkeleton />
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold mb-4">Disaster Frequency</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.disasterStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8884d8" name="Incidents" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        )}
                    </div>

                    {/* Disaster Types Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        {loading ? (
                            <PieChartSkeleton />
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold mb-4">Disaster Types</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data.disasterTypes}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.disasterTypes.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </>
                        )}
                    </div>

                    {/* Response Metrics Chart */}
                    <div className="bg-white rounded-lg p-6 shadow-md lg:col-span-2">
                        {loading ? (
                            <ChartSkeleton />
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold mb-4">Response Metrics</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.responseMetrics}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="responseTime"
                                            stroke="#8884d8"
                                            name="Avg. Response Time (hrs)"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="recoveryCost"
                                            stroke="#82ca9d"
                                            name="Recovery Cost Index"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Events Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Events</h2>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border-b pb-4 animate-pulse">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                                    </div>
                                    <div className="h-3 bg-gray-300 rounded w-3/4 mt-4"></div>
                                    <div className="h-3 bg-gray-300 rounded w-2/3 mt-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Event</th>
                                    <th className="text-left py-3 px-4">Location</th>
                                    <th className="text-left py-3 px-4">Severity</th>
                                    <th className="text-left py-3 px-4">Date</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.recentEvents.map((event) => (
                                    <tr key={event.id} className="border-b">
                                        <td className="py-3 px-4">{event.event}</td>
                                        <td className="py-3 px-4">{event.location}</td>
                                        <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                                        </td>
                                        <td className="py-3 px-4">{event.date}</td>
                                        <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisasterlyDashboard;