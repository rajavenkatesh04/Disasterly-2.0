"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const CircleMarker = dynamic(
    () => import("react-leaflet").then((mod) => mod.CircleMarker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);
const ZoomControl = dynamic(
    () => import("react-leaflet").then((mod) => mod.ZoomControl),
    { ssr: false }
);
const Legend = dynamic(
    () => import("./Legend").then((mod) => mod.default),
    { ssr: false }
);

export default function SudoMap() {
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [L, setLeaflet] = useState(null);
    const [dataSource, setDataSource] = useState("USGS");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
    const mapRef = useRef(null);

    // Handle window resize for responsive design
    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };

            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    // Initialize Leaflet on client side only
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Import Leaflet dynamically
            import("leaflet").then(leaflet => {
                setLeaflet(leaflet.default);

                // Fix Leaflet default icon issue
                delete leaflet.default.Icon.Default.prototype._getIconUrl;

                leaflet.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                });

                setMapReady(true);
            });
        }
    }, []);

    // Function to get color based on magnitude/severity
    const getColor = (magnitude) => {
        if (magnitude >= 6.0) return "#d7191c"; // Red for severe
        if (magnitude >= 5.0) return "#fdae61"; // Orange for significant
        if (magnitude >= 4.0) return "#ffffbf"; // Yellow for moderate
        return "#1a9641"; // Green for minor
    };

    // Function to get radius based on magnitude/severity
    const getRadius = (magnitude) => {
        return Math.max(magnitude * 3, 5);
    };

    // Function to fetch earthquake data from USGS (reliable, real-time source)
    const fetchUSGSEarthquakes = async () => {
        setLoading(true);
        setError(null);

        try {
            // USGS API - past hour all earthquakes (very recent data)
            const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson");

            if (!response.ok) {
                // If hourly fails, try daily data
                const dailyResponse = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
                if (!dailyResponse.ok) {
                    throw new Error(`USGS API Error: ${dailyResponse.status}`);
                }
                return await dailyResponse.json();
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching USGS data:", error);
            setError("Failed to fetch live earthquake data. Please try again.");
            return null;
        }
    };

    // Function to fetch tsunami warnings from NOAA
    const fetchTsunamiWarnings = async () => {
        try {
            // Using CORS proxy for NOAA feed
            const corsProxy = "https://corsproxy.io/?";
            const noaaUrl = "https://tsunami.gov/events/xml/PAAQAtom.xml";
            const response = await fetch(corsProxy + encodeURIComponent(noaaUrl));

            if (!response.ok) {
                console.warn("Failed to fetch tsunami warnings");
                return [];
            }

            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const entries = xmlDoc.querySelectorAll("entry");

            return Array.from(entries).map((entry, index) => {
                try {
                    const title = entry.querySelector("title")?.textContent || "Tsunami Warning";
                    const description = entry.querySelector("summary")?.textContent || "";
                    const published = entry.querySelector("published")?.textContent || "";

                    // Extract coordinates from geo:point if available
                    let lat, lng;
                    const point = entry.querySelector("georss\\:point")?.textContent;
                    if (point) {
                        [lat, lng] = point.split(" ").map(parseFloat);
                    } else {
                        // Default coordinates if not found (Pacific Ocean)
                        lat = 0;
                        lng = -150;
                    }

                    return {
                        id: `tsunami-${index}`,
                        title: title,
                        description: description,
                        lat: lat,
                        lng: lng,
                        magnitude: 7.5, // Treating tsunamis as high severity
                        date: new Date(published).toISOString(),
                        type: "tsunami"
                    };
                } catch (err) {
                    console.error("Error processing tsunami warning:", err);
                    return null;
                }
            }).filter(Boolean);
        } catch (error) {
            console.error("Error fetching tsunami data:", error);
            return [];
        }
    };

    // Function to fetch Active Fires data from NASA FIRMS
    const fetchWildfires = async () => {
        try {
            // Using FIRMS API with CORS proxy
            const corsProxy = "https://corsproxy.io/?";
            const firmsUrl = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/f2711fac71ba6786a6f48fe773821c33/VIIRS_NOAA20_NRT/world/1";
            const response = await fetch(corsProxy + encodeURIComponent(firmsUrl));

            if (!response.ok) {
                console.warn("Failed to fetch wildfire data");
                return [];
            }

            const text = await response.text();
            // Parse CSV data (simplified for this example)
            const lines = text.split("\n").filter(line => line.trim().length > 0);
            const headers = lines[0].split(",");

            // Find indices for important columns
            const latIndex = headers.indexOf("latitude");
            const lonIndex = headers.indexOf("longitude");
            const brightIndex = headers.indexOf("bright_ti4");
            const dateIndex = headers.indexOf("acq_date");

            // Skip header row and parse data rows
            const fireData = lines.slice(1).map((line, index) => {
                try {
                    const values = line.split(",");

                    if (values.length < Math.max(latIndex, lonIndex, brightIndex, dateIndex)) {
                        return null;
                    }

                    const lat = parseFloat(values[latIndex]);
                    const lng = parseFloat(values[lonIndex]);
                    const brightness = parseFloat(values[brightIndex]);
                    const date = values[dateIndex];

                    if (isNaN(lat) || isNaN(lng)) {
                        return null;
                    }

                    // Brightness temperature can indicate fire intensity
                    // Higher values indicate more intense fires
                    const severity = Math.min(Math.max(brightness / 100, 2), 5);

                    return {
                        id: `fire-${index}`,
                        title: `Active Fire - Brightness: ${brightness.toFixed(1)}K`,
                        description: `Active fire detected by VIIRS satellite`,
                        lat: lat,
                        lng: lng,
                        magnitude: severity,
                        date: date,
                        type: "fire"
                    };
                } catch (err) {
                    console.error("Error processing fire data:", err);
                    return null;
                }
            }).filter(Boolean);

            // Limit to strongest/most recent fires to avoid overwhelming the map
            return fireData.sort((a, b) => b.magnitude - a.magnitude).slice(0, 100);
        } catch (error) {
            console.error("Error fetching wildfire data:", error);
            return [];
        }
    };

    // Function to fetch severe weather data from NOAA
    const fetchSevereWeather = async () => {
        try {
            const corsProxy = "https://corsproxy.io/?";
            const noaaUrl = "https://api.weather.gov/alerts/active?status=actual&message_type=alert";
            const response = await fetch(corsProxy + encodeURIComponent(noaaUrl));

            if (!response.ok) {
                console.warn("Failed to fetch weather alerts");
                return [];
            }

            const data = await response.json();

            if (!data.features || !Array.isArray(data.features)) {
                return [];
            }

            return data.features.map((feature, index) => {
                try {
                    if (!feature.properties || !feature.geometry) {
                        return null;
                    }

                    const properties = feature.properties;
                    const title = properties.headline || properties.event || "Weather Alert";
                    const description = properties.description || "No description available";
                    const severity = properties.severity === "Extreme" ? 5 :
                        properties.severity === "Severe" ? 4 :
                            properties.severity === "Moderate" ? 3 : 2;

                    // Extract coordinates from geometry
                    let lat, lng;
                    if (feature.geometry && feature.geometry.type === "Point" && Array.isArray(feature.geometry.coordinates)) {
                        [lng, lat] = feature.geometry.coordinates;
                    } else if (feature.properties.geocode && Array.isArray(feature.properties.geocode.SAME)) {
                        // If we have SAME codes, use the first one's center (simplified)
                        lat = 40; // Simplified - would need a SAME code lookup
                        lng = -100; // Simplified - would need a SAME code lookup
                    } else {
                        return null; // Skip if no location data
                    }

                    return {
                        id: `weather-${index}`,
                        title: title,
                        description: description.substring(0, 300) + "...",
                        lat: lat,
                        lng: lng,
                        magnitude: severity,
                        date: properties.sent || properties.effective || new Date().toISOString(),
                        type: "weather"
                    };
                } catch (err) {
                    console.error("Error processing weather alert:", err);
                    return null;
                }
            }).filter(Boolean);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            return [];
        }
    };

    // NEW FUNCTION: Fetch flood data from multiple sources
    const fetchFloodData = async () => {
        try {
            const floods = [];

            // 1. Try Global Flood Monitoring System (GFMS) via NASA GeoServer
            try {
                const corsProxy = "https://corsproxy.io/?";
                const gfmsUrl = "https://pmmpublisher.pps.eosdis.nasa.gov/geoserver/GFMS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GFMS:MaximumFloodDetectionThisWeek&outputFormat=application%2Fjson";

                const gfmsResponse = await fetch(corsProxy + encodeURIComponent(gfmsUrl));

                if (gfmsResponse.ok) {
                    const gfmsData = await gfmsResponse.json();

                    if (gfmsData.features && Array.isArray(gfmsData.features)) {
                        const gfmsFloods = gfmsData.features.map((feature, index) => {
                            try {
                                const coordinates = feature.geometry.coordinates;
                                // GFMS data often has polygon or multipolygon, so we need to get a representative point
                                let lat, lng;

                                if (feature.geometry.type === "Point") {
                                    lng = coordinates[0];
                                    lat = coordinates[1];
                                } else if (feature.geometry.type === "Polygon") {
                                    // Use the first point of the polygon as representative
                                    lng = coordinates[0][0][0];
                                    lat = coordinates[0][0][1];
                                } else if (feature.geometry.type === "MultiPolygon") {
                                    // Use the first point of the first polygon
                                    lng = coordinates[0][0][0][0];
                                    lat = coordinates[0][0][0][1];
                                } else {
                                    // Skip unrecognized geometry types
                                    return null;
                                }

                                // Get flood intensity from properties if available
                                const floodIntensity = feature.properties.flood_intensity ||
                                    feature.properties.depth ||
                                    feature.properties.severity || 3;

                                return {
                                    id: `flood-gfms-${index}`,
                                    title: `Flood Detection - GFMS`,
                                    description: `Flooding detected by NASA Global Flood Monitoring System. Estimated flood depth/intensity: ${floodIntensity}`,
                                    lat: lat,
                                    lng: lng,
                                    magnitude: Math.min(Math.max(floodIntensity, 2), 5), // Normalize between 2-5
                                    date: new Date().toISOString(), // Often the current data is recent
                                    type: "flood"
                                };
                            } catch (err) {
                                console.error("Error processing GFMS flood data:", err);
                                return null;
                            }
                        }).filter(Boolean);

                        floods.push(...gfmsFloods);
                    }
                }
            } catch (gfmsError) {
                console.error("Error fetching GFMS flood data:", gfmsError);
            }

            // 2. Try Dartmouth Flood Observatory data
            try {
                const corsProxy = "https://corsproxy.io/?";
                const dfoUrl = "https://floodobservatory.colorado.edu/temp/FloodArchive.json";

                const dfoResponse = await fetch(corsProxy + encodeURIComponent(dfoUrl));

                if (dfoResponse.ok) {
                    const dfoData = await dfoResponse.json();

                    if (dfoData && Array.isArray(dfoData)) {
                        // Filter for only recent floods (last 30 days)
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                        const dfoFloods = dfoData
                            .filter(flood => {
                                // Parse date from DFO format if available
                                if (flood.began) {
                                    const floodDate = new Date(flood.began);
                                    return floodDate > thirtyDaysAgo;
                                }
                                return false;
                            })
                            .map((flood, index) => {
                                try {
                                    // Extract coordinates from DFO data
                                    const lat = parseFloat(flood.centroid_lat || flood.latitude);
                                    const lng = parseFloat(flood.centroid_lon || flood.longitude);

                                    if (isNaN(lat) || isNaN(lng)) {
                                        return null;
                                    }

                                    // DFO includes severity ratings (1-3)
                                    const severity = parseInt(flood.severity) || 2;
                                    // Normalize to our scale (2-5)
                                    const normalizedSeverity = severity === 3 ? 5 :
                                        severity === 2 ? 4 : 3;

                                    return {
                                        id: `flood-dfo-${index}`,
                                        title: `${flood.country || "Region"} Flood - Severity ${severity}`,
                                        description: `${flood.main_cause || "Flooding"} in ${flood.country || "region"}. ${flood.dead ? `Fatalities: ${flood.dead}.` : ""} ${flood.displaced ? `Displaced: ${flood.displaced}.` : ""}`,
                                        lat: lat,
                                        lng: lng,
                                        magnitude: normalizedSeverity,
                                        date: flood.began || new Date().toISOString(),
                                        type: "flood"
                                    };
                                } catch (err) {
                                    console.error("Error processing DFO flood data:", err);
                                    return null;
                                }
                            }).filter(Boolean);

                        floods.push(...dfoFloods);
                    }
                }
            } catch (dfoError) {
                console.error("Error fetching DFO flood data:", dfoError);
            }

            // 3. Add Copernicus Emergency Management Service data
            try {
                const corsProxy = "https://corsproxy.io/?";
                const copernicusUrl = "https://emergency.copernicus.eu/mapping/feed/activation/FLOOD/rss";

                const copernicusResponse = await fetch(corsProxy + encodeURIComponent(copernicusUrl));

                if (copernicusResponse.ok) {
                    const text = await copernicusResponse.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");
                    const items = xmlDoc.querySelectorAll("item");

                    const copernicusFloods = Array.from(items).map((item, index) => {
                        try {
                            const title = item.querySelector("title")?.textContent || "Flood Event";
                            const description = item.querySelector("description")?.textContent || "";
                            const pubDate = item.querySelector("pubDate")?.textContent || "";

                            // Extract location from title or description
                            const locationMatch = title.match(/in ([^,]+),\s*([^(]+)/) ||
                                description.match(/in ([^,]+),\s*([^(]+)/);

                            let lat, lng;

                            if (locationMatch && locationMatch.length >= 3) {
                                // Try to get coordinates using a simple geocoding approximation
                                // For a real app, use a proper geocoding service
                                const country = locationMatch[2].trim();

                                // Simple country centroid mapping (very approximate)
                                // In a real app, use a geocoding service like Google Maps, Mapbox, or OpenStreetMap
                                const countryCentroids = {
                                    "Italy": [42.5, 12.5],
                                    "Spain": [40.0, -4.0],
                                    "France": [46.0, 2.0],
                                    "Germany": [51.0, 10.0],
                                    "UK": [54.0, -2.0],
                                    "United States": [39.8, -98.6],
                                    "Canada": [56.0, -96.0],
                                    "Australia": [-25.0, 135.0],
                                    "India": [20.0, 77.0],
                                    "China": [35.0, 103.0],
                                    "Brazil": [-10.0, -55.0],
                                    // Add more as needed
                                };

                                if (countryCentroids[country]) {
                                    [lat, lng] = countryCentroids[country];
                                } else {
                                    // Default to a rough guess if country not found
                                    lat = 0;
                                    lng = 0;
                                }
                            } else {
                                // Default coordinates if location not found
                                lat = 0;
                                lng = 0;
                            }

                            // Parse severity from text if available
                            let severity = 3; // Default moderate
                            if (description.includes("severe") || description.includes("major")) {
                                severity = 5;
                            } else if (description.includes("significant")) {
                                severity = 4;
                            }

                            return {
                                id: `flood-copernicus-${index}`,
                                title: title,
                                description: description.substring(0, 300) + "...",
                                lat: lat,
                                lng: lng,
                                magnitude: severity,
                                date: new Date(pubDate).toISOString(),
                                type: "flood"
                            };
                        } catch (err) {
                            console.error("Error processing Copernicus flood data:", err);
                            return null;
                        }
                    }).filter(Boolean);

                    floods.push(...copernicusFloods);
                }
            } catch (copernicusError) {
                console.error("Error fetching Copernicus flood data:", copernicusError);
            }

            // 4. Parse flood-specific alerts from weather data if no dedicated flood data was found
            if (floods.length === 0) {
                try {
                    const corsProxy = "https://corsproxy.io/?";
                    const noaaUrl = "https://api.weather.gov/alerts/active?status=actual&message_type=alert&event=Flood";
                    const response = await fetch(corsProxy + encodeURIComponent(noaaUrl));

                    if (response.ok) {
                        const data = await response.json();

                        if (data.features && Array.isArray(data.features)) {
                            const noaaFloods = data.features.map((feature, index) => {
                                try {
                                    if (!feature.properties) {
                                        return null;
                                    }

                                    const properties = feature.properties;
                                    const title = properties.headline || properties.event || "Flood Alert";
                                    const description = properties.description || "No description available";

                                    // Extract coordinates from geometry or geocode
                                    let lat, lng;
                                    if (feature.geometry && feature.geometry.type === "Point" &&
                                        Array.isArray(feature.geometry.coordinates)) {
                                        [lng, lat] = feature.geometry.coordinates;
                                    } else if (feature.properties.geocode &&
                                        Array.isArray(feature.properties.geocode.SAME)) {
                                        // Simplified - in a real app, use a SAME code geocoder
                                        lat = 40;
                                        lng = -100;
                                    } else {
                                        return null; // Skip if no location data
                                    }

                                    const severity = properties.severity === "Extreme" ? 5 :
                                        properties.severity === "Severe" ? 4 :
                                            properties.severity === "Moderate" ? 3 : 2;

                                    return {
                                        id: `flood-noaa-${index}`,
                                        title: title,
                                        description: description.substring(0, 300) + "...",
                                        lat: lat,
                                        lng: lng,
                                        magnitude: severity,
                                        date: properties.sent || properties.effective || new Date().toISOString(),
                                        type: "flood"
                                    };
                                } catch (err) {
                                    console.error("Error processing NOAA flood data:", err);
                                    return null;
                                }
                            }).filter(Boolean);

                            floods.push(...noaaFloods);
                        }
                    }
                } catch (noaaFloodError) {
                    console.error("Error fetching NOAA flood alerts:", noaaFloodError);
                }
            }

            // 5. Add some simulated flood data for demo purposes if no real data was found
            // Remove this in a production environment!
            if (floods.length === 0) {
                console.warn("No real flood data found, adding simulated data for demonstration");

                // Sample flood-prone areas around the world
                const floodProneAreas = [
                    { name: "Bangladesh Delta", lat: 23.8, lng: 90.4, severity: 4 },
                    { name: "Mississippi Basin, USA", lat: 29.9, lng: -90.1, severity: 3 },
                    { name: "Ganges Basin, India", lat: 25.3, lng: 83.0, severity: 5 },
                    { name: "Mekong Delta, Vietnam", lat: 10.0, lng: 105.8, severity: 4 },
                    { name: "Amazon Basin, Brazil", lat: -3.1, lng: -60.0, severity: 3 },
                    { name: "Yangtze River, China", lat: 30.6, lng: 114.3, severity: 4 },
                    { name: "Rhine River, Germany", lat: 51.2, lng: 6.8, severity: 3 },
                    { name: "Nile Delta, Egypt", lat: 30.8, lng: 31.0, severity: 4 }
                ];

                // Only add simulated data if we have nothing else
                const simulatedFloods = floodProneAreas.map((area, index) => {
                    return {
                        id: `flood-simulated-${index}`,
                        title: `Simulated Flood - ${area.name}`,
                        description: `This is a simulated flood event for demonstration purposes in an area prone to flooding. In a production environment, this would be replaced with real-time data from flood monitoring agencies.`,
                        lat: area.lat,
                        lng: area.lng,
                        magnitude: area.severity,
                        date: new Date().toISOString(),
                        type: "flood",
                        simulated: true // Flag to indicate this is simulated data
                    };
                });

                floods.push(...simulatedFloods);
            }

            return floods;
        } catch (error) {
            console.error("Error in fetch flood data:", error);
            return [];
        }
    };

    // Main function to aggregate disaster data from multiple sources
    const fetchDisasterData = async () => {
        setLoading(true);
        setDataSource("Multiple Sources");

        try {
            // Get USGS earthquake data (most reliable real-time source)
            const usgsData = await fetchUSGSEarthquakes();

            let allDisasters = [];

            if (usgsData && usgsData.features) {
                const earthquakes = usgsData.features.map((feature, index) => {
                    const props = feature.properties;
                    const coordinates = feature.geometry.coordinates;

                    return {
                        id: props.ids || `eq-${index}`,
                        title: props.title || `M${props.mag} - ${props.place}`,
                        description: `Magnitude ${props.mag} earthquake at depth of ${coordinates[2]}km. ${props.place}`,
                        lat: coordinates[1],  // Latitude is second in GeoJSON
                        lng: coordinates[0],  // Longitude is first in GeoJSON
                        magnitude: props.mag, // Actual earthquake magnitude
                        date: new Date(props.time).toISOString(),
                        type: "earthquake",
                        url: props.url
                    };
                });

                allDisasters = [...earthquakes];
                setDataSource("USGS Earthquakes");
            }

            // Try to fetch tsunami data
            try {
                const tsunamis = await fetchTsunamiWarnings();
                if (tsunamis && tsunamis.length > 0) {
                    allDisasters = [...allDisasters, ...tsunamis];
                    setDataSource(prev => prev + ", NOAA Tsunamis");
                }
            } catch (tsunamiError) {
                console.error("Error fetching tsunami data:", tsunamiError);
            }

            // Try to fetch wildfire data
            try {
                const fires = await fetchWildfires();
                if (fires && fires.length > 0) {
                    allDisasters = [...allDisasters, ...fires];
                    setDataSource(prev => prev + ", NASA FIRMS Wildfires");
                }
            } catch (fireError) {
                console.error("Error fetching wildfire data:", fireError);
            }

            // Try to fetch severe weather data
            try {
                const weather = await fetchSevereWeather();
                if (weather && weather.length > 0) {
                    allDisasters = [...allDisasters, ...weather];
                    setDataSource(prev => prev + ", NOAA Weather");
                }
            } catch (weatherError) {
                console.error("Error fetching weather data:", weatherError);
            }

            // NEW: Try to fetch flood data
            try {
                const floods = await fetchFloodData();
                if (floods && floods.length > 0) {
                    allDisasters = [...allDisasters, ...floods];
                    setDataSource(prev => prev + ", Flood Monitoring Systems");
                }
            } catch (floodError) {
                console.error("Error fetching flood data:", floodError);
            }

            if (allDisasters.length === 0) {
                throw new Error("No disaster data available from any source");
            }

            setDisasters(allDisasters);
            setLastUpdated(new Date().toLocaleString());
            setError(null);
        } catch (err) {
            console.error("Error fetching disaster data:", err);
            setError("Failed to fetch live disaster data from all sources. Please try again.");

            // Fallback to recent earthquakes if all else fails
            try {
                const fallbackResponse = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson");
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    const fallbackEarthquakes = fallbackData.features.map((feature, index) => {
                        const props = feature.properties;
                        const coordinates = feature.geometry.coordinates;

                        return {
                            id: props.ids || `eq-${index}`,
                            title: props.title || `M${props.mag} - ${props.place}`,
                            description: `Magnitude ${props.mag} earthquake at depth of ${coordinates[2]}km. ${props.place}`,
                            lat: coordinates[1],
                            lng: coordinates[0],
                            magnitude: props.mag,
                            date: new Date(props.time).toISOString(),
                            type: "earthquake",
                            url: props.url
                        };
                    });

                    setDisasters(fallbackEarthquakes);
                    setDataSource("USGS Earthquakes (Fallback)");
                    setLastUpdated(new Date().toLocaleString());
                }
            } catch (fallbackError) {
                console.error("Error fetching fallback earthquake data:", fallbackError);
                setError("Failed to fetch any disaster data. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch disaster data on component mount and every 5 minutes
    useEffect(() => {
        fetchDisasterData();
        const interval = setInterval(fetchDisasterData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Render the map and markers
    return (
        <div className="live-disaster-map" style={{ height: "100vh", width: "100%" }}>
            {mapReady && L && (
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    minZoom={2}
                    maxZoom={18}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ZoomControl position="bottomright" />

                    {disasters.map((disaster) => (
                        <CircleMarker
                            key={disaster.id}
                            center={[disaster.lat, disaster.lng]}
                            radius={getRadius(disaster.magnitude)}
                            fillOpacity={0.7}
                            color={getColor(disaster.magnitude)}
                            weight={1}
                        >
                            <Popup>
                                <h3>{disaster.title}</h3>
                                <p>{disaster.description}</p>
                                <p><strong>Date:</strong> {new Date(disaster.date).toLocaleString()}</p>
                                {disaster.url && (
                                    <p>
                                        <a href={disaster.url} target="_blank" rel="noopener noreferrer">
                                            More Info
                                        </a>
                                    </p>
                                )}
                            </Popup>
                        </CircleMarker>
                    ))}

                    <Legend />
                </MapContainer>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading disaster data...</p>
                </div>
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