import { MongoClient } from 'mongodb';

export async function GET(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const all = searchParams.get('all') === 'true';

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('donations');

            let donations;
            if (all) {
                donations = await collection.find().toArray();
            } else if (userId) {
                donations = await collection.find({ raisedBy: userId }).toArray();
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

export async function PATCH(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { receiptId, status } = await request.json();
        if (!receiptId || !status) {
            return Response.json({ success: false, message: 'receiptId and status are required' }, { status: 400 });
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('donations');

            const result = await collection.updateOne(
                { receiptId },
                { $set: { status, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return Response.json({ success: false, message: 'Donation not found' }, { status: 404 });
            }

            return Response.json({ success: true, message: 'Status updated successfully' });
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error updating donation status:', error);
        return Response.json(
            { success: false, message: 'Failed to update status' },
            { status: 500 }
        );
    }
}