"use client";
import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, Heart, MapPin, Phone, Send, Shield, Smile, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
    const [mongoId, setMongoId] = useState('');
    const [error, setError] = useState('');

    // State for animation
    const [isFormVisible, setIsFormVisible] = useState(false);

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

    // Fade in form after component mount
    useEffect(() => {
        getLocation();
        const timer = setTimeout(() => {
            setIsFormVisible(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Top Navigation */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => window.history.back()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                        Your Help Makes a Difference
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl">
                        Thank you for stepping forward. In times of crisis, every helping hand matters.
                        Your skills and time can bring hope to those in need.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.5,
                                type: "spring",
                                stiffness: 200
                            }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700"
                        >
                            <Heart className="h-5 w-5 mr-2 text-red-500" />
                            <span className="font-medium">Join 247 other volunteers helping today</span>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isFormVisible ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white shadow-lg rounded-xl p-6 md:p-8 flex-1 border border-blue-50"
                    >
                        {!submitted ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.h2
                                    variants={itemVariants}
                                    className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center"
                                >
                                    <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                        <span className="font-semibold">1</span>
                                    </span>
                                    Share How You Can Help
                                </motion.h2>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-start"
                                    >
                                        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                                                className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="Your first name"
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
                                                className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="Your last name"
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                                                className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="your.email@example.com"
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
                                                className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="(123) 456-7890"
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-2">
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
                                                className="flex-1 block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="City, State"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="button"
                                                onClick={getLocation}
                                                className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                                            >
                                                <MapPin className="h-5 w-5 mr-2" />
                                                Detect
                                            </motion.button>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label htmlFor="helpType" className="block text-sm font-medium text-gray-700">
                                            How Would You Like to Help? <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="helpType"
                                            name="helpType"
                                            required
                                            value={formData.helpType}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
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
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                                            Relevant Skills or Qualifications
                                        </label>
                                        <textarea
                                            id="skills"
                                            name="skills"
                                            rows={3}
                                            value={formData.skills}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            placeholder="E.g., First aid certification, construction experience, languages spoken, etc."
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                                                className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
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
                                                className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            >
                                                <option value="">Select transportation</option>
                                                <option value="own">Have own transportation</option>
                                                <option value="public">Can use public transit</option>
                                                <option value="none">Need transportation assistance</option>
                                            </select>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                                            Additional Information
                                        </label>
                                        <textarea
                                            id="additionalInfo"
                                            name="additionalInfo"
                                            rows={4}
                                            value={formData.additionalInfo}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            placeholder="Any other details you'd like to share about how you can help..."
                                        />
                                    </motion.div>

                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                        className="pt-4"
                                    >
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-300"
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
                                    </motion.div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                className="text-center py-12"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100"
                                >
                                    <Smile className="h-10 w-10 text-green-600" />
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 text-3xl font-bold text-gray-900"
                                >
                                    Thank You For Volunteering!
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="mt-4 text-lg text-gray-600"
                                >
                                    Your request to help has been registered with ID:
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.9 }}
                                        className="font-mono font-bold ml-2 px-3 py-1 bg-blue-50 rounded-lg"
                                    >
                                        {requestId}
                                    </motion.span>
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-6 text-gray-600 max-w-md mx-auto"
                                >
                                    We appreciate your willingness to help. Our team will review your information and contact you shortly.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    className="mt-8"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSubmitted(false)}
                                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                                    >
                                        <Heart className="h-5 w-5 mr-2" />
                                        Offer Additional Help
                                    </motion.button>
                                </motion.div>

                                {/* Debug information (optional) */}
                                <motion.details
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    transition={{ delay: 1.2 }}
                                    className="mt-8 text-xs"
                                >
                                    <summary className="text-gray-500 cursor-pointer">Technical details</summary>
                                    <div className="mt-2 p-2 bg-gray-50 rounded">
                                        <p>Database: disaster-relief-db</p>
                                        <p>Collection: volunteers</p>
                                        <p>Full MongoDB ID: {mongoId}</p>
                                    </div>
                                </motion.details>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Information Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="lg:w-1/3 space-y-6"
                    >
                        {/* Impact counter */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
                        >
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <Users className="h-6 w-6 mr-2" />
                                Your Impact
                            </h3>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-blue-100">People helped so far</p>
                                    <p className="text-4xl font-bold">1,247</p>
                                </div>
                                <div>
                                    <p className="text-blue-100">Active volunteers</p>
                                    <p className="text-4xl font-bold">247</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm"
                        >
                            <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
                                <Heart className="h-5 w-5 mr-2 text-red-500" />
                                Why Your Help Matters
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                In times of crisis, community support becomes our greatest strength. Your contribution,
                                whether time, skills, or resources, directly impacts those affected.
                            </p>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1, duration: 1.5 }}
                                className="h-1 bg-gradient-to-r from-blue-300 to-green-300 rounded-full mt-4"
                            />
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                        >
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Shield className="h-5 w-5 text-blue-500 mr-2" />
                                Types of Assistance Needed
                            </h3>
                            <ul className="space-y-3 text-gray-600">
                                {[
                                    { icon: Shield, text: "Emergency response and first aid" },
                                    { icon: Users, text: "Community outreach and wellness checks" },
                                    { icon: MapPin, text: "Shelter operations and setup" },
                                    { icon: Send, text: "Supply distribution and logistics" },
                                    { icon: Phone, text: "Communication and information sharing" }
                                ].map((item, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + (index * 0.1) }}
                                        className="flex items-start"
                                    >
                                        <item.icon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                                        <span>{item.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="bg-green-50 rounded-xl p-6 border border-green-100 shadow-sm"
                        >
                            <h3 className="text-lg font-medium text-green-800 mb-3 flex items-center">
                                <Shield className="h-5 w-5 text-green-600 mr-2" />
                                Your Safety Matters
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We prioritize your safety. All volunteers will receive safety briefings and necessary
                                protective equipment before deployment.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200 hover:bg-green-200 transition-colors duration-300 flex items-center justify-center"
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                View Safety Guidelines
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} Disaster Relief Network. All rights reserved.</p>
                        <p className="mt-2">Your information is secure and will only be used for coordination purposes.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProvidePage;