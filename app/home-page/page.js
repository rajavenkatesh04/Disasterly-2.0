"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ActionButtons from "@/app/components/ActionButtons";
import EmergencyContacts from "@/app/components/EmergencyContacts";

// Dynamically import the Google Maps implementation with SSR disabled
const SudoMap = dynamic(() => import("@/app/components/maps/SudoMap"), { ssr: false });

export default function HomePage() {
    const [mapHeight, setMapHeight] = useState("400px");

    useEffect(() => {
        const updateMapHeight = () => {
            if (window.innerWidth >= 768) {
                const rightColumnHeight = document.getElementById("rightColumn")?.clientHeight;
                if (rightColumnHeight) {
                    setMapHeight(`${rightColumnHeight}px`);
                }
            } else {
                setMapHeight("400px");
            }
        };

        // Delay to ensure DOM elements are rendered
        setTimeout(updateMapHeight, 100);

        window.addEventListener("resize", updateMapHeight);
        return () => window.removeEventListener("resize", updateMapHeight);
    }, []);

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Hero Section */}
            <section className="mb-6 mt-20">
                <div className="rounded-xl overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Disasterly</h1>
                    <p className="text-white/90 text-sm md:text-base">
                        A Project aimed at unifying critical services to minimise loss of lives....
                        <button
                            type="button"
                            className="ml-2 underline"
                            onClick={() => (window.location.href = "/about")}
                        >
                            Learn more.
                        </button>
                    </p>
                </div>
            </section>

            {/* Mobile Layout */}
            <div className="block md:hidden space-y-6">
                <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-md">
                    <SudoMap />
                </div>
                <ActionButtons />
                <EmergencyContacts />
            </div>

            {/* Tablet/Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
                <div style={{ height: mapHeight }} className="transition-all duration-300 rounded-lg overflow-hidden shadow-md">
                    <SudoMap />
                </div>
                <div id="rightColumn" className="space-y-6">
                    <ActionButtons />
                    <EmergencyContacts />
                </div>
            </div>
        </div>
    );
}