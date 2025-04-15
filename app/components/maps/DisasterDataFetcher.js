"use client";
import { useEffect, useState } from 'react';
import MapComponent from './MapComponent';

export default function DisasterDataFetcher() {
    const [disasters, setDisasters] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSource, setDataSource] = useState("USGS");
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchDisasterData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch earthquake data from USGS
            const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson");
            if (!response.ok) throw new Error(`USGS API Error: ${response.status}`);

            const data = await response.json();
            const earthquakes = data.features.map(feature => ({
                id: feature.id,
                title: `M${feature.properties.mag} - ${feature.properties.place}`,
                description: `Magnitude ${feature.properties.mag} earthquake at depth of ${feature.geometry.coordinates[2]}km. ${feature.properties.place}`,
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
                magnitude: feature.properties.mag,
                date: new Date(feature.properties.time).toISOString(),
                type: "earthquake",
                url: feature.properties.url
            }));

            setDisasters(earthquakes);
            setDataSource("USGS Earthquakes");
            setLastUpdated(new Date().toLocaleString());
        } catch (err) {
            console.error("Error fetching disaster data:", err);
            setError("Failed to fetch live disaster data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisasterData();
        const interval = setInterval(fetchDisasterData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="live-disaster-map" style={{ height: "100vh", width: "100%" }}>
            {loading ? (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading disaster data...</p>
                </div>
            ) : (
                <MapComponent disasters={disasters} />
            )}
            {error && (
                <div className="error-overlay">
                    <p>{error}</p>
                </div>
            )}
            <div className="map-footer">
                <p>
                    Data Source: {dataSource} | Last Updated: {lastUpdated || "Loading..."}
                </p>
            </div>
        </div>
    );
}