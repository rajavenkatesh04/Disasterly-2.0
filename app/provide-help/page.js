"use client"
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
            // Simulation of API call to MongoDB
            // In a real application, this would be an actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate a request ID (this would normally come from the backend)
            const generatedId = 'HELP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
            setRequestId(generatedId);
            setSubmitted(true);

            // Reset form after successful submission
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
            setError('There was an error submitting your offer to help. Please try again.');
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
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Share How You Can Help</h2>

                                {error && (
                                    <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md flex items-center">
                                        <AlertTriangle className="h-5 w-5 mr-2" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                id="firstName"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                id="lastName"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                            Your Location
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="location"
                                                id="location"
                                                required
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                placeholder="City, State"
                                            />
                                            <button
                                                type="button"
                                                onClick={getLocation}
                                                className="mt-1 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <MapPin className="h-5 w-5 mr-2" />
                                                Detect
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="helpType" className="block text-sm font-medium text-gray-700">
                                            How Would You Like to Help?
                                        </label>
                                        <select
                                            id="helpType"
                                            name="helpType"
                                            required
                                            value={formData.helpType}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        >
                                            <option value="">Please select</option>
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

                                    <div>
                                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                                            Relevant Skills or Qualifications
                                        </label>
                                        <textarea
                                            id="skills"
                                            name="skills"
                                            rows={3}
                                            value={formData.skills}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="E.g., First aid certification, construction experience, languages spoken, etc."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                                                Availability
                                            </label>
                                            <select
                                                id="availability"
                                                name="availability"
                                                required
                                                value={formData.availability}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            >
                                                <option value="">Please select</option>
                                                <option value="immediate">Immediate (Within 24 hours)</option>
                                                <option value="soon">Soon (2-3 days)</option>
                                                <option value="weekend">Weekends only</option>
                                                <option value="evenings">Evenings only</option>
                                                <option value="flexible">Flexible schedule</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="transportation" className="block text-sm font-medium text-gray-700">
                                                Transportation
                                            </label>
                                            <select
                                                id="transportation"
                                                name="transportation"
                                                value={formData.transportation}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            >
                                                <option value="">Please select</option>
                                                <option value="own">Have own transportation</option>
                                                <option value="public">Can use public transit</option>
                                                <option value="none">Need transportation assistance</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                                            Additional Information
                                        </label>
                                        <textarea
                                            id="additionalInfo"
                                            name="additionalInfo"
                                            rows={4}
                                            value={formData.additionalInfo}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="Any other details you'd like to share about how you can help..."
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Your Offer to Help'}
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
                                    Your request to help has been registered with ID: <span className="font-bold">{requestId}</span>
                                </p>
                                <p className="mt-4 text-gray-600 max-w-md mx-auto">
                                    We appreciate your willingness to help. Our team will review your information and contact you shortly with details on how you can contribute.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Offer Additional Help
                                    </button>
                                </div>
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
                            <p className="text-blue-700 mb-4">
                                During a disaster, community support is essential. Your contribution, no matter how small, can make a significant difference in someone's life.
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
                            <p className="text-green-700 text-sm">
                                While helping others, remember to prioritize your wellbeing. Only volunteer for tasks you're comfortable with and always follow safety guidelines provided by coordinators.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProvidePage;