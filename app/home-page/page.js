"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ActionButtons from "@/app/components/ActionButtons";
import EmergencyContacts from "@/app/components/EmergencyContacts";

// Load Map component dynamically with no SSR since Leaflet requires window object
// const MapComponent = dynamic(() => import("@/app/components/maps/MapComponent"), { ssr: false });

export default function HomePage() {
    // Define a height for the map
    const mapHeight = "400px";

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Hero Section - Always at top */}
            <section className="mb-6 mt-20">
                <div className="rounded-xl overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Disasterly</h1>
                    <p className="text-white/90 text-sm md:text-base">
                        A Project aimed at unifying critical services to minimise loss of lives....
                        <button type="button" onClick={() => (window.location.href = "/about")}>
                            Learn more.
                        </button>
                    </p>
                </div>
            </section>

            {/* Mobile Layout (Stack) */}
            <div className="block md:hidden space-y-6">
                {/* Map - Full width on mobile */}
                <div className="h-220 w-full">
                    {/*<MapComponent />*/}
                    {/*<SudoMap />*/}
                </div>

                {/* Action Buttons */}
                <ActionButtons />

                {/* Emergency Contacts */}
                <EmergencyContacts />
            </div>

            {/* Tablet/Desktop Layout (Side by Side) */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
                {/* Left Side - Map */}
                <div style={{ height: mapHeight }} className="transition-all duration-300">
                    {/*<MapComponent />*/}
                    {/*<SudoMap />*/}
                </div>

                {/* Right Side - Action Buttons and Emergency Contacts */}
                <div id="rightColumn" className="space-y-6">
                    <ActionButtons />
                    <EmergencyContacts />
                </div>
            </div>
        </div>
    );
}
