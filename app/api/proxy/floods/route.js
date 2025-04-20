import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // USGS Water Services API - no API key needed
        // This URL requests water level data (parameter code 00065) from active sites
        // Using specific states with known flood issues to limit data
        const floodUrl = 'https://waterservices.usgs.gov/nwis/iv/?format=json&parameterCd=00065&siteStatus=active&stateCd=CA,OR,WA,TX,FL,LA&period=P1D';

        const response = await fetch(floodUrl, {
            headers: {
                'User-Agent': 'DisasterTracker/1.0 (contact@example.com)'
            },
            cache: 'no-store' // Disable caching to get fresh data each time
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch flood data: ${response.status}` },
                { status: response.status }
            );
        }

        // Process the raw USGS data
        const rawData = await response.json();

        // Transform the data to a simpler format
        let processedData = [];

        if (rawData && rawData.value && rawData.value.timeSeries) {
            processedData = rawData.value.timeSeries
                .filter(series => {
                    // Filter for sites that have actual values
                    return series.values &&
                        series.values[0] &&
                        series.values[0].value &&
                        series.values[0].value.length > 0;
                })
                .map((series, index) => {
                    // Extract site info
                    const siteCode = series.sourceInfo?.siteCode?.[0]?.value || `unknown-${index}`;
                    const siteName = series.sourceInfo?.siteName || 'Unknown Location';
                    const latitude = parseFloat(series.sourceInfo?.geoLocation?.geogLocation?.latitude) || 0;
                    const longitude = parseFloat(series.sourceInfo?.geoLocation?.geogLocation?.longitude) || 0;

                    // Find state property if available
                    let state = 'Unknown';
                    if (series.sourceInfo?.siteProperty) {
                        const stateProp = series.sourceInfo.siteProperty.find(p => p.name === 'stateCd');
                        if (stateProp) {
                            state = stateProp.value;
                        }
                    }

                    // Get the latest reading
                    const values = series.values[0].value;
                    const latestReading = values[values.length - 1];
                    const waterLevel = parseFloat(latestReading.value) || 0;

                    // Parse date safely
                    let dateTime;
                    try {
                        dateTime = new Date(latestReading.dateTime).toISOString();
                    } catch (dateErr) {
                        console.error('Error parsing flood date:', dateErr);
                        dateTime = new Date().toISOString(); // Use current date as fallback
                    }

                    // Determine flood severity based on water level
                    // This is a simplified approach - real flood determination would need flood stage data
                    // which varies by location
                    let floodSeverity = 1;
                    let status = "Normal";

                    // Some basic logic to assign severity - this should be customized based on actual flood stages
                    if (waterLevel > 20) {
                        floodSeverity = 5;
                        status = "Major Flooding";
                    } else if (waterLevel > 15) {
                        floodSeverity = 4;
                        status = "Moderate Flooding";
                    } else if (waterLevel > 10) {
                        floodSeverity = 3;
                        status = "Minor Flooding";
                    } else if (waterLevel > 7) {
                        floodSeverity = 2;
                        status = "Near Flood Stage";
                    }

                    return {
                        siteCode,
                        name: siteName,
                        waterLevel,
                        latitude,
                        longitude,
                        state,
                        status,
                        floodSeverity,
                        dateTime
                    };
                })
                // Limit results to avoid overwhelming the frontend
                .slice(0, 100);
        }

        return NextResponse.json(processedData);
    } catch (error) {
        console.error('Flood proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error fetching flood data' },
            { status: 500 }
        );
    }
}