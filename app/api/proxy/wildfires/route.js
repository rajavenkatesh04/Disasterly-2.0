import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get('apiKey') || process.env.FIRMS_API_KEY;

        if (!apiKey || apiKey === 'FIRMS_API_KEY_PLACEHOLDER') {
            return NextResponse.json(
                { error: 'FIRMS API key not provided' },
                { status: 400 }
            );
        }

        // NASA FIRMS API - Last 24 hours of VIIRS data
        const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/world/1`;

        const response = await fetch(firmsUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch wildfire data: ${response.status}` },
                { status: response.status }
            );
        }

        // Just pass through the CSV data
        const csvText = await response.text();

        return new NextResponse(csvText, {
            headers: {
                'Content-Type': 'text/csv'
            }
        });
    } catch (error) {
        console.error('Wildfire proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error fetching wildfire data' },
            { status: 500 }
        );
    }
}