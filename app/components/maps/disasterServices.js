// Collection of functions to fetch various disaster data
import { env } from 'process';

// Main function to fetch all disaster data
export async function fetchDisasterData() {
    let allDisasters = [];
    let sources = "";

    try {
        // Add 1.2-second delay before fetching data to allow auth/session to stabilize
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Fetch USGS earthquake data
        try {
            const earthquakes = await fetchUSGSEarthquakes();
            if (earthquakes && earthquakes.length > 0) {
                allDisasters = [...earthquakes];
                sources += "USGS Earthquakes";
            }
        } catch (error) {
            console.error("Failed to fetch USGS earthquake data:", error);
        }

        // Fetch NCS earthquake data (India-focused)
        try {
            const response = await fetch("/api/ncs-earthquakes");
            if (response.ok) {
                const ncsEarthquakes = await response.json();
                if (ncsEarthquakes && ncsEarthquakes.length > 0) {
                    allDisasters = [...allDisasters, ...ncsEarthquakes];
                    sources += sources ? ", NCS Earthquakes" : "NCS Earthquakes";
                }
            }
        } catch (error) {
            console.error("Failed to fetch NCS earthquake data:", error);
        }

        // Try to fetch tsunami data
        try {
            const tsunamis = await fetchTsunamiWarnings();
            if (tsunamis && tsunamis.length > 0) {
                allDisasters = [...allDisasters, ...tsunamis];
                sources += sources ? ", NOAA Tsunamis" : "NOAA Tsunamis";
            }
        } catch (error) {
            console.error("Failed to fetch tsunami data:", error);
        }

        // Try to fetch wildfire data
        try {
            const fires = await fetchWildfires();
            if (fires && fires.length > 0) {
                allDisasters = [...allDisasters, ...fires];
                sources += sources ? ", NASA FIRMS Wildfires" : "NASA FIRMS Wildfires";
            }
        } catch (error) {
            console.error("Failed to fetch wildfire data:", error);
        }

        // Try to fetch severe weather data
        try {
            const weather = await fetchSevereWeather();
            if (weather && weather.length > 0) {
                allDisasters = [...allDisasters, ...weather];
                sources += sources ? ", NOAA Weather" : "NOAA Weather";
            }
        } catch (error) {
            console.error("Failed to fetch weather data:", error);
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
        const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson");

        if (!response.ok) {
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
            lat: coordinates[1],
            lng: coordinates[0],
            magnitude: props.mag || 1,
            date: new Date(props.time).toISOString(),
            type: "earthquake",
            url: props.url,
            source: "USGS"
        };
    });
}

// Function to fetch tsunami warnings
export async function fetchTsunamiWarnings() {
    try {
        const apiProxyUrl = "/api/proxy/tsunami";

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

                let lat = 0, lng = -150;
                const point = entry.querySelector("georss\\:point")?.textContent;
                if (point) {
                    [lat, lng] = point.split(" ").map(parseFloat);
                }

                let dateObj;
                try {
                    dateObj = new Date(published);
                    if (isNaN(dateObj.getTime())) {
                        dateObj = new Date();
                    }
                } catch (dateErr) {
                    console.error("Error parsing tsunami date:", dateErr);
                    dateObj = new Date();
                }

                return {
                    id: `tsunami-${index}`,
                    title: title,
                    description: description,
                    lat: lat,
                    lng: lng,
                    magnitude: 7.5,
                    date: dateObj.toISOString(),
                    type: "tsunami",
                    source: "NOAA"
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
        const apiKey = process.env.NEXT_PUBLIC_FIRMS_API_KEY || "FIRMS_API_KEY_PLACEHOLDER";
        const apiProxyUrl = `/api/proxy/wildfires?apiKey=${apiKey}`;

        const response = await fetch(apiProxyUrl);

        if (!response.ok) {
            throw new Error(`FIRMS API Error: ${response.status}`);
        }

        const text = await response.text();
        const lines = text.split("\n").filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
            return [];
        }

        const headers = lines[0].split(",");
        const latIndex = headers.indexOf("latitude");
        const lonIndex = headers.indexOf("longitude");
        const brightIndex = headers.indexOf("bright_ti4");
        const dateIndex = headers.indexOf("acq_date");

        if (latIndex === -1 || lonIndex === -1) {
            return [];
        }

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
                    type: "fire",
                    source: "NASA FIRMS"
                };
            } catch (err) {
                console.error("Error processing fire data row:", err);
                return null;
            }
        }).filter(Boolean);

        return fireData.sort((a, b) => b.magnitude - a.magnitude);
    } catch (error) {
        console.error("Error fetching wildfire data:", error);
        return [];
    }
}

// Function to fetch severe weather data
export async function fetchSevereWeather() {
    try {
        const apiProxyUrl = "/api/proxy/weather";
        const weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "WEATHER_API_KEY_PLACEHOLDER";

        const response = await fetch(apiProxyUrl, {
            headers: {
                "Accept": "application/geo+json",
                "User-Agent": "YourApp/1.0 (youremail@example.com)",
                "X-API-Key": weatherApiKey
            }
        });

        if (!response.ok) {
            throw new Error(`NOAA API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.features || !Array.isArray(data.features)) {
            return [];
        }

        return data.features.slice(0, 100).map((feature, index) => {
            try {
                if (!feature.properties) {
                    return null;
                }

                const properties = feature.properties;
                const title = properties.headline || properties.event || "Weather Alert";
                const description = properties.description || "No description available";
                const severity = properties.severity === "Extreme" ? 5 :
                    properties.severity === "Severe" ? 4 :
                        properties.severity === "Moderate" ? 3 : 2;

                let lat, lng;
                if (feature.geometry && feature.geometry.type === "Point" && Array.isArray(feature.geometry.coordinates)) {
                    [lng, lat] = feature.geometry.coordinates;
                } else if (properties.affectedZones && Array.isArray(properties.affectedZones) && properties.affectedZones.length > 0) {
                    lat = 40;
                    lng = -100;
                } else {
                    return null;
                }

                return {
                    id: `weather-${index}`,
                    title: title,
                    description: description.substring(0, 300) + (description.length > 300 ? "..." : ""),
                    lat: lat,
                    lng: lng,
                    magnitude: severity,
                    date: properties.sent || properties.effective || new Date().toISOString(),
                    type: "weather",
                    source: "NOAA"
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