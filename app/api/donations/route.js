import { MongoClient } from 'mongodb';

export async function GET(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email'); // Get email from query

        if (!email) {
            return Response.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('donations');

            // Note: Filter donations by email (already present in donation data)
            const donations = await collection.find({ email }).toArray();

            return Response.json(donations);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching donations:', error);
        return Response.json(
            { success: false, message: 'Failed to fetch donations' },
            { status: 500 }
        );
    }
}