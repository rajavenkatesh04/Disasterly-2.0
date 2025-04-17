import { MongoClient } from 'mongodb';

export async function GET(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('volunteers');

            let volunteers;
            if (all) {
                volunteers = await collection.find().toArray();
            } else {
                return Response.json({ success: false, message: 'All flag is required for volunteers' }, { status: 400 });
            }

            return Response.json(volunteers);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        return Response.json(
            { success: false, message: 'Failed to fetch volunteers' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { requestId, status } = await request.json();
        if (!requestId || !status) {
            return Response.json({ success: false, message: 'requestId and status are required' }, { status: 400 });
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('volunteers');

            const result = await collection.updateOne(
                { requestId },
                { $set: { status, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return Response.json({ success: false, message: 'Volunteer not found' }, { status: 404 });
            }

            return Response.json({ success: true, message: 'Status updated successfully' });
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error updating volunteer status:', error);
        return Response.json(
            { success: false, message: 'Failed to update status' },
            { status: 500 }
        );
    }
}