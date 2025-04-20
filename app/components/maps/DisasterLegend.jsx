// app/components/maps/DisasterLegend.js
import React from 'react';

export default function DisasterLegend() {
    return (
        <div className="absolute top-2 right-2 bg-white p-2 rounded shadow-lg text-xs z-10 max-w-xs">
            <h3 className="font-bold mb-1">Disaster Types</h3>
            <ul className="space-y-1">
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
    );
}