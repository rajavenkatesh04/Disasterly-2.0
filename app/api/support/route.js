import { MongoClient } from 'mongodb';
import { getToken } from 'next-auth/jwt'; // Import getToken for JWT decoding

export async function POST(request) {
    try {
        const formData = await request.json();
        console.log("Received support request:", formData);

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable not configured');
        }

        // Get the token from the request (assumes next-auth JWT is in cookies)
        const token = await getToken({ req: request });
        if (!token || !token.userId) {
            throw new Error('Unauthorized or user ID not found in token');
        }

        const client = new MongoClient(process.env.MONGODB_URI);

        try {
            await client.connect();
            console.log("Connected to MongoDB");

            const db = client.db("disaster-relief-db");
            const collection = db.collection('support_requests');

            // Calculate response time based on urgency
            let responseTimeMs;
            switch (formData.urgency) {
                case 'critical':
                    responseTimeMs = 2 * 60 * 60 * 1000; // 2 hours
                    break;
                case 'urgent':
                    responseTimeMs = 12 * 60 * 60 * 1000; // 12 hours
                    break;
                case 'important':
                    responseTimeMs = 24 * 60 * 60 * 1000; // 24 hours
                    break;
                case 'planning':
                    responseTimeMs = 48 * 60 * 60 * 1000; // 48 hours
                    break;
                default:
                    responseTimeMs = 24 * 60 * 60 * 1000; // Default 24 hours
            }

            // Generate formatted requestId
            const result = await collection.insertOne({}); // Insert a temporary document to get an ID
            const requestId = `SUPPORT-${result.insertedId.toString().slice(-8).toUpperCase()}`;

            // Add timestamp, status, requestId, raisedBy, and response time to document
            const completeData = {
                ...formData,
                type: 'support',
                status: 'pending',
                requestId,
                raisedBy: token.userId, // Use userId from token
                createdAt: new Date(),
                updatedAt: new Date(),
                expectedResponseTime: new Date(Date.now() + responseTimeMs)
            };

            // Update the document with complete data
            await collection.updateOne(
                { _id: result.insertedId },
                { $set: completeData }
            );

            console.log("Insert successful, ID:", result.insertedId);

            return Response.json({
                success: true,
                requestId,
                mongoId: result.insertedId.toString(),
                expectedResponseTime: completeData.expectedResponseTime
            });

        } finally {
            await client.close();
        }

    } catch (error) {
        console.error("Database error:", error);
        return Response.json(
            {
                success: false,
                message: error.message || 'Failed to save support request'
            },
            { status: 500 }
        );
    }
}