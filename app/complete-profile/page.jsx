"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function CompleteProfile() {
    const { data: session, update, status } = useSession();
    const router = useRouter();
    const callbackUrl = "/";
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        dateOfBirth: "",
        age: null,
        phone: "",
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: ""
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState("");
    const [countdown, setCountdown] = useState(7); // Increased to 7 seconds

    // Set initial name from session
    useEffect(() => {
        if (status === "authenticated" && session?.user?.name) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name
            }));
        }
    }, [session, status]);

    // Redirect if profile is complete
    useEffect(() => {
        if (status === "authenticated" && session?.user?.isProfileComplete) {
            router.push(callbackUrl);
        }
    }, [session, status, router, callbackUrl]);

    // Countdown timer after success
    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (success && countdown === 0) {
            window.location.href = "/signin?callbackUrl=" + encodeURIComponent(callbackUrl);
        }
    }, [success, countdown, callbackUrl]);

    // Calculate age when dateOfBirth changes
    useEffect(() => {
        if (formData.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(formData.dateOfBirth);
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();

            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }

            setFormData(prev => ({
                ...prev,
                age: calculatedAge
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                age: null
            }));
        }
    }, [formData.dateOfBirth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Format date for display (YYYY-MM-DD to DD-MM-YYYY)
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await axios.post("/api/profile/update", formData);

            if (response.data.success) {
                const generatedUserId = response.data.userId || response.data.user?.userId || "";
                setUserId(generatedUserId);
                setSuccess(true);

                // Update session
                await update({
                    user: {
                        ...session.user,
                        isProfileComplete: true,
                        userId: generatedUserId,
                        intendedRoute: callbackUrl
                    }
                });
            } else {
                setError(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.push('/signin');
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-gray-600">Redirecting to signin...</p>
            </div>
        );
    }

    // More subtle confetti animation
    const ConfettiPiece = ({ delay, left }) => (
        <motion.div
            className={`absolute w-2 h-2 rounded-full ${
                ["bg-blue-200", "bg-yellow-200", "bg-green-200", "bg-indigo-200", "bg-purple-200"][Math.floor(Math.random() * 5)]
            }`}
            style={{ top: -10, left: `${left}%` }}
            initial={{ y: -10, rotate: 0, opacity: 0.7 }}
            animate={{
                y: ["0vh", "100vh"],
                rotate: [0, 360],
                opacity: [0.7, 0]
            }}
            transition={{
                duration: 3,
                ease: "easeInOut",
                delay: delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 2
            }}
        />
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
                                <p className="text-gray-600 mb-6">Please provide your information to get started</p>

                                {error && (
                                    <motion.div
                                        className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {formData.dateOfBirth && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Selected: {formatDateForDisplay(formData.dateOfBirth)}
                                                {formData.age !== null && ` | You're ${formData.age} years old`}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., +1 (555) 123-4567"
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-md font-medium text-gray-700 mb-3">Address Information*</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Street*</label>
                                                <input
                                                    type="text"
                                                    name="address.street"
                                                    value={formData.address.street}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="123 Main St"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                                                    <input
                                                        type="text"
                                                        name="address.city"
                                                        value={formData.address.city}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="New York"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                                                    <input
                                                        type="text"
                                                        name="address.state"
                                                        value={formData.address.state}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="NY"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code*</label>
                                                    <input
                                                        type="text"
                                                        name="address.postalCode"
                                                        value={formData.address.postalCode}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="10001"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country*</label>
                                                    <input
                                                        type="text"
                                                        name="address.country"
                                                        value={formData.address.country}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="United States"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-500 ease-in-out ${
                                                isSubmitting
                                                    ? "bg-gray-400 animate-pulse"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                "Complete Profile"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                className="flex flex-col items-center justify-center py-12 relative"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Confetti animation - slightly toned down */}
                                {[...Array(10)].map((_, i) => (
                                    <ConfettiPiece
                                        key={i}
                                        delay={i * 0.2}
                                        left={Math.random() * 100}
                                    />
                                ))}

                                {/* Welcome message at top - KEEPING THE ORIGINAL STRUCTURE */}
                                <motion.div
                                    className="mb-6 text-center"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Welcome, {formData.name}!
                                    </h2>
                                    <p className="text-md text-gray-600">
                                        Please sign in again, you'll be redirected in {countdown} seconds...
                                    </p>
                                </motion.div>

                                {/* Enhanced checkmark animation - KEEPING THE ORIGINAL */}
                                <motion.div
                                    className="relative mb-6"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.3
                                    }}
                                >
                                    <div className="h-24 w-24 rounded-full border-4 border-green-500 flex items-center justify-center">
                                        <motion.svg
                                            className="h-12 w-12 text-green-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.6, delay: 0.5 }}
                                        >
                                            <motion.path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.6, delay: 0.5 }}
                                            />
                                        </motion.svg>
                                    </div>
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-green-100 opacity-50"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 0.8, 0.5]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />

                                    {/* Decorative elements - slightly toned down */}
                                    <motion.div
                                        className="absolute -top-2 -right-2 h-4 w-4 bg-blue-400 rounded-full"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <motion.div
                                        className="absolute -bottom-2 -left-2 h-4 w-4 bg-purple-400 rounded-full"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.5
                                        }}
                                    />
                                </motion.div>

                                {/* Progress bar for countdown - KEEPING ORIGINAL */}
                                <div className="w-full max-w-xs mb-6 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        className="bg-green-500 h-2.5 rounded-full"
                                        initial={{ width: "100%" }}
                                        animate={{ width: "0%" }}
                                        transition={{
                                            duration: 7, // Updated to match 7 seconds
                                            ease: "linear"
                                        }}
                                    />
                                </div>

                                {/* Success message box - KEEPING ORIGINAL STRUCTURE */}
                                <motion.div
                                    className="w-full bg-green-50 border-l-4 border-green-500 p-5 rounded-r shadow-md"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                >
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-green-700">
                                                Your profile has been successfully updated.<br />
                                                <motion.span
                                                    className="font-medium"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 1 }}
                                                >
                                                    Your ID: <span className="bg-green-100 px-2 py-1 rounded">{userId}</span>
                                                </motion.span><br />
                                                <span className="text-xs mt-2 inline-block">Please sign in again to refresh your profile.</span>
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}