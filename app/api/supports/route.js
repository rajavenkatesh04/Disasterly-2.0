import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

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
            const collection = db.collection('support_requests');

            let supports;
            if (all) {
                supports = await collection.find().toArray();
            } else if (userId) {
                supports = await collection.find({ raisedBy: userId }).toArray();
            } else {
                return NextResponse.json({ success: false, message: 'User ID or all flag is required' }, { status: 400 });
            }

            return NextResponse.json(supports);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching supports:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch supports' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        const { requestId, status, assignee } = await request.json();
        if (!requestId) {
            return NextResponse.json({ success: false, message: 'requestId is required' }, { status: 400 });
        }

        const updateFields = { updatedAt: new Date() };
        if (status) {
            updateFields.status = status;
        }
        if (assignee !== undefined) {
            updateFields.assignee = assignee || null; // Allow clearing assignee
        }

        if (Object.keys(updateFields).length === 1) { // Only updatedAt
            return NextResponse.json({ success: false, message: 'No valid fields to update' }, { status: 400 });
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            const db = client.db('disaster-relief-db');
            const collection = db.collection('support_requests');

            const result = await collection.updateOne(
                { requestId },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: 'Support request updated successfully' });
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error updating support request:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update support request' },
            { status: 500 }
        );
    }
}
