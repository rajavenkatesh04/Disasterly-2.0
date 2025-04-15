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
            const collection = db.collection('emergencies');

            // Note: Filter emergencies by email (assumes email field exists)
            // If email field is missing, update schema to include it
            const emergencies = await collection.find({ email }).toArray();

            return Response.json(emergencies);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching emergencies:', error);
        return Response.json(
            { success: false, message: 'Failed to fetch emergencies' },
            { status: 500 }
        );
    }
}