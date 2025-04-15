'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AlertCircle, HeartHandshake, Gift, ArrowLeft, Menu, User, Home } from 'lucide-react';

// Component for skeleton loader cards
const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4 w-full">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
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
                    setEmergencies(emergenciesData);

                    // Fetch supports for the user
                    const supportsRes = await fetch(`/api/supports?userId=${session.user.userId}`);
                    if (!supportsRes.ok) throw new Error('Failed to fetch supports');
                    const supportsData = await supportsRes.json();
                    setSupports(supportsData);

                    // Fetch donations for the user
                    const donationsRes = await fetch(`/api/donations?userId=${session.user.userId}`);
                    if (!donationsRes.ok) throw new Error('Failed to fetch donations');
                    const donationsData = await donationsRes.json();
                    setDonations(donationsData);

                    // Mock volunteering data (filter by userId if real data added)
                    setVolunteering([
                        { id: 'VOL1', event: 'Assam Floods Cleanup', date: '2025-03-15', hours: 4, userId: session.user.userId },
                        { id: 'VOL2', event: 'Kerala Relief Camp', date: '2024-12-10', hours: 6, userId: session.user.userId },
                    ].filter(v => v.userId === session.user.userId));
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [session, status]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-amber-500';
            case 'in progress':
                return 'bg-blue-500';
            case 'completed':
                return 'bg-green-500';
            case 'urgent':
            case 'critical':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
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
                return 'border-gray-400';
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

    const getDataForSection = () => {
        switch (activeSection) {
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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
                            <li>
                                <button
                                    onClick={() => setActiveSection('emergencies')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                                        activeSection === 'emergencies'
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <AlertCircle className={`w-5 h-5 ${activeSection === 'emergencies' ? 'text-indigo-500' : 'text-gray-500'}`} />
                                    <span>Emergency Requests</span>
                                    {emergencies.length > 0 && (
                                        <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                                            {emergencies.length}
                                        </span>
                                    )}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('supports')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                                        activeSection === 'supports'
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <HeartHandshake className={`w-5 h-5 ${activeSection === 'supports' ? 'text-indigo-500' : 'text-gray-500'}`} />
                                    <span>Support Requests</span>
                                    {supports.length > 0 && (
                                        <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                                            {supports.length}
                                        </span>
                                    )}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('donations')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                                        activeSection === 'donations'
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Gift className={`w-5 h-5 ${activeSection === 'donations' ? 'text-indigo-500' : 'text-gray-500'}`} />
                                    <span>Donations Made</span>
                                    {donations.length > 0 && (
                                        <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                                            {donations.length}
                                        </span>
                                    )}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('volunteering')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                                        activeSection === 'volunteering'
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <User className={`w-5 h-5 ${activeSection === 'volunteering' ? 'text-indigo-500' : 'text-gray-500'}`} />
                                    <span>Volunteering History</span>
                                    {volunteering.length > 0 && (
                                        <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                                            {volunteering.length}
                                        </span>
                                    )}
                                </button>
                            </li>
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
            <main className="flex-1 p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
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

                <div className="mb-6 flex justify-center md:justify-start">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                        activeSection === 'emergencies' ? 'bg-red-50 text-red-700' :
                            activeSection === 'supports' ? 'bg-blue-50 text-blue-700' :
                                activeSection === 'donations' ? 'bg-purple-50 text-purple-700' :
                                    'bg-indigo-50 text-indigo-700'
                    }`}>
                        {getIconForSection(activeSection)}
                        <span className="ml-2 font-medium">
                            {getDataForSection().length} {activeSection} {getDataForSection().length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>

                {/* Content Display - Now with Wider Cards */}
                <div className="space-y-6">
                    {loading ? (
                        Array(3).fill().map((_, i) => <SkeletonCard key={i} />)
                    ) : getDataForSection().length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-gray-500 py-16 bg-white rounded-xl shadow-sm">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                {getIconForSection(activeSection)}
                            </div>
                            <p className="text-lg font-medium">No {activeSection} to display</p>
                            <p className="text-sm mt-2">
                                {activeSection === 'emergencies' && (
                                    <>Need help? <Link href="/get-help" className="text-indigo-600 hover:underline">Request emergency assistance</Link></>
                                )}
                                {activeSection === 'supports' && (
                                    <>Want to help others? <Link href="/get-help" className="text-indigo-600 hover:underline">Offer support now</Link></>
                                )}
                                {activeSection === 'donations' && (
                                    <>Make a difference? <Link href="/donate" className="text-indigo-600 hover:underline">Donate now</Link></>
                                )}
                                {activeSection === 'volunteering' && (
                                    <>Ready to volunteer? <Link href="/volunteer" className="text-indigo-600 hover:underline">Check opportunities</Link></>
                                )}
                            </p>
                        </div>
                    ) : (
                        getDataForSection().map((item) => {
                            const requestId = item.requestId || item.receiptId || item.id;
                            const status = item.status?.toLowerCase() || 'pending';
                            const statusColor = getStatusColor(status);
                            const statusTextColor = getStatusTextColor(status);
                            const borderColor = getBorderColor(status);

                            // Redesigned cards with status dot indicator
                            if (activeSection === 'volunteering') {
                                return (
                                    <div key={requestId} className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex items-center">
                                                    <h3 className="font-semibold text-xl text-gray-900">{item.id}</h3>
                                                </div>
                                                <div className={`text-sm px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800`}>
                                                    {item.hours} hours
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-24">Event:</span>
                                                        <span className="text-gray-600">{item.event}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-24">Date:</span>
                                                        <span className="text-gray-600">{formatDate(item.date)}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <p className="text-blue-800 text-sm">
                                                        Thank you for your volunteer work! Your contribution is making a real difference to those affected by disasters.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <div className="text-sm text-gray-500">
                                                    Volunteer ID: {item.id}
                                                </div>
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
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex items-center">
                                                    <h3 className="font-semibold text-xl text-gray-900">{item.receiptId}</h3>
                                                </div>
                                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    ₹{item.amount}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-28">Donor:</span>
                                                        <span className="text-gray-600">{item.name}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-28">Disaster:</span>
                                                        <span className="text-gray-600">{item.disaster}</span>
                                                    </div>
                                                    {item.date && (
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-700 w-28">Date:</span>
                                                            <span className="text-gray-600">{formatDate(item.date || new Date())}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-green-50 rounded-lg p-4">
                                                    <p className="text-green-800 text-sm">
                                                        Thank you for your generous donation! Your contribution is helping those affected by {item.disaster}.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <div className="text-sm text-gray-500">
                                                    Receipt: {item.receiptId}
                                                </div>
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
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex items-center">
                                                    <div className={`h-3 w-3 rounded-full ${statusColor} mr-3`}></div>
                                                    <h3 className="font-semibold text-xl text-gray-900">{item.requestId}</h3>
                                                </div>
                                                <div className={`text-sm px-3 py-1 rounded-full font-medium ${statusTextColor} bg-opacity-20`} style={{backgroundColor: `${statusColor}25`}}>
                                                    {item.status || 'Pending'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 w-28">Requester:</span>
                                                        <span className="text-gray-600">{item.name}</span>
                                                    </div>
                                                    {item.type && (
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-700 w-28">Type:</span>
                                                            <span className="text-gray-600">{item.type}</span>
                                                        </div>
                                                    )}
                                                    {item.createdAt && (
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-700 w-28">Created:</span>
                                                            <span className="text-gray-600">{formatDate(item.createdAt)}</span>
                                                        </div>
                                                    )}
                                                    {item.location && (
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-700 w-28">Location:</span>
                                                            <span className="text-gray-600">{item.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {item.details && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
                                                        <div className="font-medium mb-1">Details:</div>
                                                        <p className="line-clamp-2">{item.details}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-5 py-3 bg-gray-50 flex justify-between items-center">
                                            <div className="text-xs text-gray-500">
                                                Reference: {item.requestId}
                                            </div>
                                            <Link
                                                href={activeSection === 'emergencies' ? "/get-help" : "/get-help"}
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