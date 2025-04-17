import { MongoClient } from 'mongodb';

export async function GET(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';
        const role = searchParams.get('role'); // Get the role parameter

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('users');

            let users;
            if (all) {
                users = await collection.find().toArray(); // Fetch all users
            } else if (role) {
                users = await collection.find({ role: role }).toArray(); // Filter by role
            } else {
                return Response.json({ success: false, message: 'Either all=true or role parameter is required' }, { status: 400 });
            }

            return Response.json(users);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json(
            { success: false, message: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { userId, status } = await request.json();
        if (!userId || !status) {
            return Response.json({ success: false, message: 'userId and status are required' }, { status: 400 });
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('users');

            const result = await collection.updateOne(
                { userId },
                { $set: { status, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return Response.json({ success: false, message: 'User not found' }, { status: 404 });
            }

            return Response.json({ success: true, message: 'Status updated successfully' });
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        return Response.json(
            { success: false, message: 'Failed to update status' },
            { status: 500 }
        );
    }
}