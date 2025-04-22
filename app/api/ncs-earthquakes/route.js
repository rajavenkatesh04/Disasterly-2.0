import { NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio'; // Use named import for 'load'

export async function GET() {
    try {
        // Fetch the HTML from the website
        const url = 'https://riseq.seismo.gov.in/riseq/earthquake';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        // Parse the HTML and extract earthquake data
        const earthquakes = await parseNCSEarthquakeDataFromHTML(response.data);

        // Return as JSON
        return NextResponse.json(earthquakes);
    } catch (error) {
        console.error("Error fetching NCS earthquake data:", error);
        return NextResponse.json(
            { error: "Failed to retrieve earthquake data" },
            { status: 500 }
        );
    }
}

async function parseNCSEarthquakeDataFromHTML(html) {
    const $ = load(html); // Use 'load' directly
    const earthquakes = [];

    // Select the table rows (excluding the header)
    $('table.table tbody tr').each((i, row) => {
        const columns = $(row).find('td').map((_, col) => $(col).text().trim()).get();

        // Ensure we have enough columns (Magnitude, Origin Time, Lat, Long, Depth, Region, Location, Type, Felt)
        if (columns.length < 9) return;

        try {
            // Extract data from columns based on the correct table structure
            const magnitude = parseFloat(columns[0]) || 0;
            const originTime = columns[1]; // Format: "YYYY-MM-DD HH:mm:ss"
            const lat = parseFloat(columns[2]);
            const lng = parseFloat(columns[3]);
            const depth = parseFloat(columns[4]);
            const region = columns[5];
            const location = columns[6]; // Optional: Including for completeness
            const type = columns[7];     // Optional: Including for completeness

            // Validate date format
            const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            if (!dateTimeRegex.test(originTime)) {
                console.warn(`Invalid date format for originTime: ${originTime}`);
                return;
            }

            // Split originTime into date and time
            const [dateStr, timeStr] = originTime.split(' ');
            const dateTimeStr = `${dateStr}T${timeStr}`;

            // Skip invalid data
            if (isNaN(lat) || isNaN(lng) || magnitude <= 0) return;

            // Parse the date
            let date;
            try {
                date = new Date(`${dateTimeStr}Z`).toISOString();
            } catch (error) {
                console.error(`Failed to parse date from ${dateTimeStr}:`, error);
                return;
            }

            earthquakes.push({
                id: `ncs-eq-${i}`,
                title: `M${magnitude.toFixed(1)} - ${region}`,
                description: `Magnitude ${magnitude.toFixed(1)} earthquake at depth of ${depth}km. ${region}. Location: ${location}. Type: ${type}`,
                lat: lat,
                lng: lng,
                magnitude: magnitude,
                date: date,
                depth: depth,
                type: "earthquake",
                source: "NCS"
            });
        } catch (error) {
            console.error("Error parsing row:", columns, error);
        }
    });

    return earthquakes;
}