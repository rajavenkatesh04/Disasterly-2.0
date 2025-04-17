"use client"

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NoAccessPage() {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = '/';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border border-red-200"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                </motion.div>

                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold text-gray-800 mb-4"
                >
                    Access Denied
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-gray-600 mb-2">Current role: <span className="text-red-600 font-medium">User</span></p>
                    <p className="text-gray-600 mb-4">Expected role: <span className="text-green-600 font-medium">Admin</span></p>

                    <div className="mb-6 relative">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-red-500"
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 5, ease: "linear" }}
                            />
                        </div>
                        <p className="text-gray-500 mt-2">
                            Redirecting to homepage in <span className="text-gray-800 font-bold">{countdown}</span> seconds...
                        </p>
                    </div>

                    <motion.a
                        href="/"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md inline-flex items-center gap-2"
                    >
                        Return to Home
                    </motion.a>
                </motion.div>
            </motion.div>
        </div>
    );
}