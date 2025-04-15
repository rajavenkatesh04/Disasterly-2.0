'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Component for skeleton loader rows
const SkeletonRow = () => (
    <tr>
        <td className="px-6 py-4"><Skeleton width={100} /></td>
        <td className="px-6 py-4"><Skeleton width={150} /></td>
        <td className="px-6 py-4"><Skeleton width={120} /></td>
        <td className="px-6 py-4"><Skeleton width={80} /></td>
    </tr>
);

export default function PanelPage() {
    const { data: session, status } = useSession();
    const [activeSection, setActiveSection] = useState('emergencies');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [emergencies, setEmergencies] = useState([]);
    const [supports, setSupports] = useState([]);
    const [donations, setDonations] = useState([]);
    const [volunteering, setVolunteering] = useState([]);
    const [loading, setLoading] = useState(true);

    // Note: Fetching data client-side with user-specific email
    // - useSession() provides the logged-in user's email
    // - Fetch only when session is loaded (status === 'authenticated')
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    // Fetch emergencies for the user
                    const emergenciesRes = await fetch(`/api/emergencies?email=${session.user.email}`);
                    if (!emergenciesRes.ok) throw new Error('Failed to fetch emergencies');
                    const emergenciesData = await emergenciesRes.json();
                    setEmergencies(emergenciesData);

                    // Fetch supports for the user
                    const supportsRes = await fetch(`/api/supports?email=${session.user.email}`);
                    if (!supportsRes.ok) throw new Error('Failed to fetch supports');
                    const supportsData = await supportsRes.json();
                    setSupports(supportsData);

                    // Fetch donations for the user
                    const donationsRes = await fetch(`/api/donations?email=${session.user.email}`);
                    if (!donationsRes.ok) throw new Error('Failed to fetch donations');
                    const donationsData = await donationsRes.json();
                    setDonations(donationsData);

                    // Mock volunteering data (filter by email if real data added)
                    setVolunteering([
                        { id: 'VOL1', event: 'Assam Floods Cleanup', date: '2025-03-15', hours: 4, email: session.user.email },
                        { id: 'VOL2', event: 'Kerala Relief Camp', date: '2024-12-10', hours: 6, email: session.user.email },
                    ].filter(v => v.email === session.user.email));
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [session, status]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    if (status === 'loading') return <div className="p-6"><Skeleton height={400} /></div>;
    if (status === 'unauthenticated') return <div className="p-6 text-center text-gray-600">Please log in to view your panel.</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar (Desktop) */}
                <aside className="hidden md:block w-64 bg-white shadow-lg h-screen fixed">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-indigo-900 mb-8">Admin Panel</h2>
                        <nav>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => setActiveSection('emergencies')}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                            activeSection === 'emergencies'
                                                ? 'bg-indigo-100 text-indigo-900'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Emergency Requests ({emergencies.length})</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('supports')}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                            activeSection === 'supports'
                                                ? 'bg-indigo-100 text-indigo-900'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                        </svg>
                                        <span>Support Requests ({supports.length})</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('donations')}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                            activeSection === 'donations'
                                                ? 'bg-indigo-100 text-indigo-900'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Donations Made ({donations.length})</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('volunteering')}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                            activeSection === 'volunteering'
                                                ? 'bg-indigo-100 text-indigo-900'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                        <span>Volunteering History ({volunteering.length})</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-6">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to Home
                        </Link>
                    </div>

                    {/* Hamburger Menu (Mobile) */}
                    <div className="md:hidden mb-6">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`fixed inset-0 bg-white z-50 ${
                            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        } transition-transform duration-300 ease-in-out md:hidden`}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-indigo-900">Admin Panel</h2>
                                <button
                                    onClick={toggleMenu}
                                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                                >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <nav>
                                <ul className="space-y-4">
                                    <li>
                                        <button
                                            onClick={() => {
                                                setActiveSection('emergencies');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                                activeSection === 'emergencies'
                                                    ? 'bg-indigo-100 text-indigo-900'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>Emergency Requests ({emergencies.length})</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                setActiveSection('supports');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                                activeSection === 'supports'
                                                    ? 'bg-indigo-100 text-indigo-900'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                            </svg>
                                            <span>Support Requests ({supports.length})</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                setActiveSection('donations');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                                activeSection === 'donations'
                                                    ? 'bg-indigo-100 text-indigo-900'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>Donations Made ({donations.length})</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                setActiveSection('volunteering');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${
                                                activeSection === 'volunteering'
                                                    ? 'bg-indigo-100 text-indigo-900'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                            </svg>
                                            <span>Volunteering History ({volunteering.length})</span>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        {activeSection === 'emergencies' && (
                            <div>
                                <h3 className="text-xl font-semibold text-indigo-900 mb-4">
                                    Emergency Requests
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <>
                                                <SkeletonRow />
                                                <SkeletonRow />
                                                <SkeletonRow />
                                            </>
                                        ) : emergencies.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                    No emergency requests found.
                                                </td>
                                            </tr>
                                        ) : (
                                            emergencies.map((item) => (
                                                <tr key={item.receiptId}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.receiptId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.emergencyType}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.status}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeSection === 'supports' && (
                            <div>
                                <h3 className="text-xl font-semibold text-indigo-900 mb-4">
                                    Support Requests
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <>
                                                <SkeletonRow />
                                                <SkeletonRow />
                                                <SkeletonRow />
                                            </>
                                        ) : supports.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                    No support requests found.
                                                </td>
                                            </tr>
                                        ) : (
                                            supports.map((item) => (
                                                <tr key={item.receiptId}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.receiptId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.supportType}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.status}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeSection === 'donations' && (
                            <div>
                                <h3 className="text-xl font-semibold text-indigo-900 mb-4">
                                    Donations Made
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Receipt ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Disaster
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <>
                                                <SkeletonRow />
                                                <SkeletonRow />
                                                <SkeletonRow />
                                            </>
                                        ) : donations.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                    No donations found.
                                                </td>
                                            </tr>
                                        ) : (
                                            donations.map((item) => (
                                                <tr key={item.receiptId}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.receiptId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.disaster}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{item.amount}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeSection === 'volunteering' && (
                            <div>
                                <h3 className="text-xl font-semibold text-indigo-900 mb-4">
                                    Volunteering History
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Event
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hours
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <>
                                                <SkeletonRow />
                                                <SkeletonRow />
                                                <SkeletonRow />
                                            </>
                                        ) : volunteering.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                    No volunteering history found.
                                                </td>
                                            </tr>
                                        ) : (
                                            volunteering.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.event}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.hours}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}