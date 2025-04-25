"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import ActionButtons from "@/app/components/ActionButtons";
import EmergencyContacts from "@/app/components/EmergencyContacts";

// Dynamically import the Google Maps implementation with SSR disabled and preload
const SudoMap = dynamic(() => import("@/app/components/maps/SudoMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg" />,
});

// Utility: Debounce function to limit resize event frequency
function debounce(fn, ms) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), ms);
    };
}

// Placeholder for auth hook (replace with your actual auth logic)
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate auth check (replace with real auth logic)
        setTimeout(() => {
            setIsAuthenticated(true);
            setIsLoading(false);
        }, 1000); // Reduced delay for demo; adjust as needed
    }, []);

    return { isAuthenticated, isLoading };
};

export default function HomePage() {
    const [mapHeight, setMapHeight] = useState("400px");
    const { isAuthenticated, isLoading } = useAuth();

    // Calculate map height after DOM is painted
    useLayoutEffect(() => {
        if (!isAuthenticated) return;

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

        // Debounced resize handler
        const debouncedUpdate = debounce(updateMapHeight, 100);

        // Initial height calculation
        updateMapHeight();

        window.addEventListener("resize", debouncedUpdate);
        return () => window.removeEventListener("resize", debouncedUpdate);
    }, [isAuthenticated]);

    // Skeleton loader during authentication
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <section className="mb-6 mt-20">
                    <div className="rounded-xl bg-gray-200 h-32 animate-pulse" />
                </section>
                <div className="block md:grid md:grid-cols-2 gap-6">
                    <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded-lg mb-6 md:mb-0" />
                    <div id="rightColumn" className="space-y-6">
                        <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />
                        <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    // Render nothing if not authenticated (optional, depends on your auth flow)
    if (!isAuthenticated) return null;

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
                <div
                    style={{ height: mapHeight }}
                    className="transition-all duration-300 rounded-lg overflow-hidden shadow-md"
                >
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