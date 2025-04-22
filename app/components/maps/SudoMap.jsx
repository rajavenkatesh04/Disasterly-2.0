"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import DisasterLegend from "./DisasterLegend";
import { fetchDisasterData } from "./disasterServices";

// Map container style
const containerStyle = {
    width: "100%",
    height: "100%"
};

// Default center position - Adjusted to be more centered on India for better NCS data visibility
const defaultCenter = {
    lat: 22, // More centered on India
    lng: 78  // More centered on India
};

// Map options
const mapOptions = {
    minZoom: 2,
    maxZoom: 18,
    mapTypeControl: true,
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeId: "terrain",
    styles: [
        {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [{ color: "#4a4a4a" }]
        },
        {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [{ color: "#c9e9ff" }]
        }
    ]
};

export default function SudoMap() {
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState("Loading...");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const mapRef = useRef(null);
    const hasFetched = useRef(false); // Changed to always fetch on initial load

    // Load Google Maps API
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    // Function to get marker icon based on disaster type and magnitude
    const getMarkerIcon = (disaster) => {
        if (!window.google) return null;

        let color;
        let scale = 1;
        let strokeColor = "#ffffff"; // Default stroke color

        // Set color and scale based on disaster type and magnitude
        switch (disaster.type) {
            case "earthquake":
                // Different border color for different sources
                strokeColor = disaster.source === "NCS" ? "#ff8c00" : "#ffffff";

                if (disaster.magnitude >= 6.0) {
                    color = "#d7191c"; // Red for major
                    scale = 1.2;
                } else if (disaster.magnitude >= 5.0) {
                    color = "#fdae61"; // Orange for moderate
                    scale = 1;
                } else if (disaster.magnitude >= 4.0) {
                    color = "#ffffbf"; // Yellow for light
                    scale = 0.8;
                } else {
                    color = "#1a9641"; // Green for minor
                    scale = 0.6;
                }
                break;
            case "tsunami":
                color = "#0000ff"; // Blue for tsunami
                scale = 1.2;
                break;
            case "fire":
                color = "#ff4500"; // OrangeRed for fires
                scale = 1;
                break;
            case "weather":
                color = "#800080"; // Purple for severe weather
                scale = 0.9;
                break;
            case "flood":
                color = "#00aaff"; // Light blue for floods
                scale = 1;
                break;
            default:
                color = "#808080"; // Gray for unknown
                scale = 0.8;
        }

        // Size based on magnitude and type
        const size = Math.max(disaster.magnitude * 2, 5) * scale;

        // Create SVG circle with stroke color based on source
        const svg = `
        <svg height="${size * 2}" width="${size * 2}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size}" cy="${size}" r="${size}" fill="${color}" fill-opacity="0.7" stroke="${strokeColor}" stroke-width="1.5" />
        </svg>
    `;

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            scaledSize: new window.google.maps.Size(size * 2, size * 2),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(size, size)
        };
    };

    const loadDisasterData = async () => {
        setLoading(true);
        try {
            const { data, sources, timestamp } = await fetchDisasterData();
            setDisasters(data);
            setDataSource(sources);
            setLastUpdated(timestamp);
            setError(null);
            hasFetched.current = true;
            sessionStorage.setItem("disasterDataFetched", "true");
        } catch (err) {
            console.error("Error loading disaster data:", err);
            setError("Failed to load disaster data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const { data, sources, timestamp } = await fetchDisasterData();
            setDisasters(data);
            setDataSource(sources);
            setLastUpdated(timestamp);
            setError(null);
            sessionStorage.setItem("disasterDataFetched", "true");
        } catch (err) {
            console.error("Error refreshing disaster data:", err);
            setError("Failed to refresh disaster data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDisasterData();

        // Add auto-refresh every 15 minutes
        const intervalId = setInterval(() => {
            refreshData();
        }, 15 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="live-disaster-map" style={{ height: "100%", width: "100%", position: "relative" }}>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={3} // Increased default zoom level for better visibility of India
                    options={mapOptions}
                    onLoad={onMapLoad}
                >
                    {disasters.map((disaster) => (
                        <Marker
                            key={disaster.id}
                            position={{ lat: disaster.lat, lng: disaster.lng }}
                            icon={getMarkerIcon(disaster)}
                            onClick={() => setSelectedDisaster(disaster)}
                        />
                    ))}

                    {selectedDisaster && (
                        <InfoWindow
                            position={{ lat: selectedDisaster.lat, lng: selectedDisaster.lng }}
                            onCloseClick={() => setSelectedDisaster(null)}
                        >
                            <div className="max-w-xs">
                                <h3 className="font-bold text-sm">{selectedDisaster.title}</h3>
                                <p className="text-xs mt-1">{selectedDisaster.description}</p>
                                <p className="text-xs mt-1"><strong>Date:</strong> {new Date(selectedDisaster.date).toLocaleString()}</p>
                                <p className="text-xs mt-1"><strong>Source:</strong> {selectedDisaster.source || "Unknown"}</p>
                                {selectedDisaster.url && (
                                    <p className="text-xs mt-1">
                                        <a href={selectedDisaster.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">More Info</a>
                                    </p>
                                )}
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <p className="ml-3">Loading Maps...</p>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>Loading disaster data...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute bottom-12 left-0 right-0 mx-auto w-3/4 md:w-1/2 bg-red-100 text-red-800 p-2 text-center rounded-lg shadow-lg z-10">
                    <p>{error}</p>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white p-1.5 text-xs text-center z-10 flex justify-between items-center">
                <span>Data Sources: {dataSource} | Last Updated: {lastUpdated || "Loading..."}</span>
                <button
                    onClick={refreshData}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded ml-2"
                >
                    Refresh Data
                </button>
            </div>

            <DisasterLegend />
        </div>
    );
}