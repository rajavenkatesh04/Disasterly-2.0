'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, AlertCircle, HeartHandshake, Gift, ArrowLeft, Menu, Clock, Calendar, CheckCircle, XCircle, Home } from 'lucide-react';

// Improved call function that opens the dialer directly
const handleCall = (phone) => {
    const formatted = phone.replace(/\s+/g, '').replace(/-/g, '');
    window.location.href = `tel:${formatted}`;
};

// Real update status function with API call
const updateStatus = async (id, newStatus, section) => {
    const endpoint = section === 'donations'
        ? `/api/donations`
        : section === 'supports'
            ? `/api/supports`
            : `/api/emergencies`;
    const idKey = section === 'donations' ? 'receiptId' : 'requestId';

    try {
        const response = await fetch(`${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [idKey]: id, status: newStatus }),
        });

        if (!response.ok) throw new Error('Failed to update status');
        return await response.json();
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
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

// Calculate time remaining function
const getTimeRemaining = (deadline) => {
    const now = new Date();
    const target = new Date(deadline);
    const diffMs = target - now;

    if (diffMs <= 0) {
        return { text: "Overdue", isOverdue: true };
    }

    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) {
        return { text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, isOverdue: false };
    } else if (diffHrs > 0) {
        return { text: `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} left`, isOverdue: false };
    } else {
        return { text: `${diffMins} minute${diffMins !== 1 ? 's' : ''} left`, isOverdue: false };
    }
};

// Card skeleton while loading
const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
    </div>
);

// Status badge component with dropdown and loader
const StatusBadge = ({ status, itemId, onStatusChange, isDonation = false, activeSection }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const getStatusColor = (statusValue) => {
        switch (statusValue?.toLowerCase()) {
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

    const getBorderColor = (statusValue) => {
        switch (statusValue?.toLowerCase()) {
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

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            await updateStatus(itemId, newStatus, activeSection);
            onStatusChange(itemId, newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsUpdating(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => !isDonation && setIsOpen(!isOpen)}
                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(status)} flex items-center ${isDonation ? 'cursor-default' : 'cursor-pointer'}`}
                disabled={isUpdating || isDonation}
            >
                {isUpdating ? (
                    <span className="flex items-center">
                        <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                    </span>
                ) : (
                    <span>{status || 'Unknown'}</span>
                )}
            </button>

            {isOpen && !isDonation && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => handleStatusUpdate('pending')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-amber-700"
                            >
                                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                                Pending
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleStatusUpdate('in progress')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-blue-700"
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                In Progress
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleStatusUpdate('completed')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-green-700"
                            >
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                Completed
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleStatusUpdate('urgent')}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-700"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                Urgent
                            </button>
                        </li>
                    </ul>
                </div>
            )}

            <div className="hidden">{getBorderColor(status)}</div>
        </div>
    );
};

