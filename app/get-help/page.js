"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

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

    // Breathing states
    const [breathingText, setBreathingText] = useState("Inhale...");
    const [breathingPhase, setBreathingPhase] = useState(0);

    // Form data states with pre-population
    const [emergencyFormData, setEmergencyFormData] = useState({
        name: "",
        location: "",
        situation: "",
        contact: "",
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

            const endpoint = type === "emergency" ? "/api/help" : "/api/support";
            const formData = type === "emergency" ? emergencyFormData : supportFormData;

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

            setRequestId(data.requestId);
            setMongoId(data.mongoId);

            const expectedTime = new Date(data.expectedResponseTime);
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
                setEmergencyFormData({
                    name: "",
                    location: "",
                    situation: "",
                    contact: "",
                });
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
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
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
                            onClick={() => submitForm("emergency")}
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                            {isSubmitting ? "Sending..." : "Send Emergency Request"}
                        </button>
                    </form>
                </div>
            )}

            {activeForm === "support" && (
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
                            onClick={() => submitForm("support")}
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                            {isSubmitting ? "Sending..." : "Submit Request"}
                        </button>
                    </form>
                </div>
            )}

            {showConfirmation && (
                <div id="confirmation" className="bg-blue-100 p-6 rounded-lg text-center mb-8">
                    <h2 className="text-2xl font-semibold text-blue-900 mb-4">We&apos;ve received your request</h2>
                    <p className="text-gray-600 mb-2">
                        Your request ID is: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{requestId}</span>
                    </p>
                    <p className="text-gray-600 mb-4">
                        Reference ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{mongoId}</span>
                    </p>
                    <p className="text-gray-600 mb-4 text-sm italic">
                        Please screenshot or note down these ID&apos;s for future reference.
                    </p>
                    <p className="text-gray-600 mb-4">A member of our support team will be in touch with you shortly.</p>
                    <p className="text-gray-600 mb-4">Based on your urgency level, you can expect a response within:</p>
                    <p className="text-2xl font-bold text-blue-900 mb-6">{responseTime}</p>
                    <button
                        onClick={() => {
                            setShowConfirmation(false);
                            setActiveForm(null);
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Submit Another Request
                    </button>
                </div>
            )}

            <div className="bg-red-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">Emergency Numbers</h3>
                <p className="text-red-800 mb-4">If you need immediate emergency services:</p>
                <ul className="list-disc list-inside text-red-800">
                    <li>
                        <strong>Emergency Services:</strong> 911 (US) / 112 (EU)
                    </li>
                    <li>
                        <strong>Disasterly Hotline:</strong> 1-800-DISASTER (1-800-347-2783)
                    </li>
                    <li>
                        <strong>Crisis Text Line:</strong> Text HOME to 741741
                    </li>
                </ul>
            </div>
        </div>
    );
}
