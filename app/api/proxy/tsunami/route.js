import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // NOAA Tsunami Warning Feed
        const tsunamiUrl = 'https://www.tsunami.gov/events/xml/PAAQAtom.xml';

        const response = await fetch(tsunamiUrl, {
            headers: {
                'User-Agent': process.env.NEXT_PUBLIC_APP_USER_AGENT || 'DisasterTracker/1.0',
                'Accept': 'application/xml'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch tsunami data: ${response.status}` },
                { status: response.status }
            );
        }

        // Just pass through the XML data
        const xmlText = await response.text();

        return new NextResponse(xmlText, {
            headers: {
                'Content-Type': 'application/xml'
            }
        });
    } catch (error) {
        console.error('Tsunami proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error fetching tsunami data' },
            { status: 500 }
        );
    }
}