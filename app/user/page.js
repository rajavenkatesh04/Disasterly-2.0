'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  AlertCircle,
  HeartHandshake,
  Gift,
  ArrowLeft,
  Menu,
  User,
  Home,
  Phone,
  Calendar,
  Settings,
  Mail,
  MapPin,
  Cake,
  UserCheck,
  Edit,
  Save,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

// Function to handle the call functionality
const handleCall = (phone) => {
  if (!phone) return;
  const formatted = phone.replace(/\s+/g, '').replace(/-/g, '');
  window.location.href = `tel:${formatted}`;
};

// Component for skeleton loader cards
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 mb-4 min-h-[200px] w-full animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-16 bg-gray-100 rounded mb-3"></div>
    <div className="h-8 bg-gray-200 rounded"></div>
  </div>
);

// Component for account skeleton loader
const AccountSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
  </div>
);

export default function PanelPage() {
  const { data: session, status, update } = useSession();
  const [activeSection, setActiveSection] = useState('account');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [supports, setSupports] = useState([]);
  const [donations, setDonations] = useState([]);
  const [volunteering, setVolunteering] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [assignees, setAssignees] = useState({});
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    image: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: { street: '', city: '', state: '', postalCode: '', country: '' },
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch data client-side with user-specific userId
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.userId) {
      const fetchData = async () => {
        setLoading(true);
        const totalSteps = 5; // Number of API calls
        let completedSteps = 0;

        const updateProgress = () => {
          completedSteps++;
          setProgress((completedSteps / totalSteps) * 100);
        };

        const fetchWithProgress = async (url, errorMessage) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`${errorMessage}: ${res.statusText}`);
          updateProgress();
          return await res.json();
        };

        try {
          // Fetch emergencies for the user
          const emergenciesData = await fetchWithProgress(
            `/api/emergencies?userId=${session.user.userId}`,
            'Failed to fetch emergencies'
          );
          setEmergencies(emergenciesData);

          // Fetch supports for the user
          const supportsData = await fetchWithProgress(
            `/api/supports?userId=${session.user.userId}`,
            'Failed to fetch supports'
          );
          setSupports(supportsData);

          // Fetch donations for the user
          const donationsData = await fetchWithProgress(
            `/api/donations?userId=${session.user.userId}`,
            'Failed to fetch donations'
          );
          setDonations(donationsData);

          // Mock volunteering data
          setVolunteering([
            {
              id: 'VOL1',
              event: 'Assam Floods Cleanup',
              date: '2025-03-15',
              hours: 4,
              userId: session.user.userId,
            },
            {
              id: 'VOL2',
              event: 'Kerala Relief Camp',
              date: '2024-12-10',
              hours: 6,
              userId: session.user.userId,
            },
          ].filter((v) => v.userId === session.user.userId));
          updateProgress();

          // Fetch assignees for emergencies and supports
          const assigneeIds = [...emergenciesData, ...supportsData]
            .filter((item) => item.assignee)
            .map((item) => item.assignee);
          if (assigneeIds.length > 0) {
            try {
              const res = await fetch('/api/assignees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: assigneeIds }),
              });
              if (!res.ok) {
                console.warn('Failed to fetch assignees:', res.status);
                setAssignees({});
              } else {
                const data = await res.json();
                setAssignees(data.assignees || {});
              }
            } catch (error) {
              console.error('Error fetching assignees:', error);
              setAssignees({});
            }
          } else {
            setAssignees({});
          }
          updateProgress();

          // Fetch user data for account section from new endpoint
          const userDataResponse = await fetchWithProgress(
            '/api/profilethings',
            'Failed to fetch user data'
          );
          setUserData({
            name: userDataResponse.name || '',
            email: userDataResponse.email || '',
            image: userDataResponse.image || '',
            phone: userDataResponse.phone || '',
            gender: userDataResponse.gender || '',
            dateOfBirth: userDataResponse.dateOfBirth
              ? new Date(userDataResponse.dateOfBirth).toISOString().split('T')[0]
              : '',
            address: {
              street: userDataResponse.address?.street || '',
              city: userDataResponse.address?.city || '',
              state: userDataResponse.address?.state || '',
              postalCode: userDataResponse.address?.postalCode || '',
              country: userDataResponse.address?.country || '',
            },
          });
        } catch (error) {
          console.error('Error fetching data:', error);
          alert(`Error fetching data: ${error.message}`);
        } finally {
          setLoading(false);
          setProgress(100);
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
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
      case 'resolved':
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
      case 'resolved':
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
      case 'emergencies':
        return <AlertCircle className="w-5 h-5" />;
      case 'supports':
        return <HeartHandshake className="w-5 h-5" />;
      case 'donations':
        return <Gift className="w-5 h-5" />;
      case 'volunteering':
        return <User className="w-5 h-5" />;
      case 'account':
        return <Settings className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getDataForSection = (section) => {
    switch (section) {
      case 'emergencies':
        return emergencies;
      case 'supports':
        return supports;
      case 'donations':
        return donations;
      case 'volunteering':
        return volunteering;
      default:
        return [];
    }
  };

  const getEmptyMessage = (section) => {
    switch (section) {
      case 'emergencies':
        return "You haven't raised any emergency requests yet.";
      case 'supports':
        return "You haven't raised any support requests yet.";
      case 'donations':
        return "You haven't made any donations yet.";
      case 'volunteering':
        return "You haven't participated in any volunteering activities yet.";
      default:
        return "No data to display.";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDOB = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Handle user data update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profilethings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
        },
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
      setEditMode(false);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profilethings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to delete account');

      // Sign out and redirect
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      setError('Failed to delete account. Please try again.');
      console.error('Error deleting account:', error);
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center w-full max-w-4xl">
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Loading data... {Math.round(progress)}%
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6)
              .fill()
              .map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated')
    return (
      <div className="p-6 text-center text-gray-600">
        Please log in to view your panel.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col md:flex-row">
      {isSidebarOpen && activeSection === 'account' && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform ${
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
} md:translate-x-0 md:static md:w-64 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 flex-1">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-600 hover:text-gray-900"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav>
            <div className="mb-2 text-xs font-semibold uppercase text-gray-500 tracking-wider pl-3">
              My Activities
            </div>
            <ul className="space-y-1">
              {['account', 'emergencies', 'supports', 'donations', 'volunteering'].map(
                (section) => (
                  <li key={section}>
                    <button
                      onClick={() => {
                        setActiveSection(section);
                        setIsSidebarOpen(false); // Auto-close sidebar in mobile mode
                        if (section === 'account') {
                          setEditMode(false);
                          setShowDeleteConfirm(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
    activeSection === section
        ? 'bg-indigo-50 text-indigo-700 font-medium'
        : 'text-gray-700 hover:bg-gray-100'
}`}
                    >
                      {getIconForSection(section)}
                      <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                      {section !== 'account' && getDataForSection(section).length > 0 && (
                        <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                          {getDataForSection(section).length}
                        </span>
                      )}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user?.email || 'user@example.com'}
              </p>
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
                <Link
                  href="/"
                  className="hidden md:inline-flex items-center text-gray-600 hover:text-gray-900 mr-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {activeSection === 'account'
                  ? 'Manage your account details'
                  : `View your ${activeSection} history and status`}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </div>
        </div>

        {activeSection === 'account' ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            {loading ? (
              <AccountSkeleton />
            ) : (
              <>
                {showDeleteConfirm && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-medium text-red-800">
                          Delete your account?
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          This action cannot be undone. All your data, including your
                          profile, emergencies, support requests, donations, and
                          volunteering history will be permanently removed.
                        </p>
                        <div className="mt-4 flex space-x-3">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isUpdating}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                          >
                            {isUpdating ? 'Deleting...' : 'Yes, delete my account'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <div className="h-6 w-6 text-green-600 mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">{success}</h3>
                      <p className="text-xs text-green-700 mt-0.5">
                        Your profile information has been updated.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <div className="h-6 w-6 text-red-600 mr-3">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      <p className="text-xs text-red-700 mt-0.5">
                        Please try again or contact support if the issue persists.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setError('');
                      }}
                      className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center lg:w-1/3">
                    {userData.image ? (
                      <Image
                        src={userData.image}
                        alt="Profile"
                        width={200}
                        height={200}
                        className="rounded-full object-cover h-48 w-48"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-48 w-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-4xl ${
    userData.image ? 'hidden' : 'flex'
}`}
                    >
                      {userData.name?.charAt(0) || 'U'}
                    </div>
                    <div className="mt-4 w-full max-w-xs">
                      <div className="bg-indigo-50 p-4 rounded-lg text-center">
                        <p className="text-indigo-900 mt-1">
                          Please note the display picture cannot be changed as it is
                          linked to your Google account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="flex-1">
                    {!editMode ? (
                      /* Read-only mode */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-500 text-sm">
                              <User className="w-4 h-4 mr-2" />
                              <span>Full Name</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {userData.name || 'Not specified'}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-gray-500 text-sm">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>Email Address</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {userData.email || 'Not specified'}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-gray-500 text-sm">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>Phone Number</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {userData.phone || 'Not specified'}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-gray-500 text-sm">
                              <UserCheck className="w-4 h-4 mr-2" />
                              <span>Gender</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {userData.gender || 'Not specified'}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-gray-500 text-sm">
                              <Cake className="w-4 h-4 mr-2" />
                              <span>Date of Birth</span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {formatDOB(userData.dateOfBirth)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center text-gray-500 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>Address</span>
                          </div>

                          {userData.address?.street || userData.address?.city ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium text-gray-900">
                                {userData.address?.street && (
                                  <span className="block">{userData.address.street}</span>
                                )}
                                {userData.address?.city && userData.address?.state && (
                                  <span className="block">
                                    {userData.address.city}, {userData.address.state}{' '}
                                    {userData.address.postalCode}
                                  </span>
                                )}
                                {userData.address?.country && (
                                  <span className="block">{userData.address.country}</span>
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No address specified</p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Edit mode */
                      <form onSubmit={handleUpdate} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Name
                            </label>
                            <input
                              type="text"
                              value={userData.name}
                              onChange={(e) =>
                                setUserData({ ...userData, name: e.target.value })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </label>
                            <input
                              type="email"
                              value={userData.email}
                              onChange={(e) =>
                                setUserData({ ...userData, email: e.target.value })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={userData.phone}
                              onChange={(e) =>
                                setUserData({ ...userData, phone: e.target.value })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <UserCheck className="w-4 h-4 mr-2" />
                              Gender
                            </label>
                            <select
                              value={userData.gender}
                              onChange={(e) =>
                                setUserData({ ...userData, gender: e.target.value })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <Cake className="w-4 h-4 mr-2" />
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={userData.dateOfBirth}
                              onChange={(e) =>
                                setUserData({ ...userData, dateOfBirth: e.target.value })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Address
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                            <input
                              type="text"
                              placeholder="Street"
                              value={userData.address.street}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  address: { ...userData.address, street: e.target.value },
                                })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              placeholder="City"
                              value={userData.address.city}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  address: { ...userData.address, city: e.target.value },
                                })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={userData.address.state}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  address: { ...userData.address, state: e.target.value },
                                })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              placeholder="Postal Code"
                              value={userData.address.postalCode}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  address: {
                                    ...userData.address,
                                    postalCode: e.target.value,
                                  },
                                })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={userData.address.country}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  address: { ...userData.address, country: e.target.value },
                                })
                              }
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400"
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Updating...' : 'Update Profile'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center md:justify-start">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full ${
    activeSection === 'emergencies'
        ? 'bg-red-50 text-red-700'
        : activeSection === 'supports'
            ? 'bg-blue-50 text-blue-700'
            : activeSection === 'donations'
                ? 'bg-purple-50 text-purple-700'
                : 'bg-indigo-50 text-indigo-700'
}`}
              >
                {getIconForSection(activeSection)}
                <span className="ml-2 font-medium">
                  {getDataForSection(activeSection).length} {activeSection} to manage
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                Array(6)
                  .fill()
                  .map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
              ) : getDataForSection(activeSection).length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-12">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {getIconForSection(activeSection)}
                  </div>
                  <p className="text-lg font-medium">{getEmptyMessage(activeSection)}</p>
                  <p className="text-sm">Get started by exploring available options.</p>
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
                      <div
                        key={requestId}
                        className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {item.id}
                              </h3>
                            </div>
                            <div
                              className={`text-sm px-2 py-1 rounded-full font-medium ${statusColor}`}
                            >
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
                              Thank you for your volunteer work! Your contribution is
                              making a real difference to those affected by disasters.
                            </p>
                          </div>

                          <div className="text-xs flex justify-between items-center mt-4">
                            <span className="text-gray-700">Volunteer ID: {item.id}</span>
                            <Link
                              href="/volunteer"
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              View more opportunities →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (activeSection === 'donations') {
                    return (
                      <div
                        key={requestId}
                        className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {item.receiptId}
                              </h3>
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
                              <span className="font-medium text-gray-700 w-20">
                                Disaster:
                              </span>
                              <span className="text-gray-600">{item.disaster}</span>
                            </div>
                            {item.date && (
                              <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-20">Date:</span>
                                <span className="text-gray-600">
                                  {formatDate(item.date || new Date())}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-green-800 text-sm">
                              Thank you for your generous donation! Your contribution is
                              helping those affected by {item.disaster}.
                            </p>
                          </div>

                          <div className="text-xs flex justify-between items-center mt-4">
                            <span className="text-gray-700">Receipt: {item.receiptId}</span>
                            <Link
                              href="/donate"
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              Donate again →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={requestId}
                        className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${borderColor}`}
                      >
                        <div className="p-4 flex flex-col lg:flex-row">
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {item.requestId}
                                </h3>
                              </div>
                              <div
                                className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor}`}
                              >
                                {item.status || 'Pending'}
                              </div>
                            </div>

                            <hr className="border-t border-gray-200 my-3" />

                            <div className="mb-3 space-y-1 text-xs">
                              <div className="flex items-start">
                                <span className="font-medium text-gray-700 w-20">
                                  Requester:
                                </span>
                                <span className="text-gray-600">{item.name}</span>
                              </div>
                              {item.type && (
                                <div className="flex items-start">
                                  <span className="font-medium text-gray-700 w-20">
                                    Type:
                                  </span>
                                  <span className="text-gray-600">{item.type}</span>
                                </div>
                              )}
                              {item.createdAt && (
                                <div className="flex items-start">
                                  <span className="font-medium text-gray-700 w-20">
                                    Created:
                                  </span>
                                  <span className="text-gray-600">
                                    {formatDate(item.createdAt)}
                                  </span>
                                </div>
                              )}
                              {item.location && (
                                <div className="flex items-start">
                                  <span className="font-medium text-gray-700 w-20">
                                    Location:
                                  </span>
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
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`h-16 w-16 mx-auto lg:mx-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium ${
    assignee.image ? 'hidden' : 'flex'
}`}
                                >
                                  {assignee.name?.charAt(0) || 'A'}
                                </div>
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    Handled by
                                  </p>
                                  <p className="text-gray-600">
                                    {assignee.name || 'Unknown'}
                                  </p>
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
                                  <p className="text-sm font-medium text-gray-900">
                                    Handled by
                                  </p>
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
                            {activeSection === 'emergencies'
                              ? 'Request again'
                              : 'Raise request again'}
                          </Link>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}