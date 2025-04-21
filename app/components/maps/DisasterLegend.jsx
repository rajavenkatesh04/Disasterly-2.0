import React, { useState } from 'react';

export default function DisasterLegend() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleLegend = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="absolute top-2 right-2 z-10">
            {/* Hamburger Button for Mobile */}
            <button
                className="md:hidden bg-white p-2 rounded shadow-lg focus:outline-none"
                onClick={toggleLegend}
                aria-label="Toggle legend"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                    />
                </svg>
            </button>

            {/* Legend Content */}
            <div
                className={`bg-white p-4 rounded shadow-lg text-xs max-w-xs ${
                    isOpen ? 'block' : 'hidden'
                } md:block transition-all duration-300 ease-in-out`}
            >
                <h3 className="font-bold mb-2">Disaster Types</h3>
                <ul className="space-y-2">
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                        <span>Earthquake (Major)</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-orange-400 mr-2"></span>
                        <span>Earthquake (Moderate)</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-300 mr-2"></span>
                        <span>Earthquake (Light)</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2"></span>
                        <span>Earthquake (Minor)</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
                        <span>Tsunami</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        <span>Wildfire</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-purple-700 mr-2"></span>
                        <span>Severe Weather</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                        <span>Flood</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}