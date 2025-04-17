'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, AlertCircle, HeartHandshake, Gift, ArrowLeft, Menu, Clock, Calendar, User, Users } from 'lucide-react';

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
            : section === 'emergencies'
                ? `/api/emergencies`
                : section === 'volunteers'
                    ? `/api/volunteers`
                    : `/api/users`;
    const idKey = section === 'donations' ? 'receiptId' : section === 'users' ? 'userId' : 'requestId';

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

// Update assignee function
const updateAssignee = async (requestId, assigneeId, section) => {
    const endpoint = section === 'emergencies' ? '/api/emergencies' : '/api/supports';

    try {
        const response = await fetch(endpoint, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, assignee: assigneeId || null }),
        });

        if (!response.ok) throw new Error('Failed to update assignee');
        return await response.json();
    } catch (error) {
        console.error('Error updating assignee:', error);
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

// Calculate age function
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date('2025-04-17'); // Current date
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : null;
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
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 min-h-[200px] w-full">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-100 rounded mb-3"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
    </div>
);

// Utility functions extracted from StatusBadge
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
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'inactive':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getStatusBorderColor = (statusValue) => {
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
        case 'active':
            return 'border-green-500';
        case 'inactive':
            return 'border-gray-500';
        default:
            return 'border-gray-300';
    }
};