export default function PersonnelPage() {
    const [activeSection, setActiveSection] = useState('emergencies');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [emergencies, setEmergencies] = useState([]);
    const [supports, setSupports] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeUpdate, setTimeUpdate] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const emergenciesRes = await fetch('/api/emergencies?all=true');
                if (!emergenciesRes.ok) throw new Error('Failed to fetch emergencies');
                setEmergencies(await emergenciesRes.json());

                const supportsRes = await fetch('/api/supports?all=true');
                if (!supportsRes.ok) throw new Error('Failed to fetch supports');
                setSupports(await supportsRes.json());

                const donationsRes = await fetch('/api/donations?all=true');
                if (!donationsRes.ok) throw new Error('Failed to fetch donations');
                setDonations(await donationsRes.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeUpdate(prev => prev + 1);
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    const getDataForSection = () => {
        switch (activeSection) {
            case 'emergencies': return emergencies;
            case 'supports': return supports;
            case 'donations': return donations;
            default: return [];
        }
    };

    const getIconForSection = (section) => {
        switch (section) {
            case 'emergencies': return <AlertCircle className="w-5 h-5" />;
            case 'supports': return <HeartHandshake className="w-5 h-5" />;
            case 'donations': return <Gift className="w-5 h-5" />;
            default: return null;
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateStatus(id, newStatus, activeSection);
            const fetchUpdatedData = async () => {
                const response = await fetch(`/api/${activeSection}?all=true`);
                if (response.ok) {
                    const updatedData = await response.json();
                    switch (activeSection) {
                        case 'emergencies': setEmergencies(updatedData); break;
                        case 'supports': setSupports(updatedData); break;
                        case 'donations': setDonations(updatedData); break;
                    }
                }
            };
            await fetchUpdatedData();
        } catch (error) {
            console.error('Failed to update status and refresh:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col md:flex-row">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:static md:w-64 transition-transform duration-300 ease-in-out flex flex-col`}>
                <div className="p-6 flex-1">
                    <Link href="/" className="flex items-center space-x-2 mb-8">
                        <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold">P</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Personnel Panel</h2>
                    </Link>

                    <nav>
                        <div className="mb-2 text-xs font-semibold uppercase text-gray-500 tracking-wider pl-3">
                            Request Types
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
                                    <span>Emergencies</span>
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
                                    <span>Supports</span>
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
                                    <span>Donations</span>
                                    {donations.length > 0 && (
                                        <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                                            {donations.length}
                                        </span>
                                    )}
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            PC
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Personnel Coordinator</p>
                            <p className="text-xs text-gray-500">On duty</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
                                Manage and respond to {activeSection} requests
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-2">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Active: {getDataForSection().filter(item => item.status?.toLowerCase() === 'in progress').length}
                        </div>
                        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                            Pending: {getDataForSection().filter(item => item.status?.toLowerCase() === 'pending').length}
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex justify-center md:justify-start">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                        activeSection === 'emergencies' ? 'bg-red-50 text-red-700' :
                            activeSection === 'supports' ? 'bg-blue-50 text-blue-700' :
                                'bg-purple-50 text-purple-700'
                    }`}>
                        {getIconForSection(activeSection)}
                        <span className="ml-2 font-medium">
                            {getDataForSection().length} {activeSection} to manage
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill().map((_, i) => <SkeletonCard key={i} />)
                    ) : getDataForSection().length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-16">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                {getIconForSection(activeSection)}
                            </div>
                            <p className="text-lg font-medium">No {activeSection} to display</p>
                            <p className="text-sm">All caught up! Check back later.</p>
                        </div>
                    ) : (
                        getDataForSection().map((item) => {
                            const takenBy = item.takenBy || 'Unassigned';
                            const userPhone = item.phone || `+91-999-XXX-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                            const requestId = item.requestId || item.receiptId;
                            const status = item.status?.toLowerCase() || 'pending';
                            const isDonation = activeSection === 'donations';

                            let timeRemaining = null;
                            if (item.expectedResponseTime) {
                                timeRemaining = getTimeRemaining(item.expectedResponseTime);
                            }

                            let borderColor = '';
                            switch (status) {
                                case 'pending':
                                    borderColor = 'border-amber-500';
                                    break;
                                case 'in progress':
                                    borderColor = 'border-blue-500';
                                    break;
                                case 'completed':
                                    borderColor = 'border-green-500';
                                    break;
                                case 'urgent':
                                case 'critical':
                                    borderColor = 'border-red-500';
                                    break;
                                default:
                                    borderColor = 'border-gray-300';
                            }

                            return (
                                <div key={requestId}
                                     className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}
                                >
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{requestId}</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.name}
                                                </p>
                                            </div>
                                            <StatusBadge
                                                status={item.status}
                                                itemId={requestId}
                                                onStatusChange={handleStatusChange}
                                                isDonation={isDonation}
                                                activeSection={activeSection} // Pass activeSection as prop
                                            />
                                        </div>

                                        <div className="mb-4 space-y-2 text-sm">
                                            {item.type && (
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-24">Type:</span>
                                                    <span className="text-gray-600">{item.type}</span>
                                                </div>
                                            )}

                                            {item.helpType && (
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-24">Help Type:</span>
                                                    <span className="text-gray-600">{item.helpType}</span>
                                                </div>
                                            )}

                                            {item.disaster && (
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-24">Disaster:</span>
                                                    <span className="text-gray-600">{item.disaster}</span>
                                                </div>
                                            )}

                                            {item.urgency && (
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-24">Urgency:</span>
                                                    <span className={`${
                                                        item.urgency.toLowerCase() === 'critical' ? 'text-red-600 font-medium' : 'text-gray-600'
                                                    }`}>{item.urgency}</span>
                                                </div>
                                            )}

                                            <div className="flex flex-col space-y-1 mt-2 mb-1">
                                                {item.createdAt && (
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium text-gray-700 w-24">Created:</span>
                                                        <span className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {formatDate(item.createdAt)}
                                                        </span>
                                                    </div>
                                                )}

                                                {item.expectedResponseTime && (
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium text-gray-700 w-24">Deadline:</span>
                                                        <span className="flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {formatDate(item.expectedResponseTime)}
                                                        </span>
                                                    </div>
                                                )}

                                                {timeRemaining && (
                                                    <div className="flex items-center mt-1">
                                                        <span className="font-medium text-gray-700 w-24">Time Left:</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            timeRemaining.isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {timeRemaining.text}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {item.assignee && (
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-24">Assignee:</span>
                                                    <span className="text-gray-600">{takenBy}</span>
                                                </div>
                                            )}

                                            {item.location && (
                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700 w-24">Location:</span>
                                                    <span className="text-gray-600">{item.location}</span>
                                                </div>
                                            )}

                                            {item.details && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
                                                    <div className="font-medium mb-1">Details:</div>
                                                    <p className="line-clamp-2">{item.details}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-px bg-gray-100 my-4"></div>

                                        <div className="text-sm">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                <div className="mb-2 sm:mb-0">
                                                    <span className="text-gray-700">Raised by: </span>
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleCall(userPhone)}
                                                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                                                >
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    {userPhone}
                                                </button>
                                            </div>
                                            {item.email && (
                                                <div className="mt-1 text-gray-600 text-xs">
                                                    Email: {item.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-5 py-3 bg-gray-50 flex justify-between items-center">
                                        <div className="flex items-center text-xs">
                                            <span className={`flex items-center ${
                                                status === 'completed' ? 'text-green-600' :
                                                    status === 'in progress' ? 'text-blue-600' :
                                                        'text-amber-600'
                                            }`}>
                                                {status === 'completed' ? (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                ) : status === 'in progress' ? (
                                                    <Clock className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleCall(userPhone)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Call Requester
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}