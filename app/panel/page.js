// pages/panel.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AlertCircle, HeartHandshake, Gift, ArrowLeft, Menu, User, Home, Phone, Calendar } from 'lucide-react';

// Function to handle the call functionality
const handleCall = (phone) => {
    if (!phone) return;
    const formatted = phone.replace(/\s+/g, '').replace(/-/g, '');
    window.location.href = `tel:${formatted}`;
};

// Component for skeleton loader cards
const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 min-h-[200px] w-full">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-100 rounded mb-3"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
    </div>
);

export default function PanelPage() {
    const { data: session, status } = useSession();
    const [activeSection, setActiveSection] = useState('emergencies');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [emergencies, setEmergencies] = useState([]);
    const [supports, setSupports] = useState([]);
    const [donations, setDonations] = useState([]);
    const [volunteering, setVolunteering] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignees, setAssignees] = useState({});

    // Fetch data client-side with user-specific userId
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.userId) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    // Fetch emergencies for the user
                    const emergenciesRes = await fetch(`/api/emergencies?userId=${session.user.userId}`);
                    if (!emergenciesRes.ok) throw new Error('Failed to fetch emergencies');
                    const emergenciesData = await emergenciesRes.json();
                    console.log('Emergencies Data:', emergenciesData); // Debug
                    setEmergencies(emergenciesData);

                    // Fetch supports for the user
                    const supportsRes = await fetch(`/api/supports?userId=${session.user.userId}`);
                    if (!supportsRes.ok) throw new Error('Failed to fetch supports');
                    const supportsData = await supportsRes.json();
                    console.log('Supports Data:', supportsData); // Debug
                    setSupports(supportsData);

                    // Fetch donations for the user
                    const donationsRes = await fetch(`/api/donations?userId=${session.user.userId}`);
                    if (!donationsRes.ok) throw new Error('Failed to fetch donations');
                    const donationsData = await donationsRes.json();
                    console.log('Donations Data:', donationsData); // Debug
                    setDonations(donationsData);

                    // Mock volunteering data
                    setVolunteering([
                        { id: 'VOL1', event: 'Assam Floods Cleanup', date: '2025-03-15', hours: 4, userId: session.user.userId },
                        { id: 'VOL2', event: 'Kerala Relief Camp', date: '2024-12-10', hours: 6, userId: session.user.userId },
                    ].filter(v => v.userId === session.user.userId));

                    // Fetch assignees for emergencies and supports
                    const assigneeIds = [...emergenciesData, ...supportsData]
                        .filter(item => item.assignee)
                        .map(item => item.assignee);
                    console.log('Assignee IDs:', assigneeIds); // Debug

                    if (assigneeIds.length > 0) {
                        try {
                            const res = await fetch('/api/assignees', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userIds: assigneeIds }),
                            });
                            console.log('Assignees API response status:', res.status); // Debug
                            if (!res.ok) {
                                console.warn('Failed to fetch assignees:', res.status);
                                setAssignees({});
                            } else {
                                const data = await res.json();
                                console.log('Assignees Data:', data); // Debug
                                setAssignees(data.assignees || {});
                            }
                        } catch (error) {
                            console.error('Error fetching assignees:', error);
                            setAssignees({});
                        }
                    } else {
                        console.log('No assignee IDs to fetch');
                        setAssignees({});
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [session, status]);

    // ... (rest of the component remains unchanged: toggleSidebar, getStatusColor, getBorderColor, getStatusTextColor, getIconForSection, getDataForSection, formatDate, and the JSX return)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'in progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'urgent':
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getBorderColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'border-amber-500';
            case 'in progress':
                return 'border-blue-500';
            case 'completed':
                return 'border-green-500';
            case 'urgent':
            case 'critical':
                return 'border-red-500';
            default:
                return 'border-gray-300';
        }
    };

    const getStatusTextColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'text-amber-800';
            case 'in progress':
                return 'text-blue-800';
            case 'completed':
                return 'text-green-800';
            case 'urgent':
            case 'critical':
                return 'text-red-800';
            default:
                return 'text-gray-800';
        }
    };

    const getIconForSection = (section) => {
        switch (section) {
            case 'emergencies': return <AlertCircle className="w-5 h-5" />;
            case 'supports': return <HeartHandshake className="w-5 h-5" />;
            case 'donations': return <Gift className="w-5 h-5" />;
            case 'volunteering': return <User className="w-5 h-5" />;
            default: return null;
        }
    };

    const getDataForSection = (section) => {
        switch (section) {
            case 'emergencies': return emergencies;
            case 'supports': return supports;
            case 'donations': return donations;
            case 'volunteering': return volunteering;
            default: return [];
        }
    };

    // Format date function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    if (status === 'loading') return <div className="p-6"><Skeleton height={400} /></div>;
    if (status === 'unauthenticated') return <div className="p-6 text-center text-gray-600">Please log in to view your panel.</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col md:flex-row">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:static md:w-64 transition-transform duration-300 ease-in-out flex flex-col`}>
                <div className="p-6 flex-1">
                    <Link href="/" className="flex items-center space-x-2 mb-8">
                        <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold">U</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
                    </Link>

                    <nav>
                        <div className="mb-2 text-xs font-semibold uppercase text-gray-500 tracking-wider pl-3">
                            My Activities
                        </div>
                        <ul className="space-y-1">
                            {['emergencies', 'supports', 'donations', 'volunteering'].map(section => (
                                <li key={section}>
                                    <button
                                        onClick={() => setActiveSection(section)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                                            activeSection === section
                                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {getIconForSection(section)}
                                        <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                                        {getDataForSection(section).length > 0 && (
                                            <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                                                {getDataForSection(section).length}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                            {session?.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{session?.user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden mr-4 text-gray-600 hover:text-gray-900"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div>
                            <div className="flex items-center">
                                <Link href="/" className="hidden md:inline-flex items-center text-gray-600 hover:text-gray-900 mr-3">
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                View your {activeSection} history and status
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-2">
                        <Link href="/" className="flex items-center bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </Link>
                    </div>
                </div>

                <div className="mb-4 flex justify-center md:justify-start">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                        activeSection === 'emergencies' ? 'bg-red-50 text-red-700' :
                            activeSection === 'supports' ? 'bg-blue-50 text-blue-700' :
                                activeSection === 'donations' ? 'bg-purple-50 text-purple-700' :
                                    'bg-indigo-50 text-indigo-700'
                    }`}>
                        {getIconForSection(activeSection)}
                        <span className="ml-2 font-medium">
                            {getDataForSection(activeSection).length} {activeSection} to manage
                        </span>
                    </div>
                </div>

                {/* Content Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loading ? (
                        Array(6).fill().map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
                    ) : getDataForSection(activeSection).length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-12">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                {getIconForSection(activeSection)}
                            </div>
                            <p className="text-lg font-medium">No {activeSection} to display</p>
                            <p className="text-sm">All caught up! Check back later.</p>
                        </div>
                    ) : (
                        getDataForSection(activeSection).map((item) => {
                            const requestId = item.requestId || item.receiptId || item.id;
                            const status = item.status?.toLowerCase() || 'pending';
                            const statusColor = getStatusColor(status);
                            const statusTextColor = getStatusTextColor(status);
                            const borderColor = getBorderColor(status);
                            const assignee = assignees[item.assignee];

                            if (activeSection === 'volunteering') {
                                return (
                                    <div key={requestId} className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center">
                                                    <h3 className="font-semibold text-gray-900 text-sm">{item.id}</h3>
                                                </div>
                                                <div className={`text-sm px-2 py-1 rounded-full font-medium ${statusColor}`}>
                                                    {item.hours} hours
                                                </div>
                                            </div>

                                            <div className="mb-3 space-y-1 text-xs">
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-20">Event:</span>
                                                    <span className="text-gray-600">{item.event}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-20">Date:</span>
                                                    <span className="text-gray-600">{formatDate(item.date)}</span>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <p className="text-blue-800 text-sm">
                                                    Thank you for your volunteer work! Your contribution is making a real difference to those affected by disasters.
                                                </p>
                                            </div>

                                            <div className="text-xs flex justify-between items-center mt-4">
                                                <span className="text-gray-700">Volunteer ID: {item.id}</span>
                                                <Link href="/volunteer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                    View more opportunities →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (activeSection === 'donations') {
                                return (
                                    <div key={requestId} className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center">
                                                    <h3 className="font-semibold text-gray-900 text-sm">{item.receiptId}</h3>
                                                </div>
                                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    ₹{item.amount}
                                                </div>
                                            </div>

                                            <div className="mb-3 space-y-1 text-xs">
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-20">Donor:</span>
                                                    <span className="text-gray-600">{item.name}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-20">Disaster:</span>
                                                    <span className="text-gray-600">{item.disaster}</span>
                                                </div>
                                                {item.date && (
                                                    <div className="flex items-start">
                                                        <span className="font-medium text-gray-700 w-20">Date:</span>
                                                        <span className="text-gray-600">{formatDate(item.date || new Date())}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-green-50 rounded-lg p-4">
                                                <p className="text-green-800 text-sm">
                                                    Thank you for your generous donation! Your contribution is helping those affected by {item.disaster}.
                                                </p>
                                            </div>

                                            <div className="text-xs flex justify-between items-center mt-4">
                                                <span className="text-gray-700">Receipt: {item.receiptId}</span>
                                                <Link href="/donate" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                    Donate again →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                // Emergency and Support requests
                                return (
                                    <div key={requestId} className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}>
                                        <div className="p-4 flex flex-col lg:flex-row">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center">
                                                        <h3 className="font-semibold text-gray-900 text-sm">{item.requestId}</h3>
                                                    </div>
                                                    <div className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor}`}>
                                                        {item.status || 'Pending'}
                                                    </div>
                                                </div>

                                                <hr className="border-t border-gray-200 my-3" />

                                                <div className="mb-3 space-y-1 text-xs">
                                                    <div className="flex items-start">
                                                        <span className="font-medium text-gray-700 w-20">Requester:</span>
                                                        <span className="text-gray-600">{item.name}</span>
                                                    </div>
                                                    {item.type && (
                                                        <div className="flex items-start">
                                                            <span className="font-medium text-gray-700 w-20">Type:</span>
                                                            <span className="text-gray-600">{item.type}</span>
                                                        </div>
                                                    )}
                                                    {item.createdAt && (
                                                        <div className="flex items-start">
                                                            <span className="font-medium text-gray-700 w-20">Created:</span>
                                                            <span className="text-gray-600">{formatDate(item.createdAt)}</span>
                                                        </div>
                                                    )}
                                                    {item.location && (
                                                        <div className="flex items-start">
                                                            <span className="font-medium text-gray-700 w-20">Location:</span>
                                                            <span className="text-gray-600">{item.location}</span>
                                                        </div>
                                                    )}
                                                    {activeSection === 'emergencies' && item.situation && (
                                                        <div className="mt-2 p-2 bg-gray-50 rounded-md text-gray-700 text-xs">
                                                            <div className="font-medium mb-1">Situation:</div>
                                                            <p className="line-clamp-2">{item.situation}</p>
                                                        </div>
                                                    )}
                                                    {activeSection === 'supports' && item.details && (
                                                        <div className="mt-2 p-2 bg-gray-50 rounded-md text-gray-700 text-xs">
                                                            <div className="font-medium mb-1">Details:</div>
                                                            <p className="line-clamp-2">{item.details}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="lg:ml-6 lg:pl-6 lg:border-l border-gray-200 flex-shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                                                {assignee ? (
                                                    <div className="text-center lg:text-left">
                                                        {assignee.image ? (
                                                            <Image
                                                                src={assignee.image}
                                                                alt={assignee.name || 'Assignee'}
                                                                width={64}
                                                                height={64}
                                                                className="h-16 w-16 mx-auto lg:mx-0 rounded-full object-cover"
                                                                onError={() => (
                                                                    <div className="h-16 w-16 mx-auto lg:mx-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                                        {assignee.name?.charAt(0) || 'A'}
                                                                    </div>
                                                                )}
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 mx-auto lg:mx-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                                {assignee.name?.charAt(0) || 'A'}
                                                            </div>
                                                        )}
                                                        <div className="mt-3">
                                                            <p className="text-sm font-medium text-gray-900">Handled by</p>
                                                            <p className="text-gray-600">{assignee.name || 'Unknown'}</p>
                                                            <button
                                                                onClick={() => handleCall(assignee.phone)}
                                                                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                disabled={!assignee.phone}
                                                            >
                                                                <Phone className="w-4 h-4 mr-2" />
                                                                <span className="lg:inline-block hidden">
                                                                    Call Assignee
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center lg:text-left">
                                                        <div className="h-16 w-16 mx-auto lg:mx-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                            ?
                                                        </div>
                                                        <div className="mt-3">
                                                            <p className="text-sm font-medium text-gray-900">Handled by</p>
                                                            <p className="text-gray-600">No assignee assigned</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                                            <div className="text-xs text-gray-500">
                                                Reference: {item.requestId}
                                            </div>
                                            <Link
                                                href={activeSection === 'emergencies' ? '/get-help' : '/get-help'}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                {activeSection === 'emergencies' ? 'Request again' : 'Raise request again'}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    )}
                </div>
            </main>
        </div>
    );
}