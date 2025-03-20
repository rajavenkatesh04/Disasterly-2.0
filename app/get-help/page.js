"use client";
import { useState, useEffect } from 'react';
import { submitHelpRequest } from '../utils/api';
import { AlertTriangle, Heart, MapPin, Phone, Shield, Smile, Users } from 'lucide-react';

export default function GetHelpPage() {
    const [activeForm, setActiveForm] = useState(null);
    const [emergencyProgress, setEmergencyProgress] = useState(0);
    const [supportProgress, setSupportProgress] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [requestId, setRequestId] = useState('');
    const [responseTime, setResponseTime] = useState('24 hours');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [breathingText, setBreathingText] = useState('Inhale...');

    // Form data states
    const [emergencyFormData, setEmergencyFormData] = useState({
        name: '',
        location: '',
        situation: '',
        contact: ''
    });

    const [supportFormData, setSupportFormData] = useState({
        name: '',
        email: '',
        phone: '',
        helpType: '',
        urgency: '',
        details: ''
    });

    // Breathing animation logic
    useEffect(() => {
        const interval = setInterval(() => {
            setBreathingText((prev) => (prev === 'Inhale...' ? 'Exhale...' : 'Inhale...'));
        }, 4000); // Sync with animation duration
        return () => clearInterval(interval);
    }, []);

    const handleShowForm = (type) => {
        setActiveForm(type);
        setShowConfirmation(false);
        setError(null);

        // Scroll to the form with a slight delay to ensure rendering
        setTimeout(() => {
            const element = document.getElementById(`${type}-form`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const updateEmergencyProgress = () => {
        const totalFields = Object.keys(emergencyFormData).length;
        const filledFields = Object.values(emergencyFormData).filter(value => value.trim() !== '').length;
        setEmergencyProgress((filledFields / totalFields) * 100);
    };

    const updateSupportProgress = () => {
        const totalFields = Object.keys(supportFormData).length;
        const filledFields = Object.values(supportFormData).filter(value => value.trim() !== '').length;
        setSupportProgress((filledFields / totalFields) * 100);
    };

    const handleEmergencyInputChange = (e) => {
        const { name, value } = e.target;
        setEmergencyFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSupportInputChange = (e) => {
        const { name, value } = e.target;
        setSupportFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitForm = async (type) => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Prepare form data based on type
            const formData = type === 'emergency' ?
                { type, ...emergencyFormData } :
                { type, ...supportFormData };

            // Submit to backend API
            const response = await submitHelpRequest(formData);

            // Set response data
            setRequestId(response.requestId);

            // Calculate human-readable response time from API response
            const expectedTime = new Date(response.expectedResponseTime);
            const now = new Date();
            const diffMs = expectedTime - now;
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins < 60) {
                setResponseTime(`${diffMins} minutes`);
            } else if (diffMins < 1440) { // Less than 24 hours
                setResponseTime(`${Math.round(diffMins / 60)} hours`);
            } else {
                setResponseTime(`${Math.round(diffMins / 1440)} days`);
            }

            // Show confirmation
            setActiveForm(null);
            setShowConfirmation(true);

            // Scroll to confirmation
            setTimeout(() => {
                const element = document.getElementById('confirmation');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update progress whenever form data changes
    useEffect(() => {
        updateEmergencyProgress();
    }, [emergencyFormData, updateEmergencyProgress]);

    useEffect(() => {
        updateSupportProgress();
    }, [supportFormData, updateSupportProgress]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">We&apos;re Here For You</h1>
                <p className="text-gray-600">Your safety and wellbeing come first. Let&apos;s get through this together.</p>
            </div>

            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-6">
                <p className="text-blue-800"><strong>You&apos;re not alone.</strong> Our team is ready to assist you 24/7. Take your time, breathe, and tell us what you need.</p>
            </div>

            <div className="bg-green-100 p-6 rounded-lg text-center mb-6">
                <h2 className="text-2xl font-semibold text-green-900 mb-4">Take a moment</h2>
                <p className="text-green-800 mb-4">Follow the circle as it expands and contracts. Breathe in as it grows, breathe out as it shrinks.</p>
                <div className="w-24 h-24 mx-auto rounded-full bg-blue-400 relative flex items-center justify-center">
                    <div
                        className="absolute inset-0 rounded-full bg-blue-400 opacity-70 animate-breathe"
                    ></div>
                    <style jsx>{`
                        @keyframes breathe {
                            0%, 100% {
                                transform: scale(1);
                            }
                            50% {
                                transform: scale(1.2);
                            }
                        }
                        .animate-breathe {
                            animation: breathe 4s infinite ease-in-out;
                        }
                    `}</style>
                </div>
                <p className="text-green-800 mt-4">{breathingText}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Immediate Assistance</h3>
                    <p className="text-gray-600 mb-4">Connect directly with our emergency response team for urgent situations requiring immediate action.</p>
                    <button
                        onClick={() => handleShowForm('emergency')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Get Immediate Help
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Support Request</h3>
                    <p className="text-gray-600 mb-4">Submit a detailed request for non-emergency situations where you need guidance or assistance.</p>
                    <button
                        onClick={() => handleShowForm('support')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Request Support
                    </button>
                </div>
            </div>

            {activeForm === 'emergency' && (
                <div id="emergency-form" className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold text-blue-900 mb-4">Emergency Assistance</h2>
                    <p className="text-gray-600 mb-6">Please provide brief details so we can help you right away:</p>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${emergencyProgress}%` }}
                        ></div>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Your Name (or what we should call you):</label>
                            <input
                                type="text"
                                name="name"
                                value={emergencyFormData.name}
                                onChange={handleEmergencyInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Your Current Location (if you can share):</label>
                            <input
                                type="text"
                                name="location"
                                value={emergencyFormData.location}
                                onChange={handleEmergencyInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Address, landmark, or general area"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">What&apos;s happening? (brief description):</label>
                            <textarea
                                name="situation"
                                value={emergencyFormData.situation}
                                onChange={handleEmergencyInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us what&apos;s happening in a few words..."
                                rows="4"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Best way to reach you right now:</label>
                            <input
                                type="text"
                                name="contact"
                                value={emergencyFormData.contact}
                                onChange={handleEmergencyInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Phone number, messaging app, etc."
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => submitForm('emergency')}
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Emergency Request'}
                        </button>
                    </form>
                </div>
            )}

            {activeForm === 'support' && (
                <div id="support-form" className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold text-blue-900 mb-4">Support Request</h2>
                    <p className="text-gray-600 mb-6">Take your time filling out this form. We&apos;re here to help when you&apos;re ready.</p>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${supportProgress}%` }}
                        ></div>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Your Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={supportFormData.name}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Email Address:</label>
                            <input
                                type="email"
                                name="email"
                                value={supportFormData.email}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Where we can reach you"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Phone Number (optional):</label>
                            <input
                                type="tel"
                                name="phone"
                                value={supportFormData.phone}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Alternative contact method"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Type of Help Needed:</label>
                            <select
                                name="helpType"
                                value={supportFormData.helpType}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Please select...</option>
                                <option value="evacuation">Evacuation Assistance</option>
                                <option value="shelter">Shelter Information</option>
                                <option value="medical">Medical Support</option>
                                <option value="supplies">Emergency Supplies</option>
                                <option value="loved-ones">Locating Loved Ones</option>
                                <option value="other">Other (please specify)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">How urgent is your situation?</label>
                            <select
                                name="urgency"
                                value={supportFormData.urgency}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Please select...</option>
                                <option value="critical">Critical - Need help now</option>
                                <option value="urgent">Urgent - Need help today</option>
                                <option value="important">Important - Need help soon</option>
                                <option value="planning">Planning ahead</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Please tell us more about your situation:</label>
                            <textarea
                                name="details"
                                value={supportFormData.details}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Share as much or as little as you feel comfortable with. Any information helps us provide better assistance."
                                rows="4"
                            ></textarea>
                        </div>
                        <button
                            type="button"
                            onClick={() => submitForm('support')}
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                            {isSubmitting ? 'Sending...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            )}

            {showConfirmation && (
                <div id="confirmation" className="bg-blue-100 p-6 rounded-lg text-center mb-8">
                    <h2 className="text-2xl font-semibold text-blue-900 mb-4">We&apos;ve received your request</h2>
                    <p className="text-gray-600 mb-2">Your request ID is: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{requestId}</span></p>
                    <p className="text-gray-600 mb-4">A member of our support team will be in touch with you shortly.</p>
                    <p className="text-gray-600 mb-4">Based on your urgency level, you can expect a response within:</p>
                    <p className="text-2xl font-bold text-blue-900 mb-6">{responseTime}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Return to Help Page
                    </button>
                </div>
            )}

            <div className="bg-red-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">Emergency Numbers</h3>
                <p className="text-red-800 mb-4">If you need immediate emergency services:</p>
                <ul className="list-disc list-inside text-red-800">
                    <li><strong>Emergency Services:</strong> 911 (US) / 112 (EU)</li>
                    <li><strong>Disasterly Hotline:</strong> 1-800-DISASTER (1-800-347-2783)</li>
                    <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                </ul>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}