"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function FeatureInProgress() {
    const router = useRouter();

    const handleHomeClick = () => {
        router.push('/');  // Redirects to the home page
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">🚧 Under Development</h1>
                <p className="text-gray-600 mb-6">
                    This feature is currently under development. Please check back later!
                </p>
                <div className="space-x-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                        onClick={() => alert('Thanks for your patience!')}
                    >
                        Notify Me
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                        onClick={handleHomeClick}
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
}