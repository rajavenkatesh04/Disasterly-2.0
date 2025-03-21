"use client"
import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const AboutSection = () => {
    // Animation for fade-in effect
    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8 } }
    };

    // Animation for elements that slide in
    const slideIn = {
        hidden: { x: -50, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
    };

    // Subtle background animation
    useEffect(() => {
        // This would normally contain the logic for any JavaScript animations
        // For this example, we're using framer-motion instead
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            {/* Back button with hover animation */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-300 mb-8 group">
                    <ArrowLeft className="mr-2 group-hover:translate-x-[-5px] transition-transform duration-300" size={20} />
                    <span className="font-medium">Back to Home</span>
                </Link>
            </motion.div>

            {/* Main content container */}
            <div className="max-w-4xl mx-auto">
                <motion.div
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    {/* Header with logo placeholder */}
                    <div className="bg-indigo-600 p-8 relative overflow-hidden">
                        <motion.div
                            className="relative z-10"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <h1 className="text-4xl font-bold text-white mb-2">Disasterly</h1>
                            <p className="text-indigo-100 text-xl">Always there when you need us most</p>
                        </motion.div>

                        {/* Abstract shapes in background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-20 -mt-20 opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-700 rounded-full -ml-10 -mb-10 opacity-20"></div>
                    </div>

                    {/* About content */}
                    <div className="p-8">
                        <motion.div
                            className="mb-8 text-gray-700"
                            variants={slideIn}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Our Mission</h2>
                            <p className="mb-4 text-lg leading-relaxed">
                                Disasterly was born from a simple yet powerful idea: everyone deserves to feel safe, especially in moments of crisis. The platform provides the reassurance that help is just a tap away, no matter where people are or what emergency they're facing.
                            </p>
                            <p className="text-lg leading-relaxed">
                                The system connects those in need with immediate assistance, critical resources, and real-time guidance during emergencies. With Disasterly, no one is ever alone in a crisis — it serves as a digital guardian, always ready to respond when someone reaches out for help.
                            </p>
                        </motion.div>

                        <motion.div
                            className="mb-8"
                            variants={slideIn}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.6 }}
                        >
                            <h2 className="text-2xl font-semibold text-indigo-800 mb-4">The Story Behind Disasterly</h2>
                            <p className="mb-4 text-lg leading-relaxed text-gray-700">
                                Disasterly was created by Raja, a student at SRM Institute of Science and Technology in Chennai, India. The idea was born in the aftermath of the devastating Chennai floods of 2015, when Raja witnessed firsthand the chaos and communication breakdown that can occur during natural disasters.
                            </p>
                            <p className="text-lg leading-relaxed text-gray-700">
                                What began as a college project developed out of necessity has evolved into a comprehensive emergency response platform. Raja's vision combined cutting-edge technology with compassionate design to create a system that makes disaster response faster, more efficient, and more accessible to everyone, especially in regions prone to natural calamities.
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.7 }}
                        >
                            <div className="bg-indigo-50 p-6 rounded-xl">
                                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg text-indigo-800 mb-2">Rapid Response</h3>
                                <p className="text-gray-700">The system connects users with emergency services in seconds, not minutes, critical during floods and other natural disasters.</p>
                            </div>

                            <div className="bg-indigo-50 p-6 rounded-xl">
                                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg text-indigo-800 mb-2">Always Secure</h3>
                                <p className="text-gray-700">Personal information and location data are protected with enterprise-grade encryption, even when infrastructure is compromised.</p>
                            </div>

                            <div className="bg-indigo-50 p-6 rounded-xl">
                                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg text-indigo-800 mb-2">Community Powered</h3>
                                <p className="text-gray-700">The platform leverages local communities and resources for faster, more effective emergency assistance, especially critical in dense urban areas.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.7 }}
                        >
                            <h3 className="text-xl font-bold mb-3">Ready When You Need Us</h3>
                            <p className="mb-4">
                                Disasterly stands as a trusted companion through any emergency. From natural disasters like floods to personal crises, the platform provides not just tools, but peace of mind for communities that have historically been vulnerable to calamities.
                            </p>
                            <p className="text-sm opacity-90">
                                "During the Chennai floods, I saw how critical information and emergency response coordination could have saved lives and reduced suffering. Disasterly exists to bridge that gap and ensure no one feels helpless in the face of disaster." — Raja, Founder
                            </p>
                        </motion.div>

                        <motion.div
                            className="mt-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.7 }}
                        >
                            <p className="text-gray-500 text-sm">
                                © 2025 Disasterly Project. Created with ❤️ at SRM Institute of Science and Technology, Chennai.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutSection;