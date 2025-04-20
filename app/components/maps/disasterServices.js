// Collection of functions to fetch various disaster data
import { env } from 'process';

// Main function to fetch all disaster data
export async function fetchDisasterData() {
    let allDisasters = [];
    let sources = "USGS Earthquakes";

    try {
        // Fetch earthquake data (most reliable)
        const earthquakes = await fetchUSGSEarthquakes();
        allDisasters = [...earthquakes];

        // Try to fetch tsunami data
        try {
            const tsunamis = await fetchTsunamiWarnings();
            if (tsunamis && tsunamis.length > 0) {
                allDisasters = [...allDisasters, ...tsunamis];
                sources += ", NOAA Tsunamis";
            }
        } catch (error) {
            console.error("Failed to fetch tsunami data:", error);
        }

        // Try to fetch wildfire data
        try {
            const fires = await fetchWildfires();
            if (fires && fires.length > 0) {
                allDisasters = [...allDisasters, ...fires];
                sources += ", NASA FIRMS Wildfires";
            }
        } catch (error) {
            console.error("Failed to fetch wildfire data:", error);
        }

        // Try to fetch severe weather data
        try {
            const weather = await fetchSevereWeather();
            if (weather && weather.length > 0) {
                allDisasters = [...allDisasters, ...weather];
                sources += ", NOAA Weather";
            }
        } catch (error) {
            console.error("Failed to fetch weather data:", error);
        }

        // Try to fetch flood data - no API key needed
        try {
            const floods = await fetchFloodData();
            if (floods && floods.length > 0) {
                allDisasters = [...allDisasters, ...floods];
                sources += ", USGS Water Services";
            }
        } catch (error) {
            console.error("Failed to fetch flood data:", error);
        }

        return {
            data: allDisasters,
            sources: sources,
            timestamp: new Date().toLocaleString()
        };
    } catch (error) {
        console.error("Error in fetchDisasterData:", error);
        throw new Error("Failed to fetch disaster data");
    }
}

// Function to fetch earthquake data from USGS
export async function fetchUSGSEarthquakes() {
    try {
        // First try hourly data
        const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson");

        if (!response.ok) {
            // If hourly fails, try daily data
            const dailyResponse = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
            if (!dailyResponse.ok) {
                throw new Error(`USGS API Error: ${dailyResponse.status}`);
            }
            const data = await dailyResponse.json();
            return processEarthquakeData(data);
        }

        const data = await response.json();
        return processEarthquakeData(data);
    } catch (error) {
        console.error("Error fetching USGS earthquake data:", error);
        // Try fallback to significant earthquakes from the past 7 days
        const fallbackResponse = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson");
        if (!fallbackResponse.ok) {
            throw new Error("Failed to fetch earthquake data from all sources");
        }
        const fallbackData = await fallbackResponse.json();
        return processEarthquakeData(fallbackData);
    }
}

// Process earthquake data
function processEarthquakeData(data) {
    if (!data || !data.features || !Array.isArray(data.features)) {
        return [];
    }

    return data.features.map((feature, index) => {
        const props = feature.properties;
        const coordinates = feature.geometry.coordinates;

        return {
            id: feature.id || `eq-${index}`,
            title: props.title || `M${props.mag} - ${props.place}`,
            description: `Magnitude ${props.mag} earthquake at depth of ${coordinates[2]}km. ${props.place}`,
            lat: coordinates[1],  // Latitude is second in GeoJSON
            lng: coordinates[0],  // Longitude is first in GeoJSON
            magnitude: props.mag || 1, // Actual earthquake magnitude
            date: new Date(props.time).toISOString(),
            type: "earthquake",
            url: props.url
        };
    });
}

// Function to fetch tsunami warnings - FIXED VERSION
export async function fetchTsunamiWarnings() {
    try {
        // Using server proxy instead of direct CORS
        const apiProxyUrl = "/api/proxy/tsunami";  // Create this endpoint on your server

        const response = await fetch(apiProxyUrl);

        if (!response.ok) {
            throw new Error(`Tsunami API Error: ${response.status}`);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const entries = xmlDoc.querySelectorAll("entry");

        if (!entries || entries.length === 0) {
            return [];
        }

        return Array.from(entries).map((entry, index) => {
            try {
                const title = entry.querySelector("title")?.textContent || "Tsunami Warning";
                const description = entry.querySelector("summary")?.textContent || "";
                const published = entry.querySelector("published")?.textContent || "";

                // Extract coordinates from geo:point if available
                let lat = 0, lng = -150; // Default coordinates (Pacific Ocean)

                const point = entry.querySelector("georss\\:point")?.textContent;
                if (point) {
                    [lat, lng] = point.split(" ").map(parseFloat);
                }

                // Safely parse the date
                let dateObj;
                try {
                    dateObj = new Date(published);
                    // Verify it's a valid date before converting to ISO string
                    if (isNaN(dateObj.getTime())) {
                        dateObj = new Date(); // Use current date as fallback if invalid
                    }
                } catch (dateErr) {
                    console.error("Error parsing tsunami date:", dateErr);
                    dateObj = new Date(); // Use current date as fallback
                }

                return {
                    id: `tsunami-${index}`,
                    title: title,
                    description: description,
                    lat: lat,
                    lng: lng,
                    magnitude: 7.5, // Treating tsunamis as high severity
                    date: dateObj.toISOString(),
                    type: "tsunami"
                };
            } catch (err) {
                console.error("Error processing tsunami warning entry:", err);
                return null;
            }
        }).filter(Boolean);
    } catch (error) {
        console.error("Error fetching tsunami warnings:", error);
        return [];
    }
}

// Function to fetch wildfire data
export async function fetchWildfires() {
    try {
        // Get API key from environment variables
        const apiKey = process.env.NEXT_PUBLIC_FIRMS_API_KEY || "FIRMS_API_KEY_PLACEHOLDER";

        // Using server proxy instead of direct CORS
        const apiProxyUrl = `/api/proxy/wildfires?apiKey=${apiKey}`;  // Create this endpoint on your server

        const response = await fetch(apiProxyUrl);

        if (!response.ok) {
            throw new Error(`FIRMS API Error: ${response.status}`);
        }

        const text = await response.text();

        // Parse CSV data
        const lines = text.split("\n").filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
            return []; // Only header or empty
        }

        const headers = lines[0].split(",");

        // Find indices for important columns
        const latIndex = headers.indexOf("latitude");
        const lonIndex = headers.indexOf("longitude");
        const brightIndex = headers.indexOf("bright_ti4");
        const dateIndex = headers.indexOf("acq_date");

        if (latIndex === -1 || lonIndex === -1) {
            return []; // Required columns not found
        }

        // Parse data rows (limit to 100 to avoid overwhelming the map)
        const fireData = lines.slice(1, 101).map((line, index) => {
            try {
                const values = line.split(",");

                if (values.length <= Math.max(latIndex, lonIndex)) {
                    return null;
                }

                const lat = parseFloat(values[latIndex]);
                const lng = parseFloat(values[lonIndex]);

                if (isNaN(lat) || isNaN(lng)) {
                    return null;
                }

                // Brightness temperature indicates fire intensity
                const brightness = brightIndex !== -1 ? parseFloat(values[brightIndex]) : 300;
                const severity = Math.min(Math.max(brightness / 100, 2), 5);

                const date = dateIndex !== -1 ? values[dateIndex] : new Date().toISOString().split('T')[0];

                return {
                    id: `fire-${index}`,
                    title: `Active Fire - Brightness: ${brightness.toFixed(1)}K`,
                    description: `Active fire detected by VIIRS satellite with brightness temperature of ${brightness.toFixed(1)}K`,
                    lat: lat,
                    lng: lng,
                    magnitude: severity,
                    date: date,
                    type: "fire"
                };
            } catch (err) {
                console.error("Error processing fire data row:", err);
                return null;
            }
        }).filter(Boolean);

        // Sort by severity and return
        return fireData.sort((a, b) => b.magnitude - a.magnitude);
    } catch (error) {
        console.error("Error fetching wildfire data:", error);
        return [];
    }
}

// Function to fetch severe weather data
export async function fetchSevereWeather() {
    try {
        // Using server proxy instead of direct CORS
        const apiProxyUrl = "/api/proxy/weather";  // Create this endpoint on your server
        const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "WEATHER_API_KEY_PLACEHOLDER";

        const response = await fetch(apiProxyUrl, {
            headers: {
                "Accept": "application/geo+json",
                "User-Agent": "YourApp/1.0 (youremail@example.com)", // NOAA requires a user agent
                "X-API-Key": weatherApiKey // If your API requires a key in header
            }
        });

        if (!response.ok) {
            throw new Error(`NOAA API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || !Array.isArray(data.features)) {
            return [];
        }

        // Limit to 100 alerts and process
        return data.features.slice(0, 100).map((feature, index) => {
            try {
                if (!feature.properties) {
                    return null;
                }

                const properties = feature.properties;
                const title = properties.headline || properties.event || "Weather Alert";
                const description = properties.description || "No description available";

                // Map severity to our scale
                const severity = properties.severity === "Extreme" ? 5 :
                    properties.severity === "Severe" ? 4 :
                        properties.severity === "Moderate" ? 3 : 2;

                // Extract coordinates from geometry or properties
                let lat, lng;

                if (feature.geometry && feature.geometry.type === "Point" &&
                    Array.isArray(feature.geometry.coordinates)) {
                    [lng, lat] = feature.geometry.coordinates;
                } else if (properties.affectedZones && Array.isArray(properties.affectedZones) &&
                    properties.affectedZones.length > 0) {
                    // Simplified approach - use first zone
                    lat = 40; // Default to US center
                    lng = -100;
                } else {
                    return null; // Skip if no location data
                }

                return {
                    id: `weather-${index}`,
                    title: title,
                    description: description.substring(0, 300) + (description.length > 300 ? "..." : ""),
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
        console.error("Error fetching severe weather data:", error);
        return [];
    }
}

// Function to fetch flood data
export async function fetchFloodData() {
    try {
        // Using USGS Water Services API - no API key needed
        const apiProxyUrl = "/api/proxy/floods";

        const response = await fetch(apiProxyUrl);

        if (!response.ok) {
            throw new Error(`Flood API Error: ${response.status}`);
        }

        const data = await response.json();

        // Data is already processed by our API route
        return data.map((site, index) => {
            return {
                id: `flood-${index}`,
                title: `Flood Risk - ${site.name || site.siteCode}`,
                description: `Water level: ${site.waterLevel}ft (${site.status}). Site: ${site.name}, ${site.state}`,
                lat: site.latitude,
                lng: site.longitude,
                magnitude: site.floodSeverity || 3,
                date: site.dateTime || new Date().toISOString(),
                type: "flood"
            };
        });
    } catch (error) {
        console.error("Error fetching flood data:", error);
        return [];
    }
}