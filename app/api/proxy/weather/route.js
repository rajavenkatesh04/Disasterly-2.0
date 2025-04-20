import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // NOAA Weather API URL
        const weatherUrl = 'https://api.weather.gov/alerts/active?status=actual&message_type=alert';

        const response = await fetch(weatherUrl, {
            headers: {
                'User-Agent': process.env.NEXT_PUBLIC_APP_USER_AGENT || 'DisasterTracker/1.0',
                'Accept': 'application/geo+json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch weather data: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Weather proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error fetching weather data' },
            { status: 500 }
        );
    }
}