// Status badge component with dropdown and loader
const StatusBadge = ({ status, itemId, onStatusChange, isDonation = false, activeSection, isOpen, setIsOpen, isUpdating, setIsUpdating }) => {
    const isCompleted = status?.toLowerCase() === 'completed';

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
                onClick={() => !isDonation && !isCompleted && setIsOpen(!isOpen)}
                className={`text-sm px-2 py-1 rounded-full font-medium ${getStatusColor(status)} flex items-center ${isDonation || isCompleted ? 'cursor-default' : 'cursor-pointer'}`}
                disabled={isUpdating || isDonation || isCompleted}
            >
                {isUpdating ? (
                    <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                    </span>
                ) : (
                    <span>{status || 'Unknown'}</span>
                )}
            </button>

            {isOpen && !isDonation && !isCompleted && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <ul className="py-1">
                        {activeSection === 'volunteers' ? (
                            <>
                                <li>
                                    <button
                                        onClick={() => handleStatusUpdate('active')}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-green-700"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                        Active
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleStatusUpdate('inactive')}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-gray-700"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                                        Inactive
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Function to get data for a section
const getDataForSection = (section, emergencies, supports, donations, volunteers, users) => {
    switch (section) {
        case 'emergencies': return emergencies;
        case 'supports': return supports;
        case 'donations': return donations;
        case 'volunteers': return volunteers;
        case 'users': return users;
        default: return [];
    }
};

export default function PersonnelPage() {
    const [activeSection, setActiveSection] = useState('emergencies');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [emergencies, setEmergencies] = useState([]);
    const [supports, setSupports] = useState([]);
    const [donations, setDonations] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [users, setUsers] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeUpdate, setTimeUpdate] = useState(0);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [badgeStates, setBadgeStates] = useState({});
    const [assigneeUpdatingStates, setAssigneeUpdatingStates] = useState({});

    const router = useRouter();

    // Authorization check using session data
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await fetch('/api/auth/session');
                if (!response.ok) throw new Error('Failed to fetch session');

                const session = await response.json();
                console.log("🔍 Session data:", session);

                if (!session || !session.user) {
                    console.log("❌ No session or user, redirecting to signin...");
                    router.push('/signin?callbackUrl=/personnel');
                    return;
                }

                const userData = session.user;
                setCurrentUser(userData);

                if (userData.role === 'admin') {
                    setIsAuthorized(true);
                } else {
                    console.log("🚫 User role not admin, redirecting to homepage...");
                    setIsAuthorized(false);
                    const timer = setInterval(() => {
                        setCountdown(prev => {
                            if (prev <= 1) {
                                clearInterval(timer);
                                router.push('/');
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                    return () => clearInterval(timer);
                }
            } catch (error) {
                console.error("Error checking authorization:", error);
                router.push('/signin?callbackUrl=/personnel');
            }
        };

        checkUserRole();
    }, [router]);

    // Fetch data if authorized
    useEffect(() => {
        if (!isAuthorized) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchWithErrorHandling = async (url, errorMessage) => {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`${errorMessage}: ${res.statusText}`);
                    return await res.json();
                };

                const emergenciesData = await fetchWithErrorHandling('/api/emergencies?all=true', 'Failed to fetch emergencies');
                setEmergencies(emergenciesData);

                const supportsData = await fetchWithErrorHandling('/api/supports?all=true', 'Failed to fetch supports');
                setSupports(supportsData);

                const donationsData = await fetchWithErrorHandling('/api/donations?all=true', 'Failed to fetch donations');
                setDonations(donationsData);

                const usersData = await fetchWithErrorHandling('/api/users?all=true', 'Failed to fetch users');
                const volunteersData = await fetchWithErrorHandling('/api/volunteers?all=true', 'Failed to fetch volunteers');
                const adminUsersData = await fetchWithErrorHandling('/api/users?role=admin', 'Failed to fetch admin users');

                const mergedVolunteers = volunteersData.map((volunteer, index) => {
                    const matchingUser = usersData.find(user => user.email === volunteer.email);
                    if (!volunteer.requestId) {
                        console.warn(`Volunteer at index ${index} has no requestId:`, volunteer);
                    }
                    if (matchingUser) {
                        return {
                            ...matchingUser,
                            requestId: volunteer.requestId || matchingUser.userId || `volunteer-${index}`,
                            skills: volunteer.skills,
                            availability: volunteer.availability,
                            status: volunteer.status,
                            volunteerCreatedAt: volunteer.createdAt,
                        };
                    }
                    return {
                        ...volunteer,
                        requestId: volunteer.requestId || `volunteer-${index}`,
                    };
                });

                // Check for duplicate requestIds
                const requestIds = mergedVolunteers.map(v => v.requestId);
                const duplicates = requestIds.filter((id, index) => requestIds.indexOf(id) !== index);
                if (duplicates.length > 0) {
                    console.warn('Duplicate volunteer requestIds found:', duplicates);
                }

                setUsers(usersData);
                setVolunteers(mergedVolunteers);
                setAdminUsers(adminUsersData);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert(`Error fetching data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthorized]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeUpdate(prev => prev + 1);
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    const getIconForSection = (section) => {
        switch (section) {
            case 'emergencies': return <AlertCircle className="w-5 h-5" />;
            case 'supports': return <HeartHandshake className="w-5 h-5" />;
            case 'donations': return <Gift className="w-5 h-5" />;
            case 'volunteers': return <User className="w-5 h-5" />;
            case 'users': return <Users className="w-5 h-5" />;
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
                        case 'volunteers': {
                            const usersData = await fetch('/api/users?all=true').then(res => res.json());
                            const mergedVolunteers = updatedData.map((volunteer, index) => {
                                const matchingUser = usersData.find(user => user.email === volunteer.email);
                                if (matchingUser) {
                                    return {
                                        ...matchingUser,
                                        requestId: volunteer.requestId || matchingUser.userId || `volunteer-${index}`,
                                        skills: volunteer.skills,
                                        availability: volunteer.availability,
                                        status: volunteer.status,
                                        volunteerCreatedAt: volunteer.createdAt,
                                    };
                                }
                                return {
                                    ...volunteer,
                                    requestId: volunteer.requestId || `volunteer-${index}`,
                                };
                            });
                            setVolunteers(mergedVolunteers);
                            break;
                        }
                        case 'users': setUsers(updatedData); break;
                    }
                }
            };
            await fetchUpdatedData();
        } catch (error) {
            console.error('Failed to update status and refresh:', error);
        }
    };

    const handleAssigneeChange = async (requestId, assigneeId, section) => {
        setAssigneeUpdatingStates(prev => ({
            ...prev,
            [requestId]: true,
        }));
        try {
            await updateAssignee(requestId, assigneeId, section);
            const updatedData = await fetch(`/api/${section}?all=true`).then(res => res.json());
            if (section === 'emergencies') {
                setEmergencies(updatedData);
            } else if (section === 'supports') {
                setSupports(updatedData);
            }
        } catch (error) {
            console.error('Failed to update assignee:', error);
        } finally {
            setAssigneeUpdatingStates(prev => ({
                ...prev,
                [requestId]: false,
            }));
        }
    };

    if (!isAuthorized && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Role</h1>
                    <p className="text-gray-600 mb-6">Redirecting to homepage in {countdown} seconds...</p>
                    <Link href="/" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

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
                            {['emergencies', 'supports', 'donations', 'volunteers', 'users'].map(section => (
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
                                        {getDataForSection(section, emergencies, supports, donations, volunteers, users).length > 0 && (
                                            <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                                                {getDataForSection(section, emergencies, supports, donations, volunteers, users).length}
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
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {currentUser ? currentUser.name?.charAt(0) : 'PC'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{currentUser ? currentUser.name : 'Personnel Coordinator'}</p>
                            <p className="text-xs text-gray-500">{currentUser ? currentUser.role : 'Loading...'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
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
                                <h1 className="text-xl font-bold text-gray-900">
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
                            Active: {getDataForSection(activeSection, emergencies, supports, donations, volunteers, users).filter(item => item.status?.toLowerCase() === 'in progress' || item.status?.toLowerCase() === 'active').length}
                        </div>
                        <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                            Pending: {getDataForSection(activeSection, emergencies, supports, donations, volunteers, users).filter(item => item.status?.toLowerCase() === 'pending').length}
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex justify-center md:justify-start">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                        activeSection === 'emergencies' ? 'bg-red-50 text-red-700' :
                            activeSection === 'supports' ? 'bg-blue-50 text-blue-700' :
                                activeSection === 'donations' ? 'bg-purple-50 text-purple-700' :
                                    activeSection === 'volunteers' ? 'bg-green-50 text-green-700' :
                                        'bg-pink-50 text-pink-700'
                    }`}>
                        {getIconForSection(activeSection)}
                        <span className="ml-2 font-medium">
                            {getDataForSection(activeSection, emergencies, supports, donations, volunteers, users).length} {activeSection} to manage
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loading ? (
                        Array(6).fill().map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
                    ) : getDataForSection(activeSection, emergencies, supports, donations, volunteers, users).length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-12">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                {getIconForSection(activeSection)}
                            </div>
                            <p className="text-lg font-medium">No {activeSection} to display</p>
                            <p className="text-sm">All caught up! Check back later.</p>
                        </div>
                    ) : (
                        getDataForSection(activeSection, emergencies, supports, donations, volunteers, users)
                            .sort((a, b) => {
                                const severityOrder = { 'urgent': 1, 'critical': 1, 'pending': 2, 'in progress': 3, 'completed': 4, 'active': 3, 'inactive': 4 };
                                return severityOrder[a.status?.toLowerCase()] - severityOrder[b.status?.toLowerCase()];
                            })
                            .map((item, index) => {
                                const uniqueKey = `${item.requestId || item.userId}-${index}`;
                                const { isOpen = false, isUpdating = false } = badgeStates[uniqueKey] || {};

                                const handleToggleOpen = () => {
                                    if (!isDonation && item.status?.toLowerCase() !== 'completed') {
                                        setBadgeStates(prev => ({
                                            ...prev,
                                            [uniqueKey]: { ...prev[uniqueKey], isOpen: !isOpen }
                                        }));
                                    }
                                };

                                const handleSetUpdating = (value) => {
                                    setBadgeStates(prev => ({
                                        ...prev,
                                        [uniqueKey]: { ...prev[uniqueKey], isUpdating: value }
                                    }));
                                };

                                const assigneeUser = item.assignee ? adminUsers.find(user => user.userId === item.assignee) : null;
                                const takenBy = assigneeUser ? assigneeUser.name : item.assignee ? 'Unknown User' : 'Unassigned';

                                const userPhone = item.phone || 'N/A';
                                const requestId = item.requestId || item.receiptId || item.userId || `item-${index}`;
                                const status = item.status?.toLowerCase() || 'pending';
                                const isDonation = activeSection === 'donations';
                                const isUser = activeSection === 'users';
                                const isVolunteer = activeSection === 'volunteers';
                                const isCompleted = status === 'completed';

                                let timeRemaining = null;
                                if (item.expectedResponseTime) {
                                    timeRemaining = getTimeRemaining(item.expectedResponseTime);
                                }

                                let borderColor = '';
                                if (isUser || isVolunteer) {
                                    borderColor = item.gender?.toLowerCase() === 'male' ? 'border-blue-500' : 'border-pink-500';
                                } else {
                                    borderColor = getStatusBorderColor(status);
                                }

                                return (
                                    <div key={uniqueKey}
                                         className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor} min-h-[200px] w-full`}
                                    >
                                        <div className="p-4">
                                            {(isUser || isVolunteer) ? (
                                                <>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center">
                                                            <Image
                                                                src={item.image || '/default-profile.png'}
                                                                alt={item.name || 'Profile picture'}
                                                                className="w-10 h-10 rounded-full mr-2 object-cover"
                                                                width={40}
                                                                height={40}
                                                            />
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                                                                <p className="text-xs text-gray-500 mt-0.5">{isUser ? item.userId : item.requestId}</p>
                                                            </div>
                                                        </div>
                                                        {isVolunteer && (
                                                            <StatusBadge
                                                                status={item.status || 'active'}
                                                                itemId={requestId}
                                                                onStatusChange={handleStatusChange}
                                                                isDonation={isDonation}
                                                                activeSection={activeSection}
                                                                isOpen={isOpen}
                                                                setIsOpen={handleToggleOpen}
                                                                isUpdating={isUpdating}
                                                                setIsUpdating={handleSetUpdating}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="mb-3 space-y-1 text-xs">
                                                        <div className="flex items-start">
                                                            <span className="font-medium text-gray-700 w-20">Age:</span>
                                                            <span className="text-gray-600">{calculateAge(item.dateOfBirth) ?? 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className="font-medium text-gray-700 w-20">Gender:</span>
                                                            <span className="text-gray-600">{item.gender || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className="font-medium text-gray-700 w-20">{isUser ? 'City' : 'Location'}:</span>
                                                            <span className="text-gray-600">{item.address?.city || item.location || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className="font-medium text-gray-700 w-20">Email:</span>
                                                            <span className="text-gray-600">{item.email}</span>
                                                        </div>
                                                        {isVolunteer && (
                                                            <>
                                                                <div className="flex items-start">
                                                                    <span className="font-medium text-gray-700 w-20">Skills:</span>
                                                                    <span className="text-gray-600">
                                                                        {Array.isArray(item.skills) ? item.skills.join(', ') : item.skills || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-start">
                                                                    <span className="font-medium text-gray-700 w-20">Availability:</span>
                                                                    <span className="text-gray-600">{item.availability || 'N/A'}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="flex items-center text-gray-600 mt-1">
                                                            <span className="font-medium text-gray-700 w-20">Created:</span>
                                                            <span className="flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {formatDate(item.createdAt || item.volunteerCreatedAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm">{requestId}</h3>
                                                            {activeSection === 'emergencies' || activeSection === 'supports' ? (
                                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                                                                    <span className="font-medium mr-1">Assignee:</span>
                                                                    {item.assignee ? (
                                                                        <span className="text-gray-600">{takenBy}</span>
                                                                    ) : (
                                                                        <select
                                                                            value={item.assignee || ''}
                                                                            onChange={(e) => handleAssigneeChange(requestId, e.target.value, activeSection)}
                                                                            className="border border-gray-300 rounded-md text-xs py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                        >
                                                                            <option value="">Unassigned</option>
                                                                            <option value={currentUser?.userId}>You ({currentUser?.name})</option>
                                                                            {adminUsers
                                                                                .filter(user => user.userId !== currentUser?.userId)
                                                                                .map(user => (
                                                                                    <option key={user.userId} value={user.userId}>
                                                                                        {user.name}
                                                                                    </option>
                                                                                ))}
                                                                        </select>
                                                                    )}
                                                                    {assigneeUpdatingStates[requestId] && (
                                                                        <svg className="animate-spin h-4 w-4 ml-2 text-gray-500" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-500 mt-0.5">{item.name}</p>
                                                            )}
                                                        </div>
                                                        <StatusBadge
                                                            status={item.status}
                                                            itemId={requestId}
                                                            onStatusChange={handleStatusChange}
                                                            isDonation={isDonation}
                                                            activeSection={activeSection}
                                                            isOpen={isOpen}
                                                            setIsOpen={handleToggleOpen}
                                                            isUpdating={isUpdating}
                                                            setIsUpdating={handleSetUpdating}
                                                        />
                                                    </div>

                                                    <hr className="border-t border-gray-200 my-3" />

                                                    <div className="mb-3 space-y-1 text-xs">
                                                        {item.helpType && (
                                                            <div className="flex items-start">
                                                                <span className="font-medium text-gray-700 w-20">Help Type:</span>
                                                                <span className="text-gray-600">{item.helpType}</span>
                                                            </div>
                                                        )}
                                                        {item.disaster && (
                                                            <div className="flex items-start">
                                                                <span className="font-medium text-gray-700 w-20">Disaster:</span>
                                                                <span className="text-gray-600">{item.disaster}</span>
                                                            </div>
                                                        )}
                                                        {item.urgency && (
                                                            <div className="flex items-start">
                                                                <span className="font-medium text-gray-700 w-20">Urgency:</span>
                                                                <span className={`${
                                                                    item.urgency.toLowerCase() === 'critical' ? 'text-red-600 font-medium' : 'text-gray-600'
                                                                }`}>{item.urgency}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center text-gray-600 mt-1">
                                                            {item.createdAt && (
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-gray-700 w-20">Created:</span>
                                                                    <span className="flex items-center">
                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                        {formatDate(item.createdAt)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {item.expectedResponseTime && (
                                                            <div className="flex items-center text-gray-600">
                                                                <span className="font-medium text-gray-700 w-20">Deadline:</span>
                                                                <span className="flex items-center">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {formatDate(item.expectedResponseTime)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {timeRemaining && (
                                                            <div className="flex items-center mt-1">
                                                                <span className="font-medium text-gray-700 w-20">Time Left:</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                    timeRemaining.isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {timeRemaining.text}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.assignee && activeSection !== 'emergencies' && activeSection !== 'supports' && (
                                                            <div className="flex items-start">
                                                                <span className="font-medium text-gray-700 w-20">Assignee:</span>
                                                                <span className="text-gray-600">{takenBy}</span>
                                                            </div>
                                                        )}
                                                        {item.location && (
                                                            <div className="flex items-start">
                                                                <span className="font-medium text-gray-700 w-20">Location:</span>
                                                                <span className="text-gray-600">{item.location}</span>
                                                            </div>
                                                        )}
                                                        {(item.details || (activeSection === 'emergencies' && item.situation)) && (
                                                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-gray-700 text-xs">
                                                                <div className="font-medium mb-1">Details:</div>
                                                                <p className="line-clamp-2">{activeSection === 'emergencies' ? item.situation : item.details}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <hr className="border-t border-gray-200 my-3" />

                                            <div className="text-xs flex justify-between items-center">
                                                <span className="text-gray-700">{item.phone || 'N/A'}</span>
                                                {!isDonation && (
                                                    <button
                                                        onClick={() => handleCall(item.phone || 'N/A')}
                                                        className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${isDonation ? 'hidden' : ''}`}
                                                        disabled={!item.phone}
                                                    >
                                                        <Phone className={`w-4 h-4 mr-2 ${isDonation ? 'hidden' : ''}`} />
                                                        <span className="lg:inline-block hidden">Call {isUser ? 'User' : isVolunteer ? 'Volunteer' : 'Requester'}</span>
                                                    </button>
                                                )}
                                            </div>
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
