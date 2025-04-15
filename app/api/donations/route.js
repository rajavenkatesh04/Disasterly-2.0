import { MongoClient } from 'mongodb';

export async function GET(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const all = searchParams.get('all') === 'true'; // Check for all flag

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('donations');

            let donations;
            if (all) {
                donations = await collection.find().toArray(); // Fetch all records
            } else if (userId) {
                donations = await collection.find({ raisedBy: userId }).toArray(); // Fetch by userId
            } else {
                return Response.json({ success: false, message: 'User ID or all flag is required' }, { status: 400 });
            }

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