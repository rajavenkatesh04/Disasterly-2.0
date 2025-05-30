"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Phone, Send, MapPin } from "lucide-react";

export default function GetHelpPage() {
    const { data: session, status, update } = useSession();
    const [activeForm, setActiveForm] = useState(null);
    const [emergencyProgress, setEmergencyProgress] = useState(0);
    const [supportProgress, setSupportProgress] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [requestId, setRequestId] = useState("");
    const [mongoId, setMongoId] = useState("");
    const [responseTime, setResponseTime] = useState("24 hours");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null); // New state for form-specific error

    // Breathing states
    const [breathingText, setBreathingText] = useState("Inhale...");
    const [breathingPhase, setBreathingPhase] = useState(0);

    // Form data states with pre-population
    const [emergencyFormData, setEmergencyFormData] = useState({
        name: "",
        location: "",
        situation: "",
        contact: "",
        emergencyType: "",
    });

    const [supportFormData, setSupportFormData] = useState({
        name: "",
        email: "",
        phone: "",
        helpType: "",
        urgency: "",
        details: "",
    });

    // Fetch user data on session load or manual refresh
    useEffect(() => {
        const fetchUserData = async () => {
            if (status === "authenticated" && session?.user?.userId) {
                try {
                    console.log("Fetching user data for userId:", session.user.userId); // Debug log
                    const response = await axios.get(`/api/user/${session.user.userId}`, {
                        headers: { "Cache-Control": "no-cache" }, // Prevent caching
                    });
                    console.log("API Response:", response.data); // Debug log
                    const userData = response.data.user;
                    if (userData) {
                        setEmergencyFormData((prev) => ({
                            ...prev,
                            name: userData.name || "",
                            contact: userData.phone || "",
                            location: userData.address
                                ? `${userData.address.street || ""}, ${userData.address.city || ""}, ${userData.address.state || ""}, ${userData.address.postalCode || ""}, ${userData.address.country || ""}`.replace(/, ,/g, ",").replace(/^,|,$/g, "")
                                : "",
                        }));
                        setSupportFormData((prev) => ({
                            ...prev,
                            name: userData.name || "",
                            email: userData.email || "",
                            phone: userData.phone || "",
                        }));
                    } else {
                        setError("No user data returned from server.");
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err.response?.data || err.message);
                    setError("Failed to load your profile data. Check console for details.");
                }
            } else if (status === "unauthenticated") {
                setError("Please sign in to pre-populate your details.");
            }
        };
        fetchUserData();
    }, [status, session]);

    // Breathing animation logic
    useEffect(() => {
        const phases = ["Inhale...", "Hold...", "Exhale...", "Rest..."];
        const phaseDurations = [3000, 1000, 3000, 1000];

        const updatePhase = () => {
            setBreathingPhase((prev) => (prev + 1) % phases.length);
        };

        setBreathingText(phases[breathingPhase]);

        const timer = setTimeout(updatePhase, phaseDurations[breathingPhase]);
        return () => clearTimeout(timer);
    }, [breathingPhase]);

    const handleShowForm = (type) => {
        setActiveForm(type);
        setShowConfirmation(false);
        setError(null);
        setFormError(null); // Reset form-specific error

        setTimeout(() => {
            const element = document.getElementById(`${type}-form`);
            element?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const handleEmergencyInputChange = (e) => {
        const { name, value } = e.target;
        setEmergencyFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSupportInputChange = (e) => {
        const { name, value } = e.target;
        setSupportFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Update emergency form progress
    useEffect(() => {
        const updateEmergencyProgress = () => {
            const totalFields = Object.keys(emergencyFormData).length;
            const filledFields = Object.values(emergencyFormData).filter((value) => value.trim() !== "").length;
            setEmergencyProgress((filledFields / totalFields) * 100);
        };
        updateEmergencyProgress();
    }, [emergencyFormData]);

    // Update support form progress
    useEffect(() => {
        const updateSupportProgress = () => {
            const totalFields = Object.keys(supportFormData).length;
            const filledFields = Object.values(supportFormData).filter((value) => value.trim() !== "").length;
            setSupportProgress((filledFields / totalFields) * 100);
        };
        updateSupportProgress();
    }, [supportFormData]);

    const submitForm = async (type) => {
        try {
            setIsSubmitting(true);
            setError(null);
            setFormError(null); // Reset form-specific error

            const formData = type === "emergency" ? emergencyFormData : supportFormData;

            // Validate form data
            const isValid = Object.values(formData).every((value) => value.trim() !== "");
            if (!isValid) {
                setFormError("Please fill in all fields.");
                return;
            }

            const endpoint = type === "emergency" ? "/api/help" : "/api/support";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit request");
            }

            setRequestId(data.requestId || Math.random().toString(36).substring(2, 10).toUpperCase());
            setMongoId(data.mongoId || Math.random().toString(36).substring(2, 15).toUpperCase());

            const expectedTime = new Date(data.expectedResponseTime || new Date().getTime() + 15 * 60000);
            const now = new Date();
            const diffMs = expectedTime - now;
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins < 60) {
                setResponseTime(`${diffMins} minutes`);
            } else if (diffMins < 1440) {
                setResponseTime(`${Math.round(diffMins / 60)} hours`);
            } else {
                setResponseTime(`${Math.round(diffMins / 1440)} days`);
            }

            if (type === "emergency") {
                // Keep the form data for confirmation display
            } else {
                setSupportFormData({
                    name: "",
                    email: "",
                    phone: "",
                    helpType: "",
                    urgency: "",
                    details: "",
                });
            }

            setActiveForm(null);
            setShowConfirmation(true);

            setTimeout(() => {
                const element = document.getElementById("confirmation");
                element?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form after submission
    const resetForm = () => {
        setEmergencyFormData({
            name: "",
            location: "",
            situation: "",
            contact: "",
            emergencyType: "",
        });
        setShowConfirmation(false);
        setActiveForm("emergency");
    };

    // Manual refresh button for testing
    const handleRefreshData = async () => {
        if (status === "authenticated" && session?.user?.userId) {
            await update(); // Refresh session
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`/api/user/${session.user.userId}`, {
                        headers: { "Cache-Control": "no-cache" },
                    });
                    const userData = response.data.user;
                    if (userData) {
                        setEmergencyFormData((prev) => ({
                            ...prev,
                            name: userData.name || "",
                            contact: userData.phone || "",
                            location: userData.address
                                ? `${userData.address.street || ""}, ${userData.address.city || ""}, ${userData.address.state || ""}, ${userData.address.postalCode || ""}, ${userData.address.country || ""}`.replace(/, ,/g, ",").replace(/^,|,$/g, "")
                                : "",
                        }));
                        setSupportFormData((prev) => ({
                            ...prev,
                            name: userData.name || "",
                            email: userData.email || "",
                            phone: userData.phone || "",
                        }));
                    }
                } catch (err) {
                    console.error("Refresh error:", err.response?.data || err.message);
                    setError("Failed to refresh data.");
                }
            };
            fetchUserData();
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Top Navigation with Back Button */}
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

            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">We&apos;re Here For You</h1>
                <p className="text-gray-600">Your safety and wellbeing come first. Let&apos;s get through this together.</p>
            </div>

            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-6">
                <p className="text-blue-800">
                    <strong>You&apos;re not alone.</strong> Our team is ready to assist you 24/7. Take your time, breathe, and tell us what you need.
                </p>
            </div>

            <div className="bg-green-100 p-6 rounded-lg text-center mb-6">
                <h2 className="text-2xl font-semibold text-green-900 mb-4">Take a moment</h2>
                <p className="text-green-800 mb-8">Follow the circle and breathe along. Inhale slowly as it expands, exhale gently as it contracts.</p>

                <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-blue-200 opacity-50 animate-pulse-slow"></div>
                    <div className="absolute inset-0 rounded-full bg-blue-400 flex items-center justify-center animate-breathe">
                        <div className="w-1/2 h-1/2 rounded-full bg-blue-200 animate-inner-breathe"></div>
                    </div>
                </div>

                <p className="text-green-800 text-xl font-medium animate-fade-text mt-8">{breathingText}</p>

                <div className="flex justify-center mt-4 space-x-2">
                    <div className={`h-2 w-2 rounded-full ${breathingText === "Inhale..." ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <div className={`h-2 w-2 rounded-full ${breathingText === "Hold..." ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <div className={`h-2 w-2 rounded-full ${breathingText === "Exhale..." ? "bg-blue-500" : "bg-gray-300"}`}></div>
                    <div className={`h-2 w-2 rounded-full ${breathingText === "Rest..." ? "bg-blue-500" : "bg-gray-300"}`}></div>
                </div>

                <style jsx>{`
                    @keyframes breathe {
                        0%, 10% {
                            transform: scale(1);
                            background-color: rgba(96, 165, 250, 0.9);
                        }
                        40%, 60% {
                            transform: scale(1.4);
                            background-color: rgba(147, 197, 253, 0.9);
                        }
                        90%, 100% {
                            transform: scale(1);
                            background-color: rgba(96, 165, 250, 0.9);
                        }
                    }

                    @keyframes inner-breathe {
                        0%, 10% {
                            opacity: 0.8;
                        }
                        40%, 60% {
                            opacity: 0.3;
                        }
                        90%, 100% {
                            opacity: 0.8;
                        }
                    }

                    @keyframes pulse-slow {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 0.3;
                        }
                        50% {
                            transform: scale(1.5);
                            opacity: 0.1;
                        }
                    }

                    @keyframes fade-text {
                        0%, 100% {
                            opacity: 1;
                        }
                        20%, 80% {
                            opacity: 0.8;
                        }
                    }

                    .animate-breathe {
                        animation: breathe 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .animate-inner-breathe {
                        animation: inner-breathe 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .animate-pulse-slow {
                        animation: pulse-slow 8s infinite ease-in-out;
                    }

                    .animate-fade-text {
                        animation: fade-text 8s infinite ease-in-out;
                    }
                `}</style>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Immediate Assistance</h3>
                    <p className="text-gray-600 mb-4">Connect directly with our emergency response team for urgent situations requiring immediate action.</p>
                    <button
                        onClick={() => handleShowForm("emergency")}
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Get Immediate Help
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Support Request</h3>
                    <p className="text-gray-600 mb-4">Submit a detailed request for non-emergency situations where you need guidance or assistance.</p>
                    <button
                        onClick={() => handleShowForm("support")}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Request Support
                    </button>
                </div>
            </div>

            <button
                onClick={handleRefreshData}
                className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
                Refresh User Data
            </button>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {activeForm === "emergency" && (
                <div id="emergency-form" className="bg-red-50 p-6 rounded-lg shadow-md mb-8 border border-red-500">
                    <h2 className="text-2xl font-semibold text-red-900 mb-4">SOS Emergency Assistance</h2>
                    <p className="text-gray-600 mb-6">Please provide brief details so we can help you right away:</p>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${emergencyProgress}%` }}
                        ></div>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Emergency Type</label>
                            <select
                                name="emergencyType"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                                value={emergencyFormData.emergencyType}
                                onChange={handleEmergencyInputChange}
                                required
                            >
                                <option value="">Select emergency type</option>
                                <option value="medical">Medical Emergency</option>
                                <option value="fire">Fire</option>
                                <option value="flood">Flood</option>
                                <option value="earthquake">Earthquake</option>
                                <option value="security">Security Threat</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                            <input
                                type="text"
                                name="name"
                                value={emergencyFormData.name}
                                onChange={handleEmergencyInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Your Location</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="location"
                                    value={emergencyFormData.location}
                                    onChange={handleEmergencyInputChange}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Address, landmark, or general area"
                                    required
                                />
                                <button
                                    type="button"
                                    className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
                                    onClick={() => {
                                        // This would use browser geolocation in a real app
                                        alert("Getting your current location...");
                                    }}
                                >
                                    <MapPin size={20} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Describe Your Emergency</label>
                            <textarea
                                name="situation"
                                value={emergencyFormData.situation}
                                onChange={handleEmergencyInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg min-h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Provide details about your emergency situation"
                                required
                                rows="4"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Best way to reach you right now</label>
                            <input
                                type="text"
                                name="contact"
                                value={emergencyFormData.contact}
                                onChange={handleEmergencyInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Phone number, messaging app, etc."
                                required
                            />
                        </div>

                        <div className="flex justify-end items-center">
                            <button
                                type="button"
                                onClick={() => submitForm("emergency")}
                                disabled={isSubmitting}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 disabled:bg-red-400"
                            >
                                <AlertCircle size={20} />
                                {isSubmitting ? "Sending..." : "Send SOS"}
                            </button>
                            {formError && <p className="text-red-500 ml-4">{formError}</p>} {/* Display form-specific error */}
                        </div>
                    </form>
                </div>
            )}

            {activeForm === "support" && (
                <div id="support-form" className="bg-blue-50 p-6 rounded-lg shadow-md mb-8 border border-blue-500">
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
                                required
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
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Phone Number:</label>
                            <input
                                type="tel"
                                name="phone"
                                value={supportFormData.phone}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Phone number"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Type of Help Needed:</label>
                            <select
                                name="helpType"
                                value={supportFormData.helpType}
                                onChange={handleSupportInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
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
                                required
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
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end items-center">
                            <button
                                type="button"
                                onClick={() => submitForm("support")}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 disabled:bg-blue-400"
                            >
                                {isSubmitting ? "Sending..." : "Submit Request"}
                            </button>
                            {formError && <p className="text-red-500 ml-4">{formError}</p>} {/* Display form-specific error */}
                        </div>
                    </form>
                </div>
            )}

            {showConfirmation && (
                <div id="confirmation" className="bg-green-50 p-6 rounded-lg text-center mb-8 border border-green-500">
                    <div className="flex flex-col items-center">
                        <div className="bg-green-100 p-4 rounded-full mb-4">
                            <Send className="text-green-500" size={32} />
                        </div>
                        <h2 className="text-2xl font-semibold text-blue-900 mb-4">We&apos;ve received your request</h2>
                        <p className="text-gray-600 mb-4 text-center">
                            Your {activeForm === "emergency" ? "emergency" : "support"} request has been received. Help is on the way.
                        </p>

                        <div className="bg-gray-100 w-full p-4 rounded-lg mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Request ID:</span>
                                <span className="font-mono bg-white px-2 py-1 rounded">{requestId}</span>
                            </div>
                            {/*<div className="flex justify-between mb-2">*/}
                            {/*    <span className="text-gray-600">Reference ID:</span>*/}
                            {/*    <span className="font-mono bg-white px-2 py-1 rounded flex-row">{mongoId}</span>*/}
                            {/*</div>*/}
                            {emergencyFormData.emergencyType && (
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Emergency Type:</span>
                                    <span className="font-medium">{emergencyFormData.emergencyType}</span>
                                </div>
                            )}
                            {emergencyFormData.location && (
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium">{emergencyFormData.location}</span>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-600 mb-4 text-sm italic">
                            Please screenshot or note down these ID&apos;s for future reference.
                        </p>

                        <p className="text-gray-600 mb-2">A member of our support team will be in touch with you shortly.</p>
                        <p className="text-gray-600 mb-2">Based on your urgency level, you can expect a response within:</p>
                        <p className="text-2xl font-bold text-blue-900 mb-6">{responseTime}</p>

                        <div className="flex gap-4">
                            <button
                                onClick={resetForm}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                            >
                                Submit Another Request
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setActiveForm(null);
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-red-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">Emergency Numbers</h3>
                <p className="text-red-800 mb-4">If you need immediate emergency services:</p>
                <ul className="list-disc list-inside text-red-800">
                    <li>
                        <strong>Police:</strong> 100
                    </li>
                    <li>
                        <strong>Fire:</strong> 101
                    </li>
                    <li>
                        <strong>Ambulance:</strong> 102
                    </li>
                    <li>
                        <strong>Disaster Management:</strong> 108
                    </li>
                    <li>
                        <strong>Women&apos;s Helpline:</strong> 1091
                    </li>
                    <li>
                        <strong>Child Helpline:</strong> 1098
                    </li>
                </ul>
            </div>
        </div>
    );
}
