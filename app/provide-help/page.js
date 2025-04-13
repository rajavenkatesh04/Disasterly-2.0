"use client";
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Heart, MapPin, Phone, Send, Shield, Smile, Users } from 'lucide-react';

const ProvidePage = () => {
    // State for form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        helpType: '',
        skills: '',
        availability: '',
        transportation: '',
        additionalInfo: '',
    });

    // State for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [requestId, setRequestId] = useState('');
    const [mongoId, setMongoId] = useState(''); // New state for MongoDB ID
    const [error, setError] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/volunteer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit form');
            }

            // Set both the formatted ID and the actual MongoDB ID
            setRequestId(data.formattedId);
            setMongoId(data.mongoId);
            setSubmitted(true);

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                location: '',
                helpType: '',
                skills: '',
                availability: '',
                transportation: '',
                additionalInfo: '',
            });

        } catch (err) {
            console.error('Submission error:', err);
            setError(err.message || 'There was an error submitting your form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to get user location
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                        .then(response => response.json())
                        .then(data => {
                            const city = data.city || data.locality;
                            const country = data.countryName;
                            setFormData(prevData => ({
                                ...prevData,
                                location: `${city}, ${country}`
                            }));
                        })
                        .catch(() => {
                            setFormData(prevData => ({
                                ...prevData,
                                location: 'Location not available'
                            }));
                        });
                },
                () => {
                    setFormData(prevData => ({
                        ...prevData,
                        location: 'Location access denied'
                    }));
                }
            );
        } else {
            setFormData(prevData => ({
                ...prevData,
                location: 'Geolocation not supported'
            }));
        }
    };

    // Automatically prompt for location on component mount
    useEffect(() => {
        getLocation();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
                        Your Help Makes a Difference
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl">
                        Thank you for stepping forward. In times of crisis, every helping hand matters. Your skills and time can bring hope to those in need.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Form Section */}
                    <div className="bg-white shadow-md rounded-lg p-6 md:p-8 flex-1">
                        {!submitted ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-200">Share How You Can Help</h2>

                                {error && (
                                    <div className="mb-6 p-4 text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-start">
                                        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                id="firstName"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                id="lastName"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                            Your Location <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                name="location"
                                                id="location"
                                                required
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="flex-1 block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                placeholder="City, State"
                                            />
                                            <button
                                                type="button"
                                                onClick={getLocation}
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                            >
                                                <MapPin className="h-5 w-5 mr-2" />
                                                Detect
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="helpType" className="block text-sm font-medium text-gray-700">
                                            How Would You Like to Help? <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="helpType"
                                            name="helpType"
                                            required
                                            value={formData.helpType}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        >
                                            <option value="">Select an option</option>
                                            <option value="volunteers">On-site Volunteer</option>
                                            <option value="medical">Medical Assistance</option>
                                            <option value="resources">Provide Resources</option>
                                            <option value="donation">Material Donation</option>
                                            <option value="transport">Transportation</option>
                                            <option value="psychosocial">Psychosocial Support</option>
                                            <option value="technical">Technical Expertise</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                                            Relevant Skills or Qualifications
                                        </label>
                                        <textarea
                                            id="skills"
                                            name="skills"
                                            rows={3}
                                            value={formData.skills}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="E.g., First aid certification, construction experience, languages spoken, etc."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                                                Availability <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="availability"
                                                name="availability"
                                                required
                                                value={formData.availability}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            >
                                                <option value="">Select availability</option>
                                                <option value="immediate">Immediate (Within 24 hours)</option>
                                                <option value="soon">Soon (2-3 days)</option>
                                                <option value="weekend">Weekends only</option>
                                                <option value="evenings">Evenings only</option>
                                                <option value="flexible">Flexible schedule</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="transportation" className="block text-sm font-medium text-gray-700">
                                                Transportation
                                            </label>
                                            <select
                                                id="transportation"
                                                name="transportation"
                                                value={formData.transportation}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            >
                                                <option value="">Select transportation</option>
                                                <option value="own">Have own transportation</option>
                                                <option value="public">Can use public transit</option>
                                                <option value="none">Need transportation assistance</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                                            Additional Information
                                        </label>
                                        <textarea
                                            id="additionalInfo"
                                            name="additionalInfo"
                                            rows={4}
                                            value={formData.additionalInfo}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Any other details you'd like to share about how you can help..."
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Your Offer to Help'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                    <Smile className="h-6 w-6 text-green-600" />
                                </div>
                                <h2 className="mt-6 text-2xl font-bold text-gray-900">Thank You For Volunteering!</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Your request to help has been registered with ID: <span className="font-mono font-bold">{requestId}</span>
                                </p>
                                <p className="mt-4 text-gray-600 max-w-md mx-auto">
                                    We appreciate your willingness to help. Our team will review your information and contact you shortly.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Offer Additional Help
                                    </button>
                                </div>

                                {/* Debug information (optional) */}
                                <details className="mt-4 text-xs">
                                    <summary className="text-gray-500 cursor-pointer">Technical details</summary>
                                    <div className="mt-2 p-2 bg-gray-50 rounded">
                                        <p>Database: disaster-relief-db</p>
                                        <p>Collection: volunteers</p>
                                        <p>Full MongoDB ID: {mongoId}</p>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>

                    {/* Information Section */}
                    <div className="md:w-1/3">
                        <div className="bg-blue-50 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
                                <Heart className="h-5 w-5 mr-2" />
                                Why Your Help Matters
                            </h3>
                            <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl">
                                Thank you for stepping forward. In times of crisis, every helping hand matters. Your skills and time can bring hope to those in need.
                            </p>

                            <p className="text-blue-700">
                                By offering your skills and time, you become part of the recovery process, helping communities rebuild and heal.
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Types of Assistance Needed</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                    <span>Emergency response and first aid</span>
                                </li>
                                <li className="flex items-start">
                                    <Users className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                    <span>Community outreach and wellness checks</span>
                                </li>
                                <li className="flex items-start">
                                    <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                    <span>Shelter operations and setup</span>
                                </li>
                                <li className="flex items-start">
                                    <Send className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                    <span>Supply distribution and logistics</span>
                                </li>
                                <li className="flex items-start">
                                    <Phone className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                    <span>Communication and information sharing</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-green-800 mb-2">Your Safety Matters</h3>
                            <p className="mt-4 text-gray-600 max-w-md mx-auto">
                                We appreciate your willingness to help. Our team will review your information and contact you shortly.
                            </p>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProvidePage;