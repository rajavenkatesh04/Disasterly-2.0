import React from "react";

const Legend = () => {
    return (
        <div className="absolute bottom-15 left-3 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <h4 className="text-sm font-medium mb-2">Legend</h4>
            <div className="flex flex-col gap-2">
                {/* Major Earthquake */}
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#d7191c] mr-2"></span>
                    <span className="text-xs">Major Earthquake (6.0+)</span>
                </div>

                {/* Moderate Earthquake */}
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#fdae61] mr-2"></span>
                    <span className="text-xs">Moderate Earthquake (5.0-5.9)</span>
                </div>

                {/* Tsunami Warning */}
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#0000ff] mr-2"></span>
                    <span className="text-xs">Tsunami Warning</span>
                </div>

                {/* Active Fire */}
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#ff4500] mr-2"></span>
                    <span className="text-xs">Active Fire</span>
                </div>

                {/* Severe Weather */}
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#800080] mr-2"></span>
                    <span className="text-xs">Severe Weather</span>
                </div>
            </div>
        </div>
    );
};

export default Legend;